// src/components/dashboard/AnalyticsPanel.jsx
import React from "react";

export default function AnalyticsPanel({ data }) {
  if (!data) {
    return (
      <div className="bg-gray-800 p-4 rounded h-48">
        <h2 className="text-lg font-semibold mb-2">Interview Analytics</h2>
        <p className="text-sm text-gray-400">No analytics data yet.</p>
      </div>
    );
  }
  const { overallScore, technicalScore, communicationScore, confidenceScore, questionsCompleted, hiringRecommendation } = data;
  return (
    <div className="bg-gray-800 p-4 rounded h-48 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2">Interview Analytics</h2>
      <ul className="space-y-1 text-sm">
        <li>Overall Score: {overallScore}</li>
        <li>Technical Score: {technicalScore}</li>
        <li>Communication Score: {communicationScore}</li>
        <li>Confidence Score: {confidenceScore}</li>
        <li>Questions Completed: {questionsCompleted}</li>
        <li>Hiring Recommendation: {hiringRecommendation}</li>
      </ul>
    </div>
  );
}
