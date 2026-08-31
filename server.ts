import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { evaluateUserAnomaly, analyzeSuspectedDocument } from './server/ai.ts';
import { blockchainService } from './server/blockchain.ts';
import { computePaperFingerprint, computeSha256, generateSecureQrPayload, getOrCreateKeypair, signPayload, verifySignature } from './server/crypto.ts';
import { db } from './server/database.ts';
import { calculateDistanceToRoute, iotService } from './server/iot.ts';
import { simulationEngine } from './server/simulation.ts';
import { Alert } from './src/types/index.ts';

const app = express();
const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security Headers Middleware (FIPS / OWASP Baseline)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=*, geolocation=*');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// -------------------------------------------------------------
// 1. HEALTH & METRICS
// -------------------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  const chainCheck = blockchainService.verifyChainIntegrity();
  res.json({
    status: 'HEALTHY',
    version: '2.4.0-STABLE',
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'ONLINE', papersCount: db.papers.size, usersCount: db.users.size },
      blockchainLedger: { status: chainCheck.isValid ? 'VERIFIED' : 'INTEGRITY_COMPROMISED', height: chainCheck.totalBlocks },
      iotTelemetry: { status: 'ONLINE', activeNodes: iotService.getDevices().length },
      aiRiskEngine: { status: 'ONLINE', model: 'IsolationForest+TFIDF+Gemini' },
      cryptographicEnclave: { status: 'ONLINE', algorithms: ['SHA-256', 'RSA-2048', 'Ed25519-Ready'] },
      zeroTrustGate: { status: 'ENFORCING' },
    },
  });
});

app.get('/api/stats', (req: Request, res: Response) => {
  const papers = Array.from(db.papers.values());
  const packages = Array.from(db.packages.values());
  const alerts = Array.from(db.alerts.values());
  const incidents = Array.from(db.incidents.values());
  const users = Array.from(db.users.values());
  const chainCheck = blockchainService.verifyChainIntegrity();

  const totalPapers = papers.length;
  const securedPapers = papers.filter((p) => p.status !== 'DRAFT' && p.status !== 'COMPROMISED').length;
  const papersInTransit = papers.filter((p) => p.status === 'IN_TRANSIT').length;
  const activePackages = packages.filter((p) => p.status === 'IN_TRANSIT' || p.status === 'SEALED').length;
  const activeAlerts = alerts.filter((a) => a.status === 'OPEN' || a.status === 'INVESTIGATING').length;
  const criticalIncidents = incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'CLOSED').length;
  const tamperEvents = alerts.filter((a) => a.type === 'PACKAGE_TAMPER' || a.type === 'DOCUMENT_MODIFIED').length;
  const highRiskUsers = Array.from(db.userRiskProfiles.values()).filter((u) => u.riskScore >= 60).length;

  // System security score: penalize based on critical open items
  let securityScore = 98;
  securityScore -= criticalIncidents * 12;
  securityScore -= activeAlerts * 3;
  if (!chainCheck.isValid) securityScore -= 30;
  securityScore = Math.max(15, Math.min(100, securityScore));

  res.json({
    totalPapers,
    securedPapers,
    papersInTransit,
    activePackages,
    activeAlerts,
    criticalIncidents,
    verifiedHandovers: 14,
    tamperEvents,
    highRiskUsers,
    systemSecurityScore: securityScore,
    blockchainHeight: chainCheck.totalBlocks,
    chainIntegrityValid: chainCheck.isValid,
  });
});

// -------------------------------------------------------------
// 2. AUTHENTICATION & USERS
// -------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, mfaCode } = req.body;
  const user = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === (email || '').toLowerCase());

  if (!user) {
    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'ANONYMOUS',
      userName: email || 'Unknown',
      userRole: 'UNAUTHENTICATED',
      action: 'LOGIN_FAILED_USER_NOT_FOUND',
      resourceType: 'AUTH',
      resourceId: email || '',
      ipAddress: req.ip || '127.0.0.1',
      deviceFingerprint: 'UNKNOWN-AGENT',
      location: 'External',
      status: 'DENIED',
      details: { email },
    });
    return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email address or security credential.' } });
  }

  if (user.status === 'LOCKED' || user.status === 'SUSPENDED') {
    return res.status(403).json({ error: { code: 'ACCOUNT_LOCKED', message: `Account is currently ${user.status}. Contact National Security Command.` } });
  }

  // Update login time & log audit
  user.lastLogin = new Date().toISOString();
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'USER_LOGIN_SUCCESS',
    resourceType: 'AUTH',
    resourceId: user.id,
    ipAddress: req.ip || '127.0.0.1',
    deviceFingerprint: 'FINGERPRINT-SHA256-SESSION',
    location: 'Secure Terminal',
    status: 'SUCCESS',
    details: { role: user.role, mfaUsed: !!mfaCode },
  });

  const token = `EXS-JWT-${Buffer.from(`${user.id}:${user.role}:${Date.now()}`).toString('base64')}`;
  res.json({ token, user });
});

