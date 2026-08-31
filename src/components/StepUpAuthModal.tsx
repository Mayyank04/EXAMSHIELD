import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Lock,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Button, LiquidButton } from './ui/liquid-glass-button.tsx';
import { User } from '../types/index.ts';

interface StepUpAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actionTitle: string;
  actionDescription: string;
  currentUser: User;
}

export const StepUpAuthModal: React.FC<StepUpAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionTitle,
  actionDescription,
  currentUser,
}) => {
  const [authMethod, setAuthMethod] = useState<'PASSWORD' | 'TOTP'>('PASSWORD');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      // In local demo mode, any non-empty password/code (or correct test password) passes
      if (authMethod === 'PASSWORD') {
        if (!password.trim()) {
          setErrorMessage('Please enter your institutional password to confirm identity.');
          return;
        }
      } else {
        if (totpCode.trim().length !== 6) {
          setErrorMessage('Please enter a valid 6-digit TOTP authenticator code.');
          return;
        }
      }

      onSuccess();
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Step-Up Identity Verification
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Mandatory for High-Risk Actions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleVerify} className="p-5 space-y-4 text-xs">
          {/* Action Details Pill */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
            <div className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{actionTitle}</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              {actionDescription}
            </p>
          </div>

          {/* User Confirmation Info */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Authorized Officer:</div>
              <div className="font-bold text-slate-900 mt-0.5">{currentUser.name}</div>
            </div>
            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {currentUser.role}
            </span>
          </div>

          {/* Verification Method Toggle */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Verification Method:
            </label>
            <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('PASSWORD');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer ${
                  authMethod === 'PASSWORD' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('TOTP');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer ${
                  authMethod === 'TOTP' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                6-Digit TOTP / MFA
              </button>
            </div>
          </div>

          {/* Auth Input */}
          {authMethod === 'PASSWORD' ? (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Enter Institutional Password:
              </label>
              <input
                type="password"
                placeholder="Enter your current password..."
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Enter 6-Digit Authenticator Code:
              </label>
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                autoFocus
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-center text-base font-mono tracking-widest font-bold text-indigo-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <LiquidButton
              variant="default"
              size="default"
              type="submit"
              disabled={isVerifying}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isVerifying ? 'Verifying Identity...' : 'Confirm Action'}</span>
            </LiquidButton>
          </div>
        </form>
      </div>
    </div>
  );
};
