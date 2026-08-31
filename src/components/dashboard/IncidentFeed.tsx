import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Filter,
  Flame,
  Radio,
  Search,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Alert } from '../../types/index.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { Button } from '../ui/liquid-glass-button.tsx';
import { IncidentCard } from './IncidentCard.tsx';

interface IncidentFeedProps {
  alerts: Alert[];
  onOpenInvestigation: (alert: Alert) => void;
  onNavigateToIncidents: () => void;
}

export const IncidentFeed: React.FC<IncidentFeedProps> = ({
  alerts = [],
  onOpenInvestigation,
  onNavigateToIncidents,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = (alerts || []).filter((a) => {
    if (filterSeverity === 'ALL') return true;
    if (filterSeverity === 'INVESTIGATING') return a.status === 'INVESTIGATING';
    return a.severity === filterSeverity;
  });

  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>REAL-TIME INCIDENT RESPONSE FEED</span>
          </div>
          <CardTitle className="text-base font-bold text-slate-900 mt-1">
            Active Threat & Tamper Dockets
          </CardTitle>
        </div>

        {/* Severity Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium">
          {['ALL', 'CRITICAL', 'HIGH', 'INVESTIGATING'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                filterSeverity === sev
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {filteredAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAlerts.slice(0, 6).map((alert) => (
              <IncidentCard
                key={alert.id}
                alert={alert}
                onOpenInvestigation={onOpenInvestigation}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <h4 className="text-sm font-bold text-slate-800">No Active Threats in Queue</h4>
            <p className="text-xs text-slate-500 max-w-sm">
              All 10 examination centres and armored corridors report normal baseline parameters.
            </p>
          </div>
        )}

        {/* Bottom CTA to War Room */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Showing <strong>{Math.min(filteredAlerts.length, 6)}</strong> of {alerts.length} security alerts
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToIncidents}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <span>Open Forensic Investigation Room</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
