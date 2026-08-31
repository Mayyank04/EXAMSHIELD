import { Permission, User, UserRole } from '../types/index.ts';

// Complete RBAC Permission Matrix for all 8 Primary + 3 Secondary Roles
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'paper:create',
    'paper:read',
    'paper:approve',
    'paper:seal',
    'paper:verify',
    'paper:tamper',
    'transport:view',
    'transport:manage',
    'incident:view',
    'incident:create',
    'incident:resolve',
    'evidence:read',
    'evidence:upload',
    'policy:manage',
    'audit:read',
    'simulation:run',
    'admin:manage',
  ],
  EXAM_AUTHORITY: [
    'paper:create',
    'paper:read',
    'paper:approve',
    'paper:verify',
    'paper:tamper',
    'transport:view',
    'incident:view',
    'evidence:read',
    'audit:read',
    'simulation:run',
  ],
  SECURITY_OFFICER: [
    'paper:read',
    'paper:seal',
    'paper:verify',
    'paper:tamper',
    'transport:view',
    'transport:manage',
    'incident:view',
    'incident:create',
    'incident:resolve',
    'evidence:read',
    'evidence:upload',
    'policy:manage',
    'audit:read',
    'simulation:run',
  ],
  TRANSPORT_OFFICER: [
    'paper:read',
    'transport:view',
    'transport:manage',
    'incident:view',
    'incident:create',
    'simulation:run',
  ],
  INVESTIGATOR: [
    'paper:read',
    'paper:verify',
    'transport:view',
    'incident:view',
    'incident:create',
    'incident:resolve',
    'evidence:read',
    'evidence:upload',
    'audit:read',
    'simulation:run',
  ],
  CENTRE_SUPERINTENDENT: [
    'paper:read',
    'paper:verify',
    'transport:view',
    'transport:manage',
    'incident:view',
    'incident:create',
    'evidence:read',
  ],
  AUDITOR: [
    'paper:read',
    'paper:verify',
    'transport:view',
    'incident:view',
    'evidence:read',
    'audit:read',
  ],
  VIEW_ONLY: [
    'paper:read',
    'paper:verify',
    'transport:view',
    'incident:view',
    'audit:read',
  ],
  PAPER_MANAGER: [
    'paper:create',
    'paper:read',
    'paper:verify',
  ],
  PRINTING_OFFICER: [
    'paper:read',
    'paper:seal',
    'paper:verify',
  ],
  STORAGE_OFFICER: [
    'paper:read',
    'paper:seal',
    'paper:verify',
  ],
};

export const ROLE_METADATA: Record<
  UserRole,
  { title: string; badge: string; description: string; color: string }
> = {
  SUPER_ADMIN: {
    title: 'Director General / Super Administrator',
    badge: 'HQ-DIR-01',
    description: 'Full sovereign command across cryptography, logistics, AI security, and policies.',
    color: 'border-blue-500/40 text-blue-400 bg-blue-950/30',
  },
  EXAM_AUTHORITY: {
    title: 'Examination Formulation Authority',
    badge: 'AUTH-CONF-14',
    description: 'Authorized question formulation, cryptographic signing, and paper approval.',
    color: 'border-purple-500/40 text-purple-400 bg-purple-950/30',
  },
  SECURITY_OFFICER: {
    title: 'Physical & Cyber Operations Officer',
    badge: 'SEC-OPS-89',
    description: 'Manages electronic seals, sensor telemetry, and security incident response.',
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30',
  },
  TRANSPORT_OFFICER: {
    title: 'Armored Fleet & Logistics Officer',
    badge: 'LOG-FLEET-302',
    description: 'Supervises geofenced transport transit and custodial package handover.',
    color: 'border-amber-500/40 text-amber-400 bg-amber-950/30',
  },
  INVESTIGATOR: {
    title: 'Forensic Intelligence & Threat Investigator',
    badge: 'INV-FORENSIC-55',
    description: 'Drives cyber incident analysis, evidence preservation, and threat graphs.',
    color: 'border-rose-500/40 text-rose-400 bg-rose-950/30',
  },
  CENTRE_SUPERINTENDENT: {
    title: 'Exam Centre Superintendent',
    badge: 'CENTRE-SUP-101',
    description: 'Authorizes physical centre strongroom intake and two-party receipt validation.',
    color: 'border-teal-500/40 text-teal-400 bg-teal-950/30',
  },
  AUDITOR: {
    title: 'Independent Cryptographic Auditor',
    badge: 'AUDIT-LEGAL-07',
    description: 'Performs non-repudiation ledger verification and compliance tracking.',
    color: 'border-indigo-500/40 text-indigo-400 bg-indigo-950/30',
  },
  VIEW_ONLY: {
    title: 'Observer / Read-Only Telemetry Monitor',
    badge: 'OBSERVER-00',
    description: 'Read-only visibility for external observers and mock simulation sessions.',
    color: 'border-slate-500/40 text-slate-400 bg-slate-900/40',
  },
  PAPER_MANAGER: {
    title: 'Question Paper Lifecycle Manager',
    badge: 'PAP-MGR-02',
    description: 'Manages draft generation and syllabus distribution.',
    color: 'border-sky-500/40 text-sky-400 bg-sky-950/30',
  },
  PRINTING_OFFICER: {
    title: 'Government Security Printing Officer',
    badge: 'PRT-OFF-11',
    description: 'Oversees serialized secure printing and tamper packaging.',
    color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30',
  },
  STORAGE_OFFICER: {
    title: 'Strongroom Vault Custodian',
    badge: 'VAULT-CUST-44',
    description: 'Manages Faraday-caged physical storage and biometric lockers.',
    color: 'border-slate-500/40 text-slate-400 bg-slate-950/30',
  },
};

export class AuthService {
  public static hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  public static canManageTransports(user: User): boolean {
    return this.hasPermission(user.role, 'transport:manage');
  }

  public static canSealPackages(user: User): boolean {
    return this.hasPermission(user.role, 'paper:seal');
  }

  public static canResolveIncidents(user: User): boolean {
    return this.hasPermission(user.role, 'incident:resolve');
  }

  public static canRunSimulations(user: User): boolean {
    return this.hasPermission(user.role, 'simulation:run');
  }
}
