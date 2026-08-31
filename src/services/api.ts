import {
  Alert,
  AuditLog,
  CustodyEvent,
  DocumentLeakAnalysis,
  ExamCentre,
  ImmutableBlock,
  Incident,
  IoTDevice,
  Package,
  Paper,
  Question,
  SecurityPolicy,
  SecurityPolicyItem,
  ServiceHealthStatus,
  SystemStats,
  TransportRoute,
  User,
  UserRiskProfile,
} from '../types/index.ts';

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const fetchFn = typeof window !== 'undefined' && typeof window.fetch === 'function' ? window.fetch.bind(window) : fetch;
  const res = await fetchFn(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;
    try {
      const err = await res.json();
      if (err.error?.message) errMsg = err.error.message;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  // Stats & Health
  getStats: () => fetchJson<SystemStats>(`${BASE_URL}/stats`),
  getDashboardMetrics: () => fetchJson<SystemStats>(`${BASE_URL}/stats`),
  getHealth: () => fetchJson<any>(`${BASE_URL}/health`),

  // Auth & Users
  login: (email: string, password?: string, mfaCode?: string) =>
    fetchJson<{ token: string; user: User }>(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password, mfaCode }),
    }),
  getUsers: () => fetchJson<User[]>(`${BASE_URL}/users`),
  getUserRiskProfiles: () => fetchJson<UserRiskProfile[]>(`${BASE_URL}/users/risk-profiles`),

  // Papers & Questions
  getPapers: () => fetchJson<Paper[]>(`${BASE_URL}/papers`),
  getPaper: (id: string) => fetchJson<Paper>(`${BASE_URL}/papers/${id}`),
  createPaper: (data: Partial<Paper>) =>
    fetchJson<{ paper: Paper; block: ImmutableBlock }>(`${BASE_URL}/papers`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  approvePaper: (id: string, approverName: string) =>
    fetchJson<{ paper: Paper; block: ImmutableBlock }>(`${BASE_URL}/papers/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approverName }),
    }),
  verifyPaper: (id: string) => fetchJson<any>(`${BASE_URL}/papers/${id}/verify`),
  getQuestions: () => fetchJson<Question[]>(`${BASE_URL}/questions`),
  createQuestion: (data: Partial<Question>) =>
    fetchJson<Question>(`${BASE_URL}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Packages & Transport
  getPackages: () => fetchJson<Package[]>(`${BASE_URL}/packages`),
  getPackage: (id: string) => fetchJson<Package>(`${BASE_URL}/packages/${id}`),
  createPackage: (data: any) =>
    fetchJson<{ package: Package; block: ImmutableBlock }>(`${BASE_URL}/packages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  sealPackage: (id: string, officerName: string) =>
    fetchJson<{ package: Package; block: ImmutableBlock }>(`${BASE_URL}/packages/${id}/seal`, {
      method: 'POST',
      body: JSON.stringify({ officerName }),
    }),
  verifyPackage: (id: string) => fetchJson<any>(`${BASE_URL}/packages/${id}/verify`),
  verifyHandover: (data: { packageId: string; senderId: string; receiverId: string; qrCode: string }) =>
    fetchJson<{ success: boolean; package: Package; block: ImmutableBlock }>(`${BASE_URL}/handover/verify`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // IoT
  getIoTDevices: () => fetchJson<IoTDevice[]>(`${BASE_URL}/iot/devices`),
  getIotDevices: () => fetchJson<IoTDevice[]>(`${BASE_URL}/iot/devices`),
  recordIoTEvent: (data: any) =>
    fetchJson<any>(`${BASE_URL}/iot/events`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // AI & Leak
  evaluateUserRisk: (data: any) =>
    fetchJson<UserRiskProfile>(`${BASE_URL}/ai/risk/analyze`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  analyzeDocumentLeak: (data: { filename: string; textContent: string; paperCode?: string }) =>
    fetchJson<DocumentLeakAnalysis>(`${BASE_URL}/ai/document/analyze`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Alerts & Incidents
  getAlerts: () => fetchJson<Alert[]>(`${BASE_URL}/alerts`),
  acknowledgeAlert: (id: string, investigatorName: string) =>
    fetchJson<Alert>(`${BASE_URL}/alerts/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ investigatorName }),
    }),
  resolveAlert: (id: string) =>
    fetchJson<Alert>(`${BASE_URL}/alerts/${id}/resolve`, {
      method: 'POST',
    }),
  getIncidents: () => fetchJson<Incident[]>(`${BASE_URL}/incidents`),
  getIncident: (id: string) => fetchJson<Incident>(`${BASE_URL}/incidents/${id}`),
  createIncident: (data: Partial<Incident>) =>
    fetchJson<Incident>(`${BASE_URL}/incidents`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resolveIncident: (id: string) =>
    fetchJson<Incident>(`${BASE_URL}/incidents/${id}/resolve`, {
      method: 'POST',
    }),

  // Blockchain & Audit
  getBlockchainChain: () => fetchJson<ImmutableBlock[]>(`${BASE_URL}/blockchain/chain`),
  verifyBlockchainChain: () => fetchJson<any>(`${BASE_URL}/blockchain/verify-chain`),
  getCustodyEvents: () => fetchJson<CustodyEvent[]>(`${BASE_URL}/custody/events`),
  getAuditLogs: () => fetchJson<AuditLog[]>(`${BASE_URL}/audit`),

  // Centres & Policies
  getCentres: () => fetchJson<ExamCentre[]>(`${BASE_URL}/centres`),
  getRoutes: () => fetchJson<TransportRoute[]>(`${BASE_URL}/routes`),
  getPolicies: () => fetchJson<SecurityPolicy>(`${BASE_URL}/policies`),
  getSecurityPolicies: () => fetchJson<SecurityPolicyItem[]>(`${BASE_URL}/policies/list`),
  updatePolicies: (data: Partial<SecurityPolicy>) =>
    fetchJson<SecurityPolicy>(`${BASE_URL}/policies`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Simulation & Demo
  activateBackupPaper: (paperId?: string) =>
    fetchJson<any>(`${BASE_URL}/papers/backup/activate`, {
      method: 'POST',
      body: JSON.stringify({ paperId }),
    }),
  resetSystem: () =>
    fetchJson<any>(`${BASE_URL}/demo/reset`, {
      method: 'POST',
    }),
  simulateTamper: (packageId?: string) =>
    fetchJson<any>(`${BASE_URL}/simulation/package-tamper`, {
      method: 'POST',
      body: JSON.stringify({ packageId }),
    }),
  simulateGpsDeviation: (packageId?: string, deviationKm?: number) =>
    fetchJson<any>(`${BASE_URL}/simulation/gps-deviation`, {
      method: 'POST',
      body: JSON.stringify({ packageId, deviationKm }),
    }),
  simulateUnauthorizedAccess: (userId?: string, paperId?: string) =>
    fetchJson<any>(`${BASE_URL}/simulation/unauthorized-access`, {
      method: 'POST',
      body: JSON.stringify({ userId, paperId }),
    }),
  simulateDocumentModification: (paperId?: string) =>
    fetchJson<any>(`${BASE_URL}/simulation/document-modification`, {
      method: 'POST',
      body: JSON.stringify({ paperId }),
    }),
  simulateBlockchainTamper: (blockIndex?: number) =>
    fetchJson<any>(`${BASE_URL}/simulation/blockchain-tamper`, {
      method: 'POST',
      body: JSON.stringify({ blockIndex }),
    }),
  simulateCorrelatedAttack: () =>
    fetchJson<any>(`${BASE_URL}/simulation/scenario-correlated`, {
      method: 'POST',
    }),
  resetDemo: () =>
    fetchJson<any>(`${BASE_URL}/demo/reset`, {
      method: 'POST',
    }),
};
