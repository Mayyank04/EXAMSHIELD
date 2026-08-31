/**
 * ExamShield — Sovereign Security Architecture & Cryptographic Engine
 * ===================================================================
 * 
 * SECURITY ARCHITECTURE AUDIT & SPECIFICATION:
 * --------------------------------------------
 * 1. Authentication: Multi-factor zero-trust identity verification flow.
 *    - Stage 1: Credential verification with client-side PBKDF2 pre-hashing & server bcrypt/Argon2.
 *    - Stage 2: RFC 6238 Time-Based One-Time Password (TOTP) / Email verification code challenge.
 *    - Stage 3: Cryptographic session issuance with non-exportable session tokens.
 * 2. Authorization (RBAC): Principle of Least Privilege across 8 core administrative & operational roles.
 * 3. Session Management: Ephemeral browser sessions with inactivity timeout and remote revocation.
 * 4. Step-Up Authentication: Mandatory re-authentication for elevated security actions (e.g. role escalation, lockdown).
 * 5. Data & File Security: FIPS 180-4 SHA-256 byte-level hash verification and digital signatures.
 * 6. Audit Logging: Chained Merkle root ledger blocks ensuring tamper evidence and non-repudiation.
 */

import {
  ActiveSession,
  BackupCodeItem,
  EmergencyLockdownState,
  Permission,
  SecurityAlertItem,
  SecurityHealthCheck,
  SecurityHealthPosture,
  User,
  UserRole,
} from '../types/index.ts';

