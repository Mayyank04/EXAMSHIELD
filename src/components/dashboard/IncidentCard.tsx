import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  Fingerprint,
  Flame,
  Radio,
  ShieldAlert,
  Smartphone,
  Truck,
  Zap,
} from 'lucide-react';
import { Alert } from '../../types/index.ts';
import { Card, CardContent } from '../ui/card.tsx';
import { LiquidButton } from '../ui/liquid-glass-button.tsx';

interface IncidentCardProps {
  alert: Alert;
  onOpenInvestigation: (alert: Alert) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  alert,
  onOpenInvestigation,
}) => {
  const isCritical = alert.severity === 'CRITICAL';
  const isHigh = alert.severity === 'HIGH';
  const isMedium = alert.severity === 'MEDIUM';

  const severityConfig = {
    CRITICAL: {
      badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-600/80',
      glow: 'shadow-[0_0_25px_rgba(244,63,94,0.12)] border-rose-500/30 hover:border-rose-500/60',
      indicatorColor: 'bg-rose-400',
      pulse: true,
      btnVariant: 'danger' as const,
    },
    HIGH: {
      badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-600/80',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.10)] border-amber-500/30 hover:border-amber-500/60',
      indicatorColor: 'bg-amber-400',
      pulse: false,
      btnVariant: 'default' as const,
    },
    MEDIUM: {
      badgeBg: 'bg-yellow-950/80 text-yellow-300 border-yellow-600/80',
      glow: 'border-slate-800 hover:border-yellow-500/40',
      indicatorColor: 'bg-yellow-400',
      pulse: false,
      btnVariant: 'neutral' as const,
    },
    LOW: {
      badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-600/80',
      glow: 'border-slate-800 hover:border-cyan-500/40',
      indicatorColor: 'bg-cyan-400',
      pulse: false,
      btnVariant: 'neutral' as const,
    },
    INFO: {
      badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-600/80',
      glow: 'border-slate-800 hover:border-blue-500/40',
      indicatorColor: 'bg-blue-400',
      pulse: false,
      btnVariant: 'neutral' as const,
    },
  };

  const currentConfig = severityConfig[alert.severity] || severityConfig.MEDIUM;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`bg-slate-900/60 backdrop-blur-xl border transition-all duration-300 ${currentConfig.glow} flex flex-col justify-between`}
      >
        <CardContent className="p-5 space-y-3.5">
          {/* Top Row: Severity Indicator & Alert Code */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {currentConfig.pulse && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${currentConfig.indicatorColor}`} />
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${currentConfig.badgeBg}`}
              >
                {alert.severity}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
              <span className="text-slate-300 font-bold ml-1">{alert.alertCode}</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white font-heading tracking-tight leading-snug">
              {alert.title}
            </h4>
            <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-2">
              {alert.description}
            </p>
          </div>

          {/* Detection Signals Box */}
          {alert.reasons && alert.reasons.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 text-[11px] font-mono">
              <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
                Detection Signals:
              </div>
              {alert.reasons.slice(0, 3).map((r, rIdx) => (
                <div key={rIdx} className="flex items-start gap-1.5 text-slate-300">
                  <span className="text-cyan-400 font-bold shrink-0">•</span>
                  <span className="truncate">{r}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase">STATUS:</span>
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                  alert.status === 'RESOLVED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {alert.status}
              </span>
            </div>

            <LiquidButton
              variant={currentConfig.btnVariant}
              size="sm"
              onClick={() => onOpenInvestigation(alert)}
            >
              <span>Open Investigation</span>
              <ArrowRight className="w-3 h-3" />
            </LiquidButton>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
