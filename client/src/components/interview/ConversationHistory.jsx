import React from "react";
import { FaHistory, FaRobot, FaUser, FaFileAlt } from "react-icons/fa";

export default function ConversationHistory({ history }) {
  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <FaHistory className="text-sm" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Conversation History</h3>
            <p className="text-xs text-slate-400">Full Transcript of Interview Rounds</p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
          {history.length} Messages
        </span>
      </div>

      <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/40 rounded-xl border border-slate-800/60 text-slate-500 text-xs">
            No dialogue history yet. Start the interview to begin the evaluation.
          </div>
        ) : (
          history.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all ${
                msg.sender === "ai"
                  ? "bg-slate-950/80 border-indigo-500/20 text-slate-200"
                  : "bg-slate-950/40 border-slate-800 text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {msg.sender === "ai" ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                      <FaRobot /> Nova AI
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
                      <FaUser /> Candidate
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
              </div>

              <p className="text-xs leading-relaxed text-slate-200">{msg.text}</p>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <FaFileAlt className="text-indigo-400 text-[9px]" /> RAG Sources:
                  </span>
                  {msg.sources.map((src, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md"
                    >
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
