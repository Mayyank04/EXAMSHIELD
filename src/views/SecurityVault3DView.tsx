import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  FileCheck2,
  Fingerprint,
  Globe,
  Info,
  Layers,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Truck,
  X,
  Zap,
} from 'lucide-react';
import { isWebGLAvailable } from '../3d/threeUtils.ts';
import { VaultNetworkScene, VaultNodeData } from '../3d/VaultNetworkScene.ts';
import { Card, CardContent } from '../components/ui/card.tsx';
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { SplineScene } from '../components/ui/splite.tsx';

interface SecurityVault3DViewProps {
  onNavigateToView: (view: string) => void;
}

export const SecurityVault3DView: React.FC<SecurityVault3DViewProps> = ({
  onNavigateToView,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<VaultNetworkScene | null>(null);
  const [selectedNode, setSelectedNode] = useState<VaultNodeData | null>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [active3DMode, setActive3DMode] = useState<'VAULT_MESH' | 'PHYSICAL_ENCLAVE'>('PHYSICAL_ENCLAVE');

  useEffect(() => {
    const webglOk = isWebGLAvailable();
    setHasWebGL(webglOk);

    if (webglOk && canvasRef.current && active3DMode === 'VAULT_MESH') {
      sceneRef.current = new VaultNetworkScene(canvasRef.current, (node) => {
        setSelectedNode(node);
      });
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.destroy();
        sceneRef.current = null;
      }
    };
  }, [active3DMode]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <Globe className="w-4 h-4" />
            <span>3D DIGITAL SECURITY INFRASTRUCTURE</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            3D Security Vault Enclave & Mesh
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive spatial visualization of physical examination containers, Faraday strongrooms, and biometric nodes.
          </p>
        </div>

        {/* 3D Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActive3DMode('PHYSICAL_ENCLAVE')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              active3DMode === 'PHYSICAL_ENCLAVE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Physical Hardware Enclave
          </button>
          <button
            onClick={() => setActive3DMode('VAULT_MESH')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              active3DMode === 'VAULT_MESH'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Network Mesh Topology
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="h-[460px] border-slate-200 bg-white shadow-sm overflow-hidden relative flex items-center justify-center">
            {active3DMode === 'PHYSICAL_ENCLAVE' ? (
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            ) : (
              <div ref={canvasRef} className="w-full h-full" />
            )}

            {/* Floating Info Pill */}
            <div className="absolute bottom-4 left-4 right-4 z-20 p-3 rounded-2xl bg-white/90 border border-slate-200 backdrop-blur-md flex items-center justify-between text-xs text-slate-700 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-900 font-bold">FIPS 140-3 Hardware Cryptographic Enclave</span>
              </div>
              <span className="text-slate-500 font-mono text-[10px]">Zero-Trust Enforced</span>
            </div>
          </Card>
        </div>

        {/* Right: Node Telemetry Panel */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Security Infrastructure Focus
              </h3>
              <p className="text-[11px] text-slate-500">Spatial telemetry and node parameters</p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-[10px] text-slate-500 font-medium uppercase">Strongroom Enclave</div>
                <div className="font-bold text-slate-900">National Secure Strongroom Delhi</div>
                <div className="text-emerald-700 font-semibold font-mono text-[11px]">Biometrics: ARMED</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-[10px] text-slate-500 font-medium uppercase">Hardware Tamper Switch</div>
                <div className="font-bold text-slate-900">Magnetic Reed Interlock</div>
                <div className="text-emerald-700 font-semibold font-mono text-[11px]">State: SEALED</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-[10px] text-slate-500 font-medium uppercase">Quantum Entropy Source</div>
                <div className="font-bold text-slate-900">Hardware RNG (TRNG)</div>
                <div className="text-indigo-700 font-semibold font-mono text-[11px]">256-bit Seed Active</div>
              </div>
            </div>

            <Button
              variant="default"
              size="default"
              onClick={() => onNavigateToView('verification')}
              className="w-full text-xs font-semibold"
            >
              <span>Verify SHA-256 Ledger Anchor</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
