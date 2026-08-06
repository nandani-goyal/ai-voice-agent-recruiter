const Groq = require("groq-sdk");

let groqClient = null;

const getGroqClient = () => {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("[Groq] GROQ_API_KEY is not set in .env");
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
};

const isConfigured = () => {
  return Boolean(process.env.GROQ_API_KEY);
};

module.exports = { getGroqClient, isConfigured };
