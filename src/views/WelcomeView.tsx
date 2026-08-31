import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Cpu,
  FileCheck2,
  Fingerprint,
  Flame,
  Globe,
  KeyRound,
  Layers,
  Lock,
  MapPin,
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  Users,
  Zap,
} from 'lucide-react';
import { SecurityCoreScene } from '../3d/SecurityCoreScene.ts';
import { isWebGLAvailable } from '../3d/threeUtils.ts';

interface WelcomeViewProps {
  onEnterApp: () => void;
  onExploreArchitecture: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onEnterApp,
  onExploreArchitecture,
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneInstanceRef = useRef<SecurityCoreScene | null>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const webglOk = isWebGLAvailable();
    setHasWebGL(webglOk);

    if (webglOk && canvasContainerRef.current) {
      sceneInstanceRef.current = new SecurityCoreScene(canvasContainerRef.current);
    }

    return () => {
      if (sceneInstanceRef.current) {
        sceneInstanceRef.current.destroy();
        sceneInstanceRef.current = null;
      }
    };
  }, []);

  const pillars = [
    {
      icon: Fingerprint,
      title: 'Cryptographic Integrity Core',
      desc: 'Canonicalized SHA-256 fingerprinting and asymmetric digital signatures ensure that not a single word can be modified without instant detection.',
      badge: 'FIPS 180-4 SHA-256',
      accent: 'border-blue-500/30 text-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
    },
    {
      icon: Smartphone,
      title: 'IoT Smart Container Fleet',
      desc: 'Active electronic seals equipped with magnetic reed switches, ambient lux detectors, and kinetic shock sensors trigger autonomous lockdown on breach.',
      badge: '30 Hardware Nodes',
      accent: 'border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20',
    },
    {
      icon: BrainCircuit,
      title: 'AI Threat & Leak Radar',
      desc: 'Continuous behavioral anomaly scoring uncovers insider risks while neural semantic similarity engines detect leaked questions across social media.',
      badge: 'IsolationForest + Gemini',
      accent: 'border-purple-500/30 text-purple-600 bg-purple-50/50 dark:bg-purple-950/20',
    },
    {
      icon: Layers,
      title: 'Immutable Merkle Ledger',
      desc: 'Append-only hash-linked block audit trail ensures non-repudiation across creation, board sign-off, dispatch, and two-party handover.',
      badge: 'Dual-Custody Consensus',
      accent: 'border-amber-500/30 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20',
    },
  ];

  const lifecycleStages = [
    { name: 'CREATE', label: 'Paper Generation', icon: FileCheck2 },
    { name: 'PROTECT', label: 'SHA-256 Fingerprint', icon: Fingerprint },
    { name: 'SEAL', label: 'Smart IoT Box', icon: Boxes },
    { name: 'TRANSPORT', label: 'Geofenced Transit', icon: Truck },
    { name: 'MONITOR', label: 'Live Telemetry', icon: Radio },
    { name: 'DETECT', label: 'AI Threat Engine', icon: BrainCircuit },
    { name: 'INVESTIGATE', label: 'Forensic Case Docket', icon: ShieldAlert },
    { name: 'VERIFY', label: 'Two-Party Handover', icon: KeyRound },
    { name: 'RESPOND', label: 'Set B Failover', icon: Zap },
    { name: 'AUDIT', label: 'Immutable Block', icon: Layers },
    { name: 'TRUST', label: 'Sovereign Integrity', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-slate-900 selection:bg-blue-600 selection:text-white flex flex-col font-sans transition-colors duration-300">
      {/* Top Welcome Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight font-heading text-slate-900">
              EXAM<span className="text-blue-600">SHIELD</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 tracking-tight">
              AI-Powered Examination Paper Security Platform
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExploreArchitecture}
            className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 transition"
          >
            Architecture
          </button>
          <button
            onClick={onEnterApp}
            className="px-5 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition shadow-xl shadow-slate-950/20 flex items-center gap-2"
          >
            <span>ENTER EXAMSHIELD</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section with 3D Floating Security Core */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
        {/* Left Column: Headlines & Editorial Copy */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>NATIONAL EXAMINATION SECURITY ARCHITECTURE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 font-heading leading-[1.1]">
            Secure every question before it reaches the examination hall.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-sans">
            AI-powered examination paper lifecycle security, cryptographic verification, intelligent logistics monitoring, and real-time incident response built for sovereign national integrity.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <button
              onClick={onEnterApp}
              className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold tracking-wide transition shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 group"
            >
              <span>ENTER EXAMSHIELD COMMAND</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreArchitecture}
              className="px-6 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2"
            >
              <Cpu className="w-4 h-4 text-slate-500" />
              <span>EXPLORE SECURITY ARCHITECTURE</span>
            </button>
          </div>

          {/* Live Telemetry Status Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200/80">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-0.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Security Status</div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>VERIFIED</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-0.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">AI Threat Radar</div>
              <div className="text-xs font-bold text-purple-600 flex items-center gap-1 font-mono">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>ACTIVE</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-0.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Cryptography</div>
              <div className="text-xs font-bold text-blue-600 flex items-center gap-1 font-mono">
                <Lock className="w-3.5 h-3.5" />
                <span>SHA-256 / RSA</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-0.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Transit Mesh</div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1 font-mono">
                <Truck className="w-3.5 h-3.5" />
                <span>10 CORRIDORS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Interactive Capsule Visual */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="w-full aspect-square max-w-[500px] relative rounded-3xl bg-gradient-to-b from-slate-900 to-[#0B0F1A] border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center">
            {hasWebGL ? (
              <div ref={canvasContainerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
            ) : (
              <div className="p-8 text-center space-y-3 text-slate-300">
                <Shield className="w-16 h-16 text-blue-500 mx-auto" />
                <h4 className="font-bold text-white">Cryptographic Security Enclave</h4>
                <p className="text-xs text-slate-400">Zero-Trust Protected Question Paper Core</p>
              </div>
            )}

            {/* Subtle Overlay Badge */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/70 backdrop-blur-md border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="font-mono text-[11px]">3D Cryptographic Core • Interactive</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">FIPS 140-3 Level 4</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="w-full bg-white border-y border-slate-200/80 py-20">
        <div className="w-full max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-widest text-blue-600 uppercase">
              DEFENSE-IN-DEPTH ARCHITECTURE
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-950 font-heading">
              Four Pillars of Sovereign Examination Integrity
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Engineered with zero trust principles, hardware-rooted cryptography, and autonomous sensor sentinels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-[#F8F7F4] border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${p.accent}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 font-heading">{p.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">{p.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-200">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{p.badge}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Lifecycle Pipeline Showcase */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-mono font-bold tracking-widest text-purple-600 uppercase">
            END-TO-END VERIFIABILITY
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-950 font-heading">
            The Sovereign Examination Security Lifecycle
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Every transition from authoring to post-exam archival produces an immutable cryptographic signature.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-3">
          {lifecycleStages.map((stage, sIdx) => {
            const StageIcon = stage.icon;
            return (
              <div
                key={stage.name}
                className="p-3 rounded-2xl bg-white border border-slate-200 text-center space-y-2 flex flex-col items-center justify-center shadow-sm"
              >
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <StageIcon className="w-4 h-4" />
                </div>
                <div className="text-[10px] font-mono font-bold text-slate-900">{stage.name}</div>
                <div className="text-[9px] text-slate-500 leading-tight">{stage.label}</div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl font-bold font-heading">Ready to inspect the live command platform?</h3>
            <p className="text-xs text-slate-400 font-sans max-w-md">
              Launch into the command center, simulate container breaches, evaluate AI anomalies, or run the 10-step demo tour.
            </p>
          </div>
          <button
            onClick={onEnterApp}
            className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide transition shadow-xl shadow-blue-600/30 shrink-0 flex items-center gap-2"
          >
            <span>LAUNCH COMMAND CONSOLE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 font-mono">
        ExamShield National Examination Paper Security & Integrity Platform • Built for Sovereign Defense
      </footer>
    </div>
  );
};
