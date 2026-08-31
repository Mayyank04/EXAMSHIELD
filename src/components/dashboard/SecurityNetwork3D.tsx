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
import { Button, LiquidButton } from '../ui/liquid-glass-button.tsx';
import { SplineScene } from '../ui/splite.tsx';

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
  papersCount = 4,
  inTransitCount = 3,
  centresCount = 10,
  iotDevicesCount = 30,
  onNavigateToView,
  onRefresh,
}) => {
  return (
    <div className="relative w-full rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm overflow-hidden">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Command Center Hero Narrative & Infrastructure (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
              ALL SYSTEMS OPERATIONAL • ZERO TAMPER EVENTS
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-heading leading-[1.15]">
              National Examination <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Security Command Center
              </span>
            </h1>
            <p className="text-sm text-slate-600 font-sans max-w-xl leading-relaxed">
              National examination security at a glance. Real-time protection for examination papers, autonomous IoT container logistics monitoring, AI anomaly radar, and immutable Merkle ledger.
            </p>
          </div>

          {/* Infrastructure Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                <span>IoT Sensors</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-heading">{iotDevicesCount || 30}</div>
              <div className="text-[10px] text-indigo-600 font-medium">Active Sentinels</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>Exam Centres</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-heading">{centresCount || 10}</div>
              <div className="text-[10px] text-emerald-600 font-medium">Faraday Enclaves</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-purple-600" />
                <span>Containers</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-heading">{inTransitCount || 3} Transit</div>
              <div className="text-[10px] text-purple-600 font-medium">Electronic Sealed</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Ledger Root</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-heading">{systemScore > 80 ? '99.9%' : '88.4%'}</div>
              <div className="text-[10px] text-blue-600 font-medium">Merkle Integrity</div>
            </div>
          </div>

          {/* Action Buttons - Clear hierarchy */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <LiquidButton
              variant="default"
              size="default"
              onClick={() => onNavigateToView('demo')}
            >
              <Zap className="w-4 h-4" />
              <span>Launch 10-Step Master Demo</span>
            </LiquidButton>

            <Button
              variant="outline"
              size="default"
              onClick={() => onNavigateToView('verification')}
            >
              <Fingerprint className="w-4 h-4 text-slate-600" />
              <span>Verify SHA-256</span>
            </Button>
          </div>
        </div>

        {/* Right Column: 3D Security Enclave (5 Cols) */}
        <div className="lg:col-span-5 h-[340px] sm:h-[380px] relative rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden flex items-center justify-center shadow-xs">
          {/* Spline 3D Scene */}
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />

          {/* Floating Security Badge */}
          <div className="absolute bottom-3 left-3 right-3 z-20 p-2.5 rounded-xl bg-white/90 border border-slate-200 backdrop-blur-md flex items-center justify-between text-xs text-slate-700 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-900 font-bold">Cryptographic Hardware Enclave</span>
            </div>
            <span className="text-slate-500 font-mono text-[10px]">FIPS 140-3</span>
          </div>
        </div>
      </div>
    </div>
  );
};
