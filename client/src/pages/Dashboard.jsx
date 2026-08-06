// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import LiveTranscript from "../components/dashboard/LiveTranscript";
import AiResponses from "../components/dashboard/AiResponses";
import Timeline from "../components/dashboard/Timeline";
import StatusBar from "../components/dashboard/StatusBar";
import DurationTimer from "../components/dashboard/DurationTimer";
import AnalyticsPanel from "../components/dashboard/AnalyticsPanel";
import SkillsPanel from "../components/dashboard/SkillsPanel";
import NudgesPanel from "../components/dashboard/NudgesPanel";

// const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function Dashboard() {
  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [transcript, setTranscript] = useState([]); // array of {speaker, text, timestamp}
  const [status, setStatus] = useState("Waiting");
  const [startTime, setStartTime] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [skills, setSkills] = useState(null);
  const [nudges, setNudges] = useState(null);

  // Initialize socket connection once
  useEffect(() => {
    const s = io(SOCKET_URL);
    setSocket(s);
    s.on("connect", () => console.log("[Dashboard] Socket connected", s.id));
    s.on("disconnect", () => console.log("[Dashboard] Socket disconnected"));
    return () => s.disconnect();
  }, []);

  // Listen for interview updates
  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      const { sessionId: sid, type, data } = payload;
      if (sid !== sessionId) return; // ignore other sessions
      switch (type) {
        case "status":
          setStatus(data);
          break;
        case "transcript":
          setTranscript((prev) => [...prev, data]);
          break;
        case "analytics":
          setAnalytics(data);
          break;
        case "skills":
          setSkills(data);
          break;
        case "nudges":
          setNudges(data);
          break;
        default:
          console.warn("Unknown payload type", payload);
      }
    };
    socket.on("interview:update", handler);
    return () => socket.off("interview:update", handler);
  }, [socket, sessionId]);

  // Mock join – in a real interview the recruiter will receive a sessionId via UI or URL.
  // For development we allow manual entry.
  const handleJoin = () => {
    if (socket && sessionId) {
      socket.emit("joinSession", { sessionId });
      setStartTime(Date.now());
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-6">
      <h1 className="text-2xl font-bold mb-4">Recruiter Dashboard</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter Session ID"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none mr-2"
        />
        <button
          onClick={handleJoin}
          className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500 transition"
        >
          Join
        </button>
      </div>
      <StatusBar status={status} />
      <DurationTimer startTime={startTime} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <LiveTranscript transcript={transcript} />
        <AiResponses transcript={transcript} />
        <Timeline transcript={transcript} />
        <AnalyticsPanel data={analytics} />
        <SkillsPanel data={skills} />
        <NudgesPanel data={nudges} />
      </div>
    </div>
  );
}
