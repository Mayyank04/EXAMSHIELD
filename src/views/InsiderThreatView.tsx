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
import { LiquidButton, MetalButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { User, UserRiskProfile } from '../types/index.ts';

interface InsiderThreatViewProps {
  users: User[];
  riskProfiles: UserRiskProfile[];
  onRefresh: () => void;
}

export const InsiderThreatView: React.FC<InsiderThreatViewProps> = ({
  users,
  riskProfiles,
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
  const activeProfile =
    evaluatedProfile ||
    riskProfiles.find((r) => r.userId === selectedUserId) || {
      userId: selectedUser.id,
      userName: selectedUser.name,
      role: selectedUser.role,
      riskScore: 12,
      riskLevel: 'LOW' as const,
      factors: {
        accessAnomaly: 10,
        timeAnomaly: 10,
        deviceAnomaly: 12,
        locationAnomaly: 8,
        downloadAnomaly: 5,
      },
      recentViolations: [],
      lastAssessed: new Date().toISOString(),
      status: 'NORMAL' as const,
    };

  const handleEvaluateAnomaly = async () => {
    setIsEvaluating(true);
    try {
      const profile = await api.evaluateUserRisk({
        userId: selectedUser.id,
        accessHour,
        isKnownDevice,
        locationDistanceKmFromAssigned: distanceKm,
        failedLoginCount: failedLogins,
        downloadCount,
        recentPaperAccessCount: paperAccessCount,
        roleEscalationAttempt: privilegeEscalation,
      });
      setEvaluatedProfile(profile);
      onRefresh();
    } catch (err: any) {
      alert(`Anomaly evaluation error: ${err.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleApplyPreset = (type: 'NORMAL' | 'INSIDER_ANOMALY' | 'EXFILTRATION') => {
    if (type === 'NORMAL') {
      setAccessHour(14);
      setIsKnownDevice(true);
      setDistanceKm(0);
      setFailedLogins(0);
      setDownloadCount(1);
      setPaperAccessCount(2);
      setPrivilegeEscalation(false);
    } else if (type === 'INSIDER_ANOMALY') {
      setAccessHour(2); // 2 AM
      setIsKnownDevice(false);
      setDistanceKm(85);
      setFailedLogins(4);
      setDownloadCount(14);
      setPaperAccessCount(12);
      setPrivilegeEscalation(true);
    } else if (type === 'EXFILTRATION') {
      setAccessHour(23);
      setIsKnownDevice(false);
      setDistanceKm(120);
      setFailedLogins(2);
      setDownloadCount(25);
      setPaperAccessCount(18);
      setPrivilegeEscalation(true);
    }
  };

  const riskScore = activeProfile.riskScore;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-950 via-[#050B18] to-[#0A1425] p-6 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-purple-400">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>AUTONOMOUS BEHAVIORAL THREAT PROFILING & ANOMALY ENGINE</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1 font-heading">
          AI Insider Threat Intelligence & Anomaly Scoring
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Multi-factor behavioral analysis evaluating off-hours access, untrusted hardware signatures, geofence discrepancies, and bulk asset downloads.
        </p>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Behavioral Vector Controls (7 Cols) */}
        <div className="lg:col-span-7">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-sm font-bold text-white font-heading">Target Personnel Vector Simulation</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('NORMAL')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-[11px] font-mono text-slate-300 transition cursor-pointer"
                >
                  Normal Preset
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('INSIDER_ANOMALY')}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/50 border border-rose-800 hover:bg-rose-900 text-[11px] font-mono text-rose-300 transition cursor-pointer"
                >
                  🚨 Threat Preset
                </button>
              </div>
            </div>

            {/* User Selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono">
                Target Personnel Profile
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setEvaluatedProfile(null);
                }}
                className="w-full bg-slate-950 border border-slate-700/80 px-3 py-2.5 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-purple-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role}) — {u.badgeNumber} [{u.department}]
                  </option>
                ))}
              </select>
            </div>

            {/* Behavioral Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Access Time Slider */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Access Time (UTC):</span>
                  <span className="font-bold text-cyan-300">{String(accessHour).padStart(2, '0')}:00 UTC</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={23}
                  value={accessHour}
                  onChange={(e) => setAccessHour(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="text-[10px] font-mono text-slate-500">
                  Authorized Window: 08:00 - 19:00 UTC
                </div>
              </div>

              {/* Device Trust Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Device Hardware:</span>
                  <span className={`font-bold ${isKnownDevice ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isKnownDevice ? 'REGISTERED TPM' : 'UNTRUSTED FOOTPRINT'}
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={isKnownDevice}
                    onChange={(e) => setIsKnownDevice(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-slate-300">Device is verified institutional asset</span>
                </label>
              </div>

              {/* Geofence Discrepancy */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Precinct Discrepancy:</span>
                  <span className="font-bold text-white">{distanceKm} km</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  step={5}
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="text-[10px] font-mono text-slate-500">
                  Tolerance: &lt; 50 km from registered exam centre
                </div>
              </div>

              {/* Download Volume */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Asset Downloads:</span>
                  <span className="font-bold text-white">{downloadCount} files</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={downloadCount}
                  onChange={(e) => setDownloadCount(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="text-[10px] font-mono text-slate-500">
                  Baseline Limit: &lt; 3 assets / session
                </div>
              </div>
            </div>

            {/* Additional Flags */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={failedLogins >= 3}
                  onChange={(e) => setFailedLogins(e.target.checked ? 4 : 0)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
                />
                <span className="text-slate-300">Consecutive Failed Logins (4x)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privilegeEscalation}
                  onChange={(e) => setPrivilegeEscalation(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
                />
                <span className="text-slate-300">Privilege Escalation Attempt</span>
              </label>
            </div>

            {/* Calculate Button with LiquidButton */}
            <LiquidButton
              variant="violet"
              size="default"
              className="w-full"
              onClick={handleEvaluateAnomaly}
              disabled={isEvaluating}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>{isEvaluating ? 'Executing AI Anomaly Correlator...' : 'Calculate AI Threat Risk Score'}</span>
            </LiquidButton>
          </Card>
        </div>

        {/* Right: AI Score Breakdown & Recommendations (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl h-full flex flex-col justify-between space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-sm font-bold text-white font-heading">AI Risk Assessment Verdict</h3>
              <span className="text-[10px] font-mono text-purple-400">IsolationForest + TF-IDF</span>
            </div>

            <div className="space-y-4">
              {/* Risk Score Gauge */}
              <div
                className={`p-5 rounded-2xl border text-center space-y-2 ${
                  riskScore >= 80
                    ? 'bg-rose-950/50 border-rose-500 text-rose-200 shadow-[0_0_30px_rgba(244,63,94,0.2)]'
                    : riskScore >= 60
                    ? 'bg-amber-950/50 border-amber-500 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                    : 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                }`}
              >
                <div className="text-[10px] font-mono font-bold tracking-widest uppercase">
                  BEHAVIORAL THREAT INDEX
                </div>
                <div className="text-4xl font-extrabold font-heading">
                  {riskScore} <span className="text-sm font-normal font-mono opacity-80">/ 100</span>
                </div>
                <div className="font-mono font-bold text-xs tracking-wider">
                  RISK LEVEL: {activeProfile.riskLevel} • STATUS: {activeProfile.status}
                </div>
              </div>

              {/* Contributing Threat Signals */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  Contributing Behavioral Threat Signals:
                </div>
                {activeProfile.recentViolations.length > 0 ? (
                  <div className="space-y-1.5 font-sans">
                    {activeProfile.recentViolations.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2"
                      >
                        <span className="text-rose-400 font-bold shrink-0">•</span>
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No active anomaly signals. Behavior is within baseline.</span>
                  </div>
                )}
              </div>

              {/* Recommended Containment Actions */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  Recommended Containment Actions:
                </div>
                <div className="space-y-1 text-[11px] text-slate-300 font-mono">
                  {riskScore >= 80 ? (
                    <>
                      <div className="text-rose-400 font-bold">1. Immediately suspend session token</div>
                      <div>2. Quarantine confidential paper keys</div>
                      <div>3. Initialize cyber forensic docket</div>
                    </>
                  ) : riskScore >= 60 ? (
                    <>
                      <div className="text-amber-400 font-bold">1. Flag account for elevated supervisor audit</div>
                      <div>2. Restrict bulk download privileges</div>
                    </>
                  ) : (
                    <div>1. Maintain standard zero-trust telemetry logging</div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 text-center">
              Evaluated at: {new Date(activeProfile.lastAssessed).toLocaleTimeString()} • Zero-Trust Daemon
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
