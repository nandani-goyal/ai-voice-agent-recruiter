// src/components/dashboard/SkillsPanel.jsx
import React from "react";

export default function SkillsPanel({ data }) {
  if (!data) {
    return (
      <div className="bg-gray-800 p-4 rounded h-48">
        <h2 className="text-lg font-semibold mb-2">Skills Analysis</h2>
        <p className="text-sm text-gray-400">No skill data yet.</p>
      </div>
    );
  }
  const { detectedSkills = [], missingSkills = [], skillConfidence = {} } = data;
  return (
    <div className="bg-gray-800 p-4 rounded h-48 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2">Skills Analysis</h2>
      <div className="mb-2">
        <strong>Detected Skills:</strong>
        <ul className="list-disc list-inside text-sm">
          {detectedSkills.map((skill, i) => (
            <li key={i}>{skill} (confidence: {skillConfidence[skill] ?? "N/A"})</li>
          ))}
        </ul>
      </div>
      <div>
        <strong>Missing Skills:</strong>
        <ul className="list-disc list-inside text-sm">
          {missingSkills.map((skill, i) => (
            <li key={i}>{skill}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
