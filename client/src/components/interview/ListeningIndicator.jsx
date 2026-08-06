import React from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

export default function ListeningIndicator({ isListening, isInterviewStarted, recordingDuration, chunksRecorded }) {
  const bars = [40, 75, 50, 90, 65, 30, 85, 45, 95, 60, 80, 35];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`rounded-2xl p-5 border transition-all duration-300 ${
        isListening
          ? "bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20"
          : isInterviewStarted
          ? "bg-slate-900/60 border-slate-800"
          : "bg-slate-900/30 border-slate-800/60 opacity-60"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isListening
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700/50"
            }`}
          >
            {isListening ? (
              <FaMicrophone className="animate-bounce" />
            ) : (
              <FaMicrophoneSlash />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              {isListening
                ? "Recording..."
                : isInterviewStarted
                ? "Microphone Standby"
                : "Microphone Inactive"}
            </h4>
            <p className="text-xs text-slate-400">
              {isListening
                ? "Capturing voice input for real-time transcription..."
                : isInterviewStarted
                ? "Click 'Start Recording' to respond"
                : "Start interview session to enable mic"}
            </p>
          </div>
        </div>

        {isListening && (
          <div className="flex items-center gap-4 bg-emerald-950/40 px-4 py-2 rounded-lg border border-emerald-500/20">
            <div className="flex flex-col">
              <span className="text-[10px] text-emerald-500/70 uppercase font-bold tracking-wider">Duration</span>
              <span className="text-emerald-400 font-mono text-sm">{formatTime(recordingDuration)}</span>
            </div>
            <div className="w-px h-8 bg-emerald-500/20"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-emerald-500/70 uppercase font-bold tracking-wider">Chunks</span>
              <span className="text-emerald-400 font-mono text-sm">{chunksRecorded}</span>
            </div>
            
            <div className="flex items-center space-x-1.5 h-8 px-2 ml-2">
              {bars.map((height, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 bg-gradient-to-t from-emerald-500 to-teal-400 animate-pulse`}
                  style={{
                    height: `${Math.max(20, (height * (i % 3 + 1)) % 100)}%`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
