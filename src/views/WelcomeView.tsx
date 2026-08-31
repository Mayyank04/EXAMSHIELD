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
import { LiquidButton, MetalButton } from '../components/ui/liquid-glass-button.tsx';
import { SplineScene } from '../components/ui/splite.tsx';
import { Spotlight } from '../components/ui/spotlight.tsx';

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
      desc: 'Canonical SHA-256 fingerprinting and asymmetric RSA-2048 digital signatures guarantee that even a single altered character triggers an immediate cryptographic mismatch.',
      badge: 'FIPS 180-4 SHA-256',
      tag: '0.00ms Detection',
    },
    {
      icon: Smartphone,
      title: 'IoT Smart Container Fleet',
      desc: 'Active physical electronic seals equipped with magnetic reed switches, ambient light lux sensors, and kinetic shock sentinels enforce autonomous lockdown on breach.',
      badge: '30 Sentinel Nodes',
      tag: 'Hardware Enclave',
    },
    {
      icon: BrainCircuit,
      title: 'AI Threat & Leak Radar',
      desc: 'Continuous behavioral anomaly scoring evaluates insider risks, while N-Gram semantic similarity engines scan public forum dumps for early leak signals.',
      badge: 'IsolationForest Engine',
      tag: 'Semantic NLP',
    },
    {
      icon: Layers,
      title: 'Immutable Merkle Ledger',
      desc: 'Append-only cryptographic block audit ledger ensures non-repudiation across question paper creation, board sign-off, dispatch, and two-party handover.',
      badge: 'Dual-Custody Consensus',
      tag: 'Zero-Trust Chain',
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
    <div className="min-h-screen bg-[#07090D] text-slate-100 selection:bg-blue-600 selection:text-white flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Ambient Spotlight */}
      <Spotlight className="-top-40 left-1/4" fill="#00D9FF" />

      {/* Top Editorial Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-800/60 relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,217,255,0.3)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight font-heading text-white">
                EXAM<span className="text-cyan-400">SHIELD</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v2.4
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 tracking-tight">
              National Examination Security Platform
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span>ALL SYSTEMS OPERATIONAL</span>
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 shadow-[0_0_20px_rgba(0,217,255,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>SOVEREIGN EXAMINATION INTEGRITY INFRASTRUCTURE</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-heading leading-[1.1]">
                Protect Every Paper. <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Secure Every Step.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-sans max-w-xl leading-relaxed">
                Real-time cryptographic protection for confidential examination papers, smart electronic container logistics, physical Faraday strongrooms, and autonomous AI threat detection.
              </p>
            </div>

            {/* CTA Action Controls */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <LiquidButton
                variant="default"
                size="lg"
                onClick={onEnterApp}
              >
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
                <span>ENTER SECURITY COMMAND CENTER</span>
                <ArrowRight className="w-4 h-4" />
              </LiquidButton>

              <MetalButton
                size="lg"
                onClick={onExploreArchitecture}
              >
                <Globe className="w-4 h-4 text-slate-300" />
                <span>EXPLORE 3D SECURITY VAULT</span>
              </MetalButton>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Cryptographic Core</div>
                <div className="text-lg font-extrabold text-white font-heading">FIPS 180-4</div>
                <div className="text-[10px] text-cyan-400 font-mono">SHA-256 Digest</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-mono text-slate-400 uppercase">IoT Sentinel Nodes</div>
                <div className="text-lg font-extrabold text-white font-heading">30 Active</div>
                <div className="text-[10px] text-emerald-400 font-mono">4G / LTE Fleet</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Exam Strongrooms</div>
                <div className="text-lg font-extrabold text-white font-heading">10 Centres</div>
                <div className="text-[10px] text-blue-400 font-mono">Biometrics Armed</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Ledger Nonce</div>
                <div className="text-lg font-extrabold text-white font-heading">100% Immutable</div>
                <div className="text-[10px] text-purple-400 font-mono">Merkle Root Valid</div>
              </div>
            </div>
          </div>

          {/* Right Hero 3D Centerpiece (5 Cols) */}
          <div className="lg:col-span-5 h-[380px] sm:h-[440px] relative rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-slate-900/60 via-[#0B0F14] to-[#10151C] backdrop-blur-2xl shadow-[0_0_50px_rgba(0,217,255,0.1)] overflow-hidden flex items-center justify-center">
            {/* Spline 3D Scene with Error Boundary */}
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />

            {/* Three.js Fallback Canvas container */}
            <div ref={canvasContainerRef} className="hidden" />

            {/* Floating Enclave Pill */}
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-xl flex items-center justify-between text-xs font-mono text-slate-300 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-cyan-300 font-bold">Hardware Security Enclave</span>
              </div>
              <span className="text-[10px] text-slate-500">Zero-Trust Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-slate-800/80">
        <div className="mb-8 space-y-1">
          <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Multi-Layer Security Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
            Four Sovereign Pillars of Examination Defense
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={idx}
                className="border-slate-800/80 bg-slate-900/40 backdrop-blur-xl hover:border-cyan-500/40 transition-all duration-300 p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 bg-cyan-950/50 border border-cyan-800/60">
                      {pillar.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white font-heading">{pillar.title}</h3>
                    <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                  Standard: {pillar.badge}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 11-Stage Lifecycle Strip */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-slate-800/80">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider">
              Chain of Custody Pipeline
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
              11-Stage End-to-End Paper Lifecycle
            </h2>
          </div>
          <button
            onClick={onEnterApp}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Launch Live Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2.5">
          {lifecycleStages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-1.5 hover:border-cyan-500/40 transition"
              >
                <div className="w-7 h-7 mx-auto rounded-lg bg-slate-950 flex items-center justify-center text-cyan-400">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-[9px] font-mono text-slate-500 font-bold">{stage.name}</div>
                <div className="text-[10px] text-slate-200 font-medium leading-tight">{stage.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 py-8 px-6 text-xs text-slate-500 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-heading font-extrabold text-white">EXAMSHIELD</span>
            <span>•</span>
            <span className="font-mono text-[11px]">National Examination Security Platform v2.4</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <button onClick={onEnterApp} className="hover:text-cyan-300 cursor-pointer">
              Command Center
            </button>
            <button onClick={onExploreArchitecture} className="hover:text-cyan-300 cursor-pointer">
              3D Vault
            </button>
            <span className="text-emerald-400">FIPS 140-3 Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
