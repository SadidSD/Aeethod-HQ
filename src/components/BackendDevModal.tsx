import { useState, useEffect } from 'react';
import { AgencyState, AgencyTask } from '../core/agencyTypes';
import AgencyManager from '../core/agency';

interface BackendDevModalProps {
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
  { id: 'mission', label: 'Engine Mission', icon: '⚡', shortcut: '1' },
  { id: 'tasks', label: 'System Tasks', icon: '🎯', shortcut: '2' },
  { id: 'skills', label: 'Architecture Tree', icon: '🧠', shortcut: '3' },
  { id: 'bosses', label: 'System Bosses', icon: '🏆', shortcut: '4' },
  { id: 'portfolio', label: 'Shipped Systems', icon: '🏛️', shortcut: '5' },
  { id: 'analytics', label: 'Uptime & XP', icon: '📊', shortcut: '6' },
  { id: 'settings', label: 'Cluster Config', icon: '⚙️', shortcut: '7' },
];

export default function BackendDevModal({ agency, manager, onClose, onRefresh }: BackendDevModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('mission');

  // Employee info
  const backendMember = agency.team.find(m => m.id === 'backend' || m.role.toLowerCase().includes('backend')) || {
    name: 'Marcus Vance',
    level: 9,
    xp: 310,
    status: 'working'
  };

  // Find linked active project / tasks
  const myAssignedTasks = agency.tasks.filter(t => t.assignedTo === 'backend' || t.phase === 'development');
  const activeAgencyTask = myAssignedTasks.find(t => t.status === 'active') || myAssignedTasks[0];
  const linkedProject = activeAgencyTask?.projectId ? agency.projects.find(p => p.id === activeAgencyTask.projectId) : agency.projects[0];

  // Dynamic Notification Toast
  const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);

  const showToast = (message: string, icon = '⚡') => {
    setNotification({ message, icon });
    setTimeout(() => setNotification(null), 3500);
  };

  // Mission State
  const [isPaused, setIsPaused] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([
    { id: 'be-1', title: 'Design PostgreSQL schema & high-speed B-Tree indexes', status: 'done', timeLabel: '3h ago' },
    { id: 'be-2', title: 'Build Redis caching & BullMQ price synchronization worker', status: 'in_progress', timeLabel: '30 min' },
    { id: 'be-3', title: 'Write GraphQL resolver types & mutations for buylist', status: 'waiting', timeLabel: '-' },
    { id: 'be-4', title: 'Run DB migration & simulate 5,000 req/sec stress test', status: 'pending', timeLabel: '20 min' },
  ]);

  // Today's Progress State
  const [tasksDoneCount, setTasksDoneCount] = useState(5);
  const [tasksTotalCount, setTasksTotalCount] = useState(7);
  const [todayXP, setTodayXP] = useState(310);
  const maxTodayXP = 450;
  const [streakDays, setStreakDays] = useState(16);

  // Energy / Mood State
  const [energyLevel, setEnergyLevel] = useState<'high' | 'medium' | 'low'>('high');

  // Quick Tasks State
  const [quickTasks, setQuickTasks] = useState<QuickTaskItem[]>([
    { id: 'bqt-1', title: 'Tune PostgreSQL Slow Query (450ms -> 12ms)', tag: 'SQL Tune', color: 'red', estimate: '20m', energyLevel: 'high', xp: 45 },
    { id: 'bqt-2', title: 'Implement Redis Lock for Checkout Race Condition', tag: 'Concurrency', color: 'yellow', estimate: '35m', energyLevel: 'medium', xp: 55 },
    { id: 'bqt-3', title: 'Automate Daily Database Backup Snapshot to S3', tag: 'DevOps', color: 'blue', estimate: '15m', energyLevel: 'low', xp: 30 },
    { id: 'bqt-4', title: 'Setup Stripe Webhook Event Idempotency Store', tag: 'Payments', color: 'green', estimate: '40m', energyLevel: 'medium', xp: 60 },
  ]);

  // Modal Popups for Quick Actions
  const [activeModalAction, setActiveModalAction] = useState<'newTask' | null>(null);
  const [newTaskInput, setNewTaskInput] = useState({ title: '', estimate: '20m', tag: 'Backend', energy: 'medium' });

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
            setTodayXP(x => Math.min(x + 25, maxTodayXP));
            showToast('Backend Subtask deployed! +25 XP awarded ⚡', '⚡');
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
    showToast(`Deployed: ${task.title}! +${task.xp} XP 🚀`, '⚡');
    onRefresh();
  };

  const filteredQuickTasks = quickTasks.filter(t => energyLevel === 'high' || t.energyLevel === energyLevel || t.energyLevel === 'low');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[920px] bg-[#080d14] border border-cyan-500/40 rounded-2xl shadow-[0_0_80px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-slate-200 font-sans">
        
        {/* Dynamic Notification Toast */}
        {notification && (
          <div className="fixed top-6 right-8 z-[80] px-4 py-2.5 bg-cyan-950/95 border border-cyan-500 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.4)] text-cyan-200 text-xs font-bold font-mono animate-in fade-in slide-in-from-top-2 flex items-center gap-2.5">
            <span className="text-base">{notification.icon}</span>
            <span>{notification.message}</span>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TOP HUD HEADER BAR
            ════════════════════════════════════════════════════════════════════ */}
        <div className="px-6 py-3.5 bg-[#0f1722] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              🕷️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-slate-100 tracking-wider font-mono uppercase">
                  BACKEND ARCHITECT — <span className="text-cyan-400 font-bold">{backendMember.name.toUpperCase()} (SPIDER-MAN)</span>
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-950 text-cyan-400 border border-cyan-700/60">
                  LEVEL {backendMember.level || 9}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                <span>📅 March 15, 2026</span>
                <span className="text-slate-600">•</span>
                <span>⏰ 10:23 AM</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  CLUSTER STATUS: OPTIMAL (99.99%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono bg-[#05080c] px-3.5 py-1.5 rounded-xl border border-cyan-900/50 text-slate-300">
              <span className="text-amber-400 font-bold">🔥 {streakDays}-Day Streak</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-300 font-bold">⭐ {todayXP}/{maxTodayXP} XP</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-bold">🏆 31 Bosses</span>
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
          <div className="w-56 bg-[#04070b] border-r border-slate-800 p-3.5 flex flex-col justify-between shrink-0">
            <div className="space-y-1.5">
              <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Architecture Tabs
              </div>
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs font-bold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-950/80 to-cyan-900/30 text-cyan-300 border border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#0f1722]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      isActive ? 'bg-cyan-950 border-cyan-700 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-600'
                    }`}>
                      {tab.shortcut}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Status Card */}
            <div className="p-3 bg-[#0a121c] border border-cyan-900/40 rounded-xl font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>SERVER UPTIME</span>
                <span className="text-emerald-400 font-bold">99.99%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: '92%' }} />
              </div>
              <span className="text-[10px] text-cyan-400/80 font-bold block text-center">
                ⚡ 5.2k req/sec capacity
              </span>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────
              MAIN CONTENT TAB AREA
              ──────────────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-5 bg-[#05080c] space-y-4">

            {/* ════════════ TAB 1: MISSION & SPRINT ════════════ */}
            {activeTab === 'mission' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 bg-[#0a111a] border border-slate-800 rounded-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <span>⚡</span> ACTIVE ARCHITECTURE SPRINT:
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950/70 border border-cyan-700/50 text-cyan-300 text-xs font-bold">
                        💼 Project: {linkedProject ? linkedProject.name : 'CardVault AI Platform'} (${linkedProject?.value?.toLocaleString() || '12,000'})
                      </span>
                    </div>
                    <span className="text-xs font-mono text-emerald-300 font-bold">⏳ 50% Complete</span>
                  </div>

                  <h2 className="text-base font-black text-slate-100 font-mono tracking-wide mb-3">
                    Build High-Throughput Buylist Sync & Redis Engine
                  </h2>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-400 transition-all duration-500"
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
                            ? 'bg-[#06121a] border-emerald-800/50 text-slate-400 line-through'
                            : st.status === 'in_progress'
                            ? 'bg-[#0f1d2a] border-cyan-500/50 text-slate-100 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                            : 'bg-[#070b10] border-slate-800/80 text-slate-300 hover:border-slate-700'
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
                          showToast(isPaused ? 'Workers Resumed ▶️' : 'Workers Paused ⏸️', isPaused ? '▶️' : '⏸️');
                        }}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition flex items-center gap-1.5"
                      >
                        <span>{isPaused ? '▶️' : '⏸️'}</span>
                        <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsBlocked(!isBlocked);
                          showToast(isBlocked ? 'Blocker Cleared ✅' : 'DB Deadlock reported! 🚨', '🚨');
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
                        setTodayXP(x => Math.min(x + 120, maxTodayXP));
                        manager.addXP(120);
                        showToast('🎉 Backend Sprint Deployed! +120 XP awarded!', '🏆');
                        onRefresh();
                      }}
                      className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-xl transition shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2"
                    >
                      <span>⚡</span>
                      <span>DEPLOY SPRINT</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════ TAB 2: SYSTEM TASKS & BACKLOG ════════════ */}
            {activeTab === 'tasks' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3.5 bg-[#0a111a] border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400 font-bold">🧠 Cognitive Bandwidth:</span>
                    <span className="text-slate-500 text-[11px]">Filter backend workload</span>
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
                          <h3 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition">
                            {task.title}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                          <span>⏱️ {task.estimate}</span>
                          <span className="text-cyan-400 group-hover:underline text-[10px] font-bold">
                            Deploy Instant ⚡
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveModalAction('newTask')}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-mono text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <span>➕</span> Add Backend Task
                  </button>
                </div>
              </div>
            )}

            {/* ════════════ TAB 3: ARCHITECTURE TREE ════════════ */}
            {activeTab === 'skills' && (
              <div className="p-4 bg-[#0a111a] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🧠</span> BACKEND PROFICIENCIES & ARCHITECTURE TREE
                  </h3>
                  <span className="text-[11px] text-cyan-400 font-bold">Next Tier: Distributed Sharding</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>PostgreSQL & High-Performance Indexing</span>
                      <strong className="text-cyan-400 font-bold">Level 10 (95%)</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{ width: '95%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Redis Cache & BullMQ Distributed Jobs</span>
                      <strong className="text-emerald-400 font-bold">Level 9 (90%)</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: '90%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>GraphQL Schema & Supabase Edge Functions</span>
                      <strong className="text-amber-400 font-bold">Level 8 (80%)</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: '80%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Kafka Event Streaming & Webhooks</span>
                      <strong className="text-purple-400 font-bold">Level 7 (70%)</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400" style={{ width: '70%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════ TAB 4: SYSTEM BOSSES ════════════ */}
            {activeTab === 'bosses' && (
              <div className="p-4 bg-[#0a111a] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🏆</span> ARCHITECTURE BOSSES CONQUERED (31 DEFEATED)
                  </h3>
                  <span className="text-[11px] text-amber-400 font-bold">Next Boss: CardVault Redis Cluster</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-[#05080c] rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>👾</span>
                      <strong className="text-slate-200">The 10k Concurrent Stripe Webhook Flood</strong>
                    </div>
                    <span className="text-emerald-400 font-bold">✅ Defeated</span>
                  </div>

                  <div className="p-3 bg-[#05080c] rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>👾</span>
                      <strong className="text-slate-200">PostgreSQL Connection Pool Exhaustion</strong>
                    </div>
                    <span className="text-emerald-400 font-bold">✅ Defeated</span>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════ TAB 5: SHIPPED SYSTEMS ════════════ */}
            {activeTab === 'portfolio' && (
              <div className="p-4 bg-[#0a111a] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🏛️</span> CORE ARCHITECTURES DEPLOYED
                  </h3>
                  <span className="text-[11px] text-emerald-400 font-bold">5 Production Systems</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#05080c] rounded-xl border border-slate-800">
                    <strong className="text-cyan-300 block mb-1">CardVault AI Realtime Pricing DB</strong>
                    <span className="text-[10px] text-slate-500">Postgres, TimescaleDB, Redis</span>
                  </div>
                  <div className="p-3 bg-[#05080c] rounded-xl border border-slate-800">
                    <strong className="text-cyan-300 block mb-1">RNG Gamez Buylist API Engine</strong>
                    <span className="text-[10px] text-slate-500">Node.js, BullMQ, Redis Cluster</span>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════ TAB 6: METRICS & UPTIME ════════════ */}
            {activeTab === 'analytics' && (
              <div className="p-4 bg-[#0a111a] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                  <span>📊</span> CLUSTER UPTIME & XP VELOCITY
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 bg-[#05080c] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">SERVER UPTIME</span>
                    <strong className="text-emerald-400 text-lg font-bold">99.99%</strong>
                  </div>
                  <div className="p-3 bg-[#05080c] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">QUERIES/SEC</span>
                    <strong className="text-cyan-400 text-lg font-bold">5,240 QPS</strong>
                  </div>
                  <div className="p-3 bg-[#05080c] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">ACTIVE STREAK</span>
                    <strong className="text-amber-400 text-lg font-bold">16 Days 🔥</strong>
                  </div>
                  <div className="p-3 bg-[#05080c] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">TOTAL XP</span>
                    <strong className="text-purple-400 text-lg font-bold">6,120 XP</strong>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════ TAB 7: CLUSTER CONFIG ════════════ */}
            {activeTab === 'settings' && (
              <div className="p-4 bg-[#0a111a] border border-slate-800 rounded-2xl space-y-4 font-mono text-xs animate-in fade-in">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                  <span>⚙️</span> BACKEND ENVIRONMENT CONFIGURATION
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-[#05080c] rounded-xl border border-slate-800">
                    <span>Database Connection Pool</span>
                    <span className="text-emerald-400 font-bold">PgBouncer (Active)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#05080c] rounded-xl border border-slate-800">
                    <span>Redis Replication Mode</span>
                    <span className="text-cyan-400 font-bold">Multi-AZ Sentinel</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
