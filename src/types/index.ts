export type UserRole =
  | 'SUPER_ADMIN'
  | 'SECURITY_ADMIN'
  | 'EXAM_CONTROLLER'
  | 'SECURITY_OFFICER'
  | 'INVESTIGATOR'
  | 'AUDITOR'
  | 'OPERATOR'
  | 'VIEWER'
  | 'EXAM_AUTHORITY'
  | 'TRANSPORT_OFFICER'
  | 'CENTRE_SUPERINTENDENT'
  | 'VIEW_ONLY'
  | 'PAPER_MANAGER'
  | 'PRINTING_OFFICER'
  | 'STORAGE_OFFICER';

export type Permission =
  | 'manage_users'
  | 'manage_roles'
  | 'manage_policies'
  | 'manage_mfa'
  | 'view_audit_logs'
  | 'manage_incidents'
  | 'author_papers'
  | 'verify_papers'
  | 'manage_logistics'
  | 'execute_handover'
  | 'emergency_lockdown'
  | 'break_glass'
  | 'paper:create'
  | 'paper:read'
  | 'paper:approve'
  | 'paper:seal'
  | 'paper:verify'
  | 'paper:tamper'
  | 'transport:view'
  | 'transport:manage'
  | 'incident:view'
  | 'incident:create'
  | 'incident:resolve'
  | 'evidence:read'
  | 'evidence:upload'
  | 'policy:manage'
  | 'audit:read'
  | 'simulation:run'
  | 'admin:manage';

export interface ActiveSession {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  loginTime: string;
  lastActive: string;
  isCurrentSession: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export interface SecurityHealthCheck {
  id: string;
  name: string;
  category: 'AUTHENTICATION' | 'INFRASTRUCTURE' | 'GOVERNANCE' | 'INCIDENT_RESPONSE';
  status: 'PASS' | 'WARN' | 'FAIL';
  score: number;
  description: string;
  details?: string;
  fixAction?: string;
}

export interface SecurityHealthPosture {
  overallScore: number;
  rating: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';
  mfaCoveragePercent: number;
  strongPasswordPercent: number;
  activeSessionsCount: number;
  suspiciousLoginsCount: number;
  openIncidentsCount: number;
  checks: SecurityHealthCheck[];
}

export interface SecurityAlertItem {
  id: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  category: 'AUTHENTICATION' | 'ROLE_MODIFICATION' | 'MFA' | 'DEVICE' | 'POLICY' | 'TAMPER';
  actor: string;
  relatedUser?: string;
  status: 'OPEN' | 'INVESTIGATING' | 'ACKNOWLEDGED' | 'RESOLVED';
  incidentId?: string;
}

export interface BackupCodeItem {
  code: string;
  used: boolean;
  usedAt?: string;
}

export interface EmergencyLockdownState {
  isActive: boolean;
  reason?: string;
  startedAt?: string;
  startedBy?: string;
  affectedModules: string[];
}

export type PaperStatus =
  | 'DRAFT'
  | 'GENERATED'
  | 'FINGERPRINTED'
  | 'CRYPTOGRAPHICALLY_SIGNED'
  | 'APPROVED'
  | 'PRINTED'
  | 'SEALED'
  | 'IN_STORAGE'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'OPENED_FOR_EXAM'
  | 'OPENED'
  | 'EXAM_COMPLETED'
  | 'ARCHIVED'
  | 'RETIRED'
  | 'COMPROMISED';

export type PackageStatus =
  | 'PREPARED'
  | 'SEALED'
  | 'IN_STORAGE'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'OPENED'
  | 'COMPLETED'
  | 'TAMPER_LOCKED';

export type AlertSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertType =
  | 'UNAUTHORIZED_LOGIN'
  | 'UNAUTHORIZED_ACCESS'
  | 'DOCUMENT_MODIFIED'
  | 'PACKAGE_TAMPER'
  | 'GPS_DEVIATION'
  | 'GEOFENCE_BREACH'
  | 'UNAUTHORIZED_HANDOVER'
  | 'UNKNOWN_DEVICE'
  | 'SUSPICIOUS_DOWNLOAD'
  | 'AI_ANOMALY'
  | 'DOCUMENT_SIMILARITY'
  | 'BLOCKCHAIN_INTEGRITY_FAILURE'
  | 'STRONGROOM_BREACH'
  | 'SENSOR_OFFLINE';

export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';

export type IncidentStatus = 'DETECTED' | 'TRIAGED' | 'UNDER_INVESTIGATION' | 'CONTAINED' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  badgeNumber: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'LOCKED';
  avatar?: string;
  lastLogin?: string;
  mfaEnabled: boolean;
  assignedCentreId?: string;
}

