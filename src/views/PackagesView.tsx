import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Boxes,
  CheckCircle2,
  Cpu,
  Eye,
  Flame,
  Lock,
  Plus,
  QrCode,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Thermometer,
  Truck,
  X,
  Zap,
} from 'lucide-react';
import { QrCodeModal } from '../components/QrCodeModal.tsx';
import { Card, CardContent } from '../components/ui/card.tsx';
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { ExamCentre, Package, Paper, User } from '../types/index.ts';

interface PackagesViewProps {
  packages: Package[];
  papers: Paper[];
  centres: ExamCentre[];
  currentUser: User;
  onRefresh: () => void;
}

export const PackagesView: React.FC<PackagesViewProps> = ({
  packages,
  papers,
  centres,
  currentUser,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [qrModalData, setQrModalData] = useState<{ isOpen: boolean; pkg: Package | null }>({
    isOpen: false,
    pkg: null,
  });

  // Create Form State
  const [formPaperId, setFormPaperId] = useState(papers[0]?.id || 'PAP-001');
  const [formCentreId, setFormCentreId] = useState(centres[0]?.id || 'CTR-DEL-01');
  const [formSource, setFormSource] = useState('Central Security Strongroom, New Delhi');
  const [formOfficer, setFormOfficer] = useState('Rajinder Singh Gill');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.packageCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.destinationCentreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.transportOfficerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || pkg.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedCentre = centres.find((c) => c.id === formCentreId) || centres[0];
      await api.createPackage({
        paperIds: [formPaperId],
        sourceFacility: formSource,
        destinationCentreId: formCentreId,
        destinationCentreName: selectedCentre?.name || 'Delhi Security Strongroom',
        transportOfficerId: 'USR-SEC-01',
        transportOfficerName: formOfficer,
      });

      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to seal package: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateTamper = async (pkgId: string) => {
    try {
      await api.recordIoTEvent({
        deviceId: 'IOT-DEV-001',
        packageId: pkgId,
        eventType: 'TAMPER_DETECTED',
        location: { lat: 28.5355, lng: 77.391, address: 'Noida Expressway Geofence Corridor' },
        sensorValues: {
          reedSwitch: 'OPEN',
          temperature: 32.5,
          light: 480,
          shock: 2.8,
        },
        severity: 'CRITICAL',
      });
      alert('Simulated magnetic reed switch tamper and lux breach event committed.');
      onRefresh();
    } catch (err: any) {
      alert(`Tamper simulation error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <Boxes className="w-4 h-4" />
            <span>SMART PHYSICAL CONTAINER SECURITY</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            Smart Exam Boxes & IoT Electronic Seals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time physical hardware containers with active magnetic reed switches, ambient lux detectors, and tamper alarms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LiquidButton
            variant="default"
            size="default"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Seal & Dispatch New Box</span>
          </LiquidButton>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 border-slate-200 bg-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search package code, destination, or escort officer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 pl-9 pr-4 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SEALED">Sealed in Strongroom</option>
            <option value="IN_TRANSIT">In Armored Transit</option>
            <option value="DELIVERED">Delivered to Centre</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredPackages.length}</strong> of {packages.length} containers
        </div>
      </Card>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPackages.map((pkg) => {
          const isBreached = pkg.tamperState === 'BREACHED';
          const isSelected = selectedPackage?.id === pkg.id;

          return (
            <Card
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className={`p-5 border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md bg-white'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {/* Box Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800">{pkg.packageCode}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isBreached
                        ? 'bg-rose-100 text-rose-800'
                        : pkg.status === 'IN_TRANSIT'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isBreached ? 'BREACH_DETECTED' : pkg.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">
                    {pkg.destinationCentreName}
                  </h4>
                  <div className="text-xs text-slate-500 truncate">From: {pkg.sourceFacility}</div>
                </div>

                {/* IoT Telemetry Matrix */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <div className="text-[10px] font-medium text-slate-500 uppercase">Magnetic Reed Seal</div>
                    <div
                      className={`font-bold font-mono ${
                        pkg.lastTelemetry?.reedSwitch === 'OPEN' ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {pkg.lastTelemetry?.reedSwitch === 'OPEN' ? 'BREACHED' : 'INTACT'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <div className="text-[10px] font-medium text-slate-500 uppercase">Ambient Temp</div>
                    <div className="font-bold text-slate-800 font-mono">
                      {pkg.lastTelemetry?.temperature || 21.4}°C
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <div className="text-[10px] font-medium text-slate-500 uppercase">Ambient Light</div>
                    <div className="font-bold text-slate-800 font-mono">
                      {pkg.lastTelemetry?.lightLux || 0} Lux
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <div className="text-[10px] font-medium text-slate-500 uppercase">GPS Accuracy</div>
                    <div className="font-bold text-emerald-600 font-mono">± 1.2m</div>
                  </div>
                </div>
              </div>

              {/* Card Actions Footer - Clear Hierarchy */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-500">
                  Officer: <strong>{pkg.transportOfficerName.split(' ')[0]}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQrModalData({ isOpen: true, pkg });
                    }}
                    className="text-xs font-semibold"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Token</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSimulateTamper(pkg.id);
                    }}
                    className="text-xs font-semibold"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Tamper</span>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Package Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">Prepare & Seal Smart Container</h3>
                  <p className="text-[11px] text-slate-500">Assign confidential paper batches and arm IoT sensors</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Enclosed Question Paper</label>
                <select
                  value={formPaperId}
                  onChange={(e) => setFormPaperId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-slate-900 font-mono text-xs"
                >
                  {papers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.paperCode} - {p.subject} (Set {p.set})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Destination Exam Strongroom</label>
                <select
                  value={formCentreId}
                  onChange={(e) => setFormCentreId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-slate-900 text-xs"
                >
                  {centres.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Assigned Transport Escort Commander</label>
                <input
                  type="text"
                  value={formOfficer}
                  onChange={(e) => setFormOfficer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-slate-900 text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <LiquidButton
                  variant="default"
                  size="default"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Arming Sensors & Sealing...' : 'Seal & Dispatch Package'}</span>
                </LiquidButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData({ isOpen: false, pkg: null })}
        title={qrModalData.pkg ? qrModalData.pkg.packageCode : ''}
        payload={qrModalData.pkg ? qrModalData.pkg.qrPayload : ''}
        type="PACKAGE"
        entityId={qrModalData.pkg ? qrModalData.pkg.id : ''}
      />
    </div>
  );
};
