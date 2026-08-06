import React from "react";
import { FaPlay, FaSquare, FaMicrophone, FaStopCircle, FaRedo } from "react-icons/fa";

export default function Controls({
  isInterviewStarted,
  isListening,
  onStartInterview,
  onStopRecording,
  onToggleListening,
  onEndInterview,
}) {
  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {!isInterviewStarted ? (
          <button
            onClick={onStartInterview}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <FaPlay className="text-xs" />
            <span>Start Interview</span>
          </button>
        ) : (
          <button
            onClick={onEndInterview}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white transition-all cursor-pointer"
          >
            <FaStopCircle className="text-sm text-rose-400" />
            <span>End Session</span>
          </button>
        )}

        {isInterviewStarted && (
          <button
            onClick={isListening ? onStopRecording : onToggleListening}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md cursor-pointer ${
              isListening
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
            }`}
          >
            {isListening ? (
              <>
                <FaSquare className="text-xs" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <FaMicrophone className="text-sm" />
                <span>Start Recording</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="text-xs text-slate-400 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
        <span>
          {!isInterviewStarted
            ? "Click 'Start Interview' to initiate the Nova AI assessment session."
            : isListening
            ? "Microphone is recording your response. Click 'Stop Recording' when finished."
            : "Click 'Start Recording' when ready to answer the AI's question."}
        </span>
      </div>
    </div>
  );
}
