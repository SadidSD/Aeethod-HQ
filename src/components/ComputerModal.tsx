import { useState, useEffect, useCallback } from 'react';
import { AgencyState } from '../core/agencyTypes';
import AgencyManager from '../core/agency';
import DashboardTab from './computer/DashboardTab';
import ProjectsTab from './computer/ProjectsTab';
import TasksTab from './computer/TasksTab';
import TeamTab from './computer/TeamTab';
import FinanceTab from './computer/FinanceTab';
import QuestsTab from './computer/QuestsTab';
import AchievementsTab from './computer/AchievementsTab';

type TabId = 'dashboard' | 'projects' | 'tasks' | 'team' | 'finance' | 'quests' | 'achievements';

interface TabDef {
  id: TabId;
  label: string;
  icon: string;
  shortcut?: string;
}

const TABS: TabDef[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', shortcut: '1' },
  { id: 'projects', label: 'Projects', icon: '🚀', shortcut: '2' },
  { id: 'tasks', label: 'Tasks', icon: '📋', shortcut: '3' },
  { id: 'team', label: 'Team', icon: '👥', shortcut: '4' },
  { id: 'finance', label: 'Finance', icon: '💰', shortcut: '5' },
  { id: 'quests', label: 'Quests', icon: '⚔️', shortcut: '6' },
  { id: 'achievements', label: 'Trophies', icon: '🏆', shortcut: '7' },
];

interface ComputerModalProps {
  manager: AgencyManager;
  onClose: () => void;
}

export default function ComputerModal({ manager, onClose }: ComputerModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [agencyState, setAgencyState] = useState<AgencyState>(manager.getState());
  const [currentTime, setCurrentTime] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Refresh state from manager (called after mutations)
  const refresh = useCallback(() => {
    setAgencyState({ ...manager.getState() });

    // Check for newly unlocked achievements
    const newAchievements = manager.checkAchievements();
    if (newAchievements.length > 0) {
      setNotification(`🏆 Achievement Unlocked: ${newAchievements[0].title}!`);
      setTimeout(() => setNotification(null), 4000);
    }
  }, [manager]);

  // Clock
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      const tab = TABS.find(t => t.shortcut === e.key);
      if (tab) setActiveTab(tab.id);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Level / XP info
  const { agency } = agencyState;
  const nextLevelXP = (agency.level + 1) * (agency.level + 1) * 100;
  const prevLevelXP = agency.level * agency.level * 100;
  const xpProgress = agency.totalXP - prevLevelXP;
  const xpNeeded = nextLevelXP - prevLevelXP;
  const xpPercent = Math.min(100, Math.round((xpProgress / xpNeeded) * 100));

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab agency={agencyState} manager={manager} onNavigateTab={(tab) => setActiveTab(tab)} onRefresh={refresh} />;
      case 'projects':
        return <ProjectsTab agency={agencyState} manager={manager} onRefresh={refresh} />;
      case 'tasks':
        return <TasksTab agency={agencyState} manager={manager} onRefresh={refresh} />;
      case 'team':
        return <TeamTab agency={agencyState} manager={manager} onRefresh={refresh} />;
      case 'finance':
        return <FinanceTab agency={agencyState} manager={manager} onRefresh={refresh} />;
      case 'quests':
        return <QuestsTab agency={agencyState} manager={manager} onRefresh={refresh} />;
      case 'achievements':
        return <AchievementsTab agency={agencyState} manager={manager} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-2 sm:p-4">
      <div className="relative w-full max-w-7xl h-[92vh] max-h-[920px] bg-[#080d14] border border-cyan-500/40 rounded-xl shadow-[0_0_80px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden text-slate-200">

        {/* === TITLE BAR === */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#101820] border-b border-cyan-500/20 select-none shrink-0">
          <div className="flex items-center gap-3">
            {/* Traffic lights */}
            <div className="flex gap-1.5">
              <button onClick={onClose} className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-400 cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
              <span className="text-cyan-400 font-bold text-sm tracking-widest">AEETHOD FACTORY</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50 font-mono">OS v2.0</span>
            </div>

            {/* Level badge */}
            <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-[#172030] rounded-lg border border-slate-700/50">
              <span className="text-amber-400 text-sm">👑</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 leading-none">Level {agency.level}</span>
                <div className="w-20 h-1.5 bg-slate-700 rounded-full mt-0.5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" style={{ width: `${xpPercent}%` }} />
                </div>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">{xpProgress}/{xpNeeded} XP</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            {/* Streak */}
            {agencyState.streaks.current > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-950/50 rounded border border-orange-800/40">
                <span className="text-orange-400">🔥</span>
                <span className="text-orange-300 font-mono font-bold">{agencyState.streaks.current} day streak</span>
              </div>
            )}

            {/* System status */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-mono text-[10px]">ONLINE</span>
            </div>

            <span className="font-mono text-slate-400 text-[11px]">{currentTime}</span>

            <button onClick={onClose} className="px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-200 border border-slate-700 text-[10px] font-semibold transition-colors">
              ESC
            </button>
          </div>
        </div>

        {/* === NOTIFICATION TOAST === */}
        {notification && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-amber-900/90 border border-amber-500 rounded-xl text-amber-100 font-bold text-sm shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-bounce">
            {notification}
          </div>
        )}

        {/* === MAIN CONTENT === */}
        <div className="flex-1 flex overflow-hidden">

          {/* Sidebar Navigation */}
          <div className="w-48 bg-[#0e1620] border-r border-slate-800/80 flex flex-col py-2 px-2 gap-0.5 select-none shrink-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.shortcut && (
                  <span className={`ml-auto text-[9px] font-mono px-1 py-0.5 rounded ${
                    activeTab === tab.id ? 'bg-cyan-800/40 text-cyan-400' : 'bg-slate-800 text-slate-500'
                  }`}>{tab.shortcut}</span>
                )}
              </button>
            ))}

            {/* Agency stats footer */}
            <div className="mt-auto mx-1 p-2.5 bg-slate-900/50 rounded-lg border border-slate-800/50 text-[10px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Revenue</span>
                <span className="font-mono text-emerald-400">${agencyState.resources.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Projects</span>
                <span className="font-mono text-cyan-400">{agencyState.stats.totalProjectsShipped} shipped</span>
              </div>
              <div className="flex justify-between">
                <span>Tasks</span>
                <span className="font-mono text-slate-300">{agencyState.stats.totalTasksCompleted} done</span>
              </div>
              <div className="flex justify-between">
                <span>Team</span>
                <span className="font-mono text-slate-300">{agencyState.team.length} members</span>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-[#0a0f14] overflow-y-auto">
            <div className="p-5">
              {renderTab()}
            </div>
          </div>
        </div>

        {/* === FOOTER === */}
        <div className="px-4 py-1.5 bg-[#0e1620] border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-500 select-none shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              AEETHOD FACTORY OS • Management Workstation
            </span>
            <span className="text-slate-600">|</span>
            <span>Auto-saved {new Date(agencyState.savedAt).toLocaleTimeString()}</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-semibold transition-colors cursor-pointer"
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
}
