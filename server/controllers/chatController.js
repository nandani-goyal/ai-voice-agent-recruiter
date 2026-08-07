// server/controllers/chatController.js
const { searchKnowledgeBase } = require('../services/retrievalService');
const { generateRagAnswer } = require('../services/groqService');
const { saveMessage, getRecentMessages } = require('../services/conversationService');
const { getIO } = require('../socket/socket');
const InterviewAnalytics = require('../models/InterviewAnalytics');
const RecruiterNudge = require('../models/RecruiterNudge');
 const { evaluateAnswer } = require('../services/evaluationService');
/**
 * Handle POST /api/chat
 * Complete RAG pipeline with conversation persistence and emit Socket.IO events.
 */
const handleChat = async (req, res) => {
  try {
    const { query, sessionId } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Query string is required' });
    }
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const cleanQuery = query.trim();

    // Save candidate message and emit to recruiter dashboard
    await saveMessage(sessionId, 'candidate', cleanQuery);
    const io = getIO();
    if(io){
      io.to(sessionId).emit('interview:update', {
      sessionId,
      type: 'transcript',
      data: { speaker: 'candidate', text: cleanQuery, timestamp: Date.now() },
    });
    io.to(sessionId).emit('interview:update', { sessionId, type: 'status', data: 'Thinking' });}

    // Retrieve relevant knowledge base chunks
    const chunks = await searchKnowledgeBase(cleanQuery, 5);

    // Load recent conversation history (last 10 messages) for context
    const recent = await getRecentMessages(sessionId, 10);
    const historyString = recent
      .reverse()
      .map((msg) => `${msg.speaker === 'candidate' ? 'Candidate' : 'AI'}: ${msg.message}`)
      .join('\n');

    // Generate AI answer using Groq
    const answer = await generateRagAnswer(cleanQuery, chunks, historyString);

    // Save AI response
    await saveMessage(sessionId, 'ai', answer);
    io.to(sessionId).emit('interview:update', {
      sessionId,
      type: 'transcript',
      data: { speaker: 'ai', text: answer, timestamp: Date.now() },
    });
    io.to(sessionId).emit('interview:update', { sessionId, type: 'status', data: 'Responding' });

    // Extract unique source filenames for reference
    const sources = [...new Set(chunks.map((c) => c.source).filter(Boolean))];

    // ----- Analytics & Nudges (real implementation) -----
   
    // Evaluate the candidate answer
   const evaluation = await evaluateAnswer({
  sessionId,
  candidateQuery: cleanQuery,
  answer,
  ragChunks: chunks,
  history: recent,
});
    // Emit analytics, skills, and nudges updates
 io.to(sessionId).emit("interview:update", {
  sessionId,
  type: "analytics",
  data: evaluation.analytics,
});

io.to(sessionId).emit("interview:update", {
  sessionId,
  type: "skills",
  data: evaluation.skills,
});

io.to(sessionId).emit("interview:update", {
  sessionId,
  type: "nudges",
  data: evaluation.nudges,
});

    // Return response to the interview client
    res.json({ query: cleanQuery, answer, sources });
  } catch (err) {
    console.error('[ChatController] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { handleChat };
