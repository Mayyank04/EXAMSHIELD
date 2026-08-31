import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  FileCheck2,
  Fingerprint,
  Flame,
  Globe,
  KeyRound,
  Layers,
  Lock,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Truck,
  UserCheck,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card.tsx';
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';

interface DemoModeViewProps {
  onNavigateToView: (view: string) => void;
  onRefresh: () => void;
}

export const DemoModeView: React.FC<DemoModeViewProps> = ({
  onNavigateToView,
  onRefresh,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isExecutingStep, setIsExecutingStep] = useState<boolean>(false);
  const [stepLogs, setStepLogs] = useState<Record<number, string>>({});

  const demoSteps = [
    {
      step: 1,
      title: 'Generate Secure Examination Paper',
      stage: 'CREATION',
      desc: 'Author Physics National Exam 2027 Set A with 180 questions, syllabus blueprint, and TOP_SECRET classification.',
      icon: FileCheck2,
      actionLabel: 'Execute Paper Generation',
      execute: async () => {
        const res = await api.createPaper({
          subject: 'Physics',
          set: 'A',
          examination: 'National Examination 2027',
          year: 2027,
          durationMinutes: 180,
          totalMarks: 180,
          confidentialityLevel: 'TOP_SECRET',
          creator: 'Dr. Rajeshwar Sharma',
          creatorRole: 'SUPER_ADMIN',
          hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          signature: 'RSA2048-SIG-991829381',
          publicKeyId: 'PUBKEY-2027-MAIN',
          currentCustodian: 'Dr. Rajeshwar Sharma',
          custodianRole: 'SUPER_ADMIN',
          location: 'Central Security Strongroom Enclave',
        });
        return `Paper Set A created. Canonical SHA-256 computed and committed to Block #${res.block?.index || 142}.`;
      },
    },
    {
      step: 2,
      title: 'Compute FIPS 180-4 SHA-256 Digest',
      stage: 'PROTECT',
      desc: 'Calculate canonical SHA-256 fingerprint and asymmetric RSA-2048 digital signature.',
      icon: Fingerprint,
      actionLabel: 'Compute & Verify Digest',
      execute: async () => {
        return 'SHA-256 digest generated: 0x9f83a21... Immutable root signature verified with private enclave key.';
      },
    },
    {
      step: 3,
      title: 'Seal in IoT Smart Container',
      stage: 'SEAL',
      desc: 'Arm magnetic reed switch, ambient lux detector, and accelerometer shock sensors inside physical container.',
      icon: Boxes,
      actionLabel: 'Arm Sensors & Seal Container',
      execute: async () => {
        return 'Container ES-PKG-82931 sealed. Reed switch status: ARMED. Lux threshold: 50. Geofence active.';
      },
    },
    {
      step: 4,
      title: 'Dispatch Armored Transit Convoy',
      stage: 'TRANSPORT',
      desc: 'Assign Transport Escort Commander and plot GPS Haversine corridor route with 2.0 km tolerance.',
      icon: Truck,
      actionLabel: 'Authorize Convoy Dispatch',
      execute: async () => {
        return 'Convoy departed Central Strongroom. Cellular LTE telemetry online. Speed: 42 km/h.';
      },
    },
    {
      step: 5,
      title: 'Simulate Road Corridor Breach',
      stage: 'ATTACK',
      desc: 'Simulate magnetic seal opening and ambient lux spike on expressway to trigger real-time alarm.',
      icon: Flame,
      actionLabel: 'Inject Tamper Event',
      execute: async () => {
        await api.recordIoTEvent({
          deviceId: 'IOT-DEV-001',
          packageId: 'ES-PKG-82931',
          eventType: 'TAMPER_DETECTED',
          location: { lat: 28.5355, lng: 77.391, address: 'Noida Expressway Corridor' },
          sensorValues: { reedSwitch: 'OPEN', temperature: 33.5, light: 490, shock: 2.8 },
          severity: 'CRITICAL',
        });
        return 'Tamper alarm committed! Incident ALT-CRIT-9921 generated. National SOC alerted.';
      },
    },
    {
      step: 6,
      title: 'AI Anomaly & Social Leak Radar',
      stage: 'AI DETECTION',
      desc: 'TF-IDF semantic matching scans public channels for leaked question snippets and flags high similarity.',
      icon: BrainCircuit,
      actionLabel: 'Run Semantic Leak Match',
      execute: async () => {
        return 'Scan complete: 88.4% similarity match detected for Physics Question #14. Threat docket updated.';
      },
    },
    {
      step: 7,
      title: 'Forensic Case Investigation & Triage',
      stage: 'INVESTIGATE',
      desc: 'Review multi-entity relationship graph, sensor timeline logs, and execute automated containment.',
      icon: ShieldAlert,
      actionLabel: 'Open Forensic War Room',
      execute: async () => {
        return 'Forensic docket opened. Sensor dump correlated with GPS coordinates.';
      },
    },
    {
      step: 8,
      title: 'Two-Party Handover at Strongroom',
      stage: 'HANDOVER',
      desc: 'Dual-officer cryptographic consensus requiring simultaneous sign-off from Escort and Superintendent.',
      icon: KeyRound,
      actionLabel: 'Execute Dual Handover',
      execute: async () => {
        return 'Two-party consensus verified. Custody transfer committed to append-only ledger block.';
      },
    },
    {
      step: 9,
      title: 'Autonomous Set B Failover Activation',
      stage: 'FAILOVER',
      desc: 'Instant cryptographic failover invalidates compromised paper Set A and distributes encrypted Set B.',
      icon: Zap,
      actionLabel: 'Trigger Set B Failover',
      execute: async () => {
        await api.activateBackupPaper();
        return 'Emergency failover complete: Set B activated across all 10 exam centres. Set A revoked.';
      },
    },
    {
      step: 10,
      title: 'Immutable Merkle Ledger Verification',
      stage: 'AUDIT',
      desc: 'Verify entire cryptographic block chain sequentially to confirm 100% audit integrity.',
      icon: Layers,
      actionLabel: 'Verify Entire Ledger',
      execute: async () => {
        const res = await api.verifyBlockchainChain();
        return `Merkle verification passed: ${res.totalBlocks || 142} blocks verified with 0 discrepancies.`;
      },
    },
  ];

  const activeStepData = demoSteps[currentStep - 1] || demoSteps[0];

  const handleStepExecute = async () => {
    setIsExecutingStep(true);
    try {
      const msg = await activeStepData.execute();
      setStepLogs((prev) => ({ ...prev, [currentStep]: msg }));
      onRefresh();
    } catch (err: any) {
      setStepLogs((prev) => ({ ...prev, [currentStep]: `Error: ${err.message}` }));
    } finally {
      setIsExecutingStep(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600">
            <Zap className="w-4 h-4" />
            <span>10-STEP MASTER DEMONSTRATION SUITE</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            End-to-End Examination Defense Tour
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Step through creation, sealing, transit breach, AI detection, two-party handover, and Set B failover.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCurrentStep(1);
            setStepLogs({});
          }}
          className="flex items-center gap-1.5 text-xs font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Tour to Step 1</span>
        </Button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        {demoSteps.map((s) => {
          const isCurrent = s.step === currentStep;
          const isDone = !!stepLogs[s.step];

          return (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`p-2.5 rounded-xl border text-center transition cursor-pointer text-xs ${
                isCurrent
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                  : isDone
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-mono font-bold">STEP {s.step}</div>
              <div className="text-[11px] truncate mt-0.5">{s.stage}</div>
            </button>
          );
        })}
      </div>

      {/* Active Step Showcase Card */}
      <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              {activeStepData.step}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">
                STAGE: {activeStepData.stage}
              </span>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {activeStepData.title}
              </h3>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-100 text-slate-700">
            Step {currentStep} of 10
          </span>
        </div>

        <p className="text-xs text-slate-700 font-sans leading-relaxed">
          {activeStepData.desc}
        </p>

        {/* Step Execution Action */}
        <div className="flex flex-wrap items-center gap-3">
          <LiquidButton
            variant="default"
            size="default"
            onClick={handleStepExecute}
            disabled={isExecutingStep}
          >
            <Play className="w-4 h-4" />
            <span>{isExecutingStep ? 'Executing Action...' : activeStepData.actionLabel}</span>
          </LiquidButton>

          {currentStep < 10 && (
            <Button
              variant="outline"
              size="default"
              onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 10))}
              className="text-xs font-semibold"
            >
              <span>Next Stage</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Output Log */}
        {stepLogs[currentStep] && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 font-sans uppercase font-semibold">
              Execution Output:
            </div>
            <div className="font-bold text-indigo-700">{stepLogs[currentStep]}</div>
          </div>
        )}
      </Card>
    </div>
  );
};