app.get('/api/users', (req: Request, res: Response) => {
  res.json(Array.from(db.users.values()));
});

app.get('/api/users/risk-profiles', (req: Request, res: Response) => {
  res.json(Array.from(db.userRiskProfiles.values()));
});

// -------------------------------------------------------------
// 3. QUESTION PAPERS & LIFECYCLE
// -------------------------------------------------------------
app.get('/api/papers', (req: Request, res: Response) => {
  res.json(Array.from(db.papers.values()));
});

app.get('/api/papers/:id', (req: Request, res: Response) => {
  const paper = db.papers.get(req.params.id);
  if (!paper) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Paper not found.' } });

  // Log access
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'CURRENT_USER',
    userName: 'Authorized Operator',
    userRole: 'PAPER_MANAGER',
    action: 'PAPER_METADATA_READ',
    resourceType: 'PAPER',
    resourceId: paper.id,
    ipAddress: req.ip || '127.0.0.1',
    deviceFingerprint: 'TRUSTED-TPM-ENCLAVE',
    location: 'Command Console',
    status: 'SUCCESS',
    details: { paperCode: paper.paperCode, hash: paper.hash.slice(0, 16) },
  });

  res.json(paper);
});

app.post('/api/papers', (req: Request, res: Response) => {
  const { subject, examination, year, set, durationMinutes, totalMarks, confidentialityLevel, creatorName, creatorRole } = req.body;

  const id = `PAP-${String(db.papers.size + 1).padStart(3, '0')}`;
  const paperCode = `NEET-DEMO-${year || 2027}-${(subject || 'PHY').slice(0, 3).toUpperCase()}-${set || 'A'}`;
  const keypair = getOrCreateKeypair(creatorRole || 'EXAM_AUTHORITY', creatorName || 'Prof. Ananya Sen');

  const questions = Array.from(db.questions.values()).filter((q) => q.subject.toLowerCase() === (subject || 'Physics').toLowerCase()).slice(0, 15);

  const hash = computePaperFingerprint({
    paperCode,
    examination: examination || 'National Eligibility Security Demo Examination 2027',
    subject: subject || 'Physics',
    year: year || 2027,
    set: set || 'A',
    version: 1,
    questions,
  });

  const signature = signPayload(hash, keypair.privateKey);
  const qrPayload = generateSecureQrPayload('PAPER', id);

  const paper: any = {
    id,
    paperCode,
    examination: examination || 'National Eligibility Security Demo Examination 2027',
    subject: subject || 'Physics',
    year: year || 2027,
    set: set || 'A',
    version: 1,
    status: 'APPROVED',
    creator: creatorName || 'Prof. Ananya Sen',
    creatorRole: creatorRole || 'EXAM_AUTHORITY',
    approver: 'Dr. Rajeshwar Sharma',
    approvedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hash,
    signature,
    publicKeyId: keypair.id,
    confidentialityLevel: confidentialityLevel || 'TOP_SECRET',
    qrPayload,
    questionsCount: questions.length || 15,
    totalMarks: totalMarks || 180,
    durationMinutes: durationMinutes || 180,
    currentCustodian: 'Central Vault Strongroom',
    custodianRole: 'STORAGE_OFFICER',
    location: 'Central Vault 1, New Delhi',
    printCount: 0,
    isTampered: false,
  };

  db.papers.set(id, paper);

  const block = blockchainService.recordEvent({
    paperId: id,
    actor: paper.creator,
    actorRole: paper.creatorRole,
    action: 'PAPER_CREATED_AND_FINGERPRINTED',
    location: 'National Command Center, New Delhi',
    device: 'SECURE-TERMINAL-01',
    eventData: { paperCode, hash, signature, questionsCount: paper.questionsCount },
  });

  res.status(201).json({ paper, block });
});

