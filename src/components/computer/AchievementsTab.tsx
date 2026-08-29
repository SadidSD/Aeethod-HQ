import React from 'react';
import { AgencyState } from '../../core/agencyTypes';
import AgencyManager from '../../core/agency';

interface AchievementsTabProps {
  agency: AgencyState;
  manager: AgencyManager;
}

export default function AchievementsTab({ agency, manager }: AchievementsTabProps) {
  const achievements = agency.achievements || [];
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="p-6 space-y-6 text-slate-200 bg-[#0b1016] min-h-full">
      <div className="flex justify-between items-center bg-[#121b26] p-4 rounded-lg border border-slate-800">
        <h2 className="text-xl font-bold">Achievement Gallery</h2>
        <div className="text-cyan-400 font-medium">
          {unlockedCount} / {achievements.length} Achievements Unlocked
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {achievements.map(a => (
          <div 
            key={a.id} 
            className={`p-4 rounded-lg border flex flex-col gap-3 transition-all ${
              a.unlocked 
                ? 'bg-[#121b26] border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                : 'bg-[#0b1016] border-slate-800 opacity-50 grayscale'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{a.icon}</div>
              <div className="flex-1">
                <h3 className={`font-bold ${a.unlocked ? 'text-amber-400' : 'text-slate-300'}`}>{a.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{a.description}</p>
              </div>
            </div>

            <div className="mt-auto pt-3 border-t border-slate-800/50">
              {a.unlocked ? (
                <div className="text-xs text-amber-500 font-medium">
                  Unlocked: {a.unlockedAt ? new Date(a.unlockedAt).toLocaleDateString() : 'Yes'}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-500" 
                      style={{ width: `${Math.min((a.current / a.target) * 100, 100)}%` }} 
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {a.current} / {a.target}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {achievements.length === 0 && (
          <div className="col-span-3 text-center py-10 text-slate-500 italic">
            No achievements registered yet.
          </div>
        )}
      </div>
    </div>
  );
}
