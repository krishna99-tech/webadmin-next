"use client";

import React, { useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, Search, Info, AlertTriangle, Plus, Server, Users, Wifi, WifiOff, ChevronDown } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import adminService from '@/services/adminService';
import useWebSocket from '@/hooks/useWebSocket';

const BREADCRUMB_LABELS = {
  '': 'Overview',
  devices: 'Devices',
  users: 'Users',
  broadcast: 'Broadcast',
  webhooks: 'Webhooks',
  'security-rules': 'Security Rules',
  activity: 'Audit Logs',
  analytics: 'Analytics',
  settings: 'Settings',
};

const TopBar = () => {
  const { currentUser } = useContext(AuthContext);
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [apiStatus, setApiStatus] = useState('checking');

  const { isConnected: wsConnected } = useWebSocket();

  const isAdmin = currentUser?.is_admin ?? currentUser?.role === 'Admin';

  useEffect(() => {
    const fetchNotifs = async () => {
      if (isAdmin) {
        try {
          const data = await adminService.getNotifications();
          const list = Array.isArray(data) ? data : [];
          setNotifications(list);
          setUnreadCount(list.filter(n => !n.read).length);
        } catch {
          setNotifications([]);
        }
      }
    };
    fetchNotifs();
  }, [isAdmin]);

  useEffect(() => {
    const checkApi = async () => {
      try {
        await adminService.getNotifications();
        setApiStatus('ok');
      } catch {
        try {
          await adminService.getActivity();
          setApiStatus('ok');
        } catch {
          setApiStatus('error');
        }
      }
    };
    if (isAdmin) checkApi();
    else setApiStatus('ok');
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowQuickActions(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathSegments.length > 0
    ? pathSegments.map(seg => BREADCRUMB_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1))
    : ['Overview'];

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <header className="topbar admin-topbar">
      {/* Left: Breadcrumb + System Status */}
      <div className="topbar-left flex items-center gap-6">
        <div className="topbar-breadcrumb flex items-center gap-2">
          <span className="text-dim text-xs uppercase tracking-wider">Admin</span>
          <span className="text-white/30">/</span>
          {breadcrumbItems.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-white/30">/</span>}
              <strong className="text-white font-semibold tracking-wide">
                {item}
              </strong>
            </span>
          ))}
        </div>

        {/* System Status Pills */}
        <div className="hidden md:flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
              apiStatus === 'ok'
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : apiStatus === 'error'
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : 'bg-white/5 text-dim border-white/10'
            }`}
          >
            {apiStatus === 'ok' ? (
              <Server size={12} className="flex-shrink-0" />
            ) : apiStatus === 'error' ? (
              <AlertTriangle size={12} className="flex-shrink-0" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-dim animate-pulse" />
            )}
            API
          </span>
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
              wsConnected ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            {wsConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {wsConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="topbar-right">
        {/* Quick Actions (Admin) */}
        {isAdmin && (
          <div className="relative">
            <button
              className={`topbar-icon-btn flex items-center gap-2 ${showQuickActions ? 'bg-blue-500/20 text-blue-400' : ''}`}
              onClick={() => setShowQuickActions(!showQuickActions)}
              aria-expanded={showQuickActions}
            >
              <Plus size={18} />
              <span className="text-xs font-semibold hidden sm:inline">Quick</span>
              <ChevronDown size={14} className={`transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
            </button>
            {showQuickActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowQuickActions(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden animate-fadeIn py-2">
                  <Link
                    href="/devices"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                    onClick={() => setShowQuickActions(false)}
                  >
                    <Server size={16} className="text-blue-400" />
                    <span className="text-sm">Add Device</span>
                  </Link>
                  <Link
                    href="/users"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                    onClick={() => setShowQuickActions(false)}
                  >
                    <Users size={16} className="text-purple-400" />
                    <span className="text-sm">Add User</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* Search */}
        <div className="topbar-search">
          <Search size={16} className="opacity-40" />
          <input
            type="text"
            placeholder="Search..."
            className="text-xs bg-transparent border-none outline-none w-32 lg:w-40"
            aria-label="Search"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className={`topbar-icon-btn ${showNotifications ? 'bg-white/10' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount})` : ''}`}
          >
            <Bell size={20} className={unreadCount > 0 ? 'text-blue-400' : ''} />
            {unreadCount > 0 && <span className="topbar-notification-dot" />}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
              <div
                className="absolute right-0 mt-2 w-80 max-h-[400px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden animate-fadeIn flex flex-col"
                role="dialog"
                aria-label="Notifications"
              >
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-widest">Alerts</h4>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-blue-400 hover:underline">
                      Mark read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto max-h-[300px]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell size={24} className="mx-auto mb-2 text-dim opacity-20" />
                      <p className="text-xs text-dim">No alerts</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors relative ${!n.read ? 'bg-blue-500/5' : ''}`}
                      >
                        {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
                        <div className="flex gap-3 pl-2">
                          <div className={`p-2 rounded-lg shrink-0 ${n.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {n.type === 'error' ? <AlertTriangle size={14} /> : <Info size={14} />}
                          </div>
                          <div>
                            <p className={`text-xs ${!n.read ? 'text-white font-medium' : 'text-dim'}`}>{n.message}</p>
                            <p className="text-[10px] text-gray-500 mt-1">
                              {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link
                  href="/activity"
                  className="p-3 text-center bg-white/5 border-t border-white/5 text-[10px] text-dim hover:text-white transition-colors"
                  onClick={() => setShowNotifications(false)}
                >
                  View Activity Log
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="topbar-divider" />

        {/* User */}
        <div className="topbar-user">
          <div className="topbar-user-info text-right">
            <div className="topbar-user-name">
              {currentUser?.full_name || currentUser?.username || 'Admin'}
            </div>
            <div className="text-[9px] text-dim uppercase">
              {isAdmin ? 'Administrator' : currentUser?.role || 'User'}
            </div>
          </div>
          <div className="topbar-avatar">
            {currentUser?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