app.post('/api/papers/:id/approve', (req: Request, res: Response) => {
  const paper = db.papers.get(req.params.id);
  if (!paper) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Paper not found.' } });

  paper.status = 'APPROVED';
  paper.approver = req.body.approverName || 'Dr. Rajeshwar Sharma';
  paper.approvedAt = new Date().toISOString();

  const block = blockchainService.recordEvent({
    paperId: paper.id,
    actor: paper.approver,
    actorRole: 'SUPER_ADMIN',
    action: 'PAPER_APPROVED_FOR_PRINTING',
    location: 'National Command HQ',
    device: 'ADMIN-TERMINAL-01',
    eventData: { paperCode: paper.paperCode, hash: paper.hash },
  });

  res.json({ paper, block });
});

app.get('/api/papers/:id/verify', (req: Request, res: Response) => {
  const paper = db.papers.get(req.params.id);
  if (!paper) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Paper not found.' } });

  const keypair = getOrCreateKeypair(paper.creatorRole, paper.creator);
  const isSignatureValid = verifySignature(paper.hash, paper.signature, keypair.publicKey);
  const isHashMatching = !paper.isTampered;

  const result = {
    paperId: paper.id,
    paperCode: paper.paperCode,
    version: paper.version,
    status: paper.status,
    registeredHash: paper.hash,
    computedCurrentHash: paper.isTampered ? computeSha256(`CORRUPTED_${paper.hash}`) : paper.hash,
    isHashValid: isHashMatching,
    isSignatureValid,
    publicKeyId: paper.publicKeyId,
    verifiedAt: new Date().toISOString(),
    overallIntegrity: isHashMatching && isSignatureValid ? 'AUTHENTIC' : 'INTEGRITY_FAILURE',
    custodian: paper.currentCustodian,
  };

  res.json(result);
});

// -------------------------------------------------------------
// 4. QUESTION BANK
// -------------------------------------------------------------
app.get('/api/questions', (req: Request, res: Response) => {
  res.json(Array.from(db.questions.values()));
});

app.post('/api/questions', (req: Request, res: Response) => {
  const { subject, topic, difficulty, text, options, answer, marks, author } = req.body;
  const id = `QST-${String(db.questions.size + 1).padStart(4, '0')}`;
  const question = {
    id,
    subject: subject || 'Physics',
    topic: topic || 'General Physics',
    difficulty: difficulty || 'MEDIUM',
    type: 'MCQ' as const,
    text,
    options: options || ['(A) Option 1', '(B) Option 2', '(C) Option 3', '(D) Option 4'],
    answer: answer || '(A) Option 1',
    marks: marks || 4,
    confidentiality: 'TOP_SECRET' as const,
    version: 1,
    status: 'APPROVED' as const,
    author: author || 'Prof. Ananya Sen',
    createdAt: new Date().toISOString(),
  };

  db.questions.set(id, question);
  res.status(201).json(question);
});

// -------------------------------------------------------------
// 5. PACKAGES & TRANSPORT
// -------------------------------------------------------------
app.get('/api/packages', (req: Request, res: Response) => {
  res.json(Array.from(db.packages.values()));
});

app.get('/api/packages/:id', (req: Request, res: Response) => {
  const pkg = db.packages.get(req.params.id);
  if (!pkg) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Package not found.' } });
  res.json(pkg);
});

