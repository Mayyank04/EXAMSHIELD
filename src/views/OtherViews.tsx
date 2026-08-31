import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  BookOpen,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  FileCheck2,
  FileText,
  Fingerprint,
  HardDrive,
  KeyRound,
  Layers,
  Lock,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Thermometer,
  Truck,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { AuditLog, ExamCentre, IoTDevice, Question, SecurityPolicy, SecurityPolicyItem } from '../types/index.ts';

// ----------------------------------------------------
// 1. EXAM CENTRES VIEW
// ----------------------------------------------------
interface CentresViewProps {
  centres: ExamCentre[];
  onRefresh: () => void;
}

export const CentresView: React.FC<CentresViewProps> = ({ centres, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = centres.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>NATIONAL EXAMINATION CENTRES NETWORK (10 HUBS)</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1 font-heading">
            Exam Centres & Strongroom Readiness
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Geofenced physical centres equipped with biometric access, Faraday-shielded strongrooms, and CCTV telemetry.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, city, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 pl-9 pr-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const isHighAlert = c.status === 'HIGH_ALERT';
          return (
            <div
              key={c.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-lg space-y-3 transition flex flex-col justify-between ${
                isHighAlert ? 'border-rose-700 bg-rose-950/20 shadow-rose-950/20' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-sm">{c.code}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isHighAlert
                        ? 'bg-rose-900 text-rose-200 border border-rose-700 animate-pulse'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-heading">{c.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{c.address}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">Capacity</div>
                    <div className="font-bold text-white mt-0.5">{c.capacity}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">Security Score</div>
                    <div
                      className={`font-bold mt-0.5 ${
                        c.securityScore >= 90
                          ? 'text-emerald-400'
                          : c.securityScore >= 75
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {c.securityScore}/100
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Superintendent: {c.superintendentName}</span>
                  <span className="text-emerald-400">Biometrics Armed</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 2. IOT SENSOR FLEET VIEW
// ----------------------------------------------------
interface IotFleetViewProps {
  devices: IoTDevice[];
  onRefresh: () => void;
}

export const IotFleetView: React.FC<IotFleetViewProps> = ({ devices, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = devices.filter(
    (d) =>
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.certificateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.packageId && d.packageId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400">
            <Smartphone className="w-3.5 h-3.5" />
            <span>AUTONOMOUS IOT SMART CONTAINER FLEET (30 NODES)</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1 font-heading">
            IoT Sensor Fleet & Hardware Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Active ESP32 secure enclave hardware nodes monitoring reed switch contacts, lux exposure, kinetic shock, and thermal envelopes.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search device ID, seal, cert..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 pl-9 pr-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dev) => {
          const isCompromised = dev.status === 'COMPROMISED' || dev.sensors.reedSwitch === 'OPEN';
          return (
            <div
              key={dev.id}
              className={`p-5 rounded-2xl border shadow-lg space-y-3 transition flex flex-col justify-between ${
                isCompromised
                  ? 'bg-rose-950/30 border-rose-700 shadow-rose-950/20'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-sm">{dev.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isCompromised
                        ? 'bg-rose-900 text-rose-200 border border-rose-700 animate-pulse'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {dev.status}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400">
                  <span>Assigned Box: </span>
                  <span className="text-slate-200 font-bold">{dev.packageId || 'UNASSIGNED RESERVE'}</span>
                </div>
              </div>

              {/* Sensor Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center font-mono text-xs">
                <div>
                  <div className="text-[9px] text-slate-500 uppercase">Reed Switch</div>
                  <div
                    className={`font-bold mt-0.5 ${
                      dev.sensors.reedSwitch === 'OPEN' ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {dev.sensors.reedSwitch}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase">Light</div>
                  <div className="font-bold text-slate-200 mt-0.5">{dev.sensors.lightLux} Lux</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase">Temp</div>
                  <div className="font-bold text-slate-200 mt-0.5">{dev.sensors.temperatureCelsius}°C</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                <span>Battery: {dev.batteryLevel}%</span>
                <span>FW: {dev.firmwareVersion}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 3. SECURITY POLICIES VIEW
// ----------------------------------------------------
interface SecurityPoliciesViewProps {
  policies?: any[];
}

export const SecurityPoliciesView: React.FC<SecurityPoliciesViewProps> = ({ policies = [] }) => {
  const samplePolicies = [
    {
      id: 'POL-001',
      code: 'POL-TIME-WINDOW',
      title: 'Operating Hour Access Control Policy',
      description: 'Confidential examination papers may strictly only be accessed between 08:00 and 19:00 UTC.',
      enforcementLayer: 'IAM & API Gateway Middleware',
      triggerCondition: 'Access attempt outside 08:00-19:00 UTC',
      automatedAction: 'Access Denied & High Severity Anomaly Alert Generated',
      status: 'ENFORCED',
    },
    {
      id: 'POL-002',
      code: 'POL-GEOFENCE-CORRIDOR',
      title: '2.0 km Armored Transit Corridor Tolerance',
      description: 'Armored logistics carriers transporting sealed paper boxes must remain within 2.0 km of the authorized geofence corridor.',
      enforcementLayer: 'IoT Telemetry Ingestion Daemon',
      triggerCondition: 'Haversine distance > 2.0 km from authorized waypoints',
      automatedAction: 'SOC Route Departure Alarm & Transit Halt Triggered',
      status: 'ENFORCED',
    },
    {
      id: 'POL-003',
      code: 'POL-SEAL-TAMPER',
      title: 'Instant Magnetic Reed Switch Tamper Lock',
      description: 'Physical breach of container seals during unauthorized transit immediately triggers cryptographic lockdown.',
      enforcementLayer: 'Embedded Hardware & Cryptographic Enclave',
      triggerCondition: 'Reed switch == OPEN or Light > 100 Lux in transit',
      automatedAction: 'Container Tamper Locked & Blockchain Flag Committed',
      status: 'ENFORCED',
    },
    {
      id: 'POL-004',
      code: 'POL-MULTI-SIGNATURE',
      title: 'Dual-Custody Two-Party Handover Protocol',
      description: 'Handover of examination packages requires verified digital signatures from both the Dispatching Officer and Receiving Superintendent.',
      enforcementLayer: 'Smart Contract / Blockchain Consensus',
      triggerCondition: 'Single-party unilateral handover attempt',
      automatedAction: 'Transaction Rejected & Non-Repudiation Alert Logged',
      status: 'ENFORCED',
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-blue-400">
          <Lock className="w-3.5 h-3.5" />
          <span>ZERO-TRUST GOVERNANCE & AUTONOMOUS POLICY ENFORCEMENT</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight mt-1 font-heading">
          Security Policies & Enforcement Rules
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Active security policies evaluated in real-time by edge sensor daemons, API gateways, and smart contract consensus.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {samplePolicies.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-400">{p.code}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {p.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white font-heading">{p.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">{p.description}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px] font-mono text-slate-300">
              <div className="text-slate-500">TRIGGER: <span className="text-slate-300">{p.triggerCondition}</span></div>
              <div className="text-slate-500">ACTION: <span className="text-amber-400">{p.automatedAction}</span></div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                Layer: {p.enforcementLayer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 4. QUESTION BANK VIEW
// ----------------------------------------------------
interface QuestionBankViewProps {
  questions: Question[];
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({ questions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  const filtered = questions.filter((q) => {
    const matchesSearch =
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSub = selectedSubject === 'ALL' || q.subject === selectedSubject;
    return matchesSearch && matchesSub;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-purple-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span>NATIONAL CONFIDENTIAL QUESTION BANK REPOSITORY</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1 font-heading">
            Protected Question Bank & Topics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Subject-categorized question bank with confidential tags, marks allocation, and AI duplicate detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Biology">Biology</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.slice(0, 20).map((q) => (
          <div
            key={q.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3 flex flex-col justify-between text-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-purple-400">{q.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  {q.subject} • {q.difficulty}
                </span>
              </div>

              <div className="font-bold text-slate-200">{q.topic}</div>
              <p className="text-slate-300 leading-relaxed font-sans">{q.text}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 font-mono text-[10px] text-slate-400">
              <span>Marks: {q.marks}</span>
              <span className="text-amber-400 font-bold">{q.confidentiality}</span>
              <span>Author: {q.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 5. AUDIT TRAIL VIEW
// ----------------------------------------------------
interface AuditTrailViewProps {
  auditLogs: AuditLog[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = auditLogs.filter((log) => {
    const q = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      (log.userName && log.userName.toLowerCase().includes(q)) ||
      (log.userRole && log.userRole.toLowerCase().includes(q)) ||
      (log.location && log.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-blue-400">
            <FileText className="w-3.5 h-3.5" />
            <span>SOVEREIGN IMMUTABLE SECURITY AUDIT TRAIL</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1 font-heading">
            Audit Logs & Historical Evidence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Every authentication, paper approval, seal application, and corridor alert generates a non-repudiable audit event.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 pl-9 pr-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 font-mono text-[10px] text-slate-400 uppercase">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor & Role</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Location / IP</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.slice(0, 40).map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-200">{log.userName || log.actorName || 'System'}</div>
                    <div className="text-[10px] font-mono text-slate-400">{log.userRole || log.actorRole}</div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300 font-bold">{log.action}</td>
                  <td className="p-3.5 text-slate-400 text-[11px]">
                    <div>{log.location || 'Command HQ'}</div>
                    <div className="text-[10px] font-mono text-slate-500">{log.ipAddress}</div>
                  </td>
                  <td className="p-3.5 text-right font-mono">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'DENIED' || log.status === 'FLAGGED'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {log.status || 'SUCCESS'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
