import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Command,
  Cpu,
  Flame,
  Globe,
  KeyRound,
  Lock,
  LogOut,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Zap,
} from 'lucide-react';
import { ROLE_METADATA } from '../services/authService.ts';
import { ProviderManager } from '../services/providers/index.ts';
import { SystemStats, User } from '../types/index.ts';

interface NavbarProps {
  currentUser: User;
  availableUsers?: User[];
  onSelectUser?: (user: User) => void;
  onOpenAuthModal: () => void;
  onOpenCommandPalette: () => void;
  onOpenNotifications: () => void;
  onNavigateToView: (view: string) => void;
  stats?: SystemStats | null;
  activeAlertsCount?: number;
  onResetDemo?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  availableUsers = [],
  onSelectUser,
  onOpenAuthModal,
  onOpenCommandPalette,
  onOpenNotifications,
  onNavigateToView,
  stats,
  activeAlertsCount = 0,
  onResetDemo,
  onRefresh,
  isRefreshing = false,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isProdMode, setIsProdMode] = useState<boolean>(ProviderManager.isProduction());
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const utc = now.toUTCString().slice(17, 22) + ' UTC';
      const local = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTimeStr(`${local} • ${utc}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMode = () => {
    const next = !isProdMode;
    setIsProdMode(next);
    ProviderManager.setProductionMode(next);
    if (onRefresh) onRefresh();
  };

  const handleReset = async () => {
    if (!onResetDemo) return;
    if (confirm('Reset entire demonstration database, ledger blocks, and telemetry to pristine baseline?')) {
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
    <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 select-none shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigateToView('welcome')}
          className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,217,255,0.35)] group-hover:scale-105 transition-transform duration-200">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white font-heading">
                EXAM<span className="text-cyan-400">SHIELD</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v2.4
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:inline">
              National Examination Paper Security Platform
            </span>
          </div>
        </button>

        {/* Global Search Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-cyan-500/40 transition-all duration-200 text-xs font-sans w-64 shadow-inner cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="flex-1 text-left text-xs">Search or jump to...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Live Clock & User Status */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-500" />
          <span>{timeStr}</span>
        </div>

        {/* Mode Toggle Button */}
        <button
          onClick={handleToggleMode}
          title="Click to toggle Demo vs Production API mode"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-mono font-semibold transition cursor-pointer ${
            isProdMode
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isProdMode ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="hidden sm:inline">MODE:</span>
          <span>{isProdMode ? 'PRODUCTION' : 'DEMO MODE'}</span>
        </button>

        {/* Quick Demo Reset */}
        <button
          onClick={handleReset}
          disabled={isResetting}
          title="Reset demonstration data to baseline"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition cursor-pointer"
        >
          <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition cursor-pointer"
          title="Security Notifications"
        >
          <Bell className="w-4 h-4" />
          {activeAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-lg shadow-rose-600/50">
              {activeAlertsCount > 9 ? '9+' : activeAlertsCount}
            </span>
          )}
        </button>

        {/* Active Role & User Capsule */}
        <button
          onClick={onOpenAuthModal}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 transition group text-left cursor-pointer shadow-inner"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center text-cyan-400 font-bold font-mono text-xs border border-slate-800 group-hover:border-cyan-500/50 shadow-sm">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate max-w-[120px]">
                {currentUser.name.split(' ')[0]}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                {currentUser.role}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline truncate max-w-[140px]">
              {roleMeta.badge}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
