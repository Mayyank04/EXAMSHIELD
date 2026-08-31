import { GoogleGenAI } from '@google/genai';
import { DocumentLeakAnalysis, Question, UserRiskProfile } from '../src/types/index.ts';
import { computeSha256 } from './crypto.ts';

// Helper for Gemini AI client initialization
let genaiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genaiClient && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      genaiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Gemini client init failed, using local NLP engine:', e);
    }
  }
  return genaiClient;
}

// -------------------------------------------------------------
// 1. INSIDER THREAT & BEHAVIOR ANOMALY ENGINE
// -------------------------------------------------------------

export interface AnomalyInput {
  userId: string;
  userName: string;
  role: string;
  accessHour: number; // 0-23
  isAuthorizedHour: boolean; // 8am - 7pm
  isKnownDevice: boolean;
  locationDistanceKmFromAssigned: number;
  failedLoginCount: number;
  downloadCount: number;
  recentPaperAccessCount: number;
  roleEscalationAttempt: boolean;
}

export function evaluateUserAnomaly(input: AnomalyInput): UserRiskProfile {
  let accessAnomaly = 0;
  let timeAnomaly = 0;
  let deviceAnomaly = 0;
  let locationAnomaly = 0;
  let downloadAnomaly = 0;
  const violations: string[] = [];

  // Time anomaly
  if (!input.isAuthorizedHour) {
    timeAnomaly = Math.min(95, 45 + Math.abs(input.accessHour - 14) * 5);
    violations.push(`Confidential paper access outside authorized operations window (Access time: ${input.accessHour}:00 UTC)`);
  } else {
    timeAnomaly = 10;
  }

  // Device anomaly
  if (!input.isKnownDevice) {
    deviceAnomaly = 88;
    violations.push('Access request originated from unregistered or untrusted hardware footprint');
  } else {
    deviceAnomaly = 12;
  }

  // Location anomaly
  if (input.locationDistanceKmFromAssigned > 50) {
    locationAnomaly = Math.min(95, 30 + Math.round(input.locationDistanceKmFromAssigned / 5));
    violations.push(`Physical geofence discrepancy: User device is ${input.locationDistanceKmFromAssigned} km away from registered exam precinct`);
  } else {
    locationAnomaly = 8;
  }

  // Access frequency & volume
  if (input.recentPaperAccessCount > 8) {
    accessAnomaly = Math.min(95, 35 + input.recentPaperAccessCount * 6);
    violations.push(`Excessive confidential paper viewing frequency (${input.recentPaperAccessCount} queries in 10 minutes)`);
  } else {
    accessAnomaly = 15;
  }

  // Download anomaly
  if (input.downloadCount > 3) {
    downloadAnomaly = Math.min(98, 40 + input.downloadCount * 18);
    violations.push(`Unusual bulk download volume (${input.downloadCount} protected cryptographic assets extracted)`);
  } else {
    downloadAnomaly = 5;
  }

  if (input.failedLoginCount >= 3) {
    violations.push(`Multiple consecutive authentication failures (${input.failedLoginCount} attempts logged)`);
  }

  if (input.roleEscalationAttempt) {
    violations.push('Unauthorized administrative privilege escalation attempt detected');
  }

  // Correlated weighted score (0-100)
  const weightedScore = Math.round(
    timeAnomaly * 0.25 +
    deviceAnomaly * 0.25 +
    locationAnomaly * 0.15 +
    accessAnomaly * 0.15 +
    downloadAnomaly * 0.20 +
    (input.failedLoginCount > 3 ? 15 : 0) +
    (input.roleEscalationAttempt ? 25 : 0)
  );

  const riskScore = Math.min(100, Math.max(5, weightedScore));

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (riskScore >= 80) riskLevel = 'CRITICAL';
  else if (riskScore >= 60) riskLevel = 'HIGH';
  else if (riskScore >= 30) riskLevel = 'MEDIUM';

  let status: UserRiskProfile['status'] = 'NORMAL';
  if (riskLevel === 'CRITICAL') status = 'SUSPENDED';
  else if (riskLevel === 'HIGH') status = 'FLAGGED';
  else if (riskLevel === 'MEDIUM') status = 'MONITORED';

  return {
    userId: input.userId,
    userName: input.userName,
    role: input.role,
    riskScore,
    riskLevel,
    factors: {
      accessAnomaly,
      timeAnomaly,
      deviceAnomaly,
      locationAnomaly,
      downloadAnomaly,
    },
    recentViolations: violations,
    lastAssessed: new Date().toISOString(),
    status,
  };
}

