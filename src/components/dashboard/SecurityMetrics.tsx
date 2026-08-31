import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertOctagon,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  FileCheck2,
  Fingerprint,
  Globe,
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Truck,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card.tsx';

interface SecurityMetricsProps {
  activeThreatsCount: number;
  criticalThreatsCount: number;
  papersCount: number;
  packagesCount: number;
  centresCount: number;
  iotDevicesCount: number;
  systemScore: number;
  onNavigateToView: (view: string) => void;
}

export const SecurityMetrics: React.FC<SecurityMetricsProps> = ({
  activeThreatsCount,
  criticalThreatsCount,
  papersCount,
  packagesCount,
  centresCount,
  iotDevicesCount,
  systemScore,
  onNavigateToView,
}) => {
  const cards = [
    {
      title: 'ACTIVE THREATS',
      value: String(activeThreatsCount).padStart(2, '0'),
      change: criticalThreatsCount > 0 ? `${criticalThreatsCount} Critical Flags` : 'Perimeter Intact',
      status: criticalThreatsCount > 0 ? 'CRITICAL' : 'SECURE',
      icon: ShieldAlert,
      view: 'incidents',
      accentColor: criticalThreatsCount > 0 ? 'border-rose-500/40 text-rose-400' : 'border-cyan-500/30 text-cyan-400',
      glowColor: criticalThreatsCount > 0 ? 'shadow-[0_0_25px_rgba(244,63,94,0.15)]' : 'shadow-[0_0_20px_rgba(0,217,255,0.08)]',
    },
    {
      title: 'PROTECTED PAPERS',
      value: String(papersCount).padStart(2, '0'),
      change: 'SHA-256 Signed Sets',
      status: 'AUTHENTIC',
      icon: FileCheck2,
      view: 'papers',
      accentColor: 'border-purple-500/30 text-purple-400',
      glowColor: 'shadow-[0_0_20px_rgba(139,92,246,0.08)]',
    },
    {
      title: 'SECURE CONTAINERS',
      value: String(packagesCount || 24).padStart(2, '0'),
      change: 'Electronic Reed Seals',
      status: 'MONITORED',
      icon: Boxes,
      view: 'packages',
      accentColor: 'border-emerald-500/30 text-emerald-400',
      glowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.08)]',
    },
    {
      title: 'EXAM CENTRES',
      value: String(centresCount || 10).padStart(2, '0'),
      change: 'Biometrics Armed',
      status: 'ONLINE',
      icon: Globe,
      view: 'centres',
      accentColor: 'border-blue-500/30 text-blue-400',
      glowColor: 'shadow-[0_0_20px_rgba(59,130,246,0.08)]',
    },
    {
      title: 'CHAIN INTEGRITY',
      value: `${systemScore}%`,
      change: 'Merkle Block Root',
      status: systemScore >= 90 ? 'VERIFIED' : 'TAMPER_ALERT',
      icon: ShieldCheck,
      view: 'blockchain',
      accentColor: 'border-cyan-500/30 text-cyan-400',
      glowColor: 'shadow-[0_0_20px_rgba(0,217,255,0.08)]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            whileHover={{ y: -3, scale: 1.01 }}
            onClick={() => onNavigateToView(card.view)}
            className="cursor-pointer"
          >
            <Card
              className={`border bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-950/80 backdrop-blur-xl ${card.accentColor} ${card.glowColor} hover:border-cyan-400/50 transition-all duration-300 h-full flex flex-col justify-between`}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    {card.title}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-extrabold text-white font-heading tracking-tight">
                    {card.value}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                      card.status === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                        : card.status === 'TAMPER_ALERT'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-950 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {card.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                  <span className="truncate">{card.change}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
