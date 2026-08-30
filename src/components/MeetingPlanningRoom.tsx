import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  X,
  Trash2,
  Calendar,
  Clock,
  Pin,
  GripVertical,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { AgencyState } from '../core/agencyTypes';
import AgencyManager from '../core/agency';
import { getMultiplayerManager } from '../core/multiplayer';

// ── TYPES ──────────────────────────────────────────────────────────────────

interface MeetingNote {
  id: string;
  title: string;
  date: string;
  content: string;
  pinned: boolean;
  color: NoteColor;
  createdAt: number;
}

interface DecisionEntry {
  id: string;
  text: string;
  date: string;
  resolved: boolean;
}

type NoteColor = 'slate' | 'cyan' | 'amber' | 'emerald' | 'purple' | 'rose';

const NOTE_COLORS: { value: NoteColor; label: string; bg: string; border: string; header: string }[] = [
  { value: 'slate',   label: '⬛', bg: 'bg-[#0f1a28]', border: 'border-slate-700/80',   header: 'bg-[#131f30]' },
  { value: 'cyan',    label: '🟦', bg: 'bg-[#0a1a24]', border: 'border-cyan-800/50',    header: 'bg-[#0d2030]' },
  { value: 'amber',   label: '🟨', bg: 'bg-[#1a1708]', border: 'border-amber-800/50',   header: 'bg-[#221e0a]' },
  { value: 'emerald', label: '🟩', bg: 'bg-[#081a12]', border: 'border-emerald-800/50', header: 'bg-[#0a2218]' },
  { value: 'purple',  label: '🟪', bg: 'bg-[#150d22]', border: 'border-purple-800/50',  header: 'bg-[#1c1230]' },
  { value: 'rose',    label: '🟥', bg: 'bg-[#1a0d10]', border: 'border-rose-800/50',    header: 'bg-[#221218]' },
];

// ── SEED DATA ──────────────────────────────────────────────────────────────

