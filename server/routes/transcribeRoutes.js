const express = require("express");
const router = express.Router();
const fs = require("fs");
const upload = require("../config/multer");
const { transcribeAudio } = require("../services/whisperService");

// ── POST /api/transcribe ───────────────────────────────────────────────────────
router.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No audio file provided." });
    }

    // Call Groq Whisper service
    const transcript = await transcribeAudio(req.file.path);

    if (!transcript) {
      return res.status(200).json({ success: true, transcript: "", message: "Empty transcript returned." });
    }

    return res.status(200).json({ success: true, transcript });
  } catch (error) {
    console.error("[Transcribe] Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    // Robust cleanup: ALWAYS delete the temporary file after processing
    if (req.file && req.file.path) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupError) {
        console.error("[Transcribe] Cleanup failed for file:", req.file.path, cleanupError.message);
      }
    }
  }
});

module.exports = router;