export interface Question {
  id: string;
  subject: string;
  topic: string;
  chapter?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  type: 'MCQ' | 'NUMERICAL' | 'DESCRIPTIVE';
  text: string;
  options?: string[];
  answer: string;
  marks: number;
  confidentiality: 'RESTRICTED' | 'SECRET' | 'TOP_SECRET';
  version: number;
  status: 'DRAFT' | 'APPROVED' | 'REJECTED';
  author: string;
  createdAt: string;
  language?: string;
  tags?: string[];
}

export interface Paper {
  id: string;
  paperCode: string;
  examination: string;
  subject: string;
  year: number;
  set: 'A' | 'B' | 'C' | 'D';
  version: number;
  status: PaperStatus;
  creator: string;
  creatorRole: string;
  approver?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  hash: string;
  previousHash?: string;
  signature: string;
  publicKeyId: string;
  confidentialityLevel: 'RESTRICTED' | 'SECRET' | 'TOP_SECRET';
  qrCodeUrl?: string;
  qrPayload: string;
  questionsCount: number;
  totalMarks: number;
  durationMinutes: number;
  currentCustodian: string;
  custodianRole: string;
  location: string;
  printCount: number;
  isTampered?: boolean;
  tamperDiff?: {
    originalTextSnippet?: string;
    modifiedTextSnippet?: string;
    detectedAt?: string;
  };
}

export interface ImmutableBlock {
  index: number;
  blockId: string;
  timestamp: string;
  paperId?: string;
  packageId?: string;
  actor: string;
  actorRole: string;
  action: string;
  location: string;
  device: string;
  eventData: Record<string, any>;
  previousHash: string;
  eventHash: string;
  signature: string;
  txHash: string;
  verified: boolean;
  merkleRoot?: string;
}

export interface IoTDevice {
  id: string;
  type: 'SMART_BOX' | 'TRACKING_SEAL' | 'ENVIRONMENTAL_SENSOR' | 'GPS_BEACON';
  packageId?: string;
  firmwareVersion: string;
  batteryLevel: number;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'COMPROMISED' | 'DEGRADED';
  lastSeen: string;
  certificateId: string;
  sensors: {
    reedSwitch: 'CLOSED' | 'OPEN';
    accelerometerG: number;
    temperatureCelsius: number;
    humidityPercent?: number;
    lightLux: number;
    gpsLock: boolean;
    tamperState: boolean;
  };
}

export interface SensorEvent {
  id: string;
  deviceId: string;
  packageId: string;
  timestamp: string;
  eventType:
    | 'PACKAGE_OPENED'
    | 'MOVEMENT_DETECTED'
    | 'GPS_UPDATED'
    | 'TEMPERATURE_CHANGED'
    | 'LIGHT_DETECTED'
    | 'DEVICE_DISCONNECTED'
    | 'TAMPER_DETECTED';
  location: { lat: number; lng: number; address: string };
  sensorValues: {
    reedSwitch?: string;
    temperature?: number;
    humidity?: number;
    light?: number;
    shock?: number;
  };
  severity: AlertSeverity;
}

export interface Package {
  id: string;
  packageCode: string;
  paperIds: string[];
  sealId: string;
  sensorDeviceId: string;
  transportOfficerId: string;
  transportOfficerName: string;
  sourceFacility: string;
  destinationCentreId: string;
  destinationCentreName: string;
  status: PackageStatus;
  tamperState: 'INTACT' | 'BREACHED' | 'WARNING';
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
    speedKmh: number;
  };
  routeId: string;
  routeDeviationKm: number;
  eta: string;
  qrPayload: string;
  lastTelemetry: {
    temperature: number;
    reedSwitch: string;
    lightLux: number;
    shockG: number;
    humidity?: number;
    timestamp: string;
  };
  createdAt: string;
  sealedAt?: string;
  deliveredAt?: string;
}

export interface TransportRoute {
  id: string;
  name: string;
  sourceName: string;
  sourceCoords: [number, number];
  destinationName: string;
  destinationCoords: [number, number];
  waypoints: [number, number][];
  corridorToleranceKm: number;
  estimatedDurationMins: number;
}

export interface ExamCentre {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  address: string;
  coords: [number, number];
  capacity: number;
  superintendentName: string;
  contactNumber: string;
  securityScore: number;
  activePackages: number;
  status: 'ACTIVE' | 'HIGH_ALERT' | 'COMPLETED';
  strongroomBiometricsArmed?: boolean;
}

export interface Alert {
  id: string;
  alertCode: string;
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  description: string;
  affectedResource: {
    type: 'PAPER' | 'PACKAGE' | 'USER' | 'CENTRE' | 'BLOCKCHAIN';
    id: string;
    label: string;
  };
  timestamp: string;
  location: string;
  actor: string;
  actorRole: string;
  status: AlertStatus;
  assignedInvestigator?: string;
  riskScore: number;
  reasons: string[];
}

