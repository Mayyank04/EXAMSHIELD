import React from 'react';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Boxes,
  BrainCircuit,
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
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
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
        { id: 'welcome', label: 'Platform Landing', icon: Sparkles },
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
        { id: 'transport', label: 'Armored Transit', icon: Truck },
        { id: 'packages', label: 'Smart Exam Boxes', icon: Boxes },
        { id: 'handover', label: 'Two-Party Handover', icon: KeyRound },
        { id: 'custody', label: 'Chain of Custody', icon: Layers },
      ],
    },
    {
      title: 'THREAT INTELLIGENCE',
      items: [
        { id: 'insider', label: 'Insider Threats', icon: BrainCircuit },
        { id: 'leak', label: 'Paper Leak Analysis', icon: ShieldAlert },
        {
          id: 'alerts',
          label: 'Anomaly Alerts',
          icon: AlertTriangle,
          badge: alertsCount > 0 ? alertsCount : undefined,
          badgeColor: 'bg-rose-100 text-rose-700 font-bold',
        },
      ],
    },
    {
      title: 'INCIDENT RESPONSE',
      items: [
        {
          id: 'incidents',
          label: 'Investigation Room',
          icon: ShieldAlert,
          badge: incidentsCount > 0 ? incidentsCount : undefined,
          badgeColor: 'bg-amber-100 text-amber-800 font-bold',
        },
      ],
    },
    {
      title: 'INFRASTRUCTURE',
      items: [
        { id: 'iot', label: 'IoT Sensor Fleet', icon: Smartphone },
        { id: 'centres', label: 'Exam Centres', icon: MapPin },
        { id: 'vault3d', label: '3D Security Vault', icon: Globe },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { id: 'admin', label: 'Admin Panel', icon: ShieldCheck },
        { id: 'policies', label: 'Security Policies', icon: Lock },
        { id: 'blockchain', label: 'Immutable Ledger', icon: Layers },
        { id: 'audit', label: 'Audit Logs', icon: FileText },
      ],
    },
    {
      title: 'SIMULATION & LAB',
      items: [
        { id: 'simulator', label: 'Attack Simulation Lab', icon: Flame },
        { id: 'demo', label: '10-Step Master Demo', icon: Zap },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none overflow-y-auto scrollbar-thin relative z-20">
      <div className="p-3 space-y-5 flex-1">
        {sections.map((section, sIdx) => (
          <div key={section.title || sIdx} className="space-y-1">
            <div className="px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
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
                    className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 group text-left cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 inset-y-2 w-[3px] rounded-r-full bg-indigo-600" />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-indigo-600'
                            : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                          item.badgeColor || 'bg-slate-100 text-slate-600'
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
      <div className="p-3 border-t border-slate-100 bg-slate-50/60 text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] font-medium text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>ZERO-TRUST PERIMETER ACTIVE</span>
        </div>
      </div>
    </aside>
  );
};
