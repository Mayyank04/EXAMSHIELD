import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Compass,
  Flame,
  Gauge,
  Layers,
  Lock,
  MapPin,
  Navigation,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Thermometer,
  Truck,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card.tsx';
import { LiquidButton, MetalButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { ExamCentre, Package, TransportRoute } from '../types/index.ts';

interface TransportViewProps {
  packages: Package[];
  centres: ExamCentre[];
  routes: TransportRoute[];
  onRefresh: () => void;
}

export const TransportView: React.FC<TransportViewProps> = ({
  packages,
  centres,
  routes,
  onRefresh,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedPkgId, setSelectedPkgId] = useState<string>(packages[0]?.id || 'ES-PKG-82931');
  const [isSimulatingDeviation, setIsSimulatingDeviation] = useState(false);
  const [isSimulatingTamper, setIsSimulatingTamper] = useState(false);

  const activePackage = packages.find((p) => p.id === selectedPkgId) || packages[0];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.55, 77.25],
        zoom: 10,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 18,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const layerGroup = layerGroupRef.current;
    if (layerGroup) {
      layerGroup.clearLayers();

      // 1. Draw Exam Centres
      centres.forEach((c) => {
        const isHighAlert = c.status === 'HIGH_ALERT';
        const circle = L.circleMarker(c.coords, {
          radius: isHighAlert ? 8 : 6,
          color: isHighAlert ? '#ef4444' : '#10b981',
          fillColor: isHighAlert ? '#ef4444' : '#059669',
          fillOpacity: 0.85,
          weight: 2,
        });

        circle.bindPopup(`
          <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
            <strong style="color: #0f172a; font-size: 12px;">${c.name}</strong><br/>
            <span>Code: ${c.code} | City: ${c.city}</span><br/>
            <span>Security Score: <strong>${c.securityScore}/100</strong></span><br/>
            <span>Superintendent: ${c.superintendentName}</span>
          </div>
        `);
        layerGroup.addLayer(circle);
      });

      // 2. Draw Authorized Geofence Route Corridors
      routes.forEach((r) => {
        const polyline = L.polyline(r.waypoints, {
          color: '#00D9FF',
          weight: 4,
          opacity: 0.85,
          dashArray: '6, 6',
        });
        polyline.bindPopup(`<strong>Corridor: ${r.name}</strong><br/>Tolerance: ${r.corridorToleranceKm} km`);
        layerGroup.addLayer(polyline);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
        vehicleMarkerRef.current = null;
      }
    };
  }, [centres, routes]);

  // Update vehicle position marker
  useEffect(() => {
    if (!mapInstanceRef.current || !activePackage) return;
    const map = mapInstanceRef.current;

    const lat = activePackage.currentLocation.lat;
    const lng = activePackage.currentLocation.lng;
    const isBreached = activePackage.tamperState === 'BREACHED';
    const isDeviated = (activePackage.routeDeviationKm ?? 0) > 2.0;

    const customIcon = L.divIcon({
      className: 'custom-vehicle-pin',
      html: `
        <div style="
          width: 34px;
          height: 34px;
          background: ${isBreached ? '#ef4444' : isDeviated ? '#f59e0b' : '#00D9FF'};
          border: 3px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px ${isBreached ? 'rgba(239,68,68,0.9)' : isDeviated ? 'rgba(245,158,11,0.9)' : 'rgba(0,217,255,0.9)'};
          color: ${isBreached || isDeviated ? 'white' : '#030712'};
          font-size: 14px;
          font-weight: bold;
        ">
          🚛
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.setLatLng([lat, lng]);
      vehicleMarkerRef.current.setIcon(customIcon);
    } else {
      vehicleMarkerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    }

    vehicleMarkerRef.current.bindPopup(`
      <div style="font-family: sans-serif; font-size: 11px;">
        <strong>Carrier: DL-1VB-9921</strong><br/>
        <span>Package: ${activePackage.packageCode}</span><br/>
        <span>Officer: ${activePackage.transportOfficerName}</span><br/>
        <span>Deviation: <strong>${activePackage.routeDeviationKm} km</strong></span><br/>
        <span>Tamper State: <strong style="color:${isBreached ? '#ef4444' : '#10b981'}">${activePackage.tamperState}</strong></span>
      </div>
    `);

    map.panTo([lat, lng]);
  }, [activePackage]);

  const handleSimulateDeviation = async () => {
    setIsSimulatingDeviation(true);
    try {
      await api.simulateGpsDeviation(activePackage.id, 3.8);
      onRefresh();
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulatingDeviation(false);
    }
  };

  const handleSimulateTamper = async () => {
    setIsSimulatingTamper(true);
    try {
      await api.simulateTamper(activePackage.id);
      onRefresh();
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulatingTamper(false);
    }
  };

  const isBreached = activePackage?.tamperState === 'BREACHED';
  const isDeviated = (activePackage?.routeDeviationKm ?? 0) > 2.0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-950 via-[#050B18] to-[#0A1425] p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>SECURE TRANSPORT NETWORK & ARMORED LOGISTICS RADAR</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 font-heading">
            Armored Transit Radar & Geofence Corridor
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time GPS tracking, electronic seal telemetry, and autonomous Haversine geofence deviation detection.
          </p>
        </div>

        <select
          value={selectedPkgId}
          onChange={(e) => setSelectedPkgId(e.target.value)}
          className="bg-slate-900 border border-slate-700/80 px-3.5 py-2 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 shadow-inner"
        >
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.packageCode} ({pkg.destinationCentreName})
            </option>
          ))}
        </select>
      </Card>

      {/* Map & Logistics Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map View (8 Cols) */}
        <div className="lg:col-span-8">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-mono text-xs font-bold text-slate-200">
                  Corridor Map • {activePackage?.packageCode}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span>Geofence Tolerance: 2.0 km</span>
                <span className="text-cyan-400">Leaflet Radar Active</span>
              </div>
            </div>

            <div className="h-[480px] w-full relative">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>
          </Card>
        </div>

        {/* Right: Active Vehicle Telemetry & Simulation (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <h3 className="text-sm font-bold text-white font-heading">{activePackage?.packageCode}</h3>
                <p className="text-[10px] font-mono text-slate-400">Carrier: DL-1VB-9921</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                  isBreached
                    ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                    : isDeviated
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}
              >
                {activePackage?.tamperState}
              </span>
            </div>

            {/* Live Sensor Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Reed Switch</span>
                </div>
                <div
                  className={`font-mono font-bold text-xs ${
                    activePackage?.lastTelemetry.reedSwitch === 'OPEN'
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {activePackage?.lastTelemetry.reedSwitch}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-cyan-400" />
                  <span>Temperature</span>
                </div>
                <div className="font-mono font-bold text-xs text-slate-200">
                  {activePackage?.lastTelemetry.temperature}°C
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                  <Compass className="w-3 h-3 text-amber-400" />
                  <span>Corridor Deviation</span>
                </div>
                <div
                  className={`font-mono font-bold text-xs ${
                    isDeviated ? 'text-amber-400' : 'text-slate-200'
                  }`}
                >
                  {activePackage?.routeDeviationKm} km
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-slate-400" />
                  <span>Speed / ETA</span>
                </div>
                <div className="font-mono font-bold text-xs text-slate-200">
                  {activePackage?.currentLocation.speedKmh} km/h • {activePackage?.eta}
                </div>
              </div>
            </div>

            {/* Transport Details */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Destination:</span>
                <span className="text-slate-200">{activePackage?.destinationCentreName}</span>
              </div>
              <div className="flex justify-between">
                <span>Transport Officer:</span>
                <span className="text-slate-200">{activePackage?.transportOfficerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Seal ID:</span>
                <span className="font-mono text-cyan-300">{activePackage?.sealId}</span>
              </div>
            </div>

            {/* Simulation Action Controls with LiquidButtons */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
                Interactive Attack Triggers
              </div>
              <LiquidButton
                variant="default"
                size="default"
                className="w-full"
                onClick={handleSimulateDeviation}
                disabled={isSimulatingDeviation}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Simulate Corridor Deviation (3.8 km)</span>
              </LiquidButton>
              <LiquidButton
                variant="danger"
                size="default"
                className="w-full"
                onClick={handleSimulateTamper}
                disabled={isSimulatingTamper}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Simulate Physical Box Compromise</span>
              </LiquidButton>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
