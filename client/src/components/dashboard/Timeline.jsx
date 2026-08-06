// src/components/dashboard/Timeline.jsx
import React from "react";

export default function Timeline({ transcript }) {
  return (
    <div className="bg-gray-800 p-4 rounded h-48 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2">Conversation Timeline</h2>
      <ul className="space-y-1 text-sm">
        {transcript.map((msg, idx) => (
          <li key={idx} className={msg.speaker === "ai" ? "text-indigo-300" : "text-green-300"}>
            <span className="font-medium">{msg.speaker === "ai" ? "AI" : "Candidate"}:</span> {msg.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
