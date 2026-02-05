import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Input, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Badge, Chip } from '@heroui/react';
import { Menu, Bell, Search, Sun, Moon } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar';
import BackToTop from '../UI/BackToTop';

const MainLayout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const { pathname } = useLocation();
  const isBroadcastPage = pathname === '/broadcast';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Mobile Header */}
      <Navbar 
        className="lg:hidden border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl"
        maxWidth="full"
        height="64px"
      >
        <NavbarBrand>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Menu size={24} className="text-gray-300" />
          </button>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavbarItem>
            <Badge content="5" color="danger" shape="circle">
              <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                <Bell size={20} className="text-gray-300" />
              </button>
            </Badge>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <div className="flex h-[calc(100vh-64px)] lg:h-screen">
        {/* Sidebar */}
        <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <TopBar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-950/50 to-gray-900/50">
            <div className={`container mx-auto px-4 py-6 lg:px-6 lg:py-8 ${isBroadcastPage ? 'max-w-none' : 'max-w-7xl'}`}>
              {children}
            </div>
          </main>
        </div>
      </div>

      <BackToTop />
    </div>
  );
};

export default MainLayout;
