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
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
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
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
            <ShieldAlert className="w-4 h-4" />
            <span>INCIDENT COMMAND & FORENSIC WAR ROOM</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            Security Incident Investigation Room
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
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
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Incident Cases List (4 Cols) */}
        <div className="lg:col-span-4">
          <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Incident Cases ({incidents.length})
              </h3>
              <span className="text-[10px] font-semibold text-rose-600">Live Dockets</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search dockets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 pl-8 pr-3 py-1.5 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500"
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
                        ? 'bg-rose-50/60 border-rose-400 shadow-xs'
                        : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isCrit
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-amber-100 text-amber-900 border-amber-200'
                        }`}
                      >
                        {incident.severity}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">{incident.incidentCode}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 font-heading leading-snug line-clamp-1">
                      {incident.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Status: <strong className="text-slate-800">{incident.status}</strong></span>
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
            <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-5 text-xs">
              {/* Incident Header & Tab Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-xs text-rose-600 font-semibold font-mono">
                    <span>{activeIncident.incidentCode}</span>
                    <span>•</span>
                    <span className="text-slate-500 font-sans font-normal">{new Date(activeIncident.createdAt).toLocaleString()}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 font-heading mt-0.5">
                    {activeIncident.title}
                  </h2>
                </div>

                <div className="flex p-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold">
                  {(['OVERVIEW', 'GRAPH', 'EVIDENCE', 'PLAYBOOK'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        activeTab === tab
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
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
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase">Incident Narrative:</div>
                    <p className="text-slate-700 leading-relaxed font-sans">{activeIncident.description}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500 uppercase font-medium">Assigned Investigator</div>
                      <div className="text-xs font-bold text-slate-900 mt-1 truncate">{activeIncident.assignedInvestigator || 'Dr. Sharma'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500 uppercase font-medium">Risk Rating</div>
                      <div className="text-xs font-bold text-indigo-600 mt-1">{activeIncident.risk || 88}%</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500 uppercase font-medium">Related Target</div>
                      <div className="text-xs font-bold text-purple-700 mt-1 truncate">{activeIncident.affectedPaperId || activeIncident.affectedPackageId || 'SYS-ENCLAVE'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500 uppercase font-medium">Current State</div>
                      <div className="text-xs font-bold text-amber-700 mt-1">{activeIncident.status}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Graph */}
              {activeTab === 'GRAPH' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
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
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="text-indigo-600 font-semibold">{new Date(item.timestamp).toLocaleTimeString()}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-purple-700 font-bold">{item.type}</span>
                          </div>
                          <p className="text-xs text-slate-800 font-sans">{item.name}: {item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Playbook */}
              {activeTab === 'PLAYBOOK' && (
                <div className="space-y-3">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">
                    Automated Containment Response Protocol:
                  </div>
                  <div className="space-y-2">
                    {(activeIncident.resolutionPlaybook || []).map((action, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-slate-900 text-xs font-semibold">{action}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                          EXECUTED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="h-64 border-slate-200 bg-white p-6 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-400" />
              <p className="text-xs font-semibold text-slate-700">Select an Incident Docket</p>
              <p className="text-xs text-slate-500">Click on any case on the left to review forensic timelines and containment playbooks.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
