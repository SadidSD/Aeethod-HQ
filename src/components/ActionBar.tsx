import React from 'react';

export default function ActionBar() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md shadow-2xl border border-sky-500/20"
        style={{
          background: 'linear-gradient(180deg, rgba(19, 27, 38, 0.9) 0%, rgba(13, 18, 26, 0.9) 100%)',
        }}
      >
        <div className="text-[11px] text-slate-300 font-mono flex items-center gap-2">
          <span className="text-cyan-400 font-bold">[WASD]</span> Move
          <span className="text-slate-600">·</span>
          <span className="text-cyan-400 font-bold">[E]</span> Interact with PCs & Chairs
          <span className="text-slate-600">·</span>
          <span className="text-cyan-400 font-bold">[Space / Esc]</span> Stand Up
        </div>
      </div>
    </div>
  );
}
