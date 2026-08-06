import React from "react";
import { FaRobot, FaCircle, FaShieldAlt } from "react-icons/fa";

export default function Header({ isInterviewStarted, isListening }) {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/30">
              <FaRobot className="text-white text-2xl" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  isListening
                    ? "bg-emerald-400 opacity-75"
                    : isInterviewStarted
                    ? "bg-indigo-400 opacity-75"
                    : "bg-slate-400 opacity-40"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-4 w-4 border-2 border-slate-900 ${
                  isListening
                    ? "bg-emerald-500"
                    : isInterviewStarted
                    ? "bg-indigo-500"
                    : "bg-slate-500"
                }`}
              ></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Nova AI Recruiter
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Voice Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Technical Assessment</span>
              <span>•</span>
              <span className="text-indigo-400 font-medium">Software Engineer Position</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <FaShieldAlt className="text-indigo-400" />
            <span>Encrypted Audio</span>
          </div>

          <div
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border ${
              isListening
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                : isInterviewStarted
                ? "bg-indigo-950/40 border-indigo-500/30 text-indigo-300"
                : "bg-slate-800/60 border-slate-700/50 text-slate-400"
            }`}
          >
            <FaCircle
              className={`text-[8px] ${
                isListening
                  ? "text-emerald-400 animate-pulse"
                  : isInterviewStarted
                  ? "text-indigo-400"
                  : "text-slate-500"
              }`}
            />
            <span>
              {isListening
                ? "Listening to Candidate..."
                : isInterviewStarted
                ? "Interview In Progress"
                : "Ready to Start"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
