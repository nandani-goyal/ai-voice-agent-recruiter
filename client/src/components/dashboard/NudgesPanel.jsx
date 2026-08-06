// src/components/dashboard/NudgesPanel.jsx
import React from "react";

export default function NudgesPanel({ data }) {
  if (!data) {
    return (
      <div className="bg-gray-800 p-4 rounded h-48">
        <h2 className="text-lg font-semibold mb-2">Recruiter Nudges</h2>
        <p className="text-sm text-gray-400">No nudges yet.</p>
      </div>
    );
  }
  const { followUpQuestions = [], probeSkills = [], missingTopics = [], hiringRecommendation } = data;
  return (
    <div className="bg-gray-800 p-4 rounded h-48 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2">Recruiter Nudges</h2>
      <div className="mb-2">
        <strong>Follow‑up Questions:</strong>
        <ul className="list-disc list-inside text-sm">
          {followUpQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </div>
      <div className="mb-2">
        <strong>Skills to Probe:</strong>
        <ul className="list-disc list-inside text-sm">
          {probeSkills.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
      <div className="mb-2">
        <strong>Missing Topics:</strong>
        <ul className="list-disc list-inside text-sm">
          {missingTopics.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
      <div>
        <strong>Hiring Recommendation:</strong> {hiringRecommendation}
      </div>
    </div>
  );
}
