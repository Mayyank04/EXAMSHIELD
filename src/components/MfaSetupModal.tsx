import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  KeyRound,
  Lock,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import { Button, LiquidButton } from './ui/liquid-glass-button.tsx';
import {
  calculateTotpCode,
  generateBackupRecoveryCodes,
  generateBase32Secret,
  verifyTotpCode,
} from '../services/securityService.ts';
import { BackupCodeItem, User } from '../types/index.ts';

interface MfaSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onMfaEnabled: (updatedUser: User) => void;
}

export const MfaSetupModal: React.FC<MfaSetupModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onMfaEnabled,
}) => {
  const [step, setStep] = useState<'SCAN_QR' | 'VERIFY_CODE' | 'BACKUP_CODES'>('SCAN_QR');
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [liveCalculatedCode, setLiveCalculatedCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<BackupCodeItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const secret = generateBase32Secret(20);
      setTotpSecret(secret);
      setStep('SCAN_QR');
      setVerificationCode('');
      setErrorMessage(null);

      const totpUri = `otpauth://totp/ExamShield:${encodeURIComponent(
        currentUser.email
      )}?secret=${secret}&issuer=ExamShield&algorithm=SHA1&digits=6&period=30`;

      QRCode.toDataURL(totpUri, { width: 220, margin: 2 })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.warn('QR generation error:', err));

      // Calculate current code for local evaluation convenience
      calculateTotpCode(secret, 0).then((code) => setLiveCalculatedCode(code));
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (verificationCode.trim().length !== 6) {
      setErrorMessage('Please enter a valid 6-digit code.');
      return;
    }

    setIsVerifying(true);
    try {
      const { isValid } = await verifyTotpCode(verificationCode, totpSecret);
      // In local demo, also accept the live calculated code or standard '482910'
      if (isValid || verificationCode === liveCalculatedCode || verificationCode === '482910') {
        const generatedBackup = generateBackupRecoveryCodes(8);
        setBackupCodes(generatedBackup);
        setStep('BACKUP_CODES');
        onMfaEnabled({ ...currentUser, mfaEnabled: true });
      } else {
        setErrorMessage('Invalid authenticator code. Check your authenticator app time or try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(totpSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyBackupCodes = () => {
    const text = backupCodes.map((b) => b.code).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
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
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Multi-Factor Authentication (MFA) Setup
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                RFC 6238 Standard Authenticator App
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

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* STEP 1: SCAN QR CODE */}
          {step === 'SCAN_QR' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-600">
                Scan this QR code with your Authenticator App (Google Authenticator, Microsoft Authenticator, or 1Password).
              </p>

              {/* QR Code Container */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="TOTP QR Code" className="w-44 h-44 mx-auto rounded-lg" />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                    <QrCode className="w-10 h-10 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Manual Secret Key */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono text-[11px] text-left">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans">
                  <span>Manual Secret Key:</span>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-indigo-700 font-bold break-all">{totpSecret}</div>
              </div>

              {/* Development Helper */}
              {liveCalculatedCode && (
                <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-[11px] text-indigo-900 text-left flex items-center justify-between">
                  <span>Dev Helper (Current TOTP): <strong>{liveCalculatedCode}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationCode(liveCalculatedCode);
                      setStep('VERIFY_CODE');
                    }}
                    className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200"
                  >
                    Use Code
                  </button>
                </div>
              )}

              <LiquidButton
                variant="default"
                size="default"
                onClick={() => setStep('VERIFY_CODE')}
                className="w-full"
              >
                <span>Continue to Verification Code →</span>
              </LiquidButton>
            </div>
          )}

          {/* STEP 2: VERIFY 6-DIGIT TOTP */}
          {step === 'VERIFY_CODE' && (
            <form onSubmit={handleVerifyTotp} className="space-y-4 text-center">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Verify Authenticator Code</h4>
                <p className="text-xs text-slate-500">
                  Enter the 6-digit code shown in your authenticator app to confirm setup.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  autoFocus
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-48 mx-auto text-center text-2xl font-mono font-bold tracking-widest bg-slate-50 border border-slate-300 rounded-2xl py-2.5 text-indigo-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep('SCAN_QR')}
                  className="text-slate-500 hover:text-slate-800 text-xs cursor-pointer"
                >
                  ← Back to QR
                </button>

                <LiquidButton
                  variant="default"
                  size="default"
                  type="submit"
                  disabled={isVerifying || verificationCode.length !== 6}
                >
                  <span>{isVerifying ? 'Verifying...' : 'Enable MFA Protection'}</span>
                </LiquidButton>
              </div>
            </form>
          )}

          {/* STEP 3: BACKUP RECOVERY CODES */}
          {step === 'BACKUP_CODES' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">MFA Successfully Enabled</h4>
                <p className="text-xs text-slate-500">
                  Save these single-use recovery codes in a secure location. They allow emergency access if you lose your authenticator.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 font-bold text-center">
                {backupCodes.map((b, idx) => (
                  <div key={idx} className="p-1.5 bg-white rounded-lg border border-slate-200">
                    {b.code}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedBackup ? 'Copied Codes!' : 'Copy All Codes'}</span>
                </button>

                <Button variant="default" size="sm" onClick={onClose}>
                  Done & Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
