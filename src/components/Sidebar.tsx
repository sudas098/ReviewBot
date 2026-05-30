import React from "react";
import { HistoryItem } from "../types";
import { Code, Trash2, Calendar, ChevronRight } from "lucide-react";

interface SidebarProps {
  history: HistoryItem[];
  currentId: string | null;
  onSelectReview: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onDeleteReview: (id: string, e: React.MouseEvent) => void;
}

export default function Sidebar({
  history,
  currentId,
  onSelectReview,
  onClearHistory,
  onDeleteReview,
}: SidebarProps) {
  return (
    <aside className="w-full md:w-80 bg-[#161b22]/50 backdrop-blur-md border-r border-gray-800 flex flex-col h-full text-gray-200 shrink-0">
      {/* Header */}
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-extrabold text-xs tracking-tight shadow-md shadow-indigo-500/20">
            RB
          </div>
          <div>
            <h1 className="font-sans font-bold text-base tracking-tight bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              ReviewBot
            </h1>
            <p className="text-[9px] font-mono text-gray-500 font-bold tracking-wider uppercase">Active Compiler</p>
          </div>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-[10px] font-mono tracking-wider text-gray-400 hover:text-red-400 flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-800/40 border border-transparent hover:border-gray-850 transition-colors duration-150"
            title="Clear entire review history"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Review list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <h3 className="px-2 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-3">
          Recent Reviews ({history.length}/5)
        </h3>
        
        {history.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-5 border border-dashed border-gray-800/80 rounded-2xl bg-indigo-500/5">
            <Code className="text-indigo-400/30 mb-2.5 stroke-[1.5]" size={24} />
            <p className="text-xs text-gray-300 font-medium font-sans">No past reviews yet</p>
            <p className="text-[10px] text-gray-500 mt-1 max-w-[170px] leading-relaxed font-mono">
              Submit code above to generate instant reviews and auto-save
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {history.map((item) => {
              const isActive = item.id === currentId;
              const titleText = item.code.trim().split("\n")[0] || "Code Review";
              const dateObj = new Date(item.timestamp);
              const formattedDate = isNaN(dateObj.getTime()) 
                ? "Just now" 
                : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " · " + dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectReview(item)}
                  className={`group relative flex flex-col p-3.5 rounded-xl cursor-pointer border text-left transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-100 shadow-md shadow-indigo-950/20"
                      : "bg-[#161b22]/30 hover:bg-[#161b22] border-gray-800/50 hover:border-gray-700 text-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold tracking-wider uppercase ${
                      item.language.toLowerCase() === "python" 
                        ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                        : item.language.toLowerCase() === "typescript"
                        ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                        : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    }`}>
                      {item.language}
                    </span>
                    
                    <button
                      onClick={(e) => onDeleteReview(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 hover:bg-gray-850 rounded transition-all duration-150"
                      title="Delete review"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <p className="text-xs font-mono font-medium tracking-tight truncate pr-4 text-gray-200 mb-2">
                    {titleText}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-auto pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar size={10} className="text-gray-500" />
                      {formattedDate}
                    </span>
                    <ChevronRight size={12} className={`transition-transform duration-150 ${isActive ? "text-indigo-400 translate-x-1" : "text-gray-600"}`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Pro Profile Module & Powered Logo */}
      <div className="p-4 border-t border-gray-800 bg-[#0d1117]/40">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-900/50 border border-gray-800/60 mb-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0"></div>
          <div className="text-xs min-w-0">
            <p className="font-medium text-gray-200 truncate">Dev User</p>
            <p className="text-[10px] text-gray-500 font-mono">Pro Agent Plan</p>
          </div>
        </div>
        <div className="text-[9px] text-gray-600 font-mono text-center tracking-wide uppercase">
          Powered by Gemini Pro AI Review Engine
        </div>
      </div>
    </aside>
  );
}
