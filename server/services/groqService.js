const { getGroqClient } = require("../config/groq");

/**
 * Generate a grounded RAG response using Groq LLM.
 *
 * @param {string} query - User question
 * @param {Array<{content: string, source: string}>} chunks - Retrieved context chunks
 * @param {string} [history] - Optional conversation history (last messages)
 * @param {Object} [options] - Model configuration overrides
 * @returns {Promise<string>} Grounded answer text
 */
const generateRagAnswer = async (query, chunks, history = "", options = {}) => {
  const groq = getGroqClient();

  if (!chunks || chunks.length === 0) {
    return "I couldn't find that information in the knowledge base.";
  }

  // Format context text with sources
  const contextText = chunks
    .map((chunk, index) => `[Document ${index + 1} - ${chunk.source}]:\n${chunk.content}`)
    .join("\n\n");

  const baseSystemPrompt = `You are an AI recruitment interviewer. Ask one interview question at a time, evaluate the candidate's responses using the provided recruitment knowledge base, answer candidate questions only using the retrieved context, and maintain a professional interview flow.

Your task is to answer user questions strictly based on the provided Context below.

CRITICAL INSTRUCTIONS:
1. Rely ONLY on the clear facts directly mentioned in the Context. Do NOT use outside knowledge, extrapolate, or speculate.
2. If the Context does not contain enough information to fully answer the question, respond EXACTLY with:
"I couldn't find that information in the knowledge base."
3. Keep your answer clear, concise, well-structured, and factual.`;

  const systemPrompt = history ? `${baseSystemPrompt}\n\nConversation History:\n${history}` : baseSystemPrompt;

  const userPrompt = `Context:\n${contextText}\n\nQuestion:\n${query}`;

  const model = options.model || "llama-3.3-70b-versatile";

  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    });

    return response.choices[0]?.message?.content?.trim() ?? "I couldn't find that information in the knowledge base.";
  } catch (err) {
    if (model !== "llama3-8b-8192") {
      console.warn(`[Groq] ${model} error, falling back to llama3-8b-8192:`, err.message);
      return generateRagAnswer(query, chunks, history, { ...options, model: "llama3-8b-8192" });
    }
    throw err;
  }
};

module.exports = {
  generateRagAnswer,
};
