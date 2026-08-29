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
    { id: '1', text: 'Unblock CardVault AI (urgent client secret)', priority: 'red', completed: false, why: 'Stops development progress' },
    { id: '2', text: "Check Designer's backlog & token specs", priority: 'yellow', completed: false, why: 'Prevent future bottlenecks' },
    { id: '3', text: 'Review RNG Gamez proposal & contract', priority: 'green', completed: false, why: 'Low urgency, high value' },
    { id: '4', text: "Review this week's content calendar plan", priority: 'white', completed: false, why: 'Marketing alignment' },
    { id: '5', text: "Prepare for tomorrow's team sync", priority: 'white', completed: false, why: 'Internal communication' },
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
  const monthlyRev = 12000;

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
              setQuickNotification('📧 Client Update Email dispatched to CardVault!');
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
              <span className="text-sm font-bold text-purple-300 font-mono">{agency.stats?.totalTasksCompleted || 3} Tasks</span>
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
            <span className="font-bold text-amber-300 font-mono">CardVault TCG Launch</span>
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
                <span className="font-bold text-slate-200 font-mono">{agency.tasks.filter(t => t.phase === 'discovery').length || 2} tasks</span>
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
                <span className="font-bold text-slate-200 font-mono">{agency.tasks.filter(t => t.phase === 'design').length || 1} task</span>
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
                <span className="font-bold text-slate-200 font-mono">{agency.tasks.filter(t => t.phase === 'development').length || 3} tasks</span>
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
                <span className="font-bold text-slate-200 font-mono">4 tasks</span>
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
                <span className="font-bold text-slate-200 font-mono">2 tasks</span>
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
            {/* Critical Blocker */}
            <div className="p-3 bg-rose-950/30 border border-rose-600/50 rounded-lg flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">🔴</span>
                <div>
                  <div className="font-bold text-rose-200">CRITICAL: CardVault AI Platform — Blocked (Dev Schema)</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">Waiting on TCG API client secret key · Stalled 3 days</div>
                </div>
              </div>
              <button 
                onClick={() => handleResolveAlert('dev')}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold shrink-0 transition"
              >
                Fix Now
              </button>
            </div>

            {/* High Warning */}
            <div className="p-3 bg-amber-950/25 border border-amber-600/40 rounded-lg flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">⚠️</span>
                <div>
                  <div className="font-bold text-amber-200">HIGH: Frontend Utilization — 95% (Overloaded)</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">Hello Kitty station is carrying 28h backlog · Rebalance to Backend</div>
                </div>
              </div>
              <button 
                onClick={() => onNavigateTab?.('team')}
                className="px-2.5 py-1 bg-amber-600/80 hover:bg-amber-500 text-white rounded text-[10px] font-bold shrink-0 transition"
              >
                Rebalance
              </button>
            </div>

            {/* Medium Warning */}
            <div className="p-3 bg-yellow-950/20 border border-yellow-700/30 rounded-lg flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">🟡</span>
                <div>
                  <div className="font-bold text-yellow-200">MEDIUM: Content Marketing — 3 Drafts Pending</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">Awaiting founder review on weekly SEO articles</div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">In Review</span>
            </div>

            {/* Low Notification */}
            <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 rounded-lg flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">🟢</span>
                <div>
                  <div className="font-bold text-emerald-200">LOW: Minor Component Dependency Stuck</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">Icon pack v2.4 upgrade queued for next sprint</div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono shrink-0">Monitored</span>
            </div>
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
              {/* Member 1: Founder */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-200">[You] Founder & Architect</span>
                  <span className="font-mono text-emerald-400 font-bold">85% 🟢 Healthy</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              {/* Member 2: Designer */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-200">[Designer] Creative Lead</span>
                  <span className="font-mono text-yellow-400 font-bold">60% 🟡 Available</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>

              {/* Member 3: Frontend (Hello Kitty) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-200">[Frontend] Hello Kitty Station</span>
                  <span className="font-mono text-rose-400 font-bold">95% 🔴 Critical</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full animate-pulse" style={{ width: '95%' }}></div>
                </div>
              </div>

              {/* Member 4: Backend (Spider-Man) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-200">[Backend] Spider-Man Station</span>
                  <span className="font-mono text-emerald-400 font-bold">75% 🟢 Healthy</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Burnout Warning Banner */}
          <div className="mt-4 p-2.5 bg-rose-950/40 border border-rose-600/50 rounded-lg text-xs text-rose-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>⚠️</span>
              <span className="font-semibold">Frontend at 95% — High Risk of Burnout</span>
            </span>
            <button 
              onClick={() => onNavigateTab?.('team')}
              className="text-[10px] px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold transition"
            >
              Delegate
            </button>
          </div>
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
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 my-2">
              <div className="bg-[#141f2e] border border-amber-500/40 rounded p-2 text-center hover:border-amber-400 transition cursor-pointer">
                <span className="text-lg block">🎲</span>
                <span className="font-bold text-[11px] text-amber-300 block truncate">RNG Gamez</span>
                <span className="text-[9px] text-slate-400 font-mono">$10,000</span>
              </div>
              <div className="bg-[#141f2e] border border-amber-500/40 rounded p-2 text-center hover:border-amber-400 transition cursor-pointer">
                <span className="text-lg block">🌸</span>
                <span className="font-bold text-[11px] text-amber-300 block truncate">Perfume</span>
                <span className="text-[9px] text-slate-400 font-mono">$5,000</span>
              </div>
              <div className="bg-[#141f2e] border border-cyan-500/40 rounded p-2 text-center hover:border-cyan-400 transition cursor-pointer">
                <span className="text-lg block">🃏</span>
                <span className="font-bold text-[11px] text-cyan-300 block truncate">TCG Shop</span>
                <span className="text-[9px] text-slate-400 font-mono">$12,000</span>
              </div>
              <div className="bg-[#141f2e] border border-cyan-500/40 rounded p-2 text-center hover:border-cyan-400 transition cursor-pointer">
                <span className="text-lg block">⚡</span>
                <span className="font-bold text-[11px] text-cyan-300 block truncate">SaaS Dev</span>
                <span className="text-[9px] text-slate-400 font-mono">$8,000</span>
              </div>
              <div className="bg-[#141f2e] border border-purple-500/40 rounded p-2 text-center hover:border-purple-400 transition cursor-pointer">
                <span className="text-lg block">📰</span>
                <span className="font-bold text-[11px] text-purple-300 block truncate">Blog Dev</span>
                <span className="text-[9px] text-slate-400 font-mono">$4,000</span>
              </div>
              <div className="bg-[#141f2e] border border-emerald-500/40 rounded p-2 text-center hover:border-emerald-400 transition cursor-pointer">
                <span className="text-lg block">💎</span>
                <span className="font-bold text-[11px] text-emerald-300 block truncate">CardVault</span>
                <span className="text-[9px] text-slate-400 font-mono">$12,000</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-300">6 Projects Completed</span>
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
            <div className="p-2.5 bg-[#121c2a] border-l-4 border-rose-500 rounded flex items-center justify-between">
              <div>
                <span className="font-bold text-rose-300 block">🔴 Today, 5:00 PM: Proposal to Client A</span>
                <span className="text-[10px] text-slate-400">If missed → Lost client opportunity</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-rose-950 text-rose-300 rounded font-mono font-bold">URGENT</span>
            </div>

            <div className="p-2.5 bg-[#121c2a] border-l-4 border-rose-500 rounded flex items-center justify-between">
              <div>
                <span className="font-bold text-rose-300 block">🔴 Tomorrow: TCG Shop Launch (Critical)</span>
                <span className="text-[10px] text-slate-400">If missed → Delayed client revenue ($12k)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-rose-950 text-rose-300 rounded font-mono font-bold">SHIP</span>
            </div>

            <div className="p-2.5 bg-[#121c2a] border-l-4 border-amber-500 rounded flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-300 block">🟡 Wednesday: Content Calendar Submission</span>
                <span className="text-[10px] text-slate-400">If missed → Marketing campaign delay</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-amber-950 text-amber-300 rounded font-mono">UPCOMING</span>
            </div>

            <div className="p-2.5 bg-[#121c2a] border-l-4 border-emerald-500 rounded flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-300 block">🟢 Friday: Team Retrospective</span>
                <span className="text-[10px] text-slate-400">Internal culture & velocity sync</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded font-mono">ON TRACK</span>
            </div>
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
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 text-[11px]">Revenue Target</span>
                  <span className="font-mono text-emerald-400 font-bold">90% 🟢</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90%' }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">$45,000 / $50,000 target</span>
              </div>

              <div className="p-3 bg-[#121c2a] rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 text-[11px]">Projects Delivered</span>
                  <span className="font-mono text-emerald-400 font-bold">80% 🟢</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">4 of 5 delivered on-time</span>
              </div>

              <div className="p-3 bg-[#121c2a] rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 text-[11px]">Team Stress</span>
                  <span className="font-mono text-yellow-400 font-bold">65% 🟡</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Moderate stress levels</span>
              </div>

              <div className="p-3 bg-[#121c2a] rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 text-[11px]">Client Satisfaction</span>
                  <span className="font-mono text-emerald-400 font-bold">8.5/10 🟢</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">High satisfaction index</span>
              </div>
            </div>
          </div>

          <div className="mt-3 p-2 bg-[#121c2a] rounded text-[11px] text-emerald-300 flex items-center justify-between font-mono">
            <span>Overall Agency State: VIBRANT & RESILIENT</span>
            <span>Level {agency.agency.level} Studio</span>
          </div>
        </div>

      </div>

    </div>
  );
}
