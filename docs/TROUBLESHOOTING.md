# ExamShield Troubleshooting Guide

Common scenarios and diagnostic resolutions when operating or demonstrating ExamShield:

---

## 1. Port 3000 Already in Use
**Symptom**: `Error: listen EADDRINUSE: address already in use :::3000`
**Resolution**:
Either kill the process occupying port 3000:
```bash
lsof -ti :3000 | xargs kill -9
```
Or set a custom port before starting:
```bash
PORT=3001 npm run dev
```

---

## 2. WebGL Canvas Not Rendering
**Symptom**: 3D Security Core or 3D Vault displays fallback 2D message.
**Resolution**:
- Ensure hardware acceleration is enabled in your browser settings (`chrome://settings/system` -> "Use graphics acceleration when available").
- The application automatically falls back to an elegant 2D telemetry display when WebGL is unavailable.

---

## 3. Map Container Already Initialized
**Symptom**: `Error: Map container is already initialized.`
**Resolution**:
- ExamShield wraps all Leaflet maps with clean lifecycle cleanup (`mapInstanceRef.current.remove()`) upon unmount to eliminate memory leaks.

---

## 4. Resetting Demonstration State
**Symptom**: You simulated attacks and want to reset the state back to pristine baseline.
**Resolution**:
- Click the **"Reset Demo"** button on the top navbar or visit the **10-Step Demo Tour** (`demo`) / **Attack Lab** (`simulator`) and click **"Reset Baseline"**.