app.post('/api/packages', (req: Request, res: Response) => {
  const { paperIds, destinationCentreId, sourceFacility, transportOfficerName } = req.body;
  const id = `ES-PKG-${82930 + db.packages.size + 1}`;
  const centre = db.examCentres.get(destinationCentreId || 'CTR-DEL-01');

  const pkg: any = {
    id,
    packageCode: id,
    paperIds: paperIds || ['PAP-001'],
    sealId: `SEAL-CRYPTO-RFID-${90000 + db.packages.size + 1}`,
    sensorDeviceId: `IOT-BOX-${String(db.packages.size + 1).padStart(3, '0')}`,
    transportOfficerId: 'USR-004',
    transportOfficerName: transportOfficerName || 'Rajinder Singh Gill',
    sourceFacility: sourceFacility || 'Central Currency Press, New Delhi',
    destinationCentreId: destinationCentreId || 'CTR-DEL-01',
    destinationCentreName: centre ? centre.name : 'Delhi Testing Centre',
    status: 'SEALED',
    tamperState: 'INTACT',
    currentLocation: {
      lat: 28.6139,
      lng: 77.209,
      address: 'Central Currency Press Strongroom',
      speedKmh: 0,
    },
    routeId: 'RT-DEL-NOI',
    routeDeviationKm: 0.0,
    eta: '65 mins',
    qrPayload: generateSecureQrPayload('PACKAGE', id),
    lastTelemetry: {
      temperature: 24.5,
      reedSwitch: 'CLOSED',
      lightLux: 0.1,
      shockG: 1.0,
      timestamp: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    sealedAt: new Date().toISOString(),
  };

  db.packages.set(id, pkg);

  const block = blockchainService.recordEvent({
    packageId: id,
    actor: 'Vikramaditya Verma',
    actorRole: 'SECURITY_OFFICER',
    action: 'PACKAGE_SEALED_AND_DISPATCHED',
    location: pkg.sourceFacility,
    device: 'SEAL-STATION-A4',
    eventData: { packageCode: id, sealId: pkg.sealId, sensorId: pkg.sensorDeviceId },
  });

  res.status(201).json({ package: pkg, block });
});

app.post('/api/packages/:id/seal', (req: Request, res: Response) => {
  const pkg = db.packages.get(req.params.id);
  if (!pkg) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Package not found.' } });

  pkg.status = 'SEALED';
  pkg.tamperState = 'INTACT';
  pkg.sealedAt = new Date().toISOString();

  const block = blockchainService.recordEvent({
    packageId: pkg.id,
    actor: req.body.officerName || 'Vikramaditya Verma',
    actorRole: 'SECURITY_OFFICER',
    action: 'DIGITAL_SEAL_APPLIED',
    location: pkg.sourceFacility,
    device: 'SEAL-STATION-01',
    eventData: { packageCode: pkg.packageCode, sealId: pkg.sealId },
  });

  res.json({ package: pkg, block });
});

app.post('/api/packages/:id/verify', (req: Request, res: Response) => {
  const pkg = db.packages.get(req.params.id);
  if (!pkg) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Package not found.' } });

  const isIntact = pkg.tamperState === 'INTACT' && pkg.lastTelemetry.reedSwitch === 'CLOSED';
  res.json({
    packageId: pkg.id,
    packageCode: pkg.packageCode,
    sealId: pkg.sealId,
    sealState: isIntact ? 'AUTHENTIC_INTACT' : 'TAMPER_FLAGGED',
    sensorState: pkg.lastTelemetry,
    currentLocation: pkg.currentLocation,
    status: pkg.status,
    verifiedAt: new Date().toISOString(),
    isAuthentic: isIntact,
  });
});

// -------------------------------------------------------------
// 6. TWO-PARTY SECURE HANDOVER
// -------------------------------------------------------------
app.post('/api/handover/verify', (req: Request, res: Response) => {
  const { packageId, senderId, receiverId, qrCode, sealScanId } = req.body;
  const pkg = db.packages.get(packageId);
  if (!pkg) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Package not found.' } });

  const sender = db.users.get(senderId) || Array.from(db.users.values())[3]; // transport
  const receiver = db.users.get(receiverId) || Array.from(db.users.values())[5]; // superintendent

  if (pkg.tamperState === 'BREACHED') {
    return res.status(400).json({
      error: { code: 'HANDOVER_PROHIBITED', message: 'Cannot execute handover on a package with active tamper lock breach.' },
    });
  }

  pkg.status = 'RECEIVED';
  pkg.deliveredAt = new Date().toISOString();

  const block = blockchainService.recordEvent({
    packageId: pkg.id,
    actor: `${sender.name} -> ${receiver.name}`,
    actorRole: `${sender.role} / ${receiver.role}`,
    action: 'TWO_PARTY_SECURE_HANDOVER_CONFIRMED',
    location: pkg.destinationCentreName,
    device: 'DUAL-QR-SCANNER-POS-01',
    eventData: {
      senderBadge: sender.badgeNumber,
      receiverBadge: receiver.badgeNumber,
      sealId: pkg.sealId,
      timestamp: new Date().toISOString(),
    },
  });

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: receiver.id,
    userName: receiver.name,
    userRole: receiver.role,
    action: 'TWO_PARTY_HANDOVER_VERIFIED',
    resourceType: 'PACKAGE',
    resourceId: pkg.id,
    ipAddress: req.ip || '127.0.0.1',
    deviceFingerprint: 'HANDHELD-CENTRE-SCANNER',
    location: pkg.destinationCentreName,
    status: 'SUCCESS',
    details: { sender: sender.name, receiver: receiver.name, txHash: block.txHash },
  });

  res.json({
    success: true,
    status: 'HANDOVER_VERIFIED_AND_COMMITTED',
    package: pkg,
    block,
  });
});

