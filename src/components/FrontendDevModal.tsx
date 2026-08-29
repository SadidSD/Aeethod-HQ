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

export default function FrontendDevModal({ agency, manager, onClose, onRefresh }: FrontendDevModalProps) {
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
  const [activeModalAction, setActiveModalAction] = useState<'newTask' | 'stats' | 'achievements' | 'skills' | 'settings' | null>(null);
  const [newTaskInput, setNewTaskInput] = useState({ title: '', estimate: '20m', tag: 'Feature', energy: 'medium' });

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModalAction) {
          setActiveModalAction(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, activeModalAction]);

  // Subtask completion calculation
  const completedSubtasksCount = subtasks.filter(s => s.status === 'done').length;
  const missionProgressPct = Math.round((completedSubtasksCount / subtasks.length) * 100);

  // Toggle Subtask
  const handleToggleSubtask = (id: string) => {
    setSubtasks(prev => {
      return prev.map(s => {
        if (s.id === id) {
          if (s.status === 'done') {
            return { ...s, status: 'in_progress', timeLabel: 'Just now' };
          } else {
            // Reward XP & update progress
            const bonusXP = 20;
            setTodayXP(xp => Math.min(maxTodayXP, xp + bonusXP));
            showToast(`✅ Subtask Completed! +${bonusXP} XP`, '🎉');
            return { ...s, status: 'done', timeLabel: 'Just now' };
          }
        }
        return s;
      });
    });
  };

  // Handle Pause / Continue
  const handleTogglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      showToast('▶️ Mission Resumed! Timer active.', '⚡');
    } else {
      setIsPaused(true);
      showToast('⏸️ Mission Paused.', '☕');
    }
  };

  // Handle Report Blocker
  const handleReportBlocker = () => {
    if (!isBlocked) {
      setIsBlocked(true);
      showToast('🚨 Blocker reported to Management Room (CEO alert sent)', '📢');
      if (activeAgencyTask) {
        manager.updateTask(activeAgencyTask.id, { status: 'blocked' });
        onRefresh();
      }
    } else {
      setIsBlocked(false);
      showToast('✅ Blocker cleared! Back to work.', '🟢');
      if (activeAgencyTask) {
        manager.updateTask(activeAgencyTask.id, { status: 'active' });
        onRefresh();
      }
    }
  };

  // Handle Complete Entire Mission
  const handleCompleteMission = () => {
    setSubtasks(prev => prev.map(s => ({ ...s, status: 'done', timeLabel: 'Just now' })));
    setTasksDoneCount(prev => Math.min(tasksTotalCount, prev + 1));
    const rewardXP = 80;
    setTodayXP(prev => Math.min(maxTodayXP, prev + rewardXP));
    setLevelProgress(prev => (prev >= 90 ? 10 : prev + 15));
    showToast('🏆 MISSION ACCOMPLISHED! +80 XP Earned', '✨');
    if (activeAgencyTask) {
      manager.completeTask(activeAgencyTask.id);
      onRefresh();
    }
  };

  // Handle Quick Task Click
  const handleQuickTaskClick = (qt: QuickTaskItem) => {
    setQuickTasks(prev => prev.filter(t => t.id !== qt.id));
    setTasksDoneCount(prev => prev + 1);
    setTasksTotalCount(prev => Math.max(tasksTotalCount, prev + 1));
    setTodayXP(xp => Math.min(maxTodayXP, xp + qt.xp));
    setFocusTimeMinutes(mins => mins + parseInt(qt.estimate));
    showToast(`⚡ Finished Quick Task: "${qt.title}" (+${qt.xp} XP)`, '🚀');
    onRefresh();
  };

  // Filtered Quick Tasks based on current energy selector
  const filteredQuickTasks = quickTasks.filter(t => {
    if (energyLevel === 'high') return true; // High can do everything
    if (energyLevel === 'medium') return t.energyLevel === 'medium' || t.energyLevel === 'low';
    return t.energyLevel === 'low';
  });

  // Hours / Minutes Formatter for Focus Time
  const formatFocusTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  // Skills Data
  const skillsList = [
    { name: 'React', level: 8, progress: 80 },
    { name: 'TypeScript', level: 6, progress: 60 },
    { name: 'CSS', level: 6, progress: 60 },
    { name: 'Node.js', level: 4, progress: 40 },
    { name: 'GraphQL', level: 2, progress: 20 },
  ];

  // Boss Battles Data
  const bossBattles = [
    { name: 'Database Migration', icon: '⚡', done: true },
    { name: 'API Overhaul', icon: '⚡', done: true },
    { name: 'Mobile App', icon: '⚡', done: true },
    { name: 'Security Audit', icon: '⚡', done: true },
    { name: 'Performance', icon: '⚡', done: true },
  ];

  // Portfolio Projects
  const portfolioProjects = [
    { id: 'rng', name: 'RNG Gamez', short: 'RNG\nGamez', val: '$10,000', icon: '🎲' },
    { id: 'perf', name: 'Perfume E-Com', short: 'PERF\nume', val: '$5,000', icon: '🌸' },
    { id: 'tcg', name: 'TCG Shop', short: 'TCG\nShop', val: '$12,000', icon: '🃏' },
    { id: 'saas', name: 'SaaS Dev', short: 'SAAS\nDev', val: '$12,000', icon: '⚡' },
    { id: 'blog', name: 'SEO Blog', short: 'BLOG\n', val: '$6,000', icon: '📰' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in select-none">
      {/* Main Container */}
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[920px] bg-[#0c1017] border border-slate-700/80 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-slate-200 font-sans">
        
        {/* Toast Notification */}
        {notification && (
          <div className="fixed top-6 right-8 z-[70] px-4 py-2.5 bg-emerald-950/95 border border-emerald-500 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.35)] text-emerald-200 text-xs font-bold font-mono animate-in fade-in slide-in-from-top-2 flex items-center gap-2.5">
            <span className="text-base">{notification.icon}</span>
            <span>{notification.message}</span>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TOP HEADER BAR
            ════════════════════════════════════════════════════════════════════ */}
        <div className="px-6 py-3.5 bg-[#121824] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-950/70 border border-pink-500/50 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(244,114,182,0.2)]">
              🧑‍💻
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-slate-100 tracking-wider font-mono uppercase">
                  FRONTEND DEVELOPER — <span className="text-pink-400 font-bold">{frontendMember.name}</span>
                </h1>
                <span className="px-2 py-0.5 rounded bg-pink-950 border border-pink-600/40 text-pink-300 text-[10px] font-mono font-bold">
                  LEVEL 8
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono mt-0.5">
                <span>📅 March 15, 2026</span>
                <span className="text-slate-600">•</span>
                <span>⏰ 10:23 AM</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-bold">Status: {isBlocked ? '🔴 BLOCKED' : isPaused ? '⏸️ PAUSED' : '🟢 WORKING'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono bg-[#182030] px-3.5 py-1.5 rounded-xl border border-slate-700/60">
              <span className="text-amber-400 font-bold">🔥 12-Day Streak</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-300 font-bold">⭐ {todayXP}/400 XP</span>
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
            SCROLLABLE CONTENT AREA
            ════════════════════════════════════════════════════════════════════ */}
        <div className="p-5 overflow-y-auto flex-1 bg-[#090d14] space-y-4">

          {/* ────────────────────────────────────────────────────────────────
              SECTION 1: 🔥 TODAY'S MISSION (The Main Focus)
              ──────────────────────────────────────────────────────────────── */}
          <div className={`p-5 rounded-2xl border-2 transition-all ${
            isBlocked
              ? 'bg-rose-950/20 border-rose-600/70 shadow-[0_0_30px_rgba(225,29,72,0.2)]'
              : isPaused
              ? 'bg-amber-950/15 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
              : 'bg-[#101724] border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.18)]'
          }`}>
            {/* Header / Project Context */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-amber-400 font-mono tracking-wider flex items-center gap-1.5">
                  <span>🔥</span> TODAY'S MISSION
                </span>
                {linkedProject && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-600/40 text-cyan-300 font-mono font-bold">
                    📦 Project: {linkedProject.name} (${linkedProject.value.toLocaleString()})
                  </span>
                )}
                {isBlocked && (
                  <span className="text-xs px-2 py-0.5 rounded bg-rose-600 text-white font-mono font-black animate-pulse">
                    BLOCKED
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-cyan-300">
                  ⏳ {missionProgressPct}% Complete
                </span>
              </div>
            </div>

            {/* Title & Progress Bar */}
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-100 tracking-wide mb-2">
                {activeAgencyTask?.title || 'Complete API Integration for Client Dashboard'}
              </h2>

              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    missionProgressPct === 100
                      ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]'
                      : isBlocked
                      ? 'bg-rose-500'
                      : 'bg-gradient-to-r from-cyan-500 via-pink-500 to-emerald-400'
                  }`}
                  style={{ width: `${missionProgressPct}%` }}
                />
              </div>
            </div>

            {/* Subtasks Box */}
            <div className="bg-[#0b0f17] rounded-xl border border-slate-800 p-3 space-y-2 mb-4">
              {subtasks.map(st => {
                const isDone = st.status === 'done';
                const isInProgress = st.status === 'in_progress';
                const isWaiting = st.status === 'waiting';

                return (
                  <div
                    key={st.id}
                    onClick={() => handleToggleSubtask(st.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition cursor-pointer ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-600/30 text-slate-300 hover:bg-emerald-950/30'
                        : isInProgress
                        ? 'bg-cyan-950/30 border-cyan-500/50 text-slate-100 hover:bg-cyan-950/50'
                        : 'bg-[#121824] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">
                        {isDone ? '✅' : isInProgress ? '🔄' : isWaiting ? '⏳' : '📝'}
                      </span>
                      <span className={`text-xs font-mono font-medium truncate ${isDone ? 'line-through text-slate-500' : ''}`}>
                        {st.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isDone
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                          : isInProgress
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/50 animate-pulse'
                          : isWaiting
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-700/50'
                      }`}>
                        {isDone ? '[DONE]' : isInProgress ? '[IN PROGRESS]' : isWaiting ? '[WAITING]' : '[PENDING]'}
                      </span>
                      <span className="text-slate-500 w-16 text-right">{st.timeLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePause}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                    isPaused
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <span>{isPaused ? '▶️' : '⏸️'}</span>
                  <span>{isPaused ? 'CONTINUE' : 'PAUSE'}</span>
                </button>

                <button
                  onClick={handleReportBlocker}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                    isBlocked
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-950/70 hover:bg-rose-900 border border-rose-600/50 text-rose-300'
                  }`}
                >
                  <span>🚨</span>
                  <span>{isBlocked ? 'CLEAR BLOCKER' : 'REPORT BLOCKER'}</span>
                </button>
              </div>

              <button
                onClick={handleCompleteMission}
                className="px-5 py-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-mono font-black text-xs rounded-xl shadow-[0_0_20px_rgba(244,114,182,0.4)] transition flex items-center gap-2"
              >
                <span>✨</span>
                <span>COMPLETE MISSION</span>
              </button>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────
              ROW 2: TODAY'S PROGRESS + QUICK TASKS
              ──────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* 📊 TODAY'S PROGRESS (Left 4 cols) */}
            <div className="lg:col-span-4 bg-[#101724] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-300 font-mono tracking-wider mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <span>📊</span> TODAY'S PROGRESS
                </h3>

                {/* Tasks Done */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Tasks Done:</span>
                    <span className="text-emerald-400 font-bold">{tasksDoneCount}/{tasksTotalCount} ({Math.round((tasksDoneCount/tasksTotalCount)*100)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${(tasksDoneCount / tasksTotalCount) * 100}%` }}
                    />
                  </div>
                </div>

                {/* XP Today */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">XP Today:</span>
                    <span className="text-cyan-300 font-bold">{todayXP}/{maxTodayXP} ({Math.round((todayXP/maxTodayXP)*100)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${(todayXP / maxTodayXP) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Level Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Level: 8</span>
                    <span className="text-pink-400 font-bold">{levelProgress}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-500 rounded-full transition-all duration-300"
                      style={{ width: `${levelProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Meta */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1">
                  <span>⏳</span> Focus: <strong className="text-amber-400">{formatFocusTime(focusTimeMinutes)}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <span>🔥</span> Streak: <strong className="text-rose-400">{streakDays} days</strong>
                </span>
              </div>
            </div>

            {/* 🎯 QUICK TASKS (Right 8 cols) */}
            <div className="lg:col-span-8 bg-[#101724] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-black text-slate-300 font-mono tracking-wider flex items-center gap-1.5">
                    <span>🎯</span> QUICK TASKS
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Filtered for: <strong className="text-cyan-400 capitalize">{energyLevel} Energy</strong>
                  </span>
                </div>

                {/* Quick Task Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {filteredQuickTasks.slice(0, 4).map(qt => {
                    const colorMap = {
                      red: 'border-rose-600/50 bg-rose-950/20 text-rose-300 hover:border-rose-500',
                      yellow: 'border-amber-600/50 bg-amber-950/20 text-amber-300 hover:border-amber-500',
                      blue: 'border-blue-600/50 bg-blue-950/20 text-blue-300 hover:border-blue-500',
                      green: 'border-emerald-600/50 bg-emerald-950/20 text-emerald-300 hover:border-emerald-500',
                    };

                    const dotMap = {
                      red: '🔴',
                      yellow: '🟡',
                      blue: '🔵',
                      green: '🟢',
                    };

                    return (
                      <div
                        key={qt.id}
                        onClick={() => handleQuickTaskClick(qt)}
                        className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition hover:scale-[1.02] shadow-sm ${colorMap[qt.color]}`}
                      >
                        <div>
                          <span className="text-[10px] font-mono font-bold block opacity-75 uppercase">
                            {qt.tag}
                          </span>
                          <span className="text-xs font-bold text-slate-200 block truncate mt-0.5" title={qt.title}>
                            {qt.title}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-[10px] font-mono pt-1 border-t border-slate-800/60">
                          <span className="flex items-center gap-1 font-bold">
                            {dotMap[qt.color]} {qt.estimate}
                          </span>
                          <span className="text-amber-400 font-bold">+{qt.xp} XP</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono mt-3 text-right">
                Click any task card to complete instantly & grab XP ⚡
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────
              ROW 3: YOUR SKILLS + BOSS BATTLES
              ──────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* 🧠 YOUR SKILLS (Left 5 cols) */}
            <div className="lg:col-span-5 bg-[#101724] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-300 font-mono tracking-wider mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <span>🧠</span> YOUR SKILLS
                </h3>

                <div className="space-y-2.5">
                  {skillsList.map(skill => (
                    <div key={skill.name} className="flex items-center justify-between text-xs font-mono">
                      <span className="w-24 font-bold text-slate-300">{skill.name}</span>
                      <div className="flex-1 mx-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${skill.progress}%` }}
                        />
                      </div>
                      <span className="w-16 text-right font-bold text-slate-400">Level {skill.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between text-slate-400">
                <span className="text-cyan-300 font-bold">📈 Next: Advanced React</span>
                <span className="text-amber-400 font-bold">⏳ 1 more project to unlock</span>
              </div>
            </div>

            {/* 🏆 BOSS BATTLES (Right 7 cols) */}
            <div className="lg:col-span-7 bg-[#101724] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-300 font-mono tracking-wider mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <span>🏆</span> BOSS BATTLES
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {bossBattles.map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-[#0b0f17] rounded-lg border border-slate-800/80">
                      <span className="text-amber-300 font-medium flex items-center gap-1.5 truncate">
                        <span>{b.icon}</span> {b.name}
                      </span>
                      <span className="text-emerald-400 font-bold text-[11px]">✅ Done</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-2 bg-pink-950/30 rounded-lg border border-pink-600/40">
                    <span className="text-pink-300 font-bold flex items-center gap-1.5 truncate">
                      <span>🎯</span> Next: Complete API Integration
                    </span>
                    <span className="text-pink-400 font-bold text-[11px] animate-pulse">ACTIVE</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">💪 Total: 23 Bosses Defeated</span>
                <span className="text-slate-500 font-bold">Pride of the Engineering Guild</span>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────
              ROW 4: YOUR PORTFOLIO + HOW ARE YOU FEELING?
              ──────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* 🏛️ YOUR PORTFOLIO (Left 6 cols) */}
            <div className="lg:col-span-6 bg-[#101724] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-300 font-mono tracking-wider mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <span>🏛️</span> YOUR PORTFOLIO
                </h3>

                {/* 5 Project Blocks */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {portfolioProjects.map(p => (
                    <div
                      key={p.id}
                      className="p-2.5 bg-[#0b0f17] rounded-xl border border-slate-800 text-center hover:border-pink-500/50 transition flex flex-col items-center justify-center min-h-[64px]"
                    >
                      <span className="text-base">{p.icon}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-300 leading-tight whitespace-pre-line mt-1">
                        {p.short}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
                <span>5 Projects Completed</span>
                <span className="text-emerald-400 font-bold">💰 Value: $45,000</span>
                <span className="text-amber-400 font-bold">🏆 Best: RNG Gamez</span>
              </div>
            </div>

            {/* 😊 HOW ARE YOU FEELING? (Right 6 cols) */}
            <div className="lg:col-span-6 bg-[#101724] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-300 font-mono tracking-wider mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-800">
                  <span>😊</span> HOW ARE YOU FEELING?
                </h3>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 font-mono">Select your energy level:</span>
                  
                  {/* Energy Selectors */}
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 'high' as const, label: '🔋 High', color: 'bg-emerald-600 text-white' },
                      { id: 'medium' as const, label: '😊 Medium', color: 'bg-amber-600 text-white' },
                      { id: 'low' as const, label: '😴 Low', color: 'bg-blue-600 text-white' },
                    ].map(btn => (
                      <button
                        key={btn.id}
                        onClick={() => {
                          setEnergyLevel(btn.id);
                          showToast(`Energy set to ${btn.id.toUpperCase()} — filtered quick tasks!`, '⚡');
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                          energyLevel === btn.id
                            ? `${btn.color} shadow-md`
                            : 'bg-[#0b0f17] text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy Guidance Text */}
                <div className="p-2.5 bg-[#0b0f17] rounded-xl border border-slate-800/80 text-[11px] font-mono space-y-1 text-slate-400">
                  <div className="text-slate-300 font-bold mb-1">We'll find tasks that match your energy:</div>
                  <div className={energyLevel === 'high' ? 'text-emerald-300 font-bold' : ''}>🔹 High: Complex coding, Architecture</div>
                  <div className={energyLevel === 'medium' ? 'text-amber-300 font-bold' : ''}>🔹 Medium: Debugging, Code review</div>
                  <div className={energyLevel === 'low' ? 'text-blue-300 font-bold' : ''}>🔹 Low: Documentation, Testing</div>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-500 font-mono text-right">
                Zero friction switching — respects your natural flow
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────
              SECTION 8: 💡 QUICK ACTIONS BAR
              ──────────────────────────────────────────────────────────────── */}
          <div className="p-3.5 bg-[#101724] border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-black text-slate-300 font-mono tracking-wider flex items-center gap-1.5">
              <span>💡</span> QUICK ACTIONS
            </span>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
              <button
                onClick={() => setActiveModalAction('newTask')}
                className="px-3 py-1.5 bg-[#182030] hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl transition flex items-center gap-1.5"
              >
                <span>📝</span> New Task
              </button>

              <button
                onClick={handleCompleteMission}
                className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 rounded-xl transition flex items-center gap-1.5"
              >
                <span>✅</span> Complete Task
              </button>

              <button
                onClick={() => setActiveModalAction('stats')}
                className="px-3 py-1.5 bg-[#182030] hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl transition flex items-center gap-1.5"
              >
                <span>📊</span> Stats
              </button>

              <button
                onClick={() => setActiveModalAction('achievements')}
                className="px-3 py-1.5 bg-[#182030] hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl transition flex items-center gap-1.5"
              >
                <span>🏆</span> Achievements
              </button>

              <button
                onClick={() => setActiveModalAction('skills')}
                className="px-3 py-1.5 bg-[#182030] hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl transition flex items-center gap-1.5"
              >
                <span>📚</span> Skills
              </button>

              <button
                onClick={() => setActiveModalAction('settings')}
                className="px-3 py-1.5 bg-[#182030] hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl transition flex items-center gap-1.5"
              >
                <span>⚙️</span> Settings
              </button>
            </div>
          </div>

        </div>

        {/* ════════════════════════════════════════════════════════════════════
            INTERACTIVE MODAL POPUPS (FOR QUICK ACTIONS)
            ════════════════════════════════════════════════════════════════════ */}
        {activeModalAction && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-md bg-[#121824] border border-cyan-500/50 rounded-2xl p-6 shadow-2xl text-slate-200 font-mono">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h3 className="text-sm font-black text-cyan-300 tracking-wide uppercase">
                  {activeModalAction === 'newTask' && '📝 Create New Developer Task'}
                  {activeModalAction === 'stats' && '📊 Alex Rivera — Lifetime Stats'}
                  {activeModalAction === 'achievements' && '🏆 Developer Trophies & Milestones'}
                  {activeModalAction === 'skills' && '📚 Frontend Mastery Progression'}
                  {activeModalAction === 'settings' && '⚙️ Battlestation Preferences'}
                </h3>
                <button
                  onClick={() => setActiveModalAction(null)}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              {activeModalAction === 'newTask' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Task Title:</label>
                    <input
                      type="text"
                      value={newTaskInput.title}
                      onChange={e => setNewTaskInput({ ...newTaskInput, title: e.target.value })}
                      placeholder="e.g. Refactor Tailwind styles for checkout"
                      className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Time Estimate:</label>
                      <input
                        type="text"
                        value={newTaskInput.estimate}
                        onChange={e => setNewTaskInput({ ...newTaskInput, estimate: e.target.value })}
                        className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Tag / Category:</label>
                      <input
                        type="text"
                        value={newTaskInput.tag}
                        onChange={e => setNewTaskInput({ ...newTaskInput, tag: e.target.value })}
                        className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setActiveModalAction(null)}
                      className="px-3 py-1.5 bg-slate-800 rounded-lg text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!newTaskInput.title) return;
                        const created: QuickTaskItem = {
                          id: `qt-${Date.now()}`,
                          title: newTaskInput.title,
                          tag: newTaskInput.tag || 'Feature',
                          color: 'green',
                          estimate: newTaskInput.estimate || '20m',
                          energyLevel: newTaskInput.energy as any,
                          xp: 30
                        };
                        setQuickTasks(prev => [created, ...prev]);
                        showToast(`Task "${created.title}" added to Quick Tasks!`, '📝');
                        setActiveModalAction(null);
                        setNewTaskInput({ title: '', estimate: '20m', tag: 'Feature', energy: 'medium' });
                      }}
                      className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold"
                    >
                      Create Task
                    </button>
                  </div>
                </div>
              )}

              {activeModalAction === 'stats' && (
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between p-2 bg-[#0b0f17] rounded">
                    <span className="text-slate-400">Total Tasks Shipped:</span>
                    <span className="text-emerald-400 font-bold">142</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#0b0f17] rounded">
                    <span className="text-slate-400">Total Code Reviews:</span>
                    <span className="text-cyan-300 font-bold">88</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#0b0f17] rounded">
                    <span className="text-slate-400">Client Revenue Delivered:</span>
                    <span className="text-amber-400 font-bold">$45,000</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#0b0f17] rounded">
                    <span className="text-slate-400">Average Velocity:</span>
                    <span className="text-pink-300 font-bold">4.2 Tasks / Day</span>
                  </div>
                </div>
              )}

              {activeModalAction === 'achievements' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-[#0b0f17] rounded border border-emerald-500/40">
                    <span className="text-emerald-400 font-bold">🥇 100 Tasks Shipped</span>
                    <p className="text-[10px] text-slate-400">Completed 100 agency engineering deliverables</p>
                  </div>
                  <div className="p-2.5 bg-[#0b0f17] rounded border border-cyan-500/40">
                    <span className="text-cyan-300 font-bold">⚡ Zero-Bug Sprint</span>
                    <p className="text-[10px] text-slate-400">Shipped 2 weeks of features without QA bounce</p>
                  </div>
                  <div className="p-2.5 bg-[#0b0f17] rounded border border-amber-500/40">
                    <span className="text-amber-300 font-bold">🔥 12-Day Streak Champion</span>
                    <p className="text-[10px] text-slate-400">Active everyday in the factory</p>
                  </div>
                </div>
              )}

              {activeModalAction === 'skills' && (
                <div className="space-y-2 text-xs">
                  <p className="text-slate-400 mb-2">Unlocked mastery perks:</p>
                  <div className="p-2 bg-[#0b0f17] rounded text-cyan-300 font-bold">⚛️ React Server Components Mastery</div>
                  <div className="p-2 bg-[#0b0f17] rounded text-pink-300 font-bold">🎨 Tailwind Micro-Animations</div>
                  <div className="p-2 bg-[#0b0f17] rounded text-emerald-300 font-bold">⚡ Zero-Latency Optimistic UI</div>
                </div>
              )}

              {activeModalAction === 'settings' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2 bg-[#0b0f17] rounded">
                    <span>Sound Effects (Chiptune Dopamine)</span>
                    <span className="text-emerald-400 font-bold">ON</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#0b0f17] rounded">
                    <span>Auto-Report Blockers to Management</span>
                    <span className="text-emerald-400 font-bold">ENABLED</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#0b0f17] rounded">
                    <span>Theme</span>
                    <span className="text-pink-400 font-bold">Hello Kitty Cyberpunk</span>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setActiveModalAction(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
