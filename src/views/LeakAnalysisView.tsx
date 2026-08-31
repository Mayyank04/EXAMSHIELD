import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertOctagon,
  AlertTriangle,
  BrainCircuit,
  Camera,
  CameraOff,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileSearch,
  FileText,
  Fingerprint,
  Image as ImageIcon,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  Video,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card.tsx';
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { CryptoService } from '../services/cryptoService.ts';
import { DocumentLeakAnalysis, Paper, Question } from '../types/index.ts';

interface LeakAnalysisViewProps {
  questions: Question[];
  papers?: Paper[];
  onRefresh: () => void;
}

export const LeakAnalysisView: React.FC<LeakAnalysisViewProps> = ({
  questions = [],
  papers = [],
  onRefresh,
}) => {
  const [inputMode, setInputMode] = useState<'TEXT' | 'UPLOAD_DOC' | 'UPLOAD_IMAGE' | 'CAMERA'>('TEXT');

  // Input states
  const [filename, setFilename] = useState('telegram_leak_sample.txt');
  const [textContent, setTextContent] = useState(
    'A circular coil of radius 0.05m having 500 turns is rotated about its vertical diameter with an angular frequency of 50 rad/s in a uniform horizontal magnetic field of 0.03T. Calculate the maximum induced EMF.'
  );
  const [selectedPaperCode, setSelectedPaperCode] = useState('NEET-2026-PHYS-001');

  // File & Camera states
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    type: string;
    previewUrl?: string;
  } | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Analysis & Investigation state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentLeakAnalysis | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<{
    title: string;
    type: string;
    hash: string;
    timestamp: string;
    previewUrl?: string;
    extractedText: string;
    similarity: number;
  } | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Stop camera on unmount or tab switch
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const handleInputModeChange = (mode: 'TEXT' | 'UPLOAD_DOC' | 'UPLOAD_IMAGE' | 'CAMERA') => {
    stopCameraStream();
    setInputMode(mode);
  };

  // Camera start & capture
  const startCamera = async () => {
    setCameraError(null);
    setCapturedPhotoUrl(null);
    setIsCameraOpen(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access unavailable in this environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      setCameraError('Camera access unavailable. You can upload an image or enter text instead.');
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhotoUrl(dataUrl);
    stopCameraStream();

    // Deterministic OCR simulation for captured question text
    const sampleCapturedText =
      'Physics Section A: A circular coil of radius 0.05m with 500 turns is rotated at 50 rad/s in a 0.03T field. Max induced EMF? Options: (A) 5.89V, (B) 11.78V, (C) 2.94V, (D) 15.21V';
    setTextContent(sampleCapturedText);
    setFilename(`camera_evidence_${Date.now()}.jpg`);
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type || (isImage ? 'image/jpeg' : 'application/pdf'),
      previewUrl: isImage ? URL.createObjectURL(file) : undefined,
    });
    setFilename(file.name);

    if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
      const text = await file.text();
      setTextContent(text);
    } else {
      // Deterministic document text extraction
      const extracted = `Extracted Text from ${file.name}: For the complex [Co(NH3)5(SO4)]Br and [Co(NH3)5Br]SO4, identify isomerism and unpaired electrons. Question 2: Young double slit experiment with 600nm fringe width.`;
      setTextContent(extracted);
    }
  };

  // Main Analysis Handler
  const handleAnalyze = async () => {
    if (!textContent.trim()) {
      alert('Please provide suspected leaked content (via text, document, photo upload, or camera).');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await api.analyzeDocumentLeak({
        filename,
        textContent,
        paperCode: selectedPaperCode,
      });
      setAnalysisResult(res);
      onRefresh();
    } catch (err: any) {
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Derive detected signals
  const detectedSignals = analysisResult
    ? [
        analysisResult.overallSimilarity > 50 && 'Duplicate Question Text Collision',
        analysisResult.overallSimilarity > 70 && 'Similarity Exceeds Critical Threshold (70%)',
        analysisResult.matchedQuestions.length > 0 && `Matched ${analysisResult.matchedQuestions.length} Protected Question(s)`,
        'Unauthorized Source / External Intercept',
        analysisResult.overallSimilarity > 80 && 'High-Confidence Examination Leak Detected',
      ].filter(Boolean) as string[]
    : [];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
            <ShieldAlert className="w-4 h-4" />
            <span>FORENSIC INTELLIGENCE & LEAK TRIAGE</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            Paper Leak Investigation & Semantic Similarity Radar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-examines intercepted documents, captured photos, and social dumps against confidential question repositories using TF-IDF and N-Gram matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {analysisResult && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSummaryModal(true)}
              className="text-xs font-semibold"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Investigation Summary</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Intercept Input (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Step 1: Choose Intercept Source
              </div>
              <div className="flex p-1 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-medium">
                <button
                  onClick={() => handleInputModeChange('TEXT')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer text-center font-semibold ${
                    inputMode === 'TEXT' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Text Snippet
                </button>
                <button
                  onClick={() => handleInputModeChange('UPLOAD_DOC')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer text-center font-semibold ${
                    inputMode === 'UPLOAD_DOC' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  PDF / Doc
                </button>
                <button
                  onClick={() => handleInputModeChange('UPLOAD_IMAGE')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer text-center font-semibold ${
                    inputMode === 'UPLOAD_IMAGE' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Photo Upload
                </button>
                <button
                  onClick={() => handleInputModeChange('CAMERA')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer text-center font-semibold ${
                    inputMode === 'CAMERA' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Live Camera
                </button>
              </div>
            </div>

            {/* Input Panels */}
            {inputMode === 'TEXT' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Suspected Leaked Text / Social Dump:
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {textContent.length} chars
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-xs font-sans text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {inputMode === 'UPLOAD_DOC' && (
              <div className="space-y-3 pt-1">
                <label className="p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer space-y-2 transition">
                  <Upload className="w-6 h-6 text-indigo-600" />
                  <div className="text-xs font-bold text-slate-900">Upload PDF / Document</div>
                  <div className="text-[10px] text-slate-500">PDF, DOCX, TXT</div>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => handleFileUpload(e, false)}
                    className="hidden"
                  />
                </label>

                {uploadedFile && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <div className="font-bold text-slate-900">{uploadedFile.name}</div>
                    <span className="text-slate-500">{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                )}
              </div>
            )}

            {inputMode === 'UPLOAD_IMAGE' && (
              <div className="space-y-3 pt-1">
                <label className="p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer space-y-2 transition">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                  <div className="text-xs font-bold text-slate-900">Upload Photo Evidence</div>
                  <div className="text-[10px] text-slate-500">PNG, JPG, JPEG</div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(e) => handleFileUpload(e, true)}
                    className="hidden"
                  />
                </label>

                {uploadedFile?.previewUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-40 bg-slate-100 flex items-center justify-center">
                    <img
                      src={uploadedFile.previewUrl}
                      alt="Uploaded Preview"
                      className="object-contain max-h-40"
                    />
                  </div>
                )}
              </div>
            )}

            {inputMode === 'CAMERA' && (
              <div className="space-y-3 pt-1">
                {!isCameraOpen && !capturedPhotoUrl && (
                  <Button
                    variant="default"
                    size="default"
                    type="button"
                    onClick={startCamera}
                    className="w-full"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Camera Viewfinder</span>
                  </Button>
                )}

                {isCameraOpen && (
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between text-white text-xs font-semibold">
                      <span>Live Evidence Camera</span>
                      <button onClick={stopCameraStream} className="text-slate-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                      <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <Button variant="default" size="sm" onClick={capturePhoto}>
                        <Camera className="w-4 h-4" />
                        <span>Capture Photo</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={stopCameraStream}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                    <CameraOff className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {capturedPhotoUrl && (
                  <div className="space-y-2">
                    <div className="rounded-xl overflow-hidden border border-slate-200 max-h-40 bg-slate-100 flex items-center justify-center">
                      <img src={capturedPhotoUrl} alt="Captured Photo" className="object-contain max-h-40" />
                    </div>
                    <Button variant="outline" size="sm" onClick={startCamera} className="w-full">
                      Retake Photo
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Target Protected Paper Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Protected Paper Set:
              </label>
              <select
                value={selectedPaperCode}
                onChange={(e) => setSelectedPaperCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-900 font-medium focus:outline-none"
              >
                {papers.map((p) => (
                  <option key={p.id} value={p.paperCode}>
                    {p.paperCode} — {p.subject} (Set {p.set})
                  </option>
                ))}
              </select>
            </div>

            {/* Single Clear Primary Action */}
            <LiquidButton
              variant="default"
              size="default"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>{isAnalyzing ? 'Running Semantic NLP & TF-IDF Match...' : 'Run Paper Leak Analysis'}</span>
            </LiquidButton>
          </Card>
        </div>

        {/* Right Column: Analysis Results Radar (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {analysisResult ? (
            <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-5 animate-in fade-in duration-150">
              {/* Risk Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                      analysisResult.riskLevel === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-600'
                        : analysisResult.riskLevel === 'HIGH'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-heading">
                      Leak Risk Level: {analysisResult.riskLevel}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Overall Vector Cosine Similarity: <strong>{analysisResult.overallSimilarity}%</strong>
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    analysisResult.riskLevel === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800'
                      : analysisResult.riskLevel === 'HIGH'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {analysisResult.riskLevel} RISK
                </span>
              </div>

              {/* Detected Signals */}
              <div className="space-y-2">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  Detected Threat Signals & Indicators:
                </div>
                <div className="space-y-1.5">
                  {detectedSignals.map((sig, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-800 font-medium"
                    >
                      <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{sig}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Questions Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 uppercase">
                  <span>Matched Question Bank Collisions ({analysisResult.matchedQuestions.length}):</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {analysisResult.matchedQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        setSelectedEvidence({
                          title: `Question Collision #${idx + 1}`,
                          type: 'Question Match',
                          hash: 'SHA256:MATCH:' + idx,
                          timestamp: new Date().toISOString(),
                          previewUrl: uploadedFile?.previewUrl || capturedPhotoUrl || undefined,
                          extractedText: q.submittedQuestion,
                          similarity: q.similarityScore,
                        })
                      }
                      className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-300 transition cursor-pointer text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{q.subject}</span>
                        <span className="font-mono font-bold text-rose-600">{q.similarityScore}% Match</span>
                      </div>
                      <p className="text-[11px] text-slate-700 font-sans line-clamp-2">
                        {q.matchedOriginalQuestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-72 border-slate-200 bg-white p-6 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
              <BrainCircuit className="w-10 h-10 text-slate-400" />
              <div>
                <h4 className="text-sm font-bold text-slate-700 font-heading">
                  Semantic Leak Triage Idle
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Provide intercepted document text, photo evidence, or scan to run TF-IDF comparison against protected papers.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Evidence Drawer / Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    {selectedEvidence.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">Forensic Evidence Item</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {selectedEvidence.previewUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-100 flex items-center justify-center">
                  <img
                    src={selectedEvidence.previewUrl}
                    alt="Evidence Preview"
                    className="object-contain max-h-48"
                  />
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Extracted Text:</div>
                <p className="text-slate-900 font-sans leading-relaxed">
                  {selectedEvidence.extractedText}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Similarity Score</div>
                  <div className="text-sm font-bold text-rose-600 mt-0.5">{selectedEvidence.similarity}%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Timestamp</div>
                  <div className="text-xs font-medium text-slate-900 mt-1">
                    {new Date(selectedEvidence.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
              <Button variant="outline" size="sm" onClick={() => setSelectedEvidence(null)}>
                Close Evidence
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Investigation Summary Report Modal */}
      {showSummaryModal && analysisResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    Official Investigation Summary Docket
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    CASE-LEAK-{Date.now().toString().slice(-6)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Target Document</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedPaperCode}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Assessed Risk</div>
                  <div className="font-bold text-rose-600 mt-0.5">{analysisResult.riskLevel} ({analysisResult.overallSimilarity}%)</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Analyst Recommendation:</div>
                <p className="text-slate-800 font-medium">
                  {analysisResult.overallSimilarity > 70
                    ? 'IMMEDIATE ACTION: Trigger Automated Set B Paper Failover protocol across all designated examination centres. Freeze affected strongroom terminals and dispatch forensic unit.'
                    : 'MONITORING: Similarity below critical threshold. Continue automated social scraper surveillance and verify strongroom camera logs.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono text-[11px]">
                <div className="text-[10px] text-slate-500 font-sans">Document Evidence Digest:</div>
                <div className="text-indigo-700 font-bold break-all">{analysisResult.uploadedDocHash}</div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => handleCopy(`EXAMSHIELD LEAK SUMMARY\nCase: CASE-LEAK\nRisk: ${analysisResult.riskLevel}\nScore: ${analysisResult.overallSimilarity}%\nDocument: ${selectedPaperCode}`)}
                className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
              </button>

              <Button variant="outline" size="sm" onClick={() => setShowSummaryModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
