# EXAMSHIELD
### AI-Powered Sovereign Examination Paper Security, Integrity & Incident Response Platform

```
  ███████╗██╗  ██╗ █████╗ ███╗   ███╗███████╗██╗  ██╗██╗███████╗██╗     ██████╗ 
  ██╔════╝╚██╗██╔╝██╔══██╗████╗ ████║██╔════╝██║  ██║██║██╔════╝██║     ██╔══██╗
  █████╗   ╚███╔╝ ███████║██╔████╔██║███████╗███████║██║█████╗  ██║     ██║  ██║
  ██╔══╝   ██╔██╗ ██╔══██║██║╚██╔╝██║╚════██║██╔══██║██║██╔══╝  ██║     ██║  ██║
  ███████╗██╔╝ ██╗██║  ██║██║ ╚═╝ ██║███████║██║  ██║██║███████╗███████╗██████╔╝
  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═════╝ 
```

**ExamShield** is an enterprise-grade, defense-in-depth cybersecurity and examination paper integrity platform engineered for national examination bodies (e.g. NEET-UG, JEE, UPSC Civil Services, State University Boards).

It combines **FIPS 180-4 canonical SHA-256 fingerprinting**, **asymmetric PKI digital co-signatures**, **IoT smart electronic containers**, **AI behavioral anomaly detection (IsolationForest + Gemini)**, **semantic leak convergence scanning**, and an **append-only hash-linked Merkle blockchain audit ledger**.

---

## Key Pillars of Sovereign Exam Security

1. **Cryptographic Integrity Core**:
   - Canonicalized question paper JSON structure.
   - Deterministic SHA-256 digests and RSA-2048 conveners' asymmetric signatures.
   - Interactive Tamper Station demonstrating character-by-character divergence detection.

2. **IoT Smart Container Fleet (30 Nodes)**:
   - Magnetic reed switch sentinels, ambient light lux sensors, and kinetic shock monitoring.
   - Autonomous hardware lockdown (`TAMPER_LOCKED`) when seal is breached in transit.

3. **Armored Logistics Radar & Geofencing**:
   - Live Leaflet vector radar tracking transport carriers.
   - Real-time Haversine orthogonal distance calculations with 2.0 km corridor tolerance alarm.

4. **Zero-Trust Two-Party Custodial Handover**:
   - Simultaneous co-signing required from Dispatching Officer and Receiving Superintendent.
   - Smart contract consensus layer rejects transfers if container is compromised.

5. **AI Behavioral Threat Engine & Leak Radar**:
   - Continuous anomaly evaluation for off-hours access (02:00 AM), untrusted devices, and bulk downloads.
   - N-Gram TF-IDF and Cosine vector similarity engine scanning forum leaks against the confidential question bank.

6. **Append-Only Merkle Blockchain Ledger**:
   - Hash-linked block audit trail from Genesis to head.
   - Interactive "Verify Ledger Integrity" validator detecting historical database row mutations.

7. **Interactive 3D Security Vault**:
   - Three.js WebGL interactive 3D mesh visualizing vault nodes, papers, logistics, and active threats.

---

## 8 Primary RBAC Roles

ExamShield features strict separation of duties:
1. `SUPER_ADMIN` (Dr. Rajeshwar Sharma — Chief Controller of Examinations)
2. `EXAM_AUTHORITY` (Dr. Sunita Deshmukh — Senior Examination Authority)
3. `SECURITY_OFFICER` (Vikramaditya Verma — Principal Cyber Defense Officer)
4. `TRANSPORT_OFFICER` (Rajinder Singh Gill — Logistics Transport Commander)
5. `INVESTIGATOR` (Kavita Nair — Senior Cyber Forensic Investigator)
6. `CENTRE_SUPERINTENDENT` (Prof. Harish Chandra — Centre Superintendent)
7. `AUDITOR` (Ananya Mukherjee — Statutory Integrity Auditor)
8. `VIEW_ONLY` (Observer — Read-only telemetry access)

---

## Quick Start Guide

### Prerequisites
- Node.js version 18.0.0+
- npm version 9.0.0+

### Run Locally
```bash
# 1. Install dependencies
npm install

# 2. Start Fullstack Dev Server (Port 3000)
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## Verification & Build

```bash
# Typecheck (0 errors)
npm run lint

# Production Build
npm run build

# Start Production Server
npm start
```

---

## Documentation Index

- **[System Architecture & Threat Model](docs/ARCHITECTURE.md)**: Deep dive into the cryptographic trust root, IoT hardware sentinels, and AI threat engine.
- **[Hackathon Demonstration Guide](docs/DEMO.md)**: Step-by-step 5-minute and 10-minute presentation guide for evaluators.
- **[Security & RBAC Matrix](docs/SECURITY.md)**: Role permissions, compliance standards (FIPS 180-4, NIST SP 800-207), and threat mitigation matrix.
- **[API & Provider Integration](docs/API_SETUP.md)**: REST endpoints and Provider configuration for Gemini, Google Maps, and Blockchain RPC.
- **[Production Deployment](docs/DEPLOYMENT.md)**: Build pipelines, environment configuration, and Docker containerization.
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)**: Common diagnostic steps and baseline state reset.

---

## License
Confidential Sovereign Examination Security Platform • Engineered for National Integrity.
