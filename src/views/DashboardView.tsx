import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  Flame,
  Globe,
  KeyRound,
  Layers,
  Lock,
  MapPin,
  QrCode,
  Radio,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Truck,
  Users,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { IncidentFeed } from '../components/dashboard/IncidentFeed.tsx';
import { SecurityMetrics } from '../components/dashboard/SecurityMetrics.tsx';
import { SecurityNetwork3D } from '../components/dashboard/SecurityNetwork3D.tsx';
import { ThreatRadar } from '../components/dashboard/ThreatRadar.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { Alert, DashboardMetrics, ExamCentre, Incident, Package, Paper, SystemStats, User } from '../types/index.ts';

interface DashboardViewProps {
  metrics?: SystemStats | DashboardMetrics | null;
  papers?: Paper[];
  packages?: Package[];
  alerts?: Alert[];
  incidents?: Incident[];
  centres?: ExamCentre[];
  currentUser?: User;
  onNavigateToView: (view: string) => void;
  onRefresh: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  papers = [],
  packages = [],
  alerts = [],
  incidents = [],
  centres = [],
  currentUser,
  onNavigateToView,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const safeAlerts = alerts || [];
  const activeAlerts = safeAlerts.filter((a) => a.status === 'OPEN' || a.status === 'INVESTIGATING');
  const criticalAlertsCount = activeAlerts.filter((a) => a.severity === 'CRITICAL').length;
  const inTransitCount = (packages || []).filter((p) => p.status === 'IN_TRANSIT').length || 3;
  const securityScore = metrics?.systemSecurityScore ?? 98;

  // Trend Telemetry Data
  const trendData = [
    { time: '04:00', score: 99, alerts: 0 },
    { time: '06:00', score: 98, alerts: 1 },
    { time: '08:00', score: 97, alerts: 1 },
    { time: '10:00', score: securityScore > 80 ? 99 : securityScore, alerts: criticalAlertsCount },
    { time: '12:00', score: securityScore, alerts: activeAlerts.length },
    { time: 'Now', score: securityScore, alerts: activeAlerts.length },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Command Center Hero + 3D Spline Security Visualization */}
      <SecurityNetwork3D
        systemScore={securityScore}
        activeThreatsCount={activeAlerts.length}
        papersCount={(papers || []).length}
        inTransitCount={inTransitCount}
        centresCount={(centres || []).length}
        iotDevicesCount={30}
        onNavigateToView={onNavigateToView}
        onRefresh={handleRefresh}
      />

      {/* 2. Security Overview Metrics Grid */}
      <SecurityMetrics
        activeThreatsCount={activeAlerts.length}
        criticalThreatsCount={criticalAlertsCount}
        papersCount={(papers || []).length}
        packagesCount={(packages || []).length}
        centresCount={(centres || []).length}
        iotDevicesCount={30}
        systemScore={securityScore}
        onNavigateToView={onNavigateToView}
      />

      {/* 3. National Threat Radar & Corridor Telemetry */}
      <ThreatRadar
        centres={centres}
        packages={packages}
        alerts={alerts}
        onNavigateToView={onNavigateToView}
      />

      {/* 4. Telemetry Chart & Fast Response Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Telemetry Chart (8 Cols) */}
        <div className="lg:col-span-8">
          <Card className="border-slate-200 bg-white shadow-sm h-full flex flex-col justify-between">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                  <Activity className="w-3.5 h-3.5" />
                  <span>CONTINUOUS TELEMETRY STREAM</span>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 mt-1">
                  Security Integrity & Anomaly Index
                </CardTitle>
              </div>
              <span className="text-[11px] font-semibold text-indigo-700 px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200">
                Live Sampling • 10s Interval
              </span>
            </CardHeader>

            <CardContent className="p-5">
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} fontFamily="sans-serif" />
                    <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} fontFamily="sans-serif" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E8F0',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontFamily: 'sans-serif',
                        color: '#0F172A',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#4F46E5"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#scoreGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fast Response Shortcuts (4 Cols) */}
        <div className="lg:col-span-4">
          <Card className="border-slate-200 bg-white shadow-sm h-full flex flex-col justify-between p-5 space-y-4">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Fast Response Consoles
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">Operational Shortcuts</h3>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigateToView('papers')}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 transition flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Generate Paper Set</div>
                    <div className="text-[11px] text-slate-500">Author & Compute SHA-256</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </button>

              <button
                onClick={() => onNavigateToView('handover')}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 hover:bg-teal-50/30 transition flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Two-Party Handover</div>
                    <div className="text-[11px] text-slate-500">Dual-Officer Consensus</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </button>

              <button
                onClick={() => onNavigateToView('leak')}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/30 transition flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">AI Leak Radar</div>
                    <div className="text-[11px] text-slate-500">Scan Social Forum Dumps</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </button>

              <button
                onClick={() => onNavigateToView('blockchain')}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 transition flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Merkle Block Ledger</div>
                    <div className="text-[11px] text-slate-500">Verify Cryptographic Proof</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* 5. Live Incident Feed & Active Triage */}
      <IncidentFeed
        alerts={safeAlerts}
        onOpenInvestigation={(alert) => onNavigateToView('incidents')}
        onNavigateToIncidents={() => onNavigateToView('incidents')}
      />
    </div>
  );
};
