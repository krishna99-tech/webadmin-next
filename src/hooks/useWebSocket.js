import { useEffect, useRef, useState, useCallback } from 'react';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import config from '@/config';

/**
 * Custom hook for WebSocket connection
 * Provides real-time updates for devices, notifications, and telemetry
 */
export default function useWebSocket() {
    const auth = useContext(AuthContext);
    const wsToken = auth?.token ?? (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const listenersRef = useRef(new Map());
    const connectRef = useRef(null);

    // Convert HTTP URL to WebSocket URL
    const getWebSocketUrl = useCallback(() => {
        const wsProtocol = config.API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
        const baseUrl = config.API_BASE_URL.replace(/^https?:\/\//, '');
        return `${wsProtocol}://${baseUrl}/ws?token=${wsToken}`;
    }, [wsToken]);

    // Subscribe to specific event types
    const subscribe = useCallback((eventType, callback) => {
        if (!listenersRef.current.has(eventType)) {
            listenersRef.current.set(eventType, []);
        }
        listenersRef.current.get(eventType).push(callback);

        // Return unsubscribe function
        return () => {
            const listeners = listenersRef.current.get(eventType);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }, []);

    // Send message to WebSocket
    const send = useCallback((data) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        }
    }, []);

    // Connect to WebSocket
    const connect = useCallback(() => {
        if (!wsToken) return;

        // Prevent multiple connections if already connected or connecting
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
            return;
        }

        try {
            const wsUrl = getWebSocketUrl();
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('✅ WebSocket connected');
                setIsConnected(true);

                // Send ping every 25 seconds to keep connection alive
                const pingInterval = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }));
                    }
                }, 25000);

                ws.pingInterval = pingInterval;
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastMessage(data);

                    // Notify subscribers
                    const eventType = data.type;
                    const listeners = listenersRef.current.get(eventType);
                    if (listeners) {
                        listeners.forEach(callback => callback(data));
                    }

                    // Also notify wildcard listeners
                    const wildcardListeners = listenersRef.current.get('*');
                    if (wildcardListeners) {
                        wildcardListeners.forEach(callback => callback(data));
                    }
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            ws.onerror = () => {
                console.error('❌ WebSocket connection error');
            };

            ws.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                setIsConnected(false);

                // Clear ping interval
                if (ws.pingInterval) {
                    clearInterval(ws.pingInterval);
                }

                // Attempt to reconnect after 3 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('🔄 Attempting to reconnect...');
                    if (connectRef.current) {
                        connectRef.current();
                    }
                }, 3000);
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
        }
    }, [wsToken, getWebSocketUrl]);

    // Keep connect reference updated to avoid circular dependencies
    useEffect(() => {
        connectRef.current = connect;
    }, [connect]);

    // Disconnect from WebSocket
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (wsRef.current) {
            // Clear ping interval if it exists
            if (wsRef.current.pingInterval) {
                clearInterval(wsRef.current.pingInterval);
            }

            // Remove listeners to prevent reconnect logic from firing on intentional disconnect
            const ws = wsRef.current;
            ws.onclose = null;
            ws.onerror = null;
            ws.onmessage = null;

            // Graceful shutdown to avoid "WebSocket is closed before the connection is established"
            if (ws.readyState === WebSocket.CONNECTING) {
                ws.onopen = () => ws.close();
            } else {
                ws.close();
            }
            wsRef.current = null;
        }
        setIsConnected(false);
    }, []);

    // Connect on mount, disconnect on unmount
    useEffect(() => {
        if (wsToken) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [wsToken, connect, disconnect]);

    return {
        isConnected,
        connected: isConnected,
        lastMessage,
        subscribe,
        send,
        connect,
        disconnect
    };
}
