// src/pages/Interview.jsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import Header from "../components/interview/Header";
import ListeningIndicator from "../components/interview/ListeningIndicator";
import AiResponseArea from "../components/interview/AiResponseArea";
import CandidateTranscriptArea from "../components/interview/CandidateTranscriptArea";
import ConversationHistory from "../components/interview/ConversationHistory";
import Controls from "../components/interview/Controls";
import { useRecorder } from "../hooks/useRecorder";
import { useSpeech } from "../hooks/useSpeech";
import { io } from "socket.io-client";

export default function Interview() {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [currentAiResponse, setCurrentAiResponse] = useState("");
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);

  // Keep sessionId accessible inside callbacks without stale closure issues
  const sessionIdRef = useRef("");
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // Speech hooks
  const { isSpeaking: isAiSpeaking, speak, stopSpeaking } = useSpeech();

  // Load voices on mount
  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  // Socket setup — one connection per component lifecycle
  const socketRef = useRef(null);
  useEffect(() => {
    const socket = io("http://localhost:5000");
    socketRef.current = socket;
    socket.on("connect", () =>
      console.log("[Interview] Socket connected", socket.id)
    );
    return () => socket.disconnect();
  }, []);

  // Join session room so recruiter dashboard can listen
  useEffect(() => {
    if (socketRef.current && sessionId) {
      socketRef.current.emit("joinSession", { sessionId });
    }
  }, [sessionId]);

  // Helper: emit interview status to the recruiter dashboard
  const emitStatus = useCallback((status) => {
    if (socketRef.current && sessionIdRef.current) {
      socketRef.current.emit("interview:update", {
        sessionId: sessionIdRef.current,
        type: "status",
        data: status,
      });
    }
  }, []);

  const appendToHistory = useCallback((sender, text, sources = []) => {
    setConversationHistory((prev) => [
      ...prev,
      {
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sources,
      },
    ]);
  }, []);

  // ── Core chat call — called once we have the full transcript ──────────────
  const sendTranscriptToAI = useCallback(async (candidateQuery) => {
    const sid = sessionIdRef.current;
    if (!candidateQuery || !candidateQuery.trim() || !sid) return;

    const cleanQuery = candidateQuery.trim();
    appendToHistory("candidate", cleanQuery);
    setCurrentTranscript("");
    setIsProcessingResponse(true);
    setCurrentAiResponse("Thinking...");
    emitStatus("Thinking");

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        query: cleanQuery,
        sessionId: sid,
      });
      const { answer, sources } = response.data;
      setCurrentAiResponse(answer);
      setIsProcessingResponse(false);
      emitStatus("Responding");
      speak(answer, () => {
        appendToHistory("ai", answer, sources || []);
        emitStatus("Listening");
      });
    } catch (error) {
      console.error("[RAG] Failed to get response:", error);
      const errorMsg =
        "I'm having trouble accessing my knowledge base right now. Could you please try again?";
      setCurrentAiResponse(errorMsg);
      setIsProcessingResponse(false);
      speak(errorMsg, () => {
        appendToHistory("ai", errorMsg, []);
        emitStatus("Listening");
      });
    }
  }, [appendToHistory, emitStatus, speak]);

  // Live transcript display (called per chunk as it comes in)
  const handleChunkTranscribed = useCallback((text) => {
    setCurrentTranscript((prev) => (prev ? prev + " " + text : text));
  }, []);

  // Called ONCE after full upload & transcription is complete — this triggers the AI
  const handleTranscriptReady = useCallback((text) => {
    sendTranscriptToAI(text);
  }, [sendTranscriptToAI]);

  const { isRecording, recordingDuration, chunksRecorded, startRecording, stopRecording } =
    useRecorder({
      onChunkTranscribed: handleChunkTranscribed,
      onTranscriptReady: handleTranscriptReady,
    });

  const handleStartInterview = () => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    sessionIdRef.current = newSessionId;
    setIsInterviewStarted(true);
    const greeting =
      "Welcome to the technical evaluation! I am Nova, your AI Recruiter. To start off, could you please give me a brief overview of your background and your experience with modern software engineering?";
    setCurrentAiResponse(greeting);
    emitStatus("Listening");
    speak(greeting, () => {
      appendToHistory("ai", greeting, ["Interview_Guidelines.pdf"]);
      if (socketRef.current) {
        socketRef.current.emit("interview:update", {
          sessionId: newSessionId,
          type: "transcript",
          data: { speaker: "ai", text: greeting, timestamp: Date.now() },
        });
      }
    });
  };

  const handleToggleListening = () => {
    if (!isInterviewStarted || isProcessingResponse) return;
    if (isAiSpeaking) stopSpeaking();
    setCurrentTranscript("");
    emitStatus("Listening");
    startRecording();
  };

  // Stop recording — the chat call now happens in onTranscriptReady, NOT here
  const handleStopRecording = () => {
    stopRecording();
    // Show "Processing..." while we wait for Whisper to return
    setCurrentAiResponse("Processing your answer...");
  };

  const handleEndInterview = () => {
    setIsInterviewStarted(false);
    setSessionId("");
    sessionIdRef.current = "";
    if (isRecording) stopRecording();
    stopSpeaking();
    setIsProcessingResponse(false);
    setCurrentAiResponse("");
    setCurrentTranscript("");
    emitStatus("Completed");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Header isInterviewStarted={isInterviewStarted} isListening={isRecording} />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <Controls
          isInterviewStarted={isInterviewStarted}
          isListening={isRecording}
          onStartInterview={handleStartInterview}
          onStopRecording={handleStopRecording}
          onToggleListening={handleToggleListening}
          onEndInterview={handleEndInterview}
        />
        <ListeningIndicator
          isListening={isRecording}
          isInterviewStarted={isInterviewStarted}
          recordingDuration={recordingDuration}
          chunksRecorded={chunksRecorded}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AiResponseArea
            currentAiResponse={currentAiResponse}
            isAiSpeaking={isAiSpeaking || isProcessingResponse}
          />
          <CandidateTranscriptArea
            currentTranscript={currentTranscript}
            isListening={isRecording}
          />
        </div>
        <ConversationHistory history={conversationHistory} />
      </main>
    </div>
  );
}
