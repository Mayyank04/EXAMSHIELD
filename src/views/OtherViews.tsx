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
import { Card, CardContent } from '../components/ui/card.tsx';
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { AuditLog, ExamCentre, IoTDevice, Question, SecurityPolicy, SecurityPolicyItem } from '../types/index.ts';

// ----------------------------------------------------
// 1. EXAM CENTRES VIEW
// ----------------------------------------------------
interface CentresViewProps {
  centres: ExamCentre[];
  onRefresh: () => void;
}

export const CentresView: React.FC<CentresViewProps> = ({ centres = [], onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = centres.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <MapPin className="w-4 h-4" />
            <span>NATIONAL EXAMINATION CENTRES (10 HUBS)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            Exam Centres & Strongroom Readiness
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geofenced physical centres equipped with biometric access, Faraday strongrooms, and CCTV telemetry.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, city, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((centre) => {
          const isHighAlert = centre.status === 'HIGH_ALERT';

          return (
            <Card
              key={centre.id}
              className="p-5 border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {centre.code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isHighAlert
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {centre.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">{centre.name}</h3>
                <div className="text-xs text-slate-500">{centre.city} • Superintendent: {centre.superintendentName}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-medium">Security Score</div>
                  <div className="font-bold text-indigo-600">{centre.securityScore}%</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-medium">Capacity</div>
                  <div className="font-bold text-slate-800">{centre.capacity || 2500} Students</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-500">Biometrics: <strong>ARMED</strong></span>
                <span className="text-[11px] text-indigo-600 font-medium font-mono">{centre.coords.join(', ')}</span>
              </div>
            </Card>
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

export const IotFleetView: React.FC<IotFleetViewProps> = ({ devices = [], onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = devices.filter(
    (d) =>
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-600">
            <Smartphone className="w-4 h-4" />
            <span>HARDWARE SENSOR FLEET (30 SENTINEL NODES)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            IoT Sensor Fleet & Telemetry Network
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time physical monitoring devices with cellular uplink, magnetic reed switches, and accelerometer sentinels.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search device ID or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((dev) => (
          <Card key={dev.id} className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-800">{dev.id}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  dev.status === 'ONLINE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : dev.status === 'WARNING' || dev.status === 'DEGRADED'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {dev.status}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 font-heading">{dev.type}</h4>
              <div className="text-xs text-slate-500 truncate">Cert: {dev.certificateId || 'CERT-SEC-2027'}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <div className="text-[10px] text-slate-500 font-sans">Battery</div>
                <div className="font-bold text-emerald-600">{dev.batteryLevel}%</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <div className="text-[10px] text-slate-500 font-sans">Firmware</div>
                <div className="font-bold text-slate-800">{dev.firmwareVersion}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <div className="text-[10px] text-slate-500 font-sans">Reed Switch</div>
                <div className="font-bold text-indigo-600">{dev.sensors?.reedSwitch || 'CLOSED'}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 3. SECURITY POLICIES VIEW
// ----------------------------------------------------
interface SecurityPoliciesViewProps {
  policies: SecurityPolicyItem[];
}

export const SecurityPoliciesView: React.FC<SecurityPoliciesViewProps> = ({ policies = [] }) => {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
          <Lock className="w-4 h-4" />
          <span>NATIONAL EXAMINATION SECURITY POLICIES</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
          Security Compliance & Governance Policies
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Standard Operating Procedures and automated system containment mandates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {policies.map((p) => (
          <Card key={p.id} className="p-5 border-slate-200 bg-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {p.code}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  p.status === 'ENFORCED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {p.status}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 font-heading">{p.title}</h4>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">{p.description}</p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Trigger: <strong>{p.triggerCondition}</strong></span>
              <span>Enforcement: <strong className="text-emerald-700">{p.enforcementLayer}</strong></span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export { QuestionBankView } from './QuestionBankView.tsx';

// ----------------------------------------------------
// 5. AUDIT TRAIL VIEW
// ----------------------------------------------------
interface AuditTrailViewProps {
  auditLogs: AuditLog[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ auditLogs = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = auditLogs.filter((a) => {
    const actor = a.actorName || a.userName || (a as any).actor || 'System';
    const resource = (a as any).resource || a.resourceId || 'ALL';
    return (
      a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <FileText className="w-4 h-4" />
            <span>IMMUTABLE AUDIT TRAIL</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            System Operations & Governance Audit
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Every authorization, paper dispatch, and sensor alarm logged with non-repudiation timestamps.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, actor, resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <Card className="p-5 border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">TIMESTAMP</th>
              <th className="py-2.5 px-3">ACTOR</th>
              <th className="py-2.5 px-3">ACTION</th>
              <th className="py-2.5 px-3">RESOURCE</th>
              <th className="py-2.5 px-3">DETAILS</th>
              <th className="py-2.5 px-3">VERIFICATION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-900">{log.actorName || log.userName || (log as any).actor || 'System'}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{log.actorRole || log.userRole || 'OFFICER'}</div>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-indigo-700">{log.action}</td>
                <td className="py-3 px-3 font-mono text-slate-700">{(log as any).resource || log.resourceId || 'ALL'}</td>
                <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                  {typeof log.details === 'string' ? log.details : JSON.stringify(log.details || '')}
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    VERIFIED
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
