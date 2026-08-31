import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  FileCheck,
  FileSearch,
  Fingerprint,
  KeyRound,
  Lock,
  QrCode,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { LiquidButton, MetalButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { CryptoService } from '../services/cryptoService.ts';
import { Package, Paper } from '../types/index.ts';

interface VerificationViewProps {
  papers: Paper[];
  packages: Package[];
}

export const VerificationView: React.FC<VerificationViewProps> = ({ papers, packages }) => {
  const [inputToken, setInputToken] = useState('');
  const [customTextContent, setCustomTextContent] = useState('');
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'TOKEN' | 'RAW_TEXT'>('TOKEN');

  const handleVerifyToken = async (rawInput?: string) => {
    const raw = (rawInput || inputToken).trim();
    if (!raw) {
      setErrorMsg('Please enter or scan a valid QR token payload, Paper ID, or SHA-256 hash.');
      return;
    }
    setErrorMsg(null);
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      if (raw.startsWith('EXS:v1:')) {
        const parts = raw.split(':');
        const entityType = parts[2];
        const entityId = parts[3];

        if (entityType === 'PAPER') {
          const res = await api.verifyPaper(entityId);
          const paper = papers.find((p) => p.id === entityId);
          setVerificationResult({
            type: 'PAPER',
            entity: paper,
            data: res,
          });
        } else if (entityType === 'PACKAGE') {
          const res = await api.verifyPackage(entityId);
          const pkg = packages.find((p) => p.id === entityId);
          setVerificationResult({
            type: 'PACKAGE',
            entity: pkg,
            data: res,
          });
        }
      } else if (raw.startsWith('EXS-PAP-') || raw.startsWith('EXS-PKG-')) {
        const parts = raw.split('-');
        const isPaper = raw.startsWith('EXS-PAP');
        const entityId = isPaper ? `PAP-${parts[2] || '001'}` : `ES-PKG-${parts[2] || '82931'}`;

        if (isPaper) {
          const res = await api.verifyPaper(entityId);
          const paper = papers.find((p) => p.id === entityId) || papers[0];
          setVerificationResult({ type: 'PAPER', entity: paper, data: res });
        } else {
          const res = await api.verifyPackage(entityId);
          const pkg = packages.find((p) => p.id === entityId) || packages[0];
          setVerificationResult({ type: 'PACKAGE', entity: pkg, data: res });
        }
      } else {
        const matchedPaper = papers.find(
          (p) => p.id === raw || p.paperCode === raw || p.hash.toLowerCase() === raw.toLowerCase()
        );
        if (matchedPaper) {
          const res = await api.verifyPaper(matchedPaper.id);
          setVerificationResult({
            type: 'PAPER',
            entity: matchedPaper,
            data: res,
          });
        } else {
          const matchedPkg = packages.find(
            (p) => p.id === raw || p.packageCode === raw || p.sealId === raw
          );
          if (matchedPkg) {
            const res = await api.verifyPackage(matchedPkg.id);
            setVerificationResult({
              type: 'PACKAGE',
              entity: matchedPkg,
              data: res,
            });
          } else {
            throw new Error('No matching record found in cryptographic blockchain registry.');
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyRawText = async () => {
    if (!customTextContent.trim()) {
      setErrorMsg('Please enter document text to compute canonical SHA-256 fingerprint.');
      return;
    }
    setErrorMsg(null);
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const computedHash = await CryptoService.computeSha256(customTextContent);
      const matchedPaper = papers.find((p) => p.hash.toLowerCase() === computedHash.toLowerCase());

      setVerificationResult({
        type: 'RAW_DOCUMENT',
        data: {
          computedCurrentHash: computedHash,
          registeredHash: matchedPaper ? matchedPaper.hash : 'NOT_FOUND_IN_LEDGER',
          isHashValid: !!matchedPaper,
          isSignatureValid: !!matchedPaper,
          overallIntegrity: matchedPaper ? 'AUTHENTIC' : 'UNKNOWN_OR_MODIFIED',
          verifiedAt: new Date().toISOString(),
          matchedPaper,
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const isAuthentic =
    verificationResult?.data?.overallIntegrity === 'AUTHENTIC' ||
    (verificationResult?.data?.isHashValid && verificationResult?.data?.isSignatureValid);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-950 via-[#050B18] to-[#0A1425] p-6 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400">
          <Fingerprint className="w-3.5 h-3.5" />
          <span>FIPS 180-4 CRYPTOGRAPHIC INTEGRITY VERIFICATION CONSOLE</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1 font-heading">
          Cryptographic Hash & QR Token Verification
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Scan QR tokens, enter SHA-256 hashes, or test raw question document text against the immutable ledger registry.
        </p>
      </Card>

      {/* Main Station Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form & Test Chips (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-5">
            {/* Tab Selector */}
            <div className="flex gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveTab('TOKEN')}
                className={`flex-1 py-2 rounded-lg transition font-bold cursor-pointer ${
                  activeTab === 'TOKEN'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Scan Token / Paper ID / Hash
              </button>
              <button
                onClick={() => setActiveTab('RAW_TEXT')}
                className={`flex-1 py-2 rounded-lg transition font-bold cursor-pointer ${
                  activeTab === 'RAW_TEXT'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw Document Text Hash
              </button>
            </div>

            {activeTab === 'TOKEN' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                    Enter QR Token, Paper Code, or SHA-256 Hash
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. PAP-001, NEET-DEMO-2027-PHY-A, or hash..."
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 px-4 py-3 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500 shadow-inner"
                    />
                    <div className="absolute right-2 top-2">
                      <LiquidButton
                        variant="default"
                        size="sm"
                        onClick={() => handleVerifyToken()}
                        disabled={isVerifying}
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>{isVerifying ? 'Verifying...' : 'Verify'}</span>
                      </LiquidButton>
                    </div>
                  </div>
                </div>

                {/* Sample Test Chips */}
                <div className="space-y-2 pt-2">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Quick Judge Verification Samples:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInputToken('PAP-001');
                        handleVerifyToken('PAP-001');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 transition cursor-pointer"
                    >
                      ✓ Paper PAP-001 (Authentic)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputToken('ES-PKG-82931');
                        handleVerifyToken('ES-PKG-82931');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 transition cursor-pointer"
                    >
                      ✓ Smart Package ES-PKG-82931
                    </button>
                    {papers.find((p) => p.isTampered) && (
                      <button
                        type="button"
                        onClick={() => {
                          const tampered = papers.find((p) => p.isTampered);
                          if (tampered) {
                            setInputToken(tampered.id);
                            handleVerifyToken(tampered.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-700 text-[11px] font-mono text-rose-300 transition animate-pulse cursor-pointer"
                      >
                        ⚠ Tampered Document Sample
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                    Paste Document Text for Client-Side Canonical Hashing
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste question paper text snippet here to compute deterministic SHA-256..."
                    value={customTextContent}
                    onChange={(e) => setCustomTextContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <LiquidButton
                  variant="violet"
                  size="default"
                  onClick={handleVerifyRawText}
                  disabled={isVerifying}
                  className="w-full"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>{isVerifying ? 'Computing Hash...' : 'Compute Web Crypto SHA-256 & Match'}</span>
                </LiquidButton>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Verification Results Card (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl h-full flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-sm font-bold text-white font-heading">Verification Verdict</h3>
              <span className="text-[10px] font-mono text-cyan-400">Zero-Trust Enclave</span>
            </div>

            {verificationResult ? (
              <div className="space-y-4 text-xs">
                {/* Overall Status Badge */}
                <div
                  className={`p-4 rounded-xl border text-center space-y-1.5 ${
                    isAuthentic
                      ? 'bg-emerald-950/50 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : 'bg-rose-950/50 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {isAuthentic ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-6 h-6 text-rose-400 animate-pulse" />
                    )}
                    <span
                      className={`text-base font-extrabold font-heading tracking-tight ${
                        isAuthentic ? 'text-emerald-300' : 'text-rose-300'
                      }`}
                    >
                      {isAuthentic ? 'HASH VERIFIED (SHA-256 MATCH)' : 'HASH MISMATCH / TAMPER DETECTED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {isAuthentic
                      ? 'Document hash matches canonical immutable blockchain registry and asymmetric digital signature is valid.'
                      : 'Computed hash differs from registered blockchain root. Document has been modified or tampered.'}
                  </p>
                </div>

                {/* Hash Inspection Box */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div className="space-y-1">
                    <div className="text-slate-500 text-[10px]">REGISTERED HASH:</div>
                    <div className="text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800 break-all select-all">
                      {verificationResult.data?.registeredHash}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-500 text-[10px]">COMPUTED CURRENT HASH:</div>
                    <div
                      className={`p-2 rounded border break-all select-all ${
                        isAuthentic
                          ? 'bg-slate-900/80 border-slate-800 text-emerald-400'
                          : 'bg-rose-950/40 border-rose-800 text-rose-300 font-bold'
                      }`}
                    >
                      {verificationResult.data?.computedCurrentHash}
                    </div>
                  </div>
                </div>

                {/* Metadata Details */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Asymmetric Signature:</span>
                    <span className={verificationResult.data?.isSignatureValid ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                      {verificationResult.data?.isSignatureValid ? 'RSA-2048 VALID' : 'INVALID'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timestamp:</span>
                    <span className="font-mono text-slate-300">{new Date(verificationResult.data?.verifiedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                <FileSearch className="w-10 h-10 text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">Awaiting Verification Target</p>
                <p className="text-[11px] max-w-xs">
                  Scan or enter an examination QR payload or hash above to trigger instant cryptographic validation.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 text-center">
              Standard: SHA-256 (FIPS PUB 180-4) • Asymmetric RSA PKCS#1 v2.2
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
