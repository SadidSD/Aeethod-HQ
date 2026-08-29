import React, { useState } from 'react';
import { AgencyState, AgencyTask, CognitiveLoad, TaskPhase, TaskPriority, TaskStatus } from '../../core/agencyTypes';
import AgencyManager from '../../core/agency';

interface TasksTabProps {
  agency: AgencyState;
  manager: AgencyManager;
  onRefresh: () => void;
}

export default function TasksTab({ agency, manager, onRefresh }: TasksTabProps) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [loadFilter, setLoadFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  
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
    assignedTo: '',
    phase: 'development',
    priority: 'medium',
    cognitiveLoad: 'medium',
    estimatedHours: 1,
    xpReward: 25,
    status: 'queued'
  });

  const allTasks = (agency.tasks || []).map(t => {
    const proj = agency.projects.find(p => p.id === t.projectId);
    return { ...t, projectName: proj ? proj.name : 'Unknown Project' };
  });

  function getLoadType(filter: string): CognitiveLoad | '' {
    if (filter.includes('Deep')) return 'deep';
    if (filter.includes('Medium')) return 'medium';
    if (filter.includes('Grunt')) return 'grunt';
    if (filter.includes('Micro')) return 'micro';
    return '';
  }

  const filteredTasks = allTasks.filter(t => {
    if (statusFilter !== 'All' && t.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    const targetLoad = getLoadType(loadFilter);
    if (loadFilter !== 'All' && t.cognitiveLoad !== targetLoad) return false;
    return true;
  });

  const cycleStatus = (task: AgencyTask) => {
    const sequence: TaskStatus[] = ['queued', 'active', 'review', 'done'];
    const nextIdx = (sequence.indexOf(task.status) + 1) % sequence.length;
    const nextStatus = sequence[nextIdx];
    
    if (nextStatus === 'done') {
      manager.completeTask(task.id);
    } else {
      manager.updateTask(task.id, { status: nextStatus });
    }
    onRefresh();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId) return;

    manager.addTask({
      title: formData.title,
      description: formData.description,
      projectId: formData.projectId,
      assignedTo: formData.assignedTo || null,
      phase: formData.phase,
      priority: formData.priority,
      cognitiveLoad: formData.cognitiveLoad,
      estimatedHours: formData.estimatedHours,
      xpReward: formData.xpReward,
      status: formData.status,
      deadline: null,
    });
    setShowForm(false);
    onRefresh();
  };

  return (
    <div className="p-6 h-full flex flex-col space-y-6 text-slate-200 bg-[#0b1016]">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Task Management</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded transition font-medium text-sm"
        >
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      <div className="flex gap-6 flex-wrap">
        <div className="flex gap-2 bg-[#121b26] p-2 rounded border border-slate-800">
          {['All', 'Queued', 'Active', 'Blocked', 'Review', 'Done'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 text-sm rounded ${statusFilter === s ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>{s}</button>
          ))}
        </div>
        <div className="flex gap-2 bg-[#121b26] p-2 rounded border border-slate-800">
          {['All', '🧠 Deep', '🎯 Medium', '🔨 Grunt', '☕ Micro'].map(s => (
            <button key={s} onClick={() => setLoadFilter(s)} className={`px-3 py-1 text-sm rounded ${loadFilter === s ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>{s}</button>
          ))}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#121b26] p-4 rounded border border-slate-800 grid grid-cols-3 gap-4">
          <input required placeholder="Title" className="bg-[#0b1016] border border-slate-800 rounded p-2 text-sm text-slate-200" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          <select required className="bg-[#0b1016] border border-slate-800 rounded p-2 text-sm text-slate-200" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
            <option value="">Select Project...</option>
            {agency.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="bg-[#0b1016] border border-slate-800 rounded p-2 text-sm text-slate-200" value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
            <option value="">Unassigned</option>
            {agency.team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select className="bg-[#0b1016] border border-slate-800 rounded p-2 text-sm text-slate-200" value={formData.cognitiveLoad} onChange={e => setFormData({...formData, cognitiveLoad: e.target.value as CognitiveLoad})}>
            <option value="deep">🧠 Deep Work</option>
            <option value="medium">🎯 Medium Work</option>
            <option value="grunt">🔨 Grunt Work</option>
            <option value="micro">☕ Micro Task</option>
          </select>
          <input type="number" placeholder="Est. Hours" className="bg-[#0b1016] border border-slate-800 rounded p-2 text-sm text-slate-200" value={formData.estimatedHours} onChange={e => setFormData({...formData, estimatedHours: Number(e.target.value)})} />
          <input type="number" placeholder="XP Reward" className="bg-[#0b1016] border border-slate-800 rounded p-2 text-sm text-slate-200" value={formData.xpReward} onChange={e => setFormData({...formData, xpReward: Number(e.target.value)})} />
          
          <button type="submit" className="col-span-3 bg-cyan-600 py-2 rounded font-medium hover:bg-cyan-500">Create Task</button>
        </form>
      )}

      <div className="flex-1 bg-[#121b26] border border-slate-800 rounded-lg overflow-hidden flex flex-col">
        <div className="overflow-y-auto p-4 space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">No tasks matching the selected filters.</div>
          ) : (
            filteredTasks.map(t => (
              <div key={t.id} className={`flex items-center gap-4 bg-[#0b1016] p-3 rounded border border-slate-800 border-l-4 ${t.priority === 'urgent' ? 'border-l-rose-500' : t.priority === 'high' ? 'border-l-red-500' : t.priority === 'low' ? 'border-l-blue-500' : 'border-l-yellow-500'}`}>
                <div className="flex-1">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-slate-400">{t.projectName}</div>
                </div>
                <div className="text-sm text-slate-400 w-32">{agency.team.find(m => m.id === t.assignedTo)?.name || 'Unassigned'}</div>
                <div className="text-lg w-8 text-center">{t.cognitiveLoad === 'deep' ? '🧠' : t.cognitiveLoad === 'medium' ? '🎯' : t.cognitiveLoad === 'grunt' ? '🔨' : '☕'}</div>
                <div className="text-xs text-cyan-400 w-16 text-right">+{t.xpReward} XP</div>
                <button onClick={() => cycleStatus(t)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs w-24 text-center cursor-pointer capitalize">
                  {t.status}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
