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
import { LiquidButton, MetalButton } from '../components/ui/liquid-glass-button.tsx';
import { SplineScene } from '../components/ui/splite.tsx';
import { Spotlight } from '../components/ui/spotlight.tsx';

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
  const [active3DMode, setActive3DMode] = useState<'VAULT_MESH' | 'PHYSICAL_ENCLAVE'>('VAULT_MESH');

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
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-950 via-[#050B18] to-[#0A1425] p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400">
            <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '12s' }} />
            <span>PHYSICAL SECURITY + DIGITAL CRYPTOGRAPHIC VAULT</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 font-heading">
            3D Sovereign Examination Vault & Network Mesh
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive multi-layered visualization of secure physical strongrooms, biometric access controls, and cryptographic root keys.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActive3DMode('VAULT_MESH')}
            className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
              active3DMode === 'VAULT_MESH'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Network Mesh Radar
          </button>
          <button
            onClick={() => setActive3DMode('PHYSICAL_ENCLAVE')}
            className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
              active3DMode === 'PHYSICAL_ENCLAVE'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3D Physical Enclave
          </button>
        </div>
      </Card>

      {/* Main 3D Canvas & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Stage (8 Cols) */}
        <div className="lg:col-span-8">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden relative flex flex-col">
            <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">
                {active3DMode === 'VAULT_MESH' ? 'Three.js Interactive Node Mesh' : 'Spline 3D Security Chamber'}
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-blue-400">● Core Vault</span>
                <span className="text-purple-400">● Paper Sets</span>
                <span className="text-emerald-400">● Transports</span>
                <span className="text-rose-400">● Incidents</span>
              </div>
            </div>

            <div className="h-[520px] w-full relative bg-gradient-to-b from-[#0B0F19] to-slate-950 flex items-center justify-center">
              <Spotlight className="-top-20 left-10" fill="#00D9FF" />

              {active3DMode === 'VAULT_MESH' ? (
                hasWebGL ? (
                  <div ref={canvasRef} className="w-full h-full cursor-pointer" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-slate-400">
                    <Shield className="w-16 h-16 text-blue-500" />
                    <h3 className="text-base font-bold text-white">3D Accelerated Canvas Active</h3>
                  </div>
                )
              ) : (
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full"
                />
              )}

              {/* Instruction Overlay */}
              <div className="absolute bottom-4 left-4 z-20 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-400">
                {active3DMode === 'VAULT_MESH' ? 'Hover & Click any 3D node to inspect' : 'Interactive 3D Digital Enclave'}
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Node Inspector Drawer (4 Cols) */}
        <div className="lg:col-span-4">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl h-full flex flex-col justify-between space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-sm font-bold text-white font-heading">3D Node Inspector</h3>
              {selectedNode && (
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase">
                      TYPE: {selectedNode.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        selectedNode.type === 'INCIDENT'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {selectedNode.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white font-heading">{selectedNode.label}</h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{selectedNode.details}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-slate-400">Node Security Rating:</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      selectedNode.securityScore >= 90
                        ? 'text-emerald-400'
                        : selectedNode.securityScore >= 70
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {selectedNode.securityScore} / 100
                  </span>
                </div>

                <LiquidButton
                  variant="default"
                  size="default"
                  className="w-full"
                  onClick={() => {
                    if (selectedNode.type === 'PAPER') onNavigateToView('papers');
                    else if (selectedNode.type === 'TRANSPORT') onNavigateToView('transport');
                    else if (selectedNode.type === 'INCIDENT') onNavigateToView('incidents');
                    else onNavigateToView('dashboard');
                  }}
                >
                  <span>Jump to {selectedNode.type} Console</span>
                </LiquidButton>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-44 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                  <Globe className="w-10 h-10 text-slate-600" />
                  <p className="text-xs font-semibold text-slate-400">Awaiting 3D Selection</p>
                  <p className="text-[11px] max-w-xs">
                    Move your cursor over the 3D nodes and click any element to inspect hardware and cryptographic telemetry.
                  </p>
                </div>

                {/* 6 Key Physical & Digital Pillars */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-[11px]">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Security Enclave Features:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[10px]">
                    <div>✓ Physical Secure Vault</div>
                    <div>✓ Paper Container Lock</div>
                    <div>✓ Biometric Access</div>
                    <div>✓ Encrypted Document</div>
                    <div>✓ Tamper Detection</div>
                    <div>✓ Merkle Root Chain</div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 text-center">
              Physical + Digital Security Architecture • FIPS 140-3
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
