import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Video,
  MapPin,
  Phone,
  Plus,
  ArrowLeft,
  Edit3,
  Square,
  BarChart2,
  X,
  Send,
  Copy,
  Save,
  AlertTriangle,
  Link2,
  User,
  Briefcase,
  Target,
  Timer,
  ChevronDown
} from 'lucide-react';
import { AgencyState, AgencyTask, Project } from '../core/agencyTypes';
import AgencyManager from '../core/agency';
import { getMultiplayerManager } from '../core/multiplayer';

// ── TYPES (Only data unique to this room) ─────────────────────────────────

export type MeetingPriority = 'high' | 'medium' | 'low';
export type MeetingLocation = 'Video Call' | 'In-Person' | 'Phone';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed';

export interface MeetingItem {
  id: string;
  title: string;
  projectId: string | null; // links to real agency.projects
  date: string;
  time: string;
  duration: number;
  location: MeetingLocation;
  priority: MeetingPriority;
  status: MeetingStatus;
  agenda: string[];
  notes: string;
  attendees: string[];
}

export interface DecisionLogEntry {
  id: string;
  date: string;
  decision: string;
  context: string;
  madeBy: string;
  projectId: string | null;
}

export interface MeetingTemplate {
  id: string;
  title: string;
  description: string;
  agendaItems: string[];
}

// ── SEED DATA ──────────────────────────────────────────────────────────────

const INITIAL_MEETINGS: MeetingItem[] = [
  {
    id: 'meet_1',
    title: 'RNG Gamez — Final Delivery Review',
    projectId: 'proj_rng',
    date: '2026-03-15',
    time: '10:00 AM',
    duration: 30,
    location: 'Video Call',
    priority: 'high',
    status: 'scheduled',
    agenda: [
      'Review production deployment status',
      'Demo automated tournament bracket system',
      'Sign-off checklist walkthrough',
      'Discuss ongoing maintenance retainer',
    ],
    notes: 'Client confirmed receipt of the tournament sync bracket module. Awaiting final sign-off.',
    attendees: ['Founder', 'Client (John)'],
  },
  {
    id: 'meet_2',
    title: 'Perfume Shop — Design Approval',
    projectId: 'proj_perfume',
    date: '2026-03-15',
    time: '02:00 PM',
    duration: 45,
    location: 'In-Person',
    priority: 'medium',
    status: 'scheduled',
    agenda: [
      'Present final dark gold design tokens',
      'Review typography pairing selections',
      'Discuss Phase 2 WebGL bottle simulator scope',
      'Get sign-off on brand identity kit',
    ],
    notes: 'Showcase typography pairings and dark gold aesthetic tokens.',
    attendees: ['Founder', 'Designer', 'Client (Sarah)'],
  },
  {
    id: 'meet_3',
    title: 'TCG Shop — Scope & Architecture Sync',
    projectId: null,
    date: '2026-03-16',
    time: '11:30 AM',
    duration: 30,
    location: 'Video Call',
    priority: 'low',
    status: 'scheduled',
    agenda: [
      'Review 100k+ card catalog ingestion architecture',
      'Discuss AI buylist pricing engine timeline',
      'Align on WebSocket real-time price sync approach',
    ],
    notes: 'Prepare initial technical scope document before the call.',
    attendees: ['Founder', 'Backend Dev', 'Client (Marcus)'],
  },
];

const INITIAL_DECISIONS: DecisionLogEntry[] = [
  { id: 'dec_1', date: 'Mar 15', decision: 'Approve RNG Gamez production launch', context: 'All milestones passed QA, SSL and DNS verified', madeBy: 'Founder', projectId: 'proj_rng' },
  { id: 'dec_2', date: 'Mar 12', decision: 'Extend Perfume Shop timeline by 2 weeks', context: 'Added WebGL 3D shader bottle customization to scope', madeBy: 'Founder & Designer', projectId: 'proj_perfume' },
  { id: 'dec_3', date: 'Mar 10', decision: 'Accept DragonCard Vault proposal at enterprise tier', context: 'High-volume catalog requires enterprise architecture', madeBy: 'Founder', projectId: null },
  { id: 'dec_4', date: 'Mar 08', decision: 'Migrate SaaS client to Redis cluster caching', context: 'Benchmarks showed 4x latency improvement', madeBy: 'Backend Dev & Founder', projectId: null },
];

