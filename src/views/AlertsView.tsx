import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  Flame,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Zap,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Alert, User } from '../types/index.ts';

interface AlertsViewProps {
  alerts: Alert[];
  currentUser: User;
  onRefresh: () => void;
  onNavigateToIncidents: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  currentUser,
  onRefresh,
  onNavigateToIncidents,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.alertCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.affectedResource.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === 'ALL' || a.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleAcknowledge = async (alertId: string) => {
    try {
      await api.acknowledgeAlert(alertId, currentUser.name);
      onRefresh();
    } catch (err: any) {
      alert(`Acknowledge failed: ${err.message}`);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await api.resolveAlert(alertId);
      onRefresh();
    } catch (err: any) {
      alert(`Resolve failed: ${err.message}`);
    }
  };

  const handleEscalateToIncident = async (targetAlert: Alert) => {
    try {
      await api.createIncident({
        title: `Escalated Incident: ${targetAlert.title}`,
        severity: targetAlert.severity,
        description: targetAlert.description,
        affectedPaperId: targetAlert.affectedResource.type === 'PAPER' ? targetAlert.affectedResource.id : undefined,
        affectedPackageId: targetAlert.affectedResource.type === 'PACKAGE' ? targetAlert.affectedResource.id : undefined,
        affectedUserId: targetAlert.affectedResource.type === 'USER' ? targetAlert.affectedResource.id : undefined,
        assignedInvestigator: currentUser.name,
      });
      alert('Alert successfully escalated into Active Forensic Case Docket!');
      onRefresh();
      onNavigateToIncidents();
    } catch (err: any) {
      alert(`Escalation failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-rose-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>REAL-TIME SECURITY INCIDENT & THREAT TRIAGE FEED</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1 font-heading">
            Active Security Alerts & Anomaly Triage
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated alerts triggered by smart container sensors, GPS geofence departures, AI behavioral anomalies, and document hash mismatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            Active Alerts: <strong className="text-rose-400">{alerts.filter((a) => a.status === 'OPEN').length}</strong>
          </span>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by code, title, resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 pl-9 pr-3 py-2 rounded-xl text-slate-200 focus:outline-none focus:border-rose-500 font-mono text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-slate-300 focus:outline-none focus:border-rose-500 text-xs font-mono"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-slate-300 focus:outline-none focus:border-rose-500 text-xs font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.map((alert) => {
          const isCrit = alert.severity === 'CRITICAL';
          const isOpen = alert.status === 'OPEN';

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border shadow-xl space-y-3 transition flex flex-col justify-between ${
                isCrit && isOpen
                  ? 'bg-rose-950/30 border-rose-700 shadow-rose-950/20'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-200 text-xs">{alert.alertCode}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isCrit
                          ? 'bg-rose-900 text-rose-200 border border-rose-700 animate-pulse'
                          : 'bg-amber-900 text-amber-200 border border-amber-700'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white font-heading">{alert.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{alert.description}</p>
              </div>

              {/* Reasons list */}
              {alert.reasons && alert.reasons.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px] font-mono text-slate-400">
                  {alert.reasons.map((r, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="font-mono text-[10px] text-slate-400">Status: <strong>{alert.status}</strong></span>
                <div className="space-x-2">
                  {isOpen && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => handleEscalateToIncident(alert)}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium transition shadow-md shadow-rose-600/30"
                  >
                    Escalate to Incident
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