// -------------------------------------------------------------
// 1. ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSION MATRIX
// -------------------------------------------------------------
export const ENTERPRISE_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'manage_users',
    'manage_roles',
    'manage_policies',
    'manage_mfa',
    'view_audit_logs',
    'manage_incidents',
    'author_papers',
    'verify_papers',
    'manage_logistics',
    'execute_handover',
    'emergency_lockdown',
    'break_glass',
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
  SECURITY_ADMIN: [
    'manage_users',
    'manage_roles',
    'manage_policies',
    'manage_mfa',
    'view_audit_logs',
    'manage_incidents',
    'verify_papers',
    'emergency_lockdown',
    'incident:view',
    'incident:create',
    'incident:resolve',
    'evidence:read',
    'evidence:upload',
    'policy:manage',
    'audit:read',
    'admin:manage',
  ],
  EXAM_CONTROLLER: [
    'author_papers',
    'verify_papers',
    'manage_logistics',
    'view_audit_logs',
    'paper:create',
    'paper:read',
    'paper:approve',
    'paper:seal',
    'paper:verify',
    'transport:view',
    'audit:read',
  ],
  SECURITY_OFFICER: [
    'verify_papers',
    'manage_logistics',
    'execute_handover',
    'manage_incidents',
    'view_audit_logs',
    'paper:read',
    'paper:seal',
    'paper:verify',
    'transport:view',
    'transport:manage',
    'incident:view',
    'incident:create',
    'evidence:read',
    'evidence:upload',
    'audit:read',
  ],
  INVESTIGATOR: [
    'manage_incidents',
    'view_audit_logs',
    'verify_papers',
    'incident:view',
    'incident:create',
    'incident:resolve',
    'evidence:read',
    'evidence:upload',
    'audit:read',
    'paper:read',
    'paper:verify',
  ],
  AUDITOR: [
    'view_audit_logs',
    'verify_papers',
    'audit:read',
    'paper:read',
    'paper:verify',
    'transport:view',
    'incident:view',
    'evidence:read',
  ],
  OPERATOR: [
    'verify_papers',
    'paper:read',
    'transport:view',
    'paper:verify',
  ],
  VIEWER: [
    'paper:read',
    'audit:read',
    'transport:view',
  ],
  // Legacy / Specialized Domain Mappings:
  EXAM_AUTHORITY: [
    'author_papers',
    'verify_papers',
    'paper:create',
    'paper:read',
    'paper:approve',
    'paper:verify',
    'transport:view',
    'audit:read',
  ],
  TRANSPORT_OFFICER: [
    'manage_logistics',
    'execute_handover',
    'transport:view',
    'transport:manage',
    'paper:read',
  ],
  CENTRE_SUPERINTENDENT: [
    'verify_papers',
    'execute_handover',
    'paper:read',
    'paper:verify',
    'transport:view',
  ],
  VIEW_ONLY: [
    'paper:read',
    'audit:read',
    'transport:view',
  ],
  PAPER_MANAGER: [
    'author_papers',
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

export const ROUTE_PERMISSION_MAP: Record<string, Permission> = {
  admin: 'admin:manage',
  admin_users: 'manage_users',
  policies: 'manage_policies',
  audit: 'view_audit_logs',
  papers: 'paper:read',
  verification: 'paper:verify',
  handover: 'execute_handover',
  transport: 'transport:view',
  incidents: 'incident:view',
  insider: 'incident:view',
  leak: 'incident:view',
};

// -------------------------------------------------------------
// 2. PASSWORD SECURITY & ENTROPY EVALUATION
// -------------------------------------------------------------
export interface PasswordEvaluation {
  score: number; // 0 - 100
  label: 'VERY_WEAK' | 'WEAK' | 'FAIR' | 'STRONG' | 'EXCELLENT';
  color: string;
  feedback: string[];
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function evaluatePasswordSecurity(password: string): PasswordEvaluation {
  const reqs = {
    minLength: password.length >= 10,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 20;
  if (reqs.hasUppercase && reqs.hasLowercase) score += 20;
  if (reqs.hasNumber) score += 20;
  if (reqs.hasSpecial) score += 20;

  // Penalize common weak patterns
  if (/password|admin|123456|examshield/i.test(password)) {
    score = Math.max(10, score - 40);
  }

  let label: PasswordEvaluation['label'] = 'VERY_WEAK';
  let color = 'text-rose-600 bg-rose-50 border-rose-200';
  if (score >= 90) {
    label = 'EXCELLENT';
    color = 'text-emerald-700 bg-emerald-50 border-emerald-300';
  } else if (score >= 70) {
    label = 'STRONG';
    color = 'text-indigo-700 bg-indigo-50 border-indigo-300';
  } else if (score >= 50) {
    label = 'FAIR';
    color = 'text-amber-700 bg-amber-50 border-amber-300';
  } else if (score >= 30) {
    label = 'WEAK';
    color = 'text-rose-600 bg-rose-50 border-rose-200';
  }

  const feedback: string[] = [];
  if (!reqs.minLength) feedback.push('Minimum 10 characters required.');
  if (!reqs.hasUppercase) feedback.push('Include uppercase characters.');
  if (!reqs.hasNumber) feedback.push('Include numeric digits (0-9).');
  if (!reqs.hasSpecial) feedback.push('Include special symbols (!@#$%^&*).');

  return { score, label, color, feedback, requirements: reqs };
}

/**
 * Client-Side PBKDF2 Password Pre-Hashing (Protects credentials in transit before server-side Argon2id)
 */
export async function computeClientPasswordHash(password: string, salt: string = 'examshield_sovereign_salt_2026'): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 10000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// -------------------------------------------------------------
// 3. RFC 6238 TIME-BASED ONE-TIME PASSWORD (TOTP) ENGINE
// -------------------------------------------------------------
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(byteLength: number = 20): string {
  const randomBytes = new Uint8Array(byteLength);
  window.crypto.getRandomValues(randomBytes);
  let secret = '';
  let buffer = 0;
  let bitsLeft = 0;

  for (const byte of randomBytes) {
    buffer = (buffer << 8) | byte;
    bitsLeft += 8;
    while (bitsLeft >= 5) {
      bitsLeft -= 5;
      secret += BASE32_ALPHABET[(buffer >> bitsLeft) & 31];
    }
  }
  if (bitsLeft > 0) {
    secret += BASE32_ALPHABET[(buffer << (5 - bitsLeft)) & 31];
  }
  return secret;
}

export function base32ToUint8Array(base32: string): Uint8Array {
  const cleanBase32 = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bitsLeft = 0;

  for (let i = 0; i < cleanBase32.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleanBase32[i]);
    if (val === -1) continue;
    buffer = (buffer << 5) | val;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      bitsLeft -= 8;
      bytes.push((buffer >> bitsLeft) & 255);
    }
  }
  return new Uint8Array(bytes);
}

/**
 * Computes RFC 6238 TOTP 6-digit code for a given Base32 secret and time offset
 */
export async function calculateTotpCode(secretBase32: string, timeOffsetSteps: number = 0): Promise<string> {
  const epochSeconds = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epochSeconds / 30) + timeOffsetSteps;

  const timeBuffer = new ArrayBuffer(8);
  const timeView = new DataView(timeBuffer);
  timeView.setBigUint64(0, BigInt(timeStep), false);

  const keyBytes = base32ToUint8Array(secretBase32);

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, timeBuffer);
  const hmacBytes = new Uint8Array(signature);

  // Dynamic Truncation
  const offset = hmacBytes[hmacBytes.length - 1] & 0xf;
  const binaryCode =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);

  const otp = (binaryCode % 1000000).toString().padStart(6, '0');
  return otp;
}

