import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  X,
  Trash2,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Video,
  MapPin,
  Phone,
  Users,
  History,
  ArrowLeft,
  Search,
  Rocket,
  RefreshCw,
  Palette,
  Package,
  FileText,
  Square,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';
import { AgencyState } from '../core/agencyTypes';
import AgencyManager from '../core/agency';
import { getMultiplayerManager } from '../core/multiplayer';

// ── TYPES ──────────────────────────────────────────────────────────────────

type MeetingType = 'discovery' | 'kickoff' | 'checkin' | 'design_review' | 'delivery' | 'internal';
type MeetingStatus = 'upcoming' | 'completed' | 'needs_followup';

interface AgendaItem {
  id: string;
  text: string;
  checked: boolean;
}

interface MeetingAction {
  id: string;
  text: string;
  assignedTo: string;
  dueDate: string;
  done: boolean;
}

interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  date: string;
  time: string;
  duration: number;
  location: 'Video Call' | 'In-Person' | 'Phone';
  attendees: string;
  status: MeetingStatus;
  agenda: AgendaItem[];
  notes: string;
  actionItems: MeetingAction[];
  decisions: string[];
  nextMeetingDate: string;
  nextMeetingNote: string;
  createdAt: number;
}

// ── MEETING TYPE CONFIG ────────────────────────────────────────────────────

