import { GameState } from '../core/types';
import { RECIPES } from '../core/constants';
import { GameEngine } from '../core/engine';

interface Props {
  engine: GameEngine;
  state: GameState;
  onClose: () => void;
}

export default function InventoryMenu({ engine, state, onClose }: Props) {
  const inv = state.player.inventory;

  const craftItem = (recipeId: string) => {
    const r = RECIPES[recipeId];
    if (!r) return;

    // Check if player has inputs
    for (const [inKey, inQty] of Object.entries(r.inputs)) {
      if ((inv[inKey] || 0) < inQty) return;
    }

    // Deduct inputs
    for (const [inKey, inQty] of Object.entries(r.inputs)) {
      inv[inKey] -= inQty;
    }

    // Add outputs
    for (const [outKey, outQty] of Object.entries(r.outputs)) {
      inv[outKey] = (inv[outKey] || 0) + outQty;
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm font-exo">
      <div className="bg-[#111822] border border-sky-500/30 rounded-xl w-full max-w-3xl p-6 shadow-2xl animate-fade-in flex flex-col gap-5">
        <div className="flex justify-between items-center pb-3 border-b border-sky-500/20">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <div>
              <h2 className="font-orbitron font-bold text-lg text-sky-400">EXECUTIVE INVENTORY & WORKBENCH</h2>
              <p className="text-xs text-slate-400">Manage office supplies and fabricate factory equipment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inventory Items */}
          <div>
            <h3 className="font-orbitron text-xs font-bold text-slate-300 mb-3 tracking-wider flex items-center gap-2">
              <span>🎒</span> SUPPLY STORAGE
            </h3>
            <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
              {Object.entries(inv).map(([item, qty]) => {
                if (qty <= 0) return null;
                return (
                  <div
                    key={item}
                    className="bg-[#18222e] border border-slate-700/60 p-2.5 rounded-lg flex flex-col items-center justify-center text-center"
                  >
                    <span className="text-sm font-bold text-slate-200 capitalize">{item.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-mono font-bold text-sky-400 mt-1">x{qty}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hand Crafting Recipes */}
          <div>
            <h3 className="font-orbitron text-xs font-bold text-slate-300 mb-3 tracking-wider flex items-center gap-2">
              <span>🛠️</span> HAND FABRICATION
            </h3>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {Object.values(RECIPES).map((r) => {
                const canCraft = Object.entries(r.inputs).every(([k, v]) => (inv[k] || 0) >= v);

                return (
                  <button
                    key={r.id}
                    onClick={() => craftItem(r.id)}
                    disabled={!canCraft}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      canCraft
                        ? 'bg-[#1a2533] border-sky-500/40 hover:bg-[#203042] hover:border-sky-400 cursor-pointer'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <div className="font-orbitron text-xs font-bold text-slate-200">{r.name}</div>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        Cost: {Object.entries(r.inputs).map(([k, v]) => `${k} x${v}`).join(', ')}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${canCraft ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-600'}`}>
                      Craft
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
