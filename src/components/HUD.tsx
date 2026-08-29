import { GameState } from '../core/types';
import { Globe } from 'lucide-react';

interface Props {
  state: GameState;
  onOpenMultiplayer?: () => void;
  coopConnected?: boolean;
  coopRoomId?: string | null;
  coopPlayerCount?: number;
}

export default function HUD({
  state,
  onOpenMultiplayer,
  coopConnected = false,
  coopRoomId = null,
  coopPlayerCount = 1,
}: Props) {
  const inv = state.player.inventory;

  return (
    <div className="fixed top-3 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
      {/* Top Left Title & Position */}
      <div className="bg-[#111822]/90 border border-sky-500/20 px-4 py-2 rounded-lg backdrop-blur-md shadow-lg pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🏢</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-orbitron font-bold tracking-widest text-sky-400">OFFICE AUTOMATION</h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-semibold border border-sky-500/30">
                📍 {state.activeRoom || 'Reception & Lobby'}
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              POS: ({Math.round(state.player.x / 32)}, {Math.round(state.player.y / 32)}) · TICK: {state.tick}
            </p>
          </div>
        </div>
      </div>

      {/* Top Right Resources & Co-Op Button */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onClick={onOpenMultiplayer}
          className={`px-3 py-2 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 transition backdrop-blur-md shadow-lg ${
            coopConnected
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900'
              : 'bg-[#111822]/90 border-sky-500/30 text-sky-300 hover:bg-[#1a2332]'
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>
            {coopConnected
              ? `🌐 Co-Op: ${coopPlayerCount} Online (${coopRoomId})`
              : '🌐 Go Co-Op'}
          </span>
        </button>

        <div className="bg-[#111822]/90 border border-sky-500/20 px-4 py-2 rounded-lg backdrop-blur-md shadow-lg flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span>🔩</span>
            <span className="text-slate-300">Metal:</span>
            <span className="font-bold text-sky-300">{inv.iron || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🔌</span>
            <span className="text-slate-300">Wiring:</span>
            <span className="font-bold text-amber-300">{inv.copper || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>☕</span>
            <span className="text-slate-300">Fuel:</span>
            <span className="font-bold text-emerald-300">{inv.coal || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>📦</span>
            <span className="text-slate-300">Belts:</span>
            <span className="font-bold text-purple-300">{inv.conveyor_belt || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
