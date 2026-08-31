import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  BookOpen,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  FileCheck2,
  FileText,
  Fingerprint,
  Flame,
  Globe,
  KeyRound,
  Layers,
  Lock,
  MapPin,
  Radio,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Truck,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import { UserRole } from '../types/index.ts';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  currentUserRole: UserRole;
  alertsCount?: number;
  incidentsCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  currentUserRole,
  alertsCount = 0,
  incidentsCount = 0,
}) => {
  const sections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Command Center', icon: Activity },
      ],
    },
    {
      title: 'EXAMINATION SECURITY',
      items: [
        { id: 'papers', label: 'Question Papers', icon: FileCheck2 },
        { id: 'questions', label: 'Question Bank', icon: BookOpen },
        { id: 'verification', label: 'SHA-256 Verification', icon: Fingerprint },
      ],
    },
    {
      title: 'SECURE LOGISTICS',
      items: [
        { id: 'transport', label: 'Armored Transit Radar', icon: Truck },
        { id: 'packages', label: 'Smart Exam Boxes', icon: Boxes },
        { id: 'handover', label: 'Two-Party Handover', icon: KeyRound },
        { id: 'custody', label: 'Chain of Custody', icon: Layers },
      ],
    },
    {
      title: 'AI THREAT INTELLIGENCE',
      items: [
        { id: 'insider', label: 'Insider Threat Engine', icon: BrainCircuit },
        { id: 'leak', label: 'Paper Leak Analysis', icon: ShieldAlert },
        {
          id: 'alerts',
          label: 'Anomaly Alerts',
          icon: AlertTriangle,
          badge: alertsCount > 0 ? alertsCount : undefined,
          badgeColor: 'bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]',
        },
      ],
    },
    {
      title: 'INCIDENT RESPONSE',
      items: [
        {
          id: 'incidents',
          label: 'Investigation Room',
          icon: ShieldCheck,
          badge: incidentsCount > 0 ? incidentsCount : undefined,
          badgeColor: 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)]',
        },
      ],
    },
    {
      title: 'INFRASTRUCTURE & 3D',
      items: [
        { id: 'iot', label: 'IoT Sensor Fleet (30)', icon: Smartphone },
        { id: 'centres', label: 'Exam Centres (10)', icon: MapPin },
        { id: 'vault3d', label: '3D Security Vault', icon: Globe },
      ],
    },
    {
      title: 'GOVERNANCE & AUDIT',
      items: [
        { id: 'policies', label: 'Security Policies', icon: Lock },
        { id: 'blockchain', label: 'Immutable Ledger', icon: Layers },
        { id: 'audit', label: 'Audit Trail Logs', icon: FileText },
      ],
    },
    {
      title: 'SIMULATION & LAB',
      items: [
        { id: 'simulator', label: 'Attack Simulation Lab', icon: Flame },
        { id: 'demo', label: '10-Step Master Demo', icon: Zap },
      ],
    },
    {
      title: 'SYSTEM & ADMIN',
      items: [
        { id: 'health', label: 'API & System Health', icon: Cpu },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-950/80 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col shrink-0 select-none overflow-y-auto scrollbar-thin relative z-30 shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
      <div className="p-3 space-y-5 flex-1">
        {sections.map((section, sIdx) => (
          <div key={section.title || sIdx} className="space-y-1">
            <div className="px-3 text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group text-left ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,217,255,0.15)] font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent'
                    }`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 inset-y-1.5 w-[3px] rounded-r-full bg-cyan-400 shadow-[0_0_8px_rgba(0,217,255,0.8)]" />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-cyan-400'
                            : 'text-slate-500 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                          item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
          <span>ZERO-TRUST SOC PERIMETER</span>
        </div>
      </div>
    </aside>
  );
};
