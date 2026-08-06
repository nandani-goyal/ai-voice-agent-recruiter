const { searchKnowledgeBase } = require("../services/retrievalService");
const { generateRagAnswer } = require("../services/groqService");

/**
 * Handle POST /api/chat
 * Complete RAG pipeline: User Query ? Embedding ? Qdrant Retrieval ? Groq ? Grounded Answer
 */
const handleChat = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Query string is required" });
    }

    const cleanQuery = query.trim();

    // 1. Retrieve top 5 relevant chunks from Qdrant
    const chunks = await searchKnowledgeBase(cleanQuery, 5);

    // 2. Extract unique source filenames
    const sources = [...new Set(chunks.map((c) => c.source).filter(Boolean))];

    // 3. Generate grounded answer using Groq LLM
    const answer = await generateRagAnswer(cleanQuery, chunks);

    // 4. Return response
    res.json({
      query: cleanQuery,
      answer,
      sources,
    });
  } catch (err) {
    console.error("[ChatController] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  handleChat,
};
