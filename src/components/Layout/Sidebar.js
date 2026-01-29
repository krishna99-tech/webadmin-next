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
    LogOut
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';

const Sidebar = () => {
    const { logout } = useContext(AuthContext);
    const pathname = usePathname();

    const navItems = [
        { path: '/', label: 'Overview', icon: LayoutDashboard },
        { path: '/devices', label: 'Devices', icon: Server },
        { path: '/users', label: 'Users', icon: UsersIcon },
        { path: '/activity', label: 'Activity', icon: Activity },
        { path: '/analytics', label: 'Analytics', icon: TrendingUp },
        { path: '/settings', label: 'Settings', icon: SettingsIcon }
    ];

    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="sidebar-brand">
                <h1 className="sidebar-logo">
                    Things<span>NXT</span>
                </h1>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <p className="sidebar-section">Menu</p>

                {navItems.map((item) => {
                    const isActive =
                        pathname === item.path ||
                        (item.path !== '/' && pathname.startsWith(item.path));

                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
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
