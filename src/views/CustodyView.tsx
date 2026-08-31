import React, { useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  Clock,
  Cpu,
  FileCheck2,
  Fingerprint,
  KeyRound,
  Layers,
  Lock,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
  UserCheck,
} from 'lucide-react';
import { CustodyEvent, Paper } from '../types/index.ts';

interface CustodyViewProps {
  custodyEvents: CustodyEvent[];
  papers: Paper[];
  onRefresh: () => void;
}

export const CustodyView: React.FC<CustodyViewProps> = ({
  custodyEvents,
  papers,
  onRefresh,
}) => {
  const [selectedPaperId, setSelectedPaperId] = useState<string>(papers[0]?.id || 'PAP-001');

  const activePaper = papers.find((p) => p.id === selectedPaperId) || papers[0];
  const paperEvents = custodyEvents.filter(
    (e) => e.paperId === selectedPaperId || e.entityId === selectedPaperId
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CRYPTOGRAPHIC CHAIN OF CUSTODY (10-STAGE LIFECYCLE)</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1 font-heading">
            End-to-End Non-Repudiation Custody Timeline
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Every transition verified with dual digital signatures, GPS geotagging, sensor telemetry snapshots, and immutable blockchain blocks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPaperId}
            onChange={(e) => setSelectedPaperId(e.target.value)}
            className="bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
          >
            {papers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.paperCode} ({p.subject} Set {p.set})
              </option>
            ))}
          </select>
          <button
            onClick={onRefresh}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Paper Metadata Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">PAPER CODE</div>
          <div className="text-sm font-bold text-white mt-1">{activePaper?.paperCode}</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">LIFECYCLE STATUS</div>
          <div className="text-sm font-bold text-emerald-400 mt-1">{activePaper?.status}</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">CUSTODY EVENTS</div>
          <div className="text-sm font-bold text-sky-300 mt-1">{paperEvents.length} Recorded</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">INTEGRITY HASH</div>
          <div className="text-xs font-bold text-slate-300 mt-1 truncate" title={activePaper?.hash}>
            {activePaper?.hash}
          </div>
        </div>
      </div>

      {/* Custody Timeline Steps */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 font-heading">
          <Fingerprint className="w-4 h-4 text-emerald-400" />
          <span>Chronological Custody Trail for {activePaper?.paperCode}</span>
        </h3>

        <div className="space-y-4">
          {paperEvents.map((evt, idx) => {
            return (
              <div
                key={evt.id}
                className="relative pl-8 pb-4 border-l-2 border-slate-800 last:border-0 last:pb-0"
              >
                {/* Node icon */}
                <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 text-[10px] font-bold">
                  {idx + 1}
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 font-mono text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-2">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <span className="text-emerald-400 uppercase">{evt.action}</span>
                      <span className="text-[10px] text-slate-500 font-normal">({evt.stage})</span>
                    </span>
                    <span className="text-slate-500 text-[11px]">{evt.timestamp}</span>
                  </div>

                  <div className="text-slate-300 text-xs">
                    {typeof evt.details === 'object' && evt.details !== null
                      ? JSON.stringify(evt.details)
                      : String(evt.details || '')}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
                    <div>
                      <span className="text-slate-500">Actor:</span>{' '}
                      <strong className="text-slate-200">{evt.actorName}</strong> ({evt.actorRole})
                    </div>
                    <div>
                      <span className="text-slate-500">Location:</span>{' '}
                      <span className="text-slate-300">{evt.location}</span>
                    </div>
                    <div className="truncate">
                      <span className="text-slate-500">Tx Hash:</span>{' '}
                      <span className="text-sky-400" title={evt.blockchainTxHash}>
                        {evt.blockchainTxHash}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
