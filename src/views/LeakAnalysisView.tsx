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
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { api } from '../services/api.ts';
import { DocumentLeakAnalysis, Question } from '../types/index.ts';

interface LeakAnalysisViewProps {
  questions: Question[];
  onRefresh: () => void;
}

export const LeakAnalysisView: React.FC<LeakAnalysisViewProps> = ({
  questions = [],
  onRefresh,
}) => {
  const [filename, setFilename] = useState('telegram_leak_sample.txt');
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

  const isCriticalLeak =
    analysisResult && (analysisResult.riskLevel === 'CRITICAL' || analysisResult.overallSimilarity > 75);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <BrainCircuit className="w-4 h-4" />
            <span>AI NATURAL LANGUAGE SEMANTIC MATCHING</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            Paper Leak Semantic Analysis Radar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-examines intercepted documents against the confidential question bank using TF-IDF and N-Gram similarity.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Semantic NLP Engine Active</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Text & Target Paper (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Intercepted Document Input
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">Channel Payload</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source Document Descriptor
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Suspected Leak Text Content
              </label>
              <textarea
                rows={7}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
                placeholder="Paste intercepted text, social media dump, or image OCR extract here..."
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <LiquidButton
                variant="default"
                size="default"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full"
              >
                <BrainCircuit className="w-4 h-4" />
                <span>{isAnalyzing ? 'Scanning Question Bank...' : 'Run Semantic Similarity Match'}</span>
              </LiquidButton>
            </div>
          </Card>
        </div>

        {/* Right: Similarity Verdict & Matched Questions (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {analysisResult ? (
            <Card className="p-5 border-slate-200 bg-white shadow-sm space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Analysis Verdict</div>
                  <h3 className="text-base font-bold text-slate-900 font-heading mt-0.5">
                    {analysisResult.uploadedFilename || filename}
                  </h3>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isCriticalLeak
                      ? 'bg-rose-100 text-rose-800'
                      : analysisResult.riskLevel === 'HIGH'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {analysisResult.riskLevel || 'LOW'}
                </span>
              </div>

              {/* Similarity Score Hero */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Maximum Semantic Match</div>
                  <div
                    className={`text-3xl font-extrabold font-heading mt-1 ${
                      isCriticalLeak ? 'text-rose-600' : 'text-indigo-600'
                    }`}
                  >
                    {analysisResult.overallSimilarity}%
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="text-slate-500 font-medium">Matched Questions</div>
                  <div className="text-base font-bold text-slate-800 font-mono mt-1">
                    {analysisResult.matchedQuestions?.length || 0} Found
                  </div>
                </div>
              </div>

              {/* Matched Questions List */}
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Identified Confidential Questions:
                </div>
                <div className="space-y-2">
                  {(analysisResult.matchedQuestions || []).map((match, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-bold text-indigo-700">{match.subject || 'Confidential Item'}</span>
                        <span className="font-bold text-rose-600">Similarity: {match.similarityScore}%</span>
                      </div>
                      <p className="text-xs text-slate-800 font-sans">{match.matchedOriginalQuestion || match.submittedQuestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-64 border-slate-200 bg-white p-6 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <BrainCircuit className="w-10 h-10 text-slate-300" />
              <h4 className="text-sm font-bold text-slate-700">Ready for Semantic Scan</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Paste intercepted text on the left to cross-reference against the entire national question vault.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
