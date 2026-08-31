import { Alert, Incident } from '../src/types/index.ts';
import { evaluateUserAnomaly } from './ai.ts';
import { blockchainService } from './blockchain.ts';
import { computeSha256 } from './crypto.ts';
import { db } from './database.ts';
import { iotService } from './iot.ts';

export class SimulationEngine {
  // 1. Simulate Package Opening / Physical Tamper
  public simulatePackageTampering(packageId: string = 'ES-PKG-82931') {
    const pkg = db.packages.get(packageId) || Array.from(db.packages.values())[0];
    if (!pkg) throw new Error('Package not found');

    // A. Create IoT sensor event
    const { event, isTamperAlert, alertReason } = iotService.recordSensorTelemetry({
      deviceId: pkg.sensorDeviceId,
      packageId: pkg.id,
      reedSwitch: 'OPEN',
      lightLux: 520,
      accelerometerG: 3.8,
      temperatureCelsius: 28.4,
      lat: pkg.currentLocation.lat + 0.015,
      lng: pkg.currentLocation.lng + 0.025,
      address: 'Isolated Industrial Shed, Greater Noida Outer Ring',
    });

    // B. Freeze package state
    pkg.tamperState = 'BREACHED';
    pkg.status = 'TAMPER_LOCKED';
    pkg.lastTelemetry = {
      temperature: 28.4,
      reedSwitch: 'OPEN',
      lightLux: 520,
      shockG: 3.8,
      timestamp: new Date().toISOString(),
    };

    // C. Create Alert
    const alertId = `ALT-CRIT-${Date.now().toString().slice(-4)}`;
    const alert: Alert = {
      id: alertId,
      alertCode: alertId,
      severity: 'CRITICAL',
      type: 'PACKAGE_TAMPER',
      title: '🚨 CRITICAL TAMPER ALERT - Smart Exam Box Opened',
      description: `Physical magnetic seal breached on package ${pkg.packageCode}. Reed switch opened and high ambient light (520 Lux) detected outside approved secure facility.`,
      affectedResource: {
        type: 'PACKAGE',
        id: pkg.id,
        label: `Package ${pkg.packageCode} (${pkg.destinationCentreName})`,
      },
      timestamp: new Date().toISOString(),
      location: 'Isolated Industrial Shed, Greater Noida Outer Ring',
      actor: 'Unknown / Physical Intruder',
      actorRole: 'UNAUTHORIZED_ACTOR',
      status: 'OPEN',
      assignedInvestigator: 'Meenakshi Iyer',
      riskScore: 98,
      reasons: [
        'Reed switch state transition to OPEN',
        'Interior light exposure: 520 Lux',
        'Kinetic shock impulse: 3.8G',
        'Geo-corridor violation: 3.2 km off route',
      ],
    };
    db.alerts.set(alertId, alert);

    // D. Create Incident
    const incidentId = `INC-${Date.now().toString().slice(-6)}`;
    const incident: Incident = {
      id: incidentId,
      incidentCode: incidentId,
      title: `Active Container Breach: ${pkg.packageCode}`,
      severity: 'CRITICAL',
      status: 'UNDER_INVESTIGATION',
      affectedPackageId: pkg.id,
      affectedPaperId: pkg.paperIds[0],
      assignedInvestigator: 'Meenakshi Iyer (Lead Cyber Forensic Officer)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: `Immediate security containment required. Container ${pkg.packageCode} was opened mid-transit on route to ${pkg.destinationCentreName}.`,
      timeline: [
        {
          timestamp: 'Just now',
          title: 'Physical Container Seal Compromise',
          description: alertReason || 'Reed switch opened and light sensor triggered.',
          actor: 'IoT Telemetry Unit',
          severity: 'CRITICAL',
          location: 'Greater Noida Outer Ring',
        },
      ],
      evidence: [
        {
          id: `EVD-${Date.now()}-1`,
          incidentId,
          name: `Sensor-Telemetry-Crash-Dump-${pkg.packageCode}.bin`,
          type: 'SENSOR_DUMP',
          fileHash: computeSha256(JSON.stringify(event)),
          timestamp: new Date().toISOString(),
          uploadedBy: 'IoT Hardware Autonomous Security Daemon',
          sizeBytes: 1048576,
          verified: true,
          description: 'Hardware tamper interrupt dump from ESP32 secure enclave memory.',
        },
      ],
      resolutionPlaybook: [
        'Freeze package transport authorization immediately in smart contract ledger.',
        'Alert Local Police Task Force & Rapid Response Mobile Security Unit.',
        'Quarantine Paper Batch and switch Exam Centre to Reserve Set C.',
        'Preserve IoT hardware device for cryptographic hash verification and fingerprint analysis.',
      ],
      graphNodes: [
        { id: pkg.id, label: pkg.packageCode, type: 'PACKAGE', risk: 98 },
        { id: pkg.sensorDeviceId, label: `Device ${pkg.sensorDeviceId}`, type: 'DEVICE', risk: 95 },
        { id: alertId, label: 'Tamper Alert', type: 'ALERT', risk: 98 },
        { id: incidentId, label: 'Active Incident', type: 'EVENT', risk: 98 },
      ],
      graphEdges: [
        { from: pkg.id, to: pkg.sensorDeviceId, label: 'monitored by' },
        { from: pkg.sensorDeviceId, to: alertId, label: 'triggered' },
        { from: alertId, to: incidentId, label: 'escalated to' },
      ],
    };
    db.incidents.set(incidentId, incident);

    // E. Record Immutable Ledger Event
    const block = blockchainService.recordEvent({
      packageId: pkg.id,
      actor: 'Autonomous Security Daemon',
      actorRole: 'SYSTEM',
      action: 'PHYSICAL_TAMPER_DETECTED_PACKAGE_FROZEN',
      location: 'Greater Noida Outer Ring (28.4891, 77.5122)',
      device: pkg.sensorDeviceId,
      eventData: {
        packageCode: pkg.packageCode,
        sensorEventId: event.id,
        reedSwitch: 'OPEN',
        lightLux: 520,
        tamperState: 'BREACHED',
        incidentId,
      },
    });

    // F. Append Audit Log
    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'SYSTEM-IOT-DAEMON',
      userName: 'IoT Autonomous Sentinel',
      userRole: 'SECURITY_OFFICER',
      action: 'TAMPER_EVENT_TRIGGERED',
      resourceType: 'PACKAGE',
      resourceId: pkg.id,
      ipAddress: '10.142.99.12',
      deviceFingerprint: `FP-${pkg.sensorDeviceId}`,
      location: 'Greater Noida Outer Ring',
      status: 'FLAGGED',
      details: {
        alertId,
        incidentId,
        blockId: block.blockId,
        txHash: block.txHash,
      },
    });

    return { alert, incident, block, package: pkg };
  }

  // 2. Simulate GPS Route Deviation
  public simulateGpsDeviation(packageId: string = 'ES-PKG-82931', deviationKm: number = 3.5) {
    const pkg = db.packages.get(packageId) || Array.from(db.packages.values())[0];
    if (!pkg) throw new Error('Package not found');

    pkg.routeDeviationKm = deviationKm;
    pkg.currentLocation = {
      lat: 28.512,
      lng: 77.448,
      address: `Unapproved Route Departure Point (${deviationKm} km off authorized corridor)`,
      speedKmh: 22,
    };

    const alertId = `ALT-HIGH-${Date.now().toString().slice(-4)}`;
    const alert: Alert = {
      id: alertId,
      alertCode: alertId,
      severity: 'HIGH',
      type: 'GPS_DEVIATION',
      title: '🚨 GPS Geofence Corridor Deviation Detected',
      description: `Transport vehicle carrying ${pkg.packageCode} departed ${deviationKm} km away from authorized expressway route corridor.`,
      affectedResource: {
        type: 'PACKAGE',
        id: pkg.id,
        label: `Package ${pkg.packageCode}`,
      },
      timestamp: new Date().toISOString(),
      location: pkg.currentLocation.address,
      actor: pkg.transportOfficerName,
      actorRole: 'TRANSPORT_OFFICER',
      status: 'OPEN',
      assignedInvestigator: 'Meenakshi Iyer',
      riskScore: 86,
      reasons: [
        `Corridor departure: ${deviationKm} km (Allowed tolerance: ${db.securityPolicy.routeDeviationThresholdKm} km)`,
        'Vehicle speed fluctuated irregularly',
      ],
    };
    db.alerts.set(alertId, alert);

    const block = blockchainService.recordEvent({
      packageId: pkg.id,
      actor: 'GPS Telemetry Engine',
      actorRole: 'SYSTEM',
      action: 'GEOFENCE_CORRIDOR_DEVIATION_LOGGED',
      location: pkg.currentLocation.address,
      device: pkg.sensorDeviceId,
      eventData: {
        deviationKm,
        speedKmh: 22,
        currentCoords: [pkg.currentLocation.lat, pkg.currentLocation.lng],
      },
    });

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: pkg.transportOfficerId,
      userName: pkg.transportOfficerName,
      userRole: 'TRANSPORT_OFFICER',
      action: 'ROUTE_DEVIATION_FLAGGED',
      resourceType: 'PACKAGE',
      resourceId: pkg.id,
      ipAddress: '10.142.44.88',
      deviceFingerprint: `GPS-NODE-${pkg.sensorDeviceId}`,
      location: pkg.currentLocation.address,
      status: 'FLAGGED',
      details: { deviationKm, alertId, txHash: block.txHash },
    });

    return { alert, block, package: pkg };
  }

  // 3. Simulate Suspicious / Insider User Access
  public simulateSuspiciousAccess(userId: string = 'USR-382', paperId: string = 'PAP-001') {
    const user = db.users.get(userId) || Array.from(db.users.values())[0];
    const paper = db.papers.get(paperId) || Array.from(db.papers.values())[0];

    // Evaluate anomaly
    const riskProfile = evaluateUserAnomaly({
      userId: user.id,
      userName: user.name,
      role: user.role,
      accessHour: 2, // 2 AM
      isAuthorizedHour: false,
      isKnownDevice: false,
      locationDistanceKmFromAssigned: 85,
      failedLoginCount: 4,
      downloadCount: 14,
      recentPaperAccessCount: 12,
      roleEscalationAttempt: true,
    });

    db.userRiskProfiles.set(user.id, riskProfile);
    user.status = 'SUSPENDED';

    const alertId = `ALT-CRIT-${Date.now().toString().slice(-4)}`;
    const alert: Alert = {
      id: alertId,
      alertCode: alertId,
      severity: 'CRITICAL',
      type: 'AI_ANOMALY',
      title: '🚨 Insider Threat Behavioral Anomaly Detected',
      description: `${user.name} (${user.badgeNumber}) accessed confidential paper ${paper.paperCode} at 02:41 AM from untrusted device hardware.`,
      affectedResource: {
        type: 'USER',
        id: user.id,
        label: `${user.name} (${user.role})`,
      },
      timestamp: new Date().toISOString(),
      location: 'External IP 103.21.244.82 (Residential ISP)',
      actor: user.name,
      actorRole: user.role,
      status: 'OPEN',
      assignedInvestigator: 'Meenakshi Iyer',
      riskScore: riskProfile.riskScore,
      reasons: riskProfile.recentViolations,
    };
    db.alerts.set(alertId, alert);

    const block = blockchainService.recordEvent({
      paperId: paper.id,
      actor: user.name,
      actorRole: user.role,
      action: 'SUSPICIOUS_UNSCHEDULED_PAPER_ACCESS',
      location: 'External IP 103.21.244.82',
      device: 'UNTRUSTED_HARDWARE_FINGERPRINT_8A4F',
      eventData: {
        userId: user.id,
        riskScore: riskProfile.riskScore,
        violations: riskProfile.recentViolations,
      },
    });

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UNAUTHORIZED_ACCESS_BLOCKED',
      resourceType: 'PAPER',
      resourceId: paper.id,
      ipAddress: '103.21.244.82',
      deviceFingerprint: 'UNKNOWN-TPM-8A4F',
      location: 'External Untrusted IP',
      status: 'DENIED',
      details: { riskScore: riskProfile.riskScore, alertId, txHash: block.txHash },
    });

    return { alert, block, user, riskProfile };
  }

  // 4. Simulate Document Tampering / Hash Mismatch
  public simulateDocumentModification(paperId: string = 'PAP-001') {
    const paper = db.papers.get(paperId) || Array.from(db.papers.values())[0];
    if (!paper) throw new Error('Paper not found');

    const originalHash = paper.hash;
    // Maliciously modify in-memory hash representation to simulate modification
    paper.previousHash = originalHash;
    paper.hash = computeSha256(`MALICIOUS_INJECTED_QUESTIONS_COMPROMISED_${Date.now()}`);
    paper.isTampered = true;
    paper.status = 'COMPROMISED';

    const alertId = `ALT-CRIT-${Date.now().toString().slice(-4)}`;
    const alert: Alert = {
      id: alertId,
      alertCode: alertId,
      severity: 'CRITICAL',
      type: 'DOCUMENT_MODIFIED',
      title: '🚨 DOCUMENT INTEGRITY FAILURE - SHA-256 Hash Mismatch',
      description: `Cryptographic fingerprint verification failed for ${paper.paperCode}. Current document hash differs from immutable blockchain registry.`,
      affectedResource: {
        type: 'PAPER',
        id: paper.id,
        label: `Paper ${paper.paperCode}`,
      },
      timestamp: new Date().toISOString(),
      location: 'Central Vault Cryptographic Terminal',
      actor: 'Unknown / Forensic Scanner',
      actorRole: 'SYSTEM',
      status: 'OPEN',
      assignedInvestigator: 'Meenakshi Iyer',
      riskScore: 99,
      reasons: [
        `Original Registered Hash: ${originalHash.slice(0, 16)}...`,
        `Current Computed Hash: ${paper.hash.slice(0, 16)}...`,
        'Digital signature verification failed against institutional public key',
      ],
    };
    db.alerts.set(alertId, alert);

    const block = blockchainService.recordEvent({
      paperId: paper.id,
      actor: 'Cryptographic Verification Daemon',
      actorRole: 'SYSTEM',
      action: 'DOCUMENT_TAMPERING_DETECTED_HASH_MISMATCH',
      location: 'Central Vault Cryptographic Terminal',
      device: 'HSM-INTEGRITY-SCANNER-01',
      eventData: {
        paperCode: paper.paperCode,
        originalHash,
        corruptedHash: paper.hash,
        signatureState: 'INVALID',
      },
    });

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'SYSTEM-HSM',
      userName: 'Cryptographic Verification Engine',
      userRole: 'SECURITY_OFFICER',
      action: 'DOCUMENT_INTEGRITY_CHECK_FAILED',
      resourceType: 'PAPER',
      resourceId: paper.id,
      ipAddress: '10.142.0.1',
      deviceFingerprint: 'HSM-CLUSTER-01',
      location: 'Central Vault',
      status: 'DENIED',
      details: { originalHash, currentHash: paper.hash, alertId, txHash: block.txHash },
    });

    return { alert, block, paper, originalHash, currentHash: paper.hash };
  }

  // 5. Simulate Blockchain Integrity Failure
  public simulateBlockchainIntegrityFailure(blockIndex: number = 2) {
    const success = blockchainService.simulateTamperBlock(blockIndex, 'UNAUTHORIZED_DIRECT_DATABASE_ROW_MODIFICATION');

    const alertId = `ALT-CRIT-${Date.now().toString().slice(-4)}`;
    const alert: Alert = {
      id: alertId,
      alertCode: alertId,
      severity: 'CRITICAL',
      type: 'BLOCKCHAIN_INTEGRITY_FAILURE',
      title: '🚨 Cryptographic Chain Integrity Verification Failure',
      description: `Merkle pointer & SHA-256 hash mismatch detected at Block #${blockIndex}. The immutable ledger integrity verification algorithm identified historical data mutation.`,
      affectedResource: {
        type: 'BLOCKCHAIN',
        id: `BLK-${String(blockIndex).padStart(6, '0')}`,
        label: `Block #${blockIndex}`,
      },
      timestamp: new Date().toISOString(),
      location: 'National Blockchain Node Consensus Layer',
      actor: 'Direct Database Injection / Malicious Sysadmin',
      actorRole: 'UNAUTHORIZED_ACTOR',
      status: 'OPEN',
      assignedInvestigator: 'Meenakshi Iyer',
      riskScore: 100,
      reasons: [
        `Block #${blockIndex} hash does not match previousHash pointer of subsequent block`,
        'Asymmetric RSA-2048 digital signature is invalid for modified eventData payload',
      ],
    };
    db.alerts.set(alertId, alert);

    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'SYSTEM-CONSENSUS',
      userName: 'Cryptographic Ledger Validator',
      userRole: 'AUDITOR',
      action: 'CHAIN_INTEGRITY_VIOLATION_TRIGGERED',
      resourceType: 'BLOCKCHAIN',
      resourceId: `BLK-${String(blockIndex).padStart(6, '0')}`,
      ipAddress: '10.142.0.2',
      deviceFingerprint: 'CONSENSUS-ENGINE-NODE-1',
      location: 'Consensus Network',
      status: 'FLAGGED',
      details: { blockIndex, alertId },
    });

    return { alert, blockIndex, success };
  }

  // 6. Simulate Correlated Multi-Vector Attack (Scenario 7)
  public simulateCorrelatedAttack() {
    const paper = Array.from(db.papers.values())[0];
    const pkg = Array.from(db.packages.values())[0];
    const user = db.users.get('USR-382') || Array.from(db.users.values())[0];

    // Trigger all steps in rapid correlation
    this.simulateSuspiciousAccess(user.id, paper.id);
    this.simulateGpsDeviation(pkg.id, 3.8);
    const tamperRes = this.simulatePackageTampering(pkg.id);

    return {
      message: 'Multi-Vector Correlated Attack Scenario Executed: Unscheduled Access + Route Deviation + Physical Container Tampering -> 98/100 CRITICAL SYSTEM RISK',
      affectedPaper: paper.paperCode,
      affectedPackage: pkg.packageCode,
      affectedUser: user.name,
      incident: tamperRes.incident,
      alert: tamperRes.alert,
    };
  }

  // Reset demo state
  public resetDemo() {
    blockchainService.resetChain();
    db.seedDatabase();
    return { success: true, message: 'All papers, packages, sensor states, alerts, and immutable blocks have been reset to pristine baseline state.' };
  }
}

export const simulationEngine = new SimulationEngine();
