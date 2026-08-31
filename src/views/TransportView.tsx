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
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { ExamCentre, Package, TransportRoute } from '../types/index.ts';

interface TransportViewProps {
  packages: Package[];
  centres: ExamCentre[];
  routes: TransportRoute[];
  onRefresh: () => void;
}

export const TransportView: React.FC<TransportViewProps> = ({
  packages = [],
  centres = [],
  routes = [],
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
        attributionControl: false,
      });

      // CartoDB Positron clean light tile layer
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // Plot Exam Strongrooms
    centres.forEach((c) => {
      const centreIcon = L.divIcon({
        className: 'custom-centre-marker',
        html: `<div style="background:#4F46E5; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.2); font-size:10px; font-weight:bold;">🏛</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker(c.coords, { icon: centreIcon })
        .bindPopup(`<strong>${c.name}</strong><br/>City: ${c.city}<br/>Security Score: ${c.securityScore}%`)
        .addTo(layers);
    });

    // Plot Transport Route & Corridor
    if (routes.length > 0 && routes[0]?.waypoints) {
      const routeCoords = routes[0].waypoints;

      // Safe Haversine Corridor Buffer
      L.polyline(routeCoords, {
        color: '#4F46E5',
        weight: 12,
        opacity: 0.15,
      }).addTo(layers);

      // Main Approved Track
      L.polyline(routeCoords, {
        color: '#4F46E5',
        weight: 3,
        opacity: 0.9,
      }).addTo(layers);
    }

    // Plot Active Vehicle Marker
    if (activePackage?.currentLocation) {
      const isBreached = activePackage.tamperState === 'BREACHED';
      const markerColor = isBreached ? '#DC2626' : '#2563EB';

      const vehicleIcon = L.divIcon({
        className: 'custom-vehicle-marker',
        html: `<div style="background:${markerColor}; color:white; border-radius:8px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 4px 8px rgba(0,0,0,0.25); font-size:14px;">🚚</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      vehicleMarkerRef.current = L.marker(
        [activePackage.currentLocation.lat, activePackage.currentLocation.lng],
        { icon: vehicleIcon }
      )
        .bindPopup(
          `<strong>${activePackage.packageCode}</strong><br/>Destination: ${activePackage.destinationCentreName}<br/>Officer: ${activePackage.transportOfficerName}<br/>Speed: ${activePackage.currentLocation.speedKmh} km/h`
        )
        .addTo(layers);
    }
  }, [centres, routes, activePackage]);

  const handleSimulateRouteDeviation = async () => {
    if (!activePackage) return;
    setIsSimulatingDeviation(true);
    try {
      await api.recordIoTEvent({
        deviceId: activePackage.sensorDeviceId || 'IOT-DEV-001',
        packageId: activePackage.id,
        eventType: 'GPS_UPDATED',
        location: {
          lat: 28.4812,
          lng: 77.4521,
          address: 'Unauthorized Corridor Diversion, Sector 128 Greater Noida',
        },
        sensorValues: {
          reedSwitch: 'CLOSED',
          temperature: 24.1,
          light: 12,
          shock: 0.4,
        },
        severity: 'HIGH',
      });
      alert('Simulated route corridor deviation (2.8 km departure) committed.');
      onRefresh();
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulatingDeviation(false);
    }
  };

  const handleSimulateTamper = async () => {
    if (!activePackage) return;
    setIsSimulatingTamper(true);
    try {
      await api.recordIoTEvent({
        deviceId: activePackage.sensorDeviceId || 'IOT-DEV-001',
        packageId: activePackage.id,
        eventType: 'TAMPER_DETECTED',
        location: {
          lat: activePackage.currentLocation?.lat || 28.5355,
          lng: activePackage.currentLocation?.lng || 77.391,
          address: activePackage.currentLocation?.address || 'Noida Corridor Transit',
        },
        sensorValues: {
          reedSwitch: 'OPEN',
          temperature: 34.2,
          light: 512,
          shock: 3.1,
        },
        severity: 'CRITICAL',
      });
      alert('Simulated magnetic seal rupture and ambient lux spike committed.');
      onRefresh();
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulatingTamper(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <Truck className="w-4 h-4" />
            <span>SECURE LOGISTICS & ARMORED TRANSIT</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            Armored Transit Radar & Corridor Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time GPS tracking, electronic geofence corridors, kinetic shock detection, and escort telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
          <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Active LTE Sentinel Uplink</span>
        </div>
      </div>

      {/* Main Map + Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Leaflet Map (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-2 border-slate-200 bg-white shadow-sm overflow-hidden relative">
            <div
              ref={mapContainerRef}
              className="h-[460px] w-full rounded-2xl z-10"
            />

            {/* Map Overlay Badge */}
            <div className="absolute top-5 left-5 z-20 p-2.5 rounded-xl bg-white/90 border border-slate-200 backdrop-blur-md shadow-sm text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-900">National Transit Radar</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Geofence Tolerance: 2.0 km</div>
            </div>
          </Card>
        </div>

        {/* Right Column: Vehicle & Corridor Inspector (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Vehicle Selection */}
          <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Armored Carriers ({packages.length})
              </h3>
              <span className="text-[10px] font-semibold text-indigo-600">Live Escorts</span>
            </div>

            <div className="space-y-2">
              {packages.map((pkg) => {
                const isSelected = pkg.id === selectedPkgId;
                const isBreached = pkg.tamperState === 'BREACHED';

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPkgId(pkg.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{pkg.packageCode}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                        To: {pkg.destinationCentreName}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isBreached
                          ? 'bg-rose-100 text-rose-800'
                          : pkg.status === 'IN_TRANSIT'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isBreached ? 'BREACHED' : pkg.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Telemetry Detail Card */}
          {activePackage && (
            <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Carrier Telemetry</div>
                <h4 className="text-sm font-bold text-slate-900 font-heading mt-0.5">
                  {activePackage.packageCode}
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Escort Commander:</span>
                  <span className="font-bold text-slate-800">{activePackage.transportOfficerName}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Transit Speed:</span>
                  <span className="font-bold text-indigo-600 font-mono">
                    {activePackage.currentLocation?.speedKmh || 42} km/h
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Corridor Deviation:</span>
                  <span
                    className={`font-bold font-mono ${
                      activePackage.routeDeviationKm > 2 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {activePackage.routeDeviationKm || 0.1} km
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Estimated Arrival:</span>
                  <span className="font-bold text-slate-800 font-mono">{activePackage.eta || '11:45 AM'}</span>
                </div>
              </div>

              {/* Simulation Triggers - Clean Action Hierarchy */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSimulateRouteDeviation}
                  disabled={isSimulatingDeviation}
                  className="w-full text-xs font-semibold"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Simulate Corridor Deviation</span>
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleSimulateTamper}
                  disabled={isSimulatingTamper}
                  className="w-full text-xs font-semibold"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Simulate Seal Breach Event</span>
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
