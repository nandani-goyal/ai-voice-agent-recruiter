const { getGroqClient } = require('../config/groq');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Convert an audio file to WAV format using ffmpeg.
 * @param {string} inputPath - Path to the original uploaded audio file.
 * @returns {Promise<string>} - Path to the converted WAV file.
 */
const convertToWav = (inputPath) => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(
      path.dirname(inputPath),
      `${path.basename(inputPath, path.extname(inputPath))}_converted.wav`
    );
    ffmpeg(inputPath)
      .output(outputPath)
      .audioCodec('pcm_s16le')
      .format('wav')
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run();
  });
};

/**
 * Transcribe an audio file using Groq Whisper.
 * @param {string} filePath - Absolute path to the uploaded audio file.
 * @param {string} [language] - Optional ISO-639-1 language code (e.g., "en").
 * @returns {Promise<string>} - Transcribed text.
 */
const transcribeAudio = async (filePath, language = 'en') => {
  const groq = getGroqClient();

  // Ensure the file is in a format accepted by Groq Whisper (WAV preferred)
  let wavPath = filePath;
  if (path.extname(filePath).toLowerCase() !== '.wav') {
    try {
      wavPath = await convertToWav(filePath);
    } catch (convErr) {
      console.error('[Whisper] Failed to convert audio to WAV:', convErr.message);
      // Continue with original file; Groq may reject it.
    }
  }

  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(wavPath),
    model: 'whisper-large-v3',
    language,
    response_format: 'json',
  });

  // Cleanup temporary WAV file if we created one
  if (wavPath !== filePath) {
    try {
      fs.unlinkSync(wavPath);
    } catch (cleanupErr) {
      console.error('[Whisper] Cleanup of temporary WAV failed:', cleanupErr.message);
    }
  }

  return transcription.text ?? '';
};

/**
 * Translate audio to English using Groq Whisper.
 * @param {string} filePath - Absolute path to the uploaded audio file.
 * @returns {Promise<string>} - Translated English text.
 */
const translateAudio = async (filePath) => {
  const groq = getGroqClient();
  const translation = await groq.audio.translations.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-large-v3',
    response_format: 'json',
  });
  return translation.text ?? '';
};

module.exports = { transcribeAudio, translateAudio };
