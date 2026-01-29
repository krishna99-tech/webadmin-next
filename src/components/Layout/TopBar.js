'use client';

import '../../app/globals.css';
import React, { useContext } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';

const TopBar = () => {
  const { currentUser } = useContext(AuthContext);
  const pathname = usePathname();

  /* Breadcrumb */
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumb =
    pathSegments.length > 0
      ? pathSegments
          .map(seg => seg.charAt(0).toUpperCase() + seg.slice(1))
          .join(' / ')
      : 'Overview';

  return (
    <header className="topbar">
      {/* Left: Breadcrumb */}
      <div className="topbar-left">
        <span className="topbar-breadcrumb">
          Pages / <strong>{breadcrumb}</strong>
        </span>
      </div>

      {/* Right: Actions */}
      <div className="topbar-right">
        {/* Search */}
        <div className="topbar-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search..."
          />
        </div>

        {/* Notifications */}
        <button className="topbar-icon-btn">
          <Bell size={20} />
          <span className="topbar-notification-dot" />
        </button>

        <div className="topbar-divider" />

        {/* User */}
        <div className="topbar-user">
          <div className="topbar-user-info">
            <span className="topbar-user-name">
              {currentUser?.full_name || 'Admin User'}
            </span>
          </div>

          <div className="topbar-avatar">
            {currentUser?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
