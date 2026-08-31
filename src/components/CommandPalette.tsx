import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  BookOpen,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  FileCheck2,
  FileText,
  Fingerprint,
  Flame,
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
import { ExamCentre, Incident, Package, Paper, Question, User } from '../types/index.ts';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  papers: Paper[];
  packages: Package[];
  incidents: Incident[];
  centres: ExamCentre[];
  users: User[];
  questions?: Question[];
  onSelectPaper?: (paper: Paper) => void;
  onSelectPackage?: (pkg: Package) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  papers = [],
  packages = [],
  incidents = [],
  centres = [],
  users = [],
  questions = [],
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose();
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

  // Quick Action Shortcuts (3D Security Vault removed)
  const quickActions = [
    { id: 'act-dash', title: 'Command Center Dashboard', icon: Activity, view: 'dashboard', category: 'Navigation' },
    { id: 'act-papers', title: 'Question Papers & Verification', icon: FileCheck2, view: 'papers', category: 'Module' },
    { id: 'act-qbank', title: 'Question Bank & Taxonomy', icon: BookOpen, view: 'questions', category: 'Module' },
    { id: 'act-verify', title: 'Cryptographic SHA-256 Verification', icon: Fingerprint, view: 'verification', category: 'Action' },
    { id: 'act-transport', title: 'Armored Transit Radar', icon: Truck, view: 'transport', category: 'Logistics' },
    { id: 'act-packages', title: 'Smart Exam Boxes', icon: Boxes, view: 'packages', category: 'Logistics' },
    { id: 'act-handover', title: 'Two-Party Custodial Handover', icon: KeyRound, view: 'handover', category: 'Action' },
    { id: 'act-custody', title: 'Chain of Custody Timeline', icon: Layers, view: 'custody', category: 'Audit' },
    { id: 'act-insider', title: 'AI Insider Threat Behavioral Engine', icon: BrainCircuit, view: 'insider', category: 'Threat' },
    { id: 'act-leak', title: 'Paper Leak Semantic Similarity Radar', icon: ShieldAlert, view: 'leak', category: 'Threat' },
    { id: 'act-admin', title: 'Sovereign Admin Panel', icon: ShieldCheck, view: 'admin', category: 'Admin' },
    { id: 'act-blockchain', title: 'Immutable Merkle Block Ledger', icon: Layers, view: 'blockchain', category: 'Audit' },
    { id: 'act-simulator', title: 'Attack Simulation Lab', icon: Flame, view: 'simulator', category: 'Simulation' },
    { id: 'act-demo', title: '10-Step Master Demo Tour', icon: Zap, view: 'demo', category: 'Demo' },
    { id: 'act-health', title: 'System Health & Telemetry', icon: Cpu, view: 'health', category: 'System' },
  ].filter((a) => !q || a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));

  // Filtered Papers
  const matchedPapers = papers
    .filter(
      (p) =>
        p.paperCode.toLowerCase().includes(q) ||
        p.subject.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    )
    .slice(0, 4);

  // Filtered Questions
  const matchedQuestions = questions
    .filter(
      (qn) =>
        qn.text.toLowerCase().includes(q) ||
        qn.subject.toLowerCase().includes(q) ||
        qn.topic.toLowerCase().includes(q) ||
        qn.id.toLowerCase().includes(q)
    )
    .slice(0, 3);

  // Filtered Packages
  const matchedPackages = packages
    .filter(
      (pkg) =>
        pkg.packageCode.toLowerCase().includes(q) ||
        pkg.destinationCentreName.toLowerCase().includes(q)
    )
    .slice(0, 3);

  // Filtered Incidents
  const matchedIncidents = incidents
    .filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.incidentCode.toLowerCase().includes(q)
    )
    .slice(0, 3);

  // Filtered Centres
  const matchedCentres = centres
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    )
    .slice(0, 3);

  // Filtered Users
  const matchedUsers = users
    .filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    )
    .slice(0, 3);

  const handleSelect = (view: string) => {
    onNavigate(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search papers, question bank, containers, incidents, users, centres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-sans"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-white border border-slate-200 rounded">
            ESC to close
          </kbd>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
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
              <div className="space-y-0.5">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleSelect(action.view)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
                        <span className="font-medium text-xs text-slate-800">{action.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{action.category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question Papers */}
          {matchedPapers.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1 font-semibold">
                Question Papers
              </div>
              <div className="space-y-0.5">
                {matchedPapers.map((paper) => (
                  <button
                    key={paper.id}
                    onClick={() => handleSelect('papers')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-indigo-50/50 transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck2 className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{paper.paperCode}</div>
                        <div className="text-[10px] text-slate-500">{paper.subject} (Set {paper.set})</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                      {paper.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question Bank Items */}
          {matchedQuestions.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1 font-semibold">
                Question Bank Items
              </div>
              <div className="space-y-0.5">
                {matchedQuestions.map((qn) => (
                  <button
                    key={qn.id}
                    onClick={() => handleSelect('questions')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-purple-50/50 transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
                      <div className="truncate">
                        <div className="font-bold text-xs text-slate-900">{qn.id} — {qn.subject}</div>
                        <div className="text-[10px] text-slate-500 truncate">{qn.text}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 shrink-0">
                      {qn.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Smart Packages */}
          {matchedPackages.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1 font-semibold">
                Smart Exam Containers
              </div>
              <div className="space-y-0.5">
                {matchedPackages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => handleSelect('packages')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Boxes className="w-4 h-4 text-teal-600" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{pkg.packageCode}</div>
                        <div className="text-[10px] text-slate-500">{pkg.destinationCentreName}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {pkg.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Incidents */}
          {matchedIncidents.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1 font-semibold">
                Investigation Room
              </div>
              <div className="space-y-0.5">
                {matchedIncidents.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => handleSelect('incidents')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-rose-50/50 transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{i.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{i.incidentCode}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                      {i.severity}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exam Centres */}
          {matchedCentres.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1 font-semibold">
                Exam Centres
              </div>
              <div className="space-y-0.5">
                {matchedCentres.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect('centres')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{c.name}</div>
                        <div className="text-[10px] text-slate-500">{c.city}, {c.state}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{c.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
