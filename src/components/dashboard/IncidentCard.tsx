import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Info,
  Layers,
  Lock,
  MapPin,
  MoreHorizontal,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Truck,
  User,
  Zap,
} from 'lucide-react';
import { Alert } from '../../types/index.ts';
import { Card } from '../ui/card.tsx';
import { Button, LiquidButton } from '../ui/liquid-glass-button.tsx';

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

  const severityBadge = isCritical
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : isHigh
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : isMedium
    ? 'bg-purple-50 text-purple-700 border-purple-200'
    : 'bg-blue-50 text-blue-700 border-blue-200';

  const statusBadge =
    alert.status === 'OPEN'
      ? 'bg-rose-100 text-rose-800'
      : alert.status === 'INVESTIGATING'
      ? 'bg-amber-100 text-amber-900'
      : 'bg-emerald-100 text-emerald-800';

  return (
    <Card className="p-5 border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${severityBadge}`}>
            {alert.severity}
          </span>
          <span className="font-mono text-xs font-semibold text-slate-500">{alert.alertCode}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Incident Title & Description */}
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-900 font-heading leading-snug">
          {alert.title}
        </h4>
        <p className="text-xs text-slate-600 font-sans leading-relaxed">
          {alert.description}
        </p>
      </div>

      {/* Detection Signals / Reasons */}
      {alert.reasons && alert.reasons.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
            Detection Signals:
          </div>
          <div className="space-y-1">
            {alert.reasons.slice(0, 2).map((reason, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span className="truncate">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer & Single Primary Action */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge}`}>
            {alert.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LiquidButton
            variant="default"
            size="sm"
            onClick={() => onOpenInvestigation(alert)}
          >
            <span>Open Investigation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </LiquidButton>
        </div>
      </div>
    </Card>
  );
};