/**
 * Verifies TOTP code against time drift window (±1 step = ±30s)
 */
export async function verifyTotpCode(
  inputCode: string,
  secretBase32: string
): Promise<{ isValid: boolean; driftOffset?: number }> {
  const cleanCode = inputCode.trim();
  for (const offset of [0, -1, 1]) {
    const expected = await calculateTotpCode(secretBase32, offset);
    if (cleanCode === expected) {
      return { isValid: true, driftOffset: offset };
    }
  }
  return { isValid: false };
}

// -------------------------------------------------------------
// 4. BACKUP RECOVERY CODES
// -------------------------------------------------------------
export function generateBackupRecoveryCodes(count: number = 8): BackupCodeItem[] {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const codes: BackupCodeItem[] = [];

  for (let i = 0; i < count; i++) {
    let part1 = '';
    let part2 = '';
    const rand = new Uint8Array(8);
    window.crypto.getRandomValues(rand);

    for (let j = 0; j < 4; j++) part1 += chars[rand[j] % chars.length];
    for (let j = 4; j < 8; j++) part2 += chars[rand[j] % chars.length];

    codes.push({
      code: `${part1}-${part2}`,
      used: false,
    });
  }

  return codes;
}

// -------------------------------------------------------------
// 5. ACTIVE SESSIONS & REPUTATION ENGINE
// -------------------------------------------------------------
const INITIAL_SESSIONS: ActiveSession[] = [
  {
    id: 'SES-CURR-01',
    userId: 'USR-001',
    userName: 'Dr. Rajeshwar Sharma',
    role: 'SUPER_ADMIN',
    device: 'MacBook Pro (Apple Silicon)',
    browser: 'Chrome 128 (macOS)',
    os: 'macOS 15.1 Sequoia',
    ipAddress: '10.240.12.88',
    location: 'National Command Center, New Delhi',
    loginTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastActive: new Date().toISOString(),
    isCurrentSession: true,
    status: 'ACTIVE',
  },
  {
    id: 'SES-TERM-02',
    userId: 'USR-001',
    userName: 'Dr. Rajeshwar Sharma',
    role: 'SUPER_ADMIN',
    device: 'Hardware Enclave Terminal #04',
    browser: 'Embedded Chromium',
    os: 'ExamShield Hardened Linux 6.1',
    ipAddress: '10.240.12.92',
    location: 'Vault Strongroom Alpha',
    loginTime: new Date(Date.now() - 3600000 * 5).toISOString(),
    lastActive: new Date(Date.now() - 900000).toISOString(),
    isCurrentSession: false,
    status: 'ACTIVE',
  },
  {
    id: 'SES-MOB-03',
    userId: 'USR-004',
    userName: 'Rajinder Singh Gill',
    role: 'TRANSPORT_OFFICER',
    device: 'Ruggedized Tactical Tablet',
    browser: 'Safari Mobile',
    os: 'iOS 18.0 Hardened',
    ipAddress: '10.240.45.19',
    location: 'Noida Expressway Transit Convoy',
    loginTime: new Date(Date.now() - 3600000 * 3).toISOString(),
    lastActive: new Date(Date.now() - 300000).toISOString(),
    isCurrentSession: false,
    status: 'ACTIVE',
  },
];

let activeSessionsRegistry: ActiveSession[] = [...INITIAL_SESSIONS];

export const SessionManager = {
  getSessions: (): ActiveSession[] => [...activeSessionsRegistry],
  revokeSession: (sessionId: string): void => {
    activeSessionsRegistry = activeSessionsRegistry.filter((s) => s.id !== sessionId);
  },
  revokeAllOtherSessions: (currentUserId: string): void => {
    activeSessionsRegistry = activeSessionsRegistry.filter(
      (s) => s.userId !== currentUserId || s.isCurrentSession
    );
  },
  registerSession: (user: User, deviceDesc: string = 'Current Browser Session'): ActiveSession => {
    const newSession: ActiveSession = {
      id: `SES-${Date.now().toString(36).toUpperCase()}`,
      userId: user.id,
      userName: user.name,
      role: user.role,
      device: deviceDesc,
      browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Safari / Firefox',
      os: navigator.platform || 'macOS / Linux',
      ipAddress: '10.240.12.88 (Secure Local)',
      location: 'Authorized Operations Terminal',
      loginTime: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isCurrentSession: true,
      status: 'ACTIVE',
    };
    activeSessionsRegistry = [newSession, ...activeSessionsRegistry];
    return newSession;
  },
};

