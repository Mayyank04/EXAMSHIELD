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
import { Card, CardContent } from '../components/ui/card.tsx';
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { Alert, User } from '../types/index.ts';

interface AlertsViewProps {
  alerts: Alert[];
  currentUser: User;
  onRefresh: () => void;
  onNavigateToIncidents: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts = [],
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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
            <AlertTriangle className="w-4 h-4" />
            <span>CENTRAL ALARM & ANOMALY SURVEILLANCE</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            Real-Time Anomaly Alerts & Escalations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sensor telemetry spikes, geofence breaches, and unauthorized cryptographic access attempts.
          </p>
        </div>

        <Button
          variant="outline"
          size="default"
          onClick={onNavigateToIncidents}
          className="flex items-center gap-1.5 text-xs font-semibold"
        >
          <span>Open Forensic Investigation Room</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border-slate-200 bg-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search alert code, resource, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 pl-9 pr-4 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredAlerts.length}</strong> of {alerts.length} alerts
        </div>
      </Card>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isHigh = alert.severity === 'HIGH';

          return (
            <Card
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
              className="p-5 border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : isHigh
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-500">{alert.alertCode}</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading leading-snug">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-sans mt-1 leading-relaxed">
                    {alert.description}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-slate-600">
                  <div>Resource: <strong className="text-slate-900">{alert.affectedResource.label}</strong></div>
                  <div>Location: <strong>{alert.location}</strong></div>
                  <div>Status: <strong className="text-indigo-700">{alert.status}</strong></div>
                </div>
              </div>

              {/* Action Buttons - Clear Single Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>

                <div className="flex items-center gap-2">
                  {alert.status === 'OPEN' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcknowledge(alert.id);
                      }}
                      className="text-xs font-semibold"
                    >
                      Acknowledge
                    </Button>
                  )}
                  {alert.status !== 'RESOLVED' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolve(alert.id);
                      }}
                      className="text-xs font-semibold"
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
