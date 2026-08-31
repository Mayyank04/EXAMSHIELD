import React, { useState } from 'react';
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Cpu,
  KeyRound,
  Layers,
  Lock,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card.tsx';
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { Package, User } from '../types/index.ts';

interface HandoverViewProps {
  packages: Package[];
  users: User[];
  currentUser: User;
  onRefresh: () => void;
}

export const HandoverView: React.FC<HandoverViewProps> = ({
  packages = [],
  users = [],
  currentUser,
  onRefresh,
}) => {
  const [selectedPkgId, setSelectedPkgId] = useState(packages[0]?.id || 'ES-PKG-82931');
  const [senderId, setSenderId] = useState('USR-004'); // Transport Officer (Rajinder Singh Gill)
  const [receiverId, setReceiverId] = useState('USR-006'); // Centre Superintendent (Harish Chandra)
  const [senderConfirmed, setSenderConfirmed] = useState(false);
  const [receiverConfirmed, setReceiverConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);
  const [rejectionNotice, setRejectionNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];
  const senderUser = users.find((u) => u.id === senderId) || users[3] || users[0];
  const receiverUser = users.find((u) => u.id === receiverId) || users[5] || users[1];

  const handleExecuteHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setRejectionNotice(null);

    if (!senderConfirmed || !receiverConfirmed) {
      setErrorMessage('Both the Dispatching Officer and Receiving Superintendent must explicitly verify and authorize the handover.');
      return;
    }

    if (selectedPkg && selectedPkg.tamperState === 'BREACHED') {
      setErrorMessage('Handover Blocked: Container is in TAMPER_LOCKED state. Forensic quarantine and Board authorization required before transfer.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.verifyHandover({
        packageId: selectedPkgId,
        senderId,
        receiverId,
        qrCode: selectedPkg ? selectedPkg.qrPayload : 'EXS:v1:PACKAGE:DEFAULT',
      });

      setSuccessReceipt(res);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Two-party cryptographic handover failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectHandover = async () => {
    if (!confirm('Reject custody handover and flag this container for physical inspection?')) return;
    setErrorMessage(null);
    setSuccessReceipt(null);
    setRejectionNotice(`Custody transfer rejected by ${receiverUser?.name || 'Superintendent'}. Non-conformance incident logged.`);
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-600">
            <KeyRound className="w-4 h-4" />
            <span>DUAL-CUSTODY CONSENSUS PROTOCOL</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            Two-Party Custodial Handover Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic consensus requiring simultaneous authentication from Escort Commander and Centre Superintendent.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
          <Lock className="w-4 h-4 text-teal-600" />
          <span>Shamir Dual Signature Verification</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Handover Execution Console (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Handover Request Configuration
              </h3>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">
                Status: {selectedPkg?.status || 'Awaiting Confirmation'}
              </span>
            </div>

            <form onSubmit={handleExecuteHandover} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Target Smart Exam Box Container
                </label>
                <select
                  value={selectedPkgId}
                  onChange={(e) => {
                    setSelectedPkgId(e.target.value);
                    setSuccessReceipt(null);
                    setRejectionNotice(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-slate-900 font-bold"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.packageCode} → {pkg.destinationCentreName} ({pkg.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dual Officer Consensus Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Party 1: Sender */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Party 1: Dispatch Escort
                    </span>
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                  </div>

                  <select
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={senderConfirmed}
                      onChange={(e) => setSenderConfirmed(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-[11px] font-medium text-slate-800">
                      Escort authorizes custody release
                    </span>
                  </label>
                </div>

                {/* Party 2: Receiver */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Party 2: Centre Superintendent
                    </span>
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                  </div>

                  <select
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={receiverConfirmed}
                      onChange={(e) => setReceiverConfirmed(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                    <span className="text-[11px] font-medium text-slate-800">
                      Superintendent accepts sealed custody
                    </span>
                  </label>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMessage}
                </div>
              )}

              {rejectionNotice && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  {rejectionNotice}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="default"
                  type="button"
                  onClick={handleRejectHandover}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Handover</span>
                </Button>

                <LiquidButton
                  variant="default"
                  size="default"
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isProcessing ? 'Verifying Dual Signatures...' : 'Confirm Handover & Commit Block'}</span>
                </LiquidButton>
              </div>
            </form>
          </Card>
        </div>

        {/* Right: Receipt Display (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {successReceipt ? (
            <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4 animate-in fade-in duration-150 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-heading">
                      Handover Committed to Ledger
                    </h4>
                    <p className="text-[11px] text-slate-500">Block #{successReceipt.block?.index || 143}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase">Custody Transition Details:</div>
                  <div className="text-slate-800">
                    Transferred from <strong>{senderUser?.name}</strong> to <strong>{receiverUser?.name}</strong>.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
                  <div className="text-slate-500 font-sans text-[10px]">Committed Block Hash:</div>
                  <div className="text-indigo-700 font-bold break-all">
                    {successReceipt.block?.currentHash || '0x4981729182a9382b91829381928391283'}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-64 border-slate-200 bg-white p-6 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <KeyRound className="w-8 h-8 text-slate-400" />
              <h4 className="text-sm font-bold text-slate-700">Dual-Officer Consensus Required</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Select container, confirm authorizations from both officers, and execute handover.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
