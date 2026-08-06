// src/components/dashboard/StatusBar.jsx
import React from "react";

export default function StatusBar({ status }) {
  const color =
    status === "Listening"
      ? "bg-green-500"
      : status === "Thinking"
      ? "bg-yellow-500"
      : status === "Responding"
      ? "bg-indigo-500"
      : status === "Completed"
      ? "bg-red-500"
      : "bg-gray-600";
  return (
    <div className={`p-2 rounded ${color} text-white font-medium`}>Interview Status: {status}</div>
  );
}
