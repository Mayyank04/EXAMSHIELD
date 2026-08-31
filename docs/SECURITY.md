# ExamShield Security Model & Compliance

ExamShield is designed to adhere to international and sovereign cybersecurity standards for sensitive national examinations.

---

## 1. Compliance & Cryptographic Standards
- **FIPS 180-4**: Standardized SHA-256 canonical hashing for immutable paper fingerprinting.
- **FIPS 140-3 Level 4**: Hardware tamper-sensing architecture modeling active zeroization and autonomous lockdown.
- **NIST SP 800-207**: Zero-Trust Architecture across all custodial handovers, API endpoints, and database queries.
- **PKI Co-Signing (RFC 8017)**: Dual-custody asymmetric digital signoff for question paper approvals and transfers.

---

## 2. Role-Based Access Control (RBAC) Matrix

ExamShield enforces strict separation of duties across 8 primary roles:

| Permission / Action | SUPER_ADMIN | EXAM_AUTHORITY | SECURITY_OFFICER | TRANSPORT_OFFICER | INVESTIGATOR | CENTRE_SUPERINTENDENT | AUDITOR | VIEW_ONLY |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Paper Creation (`paper:create`) | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Paper Signoff (`paper:approve`) | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Physical Sealing (`pkg:seal`) | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Transit Handover (`handover`) | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| Incident Docket (`incident`) | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Evidence Lock (`evidence`) | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Audit Trail Inspection | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 3. Threat Mitigation Matrix

| Threat Vector | Mitigation Strategy | Enforcing Layer |
| :--- | :--- | :--- |
| **Paper Leaks & Premature Disclosure** | Canonical SHA-256 fingerprinting + AI cosine similarity scanner | Cryptographic Core + AI NLP Engine |
| **Physical Box Tampering Mid-Transit** | Magnetic reed switch + 100 Lux light detector triggering autonomous tamper-lock | IoT ESP32 Smart Box Firmware |
| **Logistics Vehicle Hijacking / Deviation**| Haversine vector distance calculations with 2.0 km corridor tolerance alarm | Armored Transit Radar Subsystem |
| **Insider Custodian Collusion** | Zero-trust two-party co-signing requiring both sender and receiver credentials | Consensus Smart Contract Layer |
| **Historical Audit Log Alteration** | Append-only hash-linked Merkle blockchain with parent hash pointers | Cryptographic Blockchain Chain |
