import { useState, useEffect } from 'react';
import { AgencyState, AgencyTask, Project } from '../core/agencyTypes';
import AgencyManager from '../core/agency';

interface FrontendDevModalProps {
  agency: AgencyState;
  manager: AgencyManager;
  onClose: () => void;
  onRefresh: () => void;
}

type TabId = 'mission' | 'tasks' | 'skills' | 'bosses' | 'portfolio' | 'analytics' | 'settings';

interface TabDef {
  id: TabId;
  label: string;
  icon: string;
  shortcut: string;
}

const TABS: TabDef[] = [
  { id: 'mission', label: 'Project Mission', icon: '🔥', shortcut: '1' },
  { id: 'tasks', label: 'All Tasks & Backlog', icon: '🎯', shortcut: '2' },
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

  // Selected Project State (Defaults to first active project)
  const activeProjects = agency.projects.filter(p => p.phase !== 'completed');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return activeProjects[0]?.id || agency.projects[0]?.id || 'proj_cardvault';
  });

  const currentProject = agency.projects.find(p => p.id === selectedProjectId) || agency.projects[0];
  const projectTasks = agency.tasks.filter(t => t.projectId === currentProject?.id);
  const doneTasks = projectTasks.filter(t => t.status === 'done');
  const inProgressTasks = projectTasks.filter(t => t.status === 'active' || t.status === 'blocked');
  const queuedTasks = projectTasks.filter(t => t.status === 'queued');

  const projectProgressPct = projectTasks.length > 0
    ? Math.round((doneTasks.length / projectTasks.length) * 100)
    : 0;

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);

  const showToast = (message: string, icon = '✨') => {
    setNotification({ message, icon });
    setTimeout(() => setNotification(null), 3500);
  };

  // New Task Modal
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState({
    title: '',
    description: '',
    phase: 'development',
    priority: 'high',
    assignedTo: 'frontend',
    estimatedHours: 4,
    xpReward: 80,
  });

  // Task Filter state in Backlog tab
  const [taskFilter, setTaskFilter] = useState<'all' | 'mine' | 'done'>('all');

  // Keyboard Shortcuts (1-7 for tabs, Escape for close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showNewTaskModal) {
          setShowNewTaskModal(false);
        } else {
          onClose();
        }
        return;
      }

      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA' || (e.target as HTMLElement)?.tagName === 'SELECT') {
        return;
      }

      const num = parseInt(e.key);
      if (num >= 1 && num <= TABS.length) {
        setActiveTab(TABS[num - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showNewTaskModal]);

  const handleCompleteTask = (taskId: string, title: string, xp: number) => {
    manager.completeTask(taskId);
    showToast(`✅ Finished: ${title}! +${xp} XP awarded!`, '🎉');
    onRefresh();
  };

  const handleToggleBlocker = (task: AgencyTask) => {
    const nextStatus = task.status === 'blocked' ? 'active' : 'blocked';
    manager.updateTask(task.id, { status: nextStatus });
    showToast(nextStatus === 'blocked' ? '🚨 Blocker reported to Lead!' : '✅ Blocker cleared!', nextStatus === 'blocked' ? '🚨' : '✅');
    onRefresh();
  };

  const handleCreateTask = () => {
    if (!newTaskInput.title.trim()) return;
    manager.addTask({
      title: newTaskInput.title,
      description: newTaskInput.description || 'Structured project subtask.',
      projectId: currentProject.id,
      assignedTo: newTaskInput.assignedTo,
      phase: newTaskInput.phase as any,
      status: 'active',
      priority: newTaskInput.priority as any,
      cognitiveLoad: 'medium',
      estimatedHours: Number(newTaskInput.estimatedHours) || 4,
      xpReward: Number(newTaskInput.xpReward) || 80,
      deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    });
    showToast(`➕ Added Task: ${newTaskInput.title}!`, '⚡');
    setShowNewTaskModal(false);
    setNewTaskInput({
      title: '',
      description: '',
      phase: 'development',
      priority: 'high',
      assignedTo: 'frontend',
      estimatedHours: 4,
      xpReward: 80,
    });
    onRefresh();
  };

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
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE AGENT DATABASE CONNECTED
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono bg-[#090d14] px-3.5 py-1.5 rounded-xl border border-pink-900/50 text-slate-300">
              <span className="text-amber-400 font-bold">🔥 12-Day Streak</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-300 font-bold">⭐ {agency.agency.xp} XP</span>
              <span className="text-slate-600">|</span>
              <span className="text-purple-300 font-bold">💼 {agency.projects.length} Projects</span>
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

            {/* Bottom Current Project Progress Widget */}
            <div className="p-3 bg-[#0d1420] border border-pink-900/40 rounded-xl font-mono text-[11px]">
              <div className="text-[10px] text-slate-400 uppercase font-bold truncate mb-1">
                {currentProject?.name}
              </div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>Progress</span>
                <span className="text-pink-400 font-bold">{projectProgressPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${projectProgressPct}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block text-center">
                {doneTasks.length}/{projectTasks.length} tasks completed
              </span>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────
              MAIN CONTENT TAB AREA
              ──────────────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-5 bg-[#070a0f] space-y-4">

            {/* ════════════ TAB 1: STRUCTURED PROJECT MISSION ════════════ */}
            {activeTab === 'mission' && (
              <div className="space-y-4 animate-in fade-in">
                
                {/* 1. Project Selector Bar */}
                <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-bold text-slate-400">📁 ACTIVE PROJECT:</span>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="bg-[#080d14] border border-pink-500/50 text-pink-300 font-mono font-bold text-xs px-3.5 py-2 rounded-xl outline-none shadow-[0_0_15px_rgba(244,114,182,0.15)] cursor-pointer"
                    >
                      {agency.projects.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${p.value.toLocaleString()}) — [{p.phase.toUpperCase()}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setShowNewTaskModal(true)}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-mono font-bold text-xs rounded-xl transition shadow-[0_0_20px_rgba(244,114,182,0.3)] flex items-center gap-1.5"
                  >
                    <span>➕</span> Add Project Task
                  </button>
                </div>

                {/* 2. Structured Project Status & Roadmap Stepper */}
                <div className="p-4 bg-[#0a111a] border border-slate-800 rounded-2xl space-y-3 font-mono">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <div>
                      <h2 className="text-sm font-black text-slate-100 flex items-center gap-2">
                        <span>💼</span> {currentProject?.name}
                        <span className="text-xs px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-800">
                          Client: {currentProject?.clientName}
                        </span>
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {currentProject?.notes || 'Core agency deliverable roadmap.'}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400">
                        💰 ${currentProject?.value.toLocaleString()} Budget
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Status: <strong className="text-pink-300 uppercase">{currentProject?.phase}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Visual Stepper */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-bold text-center pt-1">
                    {['discovery', 'architecture', 'design', 'development', 'launch'].map((phase, idx) => {
                      const isPast = ['discovery', 'architecture', 'design'].includes(phase) && currentProject.phase === 'build';
                      const isCurrent = (phase === 'development' && currentProject.phase === 'build') || phase === currentProject.phase;
                      return (
                        <div
                          key={phase}
                          className={`p-2 rounded-xl border ${
                            isPast
                              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                              : isCurrent
                              ? 'bg-pink-950/80 border-pink-500 text-pink-300 shadow-[0_0_15px_rgba(244,114,182,0.25)]'
                              : 'bg-[#080d14] border-slate-800 text-slate-500'
                          }`}
                        >
                          <div className="text-xs">{isPast ? '✅' : isCurrent ? '⚡' : '📋'} Step {idx + 1}</div>
                          <div className="uppercase tracking-wider mt-0.5">{phase}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Overall Milestone Completion</span>
                      <strong className="text-pink-400 font-bold">{doneTasks.length} of {projectTasks.length} Tasks Done ({projectProgressPct}%)</strong>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${projectProgressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. In Progress Sprints for This Project */}
                <div className="space-y-2 font-mono">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <span>⚡</span> CURRENT IN-PROGRESS SPRINTS ({inProgressTasks.length})
                    </span>
                    <span className="text-slate-500 text-[11px]">Click complete when code is merged</span>
                  </div>

                  {inProgressTasks.length === 0 ? (
                    <div className="p-6 bg-[#080d14] border border-slate-800 rounded-xl text-center text-xs text-slate-500">
                      ✨ No active tasks blocked for this project. Select an upcoming task from the backlog below!
                    </div>
                  ) : (
                    inProgressTasks.map(task => (
                      <div
                        key={task.id}
                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                          task.status === 'blocked'
                            ? 'bg-rose-950/30 border-rose-600/60 text-slate-200'
                            : 'bg-[#0d1522] border-pink-500/40 text-slate-100 shadow-[0_0_20px_rgba(244,114,182,0.15)]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[10px] font-bold">
                            <span className="px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-700/60 uppercase">
                              {task.phase}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                              Priority: {task.priority.toUpperCase()}
                            </span>
                            <span className="text-cyan-300 font-bold">+{task.xpReward || 100} XP</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-100">{task.title}</h3>
                          <p className="text-xs text-slate-400 font-normal">{task.description}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleBlocker(task)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                              task.status === 'blocked'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            <span>🚨</span>
                            <span>{task.status === 'blocked' ? 'BLOCKED' : 'REPORT BLOCKER'}</span>
                          </button>
                          <button
                            onClick={() => handleCompleteTask(task.id, task.title, task.xpReward || 100)}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5"
                          >
                            <span>✅</span>
                            <span>MARK DONE</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 4. Completed Tasks Log for this Project */}
                <div className="p-4 bg-[#0a111a] border border-slate-800 rounded-2xl space-y-3 font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <span>✅</span> FINISHED DELIVERABLES FOR THIS PROJECT ({doneTasks.length})
                    </span>
                    <span className="text-slate-500 text-[11px]">Audit log of completed milestones</span>
                  </div>

                  {doneTasks.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500">
                      No tasks completed yet for this project.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {doneTasks.map(task => (
                        <div
                          key={task.id}
                          className="p-3 bg-[#060c14] border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-emerald-400">✅</span>
                            <span className="text-slate-300 font-bold line-through">{task.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              {task.phase}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px]">
                            <span className="text-amber-400 font-bold">+{task.xpReward || 100} XP</span>
                            <span className="text-slate-500">
                              {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Completed'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Queued Upcoming Roadmap Tasks */}
                {queuedTasks.length > 0 && (
                  <div className="p-4 bg-[#0a111a] border border-slate-800 rounded-2xl space-y-3 font-mono">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                      <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                        <span>📋</span> UPCOMING ROADMAP QUEUE ({queuedTasks.length})
                      </span>
                    </div>

                    <div className="space-y-2">
                      {queuedTasks.map(task => (
                        <div
                          key={task.id}
                          className="p-3 bg-[#060c14] border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-300">{task.title}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{task.description}</div>
                          </div>
                          <button
                            onClick={() => {
                              manager.updateTask(task.id, { status: 'active' });
                              showToast(`🚀 Moved to Active Sprint: ${task.title}!`, '⚡');
                              onRefresh();
                            }}
                            className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 font-bold text-xs rounded-lg transition"
                          >
                            ▶️ Start Sprint
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ════════════ TAB 2: ALL TASKS & BACKLOG ════════════ */}
            {activeTab === 'tasks' && (
              <div className="space-y-4 font-mono animate-in fade-in">
                <div className="p-3.5 bg-[#0d1522] border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <span>📋 FILTER TASKS:</span>
                    <button
                      onClick={() => setTaskFilter('all')}
                      className={`px-3 py-1.5 rounded-xl transition ${
                        taskFilter === 'all' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      All Tasks ({agency.tasks.length})
                    </button>
                    <button
                      onClick={() => setTaskFilter('mine')}
                      className={`px-3 py-1.5 rounded-xl transition ${
                        taskFilter === 'mine' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Frontend Only ({agency.tasks.filter(t => t.assignedTo === 'frontend').length})
                    </button>
                    <button
                      onClick={() => setTaskFilter('done')}
                      className={`px-3 py-1.5 rounded-xl transition ${
                        taskFilter === 'done' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Completed ({agency.tasks.filter(t => t.status === 'done').length})
                    </button>
                  </div>

                  <button
                    onClick={() => setShowNewTaskModal(true)}
                    className="px-3.5 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl"
                  >
                    ➕ New Task
                  </button>
                </div>

                <div className="space-y-2.5">
                  {agency.tasks
                    .filter(t => {
                      if (taskFilter === 'mine') return t.assignedTo === 'frontend';
                      if (taskFilter === 'done') return t.status === 'done';
                      return true;
                    })
                    .map(task => {
                      const proj = agency.projects.find(p => p.id === task.projectId);
                      return (
                        <div
                          key={task.id}
                          className="p-3.5 bg-[#0a111a] border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-bold">
                              <span className="text-pink-400">{proj?.name || 'General Agency'}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-400 uppercase">Assigned: {task.assignedTo || 'Unassigned'}</span>
                              <span className="text-slate-600">•</span>
                              <span className={`px-1.5 py-0.5 rounded ${
                                task.status === 'done' ? 'bg-emerald-950 text-emerald-300' :
                                task.status === 'active' ? 'bg-cyan-950 text-cyan-300' :
                                'bg-slate-800 text-slate-400'
                              }`}>
                                {task.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="font-bold text-slate-100">{task.title}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            {task.status !== 'done' && (
                              <button
                                onClick={() => handleCompleteTask(task.id, task.title, task.xpReward || 80)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ════════════ TAB 3: SKILLS & MASTERY ════════════ */}
            {activeTab === 'skills' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                  <span>🧠</span> FRONTEND PROFICIENCIES & SKILL TREE
                </h3>
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
                </div>
              </div>
            )}

            {/* ════════════ TAB 4: BOSS BATTLES ════════════ */}
            {activeTab === 'bosses' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                  <span>🏆</span> BOSS BATTLES DEFEATED
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800 flex items-center justify-between">
                    <span>👾 Realtime WebSocket Buylist Sync Engine</span>
                    <span className="text-emerald-400 font-bold">✅ Defeated</span>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════ TAB 5: PORTFOLIO ════════════ */}
            {activeTab === 'portfolio' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                  <span>🏛️</span> SHIPPED CODEBASES & REPOSITORIES
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {agency.projects.map(p => (
                    <div key={p.id} className="p-3.5 bg-[#080d14] rounded-xl border border-slate-800">
                      <div className="flex justify-between text-slate-200 font-bold mb-1">
                        <span>{p.name}</span>
                        <span className="text-emerald-400">${p.value.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">Phase: {p.phase} · {p.industry}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════════════ TAB 6: PROGRESS & ANALYTICS ════════════ */}
            {activeTab === 'analytics' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                  <span>📊</span> LIFETIME METRICS & XP VELOCITY
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">TOTAL TASKS</span>
                    <strong className="text-pink-400 text-lg font-bold">{agency.stats.totalTasksCompleted} Done</strong>
                  </div>
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">TOTAL XP</span>
                    <strong className="text-amber-400 text-lg font-bold">{agency.agency.xp} XP</strong>
                  </div>
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">HOURS LOGGED</span>
                    <strong className="text-cyan-400 text-lg font-bold">{agency.stats.hoursLogged}h</strong>
                  </div>
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">REPUTATION</span>
                    <strong className="text-emerald-400 text-lg font-bold">{agency.resources.reputation}/100</strong>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════ TAB 7: ENVIRONMENT ════════════ */}
            {activeTab === 'settings' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono text-xs animate-in fade-in">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                  <span>⚙️</span> WORKSTATION PREFERENCES & REALTIME HOOKS
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span>Cloud Realtime Sync</span>
                    <span className="text-emerald-400 font-bold">SUPABASE ACTIVE</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            CREATE NEW TASK MODAL
            ════════════════════════════════════════════════════════════════════ */}
        {showNewTaskModal && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-lg bg-[#0e1622] border border-pink-500/50 rounded-2xl p-6 font-mono text-xs shadow-2xl">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
                <strong className="text-sm text-pink-400">➕ Add Project Task</strong>
                <button onClick={() => setShowNewTaskModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-slate-400 mb-1">Target Project:</label>
                  <div className="p-2.5 bg-[#080d14] border border-slate-700 rounded-lg text-slate-200 font-bold">
                    {currentProject?.name} (${currentProject?.value.toLocaleString()})
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Task Title:</label>
                  <input
                    type="text"
                    value={newTaskInput.title}
                    onChange={e => setNewTaskInput({ ...newTaskInput, title: e.target.value })}
                    placeholder="e.g. Build Realtime WebSocket Buylist Table"
                    className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Description / Spec:</label>
                  <textarea
                    value={newTaskInput.description}
                    onChange={e => setNewTaskInput({ ...newTaskInput, description: e.target.value })}
                    placeholder="Technical requirements, deliverables, and acceptance criteria..."
                    className="w-full h-20 bg-[#080d14] border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none focus:border-pink-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Phase:</label>
                    <select
                      value={newTaskInput.phase}
                      onChange={e => setNewTaskInput({ ...newTaskInput, phase: e.target.value })}
                      className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2 text-slate-200 outline-none"
                    >
                      <option value="discovery">Discovery</option>
                      <option value="architecture">Architecture</option>
                      <option value="design">Design</option>
                      <option value="development">Development</option>
                      <option value="testing">Testing</option>
                      <option value="launch">Launch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Assigned Role:</label>
                    <select
                      value={newTaskInput.assignedTo}
                      onChange={e => setNewTaskInput({ ...newTaskInput, assignedTo: e.target.value })}
                      className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2 text-slate-200 outline-none"
                    >
                      <option value="frontend">Frontend Dev</option>
                      <option value="backend">Backend Dev</option>
                      <option value="designer">Lead Designer</option>
                      <option value="founder">Executive Founder</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setShowNewTaskModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTask}
                    className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(244,114,182,0.3)]"
                  >
                    Create Task
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
