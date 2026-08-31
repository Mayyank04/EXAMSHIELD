import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle2,
  ExternalLink,
  Info,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import { Alert, AlertSeverity, NotificationItem } from '../types/index.ts';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onNavigateToView: (view: string, id?: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onClearAll,
  onNavigateToView,
}) => {
  if (!isOpen) return null;

  const getSeverityIcon = (sev: AlertSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'HIGH':
        return <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'LOW':
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Security Notifications</h2>
                <p className="text-[11px] text-slate-400 font-mono">
                  {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  title="Clear all"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400/80" />
                <p className="text-sm font-semibold text-slate-200">Perimeter Clear</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  No active threat notifications or tamper warnings at this moment.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition space-y-2 ${
                    !n.read
                      ? n.severity === 'CRITICAL'
                        ? 'bg-rose-950/30 border-rose-800/80 shadow-lg shadow-rose-950/20'
                        : 'bg-slate-800/60 border-slate-700/80 shadow-md'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {getSeverityIcon(n.severity)}
                      <div>
                        <div className="text-xs font-bold text-slate-100">{n.title}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {new Date(n.timestamp).toLocaleTimeString()} • {n.severity}
                        </div>
                      </div>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-1" />
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pl-6">{n.description}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 pl-6 text-[11px]">
                    {n.linkView ? (
                      <button
                        onClick={() => {
                          onNavigateToView(n.linkView!, n.linkId);
                          onMarkRead(n.id);
                          onClose();
                        }}
                        className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 transition"
                      >
                        <span>Investigate</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <div />
                    )}
                    {!n.read && (
                      <button
                        onClick={() => onMarkRead(n.id)}
                        className="text-slate-400 hover:text-slate-200 transition"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950 text-center text-[11px] text-slate-400 font-mono">
            Autonomous Incident Ingestion Engine
          </div>
        </div>
      </div>
    </div>
  );
};
