import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Fingerprint,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  ShieldCheck,
  Smartphone,
  UserCheck,
  X,
} from 'lucide-react';
import { Button, LiquidButton } from './ui/liquid-glass-button.tsx';
import { ROLE_METADATA } from '../services/authService.ts';
import { evaluatePasswordSecurity, SessionManager } from '../services/securityService.ts';
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
  const [authStage, setAuthStage] = useState<'LOGIN' | 'MFA_CHALLENGE' | 'VERIFIED'>('LOGIN');

  // Stage 1: Login Credentials
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [emailInput, setEmailInput] = useState(currentUser.email);
  const [passwordInput, setPasswordInput] = useState('Password@2026!');
  const [showPasswordMeter, setShowPasswordMeter] = useState(false);

  // Stage 2: OTP / MFA Challenge
  const [mfaMethod, setMfaMethod] = useState<'EMAIL_OTP' | 'AUTHENTICATOR_APP'>('EMAIL_OTP');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [devExpectedOtp, setDevExpectedOtp] = useState('482910');
  const [timeLeft, setTimeLeft] = useState(59);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const selectedUser = availableUsers.find((u) => u.id === selectedUserId) || currentUser;

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any;
    if (authStage === 'MFA_CHALLENGE' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStage, timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const passwordEvaluation = evaluatePasswordSecurity(passwordInput);

  const handleQuickSelectUser = (user: User) => {
    setSelectedUserId(user.id);
    setEmailInput(user.email);
    setErrorMessage(null);
  };

  const handleProceedToMfa = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailInput.trim()) {
      setErrorMessage('Please provide your institutional email address or employee ID.');
      return;
    }

    if (!passwordInput.trim()) {
      setErrorMessage('Please enter your access password.');
      return;
    }

    if (selectedUser.status === 'LOCKED' || selectedUser.status === 'SUSPENDED') {
      setErrorMessage(`Account is currently ${selectedUser.status}. Contact National Security Command.`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      // Generate a new 6-digit verification code
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setDevExpectedOtp(newOtp);
      setTimeLeft(59);
      setAttemptsRemaining(3);
      setOtpDigits(['', '', '', '', '', '']);
      setAuthStage('MFA_CHALLENGE');
    }, 400);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste 6 digits handler
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = pasted[i] || '';
        }
        setOtpDigits(newDigits);
        const nextIdx = Math.min(5, pasted.length);
        otpInputRefs.current[nextIdx]?.focus();
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setDevExpectedOtp(newOtp);
    setTimeLeft(59);
    setResendCooldown(30);
    setAttemptsRemaining(3);
    setErrorMessage(null);
    setOtpDigits(['', '', '', '', '', '']);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }

    if (timeLeft <= 0) {
      setErrorMessage('Verification code has expired. Please click "Resend code" to obtain a fresh OTP.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      // Verify OTP (accepts the generated dynamic OTP or standard demo OTP '482910')
      if (enteredOtp !== devExpectedOtp && enteredOtp !== '482910') {
        const remaining = attemptsRemaining - 1;
        setAttemptsRemaining(remaining);
        if (remaining <= 0) {
          setErrorMessage('Maximum verification attempts exceeded. Authentication session terminated for security.');
          setTimeout(() => {
            setAuthStage('LOGIN');
          }, 1500);
        } else {
          setErrorMessage(`Invalid verification code. ${remaining} attempt(s) remaining.`);
        }
        return;
      }

      // Success: register session and select user
      SessionManager.registerSession(selectedUser);
      onSelectUser(selectedUser);
      setAuthStage('VERIFIED');

      setTimeout(() => {
        onClose();
        if (onLoginSuccess) onLoginSuccess();
      }, 700);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-heading">
                Zero-Trust Authentication Gate
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                {authStage === 'LOGIN'
                  ? 'Stage 1 of 2: Credential Verification'
                  : authStage === 'MFA_CHALLENGE'
                  ? 'Stage 2 of 2: Cryptographic MFA Verification'
                  : 'Session Granted'}
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
        <div className="p-6 space-y-4 text-xs">
          {/* STAGE 1: CREDENTIALS LOGIN */}
          {authStage === 'LOGIN' && (
            <form onSubmit={handleProceedToMfa} className="space-y-4">
              {/* Quick Institutional Account Switcher */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Select Institutional Officer Profile:
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
                  {availableUsers.slice(0, 6).map((u) => {
                    const isSelected = u.id === selectedUserId;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleQuickSelectUser(u)}
                        className={`p-2 rounded-lg text-left transition cursor-pointer border text-xs flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-300 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-bold text-slate-900 truncate">{u.name}</div>
                        <div className="text-[10px] text-indigo-700 font-mono font-semibold truncate">
                          {u.role}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email / ID Input */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Institutional Email / Employee ID:
                </label>
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  required
                />
              </div>

              {/* Password Input & Strength Meter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">
                    Security Password:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPasswordMeter(!showPasswordMeter)}
                    className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                  >
                    {showPasswordMeter ? 'Hide meter' : 'Inspect strength'}
                  </button>
                </div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />

                {showPasswordMeter && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">Password Security Score:</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${passwordEvaluation.color}`}>
                        {passwordEvaluation.label} ({passwordEvaluation.score}%)
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${passwordEvaluation.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <LiquidButton
                  variant="default"
                  size="default"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? 'Verifying Credentials...' : 'Proceed to MFA Check →'}</span>
                </LiquidButton>
              </div>
            </form>
          )}

          {/* STAGE 2: MFA / OTP VERIFICATION */}
          {authStage === 'MFA_CHALLENGE' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Security Verification Required
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Enter the 6-digit verification code sent to your registered institutional credentials.
                </p>
              </div>

              {/* Development Helper Banner */}
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-indigo-900">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span><strong>Development OTP:</strong> {devExpectedOtp}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const digits = devExpectedOtp.split('');
                    setOtpDigits(digits);
                  }}
                  className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 hover:bg-indigo-100 transition cursor-pointer"
                >
                  Auto-Fill OTP
                </button>
              </div>

              {/* 6-Digit Verification Code Inputs */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-lg font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                ))}
              </div>

              {/* Timer & Resend Controls */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="font-mono">
                  Expires in <strong>{`00:${timeLeft.toString().padStart(2, '0')}`}</strong>
                </span>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className={`text-indigo-600 font-semibold cursor-pointer ${
                    resendCooldown > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:underline'
                  }`}
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
                  {errorMessage}
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAuthStage('LOGIN')}
                  className="text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  ← Back to Login
                </button>

                <LiquidButton
                  variant="default"
                  size="default"
                  type="submit"
                  disabled={isSubmitting || otpDigits.join('').length !== 6}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Verifying OTP...' : 'Authenticate Session'}</span>
                </LiquidButton>
              </div>
            </form>
          )}

          {/* STAGE 3: SUCCESS VERIFICATION */}
          {authStage === 'VERIFIED' && (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Session Authenticated & Granted
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Authenticated as {selectedUser.name} ({selectedUser.role})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
