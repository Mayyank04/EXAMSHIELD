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
import { Card, CardContent } from '../components/ui/card.tsx';
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
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

  const scenarios = [
    {
      id: 'SEAL_BREACH',
      title: 'Smart Container Magnetic Seal Breach',
      desc: 'Simulates physical container rupture outside authorized strongroom geofence.',
      severity: 'CRITICAL',
      icon: Flame,
      handler: async () => {
        setRunningScenario('SEAL_BREACH');
        try {
          await api.recordIoTEvent({
            deviceId: 'IOT-DEV-001',
            packageId: 'ES-PKG-82931',
            eventType: 'TAMPER_DETECTED',
            location: { lat: 28.5355, lng: 77.391, address: 'Noida Expressway Geofence Corridor' },
            sensorValues: { reedSwitch: 'OPEN', temperature: 33.2, light: 520, shock: 3.2 },
            severity: 'CRITICAL',
          });
          addLog('Simulated Seal Breach', 'Critical alert committed; emergency lockdown initiated.', 'ALERT');
          onRefresh();
        } finally {
          setRunningScenario(null);
        }
      },
    },
    {
      id: 'CORRIDOR_DEVIATION',
      title: 'Armored Transit Corridor Departure',
      desc: 'Simulates armored carrier departing from the approved Haversine GPS corridor.',
      severity: 'HIGH',
      icon: Navigation,
      handler: async () => {
        setRunningScenario('CORRIDOR_DEVIATION');
        try {
          await api.recordIoTEvent({
            deviceId: 'IOT-DEV-002',
            packageId: 'ES-PKG-82931',
            eventType: 'GPS_UPDATED',
            location: { lat: 28.4812, lng: 77.4521, address: 'Unauthorized Diversion, Greater Noida' },
            sensorValues: { reedSwitch: 'CLOSED', temperature: 24.1, light: 10, shock: 0.2 },
            severity: 'HIGH',
          });
          addLog('Simulated Route Deviation', 'Corridor alert generated; Escort Commander notified.', 'ALERT');
          onRefresh();
        } finally {
          setRunningScenario(null);
        }
      },
    },
    {
      id: 'SET_B_FAILOVER',
      title: 'Emergency Paper Set B Failover Trigger',
      desc: 'Simulates instant cryptographic failover activating secondary backup paper Set B.',
      severity: 'LOW',
      icon: Zap,
      handler: async () => {
        setRunningScenario('SET_B_FAILOVER');
        try {
          await api.activateBackupPaper();
          addLog('Activated Backup Paper', 'Set B authorized; Set A invalidated on ledger.', 'SUCCESS');
          onRefresh();
        } finally {
          setRunningScenario(null);
        }
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
            <Flame className="w-4 h-4" />
            <span>CYBER-PHYSICAL ATTACK SIMULATION LAB</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            Security Attack Lab & Failover Triggers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Test and validate autonomous defensive protocols under simulated tamper and exfiltration scenarios.
          </p>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {scenarios.map((scen) => {
          const Icon = scen.icon;
          return (
            <Card key={scen.id} className="p-5 border-slate-200 bg-white shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      scen.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : scen.severity === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {scen.severity}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 font-heading">{scen.title}</h4>
                <p className="text-xs text-slate-600 font-sans leading-relaxed">{scen.desc}</p>
              </div>

              <Button
                variant={scen.severity === 'CRITICAL' ? 'destructive' : 'default'}
                size="sm"
                onClick={scen.handler}
                disabled={runningScenario === scen.id}
                className="w-full text-xs font-semibold"
              >
                <span>{runningScenario === scen.id ? 'Simulating Event...' : 'Trigger Simulation'}</span>
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Execution Logs */}
      {executionLogs.length > 0 && (
        <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase">Simulation Execution Stream</h3>
          <div className="space-y-2 font-mono text-xs">
            {executionLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  log.status === 'ALERT'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <div>
                  <strong>{log.action}</strong>: {log.result}
                </div>
                <span className="text-[10px] text-slate-500">{log.time}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