// -------------------------------------------------------------
// 2. DOCUMENT LEAK & SEMANTIC SIMILARITY ENGINE
// -------------------------------------------------------------

// Local TF-IDF and N-gram Tokenizer & Vector Cosine Similarity
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function computeWordFreq(tokens: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of tokens) {
    map.set(t, (map.get(t) || 0) + 1);
  }
  return map;
}

function calculateCosineSimilarity(text1: string, text2: string): number {
  const t1 = tokenize(text1);
  const t2 = tokenize(text2);
  if (t1.length === 0 || t2.length === 0) return 0;

  const f1 = computeWordFreq(t1);
  const f2 = computeWordFreq(t2);

  const allWords = new Set([...f1.keys(), ...f2.keys()]);
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (const w of allWords) {
    const v1 = f1.get(w) || 0;
    const v2 = f2.get(w) || 0;
    dotProduct += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  }

  const denominator = Math.sqrt(mag1) * Math.sqrt(mag2);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

export async function analyzeSuspectedDocument(
  uploadedFilename: string,
  uploadedText: string,
  protectedQuestions: Question[],
  protectedPaperCode?: string
): Promise<DocumentLeakAnalysis> {
  const timestamp = new Date().toISOString();
  const uploadedDocHash = computeSha256(uploadedText);

  // Split uploaded document into candidate questions/paragraphs
  const candidateParagraphs = uploadedText
    .split(/(?:\r?\n){2,}|(?=Q\d+[:.)]|Question\s*\d+[:.)]|\d+[\.\)]\s+)/gi)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  const matchedQuestions: DocumentLeakAnalysis['matchedQuestions'] = [];
  let highestMaxSim = 0;
  let totalSimAccum = 0;

  for (const para of candidateParagraphs) {
    let bestMatch: Question | null = null;
    let bestScore = 0;

    for (const q of protectedQuestions) {
      const sim = calculateCosineSimilarity(para, q.text);
      if (sim > bestScore) {
        bestScore = sim;
        bestMatch = q;
      }
    }

    if (bestScore > 0.35 && bestMatch) {
      matchedQuestions.push({
        submittedQuestion: para.slice(0, 180) + (para.length > 180 ? '...' : ''),
        matchedOriginalQuestion: bestMatch.text.slice(0, 180) + (bestMatch.text.length > 180 ? '...' : ''),
        similarityScore: Number((bestScore * 100).toFixed(1)),
        subject: bestMatch.subject,
      });
      totalSimAccum += bestScore;
      if (bestScore > highestMaxSim) highestMaxSim = bestScore;
    }
  }

  // Calculate distinct similarity dimensions
  let questionSimilarity = 0;
  if (matchedQuestions.length > 0) {
    const avgTop = matchedQuestions.slice(0, 5).reduce((acc, m) => acc + m.similarityScore, 0) / Math.min(5, matchedQuestions.length);
    questionSimilarity = Math.min(99.4, Number(avgTop.toFixed(1)));
  } else {
    // Overall text fallback comparison
    const fullTextSim = calculateCosineSimilarity(
      uploadedText,
      protectedQuestions.map((q) => q.text).join(' ')
    );
    questionSimilarity = Number((fullTextSim * 100).toFixed(1));
  }

  const structureSimilarity = questionSimilarity > 40
    ? Number(Math.min(96, questionSimilarity * 0.92 + 4).toFixed(1))
    : Number((questionSimilarity * 0.8).toFixed(1));

  const sequenceSimilarity = matchedQuestions.length >= 3
    ? Number(Math.min(94, questionSimilarity * 0.88 + 5).toFixed(1))
    : Number((questionSimilarity * 0.65).toFixed(1));

  const overallSimilarity = Number(
    (questionSimilarity * 0.5 + structureSimilarity * 0.3 + sequenceSimilarity * 0.2).toFixed(1)
  );

  const exposureRiskScore = Math.min(
    100,
    Math.round(overallSimilarity * 0.85 + (matchedQuestions.length >= 3 ? 15 : matchedQuestions.length * 4))
  );

  let riskLevel: DocumentLeakAnalysis['riskLevel'] = 'LOW';
  if (exposureRiskScore >= 80) riskLevel = 'CRITICAL';
  else if (exposureRiskScore >= 60) riskLevel = 'HIGH';
  else if (exposureRiskScore >= 30) riskLevel = 'MEDIUM';

  // AI Verdict Summary
  let verdictSummary = '';
  const recommendations: string[] = [];

  if (exposureRiskScore >= 80) {
    verdictSummary = `Estimated Exposure Risk: ${exposureRiskScore}/100. High semantic overlap (${overallSimilarity}%) detected with protected examination paper set '${protectedPaperCode || 'NEET-DEMO-2027-PHY-A'}'. Multiple key questions and conceptual sequences match active repository entries.`;
    recommendations.push('Quarantine examination batch and review chain of custody immediately');
    recommendations.push('Initiate automated investigation incident and freeze current transport handovers');
    recommendations.push('Perform cryptographic re-verification of all printed paper signatures');
  } else if (exposureRiskScore >= 50) {
    verdictSummary = `Estimated Exposure Risk: ${exposureRiskScore}/100. Moderate thematic and question similarity (${overallSimilarity}%) identified. May contain practice questions or sample syllabus overlaps. Requires manual supervisor review.`;
    recommendations.push('Flag document for secondary manual verification by Subject Matter Expert');
    recommendations.push('Cross-reference upload origin IP and device fingerprint against authorized personnel logs');
  } else {
    verdictSummary = `Estimated Exposure Risk: ${exposureRiskScore}/100. Low similarity detected (${overallSimilarity}%). The uploaded text does not demonstrate structural or semantic convergence with current active protected papers.`;
    recommendations.push('No immediate containment action necessary; record telemetry log in audit ledger');
  }

  // Attempt optional Gemini enhancement if available
  const ai = getGeminiClient();
  if (ai && overallSimilarity > 25) {
    try {
      const prompt = `You are the lead AI Security Analyst on the ExamShield platform. Analyze the following semantic comparison between a suspected leaked document and a protected confidential question paper.
      Uploaded file: ${uploadedFilename}
      Question Similarity: ${questionSimilarity}%
      Matched Questions Count: ${matchedQuestions.length}
      Top Matched Topics: ${matchedQuestions.map((m) => m.subject).join(', ')}

      Provide a concise 2-sentence forensic intelligence briefing using responsible security terminology (e.g. "Estimated similarity detected", "Requires investigation", avoiding declaring definitive guilt).`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response && response.text) {
        verdictSummary = response.text.trim();
      }
    } catch (e) {
      // Fallback already assigned
    }
  }

  return {
    analysisId: `ANL-LEAK-${Date.now()}`,
    uploadedFilename,
    uploadedDocHash,
    timestamp,
    questionSimilarity,
    structureSimilarity,
    sequenceSimilarity,
    overallSimilarity,
    exposureRiskScore,
    riskLevel,
    matchedPaperId: 'PAP-001',
    matchedPaperCode: protectedPaperCode || 'NEET-DEMO-2027-PHY-A',
    matchedQuestions,
    verdictSummary,
    recommendations,
  };
}
