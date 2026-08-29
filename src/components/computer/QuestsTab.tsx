import { AgencyState } from '../../core/agencyTypes';
import AgencyManager from '../../core/agency';

interface QuestsTabProps {
  agency: AgencyState;
  manager: AgencyManager;
  onRefresh: () => void;
}

export default function QuestsTab({ agency, manager, onRefresh }: QuestsTabProps) {
  
  const generateDaily = () => {
    manager.generateDailyQuests();
    onRefresh();
  };

  const generateWeekly = () => {
    manager.generateWeeklyQuests();
    onRefresh();
  };

  const renderQuests = (type: 'daily' | 'weekly' | 'epic') => {
    const quests = (agency.quests || []).filter(q => q.type === type);
    if (!quests.length) {
      return (
        <div className="p-4 bg-[#121b26]/50 border border-slate-800/80 rounded-lg text-sm text-slate-500 italic text-center">
          No {type} quests active. Click "Generate {type.charAt(0).toUpperCase() + type.slice(1)}" above to refresh your mission board!
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {quests.map(q => (
          <div key={q.id} className={`p-4 rounded-lg border transition ${q.completed ? 'bg-slate-900/60 border-slate-800/50 opacity-60' : 'bg-[#121b26] border-slate-800 hover:border-slate-700'}`}>
            <div className="flex justify-between items-start mb-1.5">
              <div className="flex gap-2 items-center">
                {q.completed ? <span className="text-emerald-400">✅</span> : <span className="text-amber-400">⚔️</span>}
                <span className={`font-semibold text-sm ${q.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>{q.title}</span>
              </div>
              <span className="text-cyan-400 text-xs font-mono font-bold px-2 py-0.5 bg-cyan-950/60 border border-cyan-800/50 rounded">+{q.xpReward} XP</span>
            </div>
            <div className="text-xs text-slate-400 mb-3">{q.description}</div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${q.completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`} 
                  style={{ width: `${Math.min((q.progress / (q.target || 1)) * 100, 100)}%` }} 
                />
              </div>
              <span className="text-xs font-mono text-slate-400 shrink-0">{q.progress} / {q.target}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 text-slate-200 bg-[#0b1016] min-h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Agency Quest Log</h2>
          <p className="text-xs text-slate-400">Complete operations to gain agency XP, boost morale, and level up</p>
        </div>
        <div className="flex gap-2">
          <button onClick={generateDaily} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs font-medium border border-slate-700 transition cursor-pointer">
            🔄 New Dailies
          </button>
          <button onClick={generateWeekly} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs font-medium border border-slate-700 transition cursor-pointer">
            🔄 New Weeklies
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3 border-b border-slate-800 pb-2 text-cyan-400 flex items-center gap-2">
          <span>⚡ Daily Directives</span>
          <span className="text-[10px] text-slate-500 font-normal font-mono">Resets every 24 hours</span>
        </h3>
        {renderQuests('daily')}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3 border-b border-slate-800 pb-2 text-blue-400 flex items-center gap-2">
          <span>📅 Weekly Objectives</span>
          <span className="text-[10px] text-slate-500 font-normal font-mono">Sprint-level goals</span>
        </h3>
        {renderQuests('weekly')}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3 border-b border-slate-800 pb-2 text-purple-400 flex items-center gap-2">
          <span>👑 Epic Milestones</span>
          <span className="text-[10px] text-slate-500 font-normal font-mono">Long-term agency growth</span>
        </h3>
        {renderQuests('epic')}
      </div>
    </div>
  );
}
