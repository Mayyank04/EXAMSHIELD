import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  X,
} from 'lucide-react';
import { AlertSeverity } from '../types/index.ts';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const isCrit = t.severity === 'CRITICAL';
        const isHigh = t.severity === 'HIGH';
        const isWarn = t.severity === 'MEDIUM';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-2xl flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300 ${
              isCrit
                ? 'bg-rose-950/95 border-rose-700 text-rose-100 shadow-rose-950/50'
                : isHigh
                ? 'bg-rose-900/90 border-rose-700 text-rose-100'
                : isWarn
                ? 'bg-amber-950/95 border-amber-700 text-amber-100'
                : 'bg-slate-900/95 border-slate-700 text-slate-100'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {isCrit || isHigh ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : isWarn ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5 text-xs">
                <div className="font-bold">{t.title}</div>
                <p className="text-[11px] opacity-90 leading-relaxed">{t.message}</p>
              </div>
            </div>

            <button
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 hover:text-white p-1 rounded transition shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