const MEETING_TYPES: { value: MeetingType; label: string; icon: string; color: string; bg: string; border: string }[] = [
  { value: 'discovery',      label: 'Discovery Call',   icon: '🔍', color: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-800/50' },
  { value: 'kickoff',        label: 'Kickoff',          icon: '🚀', color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-800/50' },
  { value: 'checkin',        label: 'Check-in',         icon: '🔄', color: 'text-cyan-400', bg: 'bg-cyan-950/40', border: 'border-cyan-800/50' },
  { value: 'design_review',  label: 'Design Review',    icon: '🎨', color: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-800/50' },
  { value: 'delivery',       label: 'Delivery',         icon: '📦', color: 'text-rose-400', bg: 'bg-rose-950/40', border: 'border-rose-800/50' },
  { value: 'internal',       label: 'Internal Standup', icon: '👥', color: 'text-slate-400', bg: 'bg-slate-800/40', border: 'border-slate-700/50' },
];

const getTypeConfig = (type: MeetingType) => MEETING_TYPES.find(t => t.value === type) || MEETING_TYPES[2];

// ── SEED DATA ──────────────────────────────────────────────────────────────

const INITIAL_MEETINGS: Meeting[] = [
  // ── Upcoming ──
  {
    id: 'meet_1',
    title: 'RNG Gamez — Final Delivery Review',
    type: 'checkin',
    date: '2026-03-15',
    time: '10:00 AM',
    duration: 30,
    location: 'Video Call',
    attendees: 'Founder, Client (John)',
    status: 'upcoming',
    agenda: [
      { id: 'a1', text: 'Demo live tournament bracket system', checked: false },
      { id: 'a2', text: 'Walk through card grading scanner accuracy', checked: false },
      { id: 'a3', text: 'Verify Stripe buylist cashout flow', checked: false },
      { id: 'a4', text: 'Discuss ongoing maintenance retainer', checked: false },
    ],
    notes: '',
    actionItems: [
      { id: 'act1', text: 'Send final invoice + warranty brief', assignedTo: 'You', dueDate: 'Mar 16', done: false },
      { id: 'act2', text: 'Verify SSL cert + DNS propagation', assignedTo: 'Dev', dueDate: 'Mar 16', done: false },
    ],
    decisions: [],
    nextMeetingDate: '',
    nextMeetingNote: '',
    createdAt: Date.now() - 100000,
  },
  {
    id: 'meet_2',
    title: 'Perfume Shop — Design Approval',
    type: 'design_review',
    date: '2026-03-15',
    time: '02:00 PM',
    duration: 45,
    location: 'In-Person',
    attendees: 'Founder, Designer, Client (Sarah)',
    status: 'upcoming',
    agenda: [
      { id: 'a5', text: 'Present dark gold design token palette', checked: false },
      { id: 'a6', text: 'Review typography pairings (Playfair + Inter)', checked: false },
      { id: 'a7', text: 'Get sign-off on brand identity kit', checked: false },
      { id: 'a8', text: 'Discuss Phase 2 WebGL bottle simulator scope', checked: false },
    ],
    notes: '',
    actionItems: [],
    decisions: [],
    nextMeetingDate: '',
    nextMeetingNote: '',
    createdAt: Date.now() - 80000,
  },
  {
    id: 'meet_3',
    title: 'DragonCard Vault — Discovery Call',
    type: 'discovery',
    date: '2026-03-16',
    time: '11:30 AM',
    duration: 30,
    location: 'Video Call',
    attendees: 'Founder, Backend Dev, Client (Marcus)',
    status: 'upcoming',
    agenda: [
      { id: 'a9', text: 'Learn about their current POS + eBay setup', checked: false },
      { id: 'a10', text: 'Understand card pricing pain points', checked: false },
      { id: 'a11', text: 'Discuss real-time market price sync needs', checked: false },
      { id: 'a12', text: 'Budget and timeline expectations', checked: false },
      { id: 'a13', text: 'Who makes the final decision?', checked: false },
    ],
    notes: '',
    actionItems: [],
    decisions: [],
    nextMeetingDate: '',
    nextMeetingNote: '',
    createdAt: Date.now() - 60000,
  },
  // ── Past (completed) ──
  {
    id: 'meet_past_1',
    title: 'Weekly Team Standup',
    type: 'internal',
    date: '2026-03-14',
    time: '09:00 AM',
    duration: 20,
    location: 'Video Call',
    attendees: 'Founder, Frontend Dev, Backend Dev, Designer',
    status: 'completed',
    agenda: [
      { id: 'a14', text: 'Frontend status update', checked: true },
      { id: 'a15', text: 'Backend status update', checked: true },
      { id: 'a16', text: 'Design status update', checked: true },
      { id: 'a17', text: 'Blocker review', checked: true },
    ],
    notes: `Frontend:\n- Homepage 90% done\n- Product grid responsive issues on iPad\n\nBackend:\n- API rate limiting deployed\n- Webhook retry queue working\n\nDesign:\n- Moodboard v2 sent to Perfume client\n- Icon set finalized (48 custom icons)`,
    actionItems: [
      { id: 'act3', text: 'Fix iPad product grid layout', assignedTo: 'Dev', dueDate: 'Mar 15', done: true },
      { id: 'act4', text: 'Send icon set to Perfume client for approval', assignedTo: 'Designer', dueDate: 'Mar 15', done: false },
    ],
    decisions: [
      'Prioritize iPad responsive fix before RNG launch',
      'Delay SaaS dashboard redesign to next sprint',
    ],
    nextMeetingDate: 'Mar 21',
    nextMeetingNote: 'Sprint review + retrospective',
    createdAt: Date.now() - 200000,
  },
  {
    id: 'meet_past_2',
    title: 'SaaS Client — Architecture Deep Dive',
    type: 'checkin',
    date: '2026-03-12',
    time: '03:00 PM',
    duration: 60,
    location: 'Video Call',
    attendees: 'Founder, Backend Dev, Client (Alex)',
    status: 'completed',
    agenda: [
      { id: 'a18', text: 'Review Redis cluster caching architecture', checked: true },
      { id: 'a19', text: 'Benchmark node engine performance', checked: true },
      { id: 'a20', text: 'Discuss webhook observability gaps', checked: true },
    ],
    notes: `Validated Redis cluster caching — 4x latency improvement confirmed.\nNode engine benchmarks: 12k req/sec on staging.\n\nAlex wants real-time step debugger for visual automation canvas.\nWebhook failures currently silent — need alerting pipeline.`,
    actionItems: [
      { id: 'act5', text: 'Set up webhook failure alerting via PagerDuty', assignedTo: 'Dev', dueDate: 'Mar 18', done: false },
      { id: 'act6', text: 'Draft step debugger technical spec', assignedTo: 'You', dueDate: 'Mar 20', done: false },
    ],
    decisions: [
      'Migrate to Redis cluster for production caching',
      'Step debugger scoped as Phase 2 deliverable',
      'Webhook alerting is P0 priority',
    ],
    nextMeetingDate: 'Mar 19',
    nextMeetingNote: 'Review webhook alerting implementation',
    createdAt: Date.now() - 400000,
  },
  {
    id: 'meet_past_3',
    title: 'RNG Gamez — Buylist Sprint Review',
    type: 'checkin',
    date: '2026-03-10',
    time: '11:00 AM',
    duration: 30,
    location: 'Video Call',
    attendees: 'Founder, Client (John)',
    status: 'completed',
    agenda: [
      { id: 'a21', text: 'Demo buylist pricing engine', checked: true },
      { id: 'a22', text: 'Review card search performance', checked: true },
      { id: 'a23', text: 'Discuss tournament bracket feature', checked: true },
    ],
    notes: `Client loved the buylist pricing engine.\nAgreed on 70% market price for buylist offers.\nCard search returning results in <200ms — approved.\n\nTournament bracket: Swiss round format confirmed.\nClient wants 3D bracket visualization.`,
    actionItems: [
      { id: 'act7', text: 'Implement 70% market price formula', assignedTo: 'Dev', dueDate: 'Mar 12', done: true },
      { id: 'act8', text: 'Build 3D Swiss round bracket display', assignedTo: 'Dev', dueDate: 'Mar 14', done: true },
      { id: 'act9', text: 'Send updated pricing breakdown to John', assignedTo: 'You', dueDate: 'Mar 11', done: true },
    ],
    decisions: [
      'Buylist at 70% market price',
      'Swiss round format for all tournaments',
      'Skip mobile app — web-first approach',
    ],
    nextMeetingDate: 'Mar 15',
    nextMeetingNote: 'Final delivery review + sign-off',
    createdAt: Date.now() - 600000,
  },
];

// ── HELPERS ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'aeethod_meeting_board_v3';

const formatDisplayDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getLocationIcon = (loc: string) => {
  if (loc === 'Video Call') return <Video className="w-3 h-3" />;
  if (loc === 'Phone') return <Phone className="w-3 h-3" />;
  return <MapPin className="w-3 h-3" />;
};

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

  // ── State ──
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPastMeetings, setShowPastMeetings] = useState(false);
  const [newAgendaText, setNewAgendaText] = useState('');
  const [newActionText, setNewActionText] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('You');
  const [newActionDue, setNewActionDue] = useState('');
  const [newDecisionText, setNewDecisionText] = useState('');

  // ── Live Clock ──
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // ── Persist ──
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings)); }, [meetings]);

  // ── Escape ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showScheduleModal) setShowScheduleModal(false);
        else if (selectedMeetingId) setSelectedMeetingId(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showScheduleModal, selectedMeetingId]);

  // ── Derived ──
  const upcoming = useMemo(() =>
    meetings.filter(m => m.status === 'upcoming').sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [meetings]
  );
  const past = useMemo(() =>
    meetings.filter(m => m.status === 'completed' || m.status === 'needs_followup').sort((a, b) => b.date.localeCompare(a.date)),
    [meetings]
  );
  const selectedMeeting = useMemo(() => meetings.find(m => m.id === selectedMeetingId) || null, [meetings, selectedMeetingId]);

  // ── Update helper ──
  const updateMeeting = (id: string, updater: (m: Meeting) => Meeting) => {
    setMeetings(prev => prev.map(m => m.id === id ? updater(m) : m));
  };

  // ── Counts for past meeting cards ──
  const getActionSummary = (m: Meeting) => {
    const total = m.actionItems.length;
    const done = m.actionItems.filter(a => a.done).length;
    const pending = total - done;
    return { total, done, pending };
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: MEETING DETAIL VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (selectedMeeting) {
    const m = selectedMeeting;
    const typeCfg = getTypeConfig(m.type);
    const agendaChecked = m.agenda.filter(a => a.checked).length;
    const actionSummary = getActionSummary(m);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md font-mono text-slate-200 select-none animate-in fade-in">
        <div className="w-full max-w-3xl max-h-[96vh] bg-[#080c14] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* ── Header ── */}
          <div className="px-5 py-3.5 bg-[#060a11] border-b border-slate-800 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSelectedMeetingId(null)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-100 truncate">{m.title}</h2>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase border ${typeCfg.bg} ${typeCfg.border} ${typeCfg.color}`}>
                      {typeCfg.icon} {typeCfg.label}
                    </span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDisplayDate(m.date)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.time} ({m.duration} min)</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">{getLocationIcon(m.location)} {m.location}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedMeetingId(null)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Attendees */}
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>{m.attendees}</span>
            </div>
          </div>

          {/* ── Scrollable Content ── */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#090e17]">

            {/* ═══ AGENDA ═══ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  📋 Agenda
                  {m.agenda.length > 0 && (
                    <span className="text-[10px] text-slate-500 font-normal ml-1">({agendaChecked}/{m.agenda.length} covered)</span>
                  )}
                </h3>
              </div>

              <div className="space-y-1">
                {m.agenda.map(item => (
                  <div key={item.id} className="flex items-start gap-2.5 p-2 bg-[#0d1522] border border-slate-800/60 rounded-lg group">
                    <button
                      onClick={() => updateMeeting(m.id, mt => ({
                        ...mt,
                        agenda: mt.agenda.map(a => a.id === item.id ? { ...a, checked: !a.checked } : a)
                      }))}
                      className="mt-0.5 shrink-0"
                    >
                      {item.checked
                        ? <CheckSquare className="w-4 h-4 text-emerald-400" />
                        : <Square className="w-4 h-4 text-slate-500 hover:text-cyan-400 transition" />
                      }
                    </button>
                    <span className={`text-xs flex-1 ${item.checked ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {item.text}
                    </span>
                    <button
                      onClick={() => updateMeeting(m.id, mt => ({ ...mt, agenda: mt.agenda.filter(a => a.id !== item.id) }))}
                      className="text-slate-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add agenda item */}
              <div className="flex gap-1.5">
                <input
                  className="flex-1 bg-[#0a1018] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-600/50"
                  placeholder="Add agenda item..."
                  value={newAgendaText}
                  onChange={e => setNewAgendaText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newAgendaText.trim()) {
                      updateMeeting(m.id, mt => ({
                        ...mt,
                        agenda: [...mt.agenda, { id: `ag_${Date.now()}`, text: newAgendaText.trim(), checked: false }]
                      }));
                      setNewAgendaText('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newAgendaText.trim()) {
                      updateMeeting(m.id, mt => ({
                        ...mt,
                        agenda: [...mt.agenda, { id: `ag_${Date.now()}`, text: newAgendaText.trim(), checked: false }]
                      }));
                      setNewAgendaText('');
                    }
                  }}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* ═══ NOTES ═══ */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                📝 Notes
              </h3>
              <textarea
                className="w-full bg-[#0d1522] border border-slate-800/60 rounded-xl p-3.5 text-xs text-slate-200 resize-none focus:outline-none focus:border-cyan-600/40 font-mono leading-relaxed min-h-[160px]"
                placeholder="Write meeting notes here... What was discussed? Key takeaways? Client feedback?"
                value={m.notes}
                onChange={e => updateMeeting(m.id, mt => ({ ...mt, notes: e.target.value }))}
                rows={8}
              />
            </div>

            {/* ═══ ACTION ITEMS ═══ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  ✅ Action Items
                  {m.actionItems.length > 0 && (
                    <span className="text-[10px] text-slate-500 font-normal ml-1">({actionSummary.done}/{actionSummary.total} done)</span>
                  )}
                </h3>
              </div>

              <div className="space-y-1">
                {m.actionItems.map(item => (
                  <div key={item.id} className={`flex items-start gap-2.5 p-2.5 rounded-lg border group transition ${
                    item.done ? 'bg-[#080d14] border-slate-800/40 opacity-60' : 'bg-[#0d1522] border-slate-800/60'
                  }`}>
                    <button
                      onClick={() => updateMeeting(m.id, mt => ({
                        ...mt,
                        actionItems: mt.actionItems.map(a => a.id === item.id ? { ...a, done: !a.done } : a)
                      }))}
                      className="mt-0.5 shrink-0"
                    >
                      {item.done
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        : <Circle className="w-4 h-4 text-slate-500 hover:text-emerald-400 transition" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs block ${item.done ? 'text-slate-500 line-through' : 'text-slate-200 font-medium'}`}>
                        {item.text}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-bold">{item.assignedTo}</span>
                        {item.dueDate && (
                          <>
                            <span>•</span>
                            <span>Due: {item.dueDate}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => updateMeeting(m.id, mt => ({ ...mt, actionItems: mt.actionItems.filter(a => a.id !== item.id) }))}
                      className="text-slate-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add action item */}
              <div className="p-2.5 bg-[#0a1018] border border-slate-800/40 rounded-lg space-y-1.5">
                <div className="flex gap-1.5">
                  <input
                    className="flex-1 bg-[#080d14] border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-600/50"
                    placeholder="Action item..."
                    value={newActionText}
                    onChange={e => setNewActionText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newActionText.trim()) {
                        updateMeeting(m.id, mt => ({
                          ...mt,
                          actionItems: [...mt.actionItems, {
                            id: `act_${Date.now()}`,
                            text: newActionText.trim(),
                            assignedTo: newActionAssignee,
                            dueDate: newActionDue,
                            done: false,
                          }]
                        }));
                        setNewActionText('');
                        setNewActionDue('');
                      }
                    }}
                  />
                </div>
                <div className="flex gap-1.5 items-center">
                  <select
                    className="bg-[#080d14] border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
                    value={newActionAssignee}
                    onChange={e => setNewActionAssignee(e.target.value)}
                  >
                    <option value="You">You</option>
                    <option value="Dev">Dev</option>
                    <option value="Designer">Designer</option>
                    <option value="Client">Client</option>
                  </select>
                  <input
                    className="w-24 bg-[#080d14] border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-300 placeholder:text-slate-600 focus:outline-none"
                    placeholder="Due date"
                    value={newActionDue}
                    onChange={e => setNewActionDue(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      if (newActionText.trim()) {
                        updateMeeting(m.id, mt => ({
                          ...mt,
                          actionItems: [...mt.actionItems, {
                            id: `act_${Date.now()}`,
                            text: newActionText.trim(),
                            assignedTo: newActionAssignee,
                            dueDate: newActionDue,
                            done: false,
                          }]
                        }));
                        setNewActionText('');
                        setNewActionDue('');
                      }
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition ml-auto"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {/* ═══ DECISIONS ═══ */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                📌 Decisions
                {m.decisions.length > 0 && (
                  <span className="text-[10px] text-slate-500 font-normal ml-1">({m.decisions.length} made)</span>
                )}
              </h3>

              <div className="space-y-1">
                {m.decisions.map((dec, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-[#0d1522] border border-slate-800/60 rounded-lg group text-xs">
                    <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                    <span className="flex-1 text-slate-200">{dec}</span>
                    <button
                      onClick={() => updateMeeting(m.id, mt => ({ ...mt, decisions: mt.decisions.filter((_, i) => i !== idx) }))}
                      className="text-slate-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-1.5">
                <input
                  className="flex-1 bg-[#0a1018] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-600/50"
                  placeholder="Log a decision..."
                  value={newDecisionText}
                  onChange={e => setNewDecisionText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newDecisionText.trim()) {
                      updateMeeting(m.id, mt => ({ ...mt, decisions: [...mt.decisions, newDecisionText.trim()] }));
                      setNewDecisionText('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newDecisionText.trim()) {
                      updateMeeting(m.id, mt => ({ ...mt, decisions: [...mt.decisions, newDecisionText.trim()] }));
                      setNewDecisionText('');
                    }
                  }}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* ═══ FOLLOW-UP ═══ */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                📅 Follow-up
              </h3>
              <div className="p-3 bg-[#0d1522] border border-slate-800/60 rounded-xl space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Next Meeting Date</label>
                    <input
                      className="w-full bg-[#080d14] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-600/50"
                      placeholder="e.g. Mar 22, Next Monday"
                      value={m.nextMeetingDate}
                      onChange={e => updateMeeting(m.id, mt => ({ ...mt, nextMeetingDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block uppercase mb-0.5">What to cover next time</label>
                  <input
                    className="w-full bg-[#080d14] border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-600/50"
                    placeholder="e.g. Review webhook alerting, demo new feature..."
                    value={m.nextMeetingNote}
                    onChange={e => updateMeeting(m.id, mt => ({ ...mt, nextMeetingNote: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer Actions ── */}
          <div className="px-5 py-3 bg-[#060a11] border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <button
              onClick={() => {
                setMeetings(prev => prev.filter(mt => mt.id !== m.id));
                setSelectedMeetingId(null);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <div className="flex items-center gap-2">
              {m.status === 'upcoming' && (
                <>
                  <button
                    onClick={() => {
                      updateMeeting(m.id, mt => ({ ...mt, status: 'needs_followup' }));
                      setSelectedMeetingId(null);
                    }}
                    className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-amber-700/50"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Needs Follow-up</span>
                  </button>
                  <button
                    onClick={() => {
                      updateMeeting(m.id, mt => ({ ...mt, status: 'completed' }));
                      setSelectedMeetingId(null);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Complete</span>
                  </button>
                </>
              )}
              {m.status === 'completed' && (
                <button
                  onClick={() => updateMeeting(m.id, mt => ({ ...mt, status: 'upcoming' }))}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Move to Upcoming</span>
                </button>
              )}
              {m.status === 'needs_followup' && (
                <>
                  <button
                    onClick={() => updateMeeting(m.id, mt => ({ ...mt, status: 'upcoming' }))}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition border border-slate-700"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => {
                      updateMeeting(m.id, mt => ({ ...mt, status: 'completed' }));
                      setSelectedMeetingId(null);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN BOARD VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md font-mono text-slate-200 select-none animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[96vh] bg-[#080c14] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="px-5 py-3.5 bg-[#060a11] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-black text-slate-100 flex items-center gap-2 tracking-wide">
              <span>📋</span> MEETING BOARD
            </h1>
            <span className="text-[10px] text-slate-500 border border-slate-800 rounded px-2 py-0.5">
              {now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-cyan-900/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Meeting</span>
            </button>
            <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-[#090e17]">

          {/* ═══ UPCOMING ═══ */}
          <div>
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              UPCOMING ({upcoming.length})
            </h2>

            {upcoming.length > 0 ? (
              <div className="space-y-2">
                {upcoming.map(m => {
                  const typeCfg = getTypeConfig(m.type);
                  const actionSummary = getActionSummary(m);
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMeetingId(m.id)}
                      className="p-3.5 bg-[#0d1522] border border-slate-800 rounded-xl cursor-pointer hover:border-slate-600 transition group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase border ${typeCfg.bg} ${typeCfg.border} ${typeCfg.color}`}>
                              {typeCfg.icon} {typeCfg.label}
                            </span>
                            <span className="text-sm font-bold text-slate-200 truncate">{m.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDisplayDate(m.date)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.time}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">{getLocationIcon(m.location)} {m.location}</span>
                            <span>•</span>
                            <span>{m.duration} min</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{m.attendees}</span>
                          </div>
                        </div>

                        {/* Quick stats */}
                        <div className="text-right text-[10px] text-slate-500 shrink-0 space-y-0.5">
                          {m.agenda.length > 0 && (
                            <div>📋 {m.agenda.filter(a => a.checked).length}/{m.agenda.length}</div>
                          )}
                          {actionSummary.total > 0 && (
                            <div className={actionSummary.pending > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                              ✅ {actionSummary.done}/{actionSummary.total}
                            </div>
                          )}
                          {m.decisions.length > 0 && (
                            <div>📌 {m.decisions.length}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-[#0d1522] border border-slate-800/60 rounded-xl text-center text-xs text-slate-500">
                No upcoming meetings.{' '}
                <button onClick={() => setShowScheduleModal(true)} className="text-cyan-400 hover:text-cyan-300 font-bold">
                  Schedule one →
                </button>
              </div>
            )}
          </div>

          {/* ═══ PAST MEETINGS ═══ */}
          {past.length > 0 && (
            <div>
              <button
                onClick={() => setShowPastMeetings(!showPastMeetings)}
                className="flex items-center gap-1.5 mb-3 text-[11px] font-bold text-slate-500 hover:text-slate-300 transition uppercase tracking-wider"
              >
                <History className="w-3.5 h-3.5" />
                <span>PAST MEETINGS ({past.length})</span>
                {showPastMeetings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showPastMeetings && (
                <div className="space-y-1.5">
                  {past.map(m => {
                    const typeCfg = getTypeConfig(m.type);
                    const actionSummary = getActionSummary(m);
                    const hasOpenActions = actionSummary.pending > 0;

                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMeetingId(m.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition group ${
                          m.status === 'needs_followup'
                            ? 'bg-amber-950/10 border-amber-800/30 hover:border-amber-700/50'
                            : 'bg-[#0a1018] border-slate-800/50 hover:border-slate-700 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {m.status === 'needs_followup'
                            ? <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            : <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          }
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] px-1 py-0.5 rounded font-bold uppercase border ${typeCfg.bg} ${typeCfg.border} ${typeCfg.color}`}>
                                {typeCfg.icon}
                              </span>
                              <span className="text-xs font-bold text-slate-300 truncate">{m.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-600 mt-0.5">
                              <span>{formatDisplayDate(m.date)}</span>
                              <span>•</span>
                              <span>{m.time}</span>
                              <span>•</span>
                              <span>{m.location}</span>
                            </div>
                          </div>

                          {/* Summary badges */}
                          <div className="flex items-center gap-2 text-[10px] shrink-0">
                            {m.notes && <span className="text-slate-500">📝</span>}
                            {m.decisions.length > 0 && <span className="text-slate-500">📌 {m.decisions.length}</span>}
                            {actionSummary.total > 0 && (
                              <span className={hasOpenActions ? 'text-amber-400 font-bold' : 'text-emerald-500'}>
                                ✅ {actionSummary.done}/{actionSummary.total}
                                {hasOpenActions && ' ⚠️'}
                              </span>
                            )}
                            {m.nextMeetingDate && (
                              <span className="text-cyan-400">📅 {m.nextMeetingDate}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── SCHEDULE MODAL ─────────────────────────────────────────── */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={e => {
              e.preventDefault();
              const form = e.target as any;
              // Parse initial agenda items
              const agendaRaw = form.agenda_items.value.trim();
              const agendaItems: AgendaItem[] = agendaRaw
                ? agendaRaw.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => ({
                    id: `ag_new_${Date.now()}_${i}`,
                    text: line.trim(),
                    checked: false,
                  }))
                : [];

              const newMeeting: Meeting = {
                id: `meet_${Date.now()}`,
                title: form.title.value,
                type: form.type.value as MeetingType,
                date: form.date.value,
                time: form.time.value,
                duration: Number(form.duration.value),
                location: form.location.value,
                attendees: form.attendees.value,
                status: 'upcoming',
                agenda: agendaItems,
                notes: '',
                actionItems: [],
                decisions: [],
                nextMeetingDate: '',
                nextMeetingNote: '',
                createdAt: Date.now(),
              };
              setMeetings(prev => [...prev, newMeeting]);
              setShowScheduleModal(false);
            }}
            className="w-full max-w-md bg-[#0c121d] border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl font-mono text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">📅 Schedule Meeting</h3>
              <button type="button" onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Title</label>
              <input required name="title" placeholder="e.g. RNG Gamez — Sprint Review" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200" />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Meeting Type</label>
              <select name="type" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200">
                {MEETING_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Location</label>
                <select name="location" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option value="Video Call">Video Call</option>
                  <option value="In-Person">In-Person</option>
                  <option value="Phone">Phone</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Attendees</label>
              <input name="attendees" placeholder="Founder, Client (John)" defaultValue={`${founderName}, `} className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200" />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Agenda Items (one per line, optional)</label>
              <textarea
                name="agenda_items"
                rows={3}
                placeholder={`Demo homepage build\nGet feedback on search UI\nDiscuss pricing logic`}
                className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setShowScheduleModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold">Schedule</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