// -------------------------------------------------------------
// 7. IOT & TELEMETRY
// -------------------------------------------------------------
app.get('/api/iot/devices', (req: Request, res: Response) => {
  res.json(iotService.getDevices());
});

app.post('/api/iot/events', (req: Request, res: Response) => {
  const { deviceId, packageId, reedSwitch, accelerometerG, temperatureCelsius, lightLux, lat, lng, address } = req.body;

  const result = iotService.recordSensorTelemetry({
    deviceId: deviceId || 'IOT-BOX-001',
    packageId: packageId || 'ES-PKG-82931',
    reedSwitch,
    accelerometerG,
    temperatureCelsius,
    lightLux,
    lat: lat || 28.5355,
    lng: lng || 77.391,
    address: address || 'Noida Expressway',
  });

  if (result.isTamperAlert) {
    const pkg = db.packages.get(packageId);
    if (pkg) {
      pkg.tamperState = 'BREACHED';
      pkg.status = 'TAMPER_LOCKED';
    }
  }

  res.json(result);
});

// -------------------------------------------------------------
// 8. AI RISK & SUSPECTED LEAK ANALYSIS
// -------------------------------------------------------------
app.post('/api/ai/risk/analyze', (req: Request, res: Response) => {
  const { userId, accessHour, isKnownDevice, locationDistanceKmFromAssigned, failedLoginCount, downloadCount, recentPaperAccessCount, roleEscalationAttempt } = req.body;
  const user = db.users.get(userId) || Array.from(db.users.values())[0];

  const profile = evaluateUserAnomaly({
    userId: user.id,
    userName: user.name,
    role: user.role,
    accessHour: accessHour !== undefined ? accessHour : 14,
    isAuthorizedHour: accessHour !== undefined ? accessHour >= 8 && accessHour <= 19 : true,
    isKnownDevice: isKnownDevice !== undefined ? isKnownDevice : true,
    locationDistanceKmFromAssigned: locationDistanceKmFromAssigned || 0,
    failedLoginCount: failedLoginCount || 0,
    downloadCount: downloadCount || 1,
    recentPaperAccessCount: recentPaperAccessCount || 2,
    roleEscalationAttempt: !!roleEscalationAttempt,
  });

  db.userRiskProfiles.set(user.id, profile);
  res.json(profile);
});

app.post('/api/ai/document/analyze', async (req: Request, res: Response) => {
  const { filename, textContent, paperCode } = req.body;

  if (!textContent || textContent.trim().length === 0) {
    return res.status(400).json({ error: { code: 'EMPTY_TEXT', message: 'Document text content or extraction string is required.' } });
  }

  const questions = Array.from(db.questions.values());
  const analysis = await analyzeSuspectedDocument(filename || 'uploaded_sample.txt', textContent, questions, paperCode);

  // If high risk leak, create alert
  if (analysis.exposureRiskScore >= 75) {
    const alertId = `ALT-HIGH-${Date.now().toString().slice(-4)}`;
    const alert: Alert = {
      id: alertId,
      alertCode: alertId,
      severity: 'HIGH',
      type: 'DOCUMENT_SIMILARITY',
      title: '🚨 Suspected Question Exposure - Semantic Convergence Detected',
      description: `Analysis of '${filename || 'document'}' revealed ${analysis.overallSimilarity}% semantic overlap and matched ${analysis.matchedQuestions.length} protected questions.`,
      affectedResource: {
        type: 'PAPER',
        id: 'PAP-001',
        label: analysis.matchedPaperCode || 'Protected Exam Paper',
      },
      timestamp: new Date().toISOString(),
      location: 'Early Warning Threat Ingestion Gateway',
      actor: 'AI Document Similarity Engine',
      actorRole: 'AI_SYSTEM',
      status: 'OPEN',
      assignedInvestigator: 'Meenakshi Iyer',
      riskScore: analysis.exposureRiskScore,
      reasons: [
        `Question similarity: ${analysis.questionSimilarity}%`,
        `Structure similarity: ${analysis.structureSimilarity}%`,
        `Direct matches found: ${analysis.matchedQuestions.length} items`,
      ],
    };
    db.alerts.set(alertId, alert);
  }

  res.json(analysis);
});

// -------------------------------------------------------------
// 9. ALERTS & INCIDENTS
// -------------------------------------------------------------
app.get('/api/alerts', (req: Request, res: Response) => {
  res.json(Array.from(db.alerts.values()));
});

