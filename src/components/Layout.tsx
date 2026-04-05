/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Calculator, 
  FileText, 
  Activity, 
  BarChart3, 
  Users, 
  ShoppingCart, 
  Wallet,
  LogOut,
  ChevronDown,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_DISPLAY_NAMES, MOCK_USERS } from '../types/auth';
import type { UserRole } from '../types/auth';
import NotificationBell from './NotificationBell';

const allNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, module: 'dashboard' },
  { name: 'Project Management', href: '/projects', icon: FolderKanban, module: 'projects' },
  { name: 'RAB & Estimation', href: '/rab', icon: Calculator, module: 'rab' },
  { name: 'Administration & SPK', href: '/admin', icon: FileText, module: 'admin' },
  { name: 'Field Progress', href: '/progress', icon: Activity, module: 'progress' },
  { name: 'SPK vs Realization', href: '/realization', icon: BarChart3, module: 'realization' },
  { name: 'Subcontractor Wages', href: '/wages', icon: Users, module: 'wages' },
  { name: 'Procurement & Material', href: '/procurement', icon: ShoppingCart, module: 'procurement' },
  { name: 'Finance & Accounting', href: '/finance', icon: Wallet, module: 'finance' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission, switchRole, isAuthenticated } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Filter navigation based on user permissions
  const navigation = allNavigation.filter(item => 
    hasPermission(item.module, 'view')
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    setShowRoleMenu(false);
    navigate('/');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-surface-container-lowest">
      {/* Sidebar - Tema Biru Muda */}
      <aside className="w-64 bg-gradient-to-b from-sky-400 to-blue-500 text-white flex flex-col shadow-2xl">
        <div className="p-6 border-b border-sky-300/50 bg-sky-500/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Lagoi Bay</h1>
              <p className="text-xs text-sky-200">Industrial ERP</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-white text-sky-600 shadow-lg shadow-sky-900/20' 
                        : 'text-sky-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-sky-100' : 'bg-white/10'}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Role Info & Switcher */}
        <div className="p-4 border-t border-sky-300/50 bg-sky-500/30">
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/10"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {user.avatar}
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs text-sky-200">Role Aktif</p>
                <p className="text-sm font-semibold text-white">{ROLE_DISPLAY_NAMES[user.role]}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-sky-200 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
            </button>

            {showRoleMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl border border-sky-200 shadow-2xl overflow-hidden z-50">
                <p className="px-4 py-3 text-xs font-semibold text-gray-500 border-b border-gray-100 bg-gray-50">
                  Switch Role (Demo)
                </p>
                {MOCK_USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleRoleSwitch(u.role)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-sky-50 transition-colors ${
                      u.role === user.role ? 'bg-sky-50 border-l-4 border-sky-500' : 'border-l-4 border-transparent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                      {u.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-500">{ROLE_DISPLAY_NAMES[u.role]}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-6">
          <h2 className="text-lg font-headline font-semibold text-on-surface">
            {allNavigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
          </h2>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <NotificationBell />
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container-low transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                  {user.avatar}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-on-surface">{user.name}</p>
                  <p className="text-xs text-on-surface-variant">{ROLE_DISPLAY_NAMES[user.role]}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-lg overflow-hidden z-50">
                  <div className="p-4 border-b border-outline-variant">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-on-surface">{user.name}</p>
                        <p className="text-xs text-on-surface-variant">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-error hover:bg-error-container/30 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Keluar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
