import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  FileCheck2,
  FileText,
  Fingerprint,
  Flame,
  Globe,
  KeyRound,
  Layers,
  Lock,
  MapPin,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Truck,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { ExamCentre, Incident, Package, Paper, User } from '../types/index.ts';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  papers: Paper[];
  packages: Package[];
  incidents: Incident[];
  centres: ExamCentre[];
  users: User[];
  onSelectPaper?: (paper: Paper) => void;
  onSelectPackage?: (pkg: Package) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  papers,
  packages,
  incidents,
  centres,
  users,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Quick Action Shortcuts
  const quickActions = [
    { id: 'act-dash', title: 'Go to Command Center', icon: Activity, view: 'dashboard', category: 'Navigation' },
    { id: 'act-papers', title: 'Generate & Sign Question Paper', icon: FileCheck2, view: 'papers', category: 'Action' },
    { id: 'act-verify', title: 'Verify Cryptographic SHA-256 Hash', icon: Fingerprint, view: 'verification', category: 'Action' },
    { id: 'act-transport', title: 'View Armored Transport Mesh Radar', icon: Truck, view: 'transport', category: 'Navigation' },
    { id: 'act-handover', title: 'Execute Two-Party Custodial Handover', icon: KeyRound, view: 'handover', category: 'Action' },
    { id: 'act-vault', title: 'Open 3D Security Vault Network', icon: Shield, view: 'vault3d', category: '3D Visuals' },
    { id: 'act-attack', title: 'Open Security Attack Simulation Lab', icon: Flame, view: 'simulator', category: 'Simulation' },
    { id: 'act-demo', title: 'Start Master 10-Step Demo Tour', icon: Zap, view: 'demo', category: 'Demo' },
    { id: 'act-insider', title: 'Run AI Insider Threat Behavioral Analysis', icon: BrainCircuit, view: 'insider', category: 'AI Security' },
    { id: 'act-leak', title: 'Scan Suspected Exam Paper Leak', icon: ShieldAlert, view: 'leak', category: 'AI Security' },
    { id: 'act-blockchain', title: 'Explore Immutable Merkle Block Ledger', icon: Layers, view: 'blockchain', category: 'Audit' },
    { id: 'act-health', title: 'View API & System Health Center', icon: Cpu, view: 'health', category: 'System' },
  ].filter((a) => !q || a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));

  // Filtered Papers
  const matchedPapers = papers
    .filter((p) => p.paperCode.toLowerCase().includes(q) || p.subject.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
    .slice(0, 4);

  // Filtered Packages
  const matchedPackages = packages
    .filter((pkg) => pkg.packageCode.toLowerCase().includes(q) || pkg.destinationCentreName.toLowerCase().includes(q))
    .slice(0, 3);

  // Filtered Incidents
  const matchedIncidents = incidents
    .filter((i) => i.title.toLowerCase().includes(q) || i.incidentCode.toLowerCase().includes(q))
    .slice(0, 3);

  // Filtered Centres
  const matchedCentres = centres
    .filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.city.toLowerCase().includes(q))
    .slice(0, 3);

  const handleSelect = (view: string) => {
    onNavigate(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-sky-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, paper code, shipment, incident, or node..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC to close
          </kbd>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs scrollbar-thin">
          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1 font-semibold">
                Quick Actions & Navigation
              </div>
              <div className="space-y-1">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleSelect(action.view)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-200 group-hover:text-white">{action.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5 bg-slate-950/60 rounded border border-slate-800">
                        {action.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matched Papers */}
          {matchedPapers.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400 px-3 py-1 font-semibold">
                Question Papers ({matchedPapers.length})
              </div>
              <div className="space-y-1">
                {matchedPapers.map((paper) => (
                  <button
                    key={paper.id}
                    onClick={() => handleSelect('papers')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="font-mono font-bold text-slate-200">{paper.paperCode}</div>
                        <div className="text-[11px] text-slate-400">{paper.subject} • Set {paper.set} • {paper.questionsCount} questions</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50">
                      {paper.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Packages */}
          {matchedPackages.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 px-3 py-1 font-semibold">
                Smart Packages & Logistics ({matchedPackages.length})
              </div>
              <div className="space-y-1">
                {matchedPackages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => handleSelect('packages')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition"
                  >
                    <div className="flex items-center gap-3">
                      <Boxes className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-mono font-bold text-slate-200">{pkg.packageCode}</div>
                        <div className="text-[11px] text-slate-400">Destination: {pkg.destinationCentreName}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                      {pkg.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Incidents */}
          {matchedIncidents.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 px-3 py-1 font-semibold">
                Security Incidents ({matchedIncidents.length})
              </div>
              <div className="space-y-1">
                {matchedIncidents.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => handleSelect('incidents')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <div>
                        <div className="font-medium text-slate-200">{inc.title}</div>
                        <div className="text-[11px] text-slate-400">{inc.incidentCode} • Investigator: {inc.assignedInvestigator}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/50">
                      {inc.severity}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Exam Centres */}
          {matchedCentres.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-teal-400 px-3 py-1 font-semibold">
                Examination Centres ({matchedCentres.length})
              </div>
              <div className="space-y-1">
                {matchedCentres.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect('centres')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-teal-400" />
                      <div>
                        <div className="font-medium text-slate-200">{c.name} ({c.code})</div>
                        <div className="text-[11px] text-slate-400">{c.city} • Capacity: {c.capacity}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-teal-300">
                      Score: {c.securityScore}/100
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {quickActions.length === 0 &&
            matchedPapers.length === 0 &&
            matchedPackages.length === 0 &&
            matchedIncidents.length === 0 &&
            matchedCentres.length === 0 && (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Search className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
                <p className="text-xs text-slate-500">Try searching for &apos;physics&apos;, &apos;tamper&apos;, &apos;handover&apos;, or &apos;block&apos;.</p>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono">Global Command Index Active</span>
          </div>
          <span className="font-mono">ExamShield Core v2.4</span>
        </div>
      </div>
    </div>
  );
};
