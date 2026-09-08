import { useState } from 'react';
import { AgencyState, AgencyTask, TaskPhase } from '../../core/agencyTypes';
import AgencyManager from '../../core/agency';

interface DashboardTabProps {
  agency: AgencyState;
  manager: AgencyManager;
  onNavigateTab?: (tab: 'dashboard' | 'projects' | 'tasks' | 'team' | 'finance' | 'quests' | 'achievements') => void;
  onRefresh?: () => void;
}

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString();
}

interface ToDoItem {
  id: string;
  text: string;
  priority: 'red' | 'yellow' | 'green' | 'white';
  completed: boolean;
  why: string;
}

export default function DashboardTab({ agency, manager, onNavigateTab, onRefresh }: DashboardTabProps) {
  const alerts = manager.getDepartmentAlerts ? manager.getDepartmentAlerts() : [];
  const activeProjects = agency.projects.filter(p => p.phase !== 'completed');
  const completedProjects = agency.projects.filter(p => p.phase === 'completed');

  // Interactive Next Actions state
  const [todoList, setTodoList] = useState<ToDoItem[]>([
    { id: '1', text: 'Onboard your first client project or lead', priority: 'green', completed: false, why: 'Kick off agency pipeline' },
    { id: '2', text: "Assign initial tasks to team workstations", priority: 'white', completed: false, why: 'Activate designer & dev desks' },
    { id: '3', text: "Review content strategy in Content Studio", priority: 'white', completed: false, why: 'Build organic client inbound' },
    { id: '4', text: "Host discovery alignment in Meeting Room", priority: 'white', completed: false, why: 'Executive planning cadence' },
  ]);

  const [quickNotification, setQuickNotification] = useState<string | null>(null);

  const toggleTodo = (id: string) => {
    setTodoList(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleResolveAlert = (room: string) => {
    // Find task in room and unblock it
    const task = agency.tasks.find(t => t.status === 'blocked');
    if (task) {
      manager.updateTask(task.id, { status: 'active' });
      onRefresh?.();
      setQuickNotification(`✅ Successfully unblocked ${task.title}!`);
      setTimeout(() => setQuickNotification(null), 3500);
    }
  };

  // Dynamic Stage Health Resolver: Green when healthy, Yellow when slowing, Red when blocked
  const getStageHealth = (phase: TaskPhase) => {
    const phaseTasks = agency.tasks.filter(t => t.phase === phase);
    const hasBlocked = phaseTasks.some(t => t.status === 'blocked');
    const hasSlowing = phaseTasks.some(t => t.status === 'review' || t.status === 'queued') || phaseTasks.length >= 4;

    if (hasBlocked) {
      return {
        status: 'blocked',
        badge: '🔴 BLOCKED',
        textColor: 'text-rose-400',
        borderColor: 'border-rose-600/60',
        bgTint: 'bg-rose-950/25',
        barText: '██░░░░',
        description: 'Waiting on Blocker',
      };
    }
    if (hasSlowing) {
      return {
        status: 'slowing',
        badge: '🟡 SLOWING',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/50',
        bgTint: 'bg-amber-950/20',
        barText: '████░░',
        description: 'Queued / Review',
      };
    }
    return {
      status: 'healthy',
      badge: '🟢 HEALTHY',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgTint: 'bg-emerald-950/20',
      barText: '██████',
      description: 'Tasks Moving Smoothly',
    };
  };

  const discoveryHealth = getStageHealth('discovery');
  const designHealth = getStageHealth('design');
  const devHealth = getStageHealth('development');
  const qaHealth = getStageHealth('testing');
  const launchHealth = getStageHealth('launch');

  // Overall status check
  const hasCritical = alerts.some(a => a.severity === 'red');
  const hasWarning = alerts.some(a => a.severity === 'yellow');
  const agencyStatus = hasCritical ? '🔴 CRITICAL BOTTLENECK' : hasWarning ? '🟡 ATTENTION REQUIRED' : '🟢 HEALTHY';

  // Date and Time formatting
  const todayDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const todayTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Calculate annual revenue vs target
  const annualRev = agency.resources.revenue || 0;
  const annualTarget = 45000;
  const monthlyRev = agency.resources.monthlyRecurring || 0;

  // Completed projects value
  const cathedralVal = completedProjects.reduce((sum, p) => sum + (p.value || 0), 0) + (agency.resources.revenue || 0);

  return (
    <div className="p-5 space-y-5 text-slate-200 bg-[#080d14] overflow-y-auto max-h-[85vh] font-sans">
      
      {/* Quick Toast Notification */}
      {quickNotification && (
        <div className="fixed top-14 right-8 z-50 px-4 py-2.5 bg-emerald-950 border border-emerald-500 rounded-lg shadow-lg text-emerald-200 text-xs font-bold animate-in fade-in flex items-center gap-2">
          <span>🔔</span> {quickNotification}
        </div>
      )}

      {/* =========================================================================
          🏭 HEADER: AEETHOD COMMAND CENTER
          ========================================================================= */}
      <div className="bg-[#0e1622] border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.1)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏭</span>
            <h1 className="text-lg font-black tracking-wider text-cyan-400 font-mono">
              AEETHOD COMMAND CENTER <span className="text-slate-500 font-normal">—</span> {agency.agency.name || 'Founder'} <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 ml-2">FOUNDER CONSOLE</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 font-mono">
            <span>📅 Today: {todayDate}</span>
            <span>⏰ {todayTime}</span>
            <span className="font-bold text-slate-200">Agency Status: {agencyStatus}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigateTab?.('projects')}
            className="px-3 py-1.5 bg-[#172334] hover:bg-cyan-900/50 border border-cyan-600/40 rounded text-xs text-cyan-300 font-bold transition flex items-center gap-1.5"
          >
            <span>🚀</span> Active Pipeline ({activeProjects.length})
          </button>
          <button 
            onClick={() => onNavigateTab?.('tasks')}
            className="px-3 py-1.5 bg-[#172334] hover:bg-cyan-900/50 border border-cyan-600/40 rounded text-xs text-cyan-300 font-bold transition flex items-center gap-1.5"
          >
            <span>📋</span> Tasks ({agency.tasks.length})
          </button>
        </div>
      </div>

      {/* =========================================================================
          💡 QUICK ACTIONS CONTROL PANEL (Top, Below Navbar)
          ========================================================================= */}
      <div className="bg-[#0e1622] border border-cyan-500/30 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <span>💡</span> QUICK ACTIONS CONTROL PANEL
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Instant delegation & management triggers</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab?.('tasks')}
            className="flex-1 min-w-[130px] px-3.5 py-2 bg-[#152336] hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-300 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>📋</span> Create Task
          </button>
          <button
            onClick={() => onNavigateTab?.('team')}
            className="flex-1 min-w-[130px] px-3.5 py-2 bg-[#152336] hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-300 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>👤</span> Assign Work
          </button>
          <button
            onClick={() => onNavigateTab?.('projects')}
            className="flex-1 min-w-[130px] px-3.5 py-2 bg-[#152336] hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-300 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>📊</span> View Reports
          </button>
          <button
            onClick={() => {
              const targetName = activeProjects[0]?.clientName || 'Client';
              setQuickNotification(`📧 Client Update Email dispatched to ${targetName}!`);
              setTimeout(() => setQuickNotification(null), 3500);
            }}
            className="flex-1 min-w-[130px] px-3.5 py-2 bg-[#152336] hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-300 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>📧</span> Send Update
          </button>
          <button
            onClick={() => {
              setQuickNotification('📅 Sprint Retrospective Meeting booked for Friday 3 PM!');
              setTimeout(() => setQuickNotification(null), 3500);
            }}
            className="flex-1 min-w-[130px] px-3.5 py-2 bg-[#152336] hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-300 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>📅</span> Schedule Meeting
          </button>
        </div>
      </div>

      {/* =========================================================================
          ROW 1: SECTION 1 (REAL-TIME METRICS) + SECTION 2 (THE PIPELINE)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Section 1: Real-Time Metrics (Top Bar Card) */}
        <div className="lg:col-span-4 bg-[#0e1622] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span>📊</span> REAL-TIME METRICS
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">LIVE FEED</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#121c2a] p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">💰 Annual Revenue</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{formatCurrency(annualRev)} / {formatCurrency(annualTarget)}</span>
            </div>
            <div className="bg-[#121c2a] p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">💰 This Month</span>
              <span className="text-sm font-bold text-emerald-300 font-mono">{formatCurrency(monthlyRev)}</span>
            </div>
            <div className="bg-[#121c2a] p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">📋 Active Projects</span>
              <span className="text-sm font-bold text-cyan-300 font-mono">{activeProjects.length} Projects</span>
            </div>
            <div className="bg-[#121c2a] p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">✅ Tasks Done Today</span>
              <span className="text-sm font-bold text-purple-300 font-mono">{agency.stats?.totalTasksCompleted ?? 0} Tasks</span>
            </div>
            <div className="bg-[#121c2a] p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">⚠️ Bottlenecks</span>
              <span className={`text-sm font-bold font-mono ${alerts.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>{alerts.length} Detected</span>
            </div>
            <div className="bg-[#121c2a] p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">👥 Active Team</span>
              <span className="text-sm font-bold text-cyan-300 font-mono">{agency.team.length}/{agency.team.length} Active</span>
            </div>
          </div>

          <div className="mt-3 p-2 bg-gradient-to-r from-amber-950/40 to-transparent border-l-2 border-amber-500 rounded text-xs flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">🎯 Next Milestone:</span>
            <span className="font-bold text-amber-300 font-mono">{activeProjects[0]?.name || 'Launch First Client Project'}</span>
          </div>
        </div>

        {/* Section 2: The Pipeline (Visual Flow) */}
        <div className="lg:col-span-8 bg-[#0e1622] border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span>📋</span> THE PIPELINE (Visual Flow)
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Discovery → Design → Dev → QA → Launch</span>
          </div>

          {/* Pipeline Stages Flow Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            
            {/* 1. Discovery */}
            <div className={`border rounded-lg p-3 flex flex-col justify-between transition-all ${discoveryHealth.bgTint} ${discoveryHealth.borderColor}`}>
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                  <span>DISCOVERY</span>
                  <span className="text-slate-500">→</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`font-mono text-[11px] tracking-wider font-bold ${discoveryHealth.textColor}`}>{discoveryHealth.barText}</span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-black/40 font-mono font-bold">{discoveryHealth.badge}</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-slate-800/60 pt-1.5 mt-2 flex justify-between">
                <span>{discoveryHealth.description}</span>
                <span className="font-bold text-slate-200 font-mono">{agency.tasks.filter(t => t.phase === 'discovery').length} tasks</span>
              </div>
            </div>

            {/* 2. Design */}
            <div className={`border rounded-lg p-3 flex flex-col justify-between transition-all ${designHealth.bgTint} ${designHealth.borderColor}`}>
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                  <span>DESIGN</span>
                  <span className="text-slate-500">→</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`font-mono text-[11px] tracking-wider font-bold ${designHealth.textColor}`}>{designHealth.barText}</span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-black/40 font-mono font-bold">{designHealth.badge}</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-slate-800/60 pt-1.5 mt-2 flex justify-between">
                <span>{designHealth.description}</span>
                <span className="font-bold text-slate-200 font-mono">{agency.tasks.filter(t => t.phase === 'design').length} tasks</span>
              </div>
            </div>

            {/* 3. Development */}
            <div className={`border rounded-lg p-3 flex flex-col justify-between transition-all ${devHealth.bgTint} ${devHealth.borderColor}`}>
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                  <span>DEVELOPMENT</span>
                  <span className="text-slate-500">→</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`font-mono text-[11px] tracking-wider font-bold ${devHealth.textColor}`}>{devHealth.barText}</span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-black/40 font-mono font-bold">{devHealth.badge}</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-slate-800/60 pt-1.5 mt-2 flex justify-between">
                <span>{devHealth.description}</span>
                <span className="font-bold text-slate-200 font-mono">{agency.tasks.filter(t => t.phase === 'development').length} tasks</span>
              </div>
            </div>

            {/* 4. QA */}
            <div className={`border rounded-lg p-3 flex flex-col justify-between transition-all ${qaHealth.bgTint} ${qaHealth.borderColor}`}>
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                  <span>QA</span>
                  <span className="text-slate-500">↓</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`font-mono text-[11px] tracking-wider font-bold ${qaHealth.textColor}`}>{qaHealth.barText}</span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-black/40 font-mono font-bold">{qaHealth.badge}</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-slate-800/60 pt-1.5 mt-2 flex justify-between">
                <span>{qaHealth.description}</span>
                <span className="font-bold text-slate-200 font-mono">{agency.tasks.filter(t => t.phase === 'testing').length} tasks</span>
              </div>
            </div>

            {/* 5. Launch */}
            <div className={`border rounded-lg p-3 flex flex-col justify-between transition-all ${launchHealth.bgTint} ${launchHealth.borderColor}`}>
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                  <span>LAUNCH</span>
                  <span className="text-purple-400">🚀</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`font-mono text-[11px] tracking-wider font-bold ${launchHealth.textColor}`}>{launchHealth.barText}</span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-black/40 font-mono font-bold">{launchHealth.badge}</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-slate-800/60 pt-1.5 mt-2 flex justify-between">
                <span>{launchHealth.description}</span>
                <span className="font-bold text-slate-200 font-mono">{agency.tasks.filter(t => t.phase === 'launch').length} tasks</span>
              </div>
            </div>

          </div>

          <div className="mt-3 p-2 bg-[#121c2a] rounded text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span> Healthy (Moving)
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 ml-2"></span> Slowing Down
              <span className="inline-block w-2 h-2 rounded-full bg-rose-400 ml-2"></span> Blocked
            </span>
            <span className="font-mono text-cyan-300">Target Cycle: 14 Days</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: SECTION 3 (BOTTLENECK RADAR) + SECTION 4 (TEAM UTILIZATION)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Section 3: Bottleneck Radar */}
        <div className="lg:col-span-6 bg-[#0e1622] border border-slate-800 rounded-xl p-4">
          <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <span>🔴</span> BOTTLENECK RADAR
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 font-mono border border-rose-800/50">
              {alerts.length} BLOCKERS
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {alerts.length === 0 ? (
              <div className="p-5 bg-[#121c2a] border border-slate-800/80 rounded-lg text-center">
                <span className="text-2xl block mb-1">🟢</span>
                <span className="font-bold text-emerald-400 block text-xs">Clear Runway — Zero Blockers</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">All workstations and project pipelines operating smoothly.</span>
              </div>
            ) : (
              alerts.map((alert, idx) => (
                <div key={idx} className="p-3 bg-rose-950/30 border border-rose-600/50 rounded-lg flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="text-base mt-0.5">{alert.severity === 'red' ? '🔴' : '⚠️'}</span>
                    <div>
                      <div className="font-bold text-rose-200 uppercase">{alert.room} Alert</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">{alert.reason}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleResolveAlert(alert.room)}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold shrink-0 transition"
                  >
                    Fix Now
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 4: Team Utilization */}
        <div className="lg:col-span-6 bg-[#0e1622] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>👥</span> TEAM UTILIZATION
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">CAPACITY & WORKLOAD</span>
            </div>

            <div className="space-y-3.5 text-xs">
              {agency.team.map(member => {
                const capacity = member.capacityHoursPerWeek || 40;
                const assigned = member.assignedHours || 0;
                const workloadPct = capacity > 0 ? Math.min(100, Math.round((assigned / capacity) * 100)) : 0;
                const isCritical = workloadPct >= 90;
                const isHeavy = workloadPct >= 70;
                const statusColor = isCritical ? 'text-rose-400' : isHeavy ? 'text-amber-400' : 'text-emerald-400';
                const barColor = isCritical ? 'bg-rose-500 animate-pulse' : isHeavy ? 'bg-amber-500' : 'bg-emerald-500';
                const statusText = isCritical ? `${workloadPct}% 🔴 Critical` : isHeavy ? `${workloadPct}% 🟡 Heavy` : workloadPct > 0 ? `${workloadPct}% 🟢 Optimal` : '0% 🟢 Available';

                return (
                  <div key={member.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-200">[{member.role || 'Member'}] {member.name}</span>
                      <span className={`font-mono font-bold ${statusColor}`}>{statusText}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${Math.max(workloadPct, 2)}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Burnout / Workload Banner (Dynamic) */}
          {(() => {
            const overloadedMember = agency.team.find(m => {
              const cap = m.capacityHoursPerWeek || 40;
              const assigned = m.assignedHours || 0;
              return cap > 0 && (assigned / cap) >= 0.9;
            });

            if (overloadedMember) {
              const cap = overloadedMember.capacityHoursPerWeek || 40;
              const pct = Math.round(((overloadedMember.assignedHours || 0) / cap) * 100);
              return (
                <div className="mt-4 p-2.5 bg-rose-950/40 border border-rose-600/50 rounded-lg text-xs text-rose-200 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>⚠️</span>
                    <span className="font-semibold">{overloadedMember.name} at {pct}% — High Risk of Burnout</span>
                  </span>
                  <button 
                    onClick={() => onNavigateTab?.('team')}
                    className="text-[10px] px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold transition"
                  >
                    Delegate
                  </button>
                </div>
              );
            }

            return (
              <div className="mt-4 p-2.5 bg-emerald-950/30 border border-emerald-600/30 rounded-lg text-xs text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>✅</span>
                  <span>Workload distribution is balanced across all active workstations.</span>
                </span>
                <button 
                  onClick={() => onNavigateTab?.('team')}
                  className="text-[10px] px-2 py-0.5 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 rounded font-bold transition"
                >
                  Manage
                </button>
              </div>
            );
          })()}
        </div>

      </div>

      {/* =========================================================================
          ROW 3: SECTION 5 (CATHEDRAL WALL) + SECTION 6 (NEXT ACTIONS)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Section 5: The Cathedral Wall (Completed Projects) */}
        <div className="lg:col-span-6 bg-[#0e1622] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>🏆</span> CATHEDRAL WALL (Completed Projects)
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">MONUMENT OF SHIPPED WORK</span>
            </div>

            {/* Visual Monuments Grid */}
            {completedProjects.length === 0 ? (
              <div className="p-5 bg-[#121c2a] border border-slate-800/80 rounded-lg text-center my-2">
                <span className="text-2xl block mb-1">🏛️</span>
                <span className="font-bold text-slate-300 block text-xs">No Projects Shipped Yet</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Complete and ship your first client system to mount it permanently on the Cathedral Wall!
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 my-2">
                {completedProjects.map(p => (
                  <div key={p.id} className="bg-[#141f2e] border border-amber-500/40 rounded p-2 text-center hover:border-amber-400 transition cursor-pointer">
                    <span className="text-lg block">🏆</span>
                    <span className="font-bold text-[11px] text-amber-300 block truncate">{p.name}</span>
                    <span className="text-[9px] text-slate-400 font-mono">{formatCurrency(p.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-300">{completedProjects.length} Projects Completed</span>
            <span className="font-mono text-emerald-400 font-bold">Total Value: {formatCurrency(cathedralVal)}</span>
          </div>
        </div>

        {/* Section 6: Next Actions (Your To-Do) */}
        <div className="lg:col-span-6 bg-[#0e1622] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <span>🎯</span> NEXT ACTIONS (Your To-Do)
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">PRIORITIZED EXECUTION</span>
            </div>

            <div className="space-y-2 text-xs">
              {todoList.map((item) => {
                const priorityBadge = 
                  item.priority === 'red' ? 'bg-rose-500 text-white' :
                  item.priority === 'yellow' ? 'bg-amber-500 text-black' :
                  item.priority === 'green' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200';

                return (
                  <div 
                    key={item.id}
                    onClick={() => toggleTodo(item.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between gap-3 transition ${
                      item.completed ? 'bg-slate-900/40 border-slate-800 text-slate-500 line-through' : 'bg-[#121c2a] border-slate-800 hover:border-cyan-700/50 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${priorityBadge}`}>
                        {item.completed ? '✓' : item.id}
                      </span>
                      <div>
                        <span className="font-medium text-xs block">{item.text}</span>
                        <span className="text-[10px] text-slate-400 block">{item.why}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      {item.priority === 'red' ? 'Must Do' : item.priority === 'yellow' ? 'Should Do' : 'Anytime'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-[10px] text-slate-500 font-mono text-right">
            Click item to toggle completion status
          </div>
        </div>

      </div>

      {/* =========================================================================
          ROW 4: SECTION 7 (UPCOMING DEADLINES) + SECTION 8 (AGENCY HEALTH METER)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Section 7: Upcoming Deadlines */}
        <div className="lg:col-span-6 bg-[#0e1622] border border-slate-800 rounded-xl p-4">
          <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <span>📅</span> UPCOMING DEADLINES
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">DELIVERY SCHEDULE</span>
          </div>

          <div className="space-y-2 text-xs">
            {activeProjects.length === 0 ? (
              <div className="p-6 text-center bg-[#121c2a] rounded-lg border border-dashed border-slate-800">
                <div className="text-2xl mb-1.5">🛬</div>
                <div className="text-slate-300 font-bold text-xs">Clear Delivery Runway</div>
                <p className="text-slate-500 text-[11px] mt-0.5 max-w-xs mx-auto">
                  No impending delivery deadlines. Sign client projects to schedule production milestones.
                </p>
                <button
                  onClick={() => onNavigateTab?.('projects')}
                  className="mt-3 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-bold transition"
                >
                  + Create New Project
                </button>
              </div>
            ) : (
              activeProjects.slice(0, 4).map((p, idx) => (
                <div key={p.id} className={`p-2.5 bg-[#121c2a] border-l-4 ${idx === 0 ? 'border-rose-500' : idx === 1 ? 'border-amber-500' : 'border-emerald-500'} rounded flex items-center justify-between`}>
                  <div>
                    <span className={`font-bold block ${idx === 0 ? 'text-rose-300' : idx === 1 ? 'text-amber-300' : 'text-emerald-300'}`}>
                      {idx === 0 ? '🔴' : idx === 1 ? '🟡' : '🟢'} {p.name}
                    </span>
                    <span className="text-[10px] text-slate-400">Client: {p.clientName || 'Direct'} • Phase: {p.phase.toUpperCase()}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${idx === 0 ? 'bg-rose-950 text-rose-300' : idx === 1 ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'}`}>
                    ${p.value.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 8: Agency Health Meter */}
        <div className="lg:col-span-6 bg-[#0e1622] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span>📊</span> AGENCY HEALTH METER
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">FOUNDER CONFIDENCE</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#121c2a] rounded-lg border border-slate-800">
                {(() => {
                  const revPct = Math.min(100, Math.round((annualRev / annualTarget) * 100));
                  return (
                    <>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400 text-[11px]">Revenue Target</span>
                        <span className={`font-mono font-bold ${revPct >= 80 ? 'text-emerald-400' : revPct >= 40 ? 'text-amber-400' : 'text-cyan-400'}`}>
                          {revPct}% {revPct >= 80 ? '🟢' : '⚪'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${Math.max(revPct, 2)}%` }}></div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{formatCurrency(annualRev)} / {formatCurrency(annualTarget)} target</span>
                    </>
                  );
                })()}
              </div>

              <div className="p-3 bg-[#121c2a] rounded-lg border border-slate-800">
                {(() => {
                  const compCount = completedProjects.length;
                  const totalCount = agency.projects.length;
                  const deliveryPct = totalCount > 0 ? Math.round((compCount / totalCount) * 100) : 100;
                  return (
                    <>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400 text-[11px]">Projects Delivered</span>
                        <span className="font-mono text-emerald-400 font-bold">{deliveryPct}% 🟢</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.max(deliveryPct, 2)}%` }}></div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {totalCount === 0 ? 'Fresh pipeline (0 active backlog)' : `${compCount} of ${totalCount} shipped`}
                      </span>
                    </>
                  );
                })()}
              </div>

              <div className="p-3 bg-[#121c2a] rounded-lg border border-slate-800">
                {(() => {
                  const totalAssigned = agency.team.reduce((acc, m) => acc + (m.assignedHours || 0), 0);
                  const totalCap = agency.team.reduce((acc, m) => acc + (m.capacityHoursPerWeek || 40), 0);
                  const stressPct = totalCap > 0 ? Math.min(100, Math.round((totalAssigned / totalCap) * 100)) : 0;
                  const stressColor = stressPct >= 85 ? 'text-rose-400' : stressPct >= 60 ? 'text-amber-400' : 'text-emerald-400';
                  const stressBar = stressPct >= 85 ? 'bg-rose-500' : stressPct >= 60 ? 'bg-amber-500' : 'bg-emerald-500';
                  return (
                    <>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400 text-[11px]">Team Workload</span>
                        <span className={`font-mono font-bold ${stressColor}`}>{stressPct}% {stressPct >= 85 ? '🔴' : '🟢'}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1">
                        <div className={`h-full rounded-full transition-all ${stressBar}`} style={{ width: `${Math.max(stressPct, 2)}%` }}></div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {stressPct === 0 ? 'Zero burnout / high bandwidth' : `${totalAssigned}h allocated / ${totalCap}h capacity`}
                      </span>
                    </>
                  );
                })()}
              </div>

              <div className="p-3 bg-[#121c2a] rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 text-[11px]">Client Standing</span>
                  <span className="font-mono text-emerald-400 font-bold">{(agency.resources.reputation / 10).toFixed(1)}/10 🟢</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, agency.resources.reputation)}%` }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {agency.resources.reputation >= 90 ? 'Pristine reputation index' : 'Healthy client standing'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 p-2 bg-[#121c2a] rounded text-[11px] text-emerald-300 flex items-center justify-between font-mono">
            <span>Overall Agency State: VIBRANT & READY</span>
            <span>Level {agency.agency.level} Studio</span>
          </div>
        </div>

      </div>

    </div>
  );
}
