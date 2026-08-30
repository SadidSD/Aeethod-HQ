import { useState, useEffect } from 'react';
import { AgencyState, AgencyTask, Project } from '../core/agencyTypes';
import AgencyManager from '../core/agency';

interface DesignerModalProps {
  agency: AgencyState;
  manager: AgencyManager;
  onClose: () => void;
  onRefresh: () => void;
}

type TabId = 'projects' | 'tasks' | 'bosses' | 'portfolio' | 'analytics' | 'settings';

interface TabDef {
  id: TabId;
  label: string;
  icon: string;
  shortcut: string;
}

const TABS: TabDef[] = [
  { id: 'projects', label: 'Projects Hub', icon: '📁', shortcut: '1' },
  { id: 'tasks', label: 'My Design Tasks', icon: '🎯', shortcut: '2' },
  { id: 'bosses', label: 'Design Bosses', icon: '🏆', shortcut: '3' },
  { id: 'portfolio', label: 'Design Systems', icon: '🏛️', shortcut: '4' },
  { id: 'analytics', label: 'Studio Velocity', icon: '📊', shortcut: '5' },
  { id: 'settings', label: 'Figma Config', icon: '⚙️', shortcut: '6' },
];

export default function DesignerModal({ agency, manager, onClose, onRefresh }: DesignerModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('projects');

  // Employee info
  const designerMember = agency.team.find(m => m.id === 'designer' || m.room === 'design') || {
    name: 'Elena Rostova',
    level: 8,
    xp: 280,
    status: 'working'
  };

  // Selected Project for Drill-down View (null = show all projects grid)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProject = agency.projects.find(p => p.id === selectedProjectId) || null;
  const projectTasks = selectedProject ? agency.tasks.filter(t => t.projectId === selectedProject.id) : [];
  const doneTasks = projectTasks.filter(t => t.status === 'done');
  const inProgressTasks = projectTasks.filter(t => t.status === 'active' || t.status === 'blocked');
  const queuedTasks = projectTasks.filter(t => t.status === 'queued');

  const projectProgressPct = projectTasks.length > 0
    ? Math.round((doneTasks.length / projectTasks.length) * 100)
    : (selectedProject?.phase === 'completed' ? 100 : 0);

  // Notification Toast
  const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);

  const showToast = (message: string, icon = '🎨') => {
    setNotification({ message, icon });
    setTimeout(() => setNotification(null), 3500);
  };

  // Sorting & Filtering State for Assigned Tasks
  const [taskSortBy, setTaskSortBy] = useState<'priority' | 'status' | 'xp_desc' | 'xp_asc' | 'hours_asc' | 'hours_desc' | 'project' | 'newest'>('priority');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'active' | 'blocked' | 'queued' | 'done'>('all');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');

  // New Task Modal
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState({
    title: '',
    description: '',
    phase: 'design',
    priority: 'high',
    assignedTo: 'designer',
    estimatedHours: 5,
    xpReward: 90,
  });

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showNewTaskModal) {
          setShowNewTaskModal(false);
        } else if (selectedProjectId) {
          setSelectedProjectId(null); // Back to projects list
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
  }, [onClose, showNewTaskModal, selectedProjectId]);

  const handleCompleteTask = (taskId: string, title: string, xp: number) => {
    manager.completeTask(taskId);
    showToast(`🎨 Shipped: ${title}! +${xp} XP awarded!`, '✨');
    onRefresh();
  };

  const handleToggleBlocker = (task: AgencyTask) => {
    const nextStatus = task.status === 'blocked' ? 'active' : 'blocked';
    manager.updateTask(task.id, { status: nextStatus });
    showToast(nextStatus === 'blocked' ? '🚨 Design Feedback Blocker reported!' : '✅ Blocker cleared!', nextStatus === 'blocked' ? '🚨' : '✅');
    onRefresh();
  };

  const handleCreateTask = () => {
    if (!newTaskInput.title.trim() || !selectedProject) return;
    manager.addTask({
      title: newTaskInput.title,
      description: newTaskInput.description || 'Figma design spec and component system deliverable.',
      projectId: selectedProject.id,
      assignedTo: newTaskInput.assignedTo,
      phase: newTaskInput.phase as any,
      status: 'active',
      priority: newTaskInput.priority as any,
      cognitiveLoad: 'deep',
      estimatedHours: Number(newTaskInput.estimatedHours) || 5,
      xpReward: Number(newTaskInput.xpReward) || 90,
      deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    });
    showToast(`🎨 Added Design Task to ${selectedProject.name}!`, '✨');
    setShowNewTaskModal(false);
    setNewTaskInput({
      title: '',
      description: '',
      phase: 'design',
      priority: 'high',
      assignedTo: 'designer',
      estimatedHours: 5,
      xpReward: 90,
    });
    onRefresh();
  };

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
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  FIGMA CLOUD: SYNCED
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono bg-[#090d14] px-3.5 py-1.5 rounded-xl border border-amber-900/50 text-slate-300">
              <span className="text-amber-400 font-bold">🔥 14-Day Streak</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-300 font-bold">⭐ {agency.agency.xp} XP</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-bold">🎨 148 Tokens</span>
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

            {/* Bottom Overview Card */}
            <div className="p-3 bg-[#0d1420] border border-amber-900/40 rounded-xl font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>CLIENT SYSTEMS</span>
                <span className="text-amber-400 font-bold">{agency.projects.length} Active</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Click any project card to view & approve design tokens.
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────
              MAIN CONTENT AREA
              ──────────────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-5 bg-[#070a0f] space-y-4">

            {/* ════════════ TAB 1: PROJECTS HUB (DRILL-DOWN) ════════════ */}
            {activeTab === 'projects' && (
              <div className="space-y-4 animate-in fade-in">

                {/* LEVEL 1: ALL PROJECTS GRID */}
                {!selectedProject ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <h2 className="text-sm font-black text-slate-100 font-mono tracking-wide flex items-center gap-2">
                          <span>📁</span> DESIGN CLIENT PROJECTS ({agency.projects.length})
                        </h2>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Select a project below to enter its workspace and view assigned tasks.
                        </p>
                      </div>
                    </div>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                      {agency.projects.map(project => {
                        const pTasks = agency.tasks.filter(t => t.projectId === project.id);
                        const pDone = pTasks.filter(t => t.status === 'done');
                        const pActive = pTasks.filter(t => t.status === 'active' || t.status === 'blocked');
                        const pct = pTasks.length > 0 ? Math.round((pDone.length / pTasks.length) * 100) : (project.phase === 'completed' ? 100 : 0);

                        return (
                          <div
                            key={project.id}
                            onClick={() => setSelectedProjectId(project.id)}
                            className="p-5 bg-[#0d1522] border border-slate-800 hover:border-amber-500/60 rounded-2xl cursor-pointer transition hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col justify-between gap-4 group"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 uppercase">
                                  {project.industry}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  project.phase === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
                                  'bg-amber-950 text-amber-300 border border-amber-700'
                                } uppercase`}>
                                  Phase: {project.phase}
                                </span>
                              </div>

                              <h3 className="text-base font-black text-slate-100 group-hover:text-amber-300 transition">
                                {project.name}
                              </h3>

                              <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>Client: <strong className="text-slate-200">{project.clientName}</strong></span>
                                <span className="text-emerald-400 font-bold">${project.value.toLocaleString()}</span>
                              </div>

                              <p className="text-[11px] text-slate-500 line-clamp-2">
                                {project.notes || 'Creative visual system.'}
                              </p>
                            </div>

                            {/* Progress Bar & Open Action */}
                            <div className="space-y-2 pt-3 border-t border-slate-800/80">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Design Deliverables Approved</span>
                                <strong className="text-amber-400 font-bold">{pct}% ({pDone.length}/{pTasks.length} Tasks)</strong>
                              </div>
                              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-500 to-rose-400 transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>

                              <div className="pt-2 flex items-center justify-between text-xs font-bold">
                                <span className="text-amber-400 text-[11px]">
                                  ⚡ {pActive.length} Active Sprints
                                </span>
                                <span className="text-amber-400 group-hover:underline flex items-center gap-1">
                                  <span>Enter Project</span>
                                  <span>➔</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* LEVEL 2: DRILL-DOWN INSIDE A SPECIFIC PROJECT */
                  <div className="space-y-4 font-mono animate-in fade-in">
                    
                    {/* Breadcrumb Header & Back Button */}
                    <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedProjectId(null)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-700"
                        >
                          <span>⬅️</span>
                          <span>ALL PROJECTS</span>
                        </button>
                        <span className="text-slate-600">/</span>
                        <div>
                          <h2 className="text-sm font-black text-slate-100 flex items-center gap-2">
                            <span>💼</span> {selectedProject.name}
                            <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                              Client: {selectedProject.clientName}
                            </span>
                          </h2>
                          <span className="text-[11px] text-emerald-400 font-bold">
                            💰 ${selectedProject.value.toLocaleString()} Budget · Phase: {selectedProject.phase.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowNewTaskModal(true)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-1.5"
                      >
                        <span>➕</span> Add Task to {selectedProject.name}
                      </button>
                    </div>

                    {/* Project Phase Stepper & Overall Progress */}
                    <div className="p-4 bg-[#0a111a] border border-slate-800 rounded-2xl space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-bold text-center">
                        {['discovery', 'architecture', 'design', 'development', 'launch'].map((phase, idx) => {
                          const isPast = ['discovery', 'architecture'].includes(phase) && selectedProject.phase === 'build';
                          const isCurrent = (phase === 'design' && selectedProject.phase === 'build') || phase === selectedProject.phase;
                          return (
                            <div
                              key={phase}
                              className={`p-2 rounded-xl border ${
                                isPast
                                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                                  : isCurrent
                                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
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
                          <span>Design Deliverables for {selectedProject.name}</span>
                          <strong className="text-amber-400 font-bold">{doneTasks.length} of {projectTasks.length} Done ({projectProgressPct}%)</strong>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${projectProgressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Active In-Progress Tasks */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <span>⚡</span> ACTIVE IN-PROGRESS TASKS ({inProgressTasks.length})
                        </span>
                      </div>

                      {inProgressTasks.length === 0 ? (
                        <div className="p-6 bg-[#080d14] border border-slate-800 rounded-xl text-center text-xs text-slate-500">
                          ✨ All design tasks currently approved for this project!
                        </div>
                      ) : (
                        inProgressTasks.map(task => (
                          <div
                            key={task.id}
                            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                              task.status === 'blocked'
                                ? 'bg-rose-950/30 border-rose-600/60 text-slate-200'
                                : 'bg-[#0d1522] border-amber-500/40 text-slate-100 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-[10px] font-bold">
                                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60 uppercase">
                                  {task.phase}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 uppercase">
                                  Assigned: {task.assignedTo || 'Team'}
                                </span>
                                <span className="text-cyan-300 font-bold">+{task.xpReward || 90} XP</span>
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
                                <span>{task.status === 'blocked' ? 'BLOCKED' : 'REPORT FEEDBACK'}</span>
                              </button>
                              <button
                                onClick={() => handleCompleteTask(task.id, task.title, task.xpReward || 90)}
                                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl transition shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5"
                              >
                                <span>🎨</span>
                                <span>APPROVE DESIGN</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Finished Deliverables */}
                    <div className="p-4 bg-[#0a111a] border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <span>✅</span> COMPLETED TASKS IN THIS PROJECT ({doneTasks.length})
                        </span>
                      </div>

                      {doneTasks.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-500">
                          No design tasks finished yet for this project.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {doneTasks.map(task => (
                            <div
                              key={task.id}
                              className="p-3 bg-[#080d14] border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-emerald-400">✅</span>
                                <span className="text-slate-300 font-bold line-through">{task.title}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                  {task.phase}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[11px]">
                                <span className="text-amber-400 font-bold">+{task.xpReward || 90} XP</span>
                                <span className="text-slate-500">
                                  {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Approved'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* ════════════ TAB 2: MY ASSIGNED TASKS (WITH SORTING & FILTERING) ════════════ */}
            {activeTab === 'tasks' && (() => {
              const myTasks = agency.tasks.filter(t => t.assignedTo === 'designer');

              // Filtered list
              const filtered = myTasks.filter(task => {
                const proj = agency.projects.find(p => p.id === task.projectId);
                const matchesStatus =
                  taskStatusFilter === 'all' ||
                  (taskStatusFilter === 'active' && task.status === 'active') ||
                  (taskStatusFilter === 'blocked' && task.status === 'blocked') ||
                  (taskStatusFilter === 'queued' && task.status === 'queued') ||
                  (taskStatusFilter === 'done' && task.status === 'done');

                const matchesSearch =
                  !taskSearchQuery.trim() ||
                  task.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
                  (proj && proj.name.toLowerCase().includes(taskSearchQuery.toLowerCase()));

                return matchesStatus && matchesSearch;
              });

              // Sorted list
              const sorted = [...filtered].sort((a, b) => {
                if (taskSortBy === 'priority') {
                  const pRank: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
                  return (pRank[b.priority] || 0) - (pRank[a.priority] || 0);
                }
                if (taskSortBy === 'xp_desc') {
                  return (b.xpReward || 0) - (a.xpReward || 0);
                }
                if (taskSortBy === 'xp_asc') {
                  return (a.xpReward || 0) - (b.xpReward || 0);
                }
                if (taskSortBy === 'hours_asc') {
                  return (a.estimatedHours || 0) - (b.estimatedHours || 0);
                }
                if (taskSortBy === 'hours_desc') {
                  return (b.estimatedHours || 0) - (a.estimatedHours || 0);
                }
                if (taskSortBy === 'project') {
                  const pA = agency.projects.find(p => p.id === a.projectId)?.name || '';
                  const pB = agency.projects.find(p => p.id === b.projectId)?.name || '';
                  return pA.localeCompare(pB);
                }
                if (taskSortBy === 'newest') {
                  return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                }
                if (taskSortBy === 'status') {
                  const sRank: Record<string, number> = { active: 4, blocked: 3, queued: 2, done: 1 };
                  return (sRank[b.status] || 0) - (sRank[a.status] || 0);
                }
                return 0;
              });

              const totalXPPotential = myTasks.filter(t => t.status !== 'done').reduce((acc, t) => acc + (t.xpReward || 0), 0);
              const totalHoursRemaining = myTasks.filter(t => t.status !== 'done').reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

              return (
                <div className="space-y-4 font-mono animate-in fade-in">
                  
                  {/* Top Stats Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-[#0d1522] border border-slate-800 rounded-xl">
                      <span className="text-slate-500 text-[10px] block">TOTAL ASSIGNED</span>
                      <strong className="text-amber-400 text-sm font-bold">{myTasks.length} Tasks</strong>
                    </div>
                    <div className="p-3 bg-[#0d1522] border border-slate-800 rounded-xl">
                      <span className="text-slate-500 text-[10px] block">IN PROGRESS / QUEUED</span>
                      <strong className="text-amber-300 text-sm font-bold">
                        {myTasks.filter(t => t.status !== 'done').length} Active
                      </strong>
                    </div>
                    <div className="p-3 bg-[#0d1522] border border-slate-800 rounded-xl">
                      <span className="text-slate-500 text-[10px] block">ESTIMATED WORK</span>
                      <strong className="text-cyan-400 text-sm font-bold">{totalHoursRemaining} Hours</strong>
                    </div>
                    <div className="p-3 bg-[#0d1522] border border-slate-800 rounded-xl">
                      <span className="text-slate-500 text-[10px] block">AVAILABLE XP</span>
                      <strong className="text-emerald-400 text-sm font-bold">+{totalXPPotential} XP</strong>
                    </div>
                  </div>

                  {/* Search, Filter & Sort Controls Toolbar */}
                  <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-3">
                    
                    {/* Search & Sort Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {/* Search Bar */}
                      <div className="relative flex-1 min-w-[220px]">
                        <input
                          type="text"
                          value={taskSearchQuery}
                          onChange={e => setTaskSearchQuery(e.target.value)}
                          placeholder="🔍 Search design tasks or project names..."
                          className="w-full bg-[#080d14] border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none"
                        />
                        {taskSearchQuery && (
                          <button
                            onClick={() => setTaskSearchQuery('')}
                            className="absolute right-3 top-2 text-slate-500 hover:text-slate-300 text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Sorting Dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs font-bold whitespace-nowrap">↕️ SORT BY:</span>
                        <select
                          value={taskSortBy}
                          onChange={e => setTaskSortBy(e.target.value as any)}
                          className="bg-[#080d14] border border-amber-500/50 text-amber-300 font-mono font-bold text-xs px-3 py-2 rounded-xl outline-none cursor-pointer"
                        >
                          <option value="priority">🔥 Priority (Urgent first)</option>
                          <option value="status">⚡ Status (Active first)</option>
                          <option value="xp_desc">⭐ XP Reward (Highest first)</option>
                          <option value="xp_asc">⭐ XP Reward (Lowest first)</option>
                          <option value="hours_asc">⏳ Estimated Hours (Shortest)</option>
                          <option value="hours_desc">⏳ Estimated Hours (Longest)</option>
                          <option value="project">📁 Project Name (A-Z)</option>
                          <option value="newest">📅 Recently Added (Newest)</option>
                        </select>
                      </div>
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs font-bold">
                      <span className="text-slate-400 mr-1">STATUS:</span>
                      {[
                        { id: 'all', label: `All (${myTasks.length})` },
                        { id: 'active', label: `⚡ In Progress (${myTasks.filter(t => t.status === 'active').length})` },
                        { id: 'blocked', label: `🚨 Blocked (${myTasks.filter(t => t.status === 'blocked').length})` },
                        { id: 'queued', label: `📋 Queued (${myTasks.filter(t => t.status === 'queued').length})` },
                        { id: 'done', label: `✅ Completed (${myTasks.filter(t => t.status === 'done').length})` },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setTaskStatusFilter(tab.id as any)}
                          className={`px-3 py-1.5 rounded-xl transition ${
                            taskStatusFilter === tab.id
                              ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                              : 'bg-[#080d14] border border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                  </div>

                  {/* Task List */}
                  <div className="space-y-2.5">
                    {sorted.length === 0 ? (
                      <div className="p-8 bg-[#080d14] border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
                        🔍 No tasks match your current filter and search query.
                      </div>
                    ) : (
                      sorted.map(task => {
                        const proj = agency.projects.find(p => p.id === task.projectId);
                        const priorityColor = {
                          urgent: 'bg-rose-950 text-rose-300 border-rose-800',
                          high: 'bg-amber-950 text-amber-300 border-amber-800',
                          medium: 'bg-blue-950 text-blue-300 border-blue-800',
                          low: 'bg-slate-800 text-slate-400 border-slate-700',
                        }[task.priority] || 'bg-slate-800 text-slate-400 border-slate-700';

                        return (
                          <div
                            key={task.id}
                            className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                              task.status === 'blocked'
                                ? 'bg-rose-950/20 border-rose-700/60'
                                : task.status === 'done'
                                ? 'bg-[#080d14] border-slate-800/80 text-slate-400'
                                : 'bg-[#0a111a] border-slate-800 hover:border-amber-500/50'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                                {proj && (
                                  <span
                                    onClick={() => {
                                      setSelectedProjectId(proj.id);
                                      setActiveTab('projects');
                                    }}
                                    className="cursor-pointer text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800 hover:underline"
                                    title="Click to open project"
                                  >
                                    📁 {proj.name}
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 rounded border uppercase ${priorityColor}`}>
                                  {task.priority} Priority
                                </span>
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                                  {task.phase}
                                </span>
                                <span className={`px-2 py-0.5 rounded uppercase ${
                                  task.status === 'done' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                                  task.status === 'blocked' ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse' :
                                  task.status === 'active' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                  'bg-slate-800 text-slate-400'
                                }`}>
                                  {task.status}
                                </span>
                              </div>

                              <h4 className={`text-sm font-bold ${task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-xs text-slate-400">{task.description}</p>
                              )}
                            </div>

                            {/* Task Action & Metrics */}
                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                              <div className="text-right text-xs">
                                <div className="text-amber-400 font-bold">+{task.xpReward || 90} XP</div>
                                <div className="text-[10px] text-slate-500">⏱️ {task.estimatedHours || 5}h est.</div>
                              </div>

                              {task.status !== 'done' ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleToggleBlocker(task)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                                      task.status === 'blocked' ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                    }`}
                                    title={task.status === 'blocked' ? 'Clear blocker' : 'Flag blocker'}
                                  >
                                    🚨
                                  </button>
                                  <button
                                    onClick={() => handleCompleteTask(task.id, task.title, task.xpReward || 90)}
                                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition"
                                  >
                                    Approve
                                  </button>
                                </div>
                              ) : (
                                <span className="text-emerald-400 font-bold text-xs">Done ✅</span>
                              )}
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              );
            })()}


            {/* ════════════ TAB 4: DESIGN BOSSES ════════════ */}
            {activeTab === 'bosses' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                  <span>🏆</span> DESIGN BOSSES DEFEATED
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

            {/* ════════════ TAB 6: STUDIO VELOCITY ════════════ */}
            {activeTab === 'analytics' && (
              <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-4 font-mono animate-in fade-in">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                  <span>📊</span> STUDIO VELOCITY & CREATIVE XP
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">TOTAL TASKS</span>
                    <strong className="text-amber-400 text-lg font-bold">{agency.stats.totalTasksCompleted} Done</strong>
                  </div>
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">TOTAL XP</span>
                    <strong className="text-cyan-400 text-lg font-bold">{agency.agency.xp} XP</strong>
                  </div>
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">STREAK</span>
                    <strong className="text-amber-400 text-lg font-bold">14 Days 🔥</strong>
                  </div>
                  <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">HOURS LOGGED</span>
                    <strong className="text-emerald-400 text-lg font-bold">{agency.stats.hoursLogged}h</strong>
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

        {/* ════════════════════════════════════════════════════════════════════
            CREATE NEW TASK MODAL
            ════════════════════════════════════════════════════════════════════ */}
        {showNewTaskModal && selectedProject && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-lg bg-[#0e1622] border border-amber-500/50 rounded-2xl p-6 font-mono text-xs shadow-2xl">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
                <strong className="text-sm text-amber-400">➕ Add Task to {selectedProject.name}</strong>
                <button onClick={() => setShowNewTaskModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-slate-400 mb-1">Target Project:</label>
                  <div className="p-2.5 bg-[#080d14] border border-slate-700 rounded-lg text-slate-200 font-bold">
                    {selectedProject.name} (${selectedProject.value.toLocaleString()})
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Task Title:</label>
                  <input
                    type="text"
                    value={newTaskInput.title}
                    onChange={e => setNewTaskInput({ ...newTaskInput, title: e.target.value })}
                    placeholder="e.g. Card Detail Modal & 3D Foil Hologram Spec"
                    className="w-full bg-[#080d14] border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Description / Spec:</label>
                  <textarea
                    value={newTaskInput.description}
                    onChange={e => setNewTaskInput({ ...newTaskInput, description: e.target.value })}
                    placeholder="Figma component hierarchy, variant tokens, and export assets..."
                    className="w-full h-20 bg-[#080d14] border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none focus:border-amber-500 resize-none"
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
                      <option value="designer">Lead Designer</option>
                      <option value="frontend">Frontend Dev</option>
                      <option value="backend">Backend Dev</option>
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
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  >
                    Create Design Task
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
