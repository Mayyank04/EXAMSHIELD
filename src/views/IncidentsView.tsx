import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Cpu,
  FileCheck2,
  FileCode2,
  FileText,
  Fingerprint,
  Flame,
  Globe,
  KeyRound,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  Upload,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import { ThreatGraph } from '../components/ThreatGraph.tsx';
import { Card, CardContent } from '../components/ui/card.tsx';
import { LiquidButton, MetalButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { Incident, IncidentStatus, User } from '../types/index.ts';

interface IncidentsViewProps {
  incidents: Incident[];
  currentUser: User;
  onRefresh: () => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents = [],
  currentUser,
  onRefresh,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'GRAPH' | 'EVIDENCE' | 'PLAYBOOK'>('OVERVIEW');
  const [isResolving, setIsResolving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const activeIncident =
    incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  const handleResolveIncident = async (id: string) => {
    if (!confirm('Resolve and archive this security incident docket in the audit ledger?')) return;
    setIsResolving(true);
    try {
      await api.resolveIncident(id);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to resolve incident: ${err.message}`);
    } finally {
      setIsResolving(false);
    }
  };

  const filteredIncidents = incidents.filter((i) => {
    const q = searchTerm.toLowerCase();
    return (
      i.title.toLowerCase().includes(q) ||
      i.incidentCode.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-950 via-[#050B18] to-[#0A1425] p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-rose-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>INCIDENT COMMAND & FORENSIC WAR ROOM</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 font-heading">
            Security Incident Investigation Room
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full digital forensics docket, multi-node correlation graph, and automated containment response protocols.
          </p>
        </div>

        {activeIncident && activeIncident.status !== 'RESOLVED' && (
          <LiquidButton
            variant="emerald"
            size="default"
            onClick={() => handleResolveIncident(activeIncident.id)}
            disabled={isResolving}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isResolving ? 'Committing Resolution...' : 'Resolve & Archive Docket'}</span>
          </LiquidButton>
        )}
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Incident Cases List (4 Cols) */}
        <div className="lg:col-span-4">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-sm font-bold text-white font-heading">
                Incident Cases ({incidents.length})
              </h3>
              <span className="text-[10px] font-mono text-rose-400">Live Dockets</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search dockets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 pl-8 pr-3 py-1.5 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto scrollbar-thin text-xs">
              {filteredIncidents.map((incident) => {
                const isSelected = activeIncident?.id === incident.id;
                const isCrit = incident.severity === 'CRITICAL';

                return (
                  <div
                    key={incident.id}
                    onClick={() => setSelectedIncidentId(incident.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                      isSelected
                        ? 'bg-rose-950/20 border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                          isCrit
                            ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}
                      >
                        {incident.severity}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{incident.incidentCode}</span>
                    </div>

                    <h4 className="font-bold text-slate-100 font-heading leading-snug line-clamp-1">
                      {incident.title}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                      <span>Status: <strong className="text-slate-300">{incident.status}</strong></span>
                      <span>{new Date(incident.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: Forensic War Room & Analysis Tabs (8 Cols) */}
        <div className="lg:col-span-8">
          {activeIncident ? (
            <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl space-y-5 text-xs">
              {/* Incident Header & Tab Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-rose-400">
                    <span>{activeIncident.incidentCode}</span>
                    <span>•</span>
                    <span className="text-slate-400">{new Date(activeIncident.createdAt).toLocaleString()}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white font-heading mt-0.5">
                    {activeIncident.title}
                  </h2>
                </div>

                <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  {(['OVERVIEW', 'GRAPH', 'EVIDENCE', 'PLAYBOOK'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
                        activeTab === tab
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'OVERVIEW' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Incident Narrative:</div>
                    <p className="text-slate-300 leading-relaxed font-sans">{activeIncident.description}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[9px] text-slate-500 uppercase">Assigned Investigator</div>
                      <div className="text-xs font-bold text-slate-200 mt-1 truncate">{activeIncident.assignedInvestigator || 'Dr. Sharma'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[9px] text-slate-500 uppercase">Risk Rating</div>
                      <div className="text-xs font-bold text-cyan-300 mt-1">{activeIncident.risk || 88}%</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[9px] text-slate-500 uppercase">Related Target</div>
                      <div className="text-xs font-bold text-purple-300 mt-1 truncate">{activeIncident.affectedPaperId || activeIncident.affectedPackageId || 'SYS-ENCLAVE'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-[9px] text-slate-500 uppercase">Current State</div>
                      <div className="text-xs font-bold text-amber-300 mt-1">{activeIncident.status}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Graph */}
              {activeTab === 'GRAPH' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                    Multi-Entity Relationship Graph showing correlation across paper batches, armored carriers, and sentinel nodes.
                  </div>
                  <ThreatGraph
                    nodes={activeIncident.graphNodes || []}
                    edges={activeIncident.graphEdges || []}
                  />
                </div>
              )}

              {/* Tab 3: Evidence */}
              {activeTab === 'EVIDENCE' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {(activeIncident.evidence || []).map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(0,217,255,0.8)]" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-mono text-[10px]">
                            <span className="text-cyan-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-purple-400 font-bold">{item.type}</span>
                          </div>
                          <p className="text-xs text-slate-200 font-sans">{item.name}: {item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Playbook */}
              {activeTab === 'PLAYBOOK' && (
                <div className="space-y-3">
                  <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
                    Automated Containment Response Protocol:
                  </div>
                  <div className="space-y-2">
                    {(activeIncident.resolutionPlaybook || []).map((action, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-slate-200 text-xs font-medium">{action}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                          EXECUTED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="h-64 border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">Select an Incident Docket</p>
              <p className="text-[11px]">Click on any case on the left to review forensic timelines and containment playbooks.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
