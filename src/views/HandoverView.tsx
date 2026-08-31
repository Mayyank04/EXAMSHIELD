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
  Zap,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Package, User } from '../types/index.ts';

interface HandoverViewProps {
  packages: Package[];
  users: User[];
  currentUser: User;
  onRefresh: () => void;
}

export const HandoverView: React.FC<HandoverViewProps> = ({
  packages,
  users,
  currentUser,
  onRefresh,
}) => {
  const [selectedPkgId, setSelectedPkgId] = useState(packages[0]?.id || 'ES-PKG-82931');
  const [senderId, setSenderId] = useState('USR-004'); // Transport Officer
  const [receiverId, setReceiverId] = useState('USR-006'); // Centre Superintendent
  const [senderConfirmed, setSenderConfirmed] = useState(false);
  const [receiverConfirmed, setReceiverConfirmed] = useState(false);
  const [sealScanId, setSealScanId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];
  const senderUser = users.find((u) => u.id === senderId) || users[3];
  const receiverUser = users.find((u) => u.id === receiverId) || users[5];

  const handleExecuteHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!senderConfirmed || !receiverConfirmed) {
      setErrorMessage('Both the Dispatching Officer and Receiving Superintendent must explicitly verify and authorize the handover.');
      return;
    }

    if (selectedPkg.tamperState === 'BREACHED') {
      setErrorMessage('Handover Blocked: Package is in TAMPER_LOCKED state. Forensic quarantine and Board authorization required before transfer.');
      return;
    }

    setIsProcessing(true);
    setSuccessReceipt(null);

    try {
      const res = await api.verifyHandover({
        packageId: selectedPkg.id,
        senderId,
        receiverId,
        qrCode: selectedPkg.qrPayload,
      });
      setSuccessReceipt(res);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Handover protocol execution failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isPackageTampered = selectedPkg?.tamperState === 'BREACHED';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-400">
          <KeyRound className="w-3.5 h-3.5" />
          <span>ZERO-TRUST TWO-PARTY DUAL AUTHENTICATION PROTOCOL</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight mt-1 font-heading">
          Two-Party Custodial Handover Execution
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Transfer examination package custody from Armored Transport Officer to Centre Superintendent with cryptographic non-repudiation.
        </p>
      </div>

      {/* Main Dual Auth Station Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Handover Station Form (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span>Dual-Signature Verification Station</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Consensus Protocol Active</span>
          </div>

          <form onSubmit={handleExecuteHandover} className="space-y-5 text-xs">
            {/* Target Package Selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono">
                Select Exam Package for Transfer
              </label>
              <select
                value={selectedPkgId}
                onChange={(e) => {
                  setSelectedPkgId(e.target.value);
                  setSuccessReceipt(null);
                  setSenderConfirmed(false);
                  setReceiverConfirmed(false);
                }}
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2.5 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-teal-500"
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.packageCode} — {pkg.destinationCentreName} (Seal: {pkg.sealId}) [{pkg.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Two-Party Dual Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Party A: Dispatching Officer */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Party A: Dispatcher</span>
                  <span className="text-[10px] font-mono text-slate-500">Logistics Officer</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Select Dispatching Officer</label>
                  <select
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-lg text-slate-200 font-mono text-xs"
                  >
                    {users
                      .filter((u) => u.role === 'TRANSPORT_OFFICER' || u.role === 'SECURITY_OFFICER' || u.role === 'SUPER_ADMIN')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Badge:</span>
                    <span className="font-mono text-slate-200">{senderUser?.badgeNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Facility:</span>
                    <span className="text-slate-200">{selectedPkg?.sourceFacility}</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={senderConfirmed}
                    onChange={(e) => setSenderConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-[11px] text-slate-300 font-medium">
                    Officer confirms physical seal integrity
                  </span>
                </label>
              </div>

              {/* Party B: Receiving Superintendent */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-teal-400 uppercase">Party B: Receiver</span>
                  <span className="text-[10px] font-mono text-slate-500">Centre Superintendent</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Select Receiving Superintendent</label>
                  <select
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-lg text-slate-200 font-mono text-xs"
                  >
                    {users
                      .filter((u) => u.role === 'CENTRE_SUPERINTENDENT' || u.role === 'SUPER_ADMIN')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Centre:</span>
                    <span className="text-slate-200">{selectedPkg?.destinationCentreName}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Badge:</span>
                    <span className="font-mono text-slate-200">{receiverUser?.badgeNumber}</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={receiverConfirmed}
                    onChange={(e) => setReceiverConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-slate-900 border-slate-700"
                  />
                  <span className="text-[11px] text-slate-300 font-medium">
                    Superintendent confirms electronic intake
                  </span>
                </label>
              </div>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isProcessing || isPackageTampered}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition shadow-lg flex items-center justify-center gap-2 ${
                isPackageTampered
                  ? 'bg-rose-950/40 border border-rose-800 text-rose-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/30'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Signing & Committing Transaction to Ledger...'
                  : isPackageTampered
                  ? 'HANDOVER PROHIBITED (PACKAGE TAMPER-LOCKED)'
                  : 'Execute Two-Party Cryptographic Handover'}
              </span>
            </button>
          </form>
        </div>

        {/* Right Column: Handover Verification Receipt (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-heading">Handover Ledger Receipt</h3>
            <span className="text-[10px] font-mono text-slate-400">Non-Repudiation</span>
          </div>

          {successReceipt ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-teal-950/50 border border-teal-600 text-center space-y-1 shadow-lg shadow-teal-950/20">
                <CheckCircle2 className="w-6 h-6 text-teal-400 mx-auto" />
                <div className="font-bold text-teal-300 font-heading">HANDOVER COMMITTED</div>
                <p className="text-[10px] text-slate-300">
                  Custodial ownership successfully transferred to {receiverUser?.name}.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[10px]">
                <div className="text-slate-500">BLOCKCHAIN TRANSACTION HASH:</div>
                <div className="text-sky-400 break-all select-all bg-slate-900 p-2 rounded border border-slate-800">
                  {successReceipt.block?.txHash}
                </div>
                <div className="flex justify-between text-slate-400 pt-1">
                  <span>Block Index:</span>
                  <span className="text-slate-200 font-bold">#{successReceipt.block?.index}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Timestamp:</span>
                  <span className="text-slate-200">{new Date(successReceipt.block?.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
              <Lock className="w-10 h-10 text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">Awaiting Dual Authorization</p>
              <p className="text-[11px] max-w-xs">
                Both parties must check their respective inspection boxes to generate the immutable transfer block.
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 text-center">
            Dual PKI RSA-2048 Signatures Committed to Append-Only Chain
          </div>
        </div>
      </div>
    </div>
  );
};
