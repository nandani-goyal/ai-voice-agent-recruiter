import React from "react";
import { FaRobot, FaVolumeUp, FaStar } from "react-icons/fa";

export default function AiResponseArea({ currentAiResponse, isAiSpeaking }) {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 rounded-2xl border border-indigo-500/20 p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FaRobot className="text-lg" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-white">AI Interviewer</h3>
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <FaStar className="text-[9px]" /> RAG Grounded
              </span>
            </div>
            <p className="text-xs text-slate-400">Voice Synthesis & Response Generation</p>
          </div>
        </div>

        {isAiSpeaking && (
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-medium animate-pulse">
            <FaVolumeUp />
            <span>Speaking...</span>
          </div>
        )}
      </div>

      <div className="bg-slate-950/60 rounded-xl p-5 border border-slate-800/80 text-slate-200 text-sm leading-relaxed min-h-[110px] flex items-center">
        {currentAiResponse ? (
          <p className="font-normal text-slate-100">{currentAiResponse}</p>
        ) : (
          <p className="text-slate-500 italic text-center w-full">
            AI Interviewer is waiting for you to start the interview session...
          </p>
        )}
      </div>
    </div>
  );
}
