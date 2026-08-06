// src/components/dashboard/AiResponses.jsx
import React from "react";

export default function AiResponses({ transcript }) {
  const aiMessages = transcript.filter((msg) => msg.speaker === "ai");
  return (
    <div className="bg-gray-800 p-4 rounded h-64 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2">AI Responses</h2>
      <ul className="space-y-1 text-sm">
        {aiMessages.map((msg, idx) => (
          <li key={idx} className="text-indigo-300">
            {msg.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
