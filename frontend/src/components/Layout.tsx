import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ requireAuth = true }: { requireAuth?: boolean }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication Guard
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">

      {/* Top Navbar */}
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Workspace */}
      <div className="flex flex-1">
        {isAuthenticated && requireAuth ? (
          <>
            {/* Left Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            {/* Page Outlet content area */}
            <main className="w-full flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
              <div className="mx-auto max-w-5xl">
                <Outlet />
              </div>
            </main>
          </>
        ) : (
          <main className="w-full flex-1">
            <Outlet />
          </main>
        )}
      </div>
    </div>
  );
}
