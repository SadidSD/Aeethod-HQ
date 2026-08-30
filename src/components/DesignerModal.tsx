import { useState, useEffect } from 'react';
import { AgencyState, AgencyTask } from '../core/agencyTypes';
import AgencyManager from '../core/agency';

interface DesignerModalProps {
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
  { id: 'mission', label: 'Design Mission', icon: '✨', shortcut: '1' },
  { id: 'tasks', label: 'Creative Tasks', icon: '🎯', shortcut: '2' },
  { id: 'skills', label: 'Design Skills', icon: '🧠', shortcut: '3' },
  { id: 'bosses', label: 'Design Bosses', icon: '🏆', shortcut: '4' },
  { id: 'portfolio', label: 'Design Systems', icon: '🏛️', shortcut: '5' },
  { id: 'analytics', label: 'Studio Velocity', icon: '📊', shortcut: '6' },
  { id: 'settings', label: 'Figma Config', icon: '⚙️', shortcut: '7' },
];

export default function DesignerModal({ agency, manager, onClose, onRefresh }: DesignerModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('mission');

  // Employee info
  const designerMember = agency.team.find(m => m.id === 'designer' || m.room === 'design') || {
    name: 'Elena Rostova',
    level: 8,
    xp: 280,
    status: 'working'
  };

  // Find linked active project / tasks
  const myAssignedTasks = agency.tasks.filter(t => t.assignedTo === 'designer' || t.phase === 'design');
  const activeAgencyTask = myAssignedTasks.find(t => t.status === 'active') || myAssignedTasks[0];
  const linkedProject = activeAgencyTask?.projectId ? agency.projects.find(p => p.id === activeAgencyTask.projectId) : agency.projects[0];

  // Dynamic Notification Toast
  const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);

  const showToast = (message: string, icon = '🎨') => {
    setNotification({ message, icon });
    setTimeout(() => setNotification(null), 3500);
  };

  // Mission State
  const [isPaused, setIsPaused] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([
    { id: 'des-1', title: 'Complete mobile wireframes & checkout user journey map', status: 'done', timeLabel: '2h ago' },
    { id: 'des-2', title: 'Build Figma high-fidelity interactive prototype & micro-interactions', status: 'in_progress', timeLabel: '40 min' },
    { id: 'des-3', title: 'Export Design System token variables & SVG vector assets', status: 'waiting', timeLabel: '-' },
    { id: 'des-4', title: 'Conduct design handoff & review tokens with Frontend Dev', status: 'pending', timeLabel: '15 min' },
  ]);

  // Today's Progress State
  const [tasksDoneCount, setTasksDoneCount] = useState(4);
  const [tasksTotalCount, setTasksTotalCount] = useState(6);
  const [todayXP, setTodayXP] = useState(280);
  const maxTodayXP = 400;
  const [streakDays, setStreakDays] = useState(14);

  // Energy / Mood State
  const [energyLevel, setEnergyLevel] = useState<'high' | 'medium' | 'low'>('high');

  // Quick Tasks State
  const [quickTasks, setQuickTasks] = useState<QuickTaskItem[]>([
    { id: 'dqt-1', title: 'Create 3D Glassmorphic Icon Set for Navigation', tag: 'Icons', color: 'red', estimate: '30m', energyLevel: 'high', xp: 45 },
    { id: 'dqt-2', title: 'Audit Color Contrast & WCAG 2.1 Accessibility', tag: 'A11y', color: 'yellow', estimate: '20m', energyLevel: 'medium', xp: 35 },
    { id: 'dqt-3', title: 'Design Dark Mode Variant for Client Portal', tag: 'Dark Mode', color: 'blue', estimate: '45m', energyLevel: 'high', xp: 60 },
    { id: 'dqt-4', title: 'Prepare Client Presentation Slide Deck in Figma', tag: 'Deck', color: 'green', estimate: '25m', energyLevel: 'low', xp: 30 },
  ]);

  // Modal Popups for Quick Actions
  const [activeModalAction, setActiveModalAction] = useState<'newTask' | null>(null);
  const [newTaskInput, setNewTaskInput] = useState({ title: '', estimate: '25m', tag: 'Design', energy: 'medium' });

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
            setTodayXP(x => Math.min(x + 20, maxTodayXP));
            showToast('Design Subtask Approved! +20 XP awarded 🎨', '🎨');
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
    showToast(`Shipped: ${task.title}! +${task.xp} XP 🌟`, '🎨');
    onRefresh();
  };

  const filteredQuickTasks = quickTasks.filter(t => energyLevel === 'high' || t.energyLevel === energyLevel || t.energyLevel === 'low');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[920px] bg-[#0d1117] border border-amber-500/40 rounded-2xl shadow-[0_0_80px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden text-slate-200 font-sans">
        
        {/* Dynamic Notification Toast */}
        {notification && (
          <div className="fixed top-6 right-8 z-[80] px-4 py-2.5 bg-amber-950/95 border border-amber-500 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.4)] text-amber-200 text-xs font-bold font-mono animate-in fade-in slide-in-from-top-2 flex items-center gap-2.5">
            <span className="text-base">{notification.icon}</span>
            <span>{notification.message}</span>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TOP HUD HEADER BAR
            ════════════════════════════════════════════════════════════════════ */}
        <div className="px-6 py-3.5 bg-[#141b24] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              🎨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-slate-100 tracking-wider font-mono uppercase">
                  LEAD DESIGNER — <span className="text-amber-400 font-bold">{designerMember.name.toUpperCase()} (CREATIVE SUITE)</span>
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-950 text-amber-400 border border-amber-700/60">
                  LEVEL {designerMember.level || 8}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                <span>📅 March 15, 2026</span>
                <span className="text-slate-600">•</span>
                <span>⏰ 10:23 AM</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  FIGMA CLOUD: SYNCED
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono bg-[#090d14] px-3.5 py-1.5 rounded-xl border border-amber-900/50 text-slate-300">
              <span className="text-amber-400 font-bold">🔥 {streakDays}-Day Streak</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-300 font-bold">⭐ {todayXP}/{maxTodayXP} XP</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-bold">🏆 27 Bosses</span>
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
                Design Tabs
              </div>
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs font-bold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-950/80 to-amber-900/30 text-amber-300 border border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#121824]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      isActive ? 'bg-amber-950 border-amber-700 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-600'
                    }`}>
                      {tab.shortcut}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Status Card */}
            <div className="p-3 bg-[#0d1420] border border-amber-900/40 rounded-xl font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>DESIGN TOKENS</span>
                <span className="text-amber-400 font-bold">148 Exported</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-amber-500 to-rose-400" style={{ width: '85%' }} />
              </div>
              <span className="text-[10px] text-amber-400/80 font-bold block text-center">
                ✨ High Fidelity Ready
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
                <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <span>🎨</span> ACTIVE DESIGN SPRINT:
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-950/70 border border-amber-700/50 text-amber-300 text-xs font-bold">
                        💼 Project: {linkedProject ? linkedProject.name : 'CardVault AI Platform'} (${linkedProject?.value?.toLocaleString() || '12,000'})
                      </span>
                    </div>
                    <span className="text-xs font-mono text-cyan-300 font-bold">⏳ 40% Complete</span>
                  </div>

                  <h2 className="text-base font-black text-slate-100 font-mono tracking-wide mb-3">
                    High-Fidelity Figma Prototype & Interactive Micro-Interactions
                  </h2>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-400 transition-all duration-500"
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
                            ? 'bg-[#1a140a] border-amber-500/50 text-slate-100 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
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
                            st.status === 'in_progress' ? 'bg-amber-950 text-amber-300' :
                            st.status === 'waiting' ? 'bg-slate-800 text-slate-400' :
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
                          showToast(isPaused ? 'Sprint Resumed ▶️' : 'Sprint Paused ⏸️', isPaused ? '▶️' : '⏸️');
                        }}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition flex items-center gap-1.5"
                      >
                        <span>{isPaused ? '▶️' : '⏸️'}</span>
                        <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsBlocked(!isBlocked);
                          showToast(isBlocked ? 'Blocker Cleared ✅' : 'Design feedback blocker reported! 🚨', '🚨');
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
                        showToast('🎉 Design Prototype Shipped! +100 XP awarded!', '🏆');
                        onRefresh();
                      }}
                      className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl transition shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2"
                    >
                      <span>🎨</span>
                      <span>APPROVE PROTOTYPE</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════ TAB 2: CREATIVE TASKS & BACKLOG ════════════ */}
            {activeTab === 'tasks' && (
              <div className="space-y-4 animate-in fade-in">
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
                          <h3 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition">
                            {task.title}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                          <span>⏱️ {task.estimate}</span>
                          <span className="text-amber-400 group-hover:underline text-[10px] font-bold">
                            Export & Finish ⚡
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ════════════ TAB 3: DESIGN SKILLS ════════════ */}
            {activeTab === 'skills' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                  <span>🧠</span> CREATIVE PROFICIENCIES & DESIGN TREE
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Figma Components & Auto-Layout 5.0</span>
                      <strong className="text-amber-400 font-bold">Level 9 (90%)</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: '90%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>3D Spline & Glassmorphic Modeling</span>
                      <strong className="text-purple-400 font-bold">Level 8 (80%)</strong>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400" style={{ width: '80%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════ TAB 4: DESIGN BOSSES ════════════ */}
            {activeTab === 'bosses' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                  <span>🏆</span> CREATIVE BOSSES CONQUERED (27 TOTAL)
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800 flex items-center justify-between">
                    <span>👾 Complete 200+ Screen Design System Overhaul</span>
                    <span className="text-emerald-400 font-bold">✅ Defeated</span>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════ TAB 5: DESIGN SYSTEMS ════════════ */}
            {activeTab === 'portfolio' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                  <span>🏛️</span> PUBLISHED DESIGN SYSTEMS & FIGMA LIBRARIES
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <strong className="text-amber-300 block mb-1">CardVault Glass Design System</strong>
                    <span className="text-[10px] text-slate-500">148 Components, 32 Tokens</span>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════ TAB 6: STUDIO VELOCITY ════════════ */}
            {activeTab === 'analytics' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                  <span>📊</span> STUDIO VELOCITY & CREATIVE XP
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">SCREENS SHIPPED</span>
                    <strong className="text-amber-400 text-lg font-bold">118 Screens</strong>
                  </div>
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">TOTAL XP</span>
                    <strong className="text-cyan-400 text-lg font-bold">5,410 XP</strong>
                  </div>
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">STREAK</span>
                    <strong className="text-amber-400 text-lg font-bold">14 Days 🔥</strong>
                  </div>
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">FOCUS TIME</span>
                    <strong className="text-emerald-400 text-lg font-bold">72.1 Hours</strong>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════ TAB 7: FIGMA CONFIG ════════════ */}
            {activeTab === 'settings' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono text-xs animate-in fade-in">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                  <span>⚙️</span> DESIGN ENVIRONMENT & FIGMA REST APIS
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span>Figma Webhook Sync</span>
                    <span className="text-emerald-400 font-bold">CONNECTED</span>
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