export interface Incident {
  id: string;
  incidentCode: string;
  title: string;
  severity: AlertSeverity;
  status: IncidentStatus;
  affectedPaperId?: string;
  affectedPackageId?: string;
  affectedUserId?: string;
  assignedInvestigator: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  source?: string;
  risk?: number;
  timeline: {
    timestamp: string;
    title: string;
    description: string;
    actor: string;
    severity: AlertSeverity;
    location?: string;
  }[];
  evidence: EvidenceItem[];
  resolutionPlaybook: string[];
  graphNodes: {
    id: string;
    label: string;
    type: 'USER' | 'DEVICE' | 'PAPER' | 'PACKAGE' | 'LOCATION' | 'ALERT' | 'EVENT';
    risk?: number;
  }[];
  graphEdges: {
    from: string;
    to: string;
    label: string;
  }[];
  actionsTaken?: string[];
}

export interface EvidenceItem {
  id: string;
  incidentId: string;
  name: string;
  type: 'SENSOR_DUMP' | 'DOCUMENT_HASH' | 'GPS_LOG' | 'ACCESS_LOG' | 'WITNESS_STATEMENT' | 'FORENSIC_SNAPSHOT';
  fileHash: string;
  currentHash?: string;
  timestamp: string;
  uploadedBy: string;
  sizeBytes: number;
  verified: boolean;
  description: string;
  classification?: 'CONFIDENTIAL' | 'RESTRICTED' | 'LEGAL_HOLD';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  actorName?: string;
  actorRole?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  resource?: string;
  ipAddress?: string;
  deviceFingerprint?: string;
  location?: string;
  status?: 'SUCCESS' | 'DENIED' | 'FLAGGED';
  details?: Record<string, any> | string;
  blockchainTxHash?: string;
  eventHash?: string;
  previousHash?: string;
}

export interface UserRiskProfile {
  userId: string;
  userName: string;
  role: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: {
    accessAnomaly: number;
    timeAnomaly: number;
    deviceAnomaly: number;
    locationAnomaly: number;
    downloadAnomaly: number;
  };
  recentViolations: string[];
  lastAssessed: string;
  status: 'NORMAL' | 'MONITORED' | 'FLAGGED' | 'SUSPENDED';
  recommendedAction?: string;
}

export interface DocumentLeakAnalysis {
  analysisId: string;
  uploadedFilename: string;
  uploadedDocHash: string;
  timestamp: string;
  questionSimilarity: number;
  structureSimilarity: number;
  sequenceSimilarity: number;
  overallSimilarity: number;
  exposureRiskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  matchedPaperId?: string;
  matchedPaperCode?: string;
  matchedQuestions: {
    submittedQuestion: string;
    matchedOriginalQuestion: string;
    similarityScore: number;
    subject: string;
  }[];
  verdictSummary: string;
  recommendations: string[];
  provider?: string;
  confidence?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SecurityPolicy {
  authorizedAccessStartHour: number;
  authorizedAccessEndHour: number;
  maxFailedLoginsBeforeLock: number;
  routeDeviationThresholdKm: number;
  temperatureMaxCelsius: number;
  temperatureMinCelsius: number;
  shockThresholdG: number;
  lightLuxThreshold: number;
  mfaRequiredForConfidential: boolean;
  autoFreezeOnTamper: boolean;
}

export interface SecurityPolicyItem {
  id: string;
  code: string;
  title: string;
  description: string;
  enforcementLayer: string;
  triggerCondition: string;
  automatedAction: string;
  status: 'ENFORCED' | 'MONITORED' | 'DISABLED';
  severity: AlertSeverity;
}

export interface CustodyEvent {
  id: string;
  paperId?: string;
  packageId?: string;
  entityId?: string;
  stage: string;
  action: string;
  details: string;
  actorName: string;
  actorRole: string;
  location: string;
  timestamp: string;
  blockchainTxHash: string;
  device?: string;
  hash?: string;
  previousEventHash?: string;
  status?: string;
}

export interface SystemStats {
  totalPapers: number;
  securedPapers: number;
  papersInTransit: number;
  activePackages: number;
  activeAlerts: number;
  criticalIncidents: number;
  verifiedHandovers: number;
  tamperEvents: number;
  highRiskUsers: number;
  systemSecurityScore: number;
  blockchainHeight: number;
  chainIntegrityValid: boolean;
}

export interface ServiceHealthStatus {
  service: string;
  status: 'CONNECTED' | 'DEGRADED' | 'OFFLINE' | 'DEMO MODE';
  latencyMs: number;
  provider: string;
  lastChecked: string;
  details?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  timestamp: string;
  read: boolean;
  linkView?: string;
  linkId?: string;
}

export type IotDevice = IoTDevice;
export type DashboardMetrics = SystemStats;
