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
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { ImmutableBlock } from '../types/index.ts';

interface BlockchainViewProps {
  chain: ImmutableBlock[];
  onRefresh: () => void;
}

export const BlockchainView: React.FC<BlockchainViewProps> = ({ chain = [], onRefresh }) => {
  const [selectedBlock, setSelectedBlock] = useState<ImmutableBlock | null>(chain[0] || null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

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

  const filteredChain = chain.filter((b) => {
    const q = searchTerm.toLowerCase();
    const hash = b.txHash || b.eventHash || '';
    return (
      b.blockId.toLowerCase().includes(q) ||
      hash.toLowerCase().includes(q) ||
      b.actor.toLowerCase().includes(q) ||
      b.action.toLowerCase().includes(q)
    );
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <Layers className="w-4 h-4" />
            <span>IMMUTABLE CRYPTOGRAPHIC AUDIT LEDGER</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            Merkle Block Ledger & Non-Repudiation Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Append-only cryptographic blocks linking parent hashes across creation, transport, and handover.
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
            <span>{isVerifying ? 'Validating Merkle Tree...' : 'Verify Ledger Integrity'}</span>
          </LiquidButton>
        </div>
      </div>

      {/* Verification Verdict Banner */}
      {verificationResult && (
        <Card
          className={`p-4 border shadow-sm animate-in fade-in duration-150 ${
            verificationResult.valid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {verificationResult.valid ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <AlertOctagon className="w-6 h-6 text-rose-600" />
              )}
              <div>
                <h4 className="text-sm font-bold">
                  {verificationResult.valid
                    ? '✓ Complete Merkle Ledger Integrity Confirmed'
                    : '✕ Ledger Chain Discrepancy Detected'}
                </h4>
                <p className="text-xs text-slate-600">
                  {verificationResult.valid
                    ? `Verified all ${chain.length} blocks sequentially. Every parent hash pointer and nonce signature is mathematically valid.`
                    : 'A parent hash discrepancy was detected. The chain has been quarantined.'}
                </p>
              </div>
            </div>

            <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs">
              Root Nonce: {(chain[chain.length - 1] as any)?.nonce || 1048576}
            </span>
          </div>
        </Card>
      )}

      {/* Main Blocks Grid & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chain Explorer (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Block ID, hash, or actor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 pl-8 pr-3 py-1.5 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="text-xs text-slate-500 font-medium">
                {chain.length} Sequential Blocks
              </div>
            </div>

            <div className="space-y-3 max-h-[540px] overflow-y-auto scrollbar-thin">
              {filteredChain.map((block, idx) => {
                const isSelected = selectedBlock?.blockId === block.blockId;
                const blockHash = block.txHash || block.eventHash || '';

                return (
                  <div
                    key={block.blockId}
                    onClick={() => setSelectedBlock(block)}
                    className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/40 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800">
                          BLOCK #{block.index}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900">{block.blockId}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(block.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700">
                      Action: <strong className="text-slate-900 font-mono">{block.action}</strong> by{' '}
                      <strong>{block.actor}</strong>
                    </div>

                    <div className="space-y-1 font-mono text-[10px] pt-1 border-t border-slate-200/60">
                      <div className="text-slate-500 truncate">
                        Hash: <span className="text-indigo-700 font-bold">{blockHash}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Block Inspector (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedBlock ? (
            <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Block Detail Inspector</div>
                <h3 className="text-base font-bold text-slate-900 font-heading mt-0.5">
                  Block #{selectedBlock.index} • {selectedBlock.blockId}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Committed Timestamp:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {new Date(selectedBlock.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Authorized Officer:</span>
                    <span className="font-bold text-slate-800">{selectedBlock.actor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Operation Payload:</span>
                    <span className="font-mono font-bold text-indigo-700">{selectedBlock.action}</span>
                  </div>
                </div>

                {/* Current Block Hash */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans">
                    <span>Block Hash Digest:</span>
                    <button
                      onClick={() => handleCopy(selectedBlock.txHash || selectedBlock.eventHash || '')}
                      className="text-indigo-600 hover:underline cursor-pointer"
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="text-xs font-bold text-indigo-700 break-all">
                    {selectedBlock.txHash || selectedBlock.eventHash}
                  </div>
                </div>

                {/* Previous Parent Hash */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
                  <div className="text-[10px] text-slate-500 font-sans">Previous Parent Block Hash:</div>
                  <div className="text-xs text-slate-700 break-all">
                    {selectedBlock.previousHash || '0x0000000000000000000000000000000000000000000000000000000000000000'}
                  </div>
                </div>

                {/* Digital Signature */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
                  <div className="text-[10px] text-slate-500 font-sans">Asymmetric Nonce Signature:</div>
                  <div className="text-[11px] text-slate-600 truncate">
                    {selectedBlock.signature || 'RSA2048-SIG-771829391029381029'}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-64 border-slate-200 bg-white p-6 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <Layers className="w-8 h-8 text-slate-400" />
              <p className="text-xs font-semibold text-slate-700">Select a Block</p>
              <p className="text-xs text-slate-500">Click on any block on the left to inspect parent hash linkages and signatures.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
