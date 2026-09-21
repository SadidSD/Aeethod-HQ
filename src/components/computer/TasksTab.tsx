import React, { useState } from 'react';
import { AgencyState, AgencyTask, CognitiveLoad, TaskPhase, TaskPriority, TaskStatus } from '../../core/agencyTypes';
import AgencyManager from '../../core/agency';

interface TasksTabProps {
  agency: AgencyState;
  manager: AgencyManager;
  onRefresh: () => void;
}

export const DESK_OPTIONS = [
  { id: 'frontend', name: '🌸 Alex Rivera (Frontend Dev Desk)', shortName: '🌸 Frontend Dev', color: 'text-pink-400 border-pink-500/40 bg-pink-950/30' },
  { id: 'backend', name: '🕷️ Marcus Vance (Backend Dev Desk)', shortName: '🕷️ Backend Dev', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30' },
  { id: 'designer', name: '🎨 Elena Rostova (Lead Designer Desk)', shortName: '🎨 Lead Designer', color: 'text-amber-400 border-amber-500/40 bg-amber-950/30' },
  { id: 'founder', name: '👑 Founder & CEO (Management HQ)', shortName: '👑 Founder HQ', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30' },
];

export function getDeskBadge(assignedTo?: string | null, team?: any[]) {
  if (!assignedTo) {
    return { name: 'Unassigned', shortName: 'Unassigned', color: 'text-slate-400 border-slate-700 bg-slate-800/40' };
  }
  const lower = assignedTo.toLowerCase();
  const matched = DESK_OPTIONS.find(d => d.id === assignedTo || lower.includes(d.id));
  if (matched) return matched;

  if (team) {
    const member = team.find(m => m.id === assignedTo || m.name?.toLowerCase() === lower);
    if (member) {
      return {
        name: member.name,
        shortName: member.name,
        color: 'text-purple-400 border-purple-500/40 bg-purple-950/30'
      };
    }
  }

  return { name: assignedTo, shortName: assignedTo, color: 'text-slate-400 border-slate-700 bg-slate-800/40' };
}

export default function TasksTab({ agency, manager, onRefresh }: TasksTabProps) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [deskFilter, setDeskFilter] = useState('All');
  const [loadFilter, setLoadFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<AgencyTask | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    projectId: string;
    assignedTo: string;
    phase: TaskPhase;
    priority: TaskPriority;
    cognitiveLoad: CognitiveLoad;
    estimatedHours: number;
    xpReward: number;
    status: TaskStatus;
  }>({
    title: '',
    description: '',
    projectId: '',
    assignedTo: 'frontend',
    phase: 'development',
    priority: 'medium',
    cognitiveLoad: 'medium',
    estimatedHours: 2,
    xpReward: 30,
    status: 'active'
  });

  const allTasks = (agency.tasks || []).map(t => {
    const proj = agency.projects.find(p => p.id === t.projectId);
    return {
      ...t,
      projectName: proj ? proj.name : '⚡ Studio Internal Task'
    };
  });

  function getLoadType(filter: string): CognitiveLoad | '' {
    if (filter.includes('Deep')) return 'deep';
    if (filter.includes('Medium')) return 'medium';
    if (filter.includes('Grunt')) return 'grunt';
    if (filter.includes('Micro')) return 'micro';
    return '';
  }

  const filteredTasks = allTasks.filter(t => {
    // Status Filter
    if (statusFilter !== 'All' && t.status.toLowerCase() !== statusFilter.toLowerCase()) return false;

    // Load Filter
    const targetLoad = getLoadType(loadFilter);
    if (loadFilter !== 'All' && t.cognitiveLoad !== targetLoad) return false;

    // Desk Filter
    if (deskFilter !== 'All') {
      if (deskFilter === 'unassigned') {
        if (t.assignedTo) return false;
      } else {
        const lower = (t.assignedTo || '').toLowerCase();
        if (t.assignedTo !== deskFilter && !lower.includes(deskFilter)) return false;
      }
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchProj = t.projectName.toLowerCase().includes(q);
      const matchAssign = (t.assignedTo || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchProj && !matchAssign) return false;
    }

    return true;
  });

  const cycleStatus = (task: AgencyTask) => {
    const sequence: TaskStatus[] = ['queued', 'active', 'review', 'done'];
    const nextIdx = (sequence.indexOf(task.status) + 1) % sequence.length;
    const nextStatus = sequence[nextIdx];
    
    if (nextStatus === 'done') {
      manager.completeTask(task.id);
      showToast(`🏆 Completed "${task.title}"!`);
    } else {
      manager.updateTask(task.id, { status: nextStatus });
    }
    onRefresh();
  };

  const handleQuickReassign = (taskId: string, newAssignedTo: string) => {
    const assignedVal = newAssignedTo || null;
    manager.updateTask(taskId, { assignedTo: assignedVal });
    const deskInfo = getDeskBadge(assignedVal, agency.team);
    showToast(`🔄 Reassigned to ${deskInfo.shortName}`);
    onRefresh();
  };

  const handleDeleteTask = (task: AgencyTask) => {
    if (confirm(`Are you sure you want to delete task: "${task.title}"?`)) {
      manager.deleteTask(task.id);
      showToast(`🗑️ Deleted "${task.title}"`);
      if (editingTask?.id === task.id) setEditingTask(null);
      onRefresh();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    manager.addTask({
      title: formData.title.trim(),
      description: formData.description.trim(),
      projectId: formData.projectId || null,
      assignedTo: formData.assignedTo || null,
      phase: formData.phase,
      priority: formData.priority,
      cognitiveLoad: formData.cognitiveLoad,
      estimatedHours: Number(formData.estimatedHours) || 1,
      xpReward: Number(formData.xpReward) || 25,
      status: formData.status,
      deadline: null,
    });

    const desk = getDeskBadge(formData.assignedTo, agency.team);
    showToast(`✅ Created task and assigned to ${desk.shortName}!`);
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      projectId: '',
      assignedTo: 'frontend',
      phase: 'development',
      priority: 'medium',
      cognitiveLoad: 'medium',
      estimatedHours: 2,
      xpReward: 30,
      status: 'active'
    });
    onRefresh();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;

    manager.updateTask(editingTask.id, {
      title: editingTask.title.trim(),
      description: editingTask.description,
      projectId: editingTask.projectId || null,
      assignedTo: editingTask.assignedTo || null,
      phase: editingTask.phase,
      status: editingTask.status,
      priority: editingTask.priority,
      cognitiveLoad: editingTask.cognitiveLoad,
      estimatedHours: Number(editingTask.estimatedHours) || 1,
      xpReward: Number(editingTask.xpReward) || 25,
    });

    showToast(`💾 Saved changes to "${editingTask.title}"!`);
    setEditingTask(null);
    onRefresh();
  };

  return (
    <div className="p-6 h-full flex flex-col space-y-4 text-slate-200 bg-[#0b1016] overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 right-8 z-50 px-4 py-2.5 bg-cyan-950 border border-cyan-500 rounded-lg shadow-xl text-cyan-200 text-xs font-bold animate-in fade-in flex items-center gap-2">
          <span>🔔</span> {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>📋</span> Workstation Task Management
          </h2>
          <p className="text-xs text-slate-400">
            Assign, schedule, and delegate development & design tasks to studio desks
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition font-medium text-sm flex items-center gap-2 shadow"
        >
          {showForm ? '✕ Close Form' : '+ Assign New Task'}
        </button>
      </div>

      {/* Filter Bars */}
      <div className="flex flex-col gap-2 bg-[#121b26] p-3 rounded-lg border border-slate-800">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          {/* Workstation / Desk Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Desk:</span>
            {[
              { id: 'All', label: 'All Desks' },
              { id: 'frontend', label: '🌸 Frontend' },
              { id: 'backend', label: '🕷️ Backend' },
              { id: 'designer', label: '🎨 Designer' },
              { id: 'founder', label: '👑 Founder' },
              { id: 'unassigned', label: 'Unassigned' },
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDeskFilter(d.id)}
                className={`px-2.5 py-1 text-xs rounded transition font-medium ${
                  deskFilter === d.id ? 'bg-cyan-700 text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#0b1016] border border-slate-800 rounded px-3 py-1 text-xs text-slate-200 placeholder-slate-500 w-48 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1 text-slate-500 hover:text-slate-300 text-xs">✕</button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/80">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            {['All', 'Queued', 'Active', 'Blocked', 'Review', 'Done'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-0.5 text-xs rounded transition ${
                  statusFilter === s ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Cognitive Load Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Load:</span>
            {['All', '🧠 Deep', '🎯 Medium', '🔨 Grunt', '☕ Micro'].map(s => (
              <button
                key={s}
                onClick={() => setLoadFilter(s)}
                className={`px-2 py-0.5 text-xs rounded transition ${
                  loadFilter === s ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* New Task Creation Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#121b26] p-4 rounded-lg border border-cyan-500/40 shadow-lg grid grid-cols-1 md:grid-cols-4 gap-3 animate-in fade-in">
          <div className="md:col-span-2">
            <label className="block text-[11px] text-slate-400 font-bold mb-1">TASK TITLE *</label>
            <input 
              required 
              placeholder="e.g. Implement Responsive Dashboard UI" 
              className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 font-bold mb-1">ASSIGN TO DESK / ROLE *</label>
            <select 
              className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none" 
              value={formData.assignedTo} 
              onChange={e => setFormData({...formData, assignedTo: e.target.value})}
            >
              <option value="">Unassigned</option>
              <option value="frontend">🌸 Alex Rivera (Frontend Dev Desk)</option>
              <option value="backend">🕷️ Marcus Vance (Backend Dev Desk)</option>
              <option value="designer">🎨 Elena Rostova (Lead Designer Desk)</option>
              <option value="founder">👑 Founder & CEO (Management HQ)</option>
              {agency.team.filter(m => !['frontend', 'backend', 'designer', 'founder'].includes(m.id)).map(m => (
                <option key={m.id} value={m.id}>👤 {m.name} ({m.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 font-bold mb-1">PROJECT</label>
            <select 
              className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none" 
              value={formData.projectId} 
              onChange={e => setFormData({...formData, projectId: e.target.value})}
            >
              <option value="">⚡ Non-Project / Studio Internal Task</option>
              {agency.projects.map(p => (
                <option key={p.id} value={p.id}>📁 {p.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] text-slate-400 font-bold mb-1">DESCRIPTION / INSTRUCTIONS</label>
            <input 
              placeholder="Task specifications or briefing notes..." 
              className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 font-bold mb-1">PRIORITY</label>
            <select 
              className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none" 
              value={formData.priority} 
              onChange={e => setFormData({...formData, priority: e.target.value as TaskPriority})}
            >
              <option value="urgent">🚨 Urgent (Drop Everything)</option>
              <option value="high">🔴 High Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="low">🟢 Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 font-bold mb-1">PHASE</label>
            <select 
              className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none" 
              value={formData.phase} 
              onChange={e => setFormData({...formData, phase: e.target.value as TaskPhase})}
            >
              <option value="discovery">Discovery</option>
              <option value="architecture">Architecture</option>
              <option value="design">Design</option>
              <option value="development">Development</option>
              <option value="testing">Testing / QA</option>
              <option value="launch">Launch</option>
              <option value="support">Support</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 font-bold mb-1">COGNITIVE LOAD</label>
            <select 
              className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none" 
              value={formData.cognitiveLoad} 
              onChange={e => setFormData({...formData, cognitiveLoad: e.target.value as CognitiveLoad})}
            >
              <option value="deep">🧠 Deep Work (Focus)</option>
              <option value="medium">🎯 Medium Work (Standard)</option>
              <option value="grunt">🔨 Grunt Work (Execution)</option>
              <option value="micro">☕ Micro Task (Quick Win)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 font-bold mb-1">EST. HOURS</label>
            <input 
              type="number" 
              min={1} 
              max={80} 
              className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none" 
              value={formData.estimatedHours} 
              onChange={e => setFormData({...formData, estimatedHours: Number(e.target.value)})} 
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 font-bold mb-1">XP REWARD</label>
            <input 
              type="number" 
              min={5} 
              max={500} 
              className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none" 
              value={formData.xpReward} 
              onChange={e => setFormData({...formData, xpReward: Number(e.target.value)})} 
            />
          </div>

          <div className="flex items-end">
            <button 
              type="submit" 
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded font-bold text-xs transition h-[35px]"
            >
              🚀 Dispatch Task to Desk
            </button>
          </div>
        </form>
      )}

      {/* Task List Table / Cards */}
      <div className="flex-1 bg-[#121b26] border border-slate-800 rounded-lg overflow-hidden flex flex-col">
        <div className="overflow-y-auto p-3 space-y-2 flex-1">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">
              <div className="text-3xl mb-2">📭</div>
              No tasks found matching the selected filters.
            </div>
          ) : (
            filteredTasks.map(t => {
              const desk = getDeskBadge(t.assignedTo, agency.team);
              const isUrgent = t.priority === 'urgent';
              const isHigh = t.priority === 'high';
              const isLow = t.priority === 'low';
              const isDone = t.status === 'done';

              return (
                <div 
                  key={t.id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b1016] p-3 rounded-lg border border-slate-800 border-l-4 transition hover:border-slate-700 ${
                    isUrgent ? 'border-l-rose-500' : isHigh ? 'border-l-orange-500' : isLow ? 'border-l-blue-500' : 'border-l-amber-500'
                  } ${isDone ? 'opacity-65' : ''}`}
                >
                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm leading-snug ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                        {t.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700">
                        {t.phase}
                      </span>
                      {t.priority === 'urgent' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-600/50 font-bold">
                          URGENT
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span className="text-cyan-400/90 font-mono text-[11px]">{t.projectName}</span>
                      {t.description && (
                        <span className="text-slate-500 truncate max-w-xs">{t.description}</span>
                      )}
                    </div>
                  </div>

                  {/* Desk Assignment & Quick Reassign Selector */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Assigned Desk</span>
                      <select
                        value={t.assignedTo || ''}
                        onChange={e => handleQuickReassign(t.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded border font-medium cursor-pointer outline-none transition ${desk.color}`}
                        title="Click to reassign to another desk"
                      >
                        <option value="" className="bg-[#0b1016] text-slate-300">Unassigned</option>
                        <option value="frontend" className="bg-[#0b1016] text-pink-300">🌸 Frontend Dev Desk</option>
                        <option value="backend" className="bg-[#0b1016] text-cyan-300">🕷️ Backend Dev Desk</option>
                        <option value="designer" className="bg-[#0b1016] text-amber-300">🎨 Lead Designer Desk</option>
                        <option value="founder" className="bg-[#0b1016] text-emerald-300">👑 Founder HQ</option>
                        {agency.team.filter(m => !['frontend', 'backend', 'designer', 'founder'].includes(m.id)).map(m => (
                          <option key={m.id} value={m.id} className="bg-[#0b1016] text-purple-300">👤 {m.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Cognitive Load & XP */}
                    <div className="flex items-center gap-2 text-xs">
                      <span title={`Cognitive Load: ${t.cognitiveLoad}`} className="text-base cursor-help">
                        {t.cognitiveLoad === 'deep' ? '🧠' : t.cognitiveLoad === 'medium' ? '🎯' : t.cognitiveLoad === 'grunt' ? '🔨' : '☕'}
                      </span>
                      <span className="font-mono text-cyan-400 font-bold">+{t.xpReward}XP</span>
                      <span className="font-mono text-slate-500">{t.estimatedHours}h</span>
                    </div>

                    {/* Status Toggle Button */}
                    <button 
                      onClick={() => cycleStatus(t)} 
                      className={`px-2.5 py-1 rounded text-xs font-bold text-center capitalize cursor-pointer transition border ${
                        t.status === 'done' 
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400' 
                          : t.status === 'active' 
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400' 
                          : t.status === 'blocked' 
                          ? 'bg-rose-950/40 border-rose-500/50 text-rose-400' 
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                      title="Click to cycle status (Queued -> Active -> Review -> Done)"
                    >
                      {t.status}
                    </button>

                    {/* Edit & Delete Actions */}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setEditingTask({ ...t })}
                        className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
                        title="Edit task details"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(t)}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                        title="Delete task"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* =========================================================================
          ✏️ EDIT TASK MODAL
          ========================================================================= */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#101824] border border-cyan-500/40 rounded-xl max-w-xl w-full p-6 text-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>✏️</span> Edit Task: {editingTask.title}
              </h3>
              <button 
                onClick={() => setEditingTask(null)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">TASK TITLE</label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={editingTask.description || ''}
                  onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">ASSIGNED DESK / ROLE</label>
                  <select
                    value={editingTask.assignedTo || ''}
                    onChange={e => setEditingTask({ ...editingTask, assignedTo: e.target.value || null })}
                    className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                  >
                    <option value="">Unassigned</option>
                    <option value="frontend">🌸 Alex Rivera (Frontend Dev Desk)</option>
                    <option value="backend">🕷️ Marcus Vance (Backend Dev Desk)</option>
                    <option value="designer">🎨 Elena Rostova (Lead Designer Desk)</option>
                    <option value="founder">👑 Founder & CEO (Management HQ)</option>
                    {agency.team.filter(m => !['frontend', 'backend', 'designer', 'founder'].includes(m.id)).map(m => (
                      <option key={m.id} value={m.id}>👤 {m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">PROJECT</label>
                  <select
                    value={editingTask.projectId || ''}
                    onChange={e => setEditingTask({ ...editingTask, projectId: e.target.value || null })}
                    className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                  >
                    <option value="">⚡ Non-Project / Studio Internal Task</option>
                    {agency.projects.map(p => (
                      <option key={p.id} value={p.id}>📁 {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">STATUS</label>
                  <select
                    value={editingTask.status}
                    onChange={e => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                    className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                  >
                    <option value="queued">Queued</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">PHASE</label>
                  <select
                    value={editingTask.phase}
                    onChange={e => setEditingTask({ ...editingTask, phase: e.target.value as TaskPhase })}
                    className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                  >
                    <option value="discovery">Discovery</option>
                    <option value="architecture">Architecture</option>
                    <option value="design">Design</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing / QA</option>
                    <option value="launch">Launch</option>
                    <option value="support">Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">PRIORITY</label>
                  <select
                    value={editingTask.priority}
                    onChange={e => setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })}
                    className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                  >
                    <option value="urgent">🚨 Urgent</option>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">COGNITIVE LOAD</label>
                  <select
                    value={editingTask.cognitiveLoad}
                    onChange={e => setEditingTask({ ...editingTask, cognitiveLoad: e.target.value as CognitiveLoad })}
                    className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                  >
                    <option value="deep">🧠 Deep Work</option>
                    <option value="medium">🎯 Medium Work</option>
                    <option value="grunt">🔨 Grunt Work</option>
                    <option value="micro">☕ Micro Task</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">EST. HOURS</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editingTask.estimatedHours}
                    onChange={e => setEditingTask({ ...editingTask, estimatedHours: Number(e.target.value) })}
                    className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">XP REWARD</label>
                  <input
                    type="number"
                    min={5}
                    max={500}
                    value={editingTask.xpReward}
                    onChange={e => setEditingTask({ ...editingTask, xpReward: Number(e.target.value) })}
                    className="w-full bg-[#0b1016] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteTask(editingTask)}
                  className="px-4 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-300 rounded text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>🗑️</span> Delete Task
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition shadow"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
