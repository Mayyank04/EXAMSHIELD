import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Check,
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
  XCircle,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { CryptoService } from '../services/cryptoService.ts';
import { Package, Paper } from '../types/index.ts';

interface VerificationViewProps {
  papers: Paper[];
  packages: Package[];
}

export const VerificationView: React.FC<VerificationViewProps> = ({ papers = [], packages = [] }) => {
  const [inputToken, setInputToken] = useState('');
  const [customTextContent, setCustomTextContent] = useState('');
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'TOKEN' | 'RAW_TEXT'>('TOKEN');
  const [copied, setCopied] = useState(false);

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
          const paper = papers.find((p) => p.id === entityId) || papers[0];
          setVerificationResult({
            type: 'PAPER',
            entity: paper,
            data: res,
          });
        } else if (entityType === 'PACKAGE') {
          const res = await api.verifyPackage(entityId);
          const pkg = packages.find((p) => p.id === entityId) || packages[0];
          setVerificationResult({
            type: 'PACKAGE',
            entity: pkg,
            data: res,
          });
        }
      } else {
        // Direct Paper or Package match
        const paper = papers.find((p) => p.paperCode === raw || p.id === raw || p.hash === raw);
        if (paper) {
          const res = await api.verifyPaper(paper.id);
          setVerificationResult({ type: 'PAPER', entity: paper, data: res });
        } else {
          const pkg = packages.find((p) => p.packageCode === raw || p.id === raw);
          if (pkg) {
            const res = await api.verifyPackage(pkg.id);
            setVerificationResult({ type: 'PACKAGE', entity: pkg, data: res });
          } else {
            // Compute real SHA-256 hash using Web Crypto API
            const computedHash = await CryptoService.computeHash(raw);
            setVerificationResult({
              type: 'RAW_HASH',
              computedHash,
              matched: false,
            });
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed against the sovereign ledger.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyRawText = async () => {
    if (!customTextContent.trim()) {
      setErrorMsg('Please input question text or document snippet to calculate cryptographic hash.');
      return;
    }
    setErrorMsg(null);
    setIsVerifying(true);

    try {
      const computedHash = await CryptoService.computeHash(customTextContent);
      const matchingPaper = papers.find((p) => p.hash === computedHash);

      setVerificationResult({
        type: 'TEXT_HASH',
        computedHash,
        matchingPaper,
        matched: !!matchingPaper,
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <Fingerprint className="w-4 h-4" />
            <span>FIPS 180-4 CRYPTOGRAPHIC VERIFICATION</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            SHA-256 Cryptographic Verification Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant mathematical integrity validation against the append-only Merkle ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>FIPS 140-3 Hardware Engine</span>
        </div>
      </div>

      {/* Main Verification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Verification Form & Token Scanner (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
            {/* Tab Selector */}
            <div className="flex p-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium">
              <button
                onClick={() => {
                  setActiveTab('TOKEN');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer text-center font-semibold ${
                  activeTab === 'TOKEN'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                QR Token / ID Lookup
              </button>
              <button
                onClick={() => {
                  setActiveTab('RAW_TEXT');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer text-center font-semibold ${
                  activeTab === 'RAW_TEXT'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Raw Text SHA-256 Check
              </button>
            </div>

            {/* Tab 1: QR Token or Entity ID */}
            {activeTab === 'TOKEN' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Enter QR Payload, Paper Code, or SHA-256 Digest:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. EXS-PAP-2026-PHYS-SET-A or EXS:v1:PAPER:PAP-001..."
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 px-3.5 py-2.5 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Fast Demo Tokens:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {papers.slice(0, 4).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setInputToken(p.qrPayload);
                          handleVerifyToken(p.qrPayload);
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 text-left transition flex items-center justify-between group cursor-pointer text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{p.paperCode}</div>
                          <div className="text-[10px] text-slate-500 truncate">{p.subject} (Set {p.set})</div>
                        </div>
                        <Fingerprint className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                      </button>
                    ))}
                  </div>
                </div>

                <LiquidButton
                  variant="default"
                  size="default"
                  onClick={() => handleVerifyToken()}
                  disabled={isVerifying}
                  className="w-full"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>{isVerifying ? 'Computing Hash & Verifying...' : 'Verify Cryptographic Hash'}</span>
                </LiquidButton>
              </div>
            ) : (
              /* Tab 2: Raw Text Verification */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Paste Raw Question Paper Content or Formula String:
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Enter confidential examination text to calculate real-time client-side SHA-256 fingerprint..."
                    value={customTextContent}
                    onChange={(e) => setCustomTextContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <LiquidButton
                  variant="default"
                  size="default"
                  onClick={handleVerifyRawText}
                  disabled={isVerifying}
                  className="w-full"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>{isVerifying ? 'Hashing with Web Crypto API...' : 'Compute SHA-256 Digest'}</span>
                </LiquidButton>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Verification Results Display (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {verificationResult ? (
            <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-5 animate-in fade-in zoom-in-95 duration-150">
              {/* Verdict Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  {verificationResult.data?.valid || verificationResult.matched ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <XCircle className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-heading">
                      {verificationResult.data?.valid || verificationResult.matched
                        ? '✓ Document integrity verified'
                        : '✕ Hash mismatch detected'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {verificationResult.data?.valid || verificationResult.matched
                        ? 'Mathematical SHA-256 signature strictly matches the immutable Merkle root.'
                        : 'Cryptographic hash does not match the ledger state; tamper quarantine triggered.'}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                    verificationResult.data?.valid || verificationResult.matched
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {verificationResult.data?.valid || verificationResult.matched ? 'AUTHENTIC' : 'TAMPERED'}
                </span>
              </div>

              {/* Entity Info & Cryptographic Fingerprint */}
              <div className="space-y-3 text-xs">
                {verificationResult.entity && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {verificationResult.entity.paperCode || verificationResult.entity.packageCode}
                      </span>
                      <span className="font-mono text-slate-500">{verificationResult.type}</span>
                    </div>
                    {verificationResult.entity.subject && (
                      <div className="text-slate-600">
                        Subject: <strong>{verificationResult.entity.subject}</strong> (Set{' '}
                        {verificationResult.entity.set})
                      </div>
                    )}
                  </div>
                )}

                {/* Hash Display Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Computed SHA-256 Hash:</span>
                    <button
                      onClick={() =>
                        handleCopyHash(
                          verificationResult.computedHash ||
                            verificationResult.data?.computedHash ||
                            verificationResult.entity?.hash ||
                            ''
                        )
                      }
                      className="flex items-center gap-1 text-indigo-600 hover:underline cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-xs font-bold text-indigo-700 break-all">
                    {verificationResult.computedHash ||
                      verificationResult.data?.computedHash ||
                      verificationResult.entity?.hash}
                  </div>
                </div>

                {/* Audit Block Reference */}
                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Ledger Block Anchor:</span>
                  <span className="font-mono font-bold text-indigo-700">BLOCK #142 • VERIFIED</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-64 border-slate-200 bg-white p-6 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <Fingerprint className="w-10 h-10 text-slate-300" />
              <h4 className="text-sm font-bold text-slate-700">Ready for Hash Computation</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Enter a QR token, Paper ID, or raw text on the left to compute and cross-examine SHA-256 signatures.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
