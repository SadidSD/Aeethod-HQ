import React from 'react';

interface Props {
  onBuild: () => void;
  onCraft: () => void;
  selectedBuilding: string | null;
  selectedDirection: string;
}

export default function ActionBar({ onBuild, onCraft, selectedBuilding, selectedDirection }: Props) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
      {selectedBuilding && (
        <div className="bg-[#111822]/95 border border-sky-500/40 px-4 py-1.5 rounded-full text-xs font-orbitron text-sky-300 shadow-lg backdrop-blur-md animate-fade-in flex items-center gap-2">
          <span>PLATING: <strong className="text-white uppercase">{selectedBuilding}</strong></span>
          <span className="text-slate-400">·</span>
          <span>DIR: <strong className="text-amber-400 uppercase">{selectedDirection}</strong> (Press Q)</span>
        </div>
      )}

      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-md shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, #131b26 0%, #0d121a 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
        }}
      >
        <button
          onClick={onBuild}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/25 hover:border-sky-400 transition-all font-orbitron text-xs font-bold text-sky-300"
        >
          <span>🏗️</span>
          <span>BUILD (B)</span>
        </button>

        <button
          onClick={onCraft}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-400 transition-all font-orbitron text-xs font-bold text-emerald-300"
        >
          <span>📦</span>
          <span>CRAFT (I)</span>
        </button>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        <div className="text-[11px] text-slate-400 font-mono px-2">
          [WASD] Move · [LMB] Mine/Place · [RMB] Deconstruct
        </div>
      </div>
    </div>
  );
}
