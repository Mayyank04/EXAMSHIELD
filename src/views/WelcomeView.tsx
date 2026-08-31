import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
import { Card, CardContent } from '../components/ui/card.tsx';
import { LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { SplineScene } from '../components/ui/splite.tsx';

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
      title: 'Cryptographic Core',
      desc: 'Canonical SHA-256 digests and RSA-2048 digital signatures ensure complete non-repudiation and instant tamper detection.',
      badge: 'FIPS 180-4 SHA-256',
      tag: 'Integrity',
    },
    {
      icon: Smartphone,
      title: 'Smart Container Fleet',
      desc: 'Active electronic seals with reed switches, ambient lux sensors, and kinetic shock monitoring trigger autonomous lockdown on breach.',
      badge: '30 IoT Sentinels',
      tag: 'Hardware Enclave',
    },
    {
      icon: BrainCircuit,
      title: 'AI Threat Intelligence',
      desc: 'Continuous behavioral anomaly scoring and N-Gram semantic analysis detect insider threats and leaked question papers.',
      badge: 'IsolationForest + NLP',
      tag: 'AI Detection',
    },
    {
      icon: Layers,
      title: 'Immutable Ledger',
      desc: 'Append-only Merkle block audit trail verifies every custody transfer, approval signature, and dispatch milestone.',
      badge: 'Dual-Custody Consensus',
      tag: 'Audit Trail',
    },
  ];

  const lifecycleStages = [
    { name: 'CREATE', label: 'Paper Generation', icon: FileCheck2 },
    { name: 'PROTECT', label: 'SHA-256 Digest', icon: Fingerprint },
    { name: 'SEAL', label: 'Smart IoT Box', icon: Boxes },
    { name: 'TRANSPORT', label: 'Geofenced Transit', icon: Truck },
    { name: 'MONITOR', label: 'Live Telemetry', icon: Radio },
    { name: 'DETECT', label: 'AI Threat Radar', icon: BrainCircuit },
    { name: 'INVESTIGATE', label: 'Forensic Docket', icon: ShieldAlert },
    { name: 'VERIFY', label: 'Two-Party Handover', icon: KeyRound },
    { name: 'RESPOND', label: 'Set B Failover', icon: Zap },
    { name: 'AUDIT', label: 'Merkle Block', icon: Layers },
    { name: 'TRUST', label: 'Sovereign Integrity', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-600 selection:text-white flex flex-col font-sans relative overflow-x-hidden">
      {/* Top Editorial Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-200/80 bg-white/70 backdrop-blur-xl sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight font-heading text-slate-900">
                EXAM<span className="text-indigo-600">SHIELD</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                v2.4
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium tracking-tight">
              National Examination Security Platform
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All systems operational</span>
          </div>

          <LiquidButton
            variant="default"
            size="sm"
            onClick={onEnterApp}
          >
            <span>Enter Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </LiquidButton>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-12 sm:pt-16 pb-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Narrative (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-semibold text-indigo-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>National Examination Security Infrastructure</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-heading leading-[1.1]">
                Secure Every Paper. <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Protect Every Examination.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 font-sans max-w-xl leading-relaxed">
                A unified security platform for examination papers, secure logistics, cryptographic verification, threat intelligence, and examination infrastructure.
              </p>
            </div>

            {/* CTA Action Controls */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <LiquidButton
                variant="default"
                size="lg"
                onClick={onEnterApp}
                className="px-8 py-3.5 text-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Enter Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </LiquidButton>

              <button
                onClick={onExploreArchitecture}
                className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 px-3 py-2 transition cursor-pointer"
              >
                <span>Explore Security Architecture</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200/80">
              <div className="space-y-0.5">
                <div className="text-[11px] font-medium text-slate-500 uppercase">Cryptographic Core</div>
                <div className="text-xl font-extrabold text-slate-900 font-heading">FIPS 180-4</div>
                <div className="text-[11px] text-indigo-600 font-medium">SHA-256 Verified</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[11px] font-medium text-slate-500 uppercase">IoT Containers</div>
                <div className="text-xl font-extrabold text-slate-900 font-heading">30 Sentinels</div>
                <div className="text-[11px] text-emerald-600 font-medium">Active Telemetry</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[11px] font-medium text-slate-500 uppercase">Exam Strongrooms</div>
                <div className="text-xl font-extrabold text-slate-900 font-heading">10 Centres</div>
                <div className="text-[11px] text-blue-600 font-medium">Biometrics Armed</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[11px] font-medium text-slate-500 uppercase">Audit Ledger</div>
                <div className="text-xl font-extrabold text-slate-900 font-heading">99.9%</div>
                <div className="text-[11px] text-purple-600 font-medium">Chain Integrity</div>
              </div>
            </div>
          </div>

          {/* Right Hero 3D Centerpiece (5 Cols) */}
          <div className="lg:col-span-5 h-[380px] sm:h-[440px] relative rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-slate-50 to-indigo-50/30 shadow-md overflow-hidden flex items-center justify-center">
            {/* Spline 3D Scene with Error Boundary */}
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />

            {/* Three.js Fallback Canvas container */}
            <div ref={canvasContainerRef} className="hidden" />

            {/* Floating Security Badge */}
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-white/90 border border-slate-200 backdrop-blur-md flex items-center justify-between text-xs font-medium text-slate-700 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-900 font-bold">Hardware Security Enclave</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">FIPS 140-3 Level 4</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-slate-200/80">
        <div className="mb-8 space-y-1">
          <div className="text-[11px] font-mono font-bold text-indigo-600 uppercase tracking-wider">
            Security Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            Four Pillars of Examination Defense
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={idx}
                className="border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100">
                      {pillar.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-heading">{pillar.title}</h3>
                    <p className="text-xs text-slate-600 font-sans mt-1 leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-500">
                  Standard: {pillar.badge}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 11-Stage Lifecycle Strip */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-slate-200/80">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-mono font-bold text-indigo-600 uppercase tracking-wider">
              Chain of Custody Pipeline
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              11-Stage Examination Lifecycle
            </h2>
          </div>
          <button
            onClick={onEnterApp}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2.5">
          {lifecycleStages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1.5 hover:border-indigo-300 hover:shadow-sm transition"
              >
                <div className="w-7 h-7 mx-auto rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-[9px] font-mono text-slate-400 font-bold">{stage.name}</div>
                <div className="text-[10px] text-slate-800 font-semibold leading-tight">{stage.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white py-8 px-6 text-xs text-slate-500 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-heading font-extrabold text-slate-900">EXAMSHIELD</span>
            <span>•</span>
            <span className="text-[11px]">National Examination Security Platform v2.4</span>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-medium">
            <button onClick={onEnterApp} className="hover:text-indigo-600 cursor-pointer">
              Command Center
            </button>
            <button onClick={onExploreArchitecture} className="hover:text-indigo-600 cursor-pointer">
              Security Vault
            </button>
            <span className="text-emerald-600">FIPS 140-3 Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
