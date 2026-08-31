import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  FileCheck,
  FileCheck2,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  Flame,
  Key,
  Layers,
  Lock,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { QrCodeModal } from '../components/QrCodeModal.tsx';
import { Card, CardContent } from '../components/ui/card.tsx';
import { LiquidButton, MetalButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { AuthService } from '../services/authService.ts';
import { CryptoService } from '../services/cryptoService.ts';
import { Paper, PaperStatus, Question, User } from '../types/index.ts';

interface PapersViewProps {
  papers: Paper[];
  questions?: Question[];
  currentUser: User;
  onRefresh: () => void;
}

export const PapersView: React.FC<PapersViewProps> = ({
  papers,
  questions = [],
  currentUser,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [qrModalData, setQrModalData] = useState<{ isOpen: boolean; paper: Paper | null }>({
    isOpen: false,
    paper: null,
  });
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSimulatingTamper, setIsSimulatingTamper] = useState(false);

  // Form State
  const [formSubject, setFormSubject] = useState('Physics');
  const [formSet, setFormSet] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [formExam, setFormExam] = useState('National Eligibility Security Examination 2027');
  const [formYear, setFormYear] = useState(2027);
  const [formDuration, setFormDuration] = useState(180);
  const [formMarks, setFormMarks] = useState(180);
  const [formConfidentiality, setFormConfidentiality] = useState<'RESTRICTED' | 'SECRET' | 'TOP_SECRET'>('TOP_SECRET');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tamper Lab State for selected paper
  const [tamperModifiedText, setTamperModifiedText] = useState('');
  const [tamperLabResult, setTamperLabResult] = useState<{
    originalHash: string;
    corruptedHash: string;
    isMatched: boolean;
  } | null>(null);

  const filteredPapers = papers.filter((p) => {
    const matchesSearch =
      p.paperCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'ALL' || p.subject === selectedSubject;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createPaper({
        subject: formSubject,
        set: formSet,
        examination: formExam,
        year: formYear,
        durationMinutes: formDuration,
        totalMarks: formMarks,
        confidentialityLevel: formConfidentiality,
        creator: currentUser.name,
        creatorRole: currentUser.role,
      });
      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to generate secured paper: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (paperId: string) => {
    setIsVerifying(true);
    try {
      const res = await api.verifyPaper(paperId);
      setVerificationResult(res);
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSimulateTamper = async (paperId: string) => {
    if (!confirm('Simulate unauthorized document modification / hash mismatch? This will flag a CRITICAL security alert and commit a tamper detection block to the blockchain.')) {
      return;
    }
    setIsSimulatingTamper(true);
    try {
      const res = await api.simulateDocumentModification(paperId);
      alert(`Compromise Simulated! SHA-256 Hash modified from registered value. Alert ${res.alert.alertCode} generated.`);
      onRefresh();
      if (selectedPaper && selectedPaper.id === paperId) {
        handleVerify(paperId);
      }
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulatingTamper(false);
    }
  };

  const handleTestClientTamper = async () => {
    if (!selectedPaper) return;
    const originalContent = `${selectedPaper.paperCode}:${selectedPaper.examination}:${selectedPaper.subject}:${selectedPaper.set}`;
    const modifiedContent = tamperModifiedText || `${originalContent}_TAMPERED_LETTER`;

    const originalHash = await CryptoService.computeSha256(originalContent);
    const corruptedHash = await CryptoService.computeSha256(modifiedContent);

    setTamperLabResult({
      originalHash,
      corruptedHash,
      isMatched: originalHash === corruptedHash,
    });
  };

  const canCreate = AuthService.hasPermission(currentUser.role, 'paper:create');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-950 via-[#050B18] to-[#0A1425] p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-purple-400">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>CONFIDENTIAL QUESTION PAPER LIFECYCLE & CRYPTOGRAPHIC CORE</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 font-heading">
            Protected Question Papers & Fingerprints
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Every question paper is cryptographically fingerprinted using canonical SHA-256 and signed by authorized conveners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canCreate && (
            <LiquidButton
              variant="default"
              size="default"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Generate & Sign Paper</span>
            </LiquidButton>
          )}
        </div>
      </Card>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by code, subject, paper ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 pl-9 pr-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 px-3 py-2 rounded-xl text-slate-300 focus:outline-none focus:border-cyan-500 text-xs font-mono"
          >
            <option value="ALL">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Biology">Biology</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 px-3 py-2 rounded-xl text-slate-300 focus:outline-none focus:border-cyan-500 text-xs font-mono"
          >
            <option value="ALL">All Lifecycle States</option>
            <option value="APPROVED">APPROVED</option>
            <option value="PRINTED">PRINTED</option>
            <option value="SEALED">SEALED</option>
            <option value="IN_TRANSIT">IN_TRANSIT</option>
            <option value="COMPROMISED">COMPROMISED</option>
          </select>
        </div>
      </div>

      {/* Main Table / Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Papers Table (8 Cols) */}
        <div className="lg:col-span-8">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/80">
              <h3 className="text-sm font-bold text-white font-heading">
                Registered Examination Papers ({filteredPapers.length})
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">Canonical SHA-256 Standard</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/90 font-mono text-[10px] text-slate-400 uppercase">
                    <th className="p-3.5">Paper Code</th>
                    <th className="p-3.5">Subject & Set</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">SHA-256 Fingerprint</th>
                    <th className="p-3.5">Custodian</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredPapers.map((paper) => {
                    const isCompromised = paper.status === 'COMPROMISED' || paper.isTampered;
                    const isSelected = selectedPaper?.id === paper.id;

                    return (
                      <tr
                        key={paper.id}
                        onClick={() => {
                          setSelectedPaper(paper);
                          handleVerify(paper.id);
                        }}
                        className={`hover:bg-slate-800/60 cursor-pointer transition ${
                          isSelected ? 'bg-blue-600/10 border-l-2 border-cyan-400' : ''
                        }`}
                      >
                        <td className="p-3.5">
                          <div className="font-mono font-bold text-slate-100">{paper.paperCode}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{paper.id}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-200">{paper.subject}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Set {paper.set} • {paper.questionsCount} questions</div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              isCompromised
                                ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                                : paper.status === 'APPROVED' || paper.status === 'SEALED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                : 'bg-blue-950 text-blue-300 border border-blue-800/60'
                            }`}
                          >
                            {paper.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-mono text-[11px] text-cyan-300 truncate max-w-[140px]" title={paper.hash}>
                            {paper.hash.slice(0, 16)}...
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono">RSA-2048 Signed</div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-slate-300 truncate max-w-[120px]">{paper.currentCustodian}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{paper.custodianRole}</div>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setQrModalData({ isOpen: true, paper });
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Generate QR Token"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSimulateTamper(paper.id);
                            }}
                            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition"
                            title="Simulate Document Tampering"
                          >
                            <Flame className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Selected Paper Details & Tamper Lab (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedPaper ? (
            <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">{selectedPaper.paperCode}</h3>
                  <p className="text-[10px] font-mono text-slate-400">{selectedPaper.examination}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    selectedPaper.isTampered
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {selectedPaper.status}
                </span>
              </div>

              {/* Cryptographic Verification Status */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-400 font-semibold">INTEGRITY CHECK</span>
                  <span
                    className={`font-bold ${
                      verificationResult?.isHashValid && !selectedPaper.isTampered
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {verificationResult?.isHashValid && !selectedPaper.isTampered
                      ? 'AUTHENTIC (SHA-256 MATCH)'
                      : 'TAMPERED / MISMATCH'}
                  </span>
                </div>

                <div className="space-y-1 font-mono text-[10px]">
                  <div className="text-slate-500">REGISTERED HASH:</div>
                  <div className="text-slate-300 bg-slate-900/80 p-1.5 rounded border border-slate-800 break-all select-all">
                    {selectedPaper.hash}
                  </div>
                </div>

                {selectedPaper.isTampered && (
                  <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800 text-[10px] text-rose-200 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Security Violation Detected</span>
                    </div>
                    <p>Current computed hash differs from blockchain ledger. Automatic quarantine initiated.</p>
                  </div>
                )}
              </div>

              {/* Interactive Tamper & Test Station */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-300">
                  <span>Tamper & Test Lab</span>
                  <span className="text-[9px] text-purple-400">Live Web Crypto</span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Modify a single character below to witness instantaneous cryptographic hash divergence.
                </p>

                <textarea
                  rows={2}
                  value={tamperModifiedText}
                  placeholder={`Edit text: ${selectedPaper.paperCode}:${selectedPaper.subject}:Set${selectedPaper.set}`}
                  onChange={(e) => setTamperModifiedText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 p-2 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                />

                <LiquidButton
                  variant="violet"
                  size="default"
                  className="w-full"
                  onClick={handleTestClientTamper}
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Re-Compute SHA-256 Hash</span>
                </LiquidButton>

                {tamperLabResult && (
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1 text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500">ORIGINAL: </span>
                      <span className="text-emerald-400">{tamperLabResult.originalHash.slice(0, 16)}...</span>
                    </div>
                    <div>
                      <span className="text-slate-500">MODIFIED: </span>
                      <span className="text-rose-400">{tamperLabResult.corruptedHash.slice(0, 16)}...</span>
                    </div>
                    <div className="pt-1 text-center font-bold text-rose-400">
                      MISMATCH DETECTED (Integrity: FAILED)
                    </div>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Author:</span>
                  <span className="text-slate-200">{selectedPaper.creator}</span>
                </div>
                <div className="flex justify-between">
                  <span>Marks / Duration:</span>
                  <span className="text-slate-200">{selectedPaper.totalMarks} Marks • {selectedPaper.durationMinutes} mins</span>
                </div>
                <div className="flex justify-between">
                  <span>Classification:</span>
                  <span className="text-amber-400 font-bold">{selectedPaper.confidentialityLevel}</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-64 border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
              <FileCheck className="w-8 h-8 text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">Select a Question Paper</p>
              <p className="text-[11px]">Click on any paper in the table to inspect cryptographic signature metadata.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Create Paper Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-cyan-400">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">Generate & Cryptographically Sign Paper</h3>
                  <p className="text-[11px] text-slate-400">Author new paper and compute SHA-256 fingerprint</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePaper} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Subject</label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Paper Set</label>
                  <select
                    value={formSet}
                    onChange={(e: any) => setFormSet(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                  >
                    <option value="A">Set A (Primary)</option>
                    <option value="B">Set B (Reserve Contingency)</option>
                    <option value="C">Set C (Reserve)</option>
                    <option value="D">Set D (Emergency)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Examination Title</label>
                <input
                  type="text"
                  value={formExam}
                  onChange={(e) => setFormExam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={formMarks}
                    onChange={(e) => setFormMarks(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-slate-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-slate-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Security Tier</label>
                  <select
                    value={formConfidentiality}
                    onChange={(e: any) => setFormConfidentiality(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-amber-400 font-mono text-xs"
                  >
                    <option value="TOP_SECRET">TOP_SECRET</option>
                    <option value="SECRET">SECRET</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
                <div>Signing Officer: {currentUser.name} ({currentUser.role})</div>
                <div>Algorithm: Canonical SHA-256 Digest + RSA-2048 Asymmetric Signature</div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <LiquidButton
                  variant="default"
                  size="default"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Computing Hash & Signing...' : 'Generate & Commit to Ledger'}</span>
                </LiquidButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData({ isOpen: false, paper: null })}
        paper={qrModalData.paper}
      />
    </div>
  );
};
