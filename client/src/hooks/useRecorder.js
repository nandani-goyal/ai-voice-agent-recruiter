// src/hooks/useRecorder.js
import { useState, useRef, useCallback } from "react";
import axios from "axios";

/**
 * Hook for recording audio via MediaRecorder.
 * Records in 2‑second chunks (stored locally), merges them after stop,
 * uploads a SINGLE audio file to /api/transcribe, and fires callbacks:
 *   - onChunkTranscribed(text)  – called with transcript text for live display
 *   - onTranscriptReady(text)   – called once after full upload completes (use this for /api/chat)
 */
export function useRecorder({ onChunkTranscribed, onTranscriptReady }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [chunksRecorded, setChunksRecorded] = useState(0);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const log = (...args) => console.log("[useRecorder]", ...args);

  const startRecording = useCallback(async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      // Reset state for a fresh answer
      chunksRef.current = [];
      setChunksRecorded(0);
      setRecordingDuration(0);

      log("Recording started");
      log("Recorder MIME type:", recorder.mimeType);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
          setChunksRecorded((c) => c + 1);
          log("Chunk collected – size:", event.data.size, "bytes");
        }
      };

      // 2‑second chunking kept locally — nothing uploaded per chunk
      recorder.start(2000);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error("[useRecorder] Microphone error:", err);
      alert("Microphone access is required to record audio.");
    }
  }, [isRecording]);

  const uploadMergedAudio = async (blob) => {
    const mime = mediaRecorderRef.current?.mimeType || "audio/webm";
    log("Merged audio created – size:", blob.size, "bytes, MIME:", mime);
    log("Sending merged audio to Whisper – upload count: 1");

    const formData = new FormData();
    formData.append("audio", blob, `merged-${Date.now()}.webm`);
    try {
      const res = await axios.post("http://localhost:5000/api/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data.transcript) {
        const transcript = res.data.transcript;
        log("Transcript received:", transcript);

        // Update live display
        if (onChunkTranscribed) onChunkTranscribed(transcript);

        // Signal that transcript is fully ready for /api/chat
        if (onTranscriptReady) onTranscriptReady(transcript);
      } else {
        log("Empty transcript returned – skipping chat call.");
      }
    } catch (err) {
      console.error("[useRecorder] Error uploading merged audio:", err.message);
    }
  };

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;

    // Set onstop BEFORE calling stop() to capture the final chunk
    mediaRecorderRef.current.onstop = async () => {
      log("Recording stopped – total chunks collected:", chunksRef.current.length);
      const mergedBlob = new Blob(chunksRef.current, {
        type: mediaRecorderRef.current?.mimeType || "audio/webm",
      });
      await uploadMergedAudio(mergedBlob);
    };

    mediaRecorderRef.current.stop();
    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [isRecording, onChunkTranscribed, onTranscriptReady]);

  return {
    isRecording,
    recordingDuration,
    chunksRecorded,
    startRecording,
    stopRecording,
  };
}
