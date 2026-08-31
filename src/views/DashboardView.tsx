import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
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
import { LiquidButton, MetalButton } from '../components/ui/liquid-glass-button.tsx';
import { Alert, ExamCentre, Incident, Package, Paper, SystemStats, User } from '../types/index.ts';

interface DashboardViewProps {
  metrics?: SystemStats | null;
  papers: Paper[];
  packages: Package[];
  alerts: Alert[];
  incidents?: Incident[];
  centres?: ExamCentre[];
  currentUser: User;
  onNavigateToView: (view: string) => void;
  onRefresh: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  papers,
  packages,
  alerts,
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

  const activeAlerts = alerts.filter((a) => a.status === 'OPEN' || a.status === 'INVESTIGATING');
  const criticalAlertsCount = activeAlerts.filter((a) => a.severity === 'CRITICAL').length;
  const inTransitCount = packages.filter((p) => p.status === 'IN_TRANSIT').length || 3;
  const securityScore = metrics?.systemSecurityScore ?? 98;

  // Trend Telemetry Data
  const trendData = [
    { time: '04:00', score: 99, alerts: 0 },
    { time: '06:00', score: 98, alerts: 1 },
    { time: '08:00', score: 97, alerts: 1 },
    { time: '10:00', score: securityScore > 80 ? 98 : securityScore, alerts: criticalAlertsCount },
    { time: '12:00', score: securityScore, alerts: activeAlerts.length },
    { time: 'Now', score: securityScore, alerts: activeAlerts.length },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Command Center Hero + 3D Spline Security Visualization */}
      <SecurityNetwork3D
        systemScore={securityScore}
        activeThreatsCount={activeAlerts.length}
        papersCount={papers.length}
        inTransitCount={inTransitCount}
        centresCount={centres.length}
        iotDevicesCount={30}
        onNavigateToView={onNavigateToView}
        onRefresh={handleRefresh}
      />

      {/* 2. Security KPI Metrics Grid */}
      <SecurityMetrics
        activeThreatsCount={activeAlerts.length}
        criticalThreatsCount={criticalAlertsCount}
        papersCount={papers.length}
        packagesCount={packages.length}
        centresCount={centres.length}
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

      {/* 4. Telemetry Chart & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Telemetry Chart (8 Cols) */}
        <div className="lg:col-span-8">
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl h-full flex flex-col justify-between">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span>CONTINUOUS TELEMETRY STREAM</span>
                </div>
                <CardTitle className="text-base font-bold text-white mt-1">
                  Security Integrity & Anomaly Index
                </CardTitle>
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-800">
                LIVE SAMPLING • 10s INTERVAL
              </span>
            </CardHeader>

            <CardContent className="p-5">
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00D9FF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748B" fontSize={10} fontFamily="monospace" />
                    <YAxis domain={[0, 100]} stroke="#64748B" fontSize={10} fontFamily="monospace" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#050B18',
                        borderColor: '#00D9FF40',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: '#F8FAFC',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#00D9FF"
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

        {/* Quick Operations Shortcuts (4 Cols) */}
        <div className="lg:col-span-4">
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl h-full flex flex-col justify-between p-5 space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Fast Response Consoles
              </span>
              <h3 className="text-sm font-bold text-white mt-1">Operational Shortcuts</h3>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigateToView('papers')}
                className="w-full p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Generate Paper Set</div>
                    <div className="text-[10px] text-slate-400">Author & Compute SHA-256</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>

              <button
                onClick={() => onNavigateToView('handover')}
                className="w-full p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-teal-500/40 transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Two-Party Handover</div>
                    <div className="text-[10px] text-slate-400">Dual-Officer Consensus</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
              </button>

              <button
                onClick={() => onNavigateToView('leak')}
                className="w-full p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/40 transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">AI Leak Radar</div>
                    <div className="text-[10px] text-slate-400">Scan Social Forum Dumps</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </button>

              <button
                onClick={() => onNavigateToView('blockchain')}
                className="w-full p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/40 transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Merkle Block Ledger</div>
                    <div className="text-[10px] text-slate-400">Verify Cryptographic Proof</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* 5. Live Incident Feed & Active Triage */}
      <IncidentFeed
        alerts={alerts}
        onOpenInvestigation={(alert) => onNavigateToView('incidents')}
        onNavigateToIncidents={() => onNavigateToView('incidents')}
      />
    </div>
  );
};
