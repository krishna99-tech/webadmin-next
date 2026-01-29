'use client';

import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = ({ children }) => {
  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="app-content">
        <TopBar />

        <main className="app-main">
          <div className="app-container animate-fadeInUp">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
