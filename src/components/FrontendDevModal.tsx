import { useState, useEffect } from 'react';
import { AgencyState, AgencyTask, CognitiveLoad } from '../core/agencyTypes';
import AgencyManager from '../core/agency';

interface FrontendDevModalProps {
  agency: AgencyState;
  manager: AgencyManager;
  onClose: () => void;
  onRefresh: () => void;
}

interface SubtaskItem {
  id: string;
  title: string;
  status: 'done' | 'in_progress' | 'waiting' | 'pending';
  timeLabel: string;
}

interface QuickTaskItem {
  id: string;
  title: string;
  tag: string;
  color: 'red' | 'yellow' | 'blue' | 'green';
  estimate: string;
  energyLevel: 'high' | 'medium' | 'low';
  xp: number;
}

type TabId = 'mission' | 'tasks' | 'skills' | 'bosses' | 'portfolio' | 'analytics' | 'settings';

interface TabDef {
  id: TabId;
  label: string;
  icon: string;
  shortcut: string;
}

const TABS: TabDef[] = [
  { id: 'mission', label: 'Today’s Mission', icon: '🔥', shortcut: '1' },
  { id: 'tasks', label: 'Quick Tasks', icon: '🎯', shortcut: '2' },
  { id: 'skills', label: 'Skills & Tree', icon: '🧠', shortcut: '3' },
  { id: 'bosses', label: 'Boss Battles', icon: '🏆', shortcut: '4' },
  { id: 'portfolio', label: 'Shipped Work', icon: '🏛️', shortcut: '5' },
  { id: 'analytics', label: 'Daily Progress', icon: '📊', shortcut: '6' },
  { id: 'settings', label: 'Environment', icon: '⚙️', shortcut: '7' },
];

