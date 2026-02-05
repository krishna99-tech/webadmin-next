import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem,
  Chip,
  Avatar,
  AvatarIcon,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Divider
} from '@heroui/react';
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
  Menu,
  X,
  Bell,
  Search,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { getAvatarClassNames } from '../../utils/avatarTheme';
import Button from '../UI/Button';

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

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { logout, currentUser } = useContext(AuthContext);
  const location = useLocation();
  const pathname = location.pathname;
  const isAdmin = currentUser?.is_admin ?? currentUser?.role === 'Admin';

  const NavLink = ({ item, isActive }) => {
    const Icon = item.icon;
    return (
      <Link
        to={item.path}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-primary/20 text-primary border-l-4 border-primary' 
            : 'text-gray-400 hover:bg-gray-800/50 hover:text-foreground'
          }
        `}
        onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
      >
        <Icon size={20} className={isActive ? 'text-primary' : ''} />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950
          border-r border-gray-800/50
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col h-screen
        `}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-800/50">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck size={24} className="text-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Things<span className="text-blue-400">NXT</span>
              </h1>
              <p className="text-xs text-gray-400">Admin Console</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navGroups.map((group) => {
            const visibleItems = group.adminOnly && !isAdmin ? [] : group.items;
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.label} className="space-y-2">
                <div className="flex items-center justify-between px-2 mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.label}
                  </p>
                  {group.adminOnly && (
                    <Chip size="sm" variant="flat" color="danger" className="h-5 text-[10px]">
                      Admin
                    </Chip>
                  )}
                </div>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive =
                      pathname === item.path ||
                      (item.path !== '/' && pathname.startsWith(item.path));
                    return (
                      <NavLink key={item.path} item={item} isActive={isActive} />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800/50 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30">
            <Avatar
              classNames={getAvatarClassNames(currentUser?.email || currentUser?.username || '', isAdmin)}
              icon={<AvatarIcon />}
              name={currentUser?.full_name || currentUser?.username || 'Admin'}
              size="sm"
              isBordered
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {currentUser?.full_name || currentUser?.username || 'Admin'}
              </p>
              <p className="text-xs text-gray-400">
                {isAdmin ? 'Administrator' : currentUser?.role || 'User'}
              </p>
            </div>
          </div>
          <Button
            variant="flat"
            color="danger"
            className="w-full"
            startContent={<LogOut size={18} />}
            onPress={logout}
          >
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
