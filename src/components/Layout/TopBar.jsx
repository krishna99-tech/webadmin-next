import React, { useContext, useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Navbar, 
  NavbarContent, 
  NavbarItem,
  Input,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Chip,
  Button,
  Breadcrumbs,
  BreadcrumbItem,
  Divider
} from '@heroui/react';
import { 
  Bell, 
  Search, 
  Info, 
  AlertTriangle, 
  Plus, 
  Server, 
  Users, 
  Wifi, 
  WifiOff, 
  ChevronDown,
  Settings,
  LogOut,
  User,
  Shield
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getAvatarClassNames } from '../../utils/avatarTheme';
import adminService from '../../services/adminService';
import useWebSocket from '../../hooks/useWebSocket';

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
  const { currentUser, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [apiStatus, setApiStatus] = useState('checking');
  const searchInputRef = useRef(null);

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
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
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
    <Navbar 
      className="border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl"
      maxWidth="full"
      height="64px"
      isBordered
    >
      {/* Left: Breadcrumbs */}
      <NavbarContent>
        <NavbarItem>
          <Breadcrumbs>
            <BreadcrumbItem>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Admin</span>
            </BreadcrumbItem>
            {breadcrumbItems.map((item, i) => (
              <BreadcrumbItem key={i}>
                <span className="text-sm font-semibold text-foreground">{item}</span>
              </BreadcrumbItem>
            ))}
          </Breadcrumbs>
        </NavbarItem>
      </NavbarContent>

      {/* Center: Status Pills */}
      <NavbarContent className="hidden md:flex gap-2">
        <Chip
          size="sm"
          variant="flat"
          color={apiStatus === 'ok' ? 'success' : apiStatus === 'error' ? 'danger' : 'default'}
          startContent={
            apiStatus === 'ok' ? (
              <Server size={12} />
            ) : apiStatus === 'error' ? (
              <AlertTriangle size={12} />
            ) : (
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
            )
          }
        >
          API
        </Chip>
        <Chip
          size="sm"
          variant="flat"
          color={wsConnected ? 'success' : 'warning'}
          startContent={wsConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
        >
          {wsConnected ? 'Live' : 'Offline'}
        </Chip>
      </NavbarContent>

      {/* Right: Actions */}
      <NavbarContent justify="end" className="gap-2">
        {/* Quick Actions Dropdown */}
        {isAdmin && (
          <NavbarItem>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  size="sm"
                  startContent={<Plus size={16} />}
                  endContent={<ChevronDown size={14} />}
                >
                  Quick
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Quick Actions">
                <DropdownItem
                  key="add-device"
                  startContent={<Server size={16} className="text-blue-400" />}
                  onPress={() => navigate('/devices')}
                >
                  Add Device
                </DropdownItem>
                <DropdownItem
                  key="add-user"
                  startContent={<Users size={16} className="text-purple-400" />}
                  onPress={() => navigate('/users')}
                >
                  Add User
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        )}

        {/* Search */}
        <NavbarItem className="hidden lg:flex">
          <Input
            ref={searchInputRef}
            classNames={{
              base: "max-w-full sm:max-w-[10rem] h-10",
              mainWrapper: "h-full",
              input: "text-small",
              inputWrapper: "h-full font-normal text-default-500 bg-default-100/50 dark:bg-default-500/20",
            }}
            placeholder="Search… (Ctrl+K)"
            size="sm"
            startContent={<Search size={16} />}
            type="search"
          />
        </NavbarItem>

        {/* Notifications */}
        <NavbarItem>
          <Dropdown 
            isOpen={showNotifications}
            onOpenChange={setShowNotifications}
            placement="bottom-end"
          >
            <DropdownTrigger>
              <Badge content={unreadCount} color="danger" isInvisible={unreadCount === 0}>
                <Button
                  isIconOnly
                  variant="light"
                  className="text-gray-300"
                >
                  <Bell size={20} />
                </Button>
              </Badge>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Notifications"
              className="w-80"
              itemClasses={{
                base: "gap-4",
              }}
            >
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Alerts</h4>
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="light"
                    onPress={markAllRead}
                    className="text-xs text-primary"
                  >
                    Mark read
                  </Button>
                )}
              </div>
              {notifications.length === 0 ? (
                <DropdownItem key="empty" textValue="No notifications">
                  <div className="p-8 text-center">
                    <Bell size={24} className="mx-auto mb-2 text-gray-500 opacity-20" />
                    <p className="text-xs text-gray-400">No alerts</p>
                  </div>
                </DropdownItem>
              ) : (
                notifications.map((n) => (
                  <DropdownItem
                    key={n.id}
                    textValue={n.message}
                    className={`${!n.read ? 'bg-blue-500/10' : ''}`}
                    startContent={
                      <div className={`p-2 rounded-lg ${n.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {n.type === 'error' ? <AlertTriangle size={14} /> : <Info size={14} />}
                      </div>
                    }
                  >
                    <div>
                      <p className={`text-xs ${!n.read ? 'text-foreground font-medium' : 'text-gray-400'}`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </DropdownItem>
                ))
              )}
              <Divider />
              <DropdownItem
                key="view-all"
                onPress={() => {
                  navigate('/activity');
                  setShowNotifications(false);
                }}
                className="text-center"
              >
                View Activity Log
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>

        {/* User Menu */}
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                src={currentUser?.avatar}
                name={currentUser?.full_name || currentUser?.username || 'Admin'}
                size="sm"
                isBordered
                className="cursor-pointer"
                classNames={getAvatarClassNames(currentUser?.email || currentUser?.username || '', isAdmin)}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User Menu">
              <DropdownItem
                key="profile"
                startContent={<User size={16} />}
                textValue="Profile"
              >
                <div>
                  <p className="font-semibold">{currentUser?.full_name || currentUser?.username || 'Admin'}</p>
                  <p className="text-xs text-gray-400">
                    {isAdmin ? 'Administrator' : currentUser?.role || 'User'}
                  </p>
                </div>
              </DropdownItem>
              <Divider />
              <DropdownItem
                key="settings"
                startContent={<Settings size={16} />}
                onPress={() => navigate('/settings')}
              >
                Settings
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                startContent={<LogOut size={16} />}
                onPress={logout}
              >
                Sign Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default TopBar;