const INITIAL_NOTES: MeetingNote[] = [
  {
    id: 'note_1',
    title: 'RNG Gamez — Final Review',
    date: 'Mar 15, 2026',
    pinned: true,
    color: 'cyan',
    createdAt: Date.now() - 86400000,
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
  const [notes, setNotes] = useState<MeetingNote[]>(() => {
    const saved = localStorage.getItem('aeethod_board_notes');
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

  // ── Live Clock ──
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // ── Persist ──
  useEffect(() => { localStorage.setItem('aeethod_board_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('aeethod_board_decisions', JSON.stringify(decisions)); }, [decisions]);

  // ── Escape ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // ── Sort: pinned first, then by creation date ──
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [notes]);

  const pendingDecisions = useMemo(() => decisions.filter(d => !d.resolved), [decisions]);
  const resolvedDecisions = useMemo(() => decisions.filter(d => d.resolved), [decisions]);

  // ── Handlers ──
  const handleAddNote = () => {
    const today = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newNote: MeetingNote = {
      id: `note_${Date.now()}`,
      title: 'New Meeting Note',
      date: today,
      content: '',
      pinned: false,
      color: 'slate',
      createdAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setExpandedNote(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
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

  const handleAddDecision = () => {
    if (!newDecisionText.trim()) return;
    const today = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const newDec: DecisionEntry = {
      id: `dec_${Date.now()}`,
      text: newDecisionText.trim(),
      date: today,
      resolved: false,
    };
    setDecisions(prev => [newDec, ...prev]);
    setNewDecisionText('');
  };

  const handleToggleDecision = (id: string) => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, resolved: !d.resolved } : d));
  };

  const handleDeleteDecision = (id: string) => {
    setDecisions(prev => prev.filter(d => d.id !== id));
  };

  const getColorConfig = (color: NoteColor) => {
    return NOTE_COLORS.find(c => c.value === color) || NOTE_COLORS[0];
  };

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md font-mono text-slate-200 select-none animate-in fade-in">
      <div className="w-full max-w-7xl max-h-[96vh] bg-[#080c14] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* ─── BOARD HEADER ─────────────────────────────────────────── */}
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
              onClick={handleAddNote}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-cyan-900/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Note</span>
            </button>
            <button
              onClick={() => setShowDecisions(!showDecisions)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border ${
                showDecisions
                  ? 'bg-amber-600/20 border-amber-700/50 text-amber-300 hover:bg-amber-600/30'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Decisions ({pendingDecisions.length})</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── BOARD CONTENT ────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex">

          {/* ════ LEFT: MEETING NOTES (scrollable board) ════════════════ */}
          <div className={`flex-1 overflow-y-auto p-4 sm:p-5 transition-all ${showDecisions ? '' : ''}`}>
            <div className="columns-1 md:columns-2 gap-4 space-y-4">
              {sortedNotes.map(note => {
                const colorCfg = getColorConfig(note.color);
                const isExpanded = expandedNote === note.id;

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
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {note.date}
                          {note.pinned && <Pin className="w-3 h-3 text-amber-400 ml-1" />}
                        </span>
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

                        {/* Note Actions */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {/* Color Picker */}
                            {NOTE_COLORS.map(c => (
                              <button
                                key={c.value}
                                onClick={() => handleNoteColor(note.id, c.value)}
                                className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center transition ${
                                  note.color === c.value ? 'ring-2 ring-white/40 scale-110' : 'opacity-60 hover:opacity-100'
                                } ${c.bg} border ${c.border}`}
                                title={c.value}
                              >
                                {note.color === c.value ? '•' : ''}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleTogglePin(note.id)}
                              className={`p-1.5 rounded-lg transition text-xs flex items-center gap-1 ${
                                note.pinned
                                  ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50'
                                  : 'bg-slate-800 text-slate-400 hover:text-amber-400'
                              }`}
                              title={note.pinned ? 'Unpin' : 'Pin to top'}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1.5 bg-slate-800 text-slate-500 hover:text-rose-400 rounded-lg transition"
                              title="Delete note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Collapsed Preview */
                      <div
                        className="px-3.5 pb-3 pt-1.5 cursor-pointer"
                        onClick={() => setExpandedNote(note.id)}
                      >
                        <p className="text-[11px] text-slate-400 whitespace-pre-wrap line-clamp-4 leading-relaxed">
                          {note.content || 'Empty note — click to write...'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Empty State */}
              {notes.length === 0 && (
                <div className="col-span-2 p-12 text-center">
                  <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No meeting notes yet</p>
                  <button
                    onClick={handleAddNote}
                    className="mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition"
                  >
                    Create First Note
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ════ RIGHT: DECISIONS PANEL ═══════════════════════════════ */}
          {showDecisions && (
            <div className="w-[320px] shrink-0 border-l border-slate-800 bg-[#070b12] flex flex-col overflow-hidden">
              {/* Decisions Header */}
              <div className="px-4 py-3 border-b border-slate-800 shrink-0">
                <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📌</span> DECISIONS
                </h2>
              </div>

              {/* Add Decision Input */}
              <div className="px-3 py-2.5 border-b border-slate-800/60 shrink-0">
                <div className="flex gap-1.5">
                  <input
                    className="flex-1 bg-[#0a1018] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-600/50"
                    placeholder="Log a decision..."
                    value={newDecisionText}
                    onChange={e => setNewDecisionText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddDecision()}
                  />
                  <button
                    onClick={handleAddDecision}
                    className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Decisions List */}
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                {/* Pending */}
                {pendingDecisions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-600 uppercase font-bold px-1">Open ({pendingDecisions.length})</span>
                    {pendingDecisions.map(d => (
                      <div
                        key={d.id}
                        className="group p-2.5 bg-[#0c1420] border border-slate-800/60 rounded-lg flex items-start gap-2 hover:border-slate-700 transition"
                      >
                        <button
                          onClick={() => handleToggleDecision(d.id)}
                          className="mt-0.5 shrink-0 text-slate-500 hover:text-emerald-400 transition"
                        >
                          <Circle className="w-4 h-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] text-slate-200 block leading-relaxed">{d.text}</span>
                          <span className="text-[10px] text-slate-600 mt-0.5 block">{d.date}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteDecision(d.id)}
                          className="shrink-0 text-slate-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resolved */}
                {resolvedDecisions.length > 0 && (
                  <div className="space-y-1 mt-3">
                    <span className="text-[10px] text-slate-600 uppercase font-bold px-1">Resolved ({resolvedDecisions.length})</span>
                    {resolvedDecisions.map(d => (
                      <div
                        key={d.id}
                        className="group p-2.5 bg-[#080c14] border border-slate-800/40 rounded-lg flex items-start gap-2 opacity-50 hover:opacity-80 transition"
                      >
                        <button
                          onClick={() => handleToggleDecision(d.id)}
                          className="mt-0.5 shrink-0 text-emerald-500"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] text-slate-400 line-through block leading-relaxed">{d.text}</span>
                          <span className="text-[10px] text-slate-700 mt-0.5 block">{d.date}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteDecision(d.id)}
                          className="shrink-0 text-slate-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {decisions.length === 0 && (
                  <div className="p-6 text-center text-slate-600 text-xs">
                    No decisions logged yet.<br />Type above to add one.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
