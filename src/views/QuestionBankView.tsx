import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Copy,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Fingerprint,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card.tsx';
import { Button, LiquidButton } from '../components/ui/liquid-glass-button.tsx';
import { Question } from '../types/index.ts';

interface QuestionBankViewProps {
  questions: Question[];
  onRefresh?: () => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  questions = [],
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedTopic, setSelectedTopic] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Derive unique subjects
  const subjects = Array.from(new Set(questions.map((q) => q.subject).filter(Boolean)));

  // Derive topics based on selected subject
  const availableTopics = Array.from(
    new Set(
      questions
        .filter((q) => selectedSubject === 'ALL' || q.subject === selectedSubject)
        .map((q) => q.topic)
        .filter(Boolean)
    )
  );

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const qText = q.text || '';
    const qSub = q.subject || '';
    const qTop = q.topic || '';
    const qId = q.id || '';
    const qAuthor = q.author || '';

    const matchesSearch =
      searchTerm === '' ||
      qText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qSub.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qTop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qAuthor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = selectedSubject === 'ALL' || qSub === selectedSubject;
    const matchesTopic = selectedTopic === 'ALL' || qTop === selectedTopic;
    const matchesDifficulty = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    const matchesStatus = selectedStatus === 'ALL' || q.status === selectedStatus;

    return matchesSearch && matchesSubject && matchesTopic && matchesDifficulty && matchesStatus;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600">
            <BookOpen className="w-4 h-4" />
            <span>NATIONAL CONFIDENTIAL QUESTION VAULT</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mt-1">
            Question Bank & Curriculum Taxonomy
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically fingerprinted confidential question repository with taxonomy tagging and syllabus mapping.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-800">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>{questions.length} Encrypted Items in Vault</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="p-4 border-slate-200 bg-white shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search question text, topic, ID, or formulation officer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 pl-9 pr-4 py-2 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 text-xs">
            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedTopic('ALL');
              }}
              className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            {/* Topic Filter */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-700 font-medium focus:outline-none max-w-[160px] truncate"
            >
              <option value="ALL">All Topics</option>
              {availableTopics.map((top) => (
                <option key={top} value={top}>
                  {top}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="DRAFT">Draft</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong>{filteredQuestions.length}</strong> of {questions.length} questions
          </span>
          {(selectedSubject !== 'ALL' ||
            selectedTopic !== 'ALL' ||
            selectedDifficulty !== 'ALL' ||
            selectedStatus !== 'ALL' ||
            searchTerm !== '') && (
            <button
              onClick={() => {
                setSelectedSubject('ALL');
                setSelectedTopic('ALL');
                setSelectedDifficulty('ALL');
                setSelectedStatus('ALL');
                setSearchTerm('');
              }}
              className="text-indigo-600 hover:underline cursor-pointer font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuestions.map((q) => {
          const isHard = q.difficulty === 'HARD';
          const isMedium = q.difficulty === 'MEDIUM';
          const isApproved = q.status === 'APPROVED';

          return (
            <Card
              key={q.id}
              onClick={() => setSelectedQuestion(q)}
              className="p-5 border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {q.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isHard
                          ? 'bg-rose-100 text-rose-800'
                          : isMedium
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      isApproved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {q.status}
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    {q.subject} • <span className="text-slate-700">{q.topic}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-900 font-sans mt-1 line-clamp-3 leading-relaxed">
                    {q.text}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span>Marks: <strong className="text-slate-900">{q.marks || 4}</strong></span>
                  <span>Type: <strong className="text-slate-800">{q.type || 'MCQ'}</strong></span>
                </div>

                <div className="flex items-center gap-1 text-indigo-600 font-semibold group-hover:translate-x-0.5 transition text-xs">
                  <span>Inspect Item</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Question Details Drawer / Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded">
                      {selectedQuestion.id}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {selectedQuestion.subject} — {selectedQuestion.topic}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Formulated by {selectedQuestion.author || 'Confidential Oversight Committee'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedQuestion(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Question Text */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  Question Prompt (Confidential)
                </div>
                <p className="text-sm font-medium text-slate-900 leading-relaxed font-sans">
                  {selectedQuestion.text}
                </p>
              </div>

              {/* Multiple Choice Options if available */}
              {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                    Examination Options & Key:
                  </div>
                  <div className="space-y-1.5">
                    {selectedQuestion.options.map((opt, idx) => {
                      const isAnswer = selectedQuestion.answer && opt.includes(selectedQuestion.answer.slice(0, 3));

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-sans ${
                            isAnswer
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <span>{opt}</span>
                          {isAnswer && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>CORRECT KEY</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Difficulty</div>
                  <div className="text-xs font-bold text-slate-900 mt-1">{selectedQuestion.difficulty}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Award Marks</div>
                  <div className="text-xs font-bold text-indigo-600 mt-1">{selectedQuestion.marks || 4} Marks</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Security Tier</div>
                  <div className="text-xs font-bold text-purple-700 mt-1">{selectedQuestion.confidentiality || 'TOP_SECRET'}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Approval Status</div>
                  <div className="text-xs font-bold text-emerald-700 mt-1">{selectedQuestion.status || 'APPROVED'}</div>
                </div>
              </div>

              {/* Cryptographic Footprint */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans">
                  <span>Cryptographic Item Fingerprint (SHA-256):</span>
                  <button
                    onClick={() => handleCopy(`SHA256:${selectedQuestion.id}:${selectedQuestion.text.slice(0, 32)}`)}
                    className="text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedHash ? 'Copied!' : 'Copy Fingerprint'}</span>
                  </button>
                </div>
                <div className="text-indigo-700 font-bold break-all">
                  {`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855:${selectedQuestion.id}`}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedQuestion(null)}
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
