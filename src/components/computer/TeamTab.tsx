import React, { useState } from 'react';
import { AgencyState, RoomId } from '../../core/agencyTypes';
import AgencyManager from '../../core/agency';

interface TeamTabProps {
  agency: AgencyState;
  manager: AgencyManager;
  onRefresh: () => void;
}

export default function TeamTab({ agency, manager, onRefresh }: TeamTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    room: 'dev' as RoomId,
    skills: '',
    capacityHoursPerWeek: 40
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    manager.addTeamMember({
      name: formData.name,
      role: formData.role,
      room: formData.room,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : ['General'],
      capacityHoursPerWeek: formData.capacityHoursPerWeek || 40,
    });
    setShowForm(false);
    onRefresh();
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'working': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'idle': return 'bg-slate-700/40 text-slate-400 border-slate-700';
      case 'blocked': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-800 text-slate-500 border-slate-700';
    }
  };

  const getCapacityColor = (ratio: number) => {
    if (ratio >= 0.9) return 'bg-rose-500';
    if (ratio >= 0.7) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const roomNames: Record<RoomId, string> = {
    dev: '💻 Dev Room',
    design: '🎨 Design Room',
    content: '📅 Content Room',
    client: '🤝 Client Room',
    management: '👑 Management',
  };

  return (
    <div className="p-6 h-full flex flex-col space-y-6 text-slate-200 bg-[#0b1016]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Team Roster</h2>
          <p className="text-xs text-slate-400">Manage agency talent, workload capacity, and skill specializations</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded transition font-medium text-sm"
        >
          {showForm ? 'Cancel' : '+ Add Team Member'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#121b26] p-4 rounded border border-slate-800 grid grid-cols-2 gap-4">
          <input required placeholder="Name" className="bg-[#0b1016] border border-slate-800 rounded p-2 text-sm text-slate-200" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input required placeholder="Role (e.g. Frontend Engineer)" className="bg-[#0b1016] border border-slate-800 rounded p-2 text-sm text-slate-200" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
          <select className="bg-[#0b1016] border border-slate-800 rounded p-2 text-sm text-slate-200" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value as RoomId})}>
            <option value="dev">💻 Development Room</option>
            <option value="design">🎨 Design Room</option>
            <option value="content">📅 Content Management Room</option>
            <option value="client">🤝 Client Management Room</option>
            <option value="management">👑 Management Room</option>
          </select>
          <input placeholder="Skills (comma-separated, e.g. React, Next.js)" className="bg-[#0b1016] border border-slate-800 rounded p-2 text-sm text-slate-200" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} />
          <input type="number" placeholder="Capacity (Hours/Week)" className="bg-[#0b1016] border border-slate-800 rounded p-2 text-sm text-slate-200" value={formData.capacityHoursPerWeek} onChange={e => setFormData({...formData, capacityHoursPerWeek: Number(e.target.value)})} />
          <div className="col-span-2">
            <button type="submit" className="bg-cyan-600 w-full py-2 rounded font-medium hover:bg-cyan-500 text-sm">Add Member to Agency</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agency.team.map(m => {
          const capRatio = m.capacityHoursPerWeek > 0 ? (m.assignedHours / m.capacityHoursPerWeek) : 0;
          const nextLevelXp = (m.level + 1) * (m.level + 1) * 100;
          const prevLevelXp = m.level * m.level * 100;
          const currentLevelProgress = m.xp - prevLevelXp;
          const xpRequired = nextLevelXp - prevLevelXp;
          const progressPercent = Math.max(0, Math.min(100, (currentLevelProgress / (xpRequired || 1)) * 100));
          const currentTask = agency.tasks.find(t => t.id === m.currentTaskId);

          return (
            <div key={m.id} className="bg-[#121b26] border border-slate-800 hover:border-slate-700 transition rounded-lg p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-base text-slate-200">{m.name}</h3>
                  <div className="text-xs text-slate-400">{m.role}</div>
                </div>
                <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold tracking-wider ${getStatusBadge(m.status)}`}>
                  {m.status}
                </span>
              </div>

              <div className="flex gap-2 items-center">
                <span className="text-xs px-2 py-0.5 bg-slate-900/80 border border-slate-800 text-cyan-300 rounded font-medium">
                  {roomNames[m.room] || m.room}
                </span>
              </div>

              {currentTask && (
                <div className="text-xs bg-cyan-950/30 border border-cyan-900/40 rounded p-2 text-cyan-200">
                  <span className="text-slate-400">Current: </span>
                  <span className="font-medium">{currentTask.title}</span>
                </div>
              )}

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Level {m.level}</span>
                  <span className="text-slate-500 font-mono">{m.xp} / {nextLevelXp} XP</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Workload</span>
                  <span className="text-slate-500 font-mono">{m.assignedHours} / {m.capacityHoursPerWeek} hrs</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${getCapacityColor(capRatio)} transition-all`} style={{ width: `${Math.min(capRatio * 100, 100)}%` }} />
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-slate-800/50">
                {m.skills.map(s => (
                  <span key={s} className="text-[10px] px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