const TEMPLATES: MeetingTemplate[] = [
  {
    id: 'tmpl_disc',
    title: 'Discovery Call',
    description: 'Qualify leads and capture technical requirements.',
    agendaItems: [
      'Introduction & relationship building',
      'Understand current business setup, revenue, and team',
      'Identify pain points (fees, manual work, scaling)',
      'Define goals — what does success look like?',
      'Discuss budget range & timeline expectations',
      'Agree on next steps & follow-up date',
    ],
  },
  {
    id: 'tmpl_review',
    title: 'Project Review',
    description: 'Sprint alignment and blocker resolution.',
    agendaItems: [
      'Status update & milestone velocity check',
      'Demo completed deliverables',
      'Review in-progress work & blockers',
      'Identify technical issues or stalled dependencies',
      'Plan next sprint deliverables',
      'Confirm next check-in date',
    ],
  },
  {
    id: 'tmpl_onboard',
    title: 'Client Onboarding',
    description: 'Kickoff meeting for new projects.',
    agendaItems: [
      'Welcome & team introductions',
      'Project scope & deliverables review',
      'Timeline & milestone breakdown',
      'Communication channels & async cadence',
      'Access provisioning (repos, APIs, credentials)',
      'Immediate next steps & kickoff sprint',
    ],
  },
];

// ── COMPONENT ──────────────────────────────────────────────────────────────

interface Props {
  agency: AgencyState;
  manager: AgencyManager;
  onClose: () => void;
  onRefresh: () => void;
}

