import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock,
  Command,
  Flame,
  Globe,
  HardDrive,
  KeyRound,
  Layers,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  UserCheck,
  User as UserIcon,
  Users,
  Zap,
} from 'lucide-react';
import { ROLE_METADATA } from '../services/authService.ts';
import { SystemStats, User, UserRole } from '../types/index.ts';

interface NavbarProps {
  currentUser: User;
  availableUsers: User[];
  onSelectUser: (user: User) => void;
  onOpenAuthModal: () => void;
  onOpenCommandPalette: () => void;
  onOpenNotifications: () => void;
  onNavigateToView: (view: string) => void;
  stats: SystemStats | null;
  activeAlertsCount: number;
  onResetDemo: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  availableUsers,
  onSelectUser,
  onOpenAuthModal,
  onOpenCommandPalette,
  onOpenNotifications,
  onNavigateToView,
  stats,
  activeAlertsCount,
  onResetDemo,
  onRefresh,
  isRefreshing = false,
}) => {
  const [time, setTime] = useState({
    utc: new Date().toUTCString().slice(17, 25) + ' UTC',
    local: new Date().toLocaleTimeString(),
  });
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setTime({
        utc: d.toUTCString().slice(17, 25) + ' UTC',
        local: d.toLocaleTimeString(),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleResetClick = async () => {
    if (window.confirm('Reset system to baseline demonstration state? All synthetic logs will be reinitialized.')) {
      setIsResetting(true);
      try {
        await onResetDemo();
      } finally {
        setIsResetting(false);
      }
    }
  };

  const roleMeta = ROLE_METADATA[currentUser.role] || ROLE_METADATA.SUPER_ADMIN;

  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-40 select-none shadow-xs">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigateToView('welcome')}
          className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm transition-transform duration-150 group-hover:scale-105">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-900 font-heading">
                EXAM<span className="text-indigo-600">SHIELD</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                v2.4
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium tracking-tight hidden sm:inline">
              National Examination Security Platform
            </span>
          </div>
        </button>

        {/* Global Search Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all text-xs font-sans w-64 shadow-2xs cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="flex-1 text-left text-xs font-medium">Search or jump to...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Live Clock & User Status */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>{time.local}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400 font-mono text-[10px]">{time.utc}</span>
        </div>

        {/* System Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>All systems operational</span>
        </div>

        {/* Demo Mode Button */}
        <button
          onClick={() => onNavigateToView('demo')}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold transition cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-purple-600" />
          <span>Demo Tour</span>
        </button>

        {/* Reset System Baseline */}
        <button
          onClick={handleResetClick}
          disabled={isResetting}
          title="Reset System Baseline"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing || isResetting ? 'animate-spin text-indigo-600' : ''}`} />
        </button>

        {/* Notifications Trigger */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {activeAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        {/* Profile Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 p-1.5 pr-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs font-mono">
              {currentUser.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold font-mono">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1"
              onMouseLeave={() => setIsUserDropdownOpen(false)}
            >
              <div className="p-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</div>
                <div className="text-[10px] text-indigo-600 font-semibold mt-1">
                  Badge: {currentUser.badgeNumber}
                </div>
              </div>

              <div className="text-[10px] font-semibold text-slate-400 uppercase px-2 pt-2">
                Simulate Role Identity:
              </div>

              {availableUsers.slice(0, 5).map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u);
                    setIsUserDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                    u.id === currentUser.id
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="truncate">{u.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{u.role.split('_')[0]}</span>
                </button>
              ))}

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    onNavigateToView('admin');
                    setIsUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-indigo-600 hover:bg-indigo-50 font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Open Admin Panel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
