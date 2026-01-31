'use client';

import '../../app/globals.css';
import React, { useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Server,
    Users as UsersIcon,
    Activity,
    TrendingUp,
    Settings as SettingsIcon,
    LogOut,
    Mail,
    Webhook,
    Shield,
    History
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';

const Sidebar = () => {
    const { logout } = useContext(AuthContext);
    const pathname = usePathname();

    const navItems = [
        { path: '/', label: 'Overview', icon: LayoutDashboard },
        { path: '/devices', label: 'Devices', icon: Server },
        { path: '/users', label: 'Users', icon: UsersIcon },
        { path: '/broadcast', label: 'Broadcast', icon: Mail },
        { path: '/webhooks', label: 'Webhooks', icon: Webhook },
        { path: '/security-rules', label: 'Security Rules', icon: Shield },
        { path: '/activity', label: 'Audit Logs', icon: History },
        { path: '/analytics', label: 'Analytics', icon: TrendingUp },
        { path: '/settings', label: 'Settings', icon: SettingsIcon }
    ];

    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="sidebar-brand">
                <h1 className="sidebar-logo flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-primary">
                        <Server size={18} className="text-blue-400 icon-glow" />
                    </div>
                    <span>Things<span className="text-blue-400">NXT</span></span>
                </h1>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav" aria-label="Main Navigation">
                <p className="sidebar-section" aria-hidden="true">Menu</p>

                {navItems.map((item) => {
                    const isActive =
                        pathname === item.path ||
                        (item.path !== '/' && pathname.startsWith(item.path));

                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`sidebar-link group ${isActive ? 'active' : ''}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-blue-500/10 text-blue-400' : 'group-hover:bg-white/5'}`}>
                                <Icon size={18} className={isActive ? 'icon-glow' : ''} />
                            </div>
                            <span className="flex-1">{item.label}</span>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-primary icon-pulse mr-1"></div>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <button className="sidebar-logout" onClick={logout}>
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
