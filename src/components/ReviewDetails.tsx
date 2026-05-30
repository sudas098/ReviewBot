import React, { useState } from "react";
import { ReviewResponse } from "../types";
import { 
  Bug, 
  ShieldAlert, 
  Zap, 
  Check, 
  Copy, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Terminal
} from "lucide-react";

interface ReviewDetailsProps {
  review: ReviewResponse;
}

export default function ReviewDetails({ review }: ReviewDetailsProps) {
  const [copied, setCopied] = useState(false);
  
  // Collapsible states for lists
  const [showBugs, setShowBugs] = useState(true);
  const [showSecurity, setShowSecurity] = useState(true);
  const [showPerformance, setShowPerformance] = useState(true);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(review.rewritten_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code to clipboard", err);
    }
  };

  const bugsCount = review.bugs?.length || 0;
  const securityCount = review.security?.length || 0;
  const performanceCount = review.performance?.length || 0;

  return (
    <div className="space-y-6">
      {/* 2-Sentence Summary / Assessment card */}
      <div className="relative overflow-hidden bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 shadow-lg">
        {/* Subtle decorative glowing corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
        
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">AI Assessment</h2>
              {review.mode === "mock" && (
                <span className="text-[9px] bg-amber-500/15 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-wide">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-sm text-indigo-100 font-sans leading-relaxed antialiased">
              {review.summary || "Code state holds standard parameters."}
            </p>
          </div>
        </div>
      </div>

      {/* Main feedback grids / listings */}
      <div className="space-y-4">
        
        {/* 1. BUGS SECTION */}
        <div className="bg-gray-800/20 backdrop-blur-sm border border-red-500/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowBugs(!showBugs)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-800/30 transition-all duration-150"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
                <Bug size={16} />
              </div>
              <div>
                <h3 className="font-sans font-bold text-sm tracking-tight text-gray-200">
                  Logical Bugs & Code Fragility
                </h3>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase tracking-wider">
                  Line checks, strict assignments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                bugsCount > 0 
                  ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                  : "bg-gray-800 text-gray-500"
              }`}>
                {bugsCount} {bugsCount === 1 ? "Bug" : "Bugs"}
              </span>
              {showBugs ? (
                <ChevronUp className="text-gray-500 hover:text-gray-300" size={16} />
              ) : (
                <ChevronDown className="text-gray-500 hover:text-gray-300" size={16} />
              )}
            </div>
          </button>

          {showBugs && (
            <div className="border-t border-gray-850 p-4 space-y-3 bg-[#0d1117]/30">
              {bugsCount === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-[#0d1117]/50 text-gray-400 rounded-xl text-xs font-mono leading-relaxed border border-gray-800/50">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  No direct logic bugs detected in standard parse branches. Good job!
                </div>
              ) : (
                review.bugs.map((bug, index) => (
                  <div key={index} className="p-4 bg-gray-900/30 border border-gray-800/40 rounded-xl space-y-2.5">
                    <div className="flex items-start md:items-center justify-between gap-2 border-b border-gray-800/40 pb-2">
                      <span className="text-[11px] bg-red-500/10 text-red-400 font-mono border border-red-500/20 px-2.5 py-0.5 rounded">
                        Line: {bug.line}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase block">ISSUE #{index + 1}</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-mono text-gray-400 leading-relaxed font-medium">
                        <span className="text-red-400 font-bold uppercase tracking-wider text-[10px] mr-1">[Issue]</span> {bug.issue}
                      </p>
                      <div className="bg-emerald-500/5 p-2.5 rounded border border-emerald-500/10 text-[11px] font-mono text-emerald-400">
                        <span className="text-emerald-500 font-extrabold uppercase mr-1">[Fix]</span> {bug.fix}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 2. SECURITY SECTION */}
        <div className="bg-gray-800/20 backdrop-blur-sm border border-amber-500/15 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowSecurity(!showSecurity)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors duration-150"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <ShieldAlert size={16} />
              </div>
              <div>
                <h3 className="font-sans font-bold text-sm tracking-tight text-gray-200">
                  Security Vulnerability Audit
                </h3>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase tracking-wider">
                  Threat threats, input validation, context scopes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                securityCount > 0 
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                  : "bg-gray-800 text-gray-500"
              }`}>
                {securityCount} {securityCount === 1 ? "Alert" : "Alerts"}
              </span>
              {showSecurity ? (
                <ChevronUp className="text-gray-500 hover:text-gray-300" size={16} />
              ) : (
                <ChevronDown className="text-gray-500 hover:text-gray-300" size={16} />
              )}
            </div>
          </button>

          {showSecurity && (
            <div className="border-t border-gray-850 p-4 space-y-3 bg-[#0d1117]/30">
              {securityCount === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-[#0d1117]/50 text-gray-400 rounded-xl text-xs font-mono leading-relaxed border border-gray-800/50">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  No high-risk security flaws or vector targets surfaced. All pipelines clean.
                </div>
              ) : (
                review.security.map((sec, index) => {
                  const isHigh = sec.severity === "high";
                  const isMedium = sec.severity === "medium";
                  return (
                    <div key={index} className="p-4 bg-gray-900/30 border border-gray-800/40 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between border-b border-gray-800/40 pb-2">
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider min-w-16 text-center ${
                          isHigh 
                            ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                            : isMedium 
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}>
                          {sec.severity}
                        </span>
                        <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">THREAT #{index + 1}</span>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-mono text-gray-400 leading-relaxed font-medium">
                          <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] mr-1">[Exposure]</span> {sec.issue}
                        </p>
                        <div className="bg-emerald-500/5 p-2.5 rounded border border-emerald-500/10 text-[11px] font-mono text-emerald-400">
                          <span className="text-emerald-500 font-extrabold uppercase mr-1">[Remediation]</span> {sec.fix}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 3. PERFORMANCE SECTION */}
        <div className="bg-gray-800/20 backdrop-blur-sm border border-blue-500/15 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowPerformance(!showPerformance)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors duration-150"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <Zap size={16} />
              </div>
              <div>
                <h3 className="font-sans font-bold text-sm tracking-tight text-gray-200">
                  Performance & Execution Overhead
                </h3>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase tracking-wider">
                  Loop overheads, variable allocations, complex recursion
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                performanceCount > 0 
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                  : "bg-gray-800 text-gray-500"
              }`}>
                {performanceCount} {performanceCount === 1 ? "Advice" : "Advice"}
              </span>
              {showPerformance ? (
                <ChevronUp className="text-gray-500 hover:text-gray-300" size={16} />
              ) : (
                <ChevronDown className="text-gray-500 hover:text-gray-300" size={16} />
              )}
            </div>
          </button>

          {showPerformance && (
            <div className="border-t border-gray-850 p-4 space-y-3 bg-[#0d1117]/30">
              {performanceCount === 0 ? (
                <div className="flex items-center gap-2 p-3 bg-[#0d1117]/50 text-gray-400 rounded-xl text-xs font-mono leading-relaxed border border-gray-800/50">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  Algorithms optimized to near maximum. No execution leaks detected.
                </div>
              ) : (
                review.performance.map((perf, index) => (
                  <div key={index} className="p-4 bg-gray-900/30 border border-gray-800/40 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between border-b border-gray-800/40 pb-1.5">
                      <span className="text-[9px] text-blue-400 tracking-widest font-mono uppercase font-bold">Runtime Profile</span>
                      <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">ADVICE #{index + 1}</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-mono text-gray-400 leading-relaxed font-medium">
                        <span className="text-blue-400 font-bold uppercase tracking-wider text-[10px] mr-1">[Bottleneck]</span> {perf.issue}
                      </p>
                      <div className="bg-emerald-500/5 p-2.5 rounded border border-emerald-500/10 text-[11px] font-mono text-emerald-400">
                        <span className="text-emerald-500 font-extrabold uppercase mr-1">[Optimization]</span> {perf.suggestion}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>

      {/* 4. REWRITTEN CODE DISPLAY */}
      {review.rewritten_code && (
        <div className="bg-[#161b22]/40 backdrop-blur-md border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-[#0d1117] px-5 py-3.5 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-indigo-400" />
              <h3 className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Improved Code
              </h3>
            </div>
            
            <button
              onClick={handleCopyCode}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center gap-1.5 transition-all duration-150 border uppercase tracking-widest font-bold ${
                copied
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-gray-850 text-gray-300 hover:text-white border-gray-700 hover:bg-gray-800/40"
              }`}
            >
              {copied ? (
                <>
                  <Check size={11} className="stroke-[2.5]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={11} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="relative p-5 bg-[#0d1117] overflow-x-auto select-all max-h-[480px]">
             <pre className="font-mono text-xs text-indigo-100/90 leading-relaxed tracking-normal whitespace-pre">
               <code>{review.rewritten_code}</code>
             </pre>
          </div>
        </div>
      )}
    </div>
  );
}
