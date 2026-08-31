import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Cpu,
  FileCode2,
  Flame,
  Layers,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card.tsx';
import { LiquidButton, MetalButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { ImmutableBlock } from '../types/index.ts';

interface BlockchainViewProps {
  chain: ImmutableBlock[];
  onRefresh: () => void;
}

export const BlockchainView: React.FC<BlockchainViewProps> = ({ chain, onRefresh }) => {
  const [selectedBlock, setSelectedBlock] = useState<ImmutableBlock | null>(chain[0] || null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSimulatingTamper, setIsSimulatingTamper] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      const res = await api.verifyBlockchainChain();
      setVerificationResult(res);
    } catch (err: any) {
      alert(`Ledger verification error: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSimulateTamper = async (blockIndex: number = 2) => {
    if (!confirm(`Simulate malicious direct database row mutation on Block #${blockIndex}? This will break the previousHash pointer and fail the Merkle integrity check.`)) {
      return;
    }
    setIsSimulatingTamper(true);
    try {
      await api.simulateBlockchainTamper(blockIndex);
      alert(`Malicious mutation executed on Block #${blockIndex}. Run 'Verify Ledger Integrity' to view the broken chain diagnosis.`);
      onRefresh();
      handleVerifyChain();
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulatingTamper(false);
    }
  };

  const filteredChain = chain.filter((b) => {
    const q = searchTerm.toLowerCase();
    return (
      b.blockId.toLowerCase().includes(q) ||
      b.action.toLowerCase().includes(q) ||
      b.actor.toLowerCase().includes(q) ||
      b.txHash.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-950 via-[#050B18] to-[#0A1425] p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400">
            <Layers className="w-3.5 h-3.5" />
            <span>FIPS 140-3 COMPLIANT IMMUTABLE LEDGER & MERKLE CHAIN</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 font-heading">
            Append-Only Cryptographic Audit Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Every custodial handover, electronic seal check, and paper approval is cryptographically chained and signed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LiquidButton
            variant="default"
            size="default"
            onClick={handleVerifyChain}
            disabled={isVerifying}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isVerifying ? 'Verifying Chain...' : 'Verify Ledger Integrity'}</span>
          </LiquidButton>
          <LiquidButton
            variant="danger"
            size="default"
            onClick={() => handleSimulateTamper(2)}
            disabled={isSimulatingTamper}
          >
            <Flame className="w-4 h-4" />
            <span>Simulate DB Tampering</span>
          </LiquidButton>
        </div>
      </Card>

      {/* Verification Result Banner if run */}
      {verificationResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl ${
            verificationResult.isValid
              ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
              : 'bg-rose-950/50 border-rose-500/80 text-rose-200 shadow-[0_0_30px_rgba(244,63,94,0.25)]'
          }`}
        >
          <div className="flex items-start gap-3">
            {verificationResult.isValid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            )}
            <div className="space-y-1 text-xs">
              <div className="font-bold text-sm font-heading">
                {verificationResult.isValid
                  ? 'Cryptographic Ledger Integrity: VERIFIED (All Hashes Intact)'
                  : `Integrity Violation Detected at Block #${verificationResult.brokenBlockIndex}`}
              </div>
              <p className="opacity-90 leading-relaxed font-sans">{verificationResult.details}</p>
            </div>
          </div>

          <div className="text-right shrink-0 text-xs font-mono">
            <div>Blocks Verified: <strong>{verificationResult.totalBlocks}</strong></div>
            <div className="text-[10px] opacity-75">{new Date(verificationResult.checkedAt).toLocaleTimeString()}</div>
          </div>
        </motion.div>
      )}

      {/* Main Block Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chain Block Timeline (7 Cols) */}
        <div className="lg:col-span-7">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-sm font-bold text-white font-heading">
                Ledger Blocks ({chain.length})
              </h3>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search blocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 pl-8 pr-2 py-1 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[520px] scrollbar-thin text-xs">
              {filteredChain.map((block) => {
                const isSelected = selectedBlock?.blockId === block.blockId;
                const isGenesis = block.index === 0;

                return (
                  <div
                    key={block.blockId}
                    onClick={() => setSelectedBlock(block)}
                    className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                      isSelected
                        ? 'bg-blue-600/15 border-cyan-400 shadow-[0_0_15px_rgba(0,217,255,0.15)]'
                        : !block.verified
                        ? 'bg-rose-950/30 border-rose-800 hover:bg-rose-950/50'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">#{block.index}</span>
                        <span className="font-mono text-xs text-cyan-400">{block.blockId}</span>
                        {isGenesis && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                            GENESIS
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(block.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="font-bold text-slate-100 font-heading">{block.action}</div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Actor: {block.actor} ({block.actorRole})</span>
                      <span className="text-cyan-300">{block.location}</span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 truncate pt-1 border-t border-slate-900">
                      Parent: {block.previousHash.slice(0, 16)}... • Hash: {block.eventHash.slice(0, 16)}...
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: Block Raw Inspector (5 Cols) */}
        <div className="lg:col-span-5">
          {selectedBlock ? (
            <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">
                    Block #{selectedBlock.index} ({selectedBlock.blockId})
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">{selectedBlock.action}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    selectedBlock.verified
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {selectedBlock.verified ? 'VERIFIED' : 'TAMPERED'}
                </span>
              </div>

              {/* Cryptographic Hashes */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[10px]">
                <div>
                  <div className="text-slate-500">TRANSACTION HASH:</div>
                  <div className="text-cyan-300 break-all select-all bg-slate-900/80 p-1.5 rounded border border-slate-800">
                    {selectedBlock.txHash}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500">CURRENT BLOCK EVENT HASH:</div>
                  <div className="text-slate-300 break-all select-all bg-slate-900/80 p-1.5 rounded border border-slate-800">
                    {selectedBlock.eventHash}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500">PREVIOUS BLOCK HASH POINTER:</div>
                  <div className="text-slate-400 break-all select-all bg-slate-900/80 p-1.5 rounded border border-slate-800">
                    {selectedBlock.previousHash}
                  </div>
                </div>
              </div>

              {/* Event Payload */}
              <div className="space-y-1">
                <div className="font-mono text-[10px] text-slate-400 font-semibold uppercase">Event Data Payload:</div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-48 scrollbar-thin">
                  {JSON.stringify(selectedBlock.eventData, null, 2)}
                </pre>
              </div>

              {/* Hardware & Device Fingerprint */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px] text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Hardware Device:</span>
                  <span className="text-slate-200">{selectedBlock.device}</span>
                </div>
                <div className="flex justify-between">
                  <span>Physical Precinct:</span>
                  <span className="text-slate-200">{selectedBlock.location}</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-64 border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
              <Layers className="w-8 h-8 text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">Select a Ledger Block</p>
              <p className="text-[11px]">Click on any block on the left to inspect asymmetric signatures and parent hash pointers.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
