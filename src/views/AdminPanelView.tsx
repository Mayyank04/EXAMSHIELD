import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  Download,
  Edit,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  HardDrive,
  Key,
  KeyRound,
  Layers,
  Lock,
  Mail,
  MapPin,
  MoreHorizontal,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  Trash2,
  TrendingUp,
  Truck,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import {
  Alert,
  AuditLog,
  ExamCentre,
  IoTDevice,
  SecurityPolicyItem,
  SystemStats,
  User,
  UserRole,
} from '../types/index.ts';

interface AdminPanelViewProps {
  currentUser: User;
  availableUsers: User[];
  centres: ExamCentre[];
  devices: IoTDevice[];
  policies: SecurityPolicyItem[];
  auditLogs: AuditLog[];
  metrics: SystemStats | null;
  onRefresh: () => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  currentUser,
  availableUsers = [],
  centres = [],
  devices = [],
  policies = [],
  auditLogs = [],
  metrics,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'USERS' | 'PERMISSIONS' | 'POLICIES' | 'AUDIT' | 'CONFIG'
  >('OVERVIEW');

  // User Management State
  const [usersList, setUsersList] = useState<User[]>(
    availableUsers.length > 0
      ? availableUsers
      : [
          {
            id: 'USR-001',
            name: 'Dr. Rajeshwar Sharma',
            email: 'admin@examshield.local',
            role: 'SUPER_ADMIN',
            department: 'National Examination Security Command',
            badgeNumber: 'ESC-ADMIN-01',
            assignedCentreId: 'ALL',
            status: 'ACTIVE',
            mfaEnabled: true,
          },
          {
            id: 'USR-002',
            name: 'Col. Amitav Verma',
            email: 'amitav.verma@examshield.local',
            role: 'SECURITY_OFFICER',
            department: 'Armed Logistics & Escort Command',
            badgeNumber: 'ESC-SEC-02',
            assignedCentreId: 'DEL-01',
            status: 'ACTIVE',
            mfaEnabled: true,
          },
          {
            id: 'USR-003',
            name: 'Dr. Sunita Deshmukh',
            email: 'sunita.d@examshield.local',
            role: 'EXAM_AUTHORITY',
            department: 'Question Paper Confidential Cell',
            badgeNumber: 'ESC-EXAM-03',
            assignedCentreId: 'NOI-02',
            status: 'ACTIVE',
            mfaEnabled: true,
          },
          {
            id: 'USR-004',
            name: 'Rohan Banerjee',
            email: 'rohan.b@examshield.local',
            role: 'INVESTIGATOR',
            department: 'Cyber Forensics & Incident Triage',
            badgeNumber: 'ESC-INV-04',
            assignedCentreId: 'ALL',
            status: 'ACTIVE',
            mfaEnabled: true,
          },
          {
            id: 'USR-005',
            name: 'Pooja Iyer',
            email: 'pooja.i@examshield.local',
            role: 'AUDITOR',
            department: 'Independent Audit & Compliance',
            badgeNumber: 'ESC-AUD-05',
            assignedCentreId: 'ALL',
            status: 'ACTIVE',
            mfaEnabled: true,
          },
        ]
  );

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Audit Search & Filters
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [auditResultFilter, setAuditResultFilter] = useState('ALL');

  // System Configuration State
  const [sysConfig, setSysConfig] = useState({
    enforceMfaAllUsers: true,
    hardwareBiometricsStrongroom: true,
    realtimeGpsCorridorTracking: true,
    autoTriggerSetBFailover: true,
    quantumResistantHashing: true,
    smsOfficerAlerts: true,
    anomalyConfidenceThreshold: 85,
    auditRetentionMonths: 84,
  });

