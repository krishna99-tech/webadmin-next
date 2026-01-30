'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import config from '@/config';

/**
 * Custom hook for WebSocket connection
 * Provides real-time updates for devices, notifications, and telemetry
 */
export default function useWebSocket() {
    const { token } = useContext(AuthContext);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const listenersRef = useRef(new Map());

    // Convert HTTP URL to WebSocket URL
    const getWebSocketUrl = useCallback(() => {
        const wsProtocol = config.API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
        const baseUrl = config.API_BASE_URL.replace(/^https?:\/\//, '');
        return `${wsProtocol}://${baseUrl}/ws?token=${token}`;
    }, [token]);

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
        if (!token) return;

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

            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
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
                    connect();
                }, 3000);
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
        }
    }, [token, getWebSocketUrl]);

    // Disconnect from WebSocket
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    // Connect on mount, disconnect on unmount
    useEffect(() => {
        if (token) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [token, connect, disconnect]);

    return {
        isConnected,
        lastMessage,
        subscribe,
        send,
        connect,
        disconnect
    };
}
