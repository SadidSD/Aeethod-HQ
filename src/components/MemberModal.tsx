import { useState, useEffect } from 'react';
import { AgencyState, AgencyTask, CognitiveLoad, TaskPhase, TaskPriority, TeamMember } from '../core/agencyTypes';
import AgencyManager from '../core/agency';

interface MemberModalProps {
  memberId: string;
  agency: AgencyState;
  manager: AgencyManager;
  onClose: () => void;
  onRefresh: () => void;
}

export default function MemberModal({ memberId, agency, manager, onClose, onRefresh }: MemberModalProps) {
  const member = agency.team.find(m => m.id === memberId);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskProjectId, setTaskProjectId] = useState(agency.projects[0]?.id || '');
  const [taskCognitive, setTaskCognitive] = useState<CognitiveLoad>('medium');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskEstHours, setTaskEstHours] = useState(2);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!member) return null;

  const memberTasks = agency.tasks.filter(t => t.assignedTo === member.id);
  const activeTask = memberTasks.find(t => t.status === 'active' || t.status === 'queued');

  const capRatio = member.capacityHoursPerWeek > 0 ? (member.assignedHours / member.capacityHoursPerWeek) : 0;
  const nextLevelXp = (member.level + 1) * (member.level + 1) * 100;
  const prevLevelXp = member.level * member.level * 100;
  const currentLevelProgress = member.xp - prevLevelXp;
  const xpRequired = nextLevelXp - prevLevelXp;
  const progressPercent = Math.max(0, Math.min(100, (currentLevelProgress / (xpRequired || 1)) * 100));

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskProjectId) return;

    manager.addTask({
      title: taskTitle,
      description: taskDesc,
      projectId: taskProjectId,
      assignedTo: member.id,
      phase: member.room === 'dev' ? 'development' : member.room === 'design' ? 'design' : 'discovery' as TaskPhase,
      priority: taskPriority,
      cognitiveLoad: taskCognitive,
      estimatedHours: taskEstHours,
      xpReward: taskEstHours * 15,
      status: 'active',
      deadline: null,
    });

    setTaskTitle('');
    setTaskDesc('');
    setShowTaskForm(false);
    onRefresh();
  };

  const handleCompleteTask = (task: AgencyTask) => {
    manager.completeTask(task.id);
    onRefresh();
  };

  const handleToggleBlock = (task: AgencyTask) => {
    const nextStatus = task.status === 'blocked' ? 'active' : 'blocked';
    manager.updateTask(task.id, { status: nextStatus });
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c1219] border border-cyan-500/40 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#101820] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-xl">
              {member.room === 'dev' ? '💻' : member.room === 'design' ? '🎨' : '👥'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-slate-100">{member.name}</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {member.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">{member.role}</p>
            </div>
          </div>

          <button onClick={onClose} className="px-2.5 py-1 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-200 rounded text-xs transition">
            ESC
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 bg-[#121b26] p-3 rounded-lg border border-slate-800">
            <div>
              <div className="text-xs text-slate-400 mb-1">Level {member.level}</div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">{member.xp} / {nextLevelXp} XP</div>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1">Weekly Workload</div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${capRatio >= 0.9 ? 'bg-rose-500' : capRatio >= 0.7 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(capRatio * 100, 100)}%` }} />
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">{member.assignedHours} / {member.capacityHoursPerWeek} hrs</div>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1">Specializations</div>
              <div className="flex flex-wrap gap-1">
                {member.skills.slice(0, 2).map(s => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Direct Actions */}
          <div className="flex justify-between items-center pt-2">
            <h3 className="font-semibold text-sm text-slate-200">Active Tasks ({memberTasks.length})</h3>
            <button 
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold transition"
            >
              {showTaskForm ? 'Cancel' : '+ Hand Task Directly'}
            </button>
          </div>

          {/* Inline Quick Task Creator */}
          {showTaskForm && (
            <form onSubmit={handleAssignTask} className="bg-[#121b26] border border-cyan-500/30 p-4 rounded-lg space-y-3">
              <div className="text-xs font-bold text-cyan-400">⚡ Delegate New Task to {member.name}</div>
              <input
                required
                placeholder="What needs to be done?"
                className="w-full bg-[#0b1016] border border-slate-800 rounded p-2 text-sm text-slate-200 focus:border-cyan-500 outline-none"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="bg-[#0b1016] border border-slate-800 rounded p-2 text-xs text-slate-200"
                  value={taskProjectId}
                  onChange={e => setTaskProjectId(e.target.value)}
                >
                  {agency.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select
                  className="bg-[#0b1016] border border-slate-800 rounded p-2 text-xs text-slate-200"
                  value={taskCognitive}
                  onChange={e => setTaskCognitive(e.target.value as CognitiveLoad)}
                >
                  <option value="deep">🧠 Deep Focus</option>
                  <option value="medium">🎯 Medium Execution</option>
                  <option value="grunt">🔨 Quick Grunt Work</option>
                </select>
              </div>
              <div className="flex justify-between items-center gap-3">
                <input
                  type="number"
                  placeholder="Est. Hours"
                  className="bg-[#0b1016] border border-slate-800 rounded p-2 text-xs text-slate-200 w-28"
                  value={taskEstHours}
                  onChange={e => setTaskEstHours(Number(e.target.value))}
                />
                <button type="submit" className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition">
                  Confirm Assignment (+{taskEstHours * 15} XP)
                </button>
              </div>
            </form>
          )}

          {/* Tasks List */}
          <div className="space-y-2">
            {memberTasks.length === 0 ? (
              <div className="p-6 bg-[#121b26]/40 border border-slate-800/60 rounded-lg text-center text-xs text-slate-500 italic">
                {member.name} has no tasks in queue. Hand them a task to start production!
              </div>
            ) : (
              memberTasks.map(t => {
                const proj = agency.projects.find(p => p.id === t.projectId);
                return (
                  <div key={t.id} className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${t.status === 'blocked' ? 'bg-rose-950/20 border-rose-800/40' : t.status === 'done' ? 'bg-slate-900/40 border-slate-800/40 opacity-60' : 'bg-[#121b26] border-slate-800'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${t.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'}`}>{t.title}</span>
                        {t.status === 'blocked' && <span className="text-[10px] px-1.5 py-0.2 bg-rose-900/60 text-rose-300 rounded border border-rose-700">BLOCKED</span>}
                      </div>
                      <div className="text-xs text-slate-400">{proj?.name} • {t.estimatedHours} hrs • +{t.xpReward} XP</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {t.status !== 'done' && (
                        <>
                          <button
                            onClick={() => handleToggleBlock(t)}
                            className={`px-2 py-1 rounded text-xs font-medium transition ${t.status === 'blocked' ? 'bg-amber-900/50 hover:bg-amber-800/50 text-amber-200 border border-amber-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                          >
                            {t.status === 'blocked' ? 'Unblock' : 'Mark Blocked'}
                          </button>
                          <button
                            onClick={() => handleCompleteTask(t)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition shadow-sm"
                          >
                            Complete ✅
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-[#101820] border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>Press ESC or click outside to close</span>
          <button onClick={onClose} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition font-medium">
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
