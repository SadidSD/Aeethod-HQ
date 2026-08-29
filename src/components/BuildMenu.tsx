import { BuildingType, GameState } from '../core/types';
import { BUILDING_SIZES } from '../core/constants';
import { GameEngine } from '../core/engine';

interface Props {
  engine: GameEngine;
  state: GameState;
  onClose: () => void;
}

interface BuildOption {
  type: BuildingType;
  name: string;
  itemKey: string;
  icon: string;
  desc: string;
}

const BUILD_OPTIONS: BuildOption[] = [
  { type: 'conveyor', name: 'Conveyor Track', itemKey: 'conveyor_belt', icon: '📦', desc: 'Automates item transport between workstations' },
  { type: 'inserter', name: 'Robotic Sorter', itemKey: 'inserter_item', icon: '🦾', desc: 'Moves items into and out of machines' },
  { type: 'miner', name: 'Electric Miner', itemKey: 'miner_item', icon: '⛏️', desc: 'Automatically extracts raw resources from floor veins' },
  { type: 'furnace', name: 'Smelting Furnace', itemKey: 'furnace_item', icon: '🔥', desc: 'Smelts ores into clean metal and copper plates' },
  { type: 'assembler', name: 'Assembler Unit', itemKey: 'assembler_item', icon: '⚙️', desc: 'Fabricates complex office tech and components' },
  { type: 'storage', name: 'Supply Cabinet', itemKey: 'storage_item', icon: '🗄️', desc: 'High-capacity storage for office supplies' },
  { type: 'power_pole', name: 'Power Substation', itemKey: 'power_pole_item', icon: '⚡', desc: 'Distributes electricity across office floor zones' },
];

export default function BuildMenu({ engine, state, onClose }: Props) {
  const inv = state.player.inventory;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111822] border border-sky-500/30 rounded-xl w-full max-w-xl p-6 shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-sky-500/20">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏗️</span>
            <div>
              <h2 className="font-orbitron font-bold text-lg text-sky-400">OFFICE CONSTRUCTION MENU</h2>
              <p className="text-xs text-slate-400">Select a structure to construct on the floor grid</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {BUILD_OPTIONS.map((b) => {
            const count = inv[b.itemKey] || 0;
            const size = BUILDING_SIZES[b.type];
            const isSelected = engine.selectedBuilding === b.type;

            return (
              <button
                key={b.type}
                onClick={() => {
                  engine.selectedBuilding = isSelected ? null : b.type;
                  onClose();
                }}
                className={`flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-sky-500/20 border-sky-400 shadow-lg shadow-sky-500/10'
                    : 'bg-[#16202c]/70 border-slate-700/60 hover:border-sky-500/40 hover:bg-[#1c2938]'
                }`}
              >
                <div className="text-2xl p-2 rounded-lg bg-slate-800/80 border border-slate-700">{b.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-orbitron text-xs font-bold text-slate-200">{b.name}</h3>
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${count > 0 ? 'bg-sky-500/20 text-sky-300' : 'bg-red-500/20 text-red-400'}`}>
                      x{count}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{b.desc}</p>
                  <div className="text-[10px] font-mono text-slate-500 mt-1.5">Size: {size.w}×{size.h} tiles</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
