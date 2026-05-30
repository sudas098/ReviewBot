import React from "react";

export default function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Overview Block Skeleton */}
      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-indigo-500/10 rounded-lg w-1/4"></div>
          <div className="h-6 bg-gray-800/60 rounded-full w-20"></div>
        </div>
        <div className="space-y-2 pt-1">
          <div className="h-3 bg-gray-800/60 rounded w-full"></div>
          <div className="h-3 bg-gray-800/50 rounded w-5/6"></div>
        </div>
      </div>

      {/* Grid of Bugs, Security and Performance collapsible skeletons */}
      <div className="space-y-3">
        <div className="h-3 bg-gray-800/60 rounded w-1/6 mb-4"></div>
        
        {/* Skeleton items resembling collapsibles */}
        {[1, 2, 3].map((val) => (
          <div key={val} className="bg-gray-800/10 border border-gray-800/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 w-4/5">
              <div className="w-5 h-5 rounded-lg bg-gray-800/60 shrink-0"></div>
              <div className="space-y-1.5 w-full">
                <div className="h-3 bg-gray-800/60 rounded w-2/3"></div>
                <div className="h-2.5 bg-gray-800/40 rounded w-1/3"></div>
              </div>
            </div>
            <div className="w-4 h-4 rounded bg-gray-800/60"></div>
          </div>
        ))}
      </div>

      {/* Rewritten Code Box Skeleton */}
      <div className="bg-gray-800/15 border border-gray-800/60 rounded-2xl overflow-hidden space-y-3 shadow-lg">
        <div className="bg-gray-900/60 px-4 py-3 border-b border-gray-800/60 flex items-center justify-between">
          <div className="h-4 bg-gray-800/60 rounded w-32"></div>
          <div className="h-7 bg-gray-800/60 rounded-lg w-16"></div>
        </div>
        <div className="p-5 space-y-2.5 font-mono">
          <div className="h-3 bg-gray-800/60 rounded w-3/4"></div>
          <div className="h-3 bg-gray-800/60 rounded w-5/6"></div>
          <div className="h-3 bg-gray-800/50 rounded w-1/2"></div>
          <div className="h-3 bg-[#0d1117] rounded w-2/3"></div>
          <div className="h-3 bg-[#0d1117]/85 rounded w-4/5"></div>
        </div>
      </div>
    </div>
  );
}
