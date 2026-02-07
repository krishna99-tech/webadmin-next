import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Avatar,
  Button,
  Divider,
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
  ShieldCheck,
  Zap,
  Settings,
  LogOut,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const menuItems = [
  { group: 'Control', items: [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/analytics', label: 'Intelligence', icon: TrendingUp },
  ]},
  { group: 'Fleet', items: [
    { path: '/devices', label: 'Nodes Registry', icon: Server },
    { path: '/users', label: 'Identity Hub', icon: UsersIcon },
  ]},
  { group: 'Dissemination', adminOnly: true, items: [
    { path: '/broadcast', label: 'Global Dispatch', icon: Mail },
    { path: '/webhooks', label: 'Signal Nodes', icon: Webhook },
  ]},
  { group: 'Perimeter', items: [
    { path: '/security-rules', label: 'Protocols', icon: Shield },
    { path: '/activity', label: 'Audit Vault', icon: History },
  ]},
];

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { logout, currentUser } = useContext(AuthContext);
  const location = useLocation();
  const pathname = location.pathname;
  const isAdmin = currentUser?.is_admin ?? currentUser?.role === 'Admin';

  const NavItem = ({ item, isActive }) => {
    const Icon = item.icon;
    return (
      <Link
        to={item.path}
        className={`nav-item group ${isActive ? 'nav-item-active' : ''}`}
        onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
        style={{
            position: 'relative',
            overflow: 'hidden',
            background: isActive ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.02) 100%)' : 'transparent',
            borderRight: isActive ? '2px solid var(--primary)' : '2px solid transparent'
        }}
      >
        <div className="nav-item-icon" style={{ color: isActive ? 'var(--primary)' : 'var(--text-dim)' }}>
          <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span style={{ flex: 1, fontWeight: isActive ? 700 : 500, fontSize: '13px', letterSpacing: '-0.01em', color: isActive ? 'var(--text-main)' : 'var(--text-dim)' }}>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.7)', backdropFilter: 'blur(8px)', zIndex: 60 }}
          className="lg-only"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className="sidebar"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          background: 'var(--bg-dark)',
          borderRight: '1px solid var(--border-dim)',
          display: 'flex',
          flexDirection: 'column',
          width: 'var(--sidebar-width)',
          zIndex: 70,
          boxShadow: '20px 0 50px -20px rgba(0,0,0,0.5)'
        }}
        id="sidebar-container"
      >
        <style>
          {`
            @media (min-width: 1025px) {
              #sidebar-container {
                position: sticky !important;
                transform: none !important;
              }
            }
          `}
        </style>
        
        {/* Branding Cluster */}
        <div style={{ padding: '2.5rem 1.5rem', marginBottom: '1rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
            <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem', background: 'linear-gradient(135deg, var(--primary), #1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.25)' }} className="logo-glow">
                <ShieldCheck size={26} color="white" strokeWidth={2.5} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 950, margin: 0, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>
                Things<span style={{ color: 'var(--primary)' }}>NXT</span>
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} className="animate-pulse" />
                  <p className="text-tactical" style={{ opacity: 0.4, fontSize: '8px', letterSpacing: '0.2em' }}>COMMAND_HUB</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Tactical Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {menuItems.map((group) => {
            const visibleItems = group.adminOnly && !isAdmin ? [] : group.items;
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1rem' }}>
                  <span className="text-tactical" style={{ fontSize: '9px', fontWeight: 900, opacity: 0.2, letterSpacing: '0.25em', whiteSpace: 'nowrap' }}>{group.group.toUpperCase()}</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-dim)', opacity: 0.1 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {visibleItems.map((item) => {
                    const isActive =
                      pathname === item.path ||
                      (item.path !== '/' && pathname.startsWith(item.path));
                    return (
                      <NavItem key={item.path} item={item} isActive={isActive} />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Principal Workspace Card */}
        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-dim)', background: 'linear-gradient(to bottom, transparent, rgba(2, 6, 23, 0.8))' }}>
            <div className="elite-card" style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Avatar
                            src={`https://i.pravatar.cc/150?u=${currentUser?.id}`}
                            style={{ height: '2.75rem', width: '2.75rem', borderRadius: '0.875rem', border: '2px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 16px rgba(0,0,0,0.4)' }}
                        />
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '10px', height: '10px', background: 'var(--success)', borderRadius: '50%', border: '2px solid #020617', boxShadow: '0 0 10px var(--success)' }} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: '0.925rem', fontWeight: 900, margin: 0, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                            {currentUser?.username || 'PRINCIPAL'}
                        </p>
                        <p className="text-tactical" style={{ fontSize: '7px', opacity: 0.35, margin: 0, marginTop: '2px', fontWeight: 800 }}>
                            {isAdmin ? 'SECURE_IDENT_ADMIN' : 'IDENT_NODE_USER'}
                        </p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button 
                        as={Link}
                        to="/settings"
                        isIconOnly
                        variant="flat" 
                        style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dim)', color: 'var(--text-dim)' }}
                    >
                        <Settings size={16} />
                    </Button>
                    <Button 
                        onPress={logout}
                        variant="flat" 
                        style={{ flex: 1, height: '2.25rem', borderRadius: '0.625rem', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.1)' }}
                        startContent={<LogOut size={14} />}
                    >
                        De-Auth
                    </Button>
                </div>
            </div>
            
            <div className="flex-center" style={{ gap: '0.625rem', marginTop: '1.5rem', opacity: 0.15 }}>
                <div style={{ height: '1px', flex: 1, background: 'var(--border-dim)' }} />
                <span className="text-tactical" style={{ fontSize: '7px', fontWeight: 900, letterSpacing: '0.3em' }}>NODE_OPS_SYNC</span>
                <div style={{ height: '1px', flex: 1, background: 'var(--border-dim)' }} />
            </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