export default function FrontendDevModal({ agency, manager, onClose, onRefresh }: FrontendDevModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('mission');

  // Employee info
  const frontendMember = agency.team.find(m => m.id === 'frontend' || m.room === 'dev') || {
    name: 'Alex Rivera',
    level: 8,
    xp: 240,
    status: 'working'
  };

  // Find linked active project / tasks
  const myAssignedTasks = agency.tasks.filter(t => t.assignedTo === 'frontend' || t.assignedTo === (frontendMember as any).id);
  const activeAgencyTask = myAssignedTasks.find(t => t.status === 'active') || myAssignedTasks[0];
  const linkedProject = activeAgencyTask?.projectId ? agency.projects.find(p => p.id === activeAgencyTask.projectId) : agency.projects[0];

  // Dynamic Notification Toast
  const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);

  const showToast = (message: string, icon = '✨') => {
    setNotification({ message, icon });
    setTimeout(() => setNotification(null), 3500);
  };

  // Mission State
  const [isPaused, setIsPaused] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([
    { id: 'st-1', title: 'Write endpoint architecture & query hooks', status: 'done', timeLabel: '2h ago' },
    { id: 'st-2', title: 'Test client response validation & edge cases', status: 'in_progress', timeLabel: '45 min' },
    { id: 'st-3', title: 'Document API interfaces & payload specs', status: 'waiting', timeLabel: '-' },
    { id: 'st-4', title: 'Code review & PR sync with Design room', status: 'pending', timeLabel: '15 min' },
  ]);

  // Today's Progress State
  const [tasksDoneCount, setTasksDoneCount] = useState(4);
  const [tasksTotalCount, setTasksTotalCount] = useState(6);
  const [todayXP, setTodayXP] = useState(240);
  const maxTodayXP = 400;
  const [levelProgress, setLevelProgress] = useState(80);
  const [streakDays, setStreakDays] = useState(12);
  const [focusTimeMinutes, setFocusTimeMinutes] = useState(252); // 4h 12m

  // Energy / Mood State
  const [energyLevel, setEnergyLevel] = useState<'high' | 'medium' | 'low'>('high');

  // Quick Tasks State
  const [quickTasks, setQuickTasks] = useState<QuickTaskItem[]>([
    { id: 'qt-1', title: 'Fix Mobile Nav Bug', tag: 'Fix Bug', color: 'red', estimate: '15m', energyLevel: 'high', xp: 35 },
    { id: 'qt-2', title: 'Review Payment Modal PR', tag: 'Code Review', color: 'yellow', estimate: '30m', energyLevel: 'medium', xp: 50 },
    { id: 'qt-3', title: 'Document Design Tokens', tag: 'Doc', color: 'blue', estimate: '20m', energyLevel: 'low', xp: 25 },
    { id: 'qt-4', title: 'Update Component Library', tag: 'Update', color: 'green', estimate: '45m', energyLevel: 'medium', xp: 60 },
    { id: 'qt-5', title: 'Optimize Bundle & Tree Shaking', tag: 'Optimize', color: 'red', estimate: '25m', energyLevel: 'high', xp: 45 },
    { id: 'qt-6', title: 'Write E2E Auth Test Specs', tag: 'Testing', color: 'blue', estimate: '30m', energyLevel: 'low', xp: 30 },
  ]);

  // Modal Popups for Quick Actions
  const [activeModalAction, setActiveModalAction] = useState<'newTask' | null>(null);
  const [newTaskInput, setNewTaskInput] = useState({ title: '', estimate: '20m', tag: 'Feature', energy: 'medium' });

  // Keyboard Shortcuts (1-7 for tabs, Escape for close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModalAction) {
          setActiveModalAction(null);
        } else {
          onClose();
        }
        return;
      }

      // If typing in input, skip shortcuts
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      const num = parseInt(e.key);
      if (num >= 1 && num <= TABS.length) {
        setActiveTab(TABS[num - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, activeModalAction]);

  // Toggle Subtask Completion
  const toggleSubtask = (id: string) => {
    setSubtasks(prev =>
      prev.map(st => {
        if (st.id === id) {
          const nextStatus = st.status === 'done' ? 'in_progress' : 'done';
          if (nextStatus === 'done') {
            setTodayXP(x => Math.min(x + 20, maxTodayXP));
            showToast('Subtask completed! +20 XP awarded ⚡', '⚡');
          }
          return { ...st, status: nextStatus, timeLabel: nextStatus === 'done' ? 'Just now' : 'In progress' };
        }
        return st;
      })
    );
  };

  // Complete a Quick Task
  const completeQuickTask = (task: QuickTaskItem) => {
    setQuickTasks(prev => prev.filter(t => t.id !== task.id));
    setTasksDoneCount(c => c + 1);
    setTodayXP(x => Math.min(x + task.xp, maxTodayXP));
    manager.addXP(task.xp);
    showToast(`Completed: ${task.title}! +${task.xp} XP 🌟`, '🏆');
    onRefresh();
  };

  // Filter Quick Tasks by Energy
  const filteredQuickTasks = quickTasks.filter(t => energyLevel === 'high' || t.energyLevel === energyLevel || t.energyLevel === 'low');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[920px] bg-[#0c1017] border border-pink-500/40 rounded-2xl shadow-[0_0_80px_rgba(244,114,182,0.25)] flex flex-col overflow-hidden text-slate-200 font-sans">
        
        {/* Dynamic Notification Toast */}
        {notification && (
          <div className="fixed top-6 right-8 z-[80] px-4 py-2.5 bg-pink-950/95 border border-pink-500 rounded-xl shadow-[0_0_30px_rgba(244,114,182,0.4)] text-pink-200 text-xs font-bold font-mono animate-in fade-in slide-in-from-top-2 flex items-center gap-2.5">
            <span className="text-base">{notification.icon}</span>
            <span>{notification.message}</span>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TOP HUD HEADER BAR
            ════════════════════════════════════════════════════════════════════ */}
        <div className="px-6 py-3.5 bg-[#121824] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-950/80 border border-pink-500/50 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(244,114,182,0.3)]">
              🌸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-slate-100 tracking-wider font-mono uppercase">
                  FRONTEND DEVELOPER — <span className="text-pink-400 font-bold">{frontendMember.name.toUpperCase()} (HELLO KITTY)</span>
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-pink-950 text-pink-400 border border-pink-700/60">
                  LEVEL {frontendMember.level || 8}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                <span>📅 March 15, 2026</span>
                <span className="text-slate-600">•</span>
                <span>⏰ 10:23 AM</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  STATUS: WORKING
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono bg-[#090d14] px-3.5 py-1.5 rounded-xl border border-pink-900/50 text-slate-300">
              <span className="text-amber-400 font-bold">🔥 {streakDays}-Day Streak</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-300 font-bold">⭐ {todayXP}/{maxTodayXP} XP</span>
              <span className="text-slate-600">|</span>
              <span className="text-purple-300 font-bold">🏆 23 Bosses</span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            BODY WITH LEFT-SIDE NAVIGATION BAR + MAIN CONTENT
            ════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* ────────────────────────────────────────────────────────────────
              LEFT-SIDE NAVIGATION SIDEBAR
              ──────────────────────────────────────────────────────────────── */}
          <div className="w-56 bg-[#080c12] border-r border-slate-800 p-3.5 flex flex-col justify-between shrink-0">
            <div className="space-y-1.5">
              <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Workstation Tabs
              </div>
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs font-bold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-950/80 to-pink-900/30 text-pink-300 border border-pink-500/60 shadow-[0_0_20px_rgba(244,114,182,0.2)]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#121824]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      isActive ? 'bg-pink-950 border-pink-700 text-pink-300' : 'bg-slate-900 border-slate-800 text-slate-600'
                    }`}>
                      {tab.shortcut}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Status Card */}
            <div className="p-3 bg-[#0d1420] border border-pink-900/40 rounded-xl font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>FOCUS TIME</span>
                <span className="text-emerald-400 font-bold">4h 12m</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-pink-500 to-cyan-400" style={{ width: '80%' }} />
              </div>
              <span className="text-[10px] text-pink-400/80 font-bold block text-center">
                ✨ +20 XP on next task
              </span>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────
              MAIN CONTENT TAB AREA
              ──────────────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-5 bg-[#070a0f] space-y-4">

            {/* ════════════ TAB 1: MISSION & SPRINT ════════════ */}
            {activeTab === 'mission' && (
              <div className="space-y-4 animate-in fade-in">
                {/* Active Mission Banner */}
                <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <span>🔥</span> TODAY'S MISSION:
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-pink-950/70 border border-pink-700/50 text-pink-300 text-xs font-bold">
                        💼 Project: {linkedProject ? linkedProject.name : 'CardVault AI Platform'} (${linkedProject?.value?.toLocaleString() || '12,000'})
                      </span>
                    </div>
                    <span className="text-xs font-mono text-cyan-300 font-bold">⏳ 25% Complete</span>
                  </div>

                  <h2 className="text-base font-black text-slate-100 font-mono tracking-wide mb-3">
                    {activeAgencyTask?.title || 'PostgreSQL Schema & Buylist Engine API'}
                  </h2>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${(subtasks.filter(s => s.status === 'done').length / subtasks.length) * 100}%` }}
                    />
                  </div>

                  {/* Subtasks Checklist */}
                  <div className="space-y-2 font-mono text-xs mb-4">
                    {subtasks.map(st => (
                      <div
                        key={st.id}
                        onClick={() => toggleSubtask(st.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          st.status === 'done'
                            ? 'bg-[#0a141c] border-emerald-800/50 text-slate-400 line-through'
                            : st.status === 'in_progress'
                            ? 'bg-[#121c2a] border-cyan-500/50 text-slate-100 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                            : 'bg-[#080d14] border-slate-800/80 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">
                            {st.status === 'done' ? '✅' : st.status === 'in_progress' ? '🔄' : st.status === 'waiting' ? '⏳' : '📝'}
                          </span>
                          <span className={st.status === 'done' ? 'text-slate-400 font-normal' : 'font-bold'}>
                            {st.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            st.status === 'done' ? 'bg-emerald-950 text-emerald-300' :
                            st.status === 'in_progress' ? 'bg-cyan-950 text-cyan-300' :
                            st.status === 'waiting' ? 'bg-amber-950 text-amber-300' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            [{st.status.toUpperCase().replace('_', ' ')}]
                          </span>
                          <span className="text-slate-500 text-[11px] w-16 text-right">{st.timeLabel}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 font-mono text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsPaused(!isPaused);
                          showToast(isPaused ? 'Mission Resumed ▶️' : 'Mission Paused ⏸️', isPaused ? '▶️' : '⏸️');
                        }}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition flex items-center gap-1.5"
                      >
                        <span>{isPaused ? '▶️' : '⏸️'}</span>
                        <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsBlocked(!isBlocked);
                          showToast(isBlocked ? 'Blocker Cleared ✅' : 'Blocker reported to Lead! 🚨', '🚨');
                        }}
                        className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                          isBlocked ? 'bg-rose-600 text-white' : 'bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300'
                        }`}
                      >
                        <span>🚨</span>
                        <span>REPORT BLOCKER</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setTodayXP(x => Math.min(x + 100, maxTodayXP));
                        manager.addXP(100);
                        showToast('🎉 Mission Completed! +100 XP awarded!', '🏆');
                        onRefresh();
                      }}
                      className="px-5 py-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white rounded-xl transition shadow-[0_0_20px_rgba(244,114,182,0.4)] flex items-center gap-2"
                    >
                      <span>✨</span>
                      <span>COMPLETE MISSION</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════ TAB 2: QUICK TASKS & BACKLOG ════════════ */}
            {activeTab === 'tasks' && (
              <div className="space-y-4 animate-in fade-in">
                {/* Energy Filter */}
                <div className="p-3.5 bg-[#0d1522] border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400 font-bold">😊 How Are You Feeling?</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500 text-[11px]">Tasks adapt to your energy level</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <button
                      onClick={() => setEnergyLevel('high')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                        energyLevel === 'high'
                          ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                          : 'bg-[#14202e] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>🔋</span> High Energy
                    </button>
                    <button
                      onClick={() => setEnergyLevel('medium')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                        energyLevel === 'medium'
                          ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                          : 'bg-[#14202e] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>😊</span> Medium
                    </button>
                    <button
                      onClick={() => setEnergyLevel('low')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                        energyLevel === 'low'
                          ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                          : 'bg-[#14202e] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>😴</span> Low Energy
                    </button>
                  </div>
                </div>

                {/* Quick Task Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono">
                  {filteredQuickTasks.map(task => {
                    const tagCol = {
                      red: 'border-rose-600/50 bg-rose-950/40 text-rose-300',
                      yellow: 'border-amber-600/50 bg-amber-950/40 text-amber-300',
                      blue: 'border-cyan-600/50 bg-cyan-950/40 text-cyan-300',
                      green: 'border-emerald-600/50 bg-emerald-950/40 text-emerald-300',
                    }[task.color];

                    return (
                      <div
                        key={task.id}
                        onClick={() => completeQuickTask(task)}
                        className={`p-3.5 rounded-xl border ${tagCol} hover:scale-[1.02] cursor-pointer transition flex flex-col justify-between gap-3 group`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
                            <span className="uppercase px-1.5 py-0.5 rounded bg-black/40 border border-slate-700">
                              {task.tag}
                            </span>
                            <span className="text-amber-400 font-bold">+{task.xp} XP</span>
                          </div>
                          <h3 className="text-xs font-bold text-slate-100 group-hover:text-pink-300 transition">
                            {task.title}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                          <span>⏱️ {task.estimate}</span>
                          <span className="text-emerald-400 group-hover:underline text-[10px] font-bold">
                            Click to Complete ⚡
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveModalAction('newTask')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <span>➕</span> Add Custom Task
                  </button>
                </div>
              </div>
            )}

            {/* ════════════ TAB 3: SKILLS & MASTERY ════════════ */}
            {activeTab === 'skills' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🧠</span> FRONTEND PROFICIENCIES & SKILL TREE
                  </h3>
                  <span className="text-[11px] text-pink-400 font-bold">Next Unlock in 1 Task</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>React & TypeScript Components</span>
                      <strong className="text-pink-400 font-bold">Level 9 (90%)</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500" style={{ width: '90%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Tailwind CSS & Responsive Layouts</span>
                      <strong className="text-cyan-400 font-bold">Level 8 (80%)</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: '80%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Framer Motion & Micro-Interactions</span>
                      <strong className="text-amber-400 font-bold">Level 7 (70%)</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: '70%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>State Management (Zustand & Context)</span>
                      <strong className="text-purple-400 font-bold">Level 7 (70%)</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400" style={{ width: '70%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Canvas 2D & Game UI Overlays</span>
                      <strong className="text-emerald-400 font-bold">Level 6 (60%)</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#080d14] rounded-xl border border-pink-900/50 flex items-center justify-between text-xs">
                  <span className="text-slate-400">📈 Next Skill Perk:</span>
                  <strong className="text-pink-300 font-bold">WebGPU Particle FX · 1 more task to unlock</strong>
                </div>
              </div>
            )}

            {/* ════════════ TAB 4: BOSS BATTLES & ACHIEVEMENTS ════════════ */}
            {activeTab === 'bosses' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🏆</span> BOSS BATTLES DEFEATED (23 TOTAL)
                  </h3>
                  <span className="text-[11px] text-amber-400 font-bold">Next Boss: CardVault Buylist</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>👾</span>
                      <strong className="text-slate-200">The Responsive Nightmare (iPhone SE Bug)</strong>
                    </div>
                    <span className="text-emerald-400 font-bold">✅ Defeated</span>
                  </div>

                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>👾</span>
                      <strong className="text-slate-200">Zero-Layout Shift Checkout Engine</strong>
                    </div>
                    <span className="text-emerald-400 font-bold">✅ Defeated</span>
                  </div>

                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>👾</span>
                      <strong className="text-slate-200">60 FPS Smooth Canvas Particle Grid</strong>
                    </div>
                    <span className="text-emerald-400 font-bold">✅ Defeated</span>
                  </div>

                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>👾</span>
                      <strong className="text-slate-200">Stripe Multi-Tier Invoice Modal</strong>
                    </div>
                    <span className="text-emerald-400 font-bold">✅ Defeated</span>
                  </div>
                </div>

                <div className="p-3 bg-[#130b1c] rounded-xl border border-purple-500/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👹</span>
                    <div>
                      <strong className="text-purple-200 block">ACTIVE BOSS: CardVault Realtime Engine</strong>
                      <span className="text-slate-400 text-[10px]">Deliver 100% test coverage</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      showToast('⚔️ Boss Battle Initiated! Double XP Mode Active!', '🔥');
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs"
                  >
                    Challenge Boss
                  </button>
                </div>
              </div>
            )}

            {/* ════════════ TAB 5: SHIPPED WORK & PORTFOLIO ════════════ */}
            {activeTab === 'portfolio' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🏛️</span> SHIPPED CODEBASES & DELIVERIES (5 DELIVERED)
                  </h3>
                  <span className="text-[11px] text-emerald-400 font-bold">💰 $45,000 Total Value</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <div className="flex justify-between text-slate-300 font-bold mb-1">
                      <span>🃏 CardVault AI Platform</span>
                      <span className="text-emerald-400">$12,000</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Next.js, Tailwind, Supabase Realtime</span>
                  </div>

                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <div className="flex justify-between text-slate-300 font-bold mb-1">
                      <span>🎲 RNG Gamez TCG Shop</span>
                      <span className="text-emerald-400">$10,000</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">E-commerce, Live Buylist, Stripe</span>
                  </div>

                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <div className="flex justify-between text-slate-300 font-bold mb-1">
                      <span>🌸 Luxury Perfume Studio</span>
                      <span className="text-emerald-400">$5,000</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Framer Motion, 3D Product Carousel</span>
                  </div>

                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <div className="flex justify-between text-slate-300 font-bold mb-1">
                      <span>⚡ SaaS Automation OS</span>
                      <span className="text-emerald-400">$18,000</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Micro-Frontends, Workflow Canvas</span>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════ TAB 6: PROGRESS & ANALYTICS ════════════ */}
            {activeTab === 'analytics' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                  <span>📊</span> LIFETIME METRICS & XP PROGRESSION
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">TASKS DONE</span>
                    <strong className="text-pink-400 text-lg font-bold">142 Tasks</strong>
                  </div>
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">TOTAL XP</span>
                    <strong className="text-amber-400 text-lg font-bold">4,820 XP</strong>
                  </div>
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">ACTIVE STREAK</span>
                    <strong className="text-cyan-400 text-lg font-bold">12 Days 🔥</strong>
                  </div>
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">FOCUS TIME</span>
                    <strong className="text-emerald-400 text-lg font-bold">86.4 Hours</strong>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════ TAB 7: ENVIRONMENT SETTINGS ════════════ */}
            {activeTab === 'settings' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono text-xs animate-in fade-in">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                  <span>⚙️</span> WORKSTATION PREFERENCES & THEMES
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span>Workstation Theme</span>
                    <span className="text-pink-400 font-bold">Hello Kitty Pastel Gold</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span>Dopamine Sound FX</span>
                    <span className="text-emerald-400 font-bold">ENABLED (8-Bit Levelup)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span>Auto-Sync with HQ Management PC</span>
                    <span className="text-cyan-400 font-bold">REALTIME ACTIVE</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            ADD CUSTOM TASK MODAL
            ════════════════════════════════════════════════════════════════════ */}
        {activeModalAction === 'newTask' && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-md bg-[#0e1622] border border-pink-500/50 rounded-2xl p-5 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
                <strong className="text-pink-400">➕ Add Custom Quick Task</strong>
                <button onClick={() => setActiveModalAction(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1">Task Title:</label>
                  <input
                    type="text"
                    value={newTaskInput.title}
                    onChange={e => setNewTaskInput({ ...newTaskInput, title: e.target.value })}
                    placeholder="e.g. Refactor Header Dropdown"
                    className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2 text-slate-200 outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setActiveModalAction(null)} className="px-3 py-1.5 bg-slate-800 rounded-lg text-slate-300">Cancel</button>
                  <button
                    onClick={() => {
                      if (!newTaskInput.title) return;
                      setQuickTasks(prev => [
                        { id: `qt-${Date.now()}`, title: newTaskInput.title, tag: 'Custom', color: 'green', estimate: newTaskInput.estimate, energyLevel: 'medium', xp: 35 },
                        ...prev
                      ]);
                      showToast('New Task added to backlog!', '⚡');
                      setActiveModalAction(null);
                      setNewTaskInput({ title: '', estimate: '20m', tag: 'Feature', energy: 'medium' });
                    }}
                    className="px-4 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg"
                  >
                    Save Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
