import { Permission, User, UserRole } from '../types/index.ts';
import { ENTERPRISE_ROLE_PERMISSIONS, ROUTE_PERMISSION_MAP } from './securityService.ts';

export const ROLE_PERMISSIONS = ENTERPRISE_ROLE_PERMISSIONS;

export const ROLE_METADATA: Record<
  UserRole,
  { title: string; badge: string; description: string; color: string }
> = {
  SUPER_ADMIN: {
    title: 'Director General / Super Administrator',
    badge: 'HQ-DIR-01',
    description: 'Full sovereign command across cryptography, logistics, AI security, and policies.',
    color: 'border-indigo-500/40 text-indigo-600 bg-indigo-50',
  },
  SECURITY_ADMIN: {
    title: 'National Security Administrator',
    badge: 'SEC-ADM-02',
    description: 'Full administrative control over user access, security policies, and incident response.',
    color: 'border-blue-500/40 text-blue-600 bg-blue-50',
  },
  EXAM_CONTROLLER: {
    title: 'Chief Examination Controller',
    badge: 'CTRL-EXAM-05',
    description: 'Direct authority over question papers, syllabus formulation, and logistics dispatch.',
    color: 'border-purple-500/40 text-purple-600 bg-purple-50',
  },
  SECURITY_OFFICER: {
    title: 'Physical & Cyber Operations Officer',
    badge: 'SEC-OPS-89',
    description: 'Manages electronic seals, sensor telemetry, and security incident response.',
    color: 'border-emerald-500/40 text-emerald-600 bg-emerald-50',
  },
  INVESTIGATOR: {
    title: 'Forensic Intelligence & Threat Investigator',
    badge: 'INV-FORENSIC-55',
    description: 'Drives cyber incident analysis, evidence preservation, and threat graphs.',
    color: 'border-rose-500/40 text-rose-600 bg-rose-50',
  },
  AUDITOR: {
    title: 'Independent Cryptographic Auditor',
    badge: 'AUDIT-LEGAL-07',
    description: 'Performs non-repudiation ledger verification and compliance tracking.',
    color: 'border-indigo-500/40 text-indigo-600 bg-indigo-50',
  },
  OPERATOR: {
    title: 'Security Enclave Operations Officer',
    badge: 'OPS-ENCLAVE-20',
    description: 'Monitors real-time telemetry feeds and executes authorized terminal actions.',
    color: 'border-slate-500/40 text-slate-700 bg-slate-100',
  },
  VIEWER: {
    title: 'Observer / Read-Only Telemetry Monitor',
    badge: 'OBSERVER-00',
    description: 'Read-only visibility for external observers and statutory audit review.',
    color: 'border-slate-300 text-slate-500 bg-slate-50',
  },
  // Legacy / Specialized Domain Mappings:
  EXAM_AUTHORITY: {
    title: 'Examination Formulation Authority',
    badge: 'AUTH-CONF-14',
    description: 'Authorized question formulation, cryptographic signing, and paper approval.',
    color: 'border-purple-500/40 text-purple-600 bg-purple-50',
  },
  TRANSPORT_OFFICER: {
    title: 'Armored Fleet & Logistics Officer',
    badge: 'LOG-FLEET-302',
    description: 'Supervises geofenced transport transit and custodial package handover.',
    color: 'border-amber-500/40 text-amber-700 bg-amber-50',
  },
  CENTRE_SUPERINTENDENT: {
    title: 'Exam Centre Superintendent',
    badge: 'CENTRE-SUP-101',
    description: 'Authorizes physical centre strongroom intake and two-party receipt validation.',
    color: 'border-teal-500/40 text-teal-600 bg-teal-50',
  },
  VIEW_ONLY: {
    title: 'Observer / Read-Only Telemetry Monitor',
    badge: 'OBSERVER-00',
    description: 'Read-only visibility for external observers and mock simulation sessions.',
    color: 'border-slate-300 text-slate-500 bg-slate-50',
  },
  PAPER_MANAGER: {
    title: 'Question Paper Lifecycle Manager',
    badge: 'PAP-MGR-02',
    description: 'Manages draft generation and syllabus distribution.',
    color: 'border-sky-500/40 text-sky-600 bg-sky-50',
  },
  PRINTING_OFFICER: {
    title: 'Government Security Printing Officer',
    badge: 'PRT-OFF-11',
    description: 'Oversees serialized secure printing and tamper packaging.',
    color: 'border-cyan-500/40 text-cyan-600 bg-cyan-50',
  },
  STORAGE_OFFICER: {
    title: 'Strongroom Vault Custodian',
    badge: 'VAULT-CUST-44',
    description: 'Manages Faraday-caged physical storage and biometric lockers.',
    color: 'border-slate-500/40 text-slate-600 bg-slate-100',
  },
};

export class AuthService {
  public static hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  public static isAuthorizedForRoute(role: UserRole, view: string): boolean {
    // Super admins & security admins can access everything
    if (role === 'SUPER_ADMIN' || role === 'SECURITY_ADMIN') return true;
    const requiredPermission = ROUTE_PERMISSION_MAP[view];
    if (!requiredPermission) return true; // public / general overview view
    return this.hasPermission(role, requiredPermission);
  }

  public static canManageUsers(user: User): boolean {
    return this.hasPermission(user.role, 'manage_users');
  }

  public static canManagePolicies(user: User): boolean {
    return this.hasPermission(user.role, 'manage_policies');
  }

  public static canManageTransports(user: User): boolean {
    return this.hasPermission(user.role, 'transport:manage') || this.hasPermission(user.role, 'manage_logistics');
  }

  public static canSealPackages(user: User): boolean {
    return this.hasPermission(user.role, 'paper:seal');
  }

  public static canResolveIncidents(user: User): boolean {
    return this.hasPermission(user.role, 'incident:resolve') || this.hasPermission(user.role, 'manage_incidents');
  }
}
