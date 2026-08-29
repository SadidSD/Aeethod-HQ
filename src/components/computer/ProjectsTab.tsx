import React, { useState } from 'react';
import { AgencyState, Project, ProjectPhase, HealthStatus, AgencyTask, TaskPhase } from '../../core/agencyTypes';
import AgencyManager from '../../core/agency';

interface ProjectsTabProps {
  agency: AgencyState;
  manager: AgencyManager;
  onRefresh: () => void;
}

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString();
}

const PHASES_LIST: { id: ProjectPhase; label: string; icon: string }[] = [
  { id: 'lead', label: 'Lead', icon: '🎯' },
  { id: 'discovery', label: 'Discovery', icon: '🔍' },
  { id: 'proposal', label: 'Proposal', icon: '📝' },
  { id: 'architecture', label: 'Architecture', icon: '📐' },
  { id: 'build', label: 'Development', icon: '⚡' },
  { id: 'launch', label: 'Launch', icon: '🚀' },
  { id: 'completed', label: 'Shipped', icon: '🏆' },
];

export default function ProjectsTab({ agency, manager, onRefresh }: ProjectsTabProps) {
  // View states
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState<'all' | 'green' | 'yellow' | 'red'>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // New Project Wizard modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    industry: 'TCG & Collectibles',
    packageType: 'professional' as 'essential' | 'professional' | 'enterprise',
    value: 12000,
    deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });

  // Quick Task in Project Detail state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPhase, setNewTaskPhase] = useState<TaskPhase>('development');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered projects
  const filteredProjects = agency.projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHealth = healthFilter === 'all' || p.health === healthFilter;
    const matchesPackage = packageFilter === 'all' || p.package.toLowerCase() === packageFilter.toLowerCase();
    return matchesSearch && matchesHealth && matchesPackage;
  });

  // Metrics
  const activeProjects = agency.projects.filter(p => p.phase !== 'completed');
  const completedProjects = agency.projects.filter(p => p.phase === 'completed');
  const activePipelineValue = activeProjects.reduce((sum, p) => sum + (p.value || 0), 0);
  const shippedValue = completedProjects.reduce((sum, p) => sum + (p.value || 0), 0);

  // Calculate days remaining
  const getDaysRemaining = (deadlineStr: string) => {
    if (!deadlineStr) return null;
    const diffMs = new Date(deadlineStr).getTime() - Date.now();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Advance phase handler
  const handleAdvancePhase = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    const phaseOrder: ProjectPhase[] = ['lead', 'discovery', 'proposal', 'architecture', 'build', 'launch', 'completed'];
    const currentIndex = phaseOrder.indexOf(project.phase);
    if (currentIndex !== -1 && currentIndex < phaseOrder.length - 1) {
      const nextPhase = phaseOrder[currentIndex + 1];
      if (nextPhase === 'completed') {
        manager.completeProject(project.id);
        showToast(`🎉 Project Delivered! +${formatCurrency(project.value)} added to Agency Revenue!`);
      } else {
        manager.updateProject(project.id, { phase: nextPhase });
        showToast(`🚀 ${project.name} advanced to ${nextPhase.toUpperCase()}`);
      }
      onRefresh();
      if (selectedProject?.id === project.id) {
        setSelectedProject({ ...project, phase: nextPhase });
      }
    }
  };

  // Complete & Ship project handler
  const handleShipProject = (project: Project) => {
    manager.completeProject(project.id);
    showToast(`🏆 ${project.name} shipped! Earned ${formatCurrency(project.value)} & +${Math.floor(project.value / 10)} XP!`);
    onRefresh();
    if (selectedProject?.id === project.id) {
      setSelectedProject({ ...project, phase: 'completed' });
    }
  };

  // Add Project submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProj = manager.addProject({
      name: formData.name,
      clientName: formData.clientName,
      industry: formData.industry,
      package: formData.packageType,
      value: formData.value,
      phase: 'discovery',
      startDate: new Date().toISOString(),
      deadline: new Date(formData.deadline).toISOString(),
      health: 'green',
      notes: 'Initial client kick-off phase',
      satisfaction: 100
    });

    // Auto-seed an initial discovery task
    manager.addTask({
      title: `${formData.name} — Requirements Discovery & Scope`,
      description: `Initial client architecture discovery for ${formData.clientName}`,
      projectId: newProj.id,
      assignedTo: agency.team[0]?.id || null,
      phase: 'discovery',
      status: 'active',
      priority: 'high',
      cognitiveLoad: 'deep',
      xpReward: 30,
      estimatedHours: 4,
      deadline: newProj.deadline
    });

    setShowCreateModal(false);
    showToast(`🚀 Created new project: ${formData.name}!`);
    onRefresh();
  };

  // Add Task to Project inside drawer
  const handleAddTaskToProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTaskTitle.trim()) return;

    manager.addTask({
      title: newTaskTitle.trim(),
      description: `Task for ${selectedProject.name}`,
      projectId: selectedProject.id,
      assignedTo: agency.team[0]?.id || null,
      phase: newTaskPhase,
      status: 'active',
      priority: 'medium',
      cognitiveLoad: 'medium',
      xpReward: 25,
      estimatedHours: 3,
      deadline: selectedProject.deadline
    });

    setNewTaskTitle('');
    showToast(`📋 Added task to ${selectedProject.name}`);
    onRefresh();
  };

  return (
    <div className="p-5 h-full flex flex-col space-y-4 text-slate-200 bg-[#080d14] overflow-hidden font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-14 right-8 z-50 px-4 py-2.5 bg-emerald-950 border border-emerald-500 rounded-lg shadow-xl text-emerald-200 text-xs font-bold animate-in fade-in flex items-center gap-2">
          <span>🔔</span> {notification}
        </div>
      )}

      {/* =========================================================================
          📊 TOP EXECUTIVE KPI BAR
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0e1622] border border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-slate-400 block font-mono">ACTIVE PIPELINE</span>
            <span className="text-lg font-black text-cyan-400 font-mono">{formatCurrency(activePipelineValue)}</span>
          </div>
          <span className="text-xl opacity-75">💼</span>
        </div>

        <div className="bg-[#0e1622] border border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-slate-400 block font-mono">PROJECTS IN FLIGHT</span>
            <span className="text-lg font-black text-amber-400 font-mono">{activeProjects.length} Active</span>
          </div>
          <span className="text-xl opacity-75">🚀</span>
        </div>

        <div className="bg-[#0e1622] border border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-slate-400 block font-mono">SHIPPED & INVOICED</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{formatCurrency(shippedValue)}</span>
          </div>
          <span className="text-xl opacity-75">🏆</span>
        </div>

        <div className="bg-[#0e1622] border border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-slate-400 block font-mono">DELIVERY REPUTATION</span>
            <span className="text-lg font-black text-purple-400 font-mono">98% Satisfaction</span>
          </div>
          <span className="text-xl opacity-75">⭐</span>
        </div>
      </div>

      {/* =========================================================================
          🎛️ CONTROLS & FILTER BAR
          ========================================================================= */}
      <div className="bg-[#0e1622] border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-2.5 top-2 text-slate-500 text-xs">🔍</span>
            <input 
              type="text" 
              placeholder="Search projects or clients..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#121c2a] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Health Filter */}
          <div className="flex items-center bg-[#121c2a] border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
            <button 
              onClick={() => setHealthFilter('all')} 
              className={`px-2.5 py-1 rounded ${healthFilter === 'all' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setHealthFilter('green')} 
              className={`px-2.5 py-1 rounded flex items-center gap-1 ${healthFilter === 'green' ? 'bg-emerald-950 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🟢 Healthy
            </button>
            <button 
              onClick={() => setHealthFilter('yellow')} 
              className={`px-2.5 py-1 rounded flex items-center gap-1 ${healthFilter === 'yellow' ? 'bg-amber-950 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🟡 Stalled
            </button>
            <button 
              onClick={() => setHealthFilter('red')} 
              className={`px-2.5 py-1 rounded flex items-center gap-1 ${healthFilter === 'red' ? 'bg-rose-950 text-rose-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🔴 Blocked
            </button>
          </div>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[#121c2a] border border-slate-800 rounded-lg p-0.5 text-xs">
            <button 
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition ${viewMode === 'kanban' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span>▦</span> Kanban Flow
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-bold transition ${viewMode === 'table' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span>☰</span> Executive Table
            </button>
          </div>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <span>+</span> New Project
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW A: INTERACTIVE KANBAN BOARD VIEW
          ========================================================================= */}
      {viewMode === 'kanban' && (
        <div className="flex gap-3.5 overflow-x-auto flex-1 pb-2 scrollbar-thin">
          {PHASES_LIST.map(phase => {
            const phaseProjects = filteredProjects.filter(p => p.phase === phase.id);
            const phaseTotalVal = phaseProjects.reduce((sum, p) => sum + (p.value || 0), 0);

            return (
              <div 
                key={phase.id} 
                className="bg-[#0e1622] border border-slate-800 rounded-xl min-w-[260px] max-w-[280px] flex-1 flex flex-col shadow-sm"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{phase.icon}</span>
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-200 font-mono">{phase.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold">
                      {phaseProjects.length}
                    </span>
                  </div>
                </div>

                {/* Sub-header value */}
                <div className="px-3 py-1 bg-[#121c2a] border-b border-slate-800/60 flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Volume:</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(phaseTotalVal)}</span>
                </div>

                {/* Projects Column Cards */}
                <div className="p-2.5 flex flex-col gap-2.5 flex-1 overflow-y-auto">
                  {phaseProjects.length === 0 ? (
                    <div className="h-28 border border-dashed border-slate-800/80 rounded-lg flex items-center justify-center text-slate-600 text-[11px] font-mono">
                      No active projects
                    </div>
                  ) : (
                    phaseProjects.map(p => {
                      const projectTasks = agency.tasks.filter(t => t.projectId === p.id);
                      const doneTasks = projectTasks.filter(t => t.status === 'done');
                      const progressPct = projectTasks.length > 0 ? Math.round((doneTasks.length / projectTasks.length) * 100) : 0;
                      const daysLeft = getDaysRemaining(p.deadline);

                      return (
                        <div 
                          key={p.id}
                          onClick={() => setSelectedProject(p)}
                          className={`bg-[#121c2a] border rounded-lg p-3 flex flex-col gap-2.5 cursor-pointer transition hover:scale-[1.01] hover:border-cyan-500/60 shadow-sm ${
                            p.health === 'red' ? 'border-rose-600/50 hover:border-rose-500' :
                            p.health === 'yellow' ? 'border-amber-500/40 hover:border-amber-400' : 'border-slate-800'
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="font-bold text-xs text-slate-100 block leading-tight hover:text-cyan-300 transition">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5 block">
                                {p.clientName} · <span className="text-slate-500">{p.industry}</span>
                              </span>
                            </div>
                            <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                              p.health === 'red' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' :
                              p.health === 'yellow' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-emerald-400'
                            }`} />
                          </div>

                          {/* Task Progress Bar */}
                          <div>
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                              <span>Tasks: {doneTasks.length}/{projectTasks.length}</span>
                              <span className="text-cyan-300 font-bold">{progressPct}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  progressPct === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                                }`}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Footer Info & Quick Actions */}
                          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-800/60">
                            <span className="font-bold font-mono text-emerald-400 text-xs">
                              {formatCurrency(p.value)}
                            </span>

                            {daysLeft !== null && p.phase !== 'completed' && (
                              <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                                daysLeft <= 1 ? 'bg-rose-950 text-rose-300 border border-rose-800/60' :
                                daysLeft <= 4 ? 'bg-amber-950 text-amber-300 border border-amber-800/60' : 'text-slate-400'
                              }`}>
                                {daysLeft <= 0 ? 'Due Today' : `${daysLeft}d left`}
                              </span>
                            )}
                          </div>

                          {/* Action Button */}
                          {p.phase !== 'completed' && (
                            <button
                              onClick={(e) => handleAdvancePhase(e, p)}
                              className="w-full mt-1 py-1 bg-[#18273a] hover:bg-cyan-900/60 border border-cyan-600/30 text-cyan-300 rounded text-[10px] font-bold transition flex items-center justify-center gap-1"
                            >
                              {p.phase === 'launch' ? '🎉 Deliver & Collect' : '→ Advance Phase'}
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          VIEW B: EXECUTIVE TABLE VIEW
          ========================================================================= */}
      {viewMode === 'table' && (
        <div className="bg-[#0e1622] border border-slate-800 rounded-xl flex-1 overflow-y-auto shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase bg-[#121c2a] sticky top-0 z-10">
                <th className="p-3">Project & Client</th>
                <th className="p-3">Industry & Tier</th>
                <th className="p-3 font-mono">Contract Value</th>
                <th className="p-3">Phase</th>
                <th className="p-3">Tasks Completed</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Health</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredProjects.map(p => {
                const projectTasks = agency.tasks.filter(t => t.projectId === p.id);
                const doneTasks = projectTasks.filter(t => t.status === 'done');
                const progressPct = projectTasks.length > 0 ? Math.round((doneTasks.length / projectTasks.length) * 100) : 0;
                const daysLeft = getDaysRemaining(p.deadline);

                return (
                  <tr 
                    key={p.id} 
                    onClick={() => setSelectedProject(p)}
                    className="hover:bg-[#131e2e] transition cursor-pointer"
                  >
                    <td className="p-3 font-bold text-slate-100">
                      <div>{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{p.clientName}</div>
                    </td>
                    <td className="p-3">
                      <div>{p.industry}</div>
                      <div className="text-[10px] text-cyan-400 uppercase font-mono">{p.package} Tier</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(p.value)}
                    </td>
                    <td className="p-3 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 uppercase text-[10px] font-bold border border-slate-700">
                        {p.phase}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${progressPct}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{doneTasks.length}/{projectTasks.length} ({progressPct}%)</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      {p.phase === 'completed' ? (
                        <span className="text-emerald-400">Shipped</span>
                      ) : (
                        <span className={daysLeft !== null && daysLeft <= 2 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-xs">
                      {p.health === 'red' ? (
                        <span className="text-rose-400 font-bold">🔴 Blocked</span>
                      ) : p.health === 'yellow' ? (
                        <span className="text-amber-400 font-bold">🟡 Stalled</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">🟢 Healthy</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedProject(p); }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 text-xs font-bold mr-2"
                      >
                        Inspect
                      </button>
                      {p.phase !== 'completed' && (
                        <button 
                          onClick={(e) => handleAdvancePhase(e, p)}
                          className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-white text-xs font-bold"
                        >
                          Advance
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================================
          🔍 PROJECT DETAIL COCKPIT MODAL / DRAWER
          ========================================================================= */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0e1622] border border-cyan-500/40 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)] text-slate-200">
            
            {/* Modal Header */}
            <div className="p-4 bg-[#121c2a] border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-100">{selectedProject.name}</h2>
                  <span className="text-xs px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded border border-cyan-800/50 uppercase font-mono">
                    {selectedProject.package} PACKAGE
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Client: <span className="text-slate-200 font-semibold">{selectedProject.clientName}</span> · Industry: {selectedProject.industry}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-base font-bold font-mono text-emerald-400">
                  {formatCurrency(selectedProject.value)}
                </span>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              
              {/* Phase Progression Stepper */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase font-mono block mb-2">
                  PROJECT LIFECYCLE PHASE
                </span>
                <div className="grid grid-cols-7 gap-1.5">
                  {PHASES_LIST.map((step, idx) => {
                    const isCurrent = selectedProject.phase === step.id;
                    const phaseOrder = ['lead', 'discovery', 'proposal', 'architecture', 'build', 'launch', 'completed'];
                    const stepIdx = phaseOrder.indexOf(step.id);
                    const currentIdx = phaseOrder.indexOf(selectedProject.phase);
                    const isPast = stepIdx < currentIdx;

                    return (
                      <button
                        key={step.id}
                        onClick={() => {
                          if (step.id === 'completed') {
                            handleShipProject(selectedProject);
                          } else {
                            manager.updateProject(selectedProject.id, { phase: step.id });
                            setSelectedProject({ ...selectedProject, phase: step.id });
                            onRefresh();
                          }
                        }}
                        className={`p-2 rounded text-center transition flex flex-col items-center gap-1 ${
                          isCurrent ? 'bg-cyan-600 text-white font-bold shadow-md' :
                          isPast ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40' :
                          'bg-[#121c2a] text-slate-500 border border-slate-800 hover:text-slate-300'
                        }`}
                      >
                        <span className="text-sm">{step.icon}</span>
                        <span className="text-[10px] font-mono leading-tight">{step.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Health & Status Toggles */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#121c2a] p-3 rounded-lg border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase font-mono block mb-2">
                    HEALTH & BOTTLENECK STATUS
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        manager.updateProject(selectedProject.id, { health: 'green' });
                        setSelectedProject({ ...selectedProject, health: 'green' });
                        onRefresh();
                      }}
                      className={`flex-1 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1 ${
                        selectedProject.health === 'green' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      🟢 Healthy
                    </button>
                    <button
                      onClick={() => {
                        manager.updateProject(selectedProject.id, { health: 'yellow' });
                        setSelectedProject({ ...selectedProject, health: 'yellow' });
                        onRefresh();
                      }}
                      className={`flex-1 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1 ${
                        selectedProject.health === 'yellow' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      🟡 Stalled
                    </button>
                    <button
                      onClick={() => {
                        manager.updateProject(selectedProject.id, { health: 'red' });
                        setSelectedProject({ ...selectedProject, health: 'red' });
                        onRefresh();
                      }}
                      className={`flex-1 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1 ${
                        selectedProject.health === 'red' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      🔴 Blocked
                    </button>
                  </div>
                </div>

                <div className="bg-[#121c2a] p-3 rounded-lg border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase font-mono block mb-2">
                    CONTRACT TIMELINE & SATISFACTION
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">TARGET DEADLINE</span>
                      <span className="font-mono text-slate-200 font-bold">
                        {selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString() : 'None'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">CLIENT NPS</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {selectedProject.satisfaction || 100}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Linked Tasks Section */}
              <div className="bg-[#121c2a] p-4 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center gap-1.5">
                    <span>📋</span> LINKED DELIVERABLES ({agency.tasks.filter(t => t.projectId === selectedProject.id).length})
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Check box to complete task & earn XP</span>
                </div>

                {/* Task Checklist */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {agency.tasks.filter(t => t.projectId === selectedProject.id).length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-500 font-mono">
                      No tasks assigned yet. Add one below!
                    </div>
                  ) : (
                    agency.tasks.filter(t => t.projectId === selectedProject.id).map(task => {
                      const isDone = task.status === 'done';
                      const assignedMember = agency.team.find(m => m.id === task.assignedTo);

                      return (
                        <div 
                          key={task.id} 
                          onClick={() => {
                            if (!isDone) {
                              manager.completeTask(task.id);
                              showToast(`✅ Completed ${task.title}!`);
                              onRefresh();
                            }
                          }}
                          className={`p-2.5 rounded border flex items-center justify-between gap-3 cursor-pointer transition ${
                            isDone ? 'bg-slate-900/40 border-slate-800 text-slate-500 line-through' : 'bg-[#0e1622] border-slate-800 hover:border-cyan-600/40 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="checkbox" 
                              checked={isDone} 
                              readOnly 
                              className="rounded border-slate-700 text-cyan-600 cursor-pointer" 
                            />
                            <div>
                              <span className="text-xs font-medium block leading-tight">{task.title}</span>
                              <span className="text-[10px] text-slate-500 block">
                                Phase: {task.phase} · Assigned: {assignedMember?.name || 'Unassigned'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 font-mono text-[10px]">
                            <span className="text-amber-400 font-bold">+{task.xpReward} XP</span>
                            <span className="text-slate-500">{task.estimatedHours}h</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Add Task to Project Form */}
                <form onSubmit={handleAddTaskToProject} className="mt-3 pt-3 border-t border-slate-800/80 flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="New sprint task title..."
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    className="flex-1 bg-[#0b1016] border border-slate-800 rounded p-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <select
                    value={newTaskPhase}
                    onChange={e => setNewTaskPhase(e.target.value as TaskPhase)}
                    className="bg-[#0b1016] border border-slate-800 rounded p-1.5 text-xs text-slate-300"
                  >
                    <option value="discovery">Discovery</option>
                    <option value="design">Design</option>
                    <option value="development">Dev</option>
                    <option value="testing">QA</option>
                    <option value="launch">Launch</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition"
                  >
                    + Add Task
                  </button>
                </form>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-[#121c2a] border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold transition"
              >
                Close Cockpit
              </button>

              {selectedProject.phase !== 'completed' ? (
                <button
                  onClick={() => handleShipProject(selectedProject)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-black tracking-wide transition flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  <span>🎉</span> DELIVER & COLLECT {formatCurrency(selectedProject.value)}
                </button>
              ) : (
                <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                  <span>🏆</span> Project Fully Shipped & Invoiced to Cathedral Wall
                </span>
              )}
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          ✨ NEW PROJECT CREATION WIZARD MODAL
          ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0e1622] border border-cyan-500/40 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-200">
            
            <div className="p-4 bg-[#121c2a] border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                <span>🚀</span> Initiate New Client Contract
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Project Name</label>
                <input 
                  required 
                  placeholder="e.g. CardVault Pro Marketplace"
                  className="bg-[#121c2a] border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-medium">Client / Company</label>
                  <input 
                    required 
                    placeholder="e.g. Apex Collectibles Ltd"
                    className="bg-[#121c2a] border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500" 
                    value={formData.clientName} 
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })} 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-medium">Industry</label>
                  <select 
                    className="bg-[#121c2a] border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    value={formData.industry}
                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                  >
                    <option>TCG & Collectibles</option>
                    <option>Luxury E-Commerce</option>
                    <option>SaaS & AI Tooling</option>
                    <option>Fintech & Web3</option>
                    <option>Media & Creator Studio</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-medium">Package Tier</label>
                  <select 
                    className="bg-[#121c2a] border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    value={formData.packageType}
                    onChange={e => {
                      const pkg = e.target.value as 'essential' | 'professional' | 'enterprise';
                      const val = pkg === 'essential' ? 5000 : pkg === 'professional' ? 12000 : 25000;
                      setFormData({ ...formData, packageType: pkg, value: val });
                    }}
                  >
                    <option value="essential">Essential ($5,000)</option>
                    <option value="professional">Professional ($12,000)</option>
                    <option value="enterprise">Enterprise ($25,000)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-medium">Contract Value ($)</label>
                  <input 
                    type="number" 
                    required 
                    className="bg-[#121c2a] border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500" 
                    value={formData.value} 
                    onChange={e => setFormData({ ...formData, value: Number(e.target.value) })} 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Target Delivery Deadline</label>
                <input 
                  type="date" 
                  required 
                  className="bg-[#121c2a] border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500" 
                  value={formData.deadline} 
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })} 
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold transition shadow-md"
                >
                  🚀 Initiate Project & Spawn Kick-off Task
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
