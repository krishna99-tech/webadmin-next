import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Server,
    Users as UsersIcon,
    Mail,
    Webhook,
    Shield,
    History,
    TrendingUp,
    Settings as SettingsIcon,
    LogOut,
    ShieldCheck,
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';

const navGroups = [
    {
        label: 'Control Center',
        items: [
            { path: '/', label: 'Overview', icon: LayoutDashboard },
        ],
    },
    {
        label: 'Resources',
        items: [
            { path: '/devices', label: 'Devices', icon: Server },
            { path: '/users', label: 'Users', icon: UsersIcon },
        ],
    },
    {
        label: 'Administration',
        adminOnly: true,
        items: [
            { path: '/broadcast', label: 'Broadcast', icon: Mail },
            { path: '/webhooks', label: 'Webhooks', icon: Webhook },
        ],
    },
    {
        label: 'Security & Audit',
        items: [
            { path: '/security-rules', label: 'Security Rules', icon: Shield },
            { path: '/activity', label: 'Audit Logs', icon: History },
        ],
    },
    {
        label: 'Analytics',
        items: [
            { path: '/analytics', label: 'Analytics', icon: TrendingUp },
        ],
    },
    {
        label: 'System',
        items: [
            { path: '/settings', label: 'Settings', icon: SettingsIcon },
        ],
    },
];

const Sidebar = () => {
    const { logout, currentUser } = useContext(AuthContext);
    const location = useLocation();
    const pathname = location.pathname;
    const isAdmin = currentUser?.is_admin ?? currentUser?.role === 'Admin';

    return (
        <aside className="sidebar admin-sidebar">
            {/* Brand */}
            <div className="sidebar-brand">
                <Link to="/" className="sidebar-logo-link flex items-center gap-3">
                    <div className="sidebar-logo-icon">
                        <ShieldCheck size={20} className="text-blue-400 icon-glow" />
                    </div>
                    <div>
                        <span className="logo-text">Things<span className="text-blue-400">NXT</span></span>
                        <span className="admin-badge">Admin Console</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav" aria-label="Admin Navigation">
                {navGroups.map((group) => {
                    const visibleItems = group.adminOnly && !isAdmin ? [] : group.items;
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={group.label} className="sidebar-group">
                            <p className="sidebar-section">
                                {group.label}
                                {group.adminOnly && (
                                    <span className="sidebar-section-badge">Admin</span>
                                )}
                            </p>
                            <div className="sidebar-group-links">
                                {visibleItems.map((item) => {
                                    const isActive =
                                        pathname === item.path ||
                                        (item.path !== '/' && pathname.startsWith(item.path));
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`sidebar-link group ${isActive ? 'active' : ''}`}
                                            aria-current={isActive ? 'page' : undefined}
                                        >
                                            <div className={`sidebar-link-icon ${isActive ? 'active' : ''}`}>
                                                <Icon size={18} className={isActive ? 'icon-glow' : ''} />
                                            </div>
                                            <span className="sidebar-link-text">{item.label}</span>
                                            {isActive && (
                                                <div className="sidebar-link-indicator" aria-hidden="true" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="sidebar-footer-user">
                    <div className="sidebar-footer-avatar">
                        {currentUser?.username?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="sidebar-footer-info">
                        <span className="sidebar-footer-name">{currentUser?.full_name || currentUser?.username || 'Admin'}</span>
                        <span className="sidebar-footer-role">
                            {isAdmin ? 'Administrator' : currentUser?.role || 'User'}
                        </span>
                    </div>
                </div>
                <button className="sidebar-logout" onClick={logout} aria-label="Sign out">
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
