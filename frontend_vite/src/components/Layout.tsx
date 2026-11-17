// Pharma Cold Track - Layout Component
// Premium dark enterprise layout with sidebar navigation and sticky header

import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import {
  LayoutDashboard,
  Truck,
  Package,
  AlertTriangle,
  FileText,
  Settings,
  LogOut,
  User,
  Bell,
  Wifi,
  WifiOff,
  Menu,
  X,
  ChevronDown,
  Moon,
  Sun,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Fleet', href: '/fleet', icon: Truck },
  { name: 'Shipments', href: '/shipments', icon: Package },
  { name: 'Excursions', href: '/excursions', icon: AlertTriangle },
  { name: 'Compliance', href: '/compliance', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout() {
  const { user, logout, updatePreferences } = useAuth();
  const { connectionStatus, metrics } = useData();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');

  // Ensure dark class is set on mount
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    updatePreferences({ theme: newTheme });
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'connecting': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'disconnected': return 'text-slate-400 bg-white/5 border-white/10';
      case 'error': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
  };

  const getConnectionStatusIcon = () => {
    return connectionStatus === 'connected' ? (
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
      </span>
    ) : <WifiOff className="w-3.5 h-3.5" />;
  };

  const getConnectionStatusText = () => {
    const statusMap = {
      connected: 'Live',
      connecting: 'Connecting...',
      disconnected: 'Offline',
      error: 'Error',
    };
    return statusMap[connectionStatus];
  };

  return (
    <div className="flex min-h-screen bg-[#06080d] text-slate-200 font-sans antialiased selection:bg-teal-500/30 selection:text-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0a0e17] border-r border-white/[0.06]',
          'flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out',
          'lg:static lg:translate-x-0 lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo / Brand */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white">PharmaTrack</h1>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-teal-400" />
                  <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider">GxP Compliant</span>
                </div>
              </div>
            </div>
            {/* Close button on mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto" aria-label="Main navigation">
            <div className="px-3 pb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Operations
            </div>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group',
                    isActive
                      ? 'bg-teal-500/10 text-teal-300 nav-active-bar'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  )}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={clsx('w-[18px] h-[18px]', isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-400')} />
                    <span>{item.name}</span>
                  </div>
                  {item.name === 'Excursions' && metrics && metrics.active_excursions > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center animate-pulse">
                      {metrics.active_excursions}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User Section at Bottom */}
          <div className="p-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03]">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white font-bold text-xs">
                {user?.name?.charAt(0) || 'D'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.name || 'Dr. Sarah Mitchell'}
                </p>
                <p className="text-[10px] text-slate-500 truncate capitalize">
                  {user?.role?.toLowerCase().replace('_', ' ') || 'Operations Manager'}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#06080d]/80 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left: Mobile Toggle & Page Title */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/10"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <h2 className="text-sm font-semibold text-white tracking-tight">
                  {navigation.find(n => location.pathname === n.href || (n.href !== '/' && location.pathname.startsWith(n.href)))?.name || 'Dashboard'}
                </h2>
              </div>
            </div>

            {/* Right: Status, Theme, Notifications, User */}
            <div className="flex items-center gap-2">
              {/* Connection Status Pill */}
              <div className={clsx('hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border', getConnectionStatusColor())}>
                {getConnectionStatusIcon()}
                <span>{getConnectionStatusText()}</span>
              </div>

              {/* Theme Toggle */}
              <button
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {metrics && metrics.active_excursions > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#06080d]">
                      {metrics.active_excursions}
                    </span>
                  )}
                </button>
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center text-white font-bold text-[11px]">
                    {user?.name?.charAt(0) || 'D'}
                  </div>
                  <span className="hidden sm:block text-xs font-medium text-slate-300">
                    {user?.name?.split(' ')[0] || 'Dr. Mitchell'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-[#0f1419] rounded-xl shadow-2xl border border-white/[0.08] py-1 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-xs font-semibold text-white">{user?.name || 'Dr. Sarah Mitchell'}</p>
                        <p className="text-[10px] text-slate-500">{user?.email || 'sarah.mitchell@pharmatrack.com'}</p>
                      </div>
                      <NavLink
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        Settings & Security
                      </NavLink>
                      <button
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10"
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-auto" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
