import React, { useContext, useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  Input,
  Avatar,
  Badge,
  Button,
  Breadcrumbs,
  BreadcrumbItem,
  Divider,
  Kbd,
  Tooltip,
} from '@heroui/react';
import { Bell, Search, Zap, Activity, Command } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import useWebSocket from '../../hooks/useWebSocket';

// Constants
const BREADCRUMB_LABELS = {
  '': 'Dashboard',
  devices: 'Nodes Registry',
  users: 'Identity Hub',
  broadcast: 'Global Dispatch',
  webhooks: 'Signal API',
  'security-rules': 'Protocols',
  activity: 'Audit Vault',
  analytics: 'Intelligence',
  settings: 'System Config',
};

const TopBar = () => {
  const { currentUser } = useContext(AuthContext);
  const { isConnected: wsConnected } = useWebSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [apiStatus, setApiStatus] = useState('checking');

  const isAdmin = currentUser?.is_admin ?? currentUser?.role === 'Admin';
  const pathname = location.pathname;

  // --- Logic: Notifications ---
  useEffect(() => {
    const fetchNotifs = async () => {
      if (!isAdmin) return;
      try {
        const data = await adminService.getNotifications();
        const list = Array.isArray(data) ? data : [];
        setUnreadCount(list.filter((n) => !n.read).length);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchNotifs();
  }, [isAdmin]);

  // --- Logic: API Health Check ---
  useEffect(() => {
    const checkApi = async () => {
      if (!isAdmin) {
        setApiStatus('ok');
        return;
      }
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

    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // --- Logic: Breadcrumbs ---
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathSegments.length > 0
    ? pathSegments.map((seg) => BREADCRUMB_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1))
    : ['Overview'];

  return (
    <Navbar
      maxWidth="full"
      className="top-bar-elite topbar-root"
      style={{
        background: 'rgba(2, 6, 23, 0.65)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        height: 'var(--topbar-height)',
        padding: '0 2.5rem',
      }}
    >
      {/* 1. Search Command Center */}
      <NavbarContent
        justify="start"
        className="topbar-slot topbar-left"
        style={{ maxWidth: '420px', alignItems: 'center', flexWrap: 'nowrap' }}
      >
        <Input
          ref={searchInputRef}
          type="search"
          size="sm"
          placeholder="Command search..."
          startContent={<Search size={16} style={{ color: 'var(--text-muted)', marginRight: '6px' }} />}
          endContent={
            <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Kbd className="kbd-style"><Command size={10} /></Kbd>
              <Kbd className="kbd-style">K</Kbd>
            </div>
          }
          classNames={{
            inputWrapper: "topbar-search h-11 border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] focus-within:border-blue-500/40 focus-within:bg-blue-500/[0.05] rounded-xl transition-all duration-300",
          }}
          style={{ fontSize: '13px', fontWeight: 500 }}
        />
      </NavbarContent>

      {/* 2. Navigation Breadcrumbs */}
      <NavbarContent
        className="hidden-mobile topbar-slot topbar-center"
        justify="center"
        style={{ flex: 1, alignItems: 'center', flexWrap: 'nowrap', minWidth: 0 }}
      >
        <Breadcrumbs variant="light" underline="hover">
          <BreadcrumbItem href="/">
            <span className="text-tactical" style={{ fontSize: '10px', opacity: 0.4, letterSpacing: '0.15em', fontWeight: 800 }}>
              ROOT
            </span>
          </BreadcrumbItem>
          {breadcrumbItems.map((item, i) => (
            <BreadcrumbItem key={i}>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 900,
                  color: i === breadcrumbItems.length - 1 ? 'var(--text-main)' : 'var(--text-dim)',
                  letterSpacing: '-0.02em',
                  fontStyle: 'italic',
                  opacity: i === breadcrumbItems.length - 1 ? 1 : 0.6,
                }}
              >
                {item.toUpperCase()}
              </span>
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
      </NavbarContent>

      {/* 3. Operational Metadata & Profile */}
      <NavbarContent
        justify="end"
        className="topbar-slot topbar-right"
        style={{ gap: '1rem', alignItems: 'center', flexWrap: 'nowrap' }}
      >
        
        {/* Status Telemetry */}
        <div className="hidden-mobile status-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '1rem' }}>
          <Tooltip content={apiStatus === 'ok' ? 'Infrastructure: OPERATIONAL' : 'Node Link: DISRUPTED'}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                background: apiStatus === 'ok' ? 'var(--success)' : 'var(--danger)', 
                width: '6px', height: '6px', borderRadius: '50%', 
                boxShadow: `0 0 12px ${apiStatus === 'ok' ? 'var(--success)' : 'var(--danger)'}` 
              }} />
              <div className="animate-pulse" style={{ position: 'absolute', inset: -4, border: `1px solid ${apiStatus === 'ok' ? 'var(--success)' : 'var(--danger)'}`, borderRadius: '50%', opacity: 0.2 }} />
            </div>
          </Tooltip>
          
          <Divider orientation="vertical" style={{ height: '0.875rem', opacity: 0.1 }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Activity size={12} style={{ color: wsConnected ? 'var(--primary)' : 'var(--text-muted)' }} />
            <span className="text-tactical" style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.05em' }}>
              {wsConnected ? 'SIGNAL_LIVE' : 'SYNC_LOST'}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <Tooltip content="Emergency Broadcast">
          <Button
            as={Link}
            to="/broadcast"
            variant="flat"
            isIconOnly
            className="hover-lift"
            style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.875rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.15)', color: 'var(--primary)' }}
          >
            <Zap size={18} strokeWidth={2.5} />
          </Button>
        </Tooltip>

        <Badge content={unreadCount} color="danger" isInvisible={unreadCount === 0} size="sm" shape="circle" style={{ border: '2px solid var(--bg-dark)' }}>
          <Button
            isIconOnly
            variant="light"
            className="hover:border-white/5"
            style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.875rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.02)' }}
          >
            <Bell size={20} />
          </Button>
        </Badge>
        
        <Divider orientation="vertical" className="hidden-mobile" style={{ height: '1.75rem', margin: '0 0.25rem', opacity: 0.05 }} />

        {/* Profile Identity */}
        <div 
          className="topbar-profile hover:bg-white/[0.02]"
          onClick={() => navigate('/settings')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.375rem 0.5rem 0.375rem 0.75rem', borderRadius: '1rem', cursor: 'pointer', transition: 'all 0.3s' }} 
        >
          <div className="hidden-mobile" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <p style={{ fontSize: '12px', fontWeight: 800, margin: 0, color: 'var(--text-main)', lineHeight: 1 }}>
              {currentUser?.username || 'PRINCIPAL'}
            </p>
            <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.3, fontWeight: 800 }}>
              {isAdmin ? 'SYS_ADMIN' : 'NODE_USER'}
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            <Avatar
              src={`https://i.pravatar.cc/150?u=${currentUser?.id}`}
              style={{ height: '2.25rem', width: '2.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '10px', height: '10px', background: 'var(--success)', borderRadius: '50%', border: '2px solid #020617' }} />
          </div>
        </div>
      </NavbarContent>
    </Navbar>
  );
};

export default TopBar;
