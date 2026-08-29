import { GameState } from '../core/types';

interface Props {
  state: GameState;
  onOpenProfile?: () => void;
  playerName?: string;
  playerRole?: string;
  playerAura?: string;
  onlineCount?: number;
  roomId?: string | null;
}

export default function HUD({
  state,
  onOpenProfile,
  playerName = 'Sadid',
  playerRole = 'Founder',
  playerAura = '#f59e0b',
  onlineCount = 1,
  roomId = 'AEETHOD-HQ',
}: Props) {
  const inv = state.player.inventory;

  const roleIcons: Record<string, string> = {
    Founder: '👑',
    Developer: '🧑‍💻',
    Designer: '🎨',
    Marketer: '🤝',
    Guest: '👤',
  };
  const roleIcon = roleIcons[playerRole] || '🧑‍💻';

  return (
    <div className="fixed top-3 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
      {/* Top Left Title & Position */}
      <div className="bg-[#111822]/90 border border-sky-500/20 px-4 py-2 rounded-xl backdrop-blur-md shadow-lg pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🏢</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-orbitron font-bold tracking-widest text-sky-400">AEETHOD HQ</h1>
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

      {/* Top Right: Player Character Badge & Resources */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Character Profile & Live Status Badge */}
        <button
          onClick={onOpenProfile}
          className="px-3.5 py-2 rounded-xl border border-slate-700/80 bg-[#0d141f]/95 hover:border-emerald-500/70 text-slate-200 font-mono text-xs font-bold flex items-center gap-2 transition backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.4)] group"
          title="Click to customize character name, role, and gear"
        >
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: playerAura }}
          />
          <span className="text-sm">{roleIcon}</span>
          <span className="text-slate-100 font-bold group-hover:text-emerald-300 transition">
            {playerName}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
            {playerRole}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <span>🟢</span>
            <span>{onlineCount} Online</span>
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
