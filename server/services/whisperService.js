const { getGroqClient } = require("../config/groq");
const fs = require("fs");

/**
 * Transcribe an audio file using Groq Whisper.
 * @param {string} filePath     - Absolute path to the audio file
 * @param {string} [language]   - Optional ISO-639-1 language code (e.g. "en")
 * @returns {Promise<string>}   - Transcribed text
 */
const transcribeAudio = async (filePath, language = "en") => {
  const groq = getGroqClient();

  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-large-v3",
    language,
    response_format: "json",
  });

  return transcription.text ?? "";
};

/**
 * Translate audio to English using Groq Whisper.
 * @param {string} filePath - Absolute path to the audio file
 * @returns {Promise<string>} - Translated English text
 */
const translateAudio = async (filePath) => {
  const groq = getGroqClient();

  const translation = await groq.audio.translations.create({
    file: fs.createReadStream(filePath),
    model: "whisper-large-v3",
    response_format: "json",
  });

  return translation.text ?? "";
};

module.exports = { transcribeAudio, translateAudio };
