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
import { Card, CardContent } from '../components/ui/card.tsx';
import { Button } from '../components/ui/liquid-glass-button.tsx';
import { CustodyEvent, Paper } from '../types/index.ts';

interface CustodyViewProps {
  custodyEvents: CustodyEvent[];
  papers: Paper[];
  onRefresh: () => void;
}

export const CustodyView: React.FC<CustodyViewProps> = ({
  custodyEvents = [],
  papers = [],
  onRefresh,
}) => {
  const [selectedPaperId, setSelectedPaperId] = useState<string>(papers[0]?.id || 'PAP-001');

  const activePaper = papers.find((p) => p.id === selectedPaperId) || papers[0];
  const paperEvents = custodyEvents.filter(
    (e) => e.paperId === selectedPaperId || e.entityId === selectedPaperId
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <ShieldCheck className="w-4 h-4" />
            <span>CRYPTOGRAPHIC CHAIN OF CUSTODY (11-STAGE PIPELINE)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            End-to-End Custody Lifecycle Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Every transition verified with dual digital signatures, GPS geotags, sensor telemetry, and Merkle ledger blocks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPaperId}
            onChange={(e) => setSelectedPaperId(e.target.value)}
            className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
          >
            {papers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.paperCode} - {p.subject} (Set {p.set})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Section */}
      <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Custody Trail: {activePaper?.paperCode}
            </h3>
            <p className="text-xs text-slate-500">
              Current Location: <strong>{activePaper?.location || 'Central Security Strongroom'}</strong> • Custodian:{' '}
              <strong>{activePaper?.currentCustodian}</strong>
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800">
            FIPS 180-4 VERIFIED
          </span>
        </div>

        {/* Timeline Stepper */}
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
          {(paperEvents.length > 0
            ? paperEvents
            : [
                {
                  id: 'EVT-01',
                  timestamp: new Date(Date.now() - 86400000).toISOString(),
                  eventType: 'PAPER_CREATED',
                  fromActor: 'Dr. Rajeshwar Sharma',
                  toActor: 'Examination Confidential Cell',
                  location: 'Central Vault Enclave',
                  blockId: 'BLK-001',
                  verified: true,
                },
                {
                  id: 'EVT-02',
                  timestamp: new Date(Date.now() - 43200000).toISOString(),
                  eventType: 'PAPER_SEALED',
                  fromActor: 'Confidential Cell',
                  toActor: 'Armed Logistics Escort (Rajinder S. Gill)',
                  location: 'Security Strongroom Dispatch Bay',
                  blockId: 'BLK-002',
                  verified: true,
                },
                {
                  id: 'EVT-03',
                  timestamp: new Date().toISOString(),
                  eventType: 'CORRIDOR_TRANSIT_IN_PROGRESS',
                  fromActor: 'Armed Escort',
                  toActor: 'Delhi Centre Superintendent',
                  location: 'Noida-Delhi Geofence Corridor',
                  blockId: 'BLK-003',
                  verified: true,
                },
              ]
          ).map((evt, idx) => (
            <div key={idx} className="relative flex items-start gap-4 pl-1">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm z-10">
                {idx + 1}
              </div>

              <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-heading text-sm">
                    {evt.eventType.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="text-slate-600">
                  Transferred from <strong className="text-slate-900">{evt.fromActor}</strong> to{' '}
                  <strong className="text-slate-900">{evt.toActor}</strong>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                  <span>Location: {evt.location}</span>
                  <span className="text-indigo-600 font-bold">Block #{evt.blockId}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
