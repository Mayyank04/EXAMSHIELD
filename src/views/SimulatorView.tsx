import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  FileCheck2,
  FileCode2,
  Fingerprint,
  Flame,
  Globe,
  KeyRound,
  Layers,
  Lock,
  Navigation,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  UserCheck,
  Zap,
} from 'lucide-react';
import { api } from '../services/api.ts';

interface SimulatorViewProps {
  onRefresh: () => void;
  onNavigateToView: (view: string) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  onRefresh,
  onNavigateToView,
}) => {
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<
    Array<{ id: string; time: string; action: string; result: string; status: 'SUCCESS' | 'ALERT' }>
  >([]);

  const addLog = (action: string, result: string, status: 'SUCCESS' | 'ALERT') => {
    setExecutionLogs((prev) => [
      {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        action,
        result,
        status,
      },
      ...prev,
    ]);
  };

  const handleRunAttack = async (scenario: string) => {
    setRunningScenario(scenario);
    try {
      if (scenario === 'CONTAINER_TAMPER') {
        const res = await api.simulateTamper('ES-PKG-82931');
        addLog(
          'Physical Smart Container Breach',
          'Reed magnetic switch tripped to OPEN, light sensor detected 520 Lux. Package ES-PKG-82931 switched to TAMPER_LOCKED. Critical Incident created.',
          'ALERT'
        );
      } else if (scenario === 'GPS_DEVIATION') {
        const res = await api.simulateGpsDeviation('ES-PKG-82931', 3.8);
        addLog(
          'Armored Carrier Geofence Departure',
          'Carrier DL-1VB-9921 departed 3.8 km outside authorized corridor. Route deviation alert ALT-HIGH-8812 triggered.',
          'ALERT'
        );
      } else if (scenario === 'BLOCKCHAIN_TAMPER') {
        const res = await api.simulateBlockchainTamper(2);
        addLog(
          'Database Row Mutation (Block #2)',
          'Block #2 data maliciously altered. Cryptographic validator detects broken previousHash and Merkle root failure.',
          'ALERT'
        );
      } else if (scenario === 'INSIDER_ACCESS') {
        const res = await api.simulateUnauthorizedAccess('USR-382', 'PAP-001');
        addLog(
          'Off-Hour Insider Threat Attempt',
          'Pradeep Mathur (USR-382) attempted 02:00 AM download from untrusted device. Risk elevated to 92/100.',
          'ALERT'
        );
      } else if (scenario === 'DOCUMENT_LEAK') {
        const res = await api.analyzeDocumentLeak({
          filename: 'telegram_neet_leak.txt',
          textContent:
            'Leaked circular coil radius 0.05m with 500 turns rotating at 50 rad/s in 0.03T horizontal field. Maximum induced EMF.',
        });
        addLog(
          'AI Question Bank Leak Detection',
          `Social media post matched Physics Question Q-NEET-001 with ${res.overallSimilarity}% semantic overlap (Risk: ${res.exposureRiskScore}/100).`,
          'ALERT'
        );
      } else if (scenario === 'DOCUMENT_HASH_TAMPER') {
        const res = await api.simulateDocumentModification('PAP-001');
        addLog(
          'Paper SHA-256 Hash Tampering',
          'Question paper PAP-001 modified by 1 character. Cryptographic verification integrity check failed; set quarantined.',
          'ALERT'
        );
      } else if (scenario === 'CORRELATED_ATTACK') {
        const res = await api.simulateCorrelatedAttack();
        addLog(
          'Multi-Vector Correlated Attack',
          'Simultaneous off-hours access + route departure + seal breach executed. System risk spiked to 98/100.',
          'ALERT'
        );
      } else if (scenario === 'ACTIVATE_SET_B') {
        const res = await api.activateBackupPaper('PAP-001');
        addLog(
          'Emergency Reserve Set B Activation',
          'Paper PHY-NEET-A quarantined. Backup Question Paper Set B activated on blockchain ledger.',
          'SUCCESS'
        );
      } else if (scenario === 'RESET') {
        await api.resetSystem();
        addLog('System Baseline Reset', 'All databases, sensors, and ledgers restored to baseline state.', 'SUCCESS');
      }
      onRefresh();
    } catch (err: any) {
      addLog(`Error running ${scenario}`, err.message, 'ALERT');
    } finally {
      setRunningScenario(null);
    }
  };

  const scenariosList = [
    {
      id: 'CONTAINER_TAMPER',
      title: 'Smart Container Physical Breach',
      category: 'IoT Hardware Sentinel',
      desc: 'Simulates unauthorized physical opening of container box mid-transit (Reed switch OPEN, Lux > 500).',
      icon: Boxes,
      btnColor: 'bg-rose-600 hover:bg-rose-500',
    },
    {
      id: 'GPS_DEVIATION',
      title: 'Armored Carrier Geofence Departure',
      category: 'Logistics Radar',
      desc: 'Simulates logistics vehicle deviating 3.8 km outside authorized national expressway corridor.',
      icon: Truck,
      btnColor: 'bg-amber-600 hover:bg-amber-500',
    },
    {
      id: 'DOCUMENT_HASH_TAMPER',
      title: 'Question Paper Hash Modification',
      category: 'Cryptography',
      desc: 'Simulates malicious 1-character modification in paper questions; triggers instant SHA-256 mismatch.',
      icon: Fingerprint,
      btnColor: 'bg-purple-600 hover:bg-purple-500',
    },
    {
      id: 'INSIDER_ACCESS',
      title: 'Off-Hours Insider Behavioral Anomaly',
      category: 'AI Risk Engine',
      desc: 'Simulates custodian downloading confidential question assets at 02:00 AM from untrusted device.',
      icon: BrainCircuit,
      btnColor: 'bg-indigo-600 hover:bg-indigo-500',
    },
    {
      id: 'DOCUMENT_LEAK',
      title: 'Social Media Question Paper Leak',
      category: 'Early Warning NLP',
      desc: 'Simulates Telegram channel posting candidate questions; detects 92% semantic convergence.',
      icon: ShieldAlert,
      btnColor: 'bg-rose-700 hover:bg-rose-600',
    },
    {
      id: 'BLOCKCHAIN_TAMPER',
      title: 'Direct Database Row Mutation (Block #2)',
      category: 'Blockchain Ledger',
      desc: 'Simulates rogue DB administrator editing historical row; breaks Merkle hash pointer chain.',
      icon: Layers,
      btnColor: 'bg-red-600 hover:bg-red-500',
    },
    {
      id: 'CORRELATED_ATTACK',
      title: 'Multi-Vector Correlated Cyber-Physical Attack',
      category: 'Composite Threat',
      desc: 'Triggers simultaneous off-hours access, route departure, and seal breach in rapid succession.',
      icon: Flame,
      btnColor: 'bg-rose-800 hover:bg-rose-700',
    },
    {
      id: 'ACTIVATE_SET_B',
      title: 'Emergency Set B Failover Activation',
      category: 'Incident Playbook',
      desc: 'Quarantines compromised primary paper and activates Reserve Contingency Set B on blockchain.',
      icon: Zap,
      btnColor: 'bg-emerald-600 hover:bg-emerald-500',
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400">
            <Flame className="w-3.5 h-3.5" />
            <span>SAFE ENVIRONMENT FOR HACKATHON & DEFENSE DEMONSTRATIONS</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1 font-heading">
            Security Attack & Incident Simulation Lab
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Trigger deterministic, observable security attack scenarios to evaluate automatic state transitions across IoT, AI, and Blockchain.
          </p>
        </div>

        <button
          onClick={() => handleRunAttack('RESET')}
          disabled={runningScenario !== null}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset System Baseline</span>
        </button>
      </div>

      {/* Scenarios Grid & Execution Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenarios Cards (8 Cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scenariosList.map((sc) => {
            const Icon = sc.icon;
            const isRunning = runningScenario === sc.id;

            return (
              <div
                key={sc.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-lg flex flex-col justify-between space-y-3 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-slate-950 border border-slate-800">
                      {sc.category}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white font-heading">{sc.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{sc.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRunAttack(sc.id)}
                  disabled={runningScenario !== null}
                  className={`w-full py-2 px-3 rounded-xl text-white font-medium text-xs transition shadow-md flex items-center justify-center gap-2 ${sc.btnColor}`}
                >
                  <Play className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Executing Attack Chain...' : 'Trigger Simulation'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Real-Time Consequence Timeline Log (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white font-heading">Observable State Log</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Live Consequence Engine</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px] scrollbar-thin">
            {executionLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3.5 rounded-xl border space-y-1.5 ${
                  log.status === 'ALERT'
                    ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                    : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs font-heading">{log.action}</span>
                  <span className="text-[10px] font-mono opacity-75">{log.time}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90 font-sans">{log.result}</p>
              </div>
            ))}

            {executionLogs.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                <Play className="w-8 h-8 text-slate-600" />
                <p className="font-semibold text-slate-400 text-xs">Awaiting Simulation Trigger</p>
                <p className="text-[11px] max-w-xs">
                  Click on any attack scenario on the left to witness instantaneous cross-system state changes.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 text-center">
            Isolated Sandbox Environment • Zero Real Data Risk
          </div>
        </div>
      </div>
    </div>
  );
};
