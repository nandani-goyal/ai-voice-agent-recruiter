// server/services/evaluationService.js
const fs = require('fs');
const path = require('path');
const InterviewAnalytics = require('../models/InterviewAnalytics');
const RecruiterNudge = require('../models/RecruiterNudge');

// Load job description config (placeholder)
let jobDesc = { title: '', requiredSkills: [], description: '' };
try {
  const jdPath = path.resolve(__dirname, '..', 'config', 'jobDescription.json');
  const raw = fs.readFileSync(jdPath, 'utf-8');
  jobDesc = JSON.parse(raw);
} catch (e) {
  console.warn('[EvaluationService] Could not load jobDescription.json', e.message);
}

// simple helper to extract words, lowercase
function extractWords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function computeScores({ answer, candidateQuery, detectedSkills }) {
  // Technical score based on proportion of required skills detected
  const techProportion = jobDesc.requiredSkills.length
    ? detectedSkills.length / jobDesc.requiredSkills.length
    : 0;
  const technicalScore = Math.round(techProportion * 100);

  // Communication score based on answer length (capped)
  const wordCount = extractWords(answer).length;
  const communicationScore = Math.min(100, Math.round(wordCount * 2)); // 50 words => 100

  // Confidence score: boost if confident keywords present
  const confidenceKeywords = ['definitely', 'sure', 'confident', 'certainly', 'absolutely'];
  const answerWords = extractWords(answer);
  const hasConfidence = confidenceKeywords.some((kw) => answerWords.includes(kw));
  const confidenceScore = hasConfidence ? 90 : 70;

  const overallScore = Math.round((technicalScore + communicationScore + confidenceScore) / 3);

  return { overallScore, technicalScore, communicationScore, confidenceScore };
}

function generateNudges({ missingSkills, detectedSkills }) {
  const followUpQuestions = missingSkills.map((s) => `Can you tell me more about your experience with ${s}?`);
  const skillProbes = detectedSkills.map((s) => `Could you give a concrete example where you applied ${s}?`);
  const missingTopics = missingSkills; // simple mapping
  let hiringRecommendation = 'Hold';
  if (missingSkills.length === 0) hiringRecommendation = 'Hire';
  else if (missingSkills.length > 3) hiringRecommendation = 'Reject';
  return { followUpQuestions, skillProbes, missingTopics, hiringRecommendation };
}

/**
 * Evaluate a candidate answer and persist analytics / nudges.
 * Returns an object containing analytics, skills, nudges.
 */
async function evaluateAnswer({ sessionId, candidateQuery, answer, ragChunks, history }) {
  // Detect skills mentioned in answer (simple keyword match)
  const answerWords = extractWords(answer);
  const detectedSkills = jobDesc.requiredSkills.filter((skill) => answerWords.includes(skill.toLowerCase()));
  const missingSkills = jobDesc.requiredSkills.filter((skill) => !detectedSkills.includes(skill));

  const strengths = detectedSkills.map((s) => `Strong knowledge of ${s}`);
  const weaknesses = missingSkills.map((s) => `Limited experience with ${s}`);

  // Compute scores
  const { overallScore, technicalScore, communicationScore, confidenceScore } = computeScores({ answer, candidateQuery, detectedSkills });

  // Generate nudges / follow‑ups
  const { followUpQuestions, skillProbes, missingTopics, hiringRecommendation } = generateNudges({ missingSkills, detectedSkills });

  // Persist analytics
  await InterviewAnalytics.findOneAndUpdate(
    { sessionId },
    {
      overallScore,
      technicalScore,
      communicationScore,
      confidenceScore,
      $inc: { questionsCompleted: 1 },
      hiringRecommendation,
    },
    { upsert: true, new: true }
  );

  // Persist nudge / skill data
  await RecruiterNudge.findOneAndUpdate(
    { sessionId },
    {
      $set: {
        followUpQuestions,
        probeSkills: skillProbes,
        missingTopics,
        hiringRecommendation,
        detectedSkills,
        missingSkills,
        strengths,
        weaknesses,
      },
    },
    { upsert: true, new: true }
  );

  return {
    analytics: { overallScore, technicalScore, communicationScore, confidenceScore, questionsCompleted: undefined, hiringRecommendation },
    skills: { detectedSkills, missingSkills, strengths, weaknesses },
    nudges: { followUpQuestions, skillProbes, missingTopics, hiringRecommendation },
  };
}

module.exports = { evaluateAnswer };
