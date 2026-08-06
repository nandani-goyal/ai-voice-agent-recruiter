import React from "react";
import { FaUser, FaQuoteLeft } from "react-icons/fa";

export default function CandidateTranscriptArea({ currentTranscript, isListening }) {
  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <FaUser className="text-sm" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Candidate Response</h3>
            <p className="text-xs text-slate-400">Real-time Speech Transcription</p>
          </div>
        </div>

        {isListening && (
          <span className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Live Recording</span>
          </span>
        )}
      </div>

      <div className="bg-slate-950/60 rounded-xl p-5 border border-slate-800/80 text-slate-200 text-sm leading-relaxed min-h-[110px] flex items-center relative">
        <FaQuoteLeft className="text-slate-800 text-3xl absolute top-3 left-3 pointer-events-none" />
        {currentTranscript ? (
          <p className="font-normal text-slate-100 relative z-10">{currentTranscript}</p>
        ) : (
          <p className="text-slate-500 italic text-center w-full relative z-10">
            {isListening
              ? "Listening... Speak clearly into your microphone."
              : "Your live transcript will appear here when you speak..."}
          </p>
        )}
      </div>
    </div>
  );
}
