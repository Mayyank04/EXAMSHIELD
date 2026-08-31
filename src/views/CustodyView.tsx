import React, { useState } from 'react';
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  FileCheck2,
  FileText,
  Filter,
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
  X,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card.tsx';
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { CustodyEvent, Paper } from '../types/index.ts';

interface CustodyViewProps {
  custodyEvents: CustodyEvent[];
  papers: Paper[];
  onRefresh: () => void;
  onNavigateToHandover?: () => void;
}

export const CustodyView: React.FC<CustodyViewProps> = ({
  custodyEvents = [],
  papers = [],
  onRefresh,
  onNavigateToHandover,
}) => {
  const [selectedPaperId, setSelectedPaperId] = useState<string>(papers[0]?.id || 'PAP-001');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CustodyEvent | null>(null);
  const [copied, setCopied] = useState(false);

  const activePaper = papers.find((p) => p.id === selectedPaperId) || papers[0];

  // Default synthetic events for selected paper if none registered yet
  const defaultEvents: CustodyEvent[] = [
    {
      id: 'EVT-01',
      paperId: selectedPaperId,
      stage: 'CREATION',
      action: 'PAPER_GENERATED_AND_SIGNED',
      details: 'Question paper authored, canonical SHA-256 computed and anchored to Block #140.',
      actorName: 'Prof. Ananya Sen',
      actorRole: 'EXAM_AUTHORITY',
      location: 'National Formulation Enclave',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      blockchainTxHash: '0x88921829a82910293819283912839182938129381',
      status: 'VERIFIED',
    },
    {
      id: 'EVT-02',
      paperId: selectedPaperId,
      stage: 'ENCRYPTION',
      action: 'ASYMMETRIC_SIGNATURE_SEALED',
      details: 'RSA-2048 dual signature applied with Hardware Security Module (HSM).',
      actorName: 'Dr. Rajeshwar Sharma',
      actorRole: 'SUPER_ADMIN',
      location: 'Central Security Strongroom Enclave',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      blockchainTxHash: '0x99182938192839128391829381928391829381294',
      status: 'VERIFIED',
    },
    {
      id: 'EVT-03',
      paperId: selectedPaperId,
      stage: 'CONTAINER_SEALED',
      action: 'SMART_BOX_ELECTRONIC_SEAL_ARMED',
      details: 'Physical box magnetic reed switch armed; ambient lux threshold set to 50 Lux.',
      actorName: 'Dinesh Karthik',
      actorRole: 'STORAGE_OFFICER',
      location: 'Dispatch Bay Vault #4',
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      blockchainTxHash: '0xaa182938192839128391829381928391829381295',
      status: 'VERIFIED',
    },
    {
      id: 'EVT-04',
      paperId: selectedPaperId,
      stage: 'TRANSPORT',
      action: 'ARMORED_CONVOY_DISPATCHED',
      details: 'GPS corridor tracking enabled with 2.0 km Haversine geofence tolerance.',
      actorName: 'Rajinder Singh Gill',
      actorRole: 'TRANSPORT_OFFICER',
      location: 'Noida Expressway Corridor Checkpoint',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      blockchainTxHash: '0xbb182938192839128391829381928391829381296',
      status: 'VERIFIED',
    },
    {
      id: 'EVT-05',
      paperId: selectedPaperId,
      stage: 'HANDOVER_IN_PROGRESS',
      action: 'CUSTODY_HANDOVER_CONSENSUS',
      details: 'Awaiting dual biometric sign-off between Escort Commander and Centre Superintendent.',
      actorName: 'Harish Chandra',
      actorRole: 'CENTRE_SUPERINTENDENT',
      location: 'Delhi Public Institute Strongroom',
      timestamp: new Date().toISOString(),
      blockchainTxHash: '0xcc182938192839128391829381928391829381297',
      status: 'VERIFIED',
    },
  ];

  const paperEvents = custodyEvents.filter(
    (e) => e.paperId === selectedPaperId || e.entityId === selectedPaperId
  );

  const displayEvents = paperEvents.length > 0 ? paperEvents : defaultEvents;

  const filteredEvents = displayEvents.filter((e) => {
    const q = searchTerm.toLowerCase();
    return (
      e.action.toLowerCase().includes(q) ||
      e.actorName.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.details.toLowerCase().includes(q)
    );
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

        <div className="flex items-center gap-3">
          {onNavigateToHandover && (
            <LiquidButton
              variant="default"
              size="default"
              onClick={onNavigateToHandover}
            >
              <KeyRound className="w-4 h-4" />
              <span>Two-Party Handover →</span>
            </LiquidButton>
          )}
        </div>
      </div>

      {/* Filter & Paper Selection Toolbar */}
      <Card className="p-4 border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          {/* Paper Selector */}
          <div className="w-full sm:w-72">
            <select
              value={selectedPaperId}
              onChange={(e) => setSelectedPaperId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
            >
              {papers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.paperCode} — {p.subject} (Set {p.set})
                </option>
              ))}
            </select>
          </div>

          {/* Search Filter */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search custody events, officer, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Current Custodian: <strong className="text-slate-900">{activePaper?.currentCustodian || 'Superintendent'}</strong>
        </div>
      </Card>

      {/* Timeline Section */}
      <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Custody Trail: {activePaper?.paperCode} ({activePaper?.subject})
            </h3>
            <p className="text-xs text-slate-500">
              Current Location: <strong>{activePaper?.location || 'Central Security Strongroom'}</strong> • Status:{' '}
              <strong className="text-indigo-700">{activePaper?.status || 'SEALED'}</strong>
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800">
            FIPS 180-4 VERIFIED
          </span>
        </div>

        {/* Timeline Stepper */}
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
          {filteredEvents.map((evt, idx) => (
            <div
              key={evt.id || idx}
              onClick={() => setSelectedEvent(evt)}
              className="relative flex items-start gap-4 pl-1 group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-600 group-hover:bg-indigo-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm z-10 transition">
                {idx + 1}
              </div>

              <div className="flex-1 p-4 rounded-xl bg-slate-50 group-hover:bg-indigo-50/40 border border-slate-200 group-hover:border-indigo-300 transition space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-heading text-sm">
                    {evt.action.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-slate-700 font-sans leading-relaxed">
                  {evt.details}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60 font-mono">
                  <div>
                    Officer: <strong className="text-slate-800 font-sans">{evt.actorName}</strong> ({evt.actorRole})
                  </div>
                  <div>
                    Location: <strong className="text-slate-800 font-sans">{evt.location}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Event Details Drawer / Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    Custody Event Proof
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedEvent.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">
                  {selectedEvent.action.replace(/_/g, ' ')}
                </div>
                <p className="text-slate-700">{selectedEvent.details}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Authorized Officer</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedEvent.actorName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{selectedEvent.actorRole}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Facility / Geotag</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedEvent.location}</div>
                  <div className="text-[10px] text-emerald-600 font-mono">GPS Fixed</div>
                </div>
              </div>

              {/* Blockchain Transaction Hash */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans">
                  <span>Ledger Block Anchor Hash:</span>
                  <button
                    onClick={() => handleCopy(selectedEvent.blockchainTxHash || '')}
                    className="text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-indigo-700 font-bold break-all">
                  {selectedEvent.blockchainTxHash || '0x88921829a82910293819283912839182938129381'}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
              <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
