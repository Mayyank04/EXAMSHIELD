import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Filter,
  Flame,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Alert } from '../../types/index.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { LiquidButton } from '../ui/liquid-glass-button.tsx';
import { IncidentCard } from './IncidentCard.tsx';

interface IncidentFeedProps {
  alerts: Alert[];
  onOpenInvestigation: (alert: Alert) => void;
  onNavigateToIncidents: () => void;
}

export const IncidentFeed: React.FC<IncidentFeedProps> = ({
  alerts,
  onOpenInvestigation,
  onNavigateToIncidents,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity =
      filterSeverity === 'ALL' ||
      (filterSeverity === 'CRITICAL' && alert.severity === 'CRITICAL') ||
      (filterSeverity === 'HIGH' && alert.severity === 'HIGH') ||
      (filterSeverity === 'OPEN' && alert.status === 'OPEN');

    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alertCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSeverity && matchesSearch;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;

  return (
    <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl space-y-4">
      <CardHeader className="p-5 pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>LIVE INCIDENT RESPONSE FEED</span>
          </div>
          <CardTitle className="text-base font-bold text-white mt-1">
            Real-Time Threat Dockets & Anomaly Triage
          </CardTitle>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 pl-8 pr-2 py-1 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
            {['ALL', 'CRITICAL', 'OPEN'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterSeverity(tab)}
                className={`px-3 py-1 rounded-lg transition text-[11px] font-bold ${
                  filterSeverity === tab
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab} {tab === 'CRITICAL' && criticalCount > 0 && `(${criticalCount})`}
              </button>
            ))}
          </div>

          <LiquidButton
            variant="default"
            size="sm"
            onClick={onNavigateToIncidents}
          >
            <span>Investigation HQ</span>
            <ArrowRight className="w-3 h-3" />
          </LiquidButton>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0">
        {filteredAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAlerts.map((alert) => (
              <IncidentCard
                key={alert.id}
                alert={alert}
                onOpenInvestigation={onOpenInvestigation}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800/60 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Security Perimeter Intact</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No active security violations matching the filter criteria. All 30 IoT sentinels and 10 transport corridors are reporting normal telemetry.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