  const handleToggleUserStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }
          : u
      )
    );
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    setSelectedUser(null);
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredAuditLogs = (auditLogs.length > 0
    ? auditLogs
    : [
        {
          id: 'AUD-991',
          timestamp: new Date().toISOString(),
          actorName: 'Dr. Rajeshwar Sharma',
          actorRole: 'SUPER_ADMIN',
          action: 'DISPATCH_PACKAGE',
          resource: 'PKG-2026-SET-A-01',
          details: 'Smart Container electronic seal armed and corridor transit authorized.',
          ipAddress: '10.0.4.12',
          status: 'SUCCESS' as const,
        },
        {
          id: 'AUD-992',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          actorName: 'Col. Amitav Verma',
          actorRole: 'SECURITY_OFFICER',
          action: 'VERIFY_CUSTODY_HANDOVER',
          resource: 'PKG-2026-SET-A-02',
          details: 'Dual-officer cryptographic QR consensus verified at Noida Sector 62 Strongroom.',
          ipAddress: '10.0.12.8',
          status: 'SUCCESS' as const,
        },
        {
          id: 'AUD-993',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          actorName: 'Rohan Banerjee',
          actorRole: 'INVESTIGATOR',
          action: 'RESOLVE_INCIDENT',
          resource: 'ALT-CRIT-9921',
          details: 'Forensic inspection completed; physical seal intact, sensor recalibrated.',
          ipAddress: '10.0.8.4',
          status: 'SUCCESS' as const,
        },
      ]
  ).filter((log) => {
    const actor = log.actorName || log.userName || (log as any).actor || 'System';
    const resource = (log as any).resource || log.resourceId || 'ALL';
    const matchesSearch =
      log.action.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
      actor.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
      resource.toLowerCase().includes(auditSearchTerm.toLowerCase());
    const isVerified = log.status === 'SUCCESS' || (log as any).verified;
    const matchesResult =
      auditResultFilter === 'ALL' ||
      (auditResultFilter === 'VERIFIED' ? isVerified : !isVerified);
    return matchesSearch && matchesResult;
  });

  const permissionsMatrix = [
    { module: 'Question Papers', view: true, edit: true, delete: false, export: true },
    { module: 'Question Bank', view: true, edit: true, delete: false, export: true },
    { module: 'Smart Containers', view: true, edit: true, delete: false, export: true },
    { module: 'Armored Transit', view: true, edit: true, delete: false, export: true },
    { module: 'Security Incidents', view: true, edit: true, delete: false, export: true },
    { module: 'Audit Logs', view: true, edit: false, delete: false, export: true },
    { module: 'System Settings', view: true, edit: true, delete: true, export: false },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <ShieldCheck className="w-4 h-4" />
            <span>EXAMSHIELD ADMINISTRATION & GOVERNANCE</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            Admin Control Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-based access control, security policies, system configuration, and verifiable audit ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync System State</span>
          </Button>

          <div className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>FIPS 140-3 Compliant</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto scrollbar-none pb-px text-xs font-semibold text-slate-600">
        {[
          { id: 'OVERVIEW', label: 'Overview', icon: Activity },
          { id: 'USERS', label: 'Users & Roles', icon: Users },
          { id: 'PERMISSIONS', label: 'Permissions Matrix', icon: Key },
          { id: 'POLICIES', label: 'Security Policies', icon: Lock },
          { id: 'AUDIT', label: 'Audit Trail Logs', icon: FileText },
          { id: 'CONFIG', label: 'System Configuration', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 font-bold bg-indigo-50/40 rounded-t-lg'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key Administrative Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'System Health', val: '99.9%', sub: 'Zero Faults', icon: Cpu, color: 'text-emerald-600' },
              { label: 'Total Users', val: usersList.length.toString(), sub: '5 Roles', icon: Users, color: 'text-indigo-600' },
              { label: 'Active Sessions', val: '4 Online', sub: 'MFA Verified', icon: UserCheck, color: 'text-blue-600' },
              { label: 'Exam Centres', val: '10 Centres', sub: 'Faraday Armed', icon: MapPin, color: 'text-purple-600' },
              { label: 'IoT Fleet', val: '30 Nodes', sub: '29 Online', icon: Smartphone, color: 'text-teal-600' },
              { label: 'Open Incidents', val: '1 Active', sub: 'Under Triage', icon: AlertTriangle, color: 'text-amber-600' },
              { label: 'Audit Blocks', val: '142 Blocks', sub: 'Merkle Root Valid', icon: Layers, color: 'text-indigo-600' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className="p-4 border-slate-200 bg-white shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-medium uppercase">{stat.label}</span>
                    <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-heading">{stat.val}</div>
                  <div className="text-[10px] text-slate-500 font-medium">{stat.sub}</div>
                </Card>
              );
            })}
          </div>

          {/* Quick Admin Consoles Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 font-heading">Security Governance</h3>
                <span className="text-[10px] font-mono text-indigo-600 font-semibold">Live Policy Rules</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span>Mandatory Two-Party Handover</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">ENFORCED</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span>Corridor Geofence Lock (2.0km)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">ACTIVE</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span>Auto Set B Failover Trigger</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">ARMED</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('POLICIES')}
                className="w-full text-xs font-semibold"
              >
                Manage All Security Policies
              </Button>
            </Card>

            <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 font-heading">Hardware Sentinel Status</h3>
                <span className="text-[10px] font-mono text-emerald-600 font-semibold">99.4% Uptime</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Smart Container Reed Switches</span>
                  <span className="font-semibold text-slate-900">28/28 Armed</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Strongroom Biometric Relays</span>
                  <span className="font-semibold text-slate-900">10/10 Online</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Armored Logistics GPS Telemetry</span>
                  <span className="font-semibold text-slate-900">3/3 Live Streams</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600">Quantum Entropy Generator</span>
                  <span className="font-semibold text-emerald-600">Optimal</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('CONFIG')}
                className="w-full text-xs font-semibold"
              >
                Inspect Infrastructure Config
              </Button>
            </Card>

            <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 font-heading">Verifiable Compliance</h3>
                <span className="text-[10px] font-mono text-purple-600 font-semibold">Auditable</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                ExamShield enforces immutable Merkle hashing across all administrative and operational activities.
              </p>
              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs font-mono space-y-1">
                <div className="text-[10px] text-slate-500">Current Merkle Root:</div>
                <div className="text-xs font-bold text-indigo-700 truncate">
                  0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('AUDIT')}
                className="w-full text-xs font-semibold"
              >
                View Verifiable Audit Logs
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: USERS & ROLES */}
      {activeTab === 'USERS' && (
        <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users or badge..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 pl-8 pr-3 py-1.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs text-slate-800 focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="SECURITY_ADMIN">Security Admin</option>
                <option value="EXAM_ADMIN">Exam Admin</option>
                <option value="INVESTIGATOR">Investigator</option>
                <option value="AUDITOR">Auditor</option>
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Showing <strong>{filteredUsers.length}</strong> registered officers
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">OFFICER / USER</th>
                  <th className="py-2.5 px-3">ROLE</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">DEPARTMENT</th>
                  <th className="py-2.5 px-3">ASSIGNED SECTOR</th>
                  <th className="py-2.5 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{user.department}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono">{user.assignedCentreId}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] cursor-pointer"
                        >
                          Edit Role
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: PERMISSIONS MATRIX */}
      {activeTab === 'PERMISSIONS' && (
        <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Role-Based Access Control (RBAC) Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Granular permission enforcement across confidential examination lifecycle modules.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">MODULE</th>
                  <th className="py-2.5 px-3 text-center">VIEW</th>
                  <th className="py-2.5 px-3 text-center">EDIT</th>
                  <th className="py-2.5 px-3 text-center">DELETE</th>
                  <th className="py-2.5 px-3 text-center">EXPORT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsMatrix.map((perm, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-bold text-slate-900">{perm.module}</td>
                    <td className="py-3 px-3 text-center">
                      {perm.view ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {perm.edit ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {perm.delete ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {perm.export ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: SECURITY POLICIES */}
      {activeTab === 'POLICIES' && (
        <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Active Security Policies
            </h3>
            <p className="text-xs text-slate-500">
              National Examination Defense standards and automated containment triggers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Dual-Officer Consensus for Box Handover',
                desc: 'Requires both Transport Commander and Centre Superintendent to scan authenticated tokens simultaneously.',
                enabled: true,
              },
              {
                title: 'Instant Tamper Seal Auto-Lockdown',
                desc: 'Triggers hardware electronic lock freeze when magnetic reed switch opens outside verified geo-zone.',
                enabled: true,
              },
              {
                title: 'AI Semantic Leak Scan Interval (60s)',
                desc: 'Runs continuous TF-IDF and N-Gram matching against question bank dumps on public channels.',
                enabled: true,
              },
              {
                title: 'Set B Backup Automated Failover',
                desc: 'Activates secondary encrypted paper set B instantly when critical integrity mismatch is logged.',
                enabled: sysConfig.autoTriggerSetBFailover,
              },
            ].map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{p.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{p.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 5: AUDIT LOGS */}
      {activeTab === 'AUDIT' && (
        <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search audit actions or actor..."
                  value={auditSearchTerm}
                  onChange={(e) => setAuditSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 pl-8 pr-3 py-1.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={auditResultFilter}
                onChange={(e) => setAuditResultFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs text-slate-800 focus:outline-none"
              >
                <option value="ALL">All Results</option>
                <option value="VERIFIED">Verified Merkle Blocks</option>
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Showing <strong>{filteredAuditLogs.length}</strong> verifiable logs
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">TIMESTAMP</th>
                  <th className="py-2.5 px-3">ACTOR</th>
                  <th className="py-2.5 px-3">ACTION</th>
                  <th className="py-2.5 px-3">RESOURCE</th>
                  <th className="py-2.5 px-3">RESULT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{log.actorName || log.userName || (log as any).actor || 'System'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{log.actorRole || log.userRole || 'OFFICER'}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700">{log.action}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{log.resource}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        VERIFIED_HASH
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 6: SYSTEM CONFIGURATION */}
      {activeTab === 'CONFIG' && (
        <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              System & Security Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Zero-Trust parameters, telemetry thresholds, and cryptographic retention settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="font-bold text-slate-900">Authentication & Access</div>
              <div className="flex items-center justify-between">
                <span>Enforce Mandatory Hardware MFA</span>
                <input
                  type="checkbox"
                  checked={sysConfig.enforceMfaAllUsers}
                  onChange={(e) =>
                    setSysConfig({ ...sysConfig, enforceMfaAllUsers: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Strongroom Biometrics Interlock</span>
                <input
                  type="checkbox"
                  checked={sysConfig.hardwareBiometricsStrongroom}
                  onChange={(e) =>
                    setSysConfig({
                      ...sysConfig,
                      hardwareBiometricsStrongroom: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="font-bold text-slate-900">Logistics & Failover</div>
              <div className="flex items-center justify-between">
                <span>Real-Time GPS Corridor Tracking</span>
                <input
                  type="checkbox"
                  checked={sysConfig.realtimeGpsCorridorTracking}
                  onChange={(e) =>
                    setSysConfig({
                      ...sysConfig,
                      realtimeGpsCorridorTracking: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Automatic Paper Set B Failover</span>
                <input
                  type="checkbox"
                  checked={sysConfig.autoTriggerSetBFailover}
                  onChange={(e) =>
                    setSysConfig({
                      ...sysConfig,
                      autoTriggerSetBFailover: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Role Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    Modify Officer Role
                  </h3>
                  <p className="text-[11px] text-slate-500">{selectedUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Assign Role:</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => handleRoleChange(selectedUser.id, e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-slate-800 text-xs font-semibold"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="SECURITY_ADMIN">SECURITY_ADMIN</option>
                  <option value="EXAM_ADMIN">EXAM_ADMIN</option>
                  <option value="INVESTIGATOR">INVESTIGATOR</option>
                  <option value="AUDITOR">AUDITOR</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs leading-relaxed font-sans">
                Modifications to access roles are signed with the Super Admin's private key and logged to the immutable audit block.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    alert('Officer role updated successfully and committed to the ledger.');
                    setSelectedUser(null);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
