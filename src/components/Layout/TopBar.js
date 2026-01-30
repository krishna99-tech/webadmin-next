"use client";

import React, { useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, Search, X, Check, Info, AlertTriangle } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import adminService from '@/services/adminService';
import useWebSocket from '@/hooks/useWebSocket';

const TopBar = () => {
  const { currentUser } = useContext(AuthContext);
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { lastMessage } = useWebSocket();

  /* Fetch initial notifications */
  useEffect(() => {
    const fetchNotifs = async () => {
      if (currentUser?.is_admin) {
        const data = await adminService.getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    };
    fetchNotifs();
  }, [currentUser]);

  /* Handle incoming real-time notifications via WebSocket */
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'notification') {
      const newNotif = {
        id: Date.now(),
        message: lastMessage.message || 'New system event detected',
        time: new Date().toISOString(),
        read: false,
        type: lastMessage.level || 'info'
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 15));
      setUnreadCount(prev => prev + 1);
    }
  }, [lastMessage]);

  /* Breadcrumb */
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumb =
    pathSegments.length > 0
      ? pathSegments
        .map(seg => seg.charAt(0).toUpperCase() + seg.slice(1))
        .join(' / ')
      : 'Overview';

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <header className="topbar !bg-transparent !backdrop-blur-xl border-b border-white/5">
      {/* Left: Breadcrumb */}
      <div className="topbar-left">
        <div className="topbar-breadcrumb flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 shadow-primary"></div>
          <span className="opacity-50">Pages</span>
          <span className="mx-1 opacity-30">/</span>
          <strong className="text-white tracking-widest">{breadcrumb}</strong>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="topbar-right">
        {/* Search */}
        <div className="topbar-search h-10 !bg-slate-900/40 border-white/5 focus-within:!border-blue-500/30 transition-all">
          <Search size={16} className="opacity-40" />
          <input
            type="text"
            placeholder="Quantum Search..."
            className="text-xs"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className={`topbar-icon-btn ${showNotifications ? 'bg-white/10' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} className={unreadCount > 0 ? 'animate-pulse text-blue-400' : ''} />
            {unreadCount > 0 && <span className="topbar-notification-dot" />}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden animate-fadeInUp">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white">Alert Center</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell size={24} className="mx-auto mb-2 text-dim opacity-20" />
                      <p className="text-xs text-dim italic">No recent alerts</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors relative ${!n.read ? 'bg-blue-500/5' : ''}`}
                      >
                        {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-lg h-fit ${n.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {n.type === 'error' ? <AlertTriangle size={14} /> : <Info size={14} />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-xs ${!n.read ? 'text-white font-medium' : 'text-dim'}`}>{n.message}</p>
                            <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                              <X size={10} />
                              {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 text-center bg-white/5 border-t border-white/5">
                  <Link
                    href="/activity"
                    className="text-[10px] text-dim hover:text-white transition-colors"
                    onClick={() => setShowNotifications(false)}
                  >
                    View Full Activity Log
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="topbar-divider" />

        {/* User */}
        <div className="topbar-user group cursor-pointer">
          <div className="topbar-user-info text-right">
            <div className="topbar-user-name !text-[11px] font-bold group-hover:text-blue-400 transition-colors">
              {currentUser?.full_name || currentUser?.username || 'Administrator'}
            </div>
            <div className="text-[9px] text-dim uppercase tracking-tighter">System Root</div>
          </div>

          <div className="topbar-avatar !bg-blue-500/5 !border-blue-500/20 shadow-inner group-hover:neon-border transition-all">
            {currentUser?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
