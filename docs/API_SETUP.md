# ExamShield API & Provider Integration Guide

ExamShield is engineered with a modular provider architecture that operates flawlessly in offline/in-memory **Demo Mode** while providing turn-key drop-in hooks for enterprise cloud providers and hardware telemetry gateways in **Production Mode**.

---

## 1. Provider Architecture Overview

| Subsystem | Demo Mode (Default) | Production Mode Provider |
| :--- | :--- | :--- |
| **AI Threat Radar** | In-memory TF-IDF + Anomaly rules | Google Gemini Pro API / OpenAI GPT-4o |
| **Logistics Radar** | Leaflet + OpenStreetMap Carto tiles | Google Maps Platform Vector API |
| **Cryptographic Ledger**| Hash-linked Merkle memory chain | Ethereum EVM / Polygon Smart Contracts |
| **IoT Telemetry** | Virtual Sentinel event engine (30 nodes) | AWS IoT Core / MQTT Enterprise Broker |
| **Zero-Trust Auth** | Local RBAC matrix (8 personas) | OAuth2 / Keycloak / SAML Gov-ID |

---

## 2. API Endpoints Reference

### Core Endpoints

#### `GET /api/stats/dashboard`
Returns live system health index, paper status counts, transport logistics status, and active incidents.

#### `GET /api/papers`
Returns the array of all protected examination papers with canonical SHA-256 fingerprints, creator roles, and lifecycle statuses.

#### `POST /api/papers`
Generates a new examination paper with subject, set, marks, duration, and computes its SHA-256 fingerprint.

#### `POST /api/papers/:id/verify`
Computes client-side and server-side canonical SHA-256 hash comparison and validates digital signatures.

#### `POST /api/handover/verify`
Executes zero-trust two-party co-signing for custodial transfer. Rejects transfer if the package is in `TAMPER_LOCKED` state.

#### `GET /api/blockchain/chain`
Returns the full array of immutable blocks from Genesis to head.

#### `POST /api/blockchain/verify-chain`
Performs continuous parent-hash validation from Genesis to head and identifies any corrupted blocks.

#### `POST /api/ai/evaluate-risk`
Evaluates multi-factor behavioral anomalies (access time, untrusted device, location distance, downloads) and outputs a 0-100 score.

#### `POST /api/ai/analyze-leak`
Executes n-gram TF-IDF and cosine vector similarity against protected question bank to detect potential paper leaks.