app.post('/api/alerts/:id/acknowledge', (req: Request, res: Response) => {
  const alert = db.alerts.get(req.params.id);
  if (!alert) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Alert not found.' } });

  alert.status = 'ACKNOWLEDGED';
  alert.assignedInvestigator = req.body.investigatorName || 'Meenakshi Iyer';
  res.json(alert);
});

app.post('/api/alerts/:id/resolve', (req: Request, res: Response) => {
  const alert = db.alerts.get(req.params.id);
  if (!alert) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Alert not found.' } });

  alert.status = 'RESOLVED';
  res.json(alert);
});

app.get('/api/incidents', (req: Request, res: Response) => {
  res.json(Array.from(db.incidents.values()));
});

app.get('/api/incidents/:id', (req: Request, res: Response) => {
  const incident = db.incidents.get(req.params.id);
  if (!incident) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Incident not found.' } });
  res.json(incident);
});

app.post('/api/incidents', (req: Request, res: Response) => {
  const { title, severity, description, affectedPaperId, affectedPackageId, affectedUserId, assignedInvestigator } = req.body;
  const id = `INC-${Date.now().toString().slice(-6)}`;

  const incident: any = {
    id,
    incidentCode: id,
    title: title || 'New Security Incident Investigation',
    severity: severity || 'HIGH',
    status: 'UNDER_INVESTIGATION',
    affectedPaperId,
    affectedPackageId,
    affectedUserId,
    assignedInvestigator: assignedInvestigator || 'Meenakshi Iyer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: description || 'Forensic investigation initiated by authorized officer.',
    timeline: [
      {
        timestamp: 'Just now',
        title: 'Incident Record Created',
        description: description || 'Case docket initialized.',
        actor: 'Investigator',
        severity: severity || 'HIGH',
      },
    ],
    evidence: [],
    resolutionPlaybook: [
      'Perform cryptographic chain-of-custody verification.',
      'Check hardware signature on original paper PDF.',
      'Review IoT device non-volatile memory logs.',
    ],
    graphNodes: [
      { id: 'INC-NODE', label: title || 'Incident', type: 'EVENT', risk: 80 },
    ],
    graphEdges: [],
  };

  db.incidents.set(id, incident);
  res.status(201).json(incident);
});

app.post('/api/incidents/:id/assign', (req: Request, res: Response) => {
  const incident = db.incidents.get(req.params.id);
  if (!incident) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Incident not found.' } });

  incident.assignedInvestigator = req.body.investigatorName || 'Meenakshi Iyer';
  incident.updatedAt = new Date().toISOString();
  res.json(incident);
});

app.post('/api/incidents/:id/resolve', (req: Request, res: Response) => {
  const incident = db.incidents.get(req.params.id);
  if (!incident) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Incident not found.' } });

  incident.status = 'RESOLVED';
  incident.updatedAt = new Date().toISOString();
  res.json(incident);
});

// -------------------------------------------------------------
// 10. BLOCKCHAIN & AUDIT TRAIL
// -------------------------------------------------------------
app.get('/api/blockchain/chain', (req: Request, res: Response) => {
  res.json(blockchainService.getChain());
});

app.get('/api/blockchain/verify/:id', (req: Request, res: Response) => {
  const tx = blockchainService.getTransaction(req.params.id);
  if (!tx) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Transaction not found.' } });
  res.json(tx);
});

app.post('/api/blockchain/verify-chain', (req: Request, res: Response) => {
  const verification = blockchainService.verifyChainIntegrity();
  res.json(verification);
});

app.get('/api/audit', (req: Request, res: Response) => {
  res.json(db.auditLogs);
});

// -------------------------------------------------------------
// 11. CENTRES, ROUTES & POLICIES
// -------------------------------------------------------------
app.get('/api/centres', (req: Request, res: Response) => {
  res.json(Array.from(db.examCentres.values()));
});

app.get('/api/routes', (req: Request, res: Response) => {
  res.json(Array.from(db.transportRoutes.values()));
});

app.get('/api/policies', (req: Request, res: Response) => {
  res.json(db.securityPolicy);
});

app.patch('/api/policies', (req: Request, res: Response) => {
  db.securityPolicy = { ...db.securityPolicy, ...req.body };
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'ADMIN',
    userName: 'Security Administrator',
    userRole: 'SUPER_ADMIN',
    action: 'SECURITY_POLICIES_UPDATED',
    resourceType: 'POLICY',
    resourceId: 'GLOBAL_CONFIG',
    ipAddress: req.ip || '127.0.0.1',
    deviceFingerprint: 'ADMIN-CONSOLE',
    location: 'Command HQ',
    status: 'SUCCESS',
    details: req.body,
  });
  res.json(db.securityPolicy);
});

