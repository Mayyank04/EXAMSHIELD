import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { CheckCircle2, Copy, Download, ShieldCheck, X } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  payload: string;
  type: 'PAPER' | 'PACKAGE';
  entityId: string;
  statusText?: string;
}

export const QrCodeModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  title,
  payload,
  type,
  entityId,
  statusText = 'AUTHENTIC_SEALED',
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && payload) {
      QRCode.toDataURL(payload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#020617', // slate-950
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [isOpen, payload]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1 text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>CRYPTOGRAPHIC SECURE TOKEN</span>
        </div>
        <h3 className="text-xl font-bold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-400 mt-1">
          Non-confidential digital token pointing to encrypted institutional record.
        </p>

        {/* QR Code Container */}
        <div className="my-5 flex flex-col items-center justify-center p-4 bg-white rounded-lg border-2 border-emerald-500/40 shadow-inner">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="ExamShield QR Code" className="w-64 h-64 rounded" />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center text-slate-900 font-mono text-xs">
              Generating Secure Token...
            </div>
          )}
          <div className="mt-2 text-center">
            <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-bold bg-slate-900 text-emerald-400 rounded">
              {entityId}
            </span>
          </div>
        </div>

        {/* Token String */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 break-all flex items-center justify-between gap-2">
          <span>{payload}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition flex items-center gap-1 shrink-0"
            title="Copy Token"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Seal Status: <strong className="text-emerald-400">{statusText}</strong>
          </span>
          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download={`${type}_${entityId}_QR.png`}
              className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
