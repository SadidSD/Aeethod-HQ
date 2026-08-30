import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  X,
  Trash2,
  Calendar,
  Clock,
  Pin,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  Circle,
  Video,
  MapPin,
  Phone,
  Users,
  History,
  ArrowRight
} from 'lucide-react';
import { AgencyState } from '../core/agencyTypes';
import AgencyManager from '../core/agency';
import { getMultiplayerManager } from '../core/multiplayer';

// ── TYPES ──────────────────────────────────────────────────────────────────

interface ScheduledMeeting {
  id: string;
  title: string;
  date: string;        // ISO date string for sorting
  time: string;        // display string e.g. "10:00 AM"
  duration: number;    // minutes
  location: 'Video Call' | 'In-Person' | 'Phone';
  attendees: string;
  completed: boolean;
  noteId: string | null; // links to a MeetingNote for its notes
}

interface MeetingNote {
  id: string;
  title: string;
  date: string;
  content: string;
  pinned: boolean;
  color: NoteColor;
  createdAt: number;
  meetingId: string | null; // links back to a ScheduledMeeting
}

interface DecisionEntry {
  id: string;
  text: string;
  date: string;
  resolved: boolean;
}

type NoteColor = 'slate' | 'cyan' | 'amber' | 'emerald' | 'purple' | 'rose';

const NOTE_COLORS: { value: NoteColor; bg: string; border: string; header: string }[] = [
  { value: 'slate',   bg: 'bg-[#0f1a28]', border: 'border-slate-700/80',   header: 'bg-[#131f30]' },
  { value: 'cyan',    bg: 'bg-[#0a1a24]', border: 'border-cyan-800/50',    header: 'bg-[#0d2030]' },
  { value: 'amber',   bg: 'bg-[#1a1708]', border: 'border-amber-800/50',   header: 'bg-[#221e0a]' },
  { value: 'emerald', bg: 'bg-[#081a12]', border: 'border-emerald-800/50', header: 'bg-[#0a2218]' },
  { value: 'purple',  bg: 'bg-[#150d22]', border: 'border-purple-800/50',  header: 'bg-[#1c1230]' },
  { value: 'rose',    bg: 'bg-[#1a0d10]', border: 'border-rose-800/50',    header: 'bg-[#221218]' },
];

// ── SEED DATA ──────────────────────────────────────────────────────────────

const INITIAL_MEETINGS: ScheduledMeeting[] = [
  {
    id: 'sched_1',
    title: 'RNG Gamez — Final Delivery Review',
    date: '2026-03-15',
    time: '10:00 AM',
    duration: 30,
    location: 'Video Call',
    attendees: 'Founder, Client (John)',
    completed: false,
    noteId: 'note_1',
  },
  {
    id: 'sched_2',
    title: 'Perfume Shop — Design Approval',
    date: '2026-03-15',
    time: '02:00 PM',
    duration: 45,
    location: 'In-Person',
    attendees: 'Founder, Designer, Client (Sarah)',
    completed: false,
    noteId: 'note_2',
  },
  {
    id: 'sched_3',
    title: 'TCG Shop — Scope Sync',
    date: '2026-03-16',
    time: '11:30 AM',
    duration: 30,
    location: 'Video Call',
    attendees: 'Founder, Backend Dev, Client (Marcus)',
    completed: false,
    noteId: null,
  },
  {
    id: 'sched_past_1',
    title: 'Weekly Standup',
    date: '2026-03-14',
    time: '09:00 AM',
    duration: 20,
    location: 'Video Call',
    attendees: 'Founder, Frontend Dev, Backend Dev, Designer',
    completed: true,
    noteId: 'note_3',
  },
  {
    id: 'sched_past_2',
    title: 'SaaS Client — Architecture Deep Dive',
    date: '2026-03-12',
    time: '03:00 PM',
    duration: 60,
    location: 'Video Call',
    attendees: 'Founder, Backend Dev, Client (Alex)',
    completed: true,
    noteId: null,
  },
  {
    id: 'sched_past_3',
    title: 'RNG Gamez — Buylist Sprint Review',
    date: '2026-03-10',
    time: '11:00 AM',
    duration: 30,
    location: 'Video Call',
    attendees: 'Founder, Client (John)',
    completed: true,
    noteId: null,
  },
];