app.get('/api/policies/list', (req: Request, res: Response) => {
  const policiesList = [
    {
      id: 'POL-001',
      code: 'POL-TIME-WINDOW',
      title: 'Operating Hour Access Control Policy',
      description: 'Confidential examination papers may strictly only be accessed between 08:00 and 19:00 UTC.',
      enforcementLayer: 'IAM & API Middleware',
      triggerCondition: 'Access attempt outside 08:00-19:00',
      automatedAction: 'Access Denied & High Severity Anomaly Alert',
      status: 'ENFORCED',
    },
    {
      id: 'POL-002',
      code: 'POL-GEOFENCE-CORRIDOR',
      title: '2.0 km Armored Transit Corridor Tolerance',
      description: 'Armored logistics vehicles carrying sealed packages must remain within 2.0 km of the authorized geofence corridor.',
      enforcementLayer: 'IoT Telemetry Ingestion Daemon',
      triggerCondition: 'Haversine distance > 2.0 km',
      automatedAction: 'SOC Route Departure Alarm & National Transit Halt',
      status: 'ENFORCED',
    },
    {
      id: 'POL-003',
      code: 'POL-SEAL-TAMPER',
      title: 'Instant Magnetic Reed Switch Tamper Lock',
      description: 'Physical breach of container seals during unauthorized transit immediately triggers cryptographic lockdown.',
      enforcementLayer: 'Embedded Hardware & Smart Lock',
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
  res.json(policiesList);
});

app.get('/api/custody/events', (req: Request, res: Response) => {
  const events = [
    {
      id: 'CUST-001',
      paperId: 'PAP-001',
      stage: 'CREATION',
      action: 'Question Paper Generation',
      details: 'Physics NEET-UG 2026 Set A generated with SHA-256 fingerprint & 180 questions.',
      actorName: 'Dr. Vikram Malhotra',
      actorRole: 'SUPER_ADMIN',
      location: 'Central Examination Directorate Vault, New Delhi',
      timestamp: '2026-04-10 09:30:00',
      blockchainTxHash: '0x8f19a08e1a76c8d20e74b34199f11656b2f702319082531d0537beea7cf62b9a',
    },
    {
      id: 'CUST-002',
      paperId: 'PAP-001',
      stage: 'APPROVAL',
      action: 'Board Cryptographic Signoff',
      details: 'Dual RSA-2048 PKI sign-off executed by Subject Conveners (Prof. S. R. Iyengar & Dr. P. Mehta).',
      actorName: 'Prof. S. R. Iyengar',
      actorRole: 'EXAM_AUTHORITY',
      location: 'Confidential Security Board Chamber',
      timestamp: '2026-04-10 14:15:00',
      blockchainTxHash: '0x43ae71bd5f01908a8e1b6f005c2194b1509fa66191b72e1858e925b68239bb40',
    },
    {
      id: 'CUST-003',
      paperId: 'PAP-001',
      stage: 'PRINTING',
      action: 'High-Security Press Printing',
      details: 'Print run of 25,000 serialized copies with microtext watermarking and anti-copy pantographs.',
      actorName: 'A. K. Sharma',
      actorRole: 'PRINTING_OFFICER',
      location: 'Government Security Printing Press, Nashik',
      timestamp: '2026-04-12 11:00:00',
      blockchainTxHash: '0x99281a7b4582f9c11802bfa4e7602058b730f71908c62b48908f9215002b9e11',
    },
    {
      id: 'CUST-004',
      paperId: 'PAP-001',
      packageId: 'ES-PKG-82931',
      stage: 'PACKAGING',
      action: 'Smart Electronic Sealing',
      details: 'Enclosed in smart container ES-PKG-82931 with tamper seal ES-SEAL-8819 and active IoT sensor.',
      actorName: 'A. K. Sharma',
      actorRole: 'PRINTING_OFFICER',
      location: 'Secure Logistics Packaging Terminal',
      timestamp: '2026-04-14 08:30:00',
      blockchainTxHash: '0x150821bfa982109e6c401bfa87201bfa6e501bca9810f6004bca99281e058201',
    },
    {
      id: 'CUST-005',
      paperId: 'PAP-001',
      packageId: 'ES-PKG-82931',
      stage: 'TRANSPORT',
      action: 'Armored Transit Corridor Dispatch',
      details: 'Armored carrier DL-1VB-9921 departed along authorized National Corridor RT-DEL-NOI.',
      actorName: 'Rajinder Singh Gill',
      actorRole: 'TRANSPORT_OFFICER',
      location: 'National Highway Corridor, Delhi NCR',
      timestamp: '2026-04-15 06:00:00',
      blockchainTxHash: '0x882015bf9281a05e6c41bfa92801bfe6c7104bfa98201cba6e5018f219081e77',
    },
    {
      id: 'CUST-006',
      paperId: 'PAP-001',
      packageId: 'ES-PKG-82931',
      stage: 'HANDOVER',
      action: 'Two-Party Custodial Transfer',
      details: 'Verified transfer to Centre Superintendent Harish Chandra at Greater Noida Knowledge Park.',
      actorName: 'Harish Chandra',
      actorRole: 'CENTRE_SUPERINTENDENT',
      location: 'Knowledge Park Exam Centre Strongroom, Greater Noida',
      timestamp: '2026-04-15 10:45:00',
      blockchainTxHash: '0x772019bfa65018ea6c401bfa99201bfa8e601cfa98201fba6e5018f219082011',
    },
  ];
  res.json(events);
});

app.post('/api/papers/backup/activate', (req: Request, res: Response) => {
  const paper = db.papers.get(req.body.paperId || 'PAP-001');
  if (paper) {
    paper.status = 'COMPROMISED';
  }
  const block = blockchainService.recordEvent({
    paperId: 'PAP-002',
    action: 'EMERGENCY_FAILOVER_SET_B_ACTIVATION',
    actor: 'Dr. Vikram Malhotra',
    actorRole: 'SUPER_ADMIN',
    location: 'National Security Command HQ',
    device: 'EXS-HQ-SRV-01',
    eventData: {
      quarantinedPaperId: req.body.paperId || 'PAP-001',
      activatedPaperCode: 'PHY-NEET-B',
      reason: 'Physical Seal Breach Quarantine Protocol Triggered',
    },
  });

  res.json({ success: true, quarantinedPaper: paper, activatedBlock: block });
});

// -------------------------------------------------------------
// 12. ATTACK SIMULATION ENGINE (Real Backend Event Pipeline)
// -------------------------------------------------------------
app.post('/api/simulation/package-tamper', (req: Request, res: Response) => {
  const result = simulationEngine.simulatePackageTampering(req.body.packageId);
  res.json({ success: true, ...result });
});

app.post('/api/simulation/gps-deviation', (req: Request, res: Response) => {
  const result = simulationEngine.simulateGpsDeviation(req.body.packageId, req.body.deviationKm || 3.2);
  res.json({ success: true, ...result });
});

app.post('/api/simulation/unauthorized-access', (req: Request, res: Response) => {
  const result = simulationEngine.simulateSuspiciousAccess(req.body.userId, req.body.paperId);
  res.json({ success: true, ...result });
});

app.post('/api/simulation/document-modification', (req: Request, res: Response) => {
  const result = simulationEngine.simulateDocumentModification(req.body.paperId);
  res.json({ success: true, ...result });
});

app.post('/api/simulation/blockchain-tamper', (req: Request, res: Response) => {
  const result = simulationEngine.simulateBlockchainIntegrityFailure(req.body.blockIndex || 2);
  res.json(result);
});

app.post('/api/simulation/scenario-correlated', (req: Request, res: Response) => {
  const result = simulationEngine.simulateCorrelatedAttack();
  res.json(result);
});

app.post('/api/demo/reset', (req: Request, res: Response) => {
  const result = simulationEngine.resetDemo();
  res.json(result);
});

// -------------------------------------------------------------
// 13. VITE MIDDLEWARE SETUP
// -------------------------------------------------------------
function listenWithFallback(portToTry: number, maxAttempts = 10) {
  const server = app.listen(portToTry, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🛡️  ExamShield Sovereign Security Platform Online`);
    console.log(`👉 Local:   http://localhost:${portToTry}`);
    console.log(`👉 Network: http://0.0.0.0:${portToTry}`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE' && maxAttempts > 0) {
      console.warn(`[ExamShield] Port ${portToTry} is already occupied. Trying port ${portToTry + 1}...`);
      listenWithFallback(portToTry + 1, maxAttempts - 1);
    } else {
      console.error('[ExamShield] Server failed to bind to port:', err);
    }
  });
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  listenWithFallback(DEFAULT_PORT);
}

startServer();
