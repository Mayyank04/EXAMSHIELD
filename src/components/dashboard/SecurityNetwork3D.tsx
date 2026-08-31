import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  FileCheck2,
  Fingerprint,
  Flame,
  Globe,
  Lock,
  Radio,
  Shield,
  ShieldCheck,
  Smartphone,
  Truck,
  Zap,
} from 'lucide-react';
import { LiquidButton, MetalButton } from '../ui/liquid-glass-button.tsx';
import { SplineScene } from '../ui/splite.tsx';
import { Spotlight } from '../ui/spotlight.tsx';

interface SecurityNetwork3DProps {
  systemScore?: number;
  activeThreatsCount?: number;
  papersCount?: number;
  inTransitCount?: number;
  centresCount?: number;
  iotDevicesCount?: number;
  onNavigateToView: (view: string) => void;
  onRefresh: () => void;
}

export const SecurityNetwork3D: React.FC<SecurityNetwork3DProps> = ({
  systemScore = 98,
  activeThreatsCount = 0,
  papersCount = 0,
  inTransitCount = 3,
  centresCount = 10,
  iotDevicesCount = 30,
  onNavigateToView,
  onRefresh,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-full rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-950 via-[#050B18] to-[#0A1425] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,217,255,0.08)] overflow-hidden"
    >
      {/* Background Ambient Spotlights */}
      <Spotlight className="-top-32 left-10" fill="#00D9FF" />
      <Spotlight className="top-20 right-0" fill="#8B5CF6" />

      {/* Cyber Grid Texture Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Command Center Hero Copy & Key Infrastructure Metrics (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_15px_rgba(0,217,255,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
              LIVE SYSTEM STATUS • ALL SYSTEMS OPERATIONAL
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading leading-[1.15]">
              National Examination <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Security Command Center
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-xl leading-relaxed">
              Real-time protection for examination papers, autonomous IoT container logistics monitoring, AI anomaly behavioral radar, and immutable Merkle audit ledger.
            </p>
          </div>

          {/* Infrastructure Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-cyan-400" />
                <span>IoT Sensors</span>
              </div>
              <div className="text-xl font-extrabold text-white font-heading">{iotDevicesCount || 30}</div>
              <div className="text-[9px] font-mono text-cyan-400">Active Sentinel Nodes</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>Exam Centres</span>
              </div>
              <div className="text-xl font-extrabold text-white font-heading">{centresCount || 10}</div>
              <div className="text-[9px] font-mono text-emerald-400">Faraday Strongrooms</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Boxes className="w-3 h-3 text-purple-400" />
                <span>Containers</span>
              </div>
              <div className="text-xl font-extrabold text-white font-heading">24</div>
              <div className="text-[9px] font-mono text-purple-400">Electronic Sealed</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>Ledger Root</span>
              </div>
              <div className="text-xl font-extrabold text-white font-heading">{systemScore > 80 ? '99.4%' : '88.2%'}</div>
              <div className="text-[9px] font-mono text-blue-400">Merkle Integrity</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <LiquidButton
              variant="default"
              size="default"
              onClick={() => onNavigateToView('demo')}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              <span>10-Step Master Demo Tour</span>
            </LiquidButton>

            <LiquidButton
              variant="violet"
              size="default"
              onClick={() => onNavigateToView('simulator')}
            >
              <Flame className="w-3.5 h-3.5 text-purple-300" />
              <span>Security Attack Lab</span>
            </LiquidButton>

            <MetalButton
              size="default"
              onClick={() => onNavigateToView('verification')}
            >
              <Fingerprint className="w-3.5 h-3.5 text-slate-300" />
              <span>Verify SHA-256</span>
            </MetalButton>
          </div>
        </div>

        {/* Right Column: 3D Security Visualization with Spline & Spotlight (5 Cols) */}
        <div className="lg:col-span-5 h-[340px] sm:h-[380px] relative rounded-2xl border border-cyan-500/20 bg-slate-950/60 backdrop-blur-xl overflow-hidden flex items-center justify-center shadow-[inset_0_0_30px_rgba(0,217,255,0.05)]">
          {/* Subtle Outer Glow Frame */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none z-10" />

          {/* Spline 3D Scene */}
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />

          {/* Floating Cyber Badge */}
          <div className="absolute bottom-3 left-3 right-3 z-20 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex items-center justify-between text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-300 font-bold">3D Cryptographic Enclave</span>
            </div>
            <span className="text-slate-500 text-[10px]">FIPS 140-3 Level 4</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
