import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Database,
  Globe,
  KeyRound,
  Layers,
  Lock,
  RefreshCw,
  Server,
  Shield,
  ShieldCheck,
  Smartphone,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card.tsx';
import { Button } from '../components/ui/liquid-glass-button.tsx';
import { ProviderManager } from '../services/providers/index.ts';
import { ServiceHealthStatus } from '../types/index.ts';

interface SystemHealthViewProps {
  onRefresh: () => void;
}

export const SystemHealthView: React.FC<SystemHealthViewProps> = ({ onRefresh }) => {
  const [healthList, setHealthList] = useState<ServiceHealthStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProdMode, setIsProdMode] = useState<boolean>(ProviderManager.isProduction());

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const list = await ProviderManager.checkSystemHealth();
      setHealthList(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, [isProdMode]);

  const handleToggleMode = () => {
    const next = !isProdMode;
    setIsProdMode(next);
    ProviderManager.setProductionMode(next);
    onRefresh();
  };

  const envChecklist = [
    { key: 'VITE_APP_NAME', label: 'ExamShield Platform Name', status: 'SET' },
    { key: 'DATABASE_URL', label: 'Primary Relational Database', status: isProdMode ? 'SET' : 'DEMO' },
    { key: 'GEMINI_API_KEY', label: 'Google Gemini Threat Radar', status: isProdMode ? 'ACTIVE' : 'DEMO' },
    { key: 'OPENAI_API_KEY', label: 'OpenAI NLP Extractor', status: isProdMode ? 'ACTIVE' : 'DEMO' },
    { key: 'GOOGLE_MAPS_API_KEY', label: 'Google Maps Vector API', status: 'LEAFLET RADAR' },
    { key: 'MQTT_BROKER_URL', label: 'IoT Hardware Gateway Broker', status: 'VIRTUAL SENTINEL' },
    { key: 'AUTH_SECRET', label: 'Zero-Trust IAM Enclave Key', status: 'SECURED' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <Cpu className="w-4 h-4" />
            <span>INFRASTRUCTURE TELEMETRY & ADAPTER HEALTH</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            System & API Service Health
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Microservice heartbeat checks, real vs mock provider toggles, and environment readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHealth}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Recheck Health</span>
          </Button>

          <Button
            variant={isProdMode ? 'default' : 'secondary'}
            size="sm"
            onClick={handleToggleMode}
            className="text-xs font-semibold"
          >
            {isProdMode ? 'Mode: Production Backend' : 'Mode: In-Memory Demo'}
          </Button>
        </div>
      </div>

      {/* Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {healthList.map((svc, idx) => (
          <Card key={idx} className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 font-heading">{svc.service}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  svc.status === 'CONNECTED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : svc.status === 'DEGRADED' || svc.status === 'DEMO MODE'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {svc.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Active Provider:</span>
                <strong className="text-slate-900">{svc.provider}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Latency:</span>
                <span className="font-mono text-indigo-600 font-bold">{svc.latencyMs}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status Info:</span>
                <span className="text-slate-500 truncate max-w-[160px]">{svc.details || 'Operating nominally'}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Environment Variable Audit */}
      <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase">
          Environment & Security Key Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {envChecklist.map((env, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-mono font-bold text-slate-900">{env.key}</div>
                <div className="text-[10px] text-slate-500">{env.label}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-800">
                {env.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
