const { getGroqClient } = require("../config/groq");

/**
 * Send a chat completion request to Groq.
 * @param {Array} messages - Array of {role, content} objects
 * @param {Object} options  - Optional overrides (model, temperature, max_tokens)
 * @returns {Promise<string>} - The assistant text response
 */
const chatCompletion = async (messages, options = {}) => {
  const groq = getGroqClient();

  const response = await groq.chat.completions.create({
    model: options.model || "llama3-8b-8192",
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 1024,
  });

  return response.choices[0]?.message?.content ?? "";
};

module.exports = { chatCompletion };
