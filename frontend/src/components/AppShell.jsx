import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  Bell, 
  LayoutDashboard, 
  Layers, 
  ChevronDown, 
  User, 
  LogOut, 
  Settings, 
  X,
  Radio
} from 'lucide-react';
import { useDevConnect } from '../context/DevConnectContext';

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    currentUser, 
    logoutUser, 
    unreadActivityCount, 
    unreadWorkspacesCount 
  } = useDevConnect();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/dashboard',
      label: 'Feed',
      icon: Radio,
      badge: 0
    },
    {
      to: '/workspaces',
      label: 'Workspaces',
      icon: Layers,
      badge: unreadWorkspacesCount
    },
    {
      to: '/activity',
      label: 'Activity',
      icon: Bell,
      badge: unreadActivityCount
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* Top Application Header */}
      <header className="h-14 bg-slate-950/90 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 z-40 backdrop-blur-md">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-indigo-600 rounded-sm flex items-center justify-center transform rotate-45 border border-indigo-400/30 group-hover:bg-indigo-500 transition shadow-sm shadow-indigo-600/30">
              <Shield className="h-3 w-3 text-indigo-200 transform -rotate-45" />
            </div>
            <span className="text-sm font-black tracking-tight text-white">
              DEV<span className="text-indigo-400">CONNECT</span>
            </span>
          </Link>
          <span className="hidden sm:inline-block text-[9px] uppercase font-mono tracking-widest text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            Workspaces v3.0
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 w-80 lg:w-96 focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/30 transition">
          <Search className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search workspaces, channels, discussions..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="bg-transparent text-xs text-slate-200 placeholder:text-slate-600 outline-none w-full"
          />
          {globalSearch && (
            <button 
              onClick={() => setGlobalSearch('')}
              className="text-slate-500 hover:text-slate-300 ml-1"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* User Account Controls */}
        <div className="flex items-center gap-3 relative">
          
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                alt={currentUser?.fullName || 'User'}
                className="w-6 h-6 rounded-md object-cover border border-indigo-400/30"
              />
              <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-28 truncate">
                {currentUser?.fullName || 'Account'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Dropdown Overlay */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                    <p className="text-xs font-bold text-white truncate">{currentUser?.fullName || 'Developer'}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser?.email || `${currentUser?.username}@devconnect.local`}</p>
                    <span className="mt-1 inline-block text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
                      Role: {currentUser?.role || 'USER'}
                    </span>
                  </div>

                  <Link
                    to="/profile-setup"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Profile Setup</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Body with Persistent Icon Rail and Dynamic Workspace/Feed Content */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Icon Rail (Desktop 64-72px) */}
        <aside 
          className="hidden md:flex w-16 lg:w-18 bg-slate-950/95 border-r border-slate-800/80 flex-col items-center justify-between py-4 shrink-0 z-30 select-none"
          aria-label="Application navigation rail"
        >
          {/* Top rail items */}
          <nav className="flex flex-col items-center gap-3 w-full px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition duration-150 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow-sm shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-mono tracking-tight font-medium">
                    {item.label}
                  </span>

                  {/* Unread badge */}
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom rail user avatar badge */}
          <div className="flex flex-col items-center gap-2">
            <Link
              to="/profile-setup"
              className="relative group p-1 rounded-lg hover:bg-slate-900 transition"
              title="Edit Profile"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-slate-700 group-hover:border-indigo-400 transition"
              />
              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto relative pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (360px responsiveness) */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-slate-950/95 border-t border-slate-800 flex items-center justify-around px-2 z-40 backdrop-blur-md"
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-lg ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-mono mt-0.5">{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute -top-1 right-2 min-w-3.5 h-3.5 px-0.5 bg-indigo-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