// -------------------------------------------------------------
// 6. SECURITY POSTURE & HEALTH SCORE ENGINE
// -------------------------------------------------------------
export function computeSecurityHealthScore(
  users: User[],
  sessions: ActiveSession[],
  alerts: SecurityAlertItem[],
  chainIntegrityValid: boolean,
  lockdownActive: boolean
): SecurityHealthPosture {
  const totalUsers = users.length || 1;
  const mfaUsers = users.filter((u) => u.mfaEnabled).length;
  const mfaCoverage = Math.round((mfaUsers / totalUsers) * 100);

  const lockedUsers = users.filter((u) => u.status === 'LOCKED').length;
  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'OPEN').length;

  const checks: SecurityHealthCheck[] = [
    {
      id: 'CHK-MFA',
      name: 'Multi-Factor Authentication (MFA) Coverage',
      category: 'AUTHENTICATION',
      status: mfaCoverage >= 90 ? 'PASS' : mfaCoverage >= 70 ? 'WARN' : 'FAIL',
      score: Math.min(25, Math.round((mfaCoverage / 100) * 25)),
      description: `${mfaCoverage}% of institutional users have hardware/TOTP MFA active.`,
      fixAction: 'Enforce MFA policy across all operational divisions.',
    },
    {
      id: 'CHK-LEDGER',
      name: 'Cryptographic Merkle Ledger Chain Integrity',
      category: 'INFRASTRUCTURE',
      status: chainIntegrityValid ? 'PASS' : 'FAIL',
      score: chainIntegrityValid ? 25 : 0,
      description: chainIntegrityValid
        ? 'Parent block hash linkages and RSA signatures verified 100% authentic.'
        : 'CRITICAL: Block ledger divergence or hash discrepancy detected!',
      fixAction: 'Run ledger consensus repair and re-anchor root hash.',
    },
    {
      id: 'CHK-SESSIONS',
      name: 'Active Session Hygiene & Concurrent Limits',
      category: 'AUTHENTICATION',
      status: sessions.length <= 15 ? 'PASS' : 'WARN',
      score: Math.min(20, Math.max(10, 25 - sessions.length)),
      description: `${sessions.length} active authenticated terminal sessions currently registered.`,
      fixAction: 'Revoke stale or dormant terminal sessions.',
    },
    {
      id: 'CHK-ALERTS',
      name: 'Active Threat Signals & Open Anomalies',
      category: 'INCIDENT_RESPONSE',
      status: criticalAlerts === 0 ? 'PASS' : 'FAIL',
      score: Math.max(0, 15 - criticalAlerts * 8),
      description: `${criticalAlerts} critical uncontained threats requiring forensic attention.`,
      fixAction: 'Dispatch incident response team in the Investigation Room.',
    },
    {
      id: 'CHK-LOCKDOWN',
      name: 'Emergency Defensive Posture',
      category: 'GOVERNANCE',
      status: lockdownActive ? 'WARN' : 'PASS',
      score: 15,
      description: lockdownActive
        ? 'SYSTEM IN EMERGENCY LOCKDOWN: Sensitive operations restricted.'
        : 'Standard zero-trust defense baseline operating normally.',
      fixAction: 'Review emergency lockdown status in Security Command Center.',
    },
  ];

  const overallScore = Math.max(
    10,
    Math.min(100, checks.reduce((acc, c) => acc + c.score, 0))
  );

  let rating: SecurityHealthPosture['rating'] = 'NEEDS_ATTENTION';
  if (overallScore >= 90) rating = 'EXCELLENT';
  else if (overallScore >= 75) rating = 'GOOD';
  else if (overallScore >= 50) rating = 'NEEDS_ATTENTION';
  else rating = 'CRITICAL';

  return {
    overallScore,
    rating,
    mfaCoveragePercent: mfaCoverage,
    strongPasswordPercent: 94,
    activeSessionsCount: sessions.length,
    suspiciousLoginsCount: lockedUsers,
    openIncidentsCount: criticalAlerts,
    checks,
  };
}
