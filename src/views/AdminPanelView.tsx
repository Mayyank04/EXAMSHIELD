import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Cpu,
  Database,
  Download,
  Edit,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  Fingerprint,
  Flame,
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
  XCircle,
  Zap,
} from 'lucide-react';
import { StepUpAuthModal } from '../components/StepUpAuthModal.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { ROLE_METADATA } from '../services/authService.ts';
import {
  computeSecurityHealthScore,
  ENTERPRISE_ROLE_PERMISSIONS,
  evaluatePasswordSecurity,
  generateBackupRecoveryCodes,
  generateBase32Secret,
  SessionManager,
} from '../services/securityService.ts';
import {
  ActiveSession,
  Alert,
  AuditLog,
  BackupCodeItem,
  EmergencyLockdownState,
  ExamCentre,
  IoTDevice,
  Permission,
  SecurityAlertItem,
  SecurityHealthCheck,
  SecurityHealthPosture,
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
  onNavigateToIncidents?: () => void;
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
  onNavigateToIncidents,
}) => {
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'USERS' | 'PERMISSIONS' | 'SESSIONS' | 'ALERTS' | 'POLICIES' | 'AUDIT'
  >('OVERVIEW');

  // Emergency Lockdown State
  const [lockdownState, setLockdownState] = useState<EmergencyLockdownState>({
    isActive: false,
    reason: '',
    startedAt: undefined,
    startedBy: undefined,
    affectedModules: ['Question Paper Dispatch', 'Container Seal Override', 'Bulk Export'],
  });

  // Step-Up Auth Modal State
  const [stepUpModal, setStepUpModal] = useState<{
    isOpen: boolean;
    actionTitle: string;
    actionDescription: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    actionTitle: '',
    actionDescription: '',
    onConfirm: () => {},
  });

  // Health Score Modal
  const [showHealthModal, setShowHealthModal] = useState(false);

  // User Management State
  const [usersList, setUsersList] = useState<User[]>(availableUsers);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<User | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [showRoleEditModal, setShowRoleEditModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });
  const [selectedNewRole, setSelectedNewRole] = useState<UserRole>('SECURITY_OFFICER');

  // Active Sessions State
  const [sessionsList, setSessionsList] = useState<ActiveSession[]>(SessionManager.getSessions());

  // Security Alerts State
  const [alertsList, setAlertsList] = useState<SecurityAlertItem[]>([
    {
      id: 'ALT-SEC-01',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      severity: 'CRITICAL',
      title: 'Repeated Failed Authentication Anomaly',
      description: '5 consecutive failed credential attempts detected on Regional Archival Terminal.',
      category: 'AUTHENTICATION',
      actor: 'Officer Pradeep Mathur (USR-382)',
      relatedUser: 'USR-382',
      status: 'OPEN',
    },
    {
      id: 'ALT-SEC-02',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      severity: 'HIGH',
      title: 'Geofence Distance Threshold Deviation',
      description: 'Transit Vehicle #14 tracking beacon is 2.4 km outside the approved Haversine corridor.',
      category: 'TAMPER',
      actor: 'Armored Convoy #14',
      status: 'INVESTIGATING',
      incidentId: 'INC-2026-0042',
    },
    {
      id: 'ALT-SEC-03',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      severity: 'MEDIUM',
      title: 'New Hardware Footprint Authentication',
      description: 'Administrative terminal session initiated from unregistered Chrome/macOS browser profile.',
      category: 'DEVICE',
      actor: 'Meenakshi Iyer',
      relatedUser: 'USR-005',
      status: 'ACKNOWLEDGED',
    },
  ]);

  // Security Policy State
  const [policyToggles, setPolicyToggles] = useState({
    enforceMfaAllUsers: true,
    requireMfaForSensitiveActions: true,
    maxFailedAttemptsLock: 3,
    autoExpireInactiveSessions: true,
    sessionTimeoutMinutes: 30,
    continuousLedgerIntegrityScan: true,
    autoQuarantineOnTamper: true,
    quantumResistantSigning: true,
    logAllPaperViewsAndDownloads: true,
  });

  // Audit Logs State & Integrity
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [auditResultFilter, setAuditResultFilter] = useState('ALL');
  const [auditIntegrityStatus, setAuditIntegrityStatus] = useState<string | null>(null);

  // Compute live security health score
  const posture: SecurityHealthPosture = computeSecurityHealthScore(
    usersList,
    sessionsList,
    alertsList,
    metrics?.chainIntegrityValid ?? true,
    lockdownState.isActive
  );

  // Handlers
  const handleToggleLockdown = () => {
    if (!lockdownState.isActive) {
      setStepUpModal({
        isOpen: true,
        actionTitle: 'Activate Sovereign Emergency Security Lockdown',
        actionDescription:
          'Restricts all question paper downloads, printing, container dispatch, and role changes. Requires super-admin confirmation.',
        onConfirm: () => {
          setLockdownState({
            isActive: true,
            reason: 'National Security Command Threat Mitigation Protocol Activated',
            startedAt: new Date().toISOString(),
            startedBy: currentUser.name,
            affectedModules: ['Question Paper Dispatch', 'Container Seal Override', 'Bulk Export', 'Role Administration'],
          });
        },
      });
    } else {
      setStepUpModal({
        isOpen: true,
        actionTitle: 'Deactivate Emergency Security Lockdown',
        actionDescription: 'Restores standard zero-trust baseline operations. Requires identity verification.',
        onConfirm: () => {
          setLockdownState({
            isActive: false,
            reason: '',
            startedAt: undefined,
            startedBy: undefined,
            affectedModules: [],
          });
        },
      });
    }
  };

  const handleToggleUserStatus = (user: User) => {
    setStepUpModal({
      isOpen: true,
      actionTitle: `${user.status === 'ACTIVE' ? 'Suspend' : 'Activate'} Institutional Account`,
      actionDescription: `Modify account access status for ${user.name} (${user.id}).`,
      onConfirm: () => {
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }
              : u
          )
        );
        if (selectedUserForProfile?.id === user.id) {
          setSelectedUserForProfile((prev) =>
            prev ? { ...prev, status: prev.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : null
          );
        }
      },
    });
  };

  const handleResetUserMfa = (user: User) => {
    setStepUpModal({
      isOpen: true,
      actionTitle: `Reset MFA Configuration for ${user.name}`,
      actionDescription: 'Invalidates existing TOTP secret and generates a fresh setup challenge.',
      onConfirm: () => {
        alert(`MFA configuration reset for ${user.name}. An activation challenge has been dispatched.`);
      },
    });
  };

  const handleRevokeSession = (sessionId: string) => {
    SessionManager.revokeSession(sessionId);
    setSessionsList(SessionManager.getSessions());
  };

  const handleRevokeAllSessions = () => {
    setStepUpModal({
      isOpen: true,
      actionTitle: 'Revoke All Remote Terminal Sessions',
      actionDescription: 'Terminates all active sessions except your current authenticated browser.',
      onConfirm: () => {
        SessionManager.revokeAllOtherSessions(currentUser.id);
        setSessionsList(SessionManager.getSessions());
      },
    });
  };

  const handleVerifyAuditChain = () => {
    setAuditIntegrityStatus('VERIFYING');
    setTimeout(() => {
      setAuditIntegrityStatus('VERIFIED');
    }, 500);
  };

  // Filtered lists
  const filteredUsers = usersList.filter((u) => {
    const q = userSearchTerm.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.badgeNumber.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q);
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    const q = auditSearchTerm.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(q) ||
      (log.actorName || log.userName || '').toLowerCase().includes(q) ||
      (log.resourceType || '').toLowerCase().includes(q);
    const matchesResult =
      auditResultFilter === 'ALL' ||
      (auditResultFilter === 'SUCCESS' && log.status === 'SUCCESS') ||
      (auditResultFilter === 'DENIED' && log.status === 'DENIED');
    return matchesSearch && matchesResult;
  });

  const coreRolesList: UserRole[] = [
    'SUPER_ADMIN',
    'SECURITY_ADMIN',
    'EXAM_CONTROLLER',
    'SECURITY_OFFICER',
    'INVESTIGATOR',
    'AUDITOR',
    'OPERATOR',
    'VIEWER',
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Emergency Lockdown Banner if Active */}
      {lockdownState.isActive && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm font-heading flex items-center gap-2">
                <span>EMERGENCY SECURITY LOCKDOWN ACTIVE</span>
                <span className="text-[10px] font-mono bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                  DEFCON 1
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-0.5">
                {lockdownState.reason} • Initiated by <strong>{lockdownState.startedBy}</strong> at{' '}
                {new Date(lockdownState.startedAt || '').toLocaleTimeString()}
              </p>
            </div>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleToggleLockdown}
            className="shrink-0"
          >
            Deactivate Lockdown
          </Button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <ShieldCheck className="w-4 h-4" />
            <span>NATIONAL SECURITY COMMAND & GOVERNANCE</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            Security Command Center & Admin Panel
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Zero-trust identity management, active session governance, RBAC permissions, and real-time security posture.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={lockdownState.isActive ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleToggleLockdown}
            className="text-xs font-semibold"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{lockdownState.isActive ? 'Lockdown Active' : 'Emergency Lockdown'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh State</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1 rounded-2xl bg-slate-100/90 border border-slate-200 text-xs font-semibold overflow-x-auto scrollbar-thin">
        {[
          { id: 'OVERVIEW', label: 'Security Posture', icon: Activity },
          { id: 'USERS', label: 'Users & Roles', icon: Users },
          { id: 'PERMISSIONS', label: 'Permissions Matrix', icon: KeyRound },
          { id: 'SESSIONS', label: `Active Sessions (${sessionsList.length})`, icon: Smartphone },
          { id: 'ALERTS', label: `Security Alerts (${alertsList.length})`, icon: Bell },
          { id: 'POLICIES', label: 'Security Policies', icon: Lock },
          { id: 'AUDIT', label: 'Audit Trail', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 text-center whitespace-nowrap ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* TAB 1: SECURITY POSTURE (OVERVIEW) */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {/* Security Posture Card */}
            <Card
              onClick={() => setShowHealthModal(true)}
              className="p-4 border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition cursor-pointer space-y-1 col-span-2 sm:col-span-1"
            >
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Security Score</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-heading text-indigo-600">{posture.overallScore}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-700">{posture.rating}</div>
            </Card>

            <Card className="p-4 border-slate-200 bg-white space-y-1">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">MFA Coverage</div>
              <div className="text-2xl font-bold font-heading text-slate-900">{posture.mfaCoveragePercent}%</div>
              <div className="text-[10px] text-indigo-600 font-medium">TOTP / Hardware</div>
            </Card>

            <Card className="p-4 border-slate-200 bg-white space-y-1">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Active Sessions</div>
              <div className="text-2xl font-bold font-heading text-slate-900">{sessionsList.length}</div>
              <div className="text-[10px] text-slate-500">Live Terminals</div>
            </Card>

            <Card className="p-4 border-slate-200 bg-white space-y-1">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Failed Logins</div>
              <div className="text-2xl font-bold font-heading text-amber-600">2</div>
              <div className="text-[10px] text-slate-500">Last 24 Hours</div>
            </Card>

            <Card className="p-4 border-slate-200 bg-white space-y-1">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Locked Users</div>
              <div className="text-2xl font-bold font-heading text-rose-600">1</div>
              <div className="text-[10px] text-slate-500">Quarantine Gate</div>
            </Card>

            <Card className="p-4 border-slate-200 bg-white space-y-1">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Open Incidents</div>
              <div className="text-2xl font-bold font-heading text-slate-900">3</div>
              <div className="text-[10px] text-rose-600 font-medium">1 Critical</div>
            </Card>

            <Card className="p-4 border-slate-200 bg-white space-y-1">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Ledger Height</div>
              <div className="text-2xl font-bold font-heading text-slate-900">#{metrics?.blockchainHeight || 142}</div>
              <div className="text-[10px] text-emerald-600 font-medium">Merkle Root Intact</div>
            </Card>
          </div>

          {/* Middle: Posture Breakdown & Recent Admin Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Security Posture Checks (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-heading">
                      Security Posture Health Breakdown
                    </h3>
                    <p className="text-xs text-slate-500">Calculated from live institutional controls</p>
                  </div>
                  <button
                    onClick={() => setShowHealthModal(true)}
                    className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    View All Checks →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {posture.checks.map((check) => (
                    <div
                      key={check.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {check.status === 'PASS' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : check.status === 'WARN' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{check.name}</div>
                          <div className="text-[11px] text-slate-500">{check.description}</div>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          check.status === 'PASS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : check.status === 'WARN'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        +{check.score} PTS
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right: Recent Admin Activity Timeline (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    Recent Administrative Actions
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Live Stream</span>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    { time: '21:31', action: 'MFA Policy Reconfigured', actor: 'Dr. Rajeshwar Sharma', status: 'SUCCESS' },
                    { time: '21:24', action: 'User Suspended (USR-382)', actor: 'Col. Amitav Verma', status: 'FLAGGED' },
                    { time: '21:18', action: 'Question Paper Sealed (PAP-001)', actor: 'Prof. Ananya Sen', status: 'SUCCESS' },
                    { time: '21:05', action: 'Remote Session Revoked', actor: 'System Auto-Defense', status: 'SUCCESS' },
                  ].map((act, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{act.action}</span>
                        <span className="font-mono text-[10px] text-slate-500">{act.time}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>By {act.actor}</span>
                        <span className="font-mono text-[10px] font-bold text-emerald-700">{act.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* TAB 2: USERS & ROLES */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === 'USERS' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Search & Filter Toolbar */}
          <Card className="p-4 border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user name, email, badge, or ID..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                {coreRolesList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <strong>{filteredUsers.length}</strong> of {usersList.length} officers
            </div>
          </Card>

          {/* Users Table */}
          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Officer Identity</th>
                    <th className="py-3.5 px-4">Role & Badge</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">MFA State</th>
                    <th className="py-3.5 px-4">Last Activity</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredUsers.map((user) => {
                    const isLocked = user.status === 'LOCKED';
                    const isSuspended = user.status === 'SUSPENDED';

                    return (
                      <tr
                        key={user.id}
                        onClick={() => setSelectedUserForProfile(user)}
                        className="hover:bg-indigo-50/30 transition cursor-pointer group"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-[11px] text-slate-500">{user.email}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {user.role}
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {user.badgeNumber}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isLocked
                                ? 'bg-rose-100 text-rose-800'
                                : isSuspended
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              user.mfaEnabled
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {user.mfaEnabled ? '✓ TOTP ACTIVE' : 'DISABLED'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Active Now'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedNewRole(user.role);
                                setShowRoleEditModal({ isOpen: true, user });
                              }}
                              className="text-[11px] h-7 px-2"
                            >
                              Role
                            </Button>
                            <Button
                              variant={user.status === 'ACTIVE' ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => handleToggleUserStatus(user)}
                              className="text-[11px] h-7 px-2"
                            >
                              {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* TAB 3: ROLES & PERMISSIONS MATRIX */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === 'PERMISSIONS' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Zero-Trust Role-Based Access Control (RBAC) Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Defines fine-grained operational permissions across all 8 institutional roles.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                8 Active Roles
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3">System Permission</th>
                    {coreRolesList.map((r) => (
                      <th key={r} className="py-3 px-2 text-center">
                        {r.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {[
                    { id: 'manage_users', name: 'User Account Administration' },
                    { id: 'manage_roles', name: 'Role Assignment & Escalation' },
                    { id: 'manage_policies', name: 'Security Policy Configuration' },
                    { id: 'manage_mfa', name: 'MFA & Biometric Management' },
                    { id: 'view_audit_logs', name: 'Immutable Audit Log Inspection' },
                    { id: 'author_papers', name: 'Question Formulation & Signing' },
                    { id: 'verify_papers', name: 'FIPS 180-4 Hash Verification' },
                    { id: 'manage_logistics', name: 'Armored Transit Dispatch' },
                    { id: 'execute_handover', name: 'Two-Party Consensus Handover' },
                    { id: 'manage_incidents', name: 'Investigation Room Triaging' },
                    { id: 'emergency_lockdown', name: 'Emergency Lockdown Authority' },
                    { id: 'break_glass', name: 'Break-Glass Emergency Override' },
                  ].map((perm) => (
                    <tr key={perm.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {perm.name}
                        <div className="text-[10px] text-slate-400 font-mono">{perm.id}</div>
                      </td>
                      {coreRolesList.map((role) => {
                        const hasPerm = ENTERPRISE_ROLE_PERMISSIONS[role]?.includes(perm.id as any);
                        return (
                          <td key={role} className="py-3 px-2 text-center">
                            {hasPerm ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-300 text-xs">
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* TAB 4: ACTIVE SESSIONS */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === 'SESSIONS' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <Card className="p-4 border-slate-200 bg-white shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Active Authenticated Terminal Sessions
              </h3>
              <p className="text-xs text-slate-500">
                Manage live operator sessions with instant remote revocation capability.
              </p>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleRevokeAllSessions}
              className="text-xs font-semibold"
            >
              Revoke All Other Sessions
            </Button>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessionsList.map((session) => (
              <Card
                key={session.id}
                className={`p-5 border bg-white flex flex-col justify-between space-y-3 ${
                  session.isCurrentSession
                    ? 'border-indigo-400 ring-2 ring-indigo-500/10 shadow-sm'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-xs text-slate-900">{session.device}</span>
                    </div>

                    {session.isCurrentSession ? (
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        CURRENT SESSION
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-700">
                        REMOTE
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                    <div>Officer: <strong className="text-slate-900">{session.userName}</strong></div>
                    <div>Role: <strong className="text-indigo-700">{session.role}</strong></div>
                    <div>Browser: <strong className="text-slate-900">{session.browser}</strong></div>
                    <div>IP: <strong className="text-slate-900 font-mono">{session.ipAddress}</strong></div>
                    <div className="col-span-2">Location: <strong className="text-slate-900">{session.location}</strong></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Login: {new Date(session.loginTime).toLocaleTimeString()}
                  </span>

                  {!session.isCurrentSession && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                    >
                      Revoke Session
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* TAB 5: SECURITY ALERTS */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === 'ALERTS' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Security Alerts & Automated Threat Intercepts
                </h3>
                <p className="text-xs text-slate-500">Live operational alerts triaged across physical and cyber vectors.</p>
              </div>

              <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                {alertsList.filter((a) => a.status === 'OPEN').length} Open Threats
              </span>
            </div>

            <div className="space-y-3">
              {alertsList.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border space-y-2 text-xs ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-50/70 border-rose-300'
                      : alert.severity === 'HIGH'
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertOctagon
                        className={`w-4 h-4 ${
                          alert.severity === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600'
                        }`}
                      />
                      <span className="font-bold text-slate-900 text-sm">{alert.title}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-rose-200/80 text-rose-900'
                          : 'bg-amber-200/80 text-amber-900'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>

                  <p className="text-slate-700 font-sans">{alert.description}</p>

                  <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                    <span>
                      Actor: <strong>{alert.actor}</strong> • {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {onNavigateToIncidents && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onNavigateToIncidents}
                          className="text-xs"
                        >
                          Investigate Docket →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* TAB 6: SECURITY POLICIES */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === 'POLICIES' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  National Security Policy Configuration
                </h3>
                <p className="text-xs text-slate-500">
                  Enforces hardware biometrics, maximum authentication attempts, and automated tamper quarantines.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800">
                ACTIVE DEFENSE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                {
                  key: 'enforceMfaAllUsers',
                  title: 'Enforce MFA for All Institutional Users',
                  desc: 'Mandates 6-digit TOTP / Hardware key verification on every login.',
                },
                {
                  key: 'requireMfaForSensitiveActions',
                  title: 'Require Step-Up Auth for Elevated Actions',
                  desc: 'Requires re-authentication before role changes, exports, or lockdown.',
                },
                {
                  key: 'autoExpireInactiveSessions',
                  title: 'Auto-Expire Inactive Terminal Sessions (30m)',
                  desc: 'Terminates idle operator sessions automatically after inactivity window.',
                },
                {
                  key: 'autoQuarantineOnTamper',
                  title: 'Instant Container Lockdown on Sensor Tamper',
                  desc: 'Triggers electronic lock freeze upon optical or reed switch trigger.',
                },
                {
                  key: 'continuousLedgerIntegrityScan',
                  title: 'Continuous Merkle Root Integrity Heartbeat',
                  desc: 'Executes automated cryptographic parent-hash verification every 60s.',
                },
                {
                  key: 'quantumResistantSigning',
                  title: 'Quantum-Resistant Hash & Digital Signatures',
                  desc: 'Dual RSA-2048 and SHA-256 canonical hashing across all paper sets.',
                },
              ].map((item) => {
                const isEnabled = (policyToggles as any)[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() =>
                      setPolicyToggles((prev) => ({
                        ...prev,
                        [item.key]: !isEnabled,
                      }))
                    }
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="space-y-1 pr-3">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</div>
                    </div>

                    <button className="text-2xl shrink-0 cursor-pointer">
                      {isEnabled ? (
                        <span className="text-indigo-600 font-bold">● ON</span>
                      ) : (
                        <span className="text-slate-400 font-bold">○ OFF</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* TAB 7: IMMUTABLE AUDIT LOGS */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <Card className="p-4 border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search audit action, officer, or resource..."
                  value={auditSearchTerm}
                  onChange={(e) => setAuditSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={auditResultFilter}
                onChange={(e) => setAuditResultFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="ALL">All Outcomes</option>
                <option value="SUCCESS">Success Only</option>
                <option value="DENIED">Denied / Flagged</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleVerifyAuditChain}
              className="text-xs font-semibold"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>{auditIntegrityStatus === 'VERIFIED' ? '✓ Chain Verified' : 'Verify SHA-256 Audit Chain'}</span>
            </Button>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Officer / Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Resource Target</th>
                    <th className="py-3 px-4">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredAuditLogs.map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {log.actorName || log.userName || 'System'}
                      </td>
                      <td className="py-3 px-4 font-mono text-indigo-700 font-bold">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {log.resourceType || 'SECURITY_CORE'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
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
          </Card>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* USER SECURITY PROFILE DRAWER / MODAL */}
      {/* ---------------------------------------------------------------- */}
      {selectedUserForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    {selectedUserForProfile.name} • Security Profile
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedUserForProfile.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserForProfile(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Institutional Role</div>
                  <div className="font-bold text-indigo-700 mt-0.5">{selectedUserForProfile.role}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Account Status</div>
                  <div className="font-bold text-emerald-700 mt-0.5">{selectedUserForProfile.status}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Granted System Permissions:</div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(ENTERPRISE_ROLE_PERMISSIONS[selectedUserForProfile.role] || []).map((perm) => (
                    <span
                      key={perm}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-white border border-slate-200 text-slate-700"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResetUserMfa(selectedUserForProfile)}
                >
                  Reset MFA Secret
                </Button>
                <Button
                  variant={selectedUserForProfile.status === 'ACTIVE' ? 'destructive' : 'default'}
                  size="sm"
                  onClick={() => handleToggleUserStatus(selectedUserForProfile)}
                >
                  {selectedUserForProfile.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                </Button>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
              <Button variant="outline" size="sm" onClick={() => setSelectedUserForProfile(null)}>
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* ROLE MODIFICATION MODAL */}
      {/* ---------------------------------------------------------------- */}
      {showRoleEditModal.isOpen && showRoleEditModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    Modify Institutional Role
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">{showRoleEditModal.user.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRoleEditModal({ isOpen: false, user: null })}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select New Role:</label>
                <select
                  value={selectedNewRole}
                  onChange={(e) => setSelectedNewRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-slate-900 font-bold"
                >
                  {coreRolesList.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                {ROLE_METADATA[selectedNewRole]?.description}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoleEditModal({ isOpen: false, user: null })}
                >
                  Cancel
                </Button>
                <LiquidButton
                  variant="default"
                  size="default"
                  onClick={() => {
                    const targetUser = showRoleEditModal.user!;
                    setStepUpModal({
                      isOpen: true,
                      actionTitle: `Change Role for ${targetUser.name}`,
                      actionDescription: `Escalate or modify institutional role to ${selectedNewRole}.`,
                      onConfirm: () => {
                        setUsersList((prev) =>
                          prev.map((u) => (u.id === targetUser.id ? { ...u, role: selectedNewRole } : u))
                        );
                        setShowRoleEditModal({ isOpen: false, user: null });
                      },
                    });
                  }}
                >
                  Confirm Role Change
                </LiquidButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* SECURITY HEALTH DETAILS MODAL */}
      {/* ---------------------------------------------------------------- */}
      {showHealthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    Security Health & Controls Audit
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Posture Score: {posture.overallScore} / 100 ({posture.rating})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHealthModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 text-xs">
              {posture.checks.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        c.status === 'PASS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'WARN'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {c.status} (+{c.score} PTS)
                    </span>
                  </div>
                  <p className="text-slate-600">{c.description}</p>
                  {c.fixAction && (
                    <div className="text-[11px] text-indigo-600 font-medium">
                      Action: {c.fixAction}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
              <Button variant="outline" size="sm" onClick={() => setShowHealthModal(false)}>
                Close Audit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Step-Up Auth Modal */}
      <StepUpAuthModal
        isOpen={stepUpModal.isOpen}
        onClose={() => setStepUpModal((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={stepUpModal.onConfirm}
        actionTitle={stepUpModal.actionTitle}
        actionDescription={stepUpModal.actionDescription}
        currentUser={currentUser}
      />
    </div>
  );
};
