import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BackToTop from '@/components/UI/BackToTop';

const MainLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <TopBar />
        <main className="app-main">
          <div className="app-container admin-page page-wrapper animate-fadeInUp">
            {children}
          </div>
        </main>
      </div>
      <BackToTop />
    </div>
  );
};

export default MainLayout;