export default function MeetingPlanningRoom({ agency, manager, onClose, onRefresh }: Props) {
  const multiplayer = useMemo(() => getMultiplayerManager(), []);
  const founderName = multiplayer.localPlayer.name || 'Founder';

  // ── Own Data (unique to this room) ──
  const [meetings, setMeetings] = useState<MeetingItem[]>(() => {
    const saved = localStorage.getItem('aeethod_meetings_v2');
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [decisions, setDecisions] = useState<DecisionLogEntry[]>(() => {
    const saved = localStorage.getItem('aeethod_decisions_v2');
    return saved ? JSON.parse(saved) : INITIAL_DECISIONS;
  });

  // ── Modals ──
  const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);
  const [showAddDecisionModal, setShowAddDecisionModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [activeNotesMeeting, setActiveNotesMeeting] = useState<MeetingItem | null>(null);

  // ── Agenda Editor ──
  const [agendaEditingMeeting, setAgendaEditingMeeting] = useState<string | null>(null);

  // ── Live Clock ──
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // ── Persist own data ──
  useEffect(() => {
    localStorage.setItem('aeethod_meetings_v2', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('aeethod_decisions_v2', JSON.stringify(decisions));
  }, [decisions]);

  // ── Escape key handler ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAddMeetingModal) setShowAddMeetingModal(false);
        else if (showAddDecisionModal) setShowAddDecisionModal(false);
        else if (showAddTaskModal) setShowAddTaskModal(false);
        else if (showTemplateLibrary) setShowTemplateLibrary(false);
        else if (showAnalyticsModal) setShowAnalyticsModal(false);
        else if (activeNotesMeeting) setActiveNotesMeeting(null);
        else if (agendaEditingMeeting) setAgendaEditingMeeting(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddMeetingModal, showAddDecisionModal, showAddTaskModal, showTemplateLibrary, showAnalyticsModal, activeNotesMeeting, agendaEditingMeeting, onClose]);

  // ── Derived Data (from real agency state) ──
  const activeProjects = useMemo(() => agency.projects.filter(p => p.phase !== 'completed'), [agency.projects]);
  const allProjects = agency.projects;

  const getProjectById = useCallback((id: string | null): Project | null => {
    if (!id) return null;
    return allProjects.find(p => p.id === id) || null;
  }, [allProjects]);

  // Action items: real tasks that are not done, sorted by priority
  const actionItems = useMemo(() => {
    return agency.tasks
      .filter(t => t.status !== 'done')
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 12); // Show top 12
  }, [agency.tasks]);

  const completedTasksToday = useMemo(() => {
    const todayStr = now.toISOString().split('T')[0];
    return agency.tasks.filter(t => t.status === 'done' && t.completedAt && t.completedAt.startsWith(todayStr)).length;
  }, [agency.tasks, now]);

  const scheduledMeetings = useMemo(() => meetings.filter(m => m.status !== 'completed'), [meetings]);
  const completedMeetings = useMemo(() => meetings.filter(m => m.status === 'completed'), [meetings]);

  const overdueTasks = useMemo(() => {
    return agency.tasks.filter(t => {
      if (t.status === 'done') return false;
      if (!t.deadline) return false;
      return new Date(t.deadline) < now;
    }).length;
  }, [agency.tasks, now]);

  // ── Analytics (computed from real data) ──
  const analytics = useMemo(() => {
    const totalMeetings = meetings.length;
    const completed = meetings.filter(m => m.status === 'completed').length;
    const totalDuration = meetings.reduce((sum, m) => sum + m.duration, 0);
    const avgDuration = totalMeetings > 0 ? Math.round(totalDuration / totalMeetings) : 0;

    // Count meetings per project
    const projectMeetingCounts: Record<string, number> = {};
    meetings.forEach(m => {
      if (m.projectId) {
        projectMeetingCounts[m.projectId] = (projectMeetingCounts[m.projectId] || 0) + 1;
      }
    });

    let mostActiveProject: string | null = null;
    let maxCount = 0;
    for (const [projId, count] of Object.entries(projectMeetingCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostActiveProject = projId;
      }
    }

    const mostActiveProjectName = mostActiveProject ? (getProjectById(mostActiveProject)?.name || 'Unknown') : 'None';

    return {
      totalMeetings,
      completedMeetings: completed,
      avgDuration,
      totalDuration,
      completionRate: totalMeetings > 0 ? Math.round((completed / totalMeetings) * 100) : 0,
      mostActiveProject: mostActiveProjectName,
      mostActiveCount: maxCount,
    };
  }, [meetings, getProjectById]);

  // ── Handlers ──
  const handleToggleMeetingComplete = (id: string) => {
    setMeetings(prev =>
      prev.map(m => m.id === id ? { ...m, status: m.status === 'completed' ? 'scheduled' : 'completed' as MeetingStatus } : m)
    );
  };

  const handleCompleteRealTask = (taskId: string) => {
    manager.completeTask(taskId);
    onRefresh();
  };

  const handleApplyTemplate = (tmpl: MeetingTemplate) => {
    if (agendaEditingMeeting) {
      setMeetings(prev =>
        prev.map(m => m.id === agendaEditingMeeting ? { ...m, agenda: [...tmpl.agendaItems] } : m)
      );
    }
    setShowTemplateLibrary(false);
  };

  // Get project health color
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'green': return 'text-emerald-400';
      case 'yellow': return 'text-amber-400';
      case 'red': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  const getHealthBg = (health: string) => {
    switch (health) {
      case 'green': return 'bg-emerald-950 border-emerald-800';
      case 'yellow': return 'bg-amber-950 border-amber-800';
      case 'red': return 'bg-rose-950 border-rose-800';
      default: return 'bg-slate-800 border-slate-700';
    }
  };

  const getPriorityDot = (p: MeetingPriority) => {
    switch (p) {
      case 'high': return 'bg-rose-500 animate-pulse';
      case 'medium': return 'bg-amber-400';
      case 'low': return 'bg-emerald-400';
    }
  };

  const getPriorityBadge = (p: MeetingPriority) => {
    switch (p) {
      case 'high': return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'medium': return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'low': return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return { label: '🔄 Active', cls: 'bg-cyan-950 text-cyan-300 border-cyan-800' };
      case 'blocked': return { label: '🔴 Blocked', cls: 'bg-rose-950 text-rose-300 border-rose-800' };
      case 'review': return { label: '🟡 Review', cls: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'queued': return { label: '⏳ Queued', cls: 'bg-slate-800 text-slate-300 border-slate-700' };
      default: return { label: status, cls: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getTeamMemberName = (memberId: string | null): string => {
    if (!memberId) return 'Unassigned';
    const member = agency.team.find(m => m.id === memberId);
    return member ? member.name : memberId;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md font-mono text-slate-200 select-none animate-in fade-in">
      <div className="w-full max-w-7xl max-h-[96vh] bg-[#0a0f18] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* ─── HEADER ───────────────────────────────────────────────────── */}
        <div className="p-4 bg-[#070b12] border-b border-slate-800 space-y-2.5 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-base font-black text-slate-100 flex items-center gap-2 tracking-wide">
                <span>📅</span> MEETING & PLANNING ROOM
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{formatDate(now)}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formatTime(now)}</span>
                </span>
                <span>•</span>
                <span className="text-slate-500">{founderName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTemplateLibrary(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Templates</span>
              </button>
              <button
                onClick={() => setShowAnalyticsModal(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-700"
              >
                <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Insights</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-[#0d1522] border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">📋 Scheduled</span>
              <strong className="text-cyan-400 font-bold">{scheduledMeetings.length}</strong>
            </div>
            <div className="p-2 bg-[#0d1522] border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">📝 Active Projects</span>
              <strong className="text-emerald-400 font-bold">{activeProjects.length}</strong>
            </div>
            <div className="p-2 bg-[#0d1522] border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">⚠️ Overdue Tasks</span>
              <strong className={`font-bold ${overdueTasks > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{overdueTasks}</strong>
            </div>
            <div className="p-2 bg-[#0d1522] border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">✅ Done Today</span>
              <strong className="text-purple-400 font-bold">{completedTasksToday}</strong>
            </div>
          </div>
        </div>

        {/* ─── MAIN SCROLLABLE CONTENT ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-[#090e17]">

          {/* ════ SECTION 1: MEETINGS ════════════════════════════════════ */}
          <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <span>📋</span> MEETINGS ({scheduledMeetings.length} upcoming)
              </h2>
              <button
                onClick={() => setShowAddMeetingModal(true)}
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold rounded-lg transition flex items-center gap-1 shadow-sm shadow-cyan-900/40"
              >
                <Plus className="w-3 h-3" />
                <span>Schedule Meeting</span>
              </button>
            </div>

            <div className="space-y-3">
              {meetings.map(m => {
                const isComplete = m.status === 'completed';
                const linkedProject = getProjectById(m.projectId);

                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border transition ${
                      isComplete
                        ? 'bg-[#080d14]/60 border-slate-800/60 opacity-50'
                        : 'bg-[#080d14] border-slate-800 hover:border-slate-700'
                    } space-y-2.5 text-xs`}
                  >
                    {/* Row 1: Title + Priority + Duration + Location */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getPriorityDot(m.priority)}`} />
                        <span className={`text-sm ${isComplete ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                          {m.time} — {m.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-bold flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded uppercase border ${getPriorityBadge(m.priority)}`}>
                          {m.priority}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {m.duration} min
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 flex items-center gap-1">
                          {m.location === 'Video Call' ? <Video className="w-3 h-3" /> : m.location === 'Phone' ? <Phone className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                          <span>{m.location}</span>
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Linked Project (real data) */}
                    {linkedProject && (
                      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#060a10] rounded-lg border border-slate-800/60">
                        <Link2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-[11px] text-slate-400">Project:</span>
                        <span className="text-[11px] text-slate-200 font-bold">{linkedProject.name}</span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${getHealthBg(linkedProject.health)}`}>
                          <span className={getHealthColor(linkedProject.health)}>
                            {linkedProject.health === 'green' ? '🟢' : linkedProject.health === 'yellow' ? '🟡' : '🔴'} {linkedProject.phase}
                          </span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold ml-auto">${linkedProject.value.toLocaleString()}</span>
                      </div>
                    )}

                    {!linkedProject && m.projectId === null && (
                      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#060a10] rounded-lg border border-slate-800/60">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-[11px] text-slate-500 italic">No linked project — general meeting</span>
                      </div>
                    )}

                    {/* Row 3: Agenda (collapsed by default) */}
                    {agendaEditingMeeting === m.id ? (
                      <div className="space-y-1.5 p-2.5 bg-[#060a10] rounded-lg border border-slate-800/60">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 uppercase font-bold">Agenda Items</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => { setAgendaEditingMeeting(m.id); setShowTemplateLibrary(true); }}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold"
                            >
                              Apply Template
                            </button>
                            <button
                              onClick={() => setAgendaEditingMeeting(null)}
                              className="text-slate-500 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {m.agenda.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px]">
                            <span className="text-slate-500 w-4 text-right shrink-0">{idx + 1}.</span>
                            <input
                              className="flex-1 bg-[#080d14] border border-slate-800 rounded px-2 py-1 text-slate-200 text-[11px]"
                              value={item}
                              onChange={e => {
                                const newAgenda = [...m.agenda];
                                newAgenda[idx] = e.target.value;
                                setMeetings(prev => prev.map(mt => mt.id === m.id ? { ...mt, agenda: newAgenda } : mt));
                              }}
                            />
                            <button
                              onClick={() => {
                                setMeetings(prev => prev.map(mt => mt.id === m.id ? { ...mt, agenda: mt.agenda.filter((_, i) => i !== idx) } : mt));
                              }}
                              className="text-slate-600 hover:text-rose-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            setMeetings(prev => prev.map(mt => mt.id === m.id ? { ...mt, agenda: [...mt.agenda, 'New agenda item'] } : mt));
                          }}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold mt-1"
                        >
                          + Add Item
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-300 space-y-0.5">
                        {m.agenda.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="text-slate-600">{idx + 1}.</span>
                            <span>{item}</span>
                          </div>
                        ))}
                        {m.agenda.length > 3 && (
                          <span className="text-[10px] text-slate-500">+{m.agenda.length - 3} more items</span>
                        )}
                      </div>
                    )}

                    {/* Row 4: Attendees */}
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{m.attendees.join(', ')}</span>
                    </div>

                    {/* Row 5: Actions */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAgendaEditingMeeting(agendaEditingMeeting === m.id ? null : m.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg transition flex items-center gap-1 border border-slate-700"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Agenda</span>
                        </button>
                        <button
                          onClick={() => setActiveNotesMeeting(m)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg transition flex items-center gap-1 border border-slate-700"
                        >
                          <span>📝</span>
                          <span>Notes</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleToggleMeetingComplete(m.id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                          isComplete
                            ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isComplete ? 'Undo' : 'Complete'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {meetings.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No meetings scheduled. Click "Schedule Meeting" to add one.
                </div>
              )}
            </div>
          </div>

          {/* ════ SECTION 2: ACTION ITEMS + DECISION LOG ══════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Action Items (from real agency.tasks) */}
            <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-3 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <span>✅</span> ACTION ITEMS
                  <span className="text-[10px] text-slate-500 font-normal ml-1">(from agency tasks)</span>
                </h3>
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="px-2 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded border border-cyan-500"
                >
                  + Create Task
                </button>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[320px] space-y-1.5">
                {actionItems.length === 0 && (
                  <div className="p-6 text-center text-slate-500 text-xs">No pending tasks.</div>
                )}

                {actionItems.map(task => {
                  const badge = getTaskStatusBadge(task.status);
                  const project = getProjectById(task.projectId);
                  const isOverdue = task.deadline && new Date(task.deadline) < now && task.status !== 'done';

                  return (
                    <div
                      key={task.id}
                      className={`p-2.5 rounded-lg border text-[11px] flex items-start gap-2.5 transition hover:bg-[#060a10] ${
                        isOverdue ? 'bg-rose-950/20 border-rose-900/40' : 'bg-[#080d14] border-slate-800'
                      }`}
                    >
                      <button
                        onClick={() => handleCompleteRealTask(task.id)}
                        className="mt-0.5 shrink-0 text-slate-500 hover:text-emerald-400 transition"
                        title="Mark as done"
                      >
                        <Square className="w-4 h-4" />
                      </button>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-200 truncate">{task.title}</span>
                          {isOverdue && <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                          <span>{getTeamMemberName(task.assignedTo)}</span>
                          {project && (
                            <>
                              <span>•</span>
                              <span className="text-cyan-400">{project.name}</span>
                            </>
                          )}
                          {task.deadline && (
                            <>
                              <span>•</span>
                              <span className={isOverdue ? 'text-rose-400 font-bold' : ''}>
                                Due: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] uppercase border shrink-0 ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                <span>
                  {agency.tasks.filter(t => t.status === 'blocked').length} blocked •{' '}
                  {overdueTasks} overdue •{' '}
                  {agency.tasks.filter(t => t.status === 'active').length} active
                </span>
                <span className="text-emerald-400 font-bold">
                  {agency.stats.totalTasksCompleted} total completed
                </span>
              </div>
            </div>

            {/* Decision Log */}
            <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-3 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📋</span> DECISION LOG
                </h3>
                <button
                  onClick={() => setShowAddDecisionModal(true)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded border border-slate-700"
                >
                  + Log Decision
                </button>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[320px] space-y-2">
                {decisions.map(d => {
                  const project = getProjectById(d.projectId);
                  return (
                    <div key={d.id} className="p-3 bg-[#080d14] border border-slate-800 rounded-lg text-xs space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <span className="font-bold text-slate-200">{d.decision}</span>
                          {d.context && <p className="text-[10px] text-slate-500 mt-0.5">{d.context}</p>}
                        </div>
                        <span className="text-[10px] text-cyan-400 font-bold whitespace-nowrap shrink-0">{d.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>By: <strong className="text-slate-400">{d.madeBy}</strong></span>
                        {project && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-400">{project.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                <span>{decisions.length} decisions logged</span>
              </div>
            </div>
          </div>

          {/* ════ SECTION 3: MEETING INSIGHTS (computed) ══════════════════ */}
          <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <span>📊</span> MEETING INSIGHTS
              </h3>
              <span className="text-[10px] text-slate-500">Computed from {analytics.totalMeetings} meetings</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-2.5 bg-[#080d14] rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">TOTAL</span>
                <strong className="text-cyan-400 text-base font-bold">{analytics.totalMeetings}</strong>
              </div>
              <div className="p-2.5 bg-[#080d14] rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">COMPLETED</span>
                <strong className="text-emerald-400 text-base font-bold">{analytics.completedMeetings}</strong>
              </div>
              <div className="p-2.5 bg-[#080d14] rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">AVG DURATION</span>
                <strong className="text-amber-400 text-base font-bold">{analytics.avgDuration}m</strong>
              </div>
              <div className="p-2.5 bg-[#080d14] rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">COMPLETION</span>
                <strong className="text-purple-400 text-base font-bold">{analytics.completionRate}%</strong>
              </div>
              <div className="p-2.5 bg-[#080d14] rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">MOST ACTIVE</span>
                <strong className="text-cyan-300 text-[11px] font-bold">{analytics.mostActiveProject}</strong>
                {analytics.mostActiveCount > 0 && (
                  <span className="text-[10px] text-slate-500 block">{analytics.mostActiveCount} meetings</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL: TAKE NOTES ───────────────────────────────────────── */}
      {activeNotesMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0c121d] border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>📝</span> Meeting Notes — {activeNotesMeeting.title}
              </h3>
              <button onClick={() => setActiveNotesMeeting(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const proj = getProjectById(activeNotesMeeting.projectId);
              return proj ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
                  <Link2 className="w-3 h-3 text-cyan-400" />
                  <span>Linked to <strong className="text-slate-200">{proj.name}</strong> ({proj.phase})</span>
                </div>
              ) : null;
            })()}

            <textarea
              rows={8}
              placeholder="Capture notes, decisions, and follow-ups..."
              className="w-full bg-[#080d14] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 resize-none focus:outline-none focus:border-cyan-500 font-mono"
              value={activeNotesMeeting.notes}
              onChange={e => {
                const val = e.target.value;
                setActiveNotesMeeting({ ...activeNotesMeeting, notes: val });
                setMeetings(prev => prev.map(m => (m.id === activeNotesMeeting.id ? { ...m, notes: val } : m)));
              }}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveNotesMeeting(null)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: SCHEDULE MEETING ─────────────────────────────────── */}
      {showAddMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={e => {
              e.preventDefault();
              const form = e.target as any;
              const newMeeting: MeetingItem = {
                id: `meet_${Date.now()}`,
                title: form.title.value,
                projectId: form.projectId.value || null,
                date: form.date.value,
                time: form.time.value,
                duration: Number(form.duration.value),
                location: form.location.value,
                priority: form.priority.value,
                status: 'scheduled',
                agenda: ['Review project status', 'Discuss next steps'],
                notes: '',
                attendees: form.attendees.value.split(',').map((s: string) => s.trim()).filter(Boolean),
              };
              setMeetings(prev => [...prev, newMeeting]);
              setShowAddMeetingModal(false);
            }}
            className="w-full max-w-lg bg-[#0c121d] border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl font-mono text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>📅</span> Schedule Meeting
              </h3>
              <button type="button" onClick={() => setShowAddMeetingModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Meeting Title</label>
                <input required name="title" placeholder="e.g. Sprint Kickoff — Perfume Shop" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Link to Project</label>
                <select name="projectId" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option value="">— No project (general meeting) —</option>
                  {allProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.clientName} ({p.phase})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Date</label>
                <input type="date" required name="date" defaultValue={now.toISOString().split('T')[0]} className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Time</label>
                <input required name="time" placeholder="10:00 AM" defaultValue="10:00 AM" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Duration (min)</label>
                <input type="number" name="duration" defaultValue={30} className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Priority</label>
                <select name="priority" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Location</label>
                <select name="location" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option value="Video Call">Video Call</option>
                  <option value="In-Person">In-Person</option>
                  <option value="Phone">Phone</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Attendees</label>
                <input name="attendees" placeholder="Founder, Client" defaultValue={`${founderName}, Client`} className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setShowAddMeetingModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold">Schedule</button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL: CREATE TASK (writes to real agency.tasks) ─────────── */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={e => {
              e.preventDefault();
              const form = e.target as any;
              manager.addTask({
                title: form.title.value,
                description: form.description.value || '',
                projectId: form.projectId.value || null,
                assignedTo: form.assignedTo.value || null,
                phase: 'support',
                status: 'queued',
                priority: form.priority.value || 'medium',
                cognitiveLoad: 'medium',
                xpReward: 15,
                estimatedHours: Number(form.hours.value) || 2,
                deadline: form.deadline.value || null,
              });
              onRefresh();
              setShowAddTaskModal(false);
            }}
            className="w-full max-w-md bg-[#0c121d] border border-slate-700 rounded-2xl p-5 space-y-3.5 shadow-2xl font-mono text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>✅</span> Create Action Item
                <span className="text-[10px] text-emerald-400 font-normal ml-1">→ creates real task</span>
              </h3>
              <button type="button" onClick={() => setShowAddTaskModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Task Title</label>
              <input required name="title" placeholder="e.g. Send updated pricing breakdown to client" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Description</label>
              <textarea name="description" rows={2} placeholder="Optional details..." className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Assign To</label>
                <select name="assignedTo" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option value="">Unassigned</option>
                  {agency.team.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Project</label>
                <select name="projectId" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option value="">— None —</option>
                  {allProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Priority</label>
                <select name="priority" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Est. Hours</label>
                <input type="number" name="hours" defaultValue={2} className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Deadline</label>
                <input type="date" name="deadline" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setShowAddTaskModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold">Create Task</button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL: LOG DECISION ─────────────────────────────────────── */}
      {showAddDecisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={e => {
              e.preventDefault();
              const form = e.target as any;
              const newDecision: DecisionLogEntry = {
                id: `dec_${Date.now()}`,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                decision: form.decision.value,
                context: form.context.value || '',
                madeBy: form.madeBy.value || founderName,
                projectId: form.projectId.value || null,
              };
              setDecisions(prev => [newDecision, ...prev]);
              setShowAddDecisionModal(false);
            }}
            className="w-full max-w-md bg-[#0c121d] border border-slate-700 rounded-2xl p-5 space-y-3.5 shadow-2xl font-mono text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>📋</span> Log Decision
              </h3>
              <button type="button" onClick={() => setShowAddDecisionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Decision</label>
              <input required name="decision" placeholder="e.g. Approve migration to Redis cluster" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Context / Rationale</label>
              <textarea name="context" rows={2} placeholder="Why was this decided..." className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Decided By</label>
                <input name="madeBy" defaultValue={founderName} className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Related Project</label>
                <select name="projectId" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option value="">— None —</option>
                  {allProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setShowAddDecisionModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold">Log Decision</button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL: TEMPLATE LIBRARY ─────────────────────────────────── */}
      {showTemplateLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0c121d] border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>📋</span> Meeting Templates
              </h3>
              <button onClick={() => setShowTemplateLibrary(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {TEMPLATES.map(t => (
                <div key={t.id} className="p-4 bg-[#080d14] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-cyan-300">{t.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (agendaEditingMeeting) {
                          handleApplyTemplate(t);
                        } else {
                          alert(`Open a meeting's agenda editor first, then apply a template.`);
                        }
                      }}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs transition shrink-0"
                    >
                      Use Template
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 space-y-0.5 text-[11px] text-slate-300">
                    {t.agendaItems.map((item, idx) => (
                      <div key={idx}>{idx + 1}. {item}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ANALYTICS ────────────────────────────────────────── */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0c121d] border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>📊</span> Meeting & Task Analytics
              </h3>
              <button onClick={() => setShowAnalyticsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">TOTAL MEETINGS</span>
                <strong className="text-cyan-400 text-lg font-bold">{analytics.totalMeetings}</strong>
              </div>
              <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">COMPLETED</span>
                <strong className="text-emerald-400 text-lg font-bold">{analytics.completedMeetings}</strong>
              </div>
              <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">AVG DURATION</span>
                <strong className="text-amber-400 text-lg font-bold">{analytics.avgDuration} min</strong>
              </div>
              <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">TOTAL TIME</span>
                <strong className="text-purple-400 text-lg font-bold">{Math.round(analytics.totalDuration / 60)}h {analytics.totalDuration % 60}m</strong>
              </div>
            </div>

            <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800 space-y-2 text-[11px]">
              <div className="text-slate-500 font-bold uppercase text-[10px]">Agency Overview (Live Data)</div>
              <div className="flex justify-between text-slate-300">
                <span>Active Projects</span>
                <span className="text-emerald-400 font-bold">{activeProjects.length}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Tasks</span>
                <span className="text-cyan-400 font-bold">{agency.tasks.length}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tasks Completed (All Time)</span>
                <span className="text-emerald-400 font-bold">{agency.stats.totalTasksCompleted}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Blocked Tasks</span>
                <span className={`font-bold ${agency.tasks.filter(t => t.status === 'blocked').length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {agency.tasks.filter(t => t.status === 'blocked').length}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Overdue Tasks</span>
                <span className={`font-bold ${overdueTasks > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {overdueTasks}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Revenue</span>
                <span className="text-emerald-400 font-bold">${agency.stats.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Decisions Logged</span>
                <span className="text-cyan-400 font-bold">{decisions.length}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setShowAnalyticsModal(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
