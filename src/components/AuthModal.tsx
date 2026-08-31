import React, { useState } from 'react';
import {
  CheckCircle2,
  Cpu,
  KeyRound,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Smartphone,
  UserCheck,
  X,
} from 'lucide-react';
import { ROLE_METADATA } from '../services/authService.ts';
import { User, UserRole } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableUsers: User[];
  currentUser: User;
  onSelectUser: (user: User) => void;
  onLoginSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  availableUsers,
  currentUser,
  onSelectUser,
  onLoginSuccess,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [mfaCode, setMfaCode] = useState('482910');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authStep, setAuthStep] = useState<'SELECT' | 'MFA' | 'SUCCESS'>('SELECT');

  if (!isOpen) return null;

  const rolesList: UserRole[] = [
    'SUPER_ADMIN',
    'EXAM_AUTHORITY',
    'SECURITY_OFFICER',
    'TRANSPORT_OFFICER',
    'INVESTIGATOR',
    'CENTRE_SUPERINTENDENT',
    'AUDITOR',
    'VIEW_ONLY',
  ];

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    const userForRole = availableUsers.find((u) => u.role === role);
    if (userForRole) {
      setSelectedUserId(userForRole.id);
    }
  };

  const handleProceed = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setAuthStep('MFA');
    }, 400);
  };

  const handleVerifyMfa = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const targetUser = availableUsers.find((u) => u.id === selectedUserId) || {
        ...currentUser,
        role: selectedRole,
      };
      onSelectUser(targetUser);
      setAuthStep('SUCCESS');
      setTimeout(() => {
        setAuthStep('SELECT');
        onClose();
        if (onLoginSuccess) onLoginSuccess();
      }, 700);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Zero-Trust Identity & Access (RBAC)</h2>
              <p className="text-[11px] text-slate-400">Authenticate session or switch institutional role</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {authStep === 'SELECT' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 font-mono uppercase">
                  Select Authorization Role
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 scrollbar-thin">
                  {rolesList.map((role) => {
                    const meta = ROLE_METADATA[role];
                    const isSelected = selectedRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleChange(role)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-1.5 ${
                          isSelected
                            ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-950/40'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-slate-200">{role}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2">{meta.title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Role Summary Card */}
              {selectedRole && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-slate-200">{ROLE_METADATA[selectedRole].title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                      {ROLE_METADATA[selectedRole].badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {ROLE_METADATA[selectedRole].description}
                  </p>
                </div>
              )}

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleProceed}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Verifying Enclave...' : 'Proceed to Security Multi-Factor Check'}</span>
              </button>
            </div>
          )}

          {authStep === 'MFA' && (
            <form onSubmit={handleVerifyMfa} className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Hardware MFA Token Simulation</h3>
                <p className="text-xs text-slate-400">
                  Enter the 6-digit cryptographic security code generated by your hardware authenticator.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">
                  MFA Code (Pre-filled for Demo)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 px-4 py-2.5 rounded-xl text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAuthStep('SELECT')}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Authenticating...' : 'Confirm & Sign In'}</span>
                </button>
              </div>
            </form>
          )}

          {authStep === 'SUCCESS' && (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Session Granted</h3>
              <p className="text-xs text-slate-400 font-mono">
                Assigned Role: {selectedRole} | Token Issued
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
