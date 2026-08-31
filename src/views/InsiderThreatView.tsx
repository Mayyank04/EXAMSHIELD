import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Eye,
  KeyRound,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCheck,
  UserX,
  Users,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card.tsx';
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { User, UserRiskProfile } from '../types/index.ts';

interface InsiderThreatViewProps {
  users: User[];
  riskProfiles: UserRiskProfile[];
  onRefresh: () => void;
}

export const InsiderThreatView: React.FC<InsiderThreatViewProps> = ({
  users = [],
  riskProfiles = [],
  onRefresh,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || 'USR-001');
  const [accessHour, setAccessHour] = useState<number>(14);
  const [isKnownDevice, setIsKnownDevice] = useState<boolean>(true);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [failedLogins, setFailedLogins] = useState<number>(0);
  const [downloadCount, setDownloadCount] = useState<number>(1);
  const [paperAccessCount, setPaperAccessCount] = useState<number>(2);
  const [privilegeEscalation, setPrivilegeEscalation] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluatedProfile, setEvaluatedProfile] = useState<UserRiskProfile | null>(null);

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];
  const activeProfile: UserRiskProfile =
    evaluatedProfile ||
    riskProfiles.find((r) => r.userId === selectedUserId) || {
      userId: selectedUser?.id || 'USR-001',
      userName: selectedUser?.name || 'Dr. Rajeshwar Sharma',
      role: selectedUser?.role || 'SUPER_ADMIN',
      riskScore: 12,
      riskLevel: 'LOW' as const,
      factors: {
        accessAnomaly: 0.1,
        timeAnomaly: 0.05,
        deviceAnomaly: 0.0,
        locationAnomaly: 0.0,
        downloadAnomaly: 0.1,
      },
      recentViolations: [],
      recommendedAction: 'Maintain standard dual-custody access protocol.',
      lastAssessed: new Date().toISOString(),
      status: 'NORMAL',
    };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const res = await api.evaluateUserRisk({
        userId: selectedUserId,
        accessHour,
        isKnownDevice,
        distanceFromAssignedKm: distanceKm,
        failedLoginsCount: failedLogins,
        downloadCount,
        paperAccessCount,
        privilegeEscalationAttempt: privilegeEscalation,
      });
      setEvaluatedProfile(res);
      onRefresh();
    } catch (err: any) {
      alert(`Risk evaluation error: ${err.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const applyScenario = (type: 'NORMAL' | 'AFTER_HOURS' | 'UNAUTHORIZED_EXFIL') => {
    if (type === 'NORMAL') {
      setAccessHour(11);
      setIsKnownDevice(true);
      setDistanceKm(0);
      setFailedLogins(0);
      setDownloadCount(1);
      setPaperAccessCount(1);
      setPrivilegeEscalation(false);
    } else if (type === 'AFTER_HOURS') {
      setAccessHour(3);
      setIsKnownDevice(true);
      setDistanceKm(12);
      setFailedLogins(1);
      setDownloadCount(3);
      setPaperAccessCount(4);
      setPrivilegeEscalation(false);
    } else if (type === 'UNAUTHORIZED_EXFIL') {
      setAccessHour(2);
      setIsKnownDevice(false);
      setDistanceKm(240);
      setFailedLogins(4);
      setDownloadCount(15);
      setPaperAccessCount(8);
      setPrivilegeEscalation(true);
    }
  };

  const isHighRisk = activeProfile.riskLevel === 'HIGH' || activeProfile.riskLevel === 'CRITICAL';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600">
            <BrainCircuit className="w-4 h-4" />
            <span>AI BEHAVIORAL ANOMALY RADAR</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            Insider Threat & Behavioral Risk Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Machine-learning anomaly model evaluating unscheduled access, device fingerprints, and unauthorized data exfiltration.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>IsolationForest AI Model Active</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Risk Factor Controls (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Personnel & Access Simulation
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">Configure Variables</span>
            </div>

            {/* Officer Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Officer / Custodian
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setEvaluatedProfile(null);
                }}
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-900 font-bold"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role}) - {u.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Scenario Buttons */}
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Preset Threat Scenarios:
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => applyScenario('NORMAL')}
                  className="text-[11px] font-medium"
                >
                  Baseline Shift
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => applyScenario('AFTER_HOURS')}
                  className="text-[11px] font-medium"
                >
                  After-Hours Access
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  type="button"
                  onClick={() => applyScenario('UNAUTHORIZED_EXFIL')}
                  className="text-[11px] font-medium"
                >
                  Exfil Attempt
                </Button>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex items-center justify-between text-slate-700 font-medium mb-1">
                  <span>Access Time: <strong>{accessHour}:00 hrs</strong></span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {accessHour < 6 || accessHour > 20 ? 'Off-Hours Anomaly' : 'Standard Window'}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={23}
                  value={accessHour}
                  onChange={(e) => setAccessHour(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-700 font-medium mb-1">
                  <span>Distance Deviation: <strong>{distanceKm} km</strong></span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={300}
                  step={10}
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-700 font-medium mb-1">
                  <span>Failed Biometric Attempts: <strong>{failedLogins}</strong></span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={failedLogins}
                  onChange={(e) => setFailedLogins(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Unrecognized Hardware Device</span>
                <input
                  type="checkbox"
                  checked={!isKnownDevice}
                  onChange={(e) => setIsKnownDevice(!e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>
            </div>

            <LiquidButton
              variant="default"
              size="default"
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="w-full"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>{isEvaluating ? 'Executing Neural Inference...' : 'Evaluate Behavioral Anomaly Risk'}</span>
            </LiquidButton>
          </Card>
        </div>

        {/* Right: AI Scorecard Display (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Evaluation Result</div>
                <h3 className="text-base font-bold text-slate-900 font-heading mt-0.5">
                  {selectedUser?.name || 'Dr. Rajeshwar Sharma'}
                </h3>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isHighRisk
                    ? 'bg-rose-100 text-rose-800'
                    : activeProfile.riskLevel === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {activeProfile.riskLevel} RISK
              </span>
            </div>

            {/* Scorecard Hero */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 font-medium">Composite Anomaly Score</div>
                <div
                  className={`text-3xl font-extrabold font-heading mt-1 ${
                    isHighRisk ? 'text-rose-600' : 'text-indigo-600'
                  }`}
                >
                  {activeProfile.riskScore}/100
                </div>
              </div>

              <div className="text-right text-xs">
                <div className="text-slate-500 font-medium">Model Confidence</div>
                <div className="text-base font-bold text-slate-800 font-mono mt-1">
                  {(activeProfile as any).anomalyConfidence || 94}%
                </div>
              </div>
            </div>

            {/* Anomalies List */}
            <div className="space-y-2 text-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Detected Behavioral Anomalies:
              </div>
              <div className="space-y-1.5">
                {(activeProfile.recentViolations && activeProfile.recentViolations.length > 0
                  ? activeProfile.recentViolations
                  : ['No critical anomalies flagged for current officer session.']
                ).map((anom, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        isHighRisk ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    />
                    <span className="text-slate-700 font-medium leading-relaxed">{anom}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2 text-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Containment Recommendations:
              </div>
              <div className="space-y-1.5">
                {[
                  activeProfile.recommendedAction ||
                    'Enforce dual-custody verification on next strongroom physical entry.',
                ].map((rec, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <span className="text-slate-800 font-medium leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