const INITIAL_NOTES: MeetingNote[] = [
  {
    id: 'note_1',
    title: 'RNG Gamez — Final Review',
    date: 'Mar 15, 2026',
    pinned: true,
    color: 'cyan',
    createdAt: Date.now() - 86400000,
    meetingId: 'sched_1',
    content: `✅ Tournament bracket module — delivered & working
✅ Card grading scanner — AI model accuracy 94%
✅ Buylist cashout system — Stripe verified

⏳ Remaining:
- SSL cert + DNS propagation (Dev handling)
- Final invoice + warranty brief to send

📌 Client John happy with 3D Swiss round bracket.
Next: schedule maintenance retainer call.`,
  },
  {
    id: 'note_2',
    title: 'Perfume Shop — Design Sync',
    date: 'Mar 15, 2026',
    pinned: false,
    color: 'amber',
    createdAt: Date.now() - 43200000,
    meetingId: 'sched_2',
    content: `Typography pairings:
- Headlines: Playfair Display
- Body: Inter
- Accent: Cormorant Garamond

Color tokens approved ✅
- Dark Gold: #C9A84C
- Deep Black: #0A0A0A
- Cream: #FAF5E8

Phase 2 scope: WebGL bottle shader
- Sarah wants interactive rotation
- Marc asked about mobile performance
- Need benchmark before committing`,
  },
  {
    id: 'note_3',
    title: 'Weekly Standup Notes',
    date: 'Mar 14, 2026',
    pinned: false,
    color: 'slate',
    createdAt: Date.now() - 172800000,
    meetingId: 'sched_past_1',
    content: `Frontend:
- Homepage 90% done
- Product grid responsive issues on iPad

Backend:
- API rate limiting deployed
- Webhook retry queue working

Design:
- Moodboard v2 sent to Perfume client
- Icon set finalized (48 custom icons)`,
  },
];

