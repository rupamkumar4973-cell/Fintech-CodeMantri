import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

import {
  LayoutDashboard,
  UserCheck,
  TrendingUp,
  Calculator,
  FileCheck,
  Cpu,
  Settings,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose?: () => void }) {
  const { user } = useSelector((state: RootState) => state.auth);

  const userNavigation = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { name: 'KYC Verification', to: '/kyc', icon: UserCheck },
    { name: 'Credit bureau', to: '/credit-score', icon: TrendingUp },
    { name: 'Eligibility Check', to: '/eligibility', icon: Calculator },
    { name: 'Apply & Track', to: '/applications', icon: FileCheck },
    { name: 'AI Recommendations', to: '/recommendations', icon: Cpu },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', to: '/admin', icon: ShieldAlert },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
        : 'text-slate-650 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-white'
    }`;

  const sidebarContent = (
    <div className="flex h-full flex-col gap-6 p-4">
      {/* User Card info */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/50 dark:bg-slate-900/30">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Welcome back,</p>
        <h3 className="truncate font-semibold text-slate-900 dark:text-white">{user?.name}</h3>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-1">
        <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">User Dashboard</p>
        {userNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.name} to={item.to} onClick={onClose} className={linkClass}>
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {user?.role === 'admin' && (
          <div className="mt-8 space-y-1">
            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Admin Section</p>
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.name} to={item.to} onClick={onClose} className={linkClass}>
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200 bg-white pt-16 transition-transform duration-300 dark:border-slate-850 dark:bg-slate-950 md:sticky md:top-16 md:block md:h-[calc(100vh-64px)] md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
