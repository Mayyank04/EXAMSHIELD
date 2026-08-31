# ExamShield System Architecture & Threat Model

## Executive Overview
ExamShield is an enterprise cybersecurity and sovereign exam-integrity platform engineered to protect high-stakes national examinations (e.g. NEET-UG, JEE, Civil Services, University Board Examinations) against leakage, physical tampering, unauthorized transit departure, and insider compromise.

```
+------------------------------------------------------------------------------------------------+
|                                     EXAMSHIELD SOVEREIGN CORE                                  |
+------------------------------------------------------------------------------------------------+
                                                 |
         +--------------------+------------------+-------------------+--------------------+
         |                    |                                      |                    |
+-----------------+  +------------------+                   +-----------------+  +-----------------+
| Cryptographic   |  | IoT Smart Box    |                   | AI Anomaly &    |  | Append-Only     |
| Integrity Core  |  | Fleet Sentinel   |                   | Threat Engine   |  | Merkle Ledger   |
+-----------------+  +------------------+                   +-----------------+  +-----------------+
| • Canonicalized |  | • Reed Switch    |                   | • Isolation     |  | • Genesis to    |
|   SHA-256 Hash  |  | • Light Lux (500)|                   |   Forest NLP    |    Head Linkage  |
| • Asymmetric    |  | • Kinetic Shock  |                   | • Cosine Leak   |  | • Dual-Party    |
|   RSA Signoff   |  | • 2km Corridor   |                   |   Vector Match  |    Consensus     |
| • Character-Diff|  | • Tamper-Lock    |                   | • Risk Scoring  |  | • Real Mutate   |
|   Validation    |  |   Autonomous     |                   |   (0-100 index) |    Detection     |
+-----------------+  +------------------+                   +-----------------+  +-----------------+
```

---

## Defense-in-Depth Layered Architecture

### 1. Cryptographic Trust Root & Canonicalization
- **FIPS 180-4 Canonical SHA-256 Hashing**: Prior to hashing, question arrays, metadata, and choices are canonically sorted and stripped of non-deterministic whitespace.
- **Asymmetric PKI Digital Signatures**: Every paper approval requires cryptographic co-signing by Subject Conveners and Chief Examination Authorities using RSA-2048 / ECDSA keys.
- **Instant Character Diff Detection**: Tamper station detects 1-character deviations and computes real-time cryptographic divergence.

### 2. Smart Container IoT Fleet Sentinel
- **Sensors Array**:
  - **Magnetic Reed Contact Switch**: Monitors physical door opening (`CLOSED` vs `OPEN`).
  - **Ambient Light (Lux)**: Triggers autonomous lockdown when interior exposure exceeds 100 Lux in transit.
  - **Kinetic Shock Accelerometer (G)**: Flags violent handling or unauthorized container impact (>3.0G).
  - **Thermal & Humidity Sensor**: Ensures environment adheres to paper security standards (18°C - 28°C).
- **Autonomous Lockdown Protocol**: The moment a container is breached mid-transit, its state switches to `TAMPER_LOCKED`. Handover at the destination exam centre is strictly blocked until forensic authorization.

### 3. Armored Logistics Radar & Geofence Corridor
- **Haversine Vector Calculations**: Calculates orthogonal distance between live carrier GPS coordinates and the authorized transit corridor.
- **Corridor Tolerance**: Departure > 2.0 km automatically triggers a high-severity `ROUTE_DEVIATION` incident docket.

### 4. Zero-Trust Two-Party Custodial Handover
- **Dual-Authentication Handshake**: Handover requires simultaneous authorization from:
  1. Dispatching Armored Transport Officer (`Party A`)
  2. Receiving Exam Centre Superintendent (`Party B`)
- **Block Rejection**: If the package is marked `TAMPER_LOCKED`, the smart contract consensus layer rejects the transfer and prompts incident triage.

### 5. AI Behavioral Threat Profiling & Leak Scanner
- **Behavioral Anomaly Correlator**: Evaluates off-hours logins (02:00 AM), untrusted device fingerprints, geo-distance deviations, and bulk document downloads to produce an explainable risk score (0-100).
- **N-Gram TF-IDF & Cosine Similarity Leak Radar**: Compares social media post dumps or OCR extracts against the national question bank to detect leaked question papers before exam commencement.

### 6. Append-Only Hash-Linked Merkle Ledger
- **Block Chaining**: Every custody event, paper approval, and seal verification creates a new block where `previousHash` links to the predecessor.
- **Interactive Ledger Validation**: The "Verify Ledger Integrity" feature audits all block pointers from Genesis to head, instantly pinpointing corrupted rows or malicious database mutations.
