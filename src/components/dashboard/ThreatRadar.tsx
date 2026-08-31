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

interface ThreatRadarProps {
  centres: ExamCentre[];
  packages: Package[];
  alerts: Alert[];
  onNavigateToView: (view: string) => void;
}

export const ThreatRadar: React.FC<ThreatRadarProps> = ({
  centres,
  packages,
  alerts,
  onNavigateToView,
}) => {
  const [hoveredNode, setHoveredNode] = useState<{
    id: string;
    label: string;
    type: string;
    status: string;
    score?: number;
  } | null>(null);

  const activeAlerts = alerts.filter((a) => a.status === 'OPEN' || a.status === 'INVESTIGATING');

  return (
    <Card className="border-cyan-500/20 bg-gradient-to-b from-slate-950/80 via-[#050B18]/70 to-slate-950/90 shadow-2xl relative overflow-hidden">
      <CardHeader className="p-5 pb-2 border-b border-slate-800/80 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>NATIONAL EXAM SECURITY RADAR MESH</span>
          </div>
          <CardTitle className="text-base font-bold text-white mt-1">
            Real-Time Geofenced Threat Surveillance
          </CardTitle>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Centres (10)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Logistics (3)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>Threats ({activeAlerts.length})</span>
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Radar Screen Visual (8 Cols) */}
          <div className="lg:col-span-8 relative aspect-video sm:h-[340px] w-full rounded-2xl bg-[#030712] border border-cyan-500/30 overflow-hidden flex items-center justify-center shadow-[inset_0_0_50px_rgba(0,217,255,0.08)]">
            {/* Concentric Radar Range Rings */}
            <div className="absolute w-[85%] aspect-square rounded-full border border-cyan-500/15 pointer-events-none" />
            <div className="absolute w-[60%] aspect-square rounded-full border border-cyan-500/20 pointer-events-none" />
            <div className="absolute w-[35%] aspect-square rounded-full border border-cyan-500/25 pointer-events-none" />

            {/* Crosshair Grids */}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-cyan-500/15 pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-cyan-500/15 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.05)_0%,transparent_70%)] pointer-events-none" />

            {/* Rotating Radar Sweep Beam */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
              className="absolute inset-0 origin-center pointer-events-none"
            >
              <div className="w-1/2 h-1/2 bg-gradient-to-br from-cyan-400/20 via-cyan-500/5 to-transparent origin-bottom-right rounded-tl-full" />
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
              className="absolute z-20 w-10 h-10 rounded-2xl bg-blue-600 border-2 border-cyan-300 shadow-[0_0_20px_rgba(0,217,255,0.6)] flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform"
            >
              <Shield className="w-5 h-5" />
            </div>

            {/* Orbiting Exam Centres */}
            {centres.slice(0, 8).map((centre, idx) => {
              const angle = (idx / 8) * 2 * Math.PI - Math.PI / 2;
              const radiusPercent = 38; // Radius from center
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
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-lg transition-transform group-hover:scale-125 ${
                      isHighAlert
                        ? 'bg-rose-600 border-rose-300 text-white shadow-rose-600/50 animate-bounce'
                        : 'bg-emerald-600 border-emerald-300 text-white shadow-emerald-600/30'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/90 border border-slate-800 px-2 py-0.5 rounded text-[9px] font-mono text-slate-200 whitespace-nowrap pointer-events-none z-30">
                    {centre.name.split(' ')[0]} ({centre.securityScore}%)
                  </div>
                </div>
              );
            })}

            {/* Active Logistics Vehicles */}
            {packages.slice(0, 3).map((pkg, idx) => {
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
                    className={`w-7 h-7 rounded-xl flex items-center justify-center border shadow-lg transition-transform group-hover:scale-125 ${
                      isBreached
                        ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-rose-500/50 animate-pulse'
                        : 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-cyan-500/30'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}

            {/* Radar Coordinates Overlay */}
            <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-400/70 select-none">
              GEOFENCE: 28.6139° N, 77.2090° E • SECTOR 01-10
            </div>
            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500 select-none">
              HAVERSINE CORRIDOR TOLERANCE: 2.0 KM
            </div>
          </div>

          {/* Node Inspector Info Panel (4 Cols) */}
          <div className="lg:col-span-4 h-full flex flex-col justify-between space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                  Target Telemetry Focus
                </span>
                <span className="text-[10px] font-mono text-slate-500">Live Beacon</span>
              </div>

              {hoveredNode ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-sm">{hoveredNode.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        hoveredNode.status === 'BREACHED' || hoveredNode.status === 'HIGH_ALERT'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {hoveredNode.status}
                    </span>
                  </div>
                  <div className="text-slate-300 font-medium">{hoveredNode.label}</div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                    <span>Security Rating:</span>
                    <span className="font-bold text-cyan-400">{hoveredNode.score}%</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center space-y-1 text-slate-500">
                  <Compass className="w-6 h-6 mx-auto text-slate-600" />
                  <p className="text-xs text-slate-400 font-medium">Hover over radar nodes</p>
                  <p className="text-[10px]">Inspect live exam centres and transit carriers</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={() => onNavigateToView('transport')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold transition flex items-center justify-between"
              >
                <span>Open Armored Transit Radar</span>
                <Truck className="w-4 h-4 text-cyan-400" />
              </button>
              <button
                onClick={() => onNavigateToView('incidents')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/40 text-slate-200 text-xs font-semibold transition flex items-center justify-between"
              >
                <span>View Active Incident Cases</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
