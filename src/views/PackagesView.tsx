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
import { LiquidButton, MetalButton } from '../components/ui/liquid-glass-button.tsx';
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
  const [formSource, setFormSource] = useState('Central Currency Press Strongroom, New Delhi');
  const [formOfficer, setFormOfficer] = useState('Rajinder Singh Gill');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.packageCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.destinationCentreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.sealId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || pkg.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createPackage({
        paperIds: [formPaperId],
        destinationCentreId: formCentreId,
        sourceFacility: formSource,
        transportOfficerName: formOfficer,
      });
      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      alert(`Package creation failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateTamper = async (pkgId: string) => {
    if (!confirm('Trigger simulated physical container seal breach & tamper lock?')) return;
    try {
      await api.simulateTamper(pkgId);
      alert('Physical tamper event dispatched to IoT daemon and blockchain!');
      onRefresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-950 via-[#050B18] to-[#0A1425] p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400">
            <Boxes className="w-3.5 h-3.5" />
            <span>ELECTRONIC RFID SEALED SMART EXAM CONTAINER FLEET</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 font-heading">
            Smart Sealed Boxes & Containers
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tamper-evident smart physical boxes integrated with magnetic reed sentinels and real-time environmental sensors.
          </p>
        </div>

        <LiquidButton
          variant="emerald"
          size="default"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Prepare & Seal Package</span>
        </LiquidButton>
      </Card>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by package code, seal, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 pl-9 pr-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-900 border border-slate-700/80 px-3 py-2 rounded-xl text-slate-300 focus:outline-none focus:border-cyan-500 text-xs font-mono w-full sm:w-auto"
        >
          <option value="ALL">All Statuses</option>
          <option value="SEALED">SEALED</option>
          <option value="IN_TRANSIT">IN_TRANSIT</option>
          <option value="RECEIVED">RECEIVED</option>
          <option value="TAMPER_LOCKED">TAMPER_LOCKED</option>
        </select>
      </div>

      {/* Grid of Physical Smart Box 3D Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPackages.map((pkg, idx) => {
          const isBreached = pkg.tamperState === 'BREACHED' || pkg.status === 'TAMPER_LOCKED';

          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card
                className={`p-5 border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                  isBreached
                    ? 'bg-rose-950/30 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
                    : 'bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-950/80 border-slate-800/90 hover:border-cyan-500/40 shadow-xl'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Status & Code Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm tracking-wide">
                        {pkg.packageCode}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/60">
                        SECURE BOX
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                        isBreached
                          ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {pkg.status}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-100 font-heading">
                      {pkg.destinationCentreName}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      RFID Seal: <span className="text-cyan-300">{pkg.sealId}</span>
                    </div>
                  </div>

                  {/* 4 Physical Sensor Indicators Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 font-mono text-xs">
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase">Reed Switch</div>
                      <div
                        className={`font-bold mt-0.5 flex items-center gap-1 ${
                          pkg.lastTelemetry.reedSwitch === 'OPEN' ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>{pkg.lastTelemetry.reedSwitch}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase">Temperature</div>
                      <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-cyan-400" />
                        <span>{pkg.lastTelemetry.temperature}°C NORMAL</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase">GPS Corridor</div>
                      <div className="font-bold text-cyan-300 mt-0.5 flex items-center gap-1">
                        <Radio className="w-3 h-3 text-cyan-400" />
                        <span>ONLINE</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase">Tamper State</div>
                      <div
                        className={`font-bold mt-0.5 ${
                          isBreached ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                        }`}
                      >
                        {isBreached ? 'BREACHED' : 'NONE'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="font-mono text-[10px] text-slate-400">
                    Officer: {pkg.transportOfficerName.split(' ')[0]}
                  </span>
                  <div className="flex items-center gap-2">
                    <LiquidButton
                      variant="neutral"
                      size="sm"
                      onClick={() => setQrModalData({ isOpen: true, pkg })}
                    >
                      <QrCode className="w-3 h-3" />
                      <span>QR Token</span>
                    </LiquidButton>
                    <LiquidButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleSimulateTamper(pkg.id)}
                    >
                      <Flame className="w-3 h-3" />
                      <span>Tamper</span>
                    </LiquidButton>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Create Package Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">Prepare & Seal Smart Container</h3>
                  <p className="text-[11px] text-slate-400">Assign confidential paper batches and arm IoT sensors</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Enclosed Question Paper</label>
                <select
                  value={formPaperId}
                  onChange={(e) => setFormPaperId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-slate-200 font-mono text-xs"
                >
                  {papers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.paperCode} ({p.subject} Set {p.set})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Destination Examination Centre</label>
                <select
                  value={formCentreId}
                  onChange={(e) => setFormCentreId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-slate-200 font-mono text-xs"
                >
                  {centres.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Source Printing Facility</label>
                <input
                  type="text"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-slate-200 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <LiquidButton
                  variant="emerald"
                  size="default"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2"
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
