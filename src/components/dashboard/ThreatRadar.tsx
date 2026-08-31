import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Compass,
  Globe,
  Lock,
  MapPin,
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Zap,
} from 'lucide-react';
import { Alert, ExamCentre, Package } from '../../types/index.ts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { Button } from '../ui/liquid-glass-button.tsx';

interface ThreatRadarProps {
  centres?: ExamCentre[];
  packages?: Package[];
  alerts?: Alert[];
  onNavigateToView: (view: string) => void;
}

export const ThreatRadar: React.FC<ThreatRadarProps> = ({
  centres = [],
  packages = [],
  alerts = [],
  onNavigateToView,
}) => {
  const [hoveredNode, setHoveredNode] = useState<{
    id: string;
    label: string;
    type: string;
    status: string;
    score?: number;
  } | null>(null);

  const activeAlerts = (alerts || []).filter((a) => a.status === 'OPEN' || a.status === 'INVESTIGATING');
  const safeCentres = centres && centres.length > 0 ? centres : [
    { id: '1', code: 'DEL-01', name: 'Delhi National Enclave', status: 'ACTIVE', securityScore: 99, city: 'Delhi', coords: [28.61, 77.20] as [number, number], superintendentName: 'Dr. Sharma' },
    { id: '2', code: 'NOI-02', name: 'Noida Security Strongroom', status: 'ACTIVE', securityScore: 98, city: 'Noida', coords: [28.53, 77.39] as [number, number], superintendentName: 'Prof. Verma' },
  ];

  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>NATIONAL EXAM SECURITY RADAR</span>
          </div>
          <CardTitle className="text-base font-bold text-slate-900 mt-1">
            Real-Time Geofenced Threat Surveillance
          </CardTitle>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Centres ({safeCentres.length})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span>Logistics ({packages.length || 3})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Threats ({activeAlerts.length})</span>
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Radar Screen Visual (8 Cols) */}
          <div className="lg:col-span-8 relative aspect-video sm:h-[340px] w-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
            {/* Concentric Radar Range Rings */}
            <div className="absolute w-[85%] aspect-square rounded-full border border-indigo-500/20 pointer-events-none" />
            <div className="absolute w-[60%] aspect-square rounded-full border border-indigo-500/25 pointer-events-none" />
            <div className="absolute w-[35%] aspect-square rounded-full border border-indigo-500/30 pointer-events-none" />

            {/* Crosshair Grids */}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-indigo-500/20 pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-indigo-500/20 pointer-events-none" />

            {/* Rotating Radar Sweep Beam */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
              className="absolute inset-0 origin-center pointer-events-none"
            >
              <div className="w-1/2 h-1/2 bg-gradient-to-br from-indigo-500/30 via-indigo-500/5 to-transparent origin-bottom-right rounded-tl-full" />
            </motion.div>

            {/* Central Command HQ Node */}
            <div
              onMouseEnter={() =>
                setHoveredNode({
                  id: 'HQ-DEL',
                  label: 'ExamShield National SOC HQ',
                  type: 'CENTRAL_COMMAND',
                  status: 'ACTIVE_SENTINEL',
                  score: 100,
                })
              }
              onMouseLeave={() => setHoveredNode(null)}
              className="absolute z-20 w-10 h-10 rounded-2xl bg-indigo-600 border-2 border-white shadow-lg flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform"
            >
              <Shield className="w-5 h-5" />
            </div>

            {/* Orbiting Exam Centres */}
            {safeCentres.slice(0, 8).map((centre, idx) => {
              const angle = (idx / 8) * 2 * Math.PI - Math.PI / 2;
              const radiusPercent = 38;
              const xPercent = 50 + radiusPercent * Math.cos(angle);
              const yPercent = 50 + radiusPercent * Math.sin(angle);
              const isHighAlert = centre.status === 'HIGH_ALERT';

              return (
                <div
                  key={centre.id}
                  style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                  onMouseEnter={() =>
                    setHoveredNode({
                      id: centre.code,
                      label: centre.name,
                      type: 'EXAM_CENTRE',
                      status: centre.status,
                      score: centre.securityScore,
                    })
                  }
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => onNavigateToView('centres')}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md transition-transform group-hover:scale-125 ${
                      isHighAlert
                        ? 'bg-rose-600 text-white animate-bounce'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-900 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap shadow-sm pointer-events-none z-30">
                    {centre.name.split(' ')[0]} ({centre.securityScore}%)
                  </div>
                </div>
              );
            })}

            {/* Active Logistics Vehicles */}
            {(packages || []).slice(0, 3).map((pkg, idx) => {
              const angle = ((idx * 2 + 1) / 6) * 2 * Math.PI;
              const radiusPercent = 22;
              const xPercent = 50 + radiusPercent * Math.cos(angle);
              const yPercent = 50 + radiusPercent * Math.sin(angle);
              const isBreached = pkg.tamperState === 'BREACHED';

              return (
                <div
                  key={pkg.id}
                  style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                  onMouseEnter={() =>
                    setHoveredNode({
                      id: pkg.packageCode,
                      label: `Armored Carrier (${pkg.destinationCentreName})`,
                      type: 'LOGISTICS_CARRIER',
                      status: pkg.tamperState,
                      score: isBreached ? 45 : 98,
                    })
                  }
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => onNavigateToView('transport')}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 border-white shadow-md transition-transform group-hover:scale-125 ${
                      isBreached
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}

            {/* Radar Coordinates Overlay */}
            <div className="absolute top-3 left-3 text-[10px] font-mono text-indigo-300 select-none">
              GEOFENCE: 28.6139° N, 77.2090° E • SECTOR 01-10
            </div>
            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 select-none">
              HAVERSINE TOLERANCE: 2.0 KM
            </div>
          </div>

          {/* Node Inspector Info Panel (4 Cols) */}
          <div className="lg:col-span-4 h-full flex flex-col justify-between space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-[10px] font-semibold text-indigo-600 uppercase">
                  Target Telemetry Focus
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Live Beacon</span>
              </div>

              {hoveredNode ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-sm">{hoveredNode.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hoveredNode.status === 'BREACHED' || hoveredNode.status === 'HIGH_ALERT'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {hoveredNode.status}
                    </span>
                  </div>
                  <div className="text-slate-700 font-medium">{hoveredNode.label}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Security Rating:</span>
                    <span className="font-bold text-indigo-600">{hoveredNode.score}%</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center space-y-1 text-slate-400">
                  <Compass className="w-6 h-6 mx-auto text-slate-400" />
                  <p className="text-xs text-slate-600 font-medium">Hover over radar nodes</p>
                  <p className="text-[10px] text-slate-500">Inspect live exam centres and transit carriers</p>
                </div>
              )}
            </div>

            {/* Quick Action - Clear Single Primary Action */}
            <div className="space-y-2">
              <Button
                variant="outline"
                size="default"
                onClick={() => onNavigateToView('transport')}
                className="w-full flex items-center justify-between text-xs font-semibold"
              >
                <span>Open Armored Transit Radar</span>
                <Truck className="w-4 h-4 text-indigo-600" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
