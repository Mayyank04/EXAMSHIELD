import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Copy,
  FileSearch,
  FileText,
  Fingerprint,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card.tsx';
import { LiquidButton, MetalButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { DocumentLeakAnalysis, Question } from '../types/index.ts';

interface LeakAnalysisViewProps {
  questions: Question[];
  onRefresh: () => void;
}

export const LeakAnalysisView: React.FC<LeakAnalysisViewProps> = ({
  questions,
  onRefresh,
}) => {
  const [filename, setFilename] = useState('telegram_suspected_leak.txt');
  const [textContent, setTextContent] = useState(
    'A circular coil of radius 0.05 m with 500 turns is rotated at 50 rad/s in a uniform horizontal magnetic field of 0.03 T. Find the maximum induced EMF.'
  );
  const [selectedPaperCode, setSelectedPaperCode] = useState('NEET-DEMO-2027-PHY-A');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentLeakAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!textContent.trim()) {
      alert('Please enter or upload suspected leaked text content.');
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

  const handleLoadSample = (type: 'DIRECT_MATCH' | 'MODIFIED_LEAK' | 'BENIGN') => {
    if (type === 'DIRECT_MATCH') {
      setFilename('telegram_neet_leak_physics.txt');
      setTextContent(
        'Q1. A circular coil of radius 0.05 m with 500 turns is rotated at 50 rad/s in a uniform horizontal magnetic field of 0.03 T. Calculate maximum EMF.\n\nQ2. In a Young double slit experiment, the distance between slits is 0.28 mm and screen is at 1.4 m. The distance between central bright fringe and 4th bright fringe is measured to be 1.2 cm.'
      );
    } else if (type === 'MODIFIED_LEAK') {
      setFilename('social_forum_rephrase.txt');
      setTextContent(
        'Hey guys, question from tomorrow paper: coil rotating in 0.03 Tesla magnetic field with 500 turns and 0.05m radius at 50 rad/s. What is peak voltage? Also double slit fringe calculation.'
      );
    } else if (type === 'BENIGN') {
      setFilename('general_syllabus_notes.txt');
      setTextContent(
        'Study notes on thermodynamics: First law of thermodynamics states that energy cannot be created or destroyed, only transformed. Reversible and irreversible adiabatic expansions.'
      );
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-950 via-[#050B18] to-[#0A1425] p-6 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-rose-400">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>EARLY WARNING THREAT RADAR • SEMANTIC CONVERGENCE ENGINE</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1 font-heading">
          Suspected Question Paper Leak Detection
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Scan social media forum dumps, OCR extractions, and candidate text against protected national question banks to detect semantic leaks.
        </p>
      </Card>

      {/* Main Analysis Station Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Console & Presets (7 Cols) */}
        <div className="lg:col-span-7">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-sm font-bold text-white font-heading">Suspected Document Ingestion</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadSample('DIRECT_MATCH')}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800 hover:bg-rose-900 text-[11px] font-mono text-rose-300 transition cursor-pointer"
                >
                  🚨 Leak Sample
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('BENIGN')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-[11px] font-mono text-slate-300 transition cursor-pointer"
                >
                  ✓ Benign Sample
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 font-mono">Document Origin / Filename</label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 px-3 py-2 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1 font-mono">Compare with Paper Set</label>
                <select
                  value={selectedPaperCode}
                  onChange={(e) => setSelectedPaperCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 px-3 py-2 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-rose-500"
                >
                  <option value="NEET-DEMO-2027-PHY-A">NEET-DEMO-2027-PHY-A (Physics Set A)</option>
                  <option value="NEET-DEMO-2027-CHE-A">NEET-DEMO-2027-CHE-A (Chemistry Set A)</option>
                  <option value="JEE-DEMO-2027-MAT-A">JEE-DEMO-2027-MAT-A (Maths Set A)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono">
                Suspected Text Content or OCR Extracted String
              </label>
              <textarea
                rows={6}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste extracted text from social media posts, Telegram channels, or exam leaks..."
                className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-xl text-slate-200 font-sans text-xs focus:outline-none focus:border-rose-500 leading-relaxed"
              />
            </div>

            <LiquidButton
              variant="danger"
              size="default"
              className="w-full"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'Scanning Question Bank & Computing Cosine Vectors...' : 'Execute AI Semantic Leak Analysis'}</span>
            </LiquidButton>
          </Card>
        </div>

        {/* Right: AI Similarity Analysis Verdict (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl h-full flex flex-col justify-between space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-sm font-bold text-white font-heading">Semantic Overlap Verdict</h3>
              <span className="text-[10px] font-mono text-purple-400">TF-IDF + Cosine Vector</span>
            </div>

            {analysisResult ? (
              <div className="space-y-4">
                {/* Exposure Risk Score Card */}
                <div
                  className={`p-5 rounded-2xl border text-center space-y-1.5 ${
                    analysisResult.exposureRiskScore >= 70
                      ? 'bg-rose-950/50 border-rose-500 text-rose-200 shadow-[0_0_30px_rgba(244,63,94,0.2)]'
                      : analysisResult.exposureRiskScore >= 40
                      ? 'bg-amber-950/50 border-amber-500 text-amber-200'
                      : 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold tracking-widest uppercase">
                    EXPOSURE CONVERGENCE INDEX
                  </div>
                  <div className="text-4xl font-extrabold font-heading">
                    {analysisResult.exposureRiskScore} <span className="text-sm font-normal font-mono opacity-80">/ 100</span>
                  </div>
                  <div className="font-mono font-bold text-xs">
                    OVERALL SIMILARITY: {analysisResult.overallSimilarity}% • RISK: {analysisResult.riskLevel}
                  </div>
                </div>

                {/* Similarity Dimensions Breakdown */}
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-500 uppercase">Question</div>
                    <div className="text-xs font-bold text-cyan-300 mt-0.5">{analysisResult.questionSimilarity}%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-500 uppercase">Structure</div>
                    <div className="text-xs font-bold text-cyan-300 mt-0.5">{analysisResult.structureSimilarity}%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[9px] text-slate-500 uppercase">Sequence</div>
                    <div className="text-xs font-bold text-cyan-300 mt-0.5">{analysisResult.sequenceSimilarity}%</div>
                  </div>
                </div>

                {/* Matched Questions Preview */}
                <div className="space-y-2">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Matched Protected Questions ({analysisResult.matchedQuestions.length}):
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                    {analysisResult.matchedQuestions.map((q, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex justify-between font-mono text-[10px]">
                          <span className="text-purple-400 font-bold">Match #{idx + 1} ({q.subject})</span>
                          <span className="text-rose-400 font-bold">{q.similarityScore}% Similarity</span>
                        </div>
                        <p className="text-[11px] text-slate-300 italic">&ldquo;{q.matchedOriginalQuestion}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verdict Summary */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="font-bold font-heading text-white">Forensic Intelligence Briefing:</div>
                  <p className="leading-relaxed">{analysisResult.verdictSummary}</p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                <FileSearch className="w-10 h-10 text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">Awaiting Analysis</p>
                <p className="text-[11px] max-w-xs">
                  Paste suspected examination content or select a preset sample to execute semantic similarity detection.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 text-center">
              Zero-Trust Early Warning Sensor • Model: N-Gram TF-IDF + Gemini NLP
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