const INITIAL_DECISIONS: DecisionEntry[] = [
  { id: 'dec_1', text: 'Approve RNG Gamez production launch', date: 'Mar 15', resolved: false },
  { id: 'dec_2', text: 'Extend Perfume Shop timeline +2 weeks for WebGL', date: 'Mar 12', resolved: false },
  { id: 'dec_3', text: 'Accept DragonCard Vault at enterprise tier', date: 'Mar 10', resolved: true },
  { id: 'dec_4', text: 'Migrate SaaS client to Redis cluster', date: 'Mar 08', resolved: true },
  { id: 'dec_5', text: 'Hire contractor for overflow backend work', date: 'Mar 05', resolved: true },
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

  // ── Persisted State ──
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>(() => {
    const saved = localStorage.getItem('aeethod_board_meetings_v2');
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [notes, setNotes] = useState<MeetingNote[]>(() => {
    const saved = localStorage.getItem('aeethod_board_notes_v2');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [decisions, setDecisions] = useState<DecisionEntry[]>(() => {
    const saved = localStorage.getItem('aeethod_board_decisions');
    return saved ? JSON.parse(saved) : INITIAL_DECISIONS;
  });

  // ── UI State ──
  const [expandedNote, setExpandedNote] = useState<string | null>(notes.find(n => n.pinned)?.id || null);
  const [newDecisionText, setNewDecisionText] = useState('');
  const [showDecisions, setShowDecisions] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPastMeetings, setShowPastMeetings] = useState(false);
  const [viewingMeetingId, setViewingMeetingId] = useState<string | null>(null);

  // ── Live Clock ──
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // ── Persist ──
  useEffect(() => { localStorage.setItem('aeethod_board_meetings_v2', JSON.stringify(meetings)); }, [meetings]);
  useEffect(() => { localStorage.setItem('aeethod_board_notes_v2', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('aeethod_board_decisions', JSON.stringify(decisions)); }, [decisions]);

  // ── Escape ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showScheduleModal) setShowScheduleModal(false);
        else if (viewingMeetingId) setViewingMeetingId(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showScheduleModal, viewingMeetingId]);

  // ── Derived ──
  const upcomingMeetings = useMemo(() =>
    meetings.filter(m => !m.completed).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [meetings]
  );
  const pastMeetings = useMemo(() =>
    meetings.filter(m => m.completed).sort((a, b) => b.date.localeCompare(a.date)),
    [meetings]
  );

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [notes]);

  const pendingDecisions = useMemo(() => decisions.filter(d => !d.resolved), [decisions]);
  const resolvedDecisions = useMemo(() => decisions.filter(d => d.resolved), [decisions]);

  const viewingMeeting = useMemo(() => meetings.find(m => m.id === viewingMeetingId) || null, [meetings, viewingMeetingId]);

  // ── Handlers ──
  const getLinkedNote = (meetingId: string): MeetingNote | null => {
    return notes.find(n => n.meetingId === meetingId) || null;
  };

  const handleAddNote = (meetingId?: string) => {
    const today = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const meeting = meetingId ? meetings.find(m => m.id === meetingId) : null;
    const newNote: MeetingNote = {
      id: `note_${Date.now()}`,
      title: meeting ? `${meeting.title} — Notes` : 'New Meeting Note',
      date: today,
      content: '',
      pinned: false,
      color: 'slate',
      createdAt: Date.now(),
      meetingId: meetingId || null,
    };
    setNotes(prev => [newNote, ...prev]);
    setExpandedNote(newNote.id);
    // Link back from meeting
    if (meetingId) {
      setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, noteId: newNote.id } : m));
    }
  };

  const handleDeleteNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    // Unlink from meeting if linked
    if (note?.meetingId) {
      setMeetings(prev => prev.map(m => m.id === note.meetingId ? { ...m, noteId: null } : m));
    }
    setNotes(prev => prev.filter(n => n.id !== id));
    if (expandedNote === id) setExpandedNote(null);
  };

  const handleTogglePin = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const handleNoteChange = (id: string, field: 'title' | 'content', value: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const handleNoteColor = (id: string, color: NoteColor) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, color } : n));
  };

  const handleToggleMeetingComplete = (id: string) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  const handleOpenMeetingNotes = (meeting: ScheduledMeeting) => {
    const linkedNote = getLinkedNote(meeting.id);
    if (linkedNote) {
      setExpandedNote(linkedNote.id);
      setViewingMeetingId(null);
    } else {
      handleAddNote(meeting.id);
      setViewingMeetingId(null);
    }
  };

  const handleAddDecision = () => {
    if (!newDecisionText.trim()) return;
    const today = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    setDecisions(prev => [{ id: `dec_${Date.now()}`, text: newDecisionText.trim(), date: today, resolved: false }, ...prev]);
    setNewDecisionText('');
  };

  const handleToggleDecision = (id: string) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, resolved: !d.resolved } : d));
  };

  const handleDeleteDecision = (id: string) => {
    setDecisions(prev => prev.filter(d => d.id !== id));
  };

  const getColorConfig = (color: NoteColor) => NOTE_COLORS.find(c => c.value === color) || NOTE_COLORS[0];

  const getLocationIcon = (loc: string) => {
    if (loc === 'Video Call') return <Video className="w-3 h-3" />;
    if (loc === 'Phone') return <Phone className="w-3 h-3" />;
    return <MapPin className="w-3 h-3" />;
  };

  const formatMeetingDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: PAST MEETING DETAIL VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (viewingMeeting) {
    const linkedNote = getLinkedNote(viewingMeeting.id);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono text-slate-200 animate-in fade-in">
        <div className="w-full max-w-xl bg-[#0c121d] border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 bg-[#080d15] border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100">{viewingMeeting.title}</h2>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatMeetingDate(viewingMeeting.date)}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {viewingMeeting.time} ({viewingMeeting.duration} min)</span>
              </div>
            </div>
            <button onClick={() => setViewingMeetingId(null)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Details */}
          <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
            {/* Meeting Info Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#080d14] border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase mb-1">Location</span>
                <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                  {getLocationIcon(viewingMeeting.location)}
                  <span>{viewingMeeting.location}</span>
                </div>
              </div>
              <div className="p-3 bg-[#080d14] border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase mb-1">Status</span>
                <span className={`font-bold ${viewingMeeting.completed ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {viewingMeeting.completed ? '✅ Completed' : '📅 Upcoming'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#080d14] border border-slate-800 rounded-xl text-xs">
              <span className="text-[10px] text-slate-500 block uppercase mb-1">Attendees</span>
              <div className="flex items-center gap-1.5 text-slate-200">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>{viewingMeeting.attendees}</span>
              </div>
            </div>

            {/* Linked Notes */}
            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Meeting Notes
              </h3>

              {linkedNote ? (
                <div className="p-3 bg-[#080d14] border border-slate-800 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-slate-200">{linkedNote.title}</div>
                  <p className="text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                    {linkedNote.content || 'No notes written yet.'}
                  </p>
                  <button
                    onClick={() => handleOpenMeetingNotes(viewingMeeting)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                  >
                    Open in board <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-[#080d14] border border-slate-800/60 rounded-xl text-center">
                  <p className="text-[11px] text-slate-500 mb-2">No notes linked to this meeting.</p>
                  <button
                    onClick={() => handleOpenMeetingNotes(viewingMeeting)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition"
                  >
                    + Create Notes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN BOARD
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md font-mono text-slate-200 select-none animate-in fade-in">
      <div className="w-full max-w-7xl max-h-[96vh] bg-[#080c14] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* ─── HEADER ──────────────────────────────────────────────────── */}
        <div className="px-5 py-3 bg-[#060a11] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
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
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-900/40"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </button>
            <button
              onClick={() => handleAddNote()}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-cyan-900/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Note</span>
            </button>
            <button
              onClick={() => setShowDecisions(!showDecisions)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border ${
                showDecisions ? 'bg-amber-600/20 border-amber-700/50 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Decisions ({pendingDecisions.length})</span>
            </button>
            <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── CONTENT ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex">

          {/* ════ LEFT COLUMN ═══════════════════════════════════════════ */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">

            {/* ── UPCOMING MEETINGS ─────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  UPCOMING ({upcomingMeetings.length})
                </h2>
              </div>

              {upcomingMeetings.length > 0 ? (
                <div className="space-y-2">
                  {upcomingMeetings.map(m => {
                    const linkedNote = getLinkedNote(m.id);
                    return (
                      <div key={m.id} className="p-3 bg-[#0d1522] border border-slate-800 rounded-xl flex items-center gap-3 text-xs hover:border-slate-700 transition group">
                        {/* Complete Toggle */}
                        <button
                          onClick={() => handleToggleMeetingComplete(m.id)}
                          className="shrink-0 text-slate-500 hover:text-emerald-400 transition"
                          title="Mark as done"
                        >
                          <Circle className="w-4.5 h-4.5" />
                        </button>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-200 truncate">{m.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatMeetingDate(m.date)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.time}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">{getLocationIcon(m.location)} {m.location}</span>
                            <span>•</span>
                            <span>{m.duration} min</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleOpenMeetingNotes(m)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                              linkedNote
                                ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-800/40 hover:bg-cyan-900/50'
                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-cyan-300'
                            }`}
                          >
                            <FileText className="w-3 h-3" />
                            <span>{linkedNote ? 'Open Notes' : '+ Notes'}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteMeeting(m.id)}
                            className="p-1 text-slate-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-[#0d1522] border border-slate-800/60 rounded-xl text-center text-[11px] text-slate-500">
                  No upcoming meetings.{' '}
                  <button onClick={() => setShowScheduleModal(true)} className="text-cyan-400 hover:text-cyan-300 font-bold">Schedule one →</button>
                </div>
              )}
            </div>

            {/* ── PAST MEETINGS ─────────────────────────────────────── */}
            {pastMeetings.length > 0 && (
              <div>
                <button
                  onClick={() => setShowPastMeetings(!showPastMeetings)}
                  className="flex items-center gap-1.5 mb-2 text-[11px] font-bold text-slate-500 hover:text-slate-300 transition uppercase tracking-wider"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>PAST MEETINGS ({pastMeetings.length})</span>
                  {showPastMeetings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showPastMeetings && (
                  <div className="space-y-1.5">
                    {pastMeetings.map(m => {
                      const linkedNote = getLinkedNote(m.id);
                      return (
                        <div key={m.id} className="p-2.5 bg-[#0a1018] border border-slate-800/50 rounded-lg flex items-center gap-3 text-xs opacity-70 hover:opacity-100 transition group">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-slate-300 truncate block">{m.title}</span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-600 mt-0.5">
                              <span>{formatMeetingDate(m.date)}</span>
                              <span>•</span>
                              <span>{m.time}</span>
                              <span>•</span>
                              <span>{m.location}</span>
                              <span>•</span>
                              <span>{m.duration} min</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setViewingMeetingId(m.id)}
                              className="px-2 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded text-[10px] font-bold hover:text-cyan-300 transition"
                            >
                              View
                            </button>
                            {linkedNote && (
                              <button
                                onClick={() => handleOpenMeetingNotes(m)}
                                className="px-2 py-1 bg-cyan-900/20 text-cyan-400 border border-cyan-800/30 rounded text-[10px] font-bold hover:bg-cyan-900/40 transition"
                              >
                                Notes
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleMeetingComplete(m.id)}
                              className="p-1 text-slate-700 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition"
                              title="Mark as upcoming"
                            >
                              <History className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── NOTES BOARD ──────────────────────────────────────── */}
            <div>
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                NOTES ({notes.length})
              </h2>

              <div className="columns-1 md:columns-2 gap-4 space-y-4">
                {sortedNotes.map(note => {
                  const colorCfg = getColorConfig(note.color);
                  const isExpanded = expandedNote === note.id;
                  const linkedMeeting = note.meetingId ? meetings.find(m => m.id === note.meetingId) : null;

                  return (
                    <div
                      key={note.id}
                      className={`break-inside-avoid rounded-xl border transition-all ${colorCfg.bg} ${colorCfg.border} ${
                        isExpanded ? 'ring-1 ring-cyan-500/30' : ''
                      }`}
                    >
                      {/* Note Header */}
                      <div
                        className={`px-3.5 py-2.5 rounded-t-xl flex items-start justify-between gap-2 cursor-pointer ${colorCfg.header}`}
                        onClick={() => setExpandedNote(isExpanded ? null : note.id)}
                      >
                        <div className="flex-1 min-w-0">
                          {isExpanded ? (
                            <input
                              className="w-full bg-transparent text-sm font-bold text-slate-100 outline-none border-b border-transparent focus:border-slate-600 pb-0.5"
                              value={note.title}
                              onChange={e => handleNoteChange(note.id, 'title', e.target.value)}
                              onClick={e => e.stopPropagation()}
                            />
                          ) : (
                            <span className="text-sm font-bold text-slate-200 truncate block">{note.title}</span>
                          )}
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span>{note.date}</span>
                            {note.pinned && <Pin className="w-3 h-3 text-amber-400 ml-0.5" />}
                            {linkedMeeting && (
                              <span className="text-cyan-500 flex items-center gap-0.5 ml-1">
                                <Calendar className="w-2.5 h-2.5" /> linked
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                        </div>
                      </div>

                      {/* Note Body */}
                      {isExpanded ? (
                        <div className="px-3.5 pb-3.5 pt-2 space-y-2.5">
                          <textarea
                            className="w-full bg-[#060a10] border border-slate-800/60 rounded-lg p-3 text-xs text-slate-200 resize-none focus:outline-none focus:border-cyan-600/50 font-mono leading-relaxed min-h-[180px]"
                            value={note.content}
                            onChange={e => handleNoteChange(note.id, 'content', e.target.value)}
                            placeholder="Write your meeting notes here..."
                            rows={8}
                          />
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {NOTE_COLORS.map(c => (
                                <button
                                  key={c.value}
                                  onClick={() => handleNoteColor(note.id, c.value)}
                                  className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center transition ${
                                    note.color === c.value ? 'ring-2 ring-white/40 scale-110' : 'opacity-60 hover:opacity-100'
                                  } ${c.bg} border ${c.border}`}
                                >
                                  {note.color === c.value ? '•' : ''}
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleTogglePin(note.id)}
                                className={`p-1.5 rounded-lg transition ${note.pinned ? 'bg-amber-900/30 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-amber-400'}`}
                              >
                                <Pin className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteNote(note.id)} className="p-1.5 bg-slate-800 text-slate-500 hover:text-rose-400 rounded-lg transition">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="px-3.5 pb-3 pt-1.5 cursor-pointer" onClick={() => setExpandedNote(note.id)}>
                          <p className="text-[11px] text-slate-400 whitespace-pre-wrap line-clamp-4 leading-relaxed">
                            {note.content || 'Empty note — click to write...'}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {notes.length === 0 && (
                  <div className="col-span-2 p-12 text-center">
                    <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No notes yet</p>
                    <button onClick={() => handleAddNote()} className="mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition">
                      Create First Note
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ════ RIGHT: DECISIONS PANEL ═══════════════════════════════ */}
          {showDecisions && (
            <div className="w-[320px] shrink-0 border-l border-slate-800 bg-[#070b12] flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 shrink-0">
                <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📌</span> DECISIONS
                </h2>
              </div>

              <div className="px-3 py-2.5 border-b border-slate-800/60 shrink-0">
                <div className="flex gap-1.5">
                  <input
                    className="flex-1 bg-[#0a1018] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-600/50"
                    placeholder="Log a decision..."
                    value={newDecisionText}
                    onChange={e => setNewDecisionText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddDecision()}
                  />
                  <button onClick={handleAddDecision} className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                {pendingDecisions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-600 uppercase font-bold px-1">Open ({pendingDecisions.length})</span>
                    {pendingDecisions.map(d => (
                      <div key={d.id} className="group p-2.5 bg-[#0c1420] border border-slate-800/60 rounded-lg flex items-start gap-2 hover:border-slate-700 transition">
                        <button onClick={() => handleToggleDecision(d.id)} className="mt-0.5 shrink-0 text-slate-500 hover:text-emerald-400 transition">
                          <Circle className="w-4 h-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] text-slate-200 block leading-relaxed">{d.text}</span>
                          <span className="text-[10px] text-slate-600 mt-0.5 block">{d.date}</span>
                        </div>
                        <button onClick={() => handleDeleteDecision(d.id)} className="shrink-0 text-slate-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {resolvedDecisions.length > 0 && (
                  <div className="space-y-1 mt-3">
                    <span className="text-[10px] text-slate-600 uppercase font-bold px-1">Resolved ({resolvedDecisions.length})</span>
                    {resolvedDecisions.map(d => (
                      <div key={d.id} className="group p-2.5 bg-[#080c14] border border-slate-800/40 rounded-lg flex items-start gap-2 opacity-50 hover:opacity-80 transition">
                        <button onClick={() => handleToggleDecision(d.id)} className="mt-0.5 shrink-0 text-emerald-500">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] text-slate-400 line-through block leading-relaxed">{d.text}</span>
                          <span className="text-[10px] text-slate-700 mt-0.5 block">{d.date}</span>
                        </div>
                        <button onClick={() => handleDeleteDecision(d.id)} className="shrink-0 text-slate-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {decisions.length === 0 && (
                  <div className="p-6 text-center text-slate-600 text-xs">No decisions logged yet.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL: SCHEDULE MEETING ─────────────────────────────────── */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={e => {
              e.preventDefault();
              const form = e.target as any;
              const newMeeting: ScheduledMeeting = {
                id: `sched_${Date.now()}`,
                title: form.title.value,
                date: form.date.value,
                time: form.time.value,
                duration: Number(form.duration.value),
                location: form.location.value,
                attendees: form.attendees.value,
                completed: false,
                noteId: null,
              };
              setMeetings(prev => [...prev, newMeeting]);
              setShowScheduleModal(false);
            }}
            className="w-full max-w-md bg-[#0c121d] border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl font-mono text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>📅</span> Schedule Meeting
              </h3>
              <button type="button" onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block uppercase mb-0.5">Meeting Title</label>
              <input required name="title" placeholder="e.g. RNG Gamez — Sprint Review" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200" />
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

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setShowScheduleModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold">Schedule</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
