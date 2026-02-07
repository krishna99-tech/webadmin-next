import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Badge, Button } from '@heroui/react';
import { Menu, Bell, ShieldCheck, Zap } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import BackToTop from '../UI/BackToTop';

const MainLayout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const isBroadcastPage = pathname === '/broadcast';

  return (
    <div className="layout-root">
      {/* Subtle Background Glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'rgba(59, 130, 246, 0.05)', filter: 'blur(120px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '400px', height: '400px', background: 'rgba(99, 102, 241, 0.05)', filter: 'blur(100px)', borderRadius: '50%' }} />
      </div>

      {/* Mobile Header (Hidden on Laptop+) */}
      <Navbar 
        style={{ background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-dim)' }}
        className="lg-only"
        maxWidth="full"
        height="64px"
      >
        <NavbarContent justify="start">
          <Button
            isIconOnly
            variant="light"
            onPress={() => setIsMobileOpen(!isMobileOpen)}
            className="text-dim"
          >
            <Menu size={20} />
          </Button>
        </NavbarContent>
        
        <NavbarBrand className="flex-center">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '0.6rem', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={18} color="white" />
                </div>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>Things<span style={{ color: 'var(--primary)' }}>NXT</span></h1>
            </div>
        </NavbarBrand>

        <NavbarContent justify="end">
          <NavbarItem>
            <Badge content="" color="primary" size="sm" shape="circle" placement="top-right">
              <Button isIconOnly variant="light" className="text-dim">
                <Bell size={20} />
              </Button>
            </Badge>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <div className="layout-shell">
        <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        <div className="main-content">
          <div className="lg-hidden">
            <TopBar />
          </div>

          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className={isBroadcastPage ? 'viewport-full' : 'viewport-inner'} style={{ flex: 1 }}>
              {children}
            </div>

            <footer className="elite-footer">
                <div className="flex-between" style={{ gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Zap size={14} style={{ color: 'var(--primary)' }} />
                        <span>Kernel_Link_Secured</span>
                    </div>
                    <span className="hidden-mobile">v5.0.4 r102 • ThingsNXT Platform</span>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <span style={{ cursor: 'pointer', color: 'var(--primary)' }}>Documentation</span>
                        <span style={{ cursor: 'pointer', color: 'var(--primary)' }} className="hidden-mobile">Audit Vault</span>
                    </div>
                </div>
            </footer>
          </main>
        </div>
      </div>

      <BackToTop />
    </div>
  );
};

export default MainLayout;
