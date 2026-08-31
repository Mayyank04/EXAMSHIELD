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
      desc: 'Author Physics NEET-UG 2027 Set A with 180 questions, syllabus blueprint, and TOP_SECRET classification.',
      icon: FileCheck2,
      actionLabel: 'Execute Paper Generation',
      execute: async () => {
        const res = await api.createPaper({
          subject: 'Physics',
          set: 'A',
          examination: 'NEET-UG 2027 National Exam',
          year: 2027,
          durationMinutes: 180,
          totalMarks: 180,
          confidentialityLevel: 'TOP_SECRET',
        });
        return `Paper ${res.paper.paperCode} generated with ${res.paper.questionsCount} questions. Assigned ID: ${res.paper.id}.`;
      },
    },
    {
      step: 2,
      title: 'Canonical SHA-256 Fingerprinting',
      stage: 'PROTECT',
      desc: 'Canonicalize JSON question array and compute FIPS 180-4 SHA-256 fingerprint.',
      icon: Fingerprint,
      actionLabel: 'Compute Fingerprint',
      execute: async () => {
        const paper = (await api.getPapers())[0];
        return `Canonical SHA-256 digest computed: ${paper.hash.slice(0, 24)}... (FIPS 180-4 standard).`;
      },
    },
    {
      step: 3,
      title: 'PKI Asymmetric Cryptographic Signoff',
      stage: 'SIGN',
      desc: 'Subject Conveners apply RSA-2048 institutional digital signature and commit Genesis event.',
      icon: Lock,
      actionLabel: 'Sign Paper with PKI Key',
      execute: async () => {
        const paper = (await api.getPapers())[0];
        const res = await api.approvePaper(paper.id, 'Dr. Rajeshwar Sharma');
        return `Asymmetric RSA-2048 signature committed in Block #${res.block.index} (${res.block.txHash.slice(0, 18)}...).`;
      },
    },
    {
      step: 4,
      title: 'Smart Electronic Sealing',
      stage: 'SEAL',
      desc: 'Package enclosed in smart box ES-PKG-82931 with RFID seal and active IoT sensor sentinel.',
      icon: Boxes,
      actionLabel: 'Apply Smart Seal',
      execute: async () => {
        const pkg = (await api.getPackages())[0];
        const res = await api.sealPackage(pkg.id, 'Vikramaditya Verma');
        return `Smart Electronic Seal ${pkg.sealId} armed with magnetic reed switch sentinel.`;
      },
    },
    {
      step: 5,
      title: 'Armored Fleet Dispatch',
      stage: 'DISPATCH',
      desc: 'Carrier DL-1VB-9921 departs along authorized National Corridor RT-DEL-NOI with 2.0 km geofence.',
      icon: Truck,
      actionLabel: 'Dispatch Logistics Vehicle',
      execute: async () => {
        return 'Armored transport vehicle DL-1VB-9921 cleared for dispatch along authorized corridor.';
      },
    },
    {
      step: 6,
      title: 'Live Geofenced Logistics Monitoring',
      stage: 'MONITOR',
      desc: 'Telemetry ingestion checks continuous coordinates, interior lux, and thermal envelope.',
      icon: Activity,
      actionLabel: 'Poll Live Sensors',
      execute: async () => {
        const devices = await api.getIoTDevices();
        return `30 IoT sensor nodes transmitting telemetry. Temperature at 24.5°C, Reed Switch: CLOSED.`;
      },
    },
    {
      step: 7,
      title: 'Simulate Route Departure (Corridor Deviation)',
      stage: 'DEVIATION',
      desc: 'Vehicle deviates 3.8 km outside authorized corridor; Haversine algorithm triggers High Severity Alert.',
      icon: Truck,
      actionLabel: 'Simulate GPS Deviation (3.8 km)',
      execute: async () => {
        const pkg = (await api.getPackages())[0];
        const res = await api.simulateGpsDeviation(pkg.id, 3.8);
        return `Route Departure flagged! Haversine distance 3.8 km > 2.0 km tolerance. Alert ${res.alert.alertCode} generated.`;
      },
    },
    {
      step: 8,
      title: 'Simulate Physical Container Breach',
      stage: 'BREACH',
      desc: 'Intruder opens container; magnetic reed switch flips to OPEN and light detector detects 520 Lux.',
      icon: Flame,
      actionLabel: 'Simulate Container Seal Breach',
      execute: async () => {
        const pkg = (await api.getPackages())[0];
        const res = await api.simulateTamper(pkg.id);
        return `CRITICAL BREACH: Container switched to TAMPER_LOCKED. Incident ${res.incident.incidentCode} initialized.`;
      },
    },
    {
      step: 9,
      title: 'AI Threat Engine Anomaly Detection',
      stage: 'AI DETECTION',
      desc: 'Autonomous IsolationForest & TF-IDF correlator aggregates signals into 98/100 Critical Threat index.',
      icon: BrainCircuit,
      actionLabel: 'Run AI Anomaly Correlator',
      execute: async () => {
        const res = await api.evaluateUserRisk({
          userId: 'USR-382',
          accessHour: 2,
          isKnownDevice: false,
          locationDistanceKmFromAssigned: 85,
          failedLoginCount: 4,
          downloadCount: 14,
          recentPaperAccessCount: 12,
          roleEscalationAttempt: true,
        });
        return `AI Threat Score: ${res.riskScore}/100 (CRITICAL). Contributing factors: Off-hours access + untrusted device + bulk download.`;
      },
    },
    {
      step: 10,
      title: 'Forensic Investigation & Resolution',
      stage: 'RESOLVE',
      desc: 'Investigators inspect evidence locker, quarantine compromised batch, and activate Contingency Set B.',
      icon: ShieldCheck,
      actionLabel: 'Activate Reserve Set B & Conclude',
      execute: async () => {
        const paper = (await api.getPapers())[0];
        const res = await api.activateBackupPaper(paper.id);
        return 'Primary paper PHY-NEET-A quarantined. Reserve Set B activated on blockchain. Demonstration successfully concluded!';
      },
    },
  ];

  const activeStep = demoSteps[currentStep - 1];

  const handleExecuteCurrentStep = async () => {
    setIsExecutingStep(true);
    try {
      const resultMessage = await activeStep.execute();
      setStepLogs((prev) => ({ ...prev, [currentStep]: resultMessage }));
      onRefresh();
    } catch (err: any) {
      setStepLogs((prev) => ({ ...prev, [currentStep]: `Error: ${err.message}` }));
    } finally {
      setIsExecutingStep(false);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset demonstration database to pristine baseline state?')) return;
    try {
      await api.resetDemo();
      setCurrentStep(1);
      setStepLogs({});
      onRefresh();
    } catch (err: any) {
      alert(`Reset error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-purple-400">
            <Zap className="w-3.5 h-3.5" />
            <span>GUIDED 10-STEP MASTER DEMONSTRATION TOUR FOR JUDGES</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1 font-heading">
            Master Examination Security Demonstration Mode
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step walkthrough covering generation, fingerprinting, smart logistics, breach detection, AI threat scoring, and resolution.
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>
      </div>

      {/* 10-Step Visual Tracker Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {demoSteps.map((s) => {
            const isCompleted = stepLogs[s.step] !== undefined;
            const isCurrent = currentStep === s.step;

            return (
              <button
                key={s.step}
                onClick={() => setCurrentStep(s.step)}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-between space-y-1 ${
                  isCurrent
                    ? 'bg-purple-950/60 border-purple-500 shadow-md shadow-purple-950/40 text-purple-300'
                    : isCompleted
                    ? 'bg-emerald-950/30 border-emerald-700 text-emerald-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-center gap-1 font-mono font-bold text-[10px]">
                  <span>STEP {s.step}</span>
                  {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
                <div className="text-[9px] font-semibold truncate w-full">{s.stage}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Interaction Station */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Step Execution Console (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold font-mono">
                {activeStep.step}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">
                  STAGE: {activeStep.stage}
                </span>
                <h2 className="text-lg font-bold text-white font-heading">{activeStep.title}</h2>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              Step {currentStep} of 10
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-mono text-[10px] text-slate-400 uppercase font-semibold">
                Objective & Architecture Protocol:
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{activeStep.desc}</p>
            </div>

            {/* Action Trigger Button */}
            <button
              type="button"
              onClick={handleExecuteCurrentStep}
              disabled={isExecutingStep}
              className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              <Play className={`w-4 h-4 ${isExecutingStep ? 'animate-spin' : ''}`} />
              <span>{isExecutingStep ? 'Executing Security State Transition...' : activeStep.actionLabel}</span>
            </button>

            {/* Execution Result Log */}
            {stepLogs[currentStep] && (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-800/80 text-xs text-emerald-300 space-y-1.5 font-mono animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>State Change Verified & Committed</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-200">{stepLogs[currentStep]}</p>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>

            <button
              type="button"
              disabled={currentStep === 10}
              onClick={() => setCurrentStep((prev) => Math.min(10, prev + 1))}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md shadow-blue-600/30 flex items-center gap-2"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Quick View Shortcuts (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4 text-xs">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-heading">Inspection Jump Shortcuts</h3>
              <p className="text-[11px] text-slate-400">Navigate to inspect corresponding live modules:</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onNavigateToView('papers')}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500 text-left text-slate-200 transition flex items-center justify-between"
              >
                <span>Question Papers View</span>
                <FileCheck2 className="w-4 h-4 text-purple-400" />
              </button>

              <button
                onClick={() => onNavigateToView('transport')}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left text-slate-200 transition flex items-center justify-between"
              >
                <span>Armored Transport Radar</span>
                <Truck className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={() => onNavigateToView('incidents')}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500 text-left text-slate-200 transition flex items-center justify-between"
              >
                <span>Incident Room & Evidence</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </button>

              <button
                onClick={() => onNavigateToView('insider')}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left text-slate-200 transition flex items-center justify-between"
              >
                <span>AI Insider Threat Engine</span>
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
              </button>

              <button
                onClick={() => onNavigateToView('blockchain')}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-left text-slate-200 transition flex items-center justify-between"
              >
                <span>Immutable Block Ledger</span>
                <Layers className="w-4 h-4 text-blue-400" />
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 text-center">
            Master Scenario Engine • Continuous Zero-Trust Audit
          </div>
        </div>
      </div>
    </div>
  );
};
