import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Video,
  MapPin,
  Phone,
  FileText,
  Plus,
  ArrowLeft,
  Download,
  Trash2,
  Edit3,
  Paperclip,
  CheckSquare,
  Square,
  TrendingUp,
  BarChart2,
  Search,
  X,
  ChevronRight,
  Send,
  Building2,
  DollarSign,
  Tag,
  Briefcase,
  Copy,
  Layers,
  Save,
  Check,
  Flame,
  HelpCircle
} from 'lucide-react';
import { AgencyState } from '../core/agencyTypes';
import AgencyManager from '../core/agency';
import { getMultiplayerManager } from '../core/multiplayer';

// ── TYPES ───────────────────────────────────────────────────────────────────

export type MeetingPriority = 'high' | 'medium' | 'low';
export type MeetingLocation = 'Video Call' | 'In-Person' | 'Phone';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed';

export interface MeetingItem {
  id: string;
  title: string;
  clientName: string;
  date: string;
  time: string;
  duration: number; // minutes
  location: MeetingLocation;
  priority: MeetingPriority;
  status: MeetingStatus;
  agenda: string;
  notes: string;
  attendees: string[];
}

export type DiscoveryStatus = 'complete' | 'active' | 'pending';

export interface DiscoveryAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface DiscoveryNote {
  id: string;
  date: string;
  title: string;
  content: string;
}

export interface DiscoveryClient {
  id: string;
  name: string;
  contact: string;
  location: string;
  industry: string;
  revenue: string;
  status: DiscoveryStatus;
  phase: number; // 1, 2, 3
  startDate: string;
  completedDate?: string | null;
  budget: string;
  decisionMaker: string;
  followUpDate: string;
  priority: 'high' | 'medium' | 'low';
  currentSetup: string;
  painPoints: string;
  goals: string;
  attachments: DiscoveryAttachment[];
  notesHistory: DiscoveryNote[];
  answers: {
    q1_currentSetup: string;
    q2_painPoints: string;
    q3_goals: string;
    q4_budget: string;
    q5_decisionMaker: string;
  };
}

export interface DecisionLogEntry {
  id: string;
  date: string;
  decision: string;
  context?: string;
  madeBy?: string;
}

export type ActionItemStatus = 'overdue' | 'due_soon' | 'on_track' | 'completed';

export interface ActionItem {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  status: ActionItemStatus;
  meetingId?: string;
}

export interface MeetingTemplate {
  id: string;
  title: string;
  description: string;
  agendaItems: string[];
}

// ── INITIAL SEED DATA ────────────────────────────────────────────────────────

const INITIAL_MEETINGS: MeetingItem[] = [
  {
    id: 'meet_1',
    title: 'RNG Gamez Review Call',
    clientName: 'RNG Gamez',
    date: '2026-03-15',
    time: '10:00 AM',
    duration: 30,
    location: 'Video Call',
    priority: 'high',
    status: 'scheduled',
    agenda: 'Project review, final delivery, next steps and live deployment verification.',
    notes: 'Client confirmed receipt of the tournament sync bracket module. Awaiting final sign-off.',
    attendees: ['You', 'Client (John)'],
  },
  {
    id: 'meet_2',
    title: 'Perfume Shop Design Approval',
    clientName: 'Atelier Parfums',
    date: '2026-03-15',
    time: '02:00 PM',
    duration: 45,
    location: 'In-Person',
    priority: 'medium',
    status: 'scheduled',
    agenda: 'Present final designs, get sign-off, discuss phase 2 WebGL bottle simulation.',
    notes: 'Showcase typography pairings and dark gold aesthetic tokens.',
    attendees: ['You', 'Designer', 'Client (Sarah)'],
  },
  {
    id: 'meet_3',
    title: 'TCG Shop Ingestion & Scope Sync',
    clientName: 'DragonCard Vault',
    date: '2026-03-16',
    time: '11:30 AM',
    duration: 30,
    location: 'Video Call',
    priority: 'low',
    status: 'scheduled',
    agenda: 'Review 100k+ card catalog architecture and custom AI buylist sync timeline.',
    notes: 'Prepare initial technical scope document.',
    attendees: ['You', 'Backend Dev', 'Client (Marcus)'],
  },
];

const INITIAL_DISCOVERY_CLIENTS: DiscoveryClient[] = [
  {
    id: 'disc_rng',
    name: 'RNG Gamez',
    contact: 'John (Owner)',
    location: 'Newark, CA',
    industry: 'TCG (Pokémon, MTG)',
    revenue: '$10,000/month',
    status: 'complete',
    phase: 1,
    startDate: 'Nov 15, 2025',
    completedDate: 'Dec 10, 2025',
    budget: '$8,000-$12,000',
    decisionMaker: 'Owner (John)',
    followUpDate: 'Apr 15, 2026',
    priority: 'high',
    currentSetup: 'TCGplayer + eBay',
    painPoints: 'High fees, manual inventory sync',
    goals: 'Own site with buylist and events automation',
    attachments: [
      { id: 'att_1', name: 'Discovery_Form_RNG_Gamez.pdf', size: '1.2 MB', type: 'PDF' },
      { id: 'att_2', name: 'Client_Brief_RNG_Gamez.docx', size: '840 KB', type: 'DOCX' },
      { id: 'att_3', name: 'RNG_Gamez_Website_Requirements.pdf', size: '2.1 MB', type: 'PDF' },
    ],
    notesHistory: [
      {
        id: 'n_1',
        date: 'Dec 10, 2025',
        title: 'Discovery Call Complete',
        content: 'Client wants own site, tired of TCGplayer fees. Confirmed $8k-$12k budget.',
      },
      {
        id: 'n_2',
        date: 'Nov 20, 2025',
        title: 'Initial Discovery Call',
        content: 'First contact. Discussed current pain points and manual inventory syncing.',
      },
    ],
    answers: {
      q1_currentSetup: 'TCGplayer + eBay',
      q2_painPoints: 'High fees, manual inventory sync across multiple channels',
      q3_goals: 'Own branded site with automated buylist and local tournament brackets',
      q4_budget: '$8,000-$12,000',
      q5_decisionMaker: 'Owner (John)',
    },
  },
  {
    id: 'disc_perfume',
    name: 'Perfume Shop',
    contact: 'Sarah (Creative Director)',
    location: 'Paris & Online',
    industry: 'Luxury Beauty & Fragrance',
    revenue: '$18,000/month',
    status: 'active',
    phase: 2,
    startDate: 'Jan 10, 2026',
    completedDate: null,
    budget: '$12,000-$15,000',
    decisionMaker: 'Founders Board (Sarah & Marc)',
    followUpDate: 'Mar 20, 2026',
    priority: 'medium',
    currentSetup: 'Shopify standard theme + Mailchimp',
    painPoints: 'Generic appearance, lacks luxury sensory customization',
    goals: '3D bottle shader configurator, fragrance quiz engine, global escrow',
    attachments: [
      { id: 'att_4', name: 'Atelier_Moodboard_2026.pdf', size: '4.5 MB', type: 'PDF' },
      { id: 'att_5', name: 'Fragrance_Formulas_Spec.pdf', size: '920 KB', type: 'PDF' },
    ],
    notesHistory: [
      {
        id: 'n_3',
        date: 'Jan 28, 2026',
        title: 'Sensory Quiz Architecture Review',
        content: 'Agreed on 5-step fragrance algorithm with custom top and heart note weights.',
      },
    ],
    answers: {
      q1_currentSetup: 'Basic Shopify standard theme + manual order export',
      q2_painPoints: 'High bounce rate on mobile; inability to showcase bespoke luxury feel',
      q3_goals: 'Interactive 3D configurator and personalized scent profiling quiz',
      q4_budget: '$12,000-$15,000',
      q5_decisionMaker: 'Founders Board (Sarah & Marc)',
    },
  },
  {
    id: 'disc_tcg_new',
    name: 'TCG Shop (New)',
    contact: 'Marcus (Founder)',
    location: 'Austin, TX',
    industry: 'TCG & Collectibles',
    revenue: '$25,000/month',
    status: 'pending',
    phase: 1,
    startDate: 'Mar 01, 2026',
    completedDate: null,
    budget: '$15,000-$20,000',
    decisionMaker: 'Marcus',
    followUpDate: 'Mar 25, 2026',
    priority: 'high',
    currentSetup: 'Brick & Mortar POS + eBay store',
    painPoints: 'Card pricing fluctuates faster than staff can reprice physical binders',
    goals: 'Real-time TCGplayer market price sync and automated customer buylist cashout',
    attachments: [
      { id: 'att_6', name: 'DragonCard_Intake_Brief.pdf', size: '1.1 MB', type: 'PDF' },
    ],
    notesHistory: [
      {
        id: 'n_4',
        date: 'Mar 02, 2026',
        title: 'Initial Proposal Drafted',
        content: 'Discussed high volume card catalog ingestion. Scheduled discovery deep-dive.',
      },
    ],
    answers: {
      q1_currentSetup: 'Lightspeed POS + eBay manual uploads',
      q2_painPoints: 'Market prices move faster than physical inventory tags; high labor cost',
      q3_goals: 'Realtime WebSocket price updates and instant kiosk card grading',
      q4_budget: '$15,000-$20,000',
      q5_decisionMaker: 'Marcus',
    },
  },
  {
    id: 'disc_saas',
    name: 'SaaS Client',
    contact: 'Alex (CTO)',
    location: 'San Francisco, CA',
    industry: 'B2B Workflow Automation',
    revenue: '$40,000/month',
    status: 'active',
    phase: 2,
    startDate: 'Feb 05, 2026',
    completedDate: null,
    budget: '$25,000-$35,000',
    decisionMaker: 'Alex & VP Product',
    followUpDate: 'Apr 02, 2026',
    priority: 'high',
    currentSetup: 'Internal legacy microservices',
    painPoints: 'Slow developer velocity and fragmented webhook observability',
    goals: 'Next-gen reactive node canvas workflow builder with 99.99% uptime',
    attachments: [
      { id: 'att_7', name: 'SaaS_Architecture_Diagram.pdf', size: '3.8 MB', type: 'PDF' },
    ],
    notesHistory: [
      {
        id: 'n_5',
        date: 'Feb 15, 2026',
        title: 'System Requirements Review',
        content: 'Validated Redis cluster caching architecture and node engine benchmarks.',
      },
    ],
    answers: {
      q1_currentSetup: 'Node.js monorepo with custom cron pipelines',
      q2_painPoints: 'Silent webhook failures and poor customer builder interface',
      q3_goals: 'Enterprise-grade visual automation canvas with real-time step debugger',
      q4_budget: '$25,000-$35,000',
      q5_decisionMaker: 'Alex (CTO) & VP Product',
    },
  },
];

const INITIAL_DECISIONS: DecisionLogEntry[] = [
  { id: 'dec_1', date: 'Mar 15', decision: 'Approve RNG Gamez launch', context: 'Production sign-off complete', madeBy: 'Founder' },
  { id: 'dec_2', date: 'Mar 12', decision: 'Extend Perfume Shop timeline', context: 'Added 3D WebGL shader customization', madeBy: 'Founder & Designer' },
  { id: 'dec_3', date: 'Mar 10', decision: 'Accept TCG Shop proposal', context: 'Enterprise tier contract approved', madeBy: 'Founder' },
  { id: 'dec_4', date: 'Mar 08', decision: 'Hire new developer', context: 'Expanded backend capacity for microservices', madeBy: 'Team' },
  { id: 'dec_5', date: 'Mar 05', decision: 'Launch SaaS MVP', context: 'Core node engine deployed to staging', madeBy: 'Founder & Backend' },
];

const INITIAL_ACTION_ITEMS: ActionItem[] = [
  { id: 'act_1', title: 'Send RNG Gamez proposal', owner: 'You', dueDate: 'Today', status: 'overdue' },
  { id: 'act_2', title: 'Review design specs', owner: 'Des', dueDate: 'Tomorrow', status: 'due_soon' },
  { id: 'act_3', title: 'Update TCG Shop proposal', owner: 'You', dueDate: 'Wed', status: 'due_soon' },
  { id: 'act_4', title: 'Test API endpoints', owner: 'Dev', dueDate: 'Thu', status: 'on_track' },
  { id: 'act_5', title: 'Write case study', owner: 'You', dueDate: 'Fri', status: 'on_track' },
  { id: 'act_6', title: 'Client onboarding questionnaire', owner: 'You', dueDate: 'Past', status: 'completed' },
  { id: 'act_7', title: 'Finalize Stripe webhook schema', owner: 'Dev', dueDate: 'Past', status: 'completed' },
  { id: 'act_8', title: 'Deliver brand moodboard', owner: 'Des', dueDate: 'Past', status: 'completed' },
];

const TEMPLATES: MeetingTemplate[] = [
  {
    id: 'tmpl_disc',
    title: 'Discovery Call Template',
    description: 'Structured framework for qualifying leads and capturing technical requirements.',
    agendaItems: [
      '1. Introduction & Relationship Building',
      '2. Understand Current Business (setup, revenue, team)',
      '3. Identify Pain Points (fees, manual work, inventory)',
      '4. Define Goals (what do they want to achieve?)',
      '5. Discuss Budget & Timeline',
      '6. Next Steps & Follow-up Agreement',
    ],
  },
  {
    id: 'tmpl_review',
    title: 'Project Review Template',
    description: 'Sprint alignment meeting for active milestones and blocker resolution.',
    agendaItems: [
      '1. Status Update & Milestone Velocity',
      '2. Review Completed Deliverables & Demos',
      '3. Review In-Progress Work & Architecture',
      '4. Identify Technical Issues / Stalled Dependencies',
      '5. Next Steps & Deliverables for Upcoming Sprint',
      '6. Confirm Date of Next Check-in',
    ],
  },
  {
    id: 'tmpl_onboard',
    title: 'Client Onboarding Template',
    description: 'Kickoff meeting structure for new client handoff and access provisioning.',
    agendaItems: [
      '1. Welcome & Team Introduction',
      '2. Project Scope & Deliverables Review',
      '3. Timeline & Target Milestones Breakdown',
      '4. Communication Channels & Async Cadence',
      '5. Access, API Keys & Repository Permissions',
      '6. Immediate Next Steps & Kickoff Sprint',
    ],
  },
];

// ── PROPS ───────────────────────────────────────────────────────────────────

interface Props {
  agency: AgencyState;
  manager: AgencyManager;
  onClose: () => void;
  onRefresh: () => void;
}

export default function MeetingPlanningRoom({ agency, manager, onClose, onRefresh }: Props) {
  const multiplayer = useMemo(() => getMultiplayerManager(), []);
  const founderName = multiplayer.localPlayer.name || 'Founder';

  // Persistence State
  const [meetings, setMeetings] = useState<MeetingItem[]>(() => {
    const saved = localStorage.getItem('aeethod_meetings_data');
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [discoveryClients, setDiscoveryClients] = useState<DiscoveryClient[]>(() => {
    const saved = localStorage.getItem('aeethod_discovery_clients');
    return saved ? JSON.parse(saved) : INITIAL_DISCOVERY_CLIENTS;
  });

  const [decisions, setDecisions] = useState<DecisionLogEntry[]>(() => {
    const saved = localStorage.getItem('aeethod_decisions_data');
    return saved ? JSON.parse(saved) : INITIAL_DECISIONS;
  });

  const [actionItems, setActionItems] = useState<ActionItem[]>(() => {
    const saved = localStorage.getItem('aeethod_action_items');
    return saved ? JSON.parse(saved) : INITIAL_ACTION_ITEMS;
  });

  // Selected Discovery Detail Screen
  const [selectedDiscoveryId, setSelectedDiscoveryId] = useState<string | null>(null);
  const [selectedClientForResearch, setSelectedClientForResearch] = useState<string>(
    discoveryClients[0]?.id || 'disc_rng'
  );

  // Modals & Drawers
  const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);
  const [showAddDecisionModal, setShowAddDecisionModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [activeNotesMeeting, setActiveNotesMeeting] = useState<MeetingItem | null>(null);

  // Agenda Editor State
  const [agendaForm, setAgendaForm] = useState({
    title: 'RNG Gamez Review Call',
    date: '2026-03-15',
    duration: '30 min',
    attendees: 'You, Client (John)',
    agendaItems: [
      '1. Project review & live delivery walkthrough',
      '2. Automated grading scanner demo',
      '3. Deployment schedule & final production sign-off',
    ],
    notes: 'Client John confirmed satisfaction with the 3D Swiss round bracket display.',
    actionTask1: 'Send finalized invoice & warranty brief',
    actionOwner1: 'You',
    actionDue1: 'Today',
    actionTask2: 'Verify SSL certificate & DNS propagation',
    actionOwner2: 'Dev',
    actionDue2: 'Tomorrow',
  });

  const [newAgendaItemText, setNewAgendaItemText] = useState('');

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('aeethod_meetings_data', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('aeethod_discovery_clients', JSON.stringify(discoveryClients));
  }, [discoveryClients]);

  useEffect(() => {
    localStorage.setItem('aeethod_decisions_data', JSON.stringify(decisions));
  }, [decisions]);

  useEffect(() => {
    localStorage.setItem('aeethod_action_items', JSON.stringify(actionItems));
  }, [actionItems]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAddMeetingModal) setShowAddMeetingModal(false);
        else if (showAddDecisionModal) setShowAddDecisionModal(false);
        else if (showAddTaskModal) setShowAddTaskModal(false);
        else if (showTemplateLibrary) setShowTemplateLibrary(false);
        else if (showAnalyticsModal) setShowAnalyticsModal(false);
        else if (activeNotesMeeting) setActiveNotesMeeting(null);
        else if (selectedDiscoveryId) setSelectedDiscoveryId(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showAddMeetingModal,
    showAddDecisionModal,
    showAddTaskModal,
    showTemplateLibrary,
    showAnalyticsModal,
    activeNotesMeeting,
    selectedDiscoveryId,
    onClose,
  ]);

  // Derived Metrics
  const todaysMeetings = useMemo(() => meetings.filter(m => m.status !== 'completed'), [meetings]);
  const completedActionItemsCount = useMemo(
    () => actionItems.filter(a => a.status === 'completed').length,
    [actionItems]
  );
  const activeProjectsCount = agency.projects.filter(p => p.phase !== 'completed').length;
  const discoveryPhaseCount = discoveryClients.filter(d => d.status === 'active' || d.status === 'pending').length;

  const currentResearchClient = useMemo(() => {
    return (
      discoveryClients.find(d => d.id === selectedClientForResearch) ||
      discoveryClients[0] ||
      null
    );
  }, [discoveryClients, selectedClientForResearch]);

  const selectedDiscoveryDetail = useMemo(() => {
    return discoveryClients.find(d => d.id === selectedDiscoveryId) || null;
  }, [discoveryClients, selectedDiscoveryId]);

  // Handlers
  const handleToggleMeetingComplete = (id: string) => {
    setMeetings(prev =>
      prev.map(m => {
        if (m.id === id) {
          const isDone = m.status === 'completed';
          return { ...m, status: isDone ? 'scheduled' : 'completed' };
        }
        return m;
      })
    );
  };

  const handleToggleActionItem = (id: string) => {
    setActionItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const isDone = item.status === 'completed';
          return {
            ...item,
            status: isDone ? 'on_track' : 'completed',
          };
        }
        return item;
      })
    );
  };

  const handleAddAgendaItem = () => {
    if (!newAgendaItemText.trim()) return;
    setAgendaForm(prev => ({
      ...prev,
      agendaItems: [...prev.agendaItems, `${prev.agendaItems.length + 1}. ${newAgendaItemText.trim()}`],
    }));
    setNewAgendaItemText('');
  };

  const handleRemoveAgendaItem = (index: number) => {
    setAgendaForm(prev => ({
      ...prev,
      agendaItems: prev.agendaItems.filter((_, i) => i !== index),
    }));
  };

  const handleApplyTemplate = (tmpl: MeetingTemplate) => {
    setAgendaForm(prev => ({
      ...prev,
      title: tmpl.title,
      agendaItems: tmpl.agendaItems,
    }));
    setShowTemplateLibrary(false);
  };

  const handleOpenMeetingInAgenda = (meeting: MeetingItem) => {
    setAgendaForm(prev => ({
      ...prev,
      title: meeting.title,
      date: meeting.date,
      duration: `${meeting.duration} min`,
      attendees: meeting.attendees.join(', '),
      notes: meeting.notes,
      agendaItems: meeting.agenda
        ? meeting.agenda.split('. ').map((item, idx) => (item.startsWith(`${idx + 1}`) ? item : `${idx + 1}. ${item}`))
        : prev.agendaItems,
    }));
  };

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER: DISCOVERY DETAIL SCREEN (SUB-VIEW)
  // ═════════════════════════════════════════════════════════════════════════
  if (selectedDiscoveryDetail) {
    const disc = selectedDiscoveryDetail;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md font-mono text-slate-200 animate-in fade-in">
        <div className="w-full max-w-6xl max-h-[94vh] bg-[#0c121d] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-[#080d15] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedDiscoveryId(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK TO DISCOVERY</span>
              </button>
              <span className="text-slate-600">/</span>
              <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
                <span>📋</span> DISCOVERY DETAIL — {disc.name}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowAddMeetingModal(true);
                }}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-cyan-900/30"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Meeting</span>
              </button>
              <button
                onClick={() => setSelectedDiscoveryId(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#090f18]">
            {/* Top 2-Column: Overview & 5-Question Discovery Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Client Overview Card */}
              <div className="p-4 bg-[#0d1624] border border-slate-800 rounded-xl space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-1.5">
                    <span>📋</span> CLIENT OVERVIEW
                  </h3>

                  <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Company Name</span>
                      <strong className="text-slate-100 font-bold">{disc.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Primary Contact</span>
                      <span className="text-slate-200">{disc.contact}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Location</span>
                      <span className="text-slate-200">{disc.location}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Industry</span>
                      <span className="text-slate-200">{disc.industry}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Monthly Revenue</span>
                      <strong className="text-emerald-400 font-bold">{disc.revenue}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Status</span>
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          disc.status === 'complete'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : disc.status === 'active'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {disc.status === 'complete' ? '✅ Discovery Complete' : disc.status === 'active' ? '🔄 Active' : '⏳ Pending'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Phase Progress</span>
                      <span className="text-slate-200">Phase {disc.phase} of 3</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Discovery Timeline</span>
                      <span className="text-slate-400 text-[11px]">{disc.startDate} → {disc.completedDate || 'In Progress'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">💰 Budget Range:</span>
                    <strong className="text-emerald-400 font-bold text-sm">{disc.budget}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">🎯 Decision Maker:</span>
                    <span className="text-slate-200">{disc.decisionMaker}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">📅 Follow-up Date:</span>
                    <span className="text-cyan-400 font-bold">{disc.followUpDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">⭐ Priority:</span>
                    <span className="text-rose-400 uppercase font-bold">{disc.priority}</span>
                  </div>
                </div>
              </div>

              {/* 5-Question Discovery Questionnaire Form */}
              <div className="p-4 bg-[#0d1624] border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📝</span> DISCOVERY QUESTIONNAIRE
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold">5 / 5 ANSWERED</span>
                  </div>

                  <div className="space-y-2.5 pt-2 text-xs">
                    <div className="p-2.5 bg-[#080d14] rounded-lg border border-slate-800/80">
                      <div className="text-[11px] font-bold text-slate-300">1. What's your current setup?</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{disc.answers.q1_currentSetup}</div>
                    </div>
                    <div className="p-2.5 bg-[#080d14] rounded-lg border border-slate-800/80">
                      <div className="text-[11px] font-bold text-slate-300">2. What's your biggest pain point?</div>
                      <div className="text-[11px] text-rose-300 mt-0.5">{disc.answers.q2_painPoints}</div>
                    </div>
                    <div className="p-2.5 bg-[#080d14] rounded-lg border border-slate-800/80">
                      <div className="text-[11px] font-bold text-slate-300">3. What do you want to achieve?</div>
                      <div className="text-[11px] text-emerald-300 mt-0.5">{disc.answers.q3_goals}</div>
                    </div>
                    <div className="p-2.5 bg-[#080d14] rounded-lg border border-slate-800/80">
                      <div className="text-[11px] font-bold text-slate-300">4. What's your budget?</div>
                      <div className="text-[11px] text-emerald-400 font-bold mt-0.5">{disc.answers.q4_budget}</div>
                    </div>
                    <div className="p-2.5 bg-[#080d14] rounded-lg border border-slate-800/80">
                      <div className="text-[11px] font-bold text-slate-300">5. Who makes the final decision?</div>
                      <div className="text-[11px] text-cyan-300 mt-0.5">{disc.answers.q5_decisionMaker}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => alert('Discovery responses updated and synchronized to client profile.')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Form</span>
                  </button>
                  <button
                    onClick={() => {
                      setDiscoveryClients(prev =>
                        prev.map(d => (d.id === disc.id ? { ...d, status: 'complete', completedDate: 'Today' } : d))
                      );
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Complete</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="p-4 bg-[#0d1624] border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                  <span>DISCOVERY ATTACHMENTS & BRIEFS ({disc.attachments.length})</span>
                </h3>
                <button
                  onClick={() => {
                    const newFileName = prompt('Enter document file name (e.g. Technical_Specs.pdf):');
                    if (newFileName) {
                      setDiscoveryClients(prev =>
                        prev.map(d => {
                          if (d.id === disc.id) {
                            return {
                              ...d,
                              attachments: [
                                ...d.attachments,
                                { id: `att_${Date.now()}`, name: newFileName, size: '1.4 MB', type: 'PDF' },
                              ],
                            };
                          }
                          return d;
                        })
                      );
                    }
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg transition flex items-center gap-1 border border-slate-700"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add File</span>
                </button>
              </div>

              <div className="space-y-2">
                {disc.attachments.map(att => (
                  <div
                    key={att.id}
                    className="p-3 bg-[#080d14] border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <div>
                        <span className="font-bold text-slate-200">{att.name}</span>
                        <span className="text-[10px] text-slate-500 block">{att.size} • {att.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alert(`Downloading ${att.name}...`)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg transition flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => {
                          setDiscoveryClients(prev =>
                            prev.map(d => {
                              if (d.id === disc.id) {
                                return {
                                  ...d,
                                  attachments: d.attachments.filter(a => a.id !== att.id),
                                };
                              }
                              return d;
                            })
                          );
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meeting Notes & History Timeline */}
            <div className="p-4 bg-[#0d1624] border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>MEETING NOTES & HISTORY</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const noteText = prompt('Enter note content:');
                      if (noteText) {
                        setDiscoveryClients(prev =>
                          prev.map(d => {
                            if (d.id === disc.id) {
                              return {
                                ...d,
                                notesHistory: [
                                  {
                                    id: `note_${Date.now()}`,
                                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                    title: 'Discovery Check-in',
                                    content: noteText,
                                  },
                                  ...d.notesHistory,
                                ],
                              };
                            }
                            return d;
                          })
                        );
                      }
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg transition flex items-center gap-1 border border-slate-700"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Note</span>
                  </button>
                  <button
                    onClick={() => alert(`Update email summary dispatched to ${disc.contact}.`)}
                    className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold rounded-lg transition flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Update</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {disc.notesHistory.map(note => (
                  <div key={note.id} className="p-3 bg-[#080d14] border border-slate-800 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        <span>{note.date} — {note.title}</span>
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] pt-1 leading-relaxed">
                      📝 <strong className="text-slate-400">Key insights:</strong> {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // MAIN DASHBOARD VIEW
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md font-mono text-slate-200 select-none animate-in fade-in">
      <div className="w-full max-w-7xl max-h-[96vh] bg-[#0a0f18] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* ────────────────────────────────────────────────────────────────
            SECTION 1: TOP BAR (HEADER & QUICK STATS)
            ──────────────────────────────────────────────────────────────── */}
        <div className="p-4 bg-[#070b12] border-b border-slate-800 space-y-2.5 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-base font-black text-slate-100 flex items-center gap-2 tracking-wide">
                <span>📅</span> MEETING & PLANNING ROOM — [{founderName}]
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>March 15, 2026</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>10:23 AM</span>
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
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
                <span>Analytics</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Stats Pill Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-[#0d1522] border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">📋 Today's Meetings:</span>
              <strong className="text-cyan-400 font-bold">{todaysMeetings.length}</strong>
            </div>
            <div className="p-2 bg-[#0d1522] border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">📝 Active Projects:</span>
              <strong className="text-emerald-400 font-bold">{activeProjectsCount}</strong>
            </div>
            <div className="p-2 bg-[#0d1522] border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">📊 Discovery Phase:</span>
              <strong className="text-amber-400 font-bold">{discoveryPhaseCount}</strong>
            </div>
            <div className="p-2 bg-[#0d1522] border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">✅ Action Items:</span>
              <strong className="text-purple-400 font-bold">
                {completedActionItemsCount}/{actionItems.length}
              </strong>
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────────
            MAIN SCROLLABLE WORKSPACE
            ──────────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-[#090e17]">
          {/* ════════════════════════════════════════════════════════════════
              SECTION 2: TODAY'S MEETINGS
              ════════════════════════════════════════════════════════════════ */}
          <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <span>📋</span> TODAY'S MEETINGS ({todaysMeetings.length})
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddMeetingModal(true)}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold rounded-lg transition flex items-center gap-1 shadow-sm shadow-cyan-900/40"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Meeting</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {meetings.map(m => {
                const isComplete = m.status === 'completed';
                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border transition ${
                      isComplete
                        ? 'bg-[#080d14]/60 border-slate-800/60 opacity-60'
                        : 'bg-[#080d14] border-slate-800 hover:border-slate-700'
                    } space-y-2 text-xs`}
                  >
                    {/* Top Row: Time, Priority, Duration, Location */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            m.priority === 'high'
                              ? 'bg-rose-500 animate-pulse'
                              : m.priority === 'medium'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <span className="text-slate-100 text-sm">
                          {m.time} - {m.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded uppercase ${
                            m.priority === 'high'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : m.priority === 'medium'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          🔴 Priority: {m.priority}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          ⏳ Duration: {m.duration} min
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 flex items-center gap-1">
                          {m.location === 'Video Call' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                          <span>📍 {m.location}</span>
                        </span>
                      </div>
                    </div>

                    {/* Agenda & Attendees */}
                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div>
                        📝 <strong className="text-slate-400">Agenda:</strong> {m.agenda}
                      </div>
                      <div>
                        👤 <strong className="text-slate-400">Attendees:</strong> {m.attendees.join(', ')}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenMeetingInAgenda(m)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg transition flex items-center gap-1 border border-slate-700"
                        >
                          <span>📋</span>
                          <span>Open Agenda</span>
                        </button>
                        <button
                          onClick={() => setActiveNotesMeeting(m)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg transition flex items-center gap-1 border border-slate-700"
                        >
                          <span>📝</span>
                          <span>Take Notes</span>
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
                        <span>{isComplete ? 'Completed ✅' : 'Complete'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              ROW 1: DISCOVERY PHASE TRACKER & MEETING AGENDA TEMPLATE
              ════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Section 3: Discovery Phase Tracker (Left) */}
            <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📋</span> DISCOVERY PHASE TRACKER
                  </h3>
                  <button
                    onClick={() => {
                      const name = prompt('Client name:');
                      if (name) {
                        const newClient: DiscoveryClient = {
                          id: `disc_${Date.now()}`,
                          name,
                          contact: 'Lead Owner',
                          location: 'Online',
                          industry: 'E-Commerce',
                          revenue: '$5,000/mo',
                          status: 'pending',
                          phase: 1,
                          startDate: 'Today',
                          completedDate: null,
                          budget: '$5,000-$10,000',
                          decisionMaker: 'Owner',
                          followUpDate: 'Next Week',
                          priority: 'medium',
                          currentSetup: 'Pending review',
                          painPoints: 'Pending discovery interview',
                          goals: 'Complete architecture roadmap',
                          attachments: [],
                          notesHistory: [],
                          answers: {
                            q1_currentSetup: 'Pending review',
                            q2_painPoints: 'Pending discovery',
                            q3_goals: 'Build custom digital platform',
                            q4_budget: '$5k-$10k',
                            q5_decisionMaker: 'Owner',
                          },
                        };
                        setDiscoveryClients(prev => [newClient, ...prev]);
                      }
                    }}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded border border-slate-700"
                  >
                    + New Discovery
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-slate-500 text-[10px] border-b border-slate-800/80">
                        <th className="pb-1.5 font-bold">CLIENT</th>
                        <th className="pb-1.5 font-bold">STATUS</th>
                        <th className="pb-1.5 font-bold text-center">PHASE</th>
                        <th className="pb-1.5 font-bold text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {discoveryClients.map(c => (
                        <tr key={c.id} className="hover:bg-[#080d14]/80 transition">
                          <td className="py-2.5 font-bold text-slate-200">{c.name}</td>
                          <td className="py-2.5">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                c.status === 'complete'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : c.status === 'active'
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {c.status === 'complete' ? '✅ Complete' : c.status === 'active' ? '🔄 Active' : '⏳ Pending'}
                            </span>
                          </td>
                          <td className="py-2.5 text-center text-slate-300 font-bold">{c.phase}</td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => setSelectedDiscoveryId(c.id)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold rounded transition border border-slate-700"
                            >
                              📋 View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status Summary & Actions */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>📊 Discovery Status:</span>
                  <span className="font-bold text-slate-200">
                    ✅ Completed: {discoveryClients.filter(d => d.status === 'complete').length} • 🔄 Active: {discoveryClients.filter(d => d.status === 'active').length} • ⏳ Pending: {discoveryClients.filter(d => d.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4: Meeting Agenda Template (Right) */}
            <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📝</span> MEETING AGENDA TEMPLATE
                </h3>
                <button
                  onClick={() => setShowTemplateLibrary(true)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold rounded border border-slate-700"
                >
                  📋 Use Template
                </button>
              </div>

              {/* Template Form Inputs */}
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block uppercase">Title</label>
                    <input
                      className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200"
                      value={agendaForm.title}
                      onChange={e => setAgendaForm({ ...agendaForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block uppercase">Date & Duration</label>
                    <input
                      className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200"
                      value={`${agendaForm.date} • ${agendaForm.duration}`}
                      onChange={e => setAgendaForm({ ...agendaForm, duration: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block uppercase">Attendees</label>
                  <input
                    className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200"
                    value={agendaForm.attendees}
                    onChange={e => setAgendaForm({ ...agendaForm, attendees: e.target.value })}
                  />
                </div>

                {/* Agenda Items List */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 block uppercase">Agenda Items</label>
                  <div className="space-y-1">
                    {agendaForm.agendaItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 bg-[#080d14] rounded-lg border border-slate-800/80 flex items-center justify-between text-[11px]"
                      >
                        <span className="text-slate-300">{item}</span>
                        <button
                          onClick={() => handleRemoveAgendaItem(idx)}
                          className="text-slate-500 hover:text-rose-400 p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <input
                      placeholder="Add agenda topic..."
                      className="flex-1 bg-[#080d14] border border-slate-800 rounded-lg p-1 text-[11px] text-slate-200"
                      value={newAgendaItemText}
                      onChange={e => setNewAgendaItemText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddAgendaItem()}
                    />
                    <button
                      onClick={handleAddAgendaItem}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Notes Input */}
                <div>
                  <label className="text-[10px] text-slate-500 block uppercase">Notes</label>
                  <textarea
                    rows={2}
                    className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 resize-none"
                    value={agendaForm.notes}
                    onChange={e => setAgendaForm({ ...agendaForm, notes: e.target.value })}
                  />
                </div>

                {/* Action Items Quick Checklist */}
                <div className="space-y-1 pt-1 border-t border-slate-800/80">
                  <label className="text-[10px] text-slate-500 block uppercase">Action Items Generated</label>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center justify-between p-1 bg-[#080d14] rounded border border-slate-800">
                      <span className="text-slate-300">[ ] {agendaForm.actionTask1}</span>
                      <span className="text-[10px] text-slate-500">({agendaForm.actionOwner1}) ({agendaForm.actionDue1})</span>
                    </div>
                    <div className="flex items-center justify-between p-1 bg-[#080d14] rounded border border-slate-800">
                      <span className="text-slate-300">[ ] {agendaForm.actionTask2}</span>
                      <span className="text-[10px] text-slate-500">({agendaForm.actionOwner2}) ({agendaForm.actionDue2})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => alert('Meeting agenda template saved successfully.')}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Template</span>
                </button>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              ROW 2: DISCOVERY DATA & DECISION LOG
              ════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Section 5: Discovery Data (Left) */}
            <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📝</span> DISCOVERY DATA (Client Research)
                  </h3>
                  {/* Client Selector Dropdown */}
                  <select
                    className="bg-[#080d14] border border-slate-800 rounded px-2 py-0.5 text-xs text-cyan-300 font-bold"
                    value={selectedClientForResearch}
                    onChange={e => setSelectedClientForResearch(e.target.value)}
                  >
                    {discoveryClients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {currentResearchClient && (
                  <div className="p-3.5 bg-[#080d14] border border-slate-800/90 rounded-xl space-y-2 text-xs mt-2">
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-800/60 font-bold">
                      <span className="text-slate-100 text-sm">Client: {currentResearchClient.name}</span>
                      <span className="text-emerald-400">{currentResearchClient.revenue}</span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-slate-500">Industry:</span>{' '}
                        <span className="text-slate-200">{currentResearchClient.industry}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Current Setup:</span>{' '}
                        <span className="text-slate-200">{currentResearchClient.currentSetup}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Pain Points:</span>{' '}
                        <span className="text-rose-300">{currentResearchClient.painPoints}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Goals:</span>{' '}
                        <span className="text-emerald-300">{currentResearchClient.goals}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Budget:</span>{' '}
                        <strong className="text-emerald-400 font-bold">{currentResearchClient.budget}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Decision Maker:</span>{' '}
                        <span className="text-cyan-300">{currentResearchClient.decisionMaker}</span>
                      </div>
                    </div>

                    {/* Attachments list */}
                    <div className="pt-2 border-t border-slate-800/60 space-y-1">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">📎 Attachments:</span>
                      {currentResearchClient.attachments.map(att => (
                        <div key={att.id} className="text-[11px] text-cyan-400 flex items-center gap-1">
                          <span>📄</span>
                          <span className="underline cursor-pointer" onClick={() => alert(`Opening ${att.name}...`)}>
                            {att.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedDiscoveryId(currentResearchClient?.id || 'disc_rng')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition flex items-center gap-1 border border-slate-700"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Discovery</span>
                </button>
              </div>
            </div>

            {/* Section 6: Decision Log (Right) */}
            <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📋</span> DECISION LOG
                  </h3>
                  <button
                    onClick={() => setShowAddDecisionModal(true)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded border border-slate-700"
                  >
                    + Add Decision
                  </button>
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-slate-500 text-[10px] border-b border-slate-800/80">
                        <th className="pb-1.5 font-bold w-20">DATE</th>
                        <th className="pb-1.5 font-bold">DECISION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {decisions.map(d => (
                        <tr key={d.id} className="hover:bg-[#080d14]/80 transition">
                          <td className="py-2 text-cyan-400 font-bold text-[11px] whitespace-nowrap">{d.date}</td>
                          <td className="py-2 text-slate-200 text-[11px]">
                            {d.decision}
                            {d.context && <span className="text-[10px] text-slate-500 block">{d.context}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowAddDecisionModal(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition border border-slate-700"
                >
                  + Add Decision
                </button>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              ROW 3: ACTION ITEMS & MEETING INSIGHTS
              ════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Section 7: Action Items (Left) */}
            <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <span>✅</span> ACTION ITEMS (From All Meetings)
                  </h3>
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded border border-slate-700"
                  >
                    + Add Task
                  </button>
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-slate-500 text-[10px] border-b border-slate-800/80">
                        <th className="pb-1.5 font-bold">TASK</th>
                        <th className="pb-1.5 font-bold">OWNER</th>
                        <th className="pb-1.5 font-bold">DUE</th>
                        <th className="pb-1.5 font-bold text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {actionItems.map(item => {
                        const isDone = item.status === 'completed';
                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-[#080d14]/80 transition ${isDone ? 'opacity-50' : ''}`}
                          >
                            <td className="py-2.5 text-slate-200 text-[11px]">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleActionItem(item.id)}
                                  className="text-slate-400 hover:text-emerald-400"
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-500" />
                                  )}
                                </button>
                                <span className={isDone ? 'line-through text-slate-500' : 'font-bold'}>
                                  {item.title}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 text-slate-300 font-bold text-[11px]">{item.owner}</td>
                            <td className="py-2.5 text-slate-400 text-[11px]">{item.dueDate}</td>
                            <td className="py-2.5 text-right">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                  item.status === 'completed'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : item.status === 'overdue'
                                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                    : item.status === 'due_soon'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-slate-800 text-emerald-300 border border-emerald-900'
                                }`}
                              >
                                {item.status === 'completed'
                                  ? '✅ Done'
                                  : item.status === 'overdue'
                                  ? '🔴 Overdue'
                                  : item.status === 'due_soon'
                                  ? '🟡 Due Soon'
                                  : '🟢 On Track'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <span>
                  ✅ Completed: {actionItems.filter(a => a.status === 'completed').length} • 🔴 Overdue: {actionItems.filter(a => a.status === 'overdue').length} • 🟡 Due Soon: {actionItems.filter(a => a.status === 'due_soon').length}
                </span>
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-bold"
                >
                  + Add Task
                </button>
              </div>
            </div>

            {/* Section 8: Meeting Insights & Analytics (Right) */}
            <div className="p-4 bg-[#0d1522] border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📊</span> MEETING INSIGHTS
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-bold">MONTHLY CADENCE</span>
                </div>

                <div className="p-3 bg-[#080d14] border border-slate-800/90 rounded-xl space-y-2.5 text-xs mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Meetings This Month:</span>
                    <strong className="text-cyan-400 font-bold text-sm">12</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Avg Duration:</span>
                    <strong className="text-slate-200 font-bold">32 min</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Action Items Generated:</span>
                    <strong className="text-purple-400 font-bold">24</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Completion Rate:</span>
                    <strong className="text-emerald-400 font-bold">67%</strong>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
                    <span className="text-slate-400">Most Active Client:</span>
                    <span className="text-amber-400 font-bold">RNG Gamez (3 meetings)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowAnalyticsModal(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition border border-slate-700 flex items-center gap-1"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>View Full Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────
          MODAL: TAKE LIVE MEETING NOTES
          ──────────────────────────────────────────────────────────────── */}
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

            <div className="space-y-2 text-xs">
              <div className="text-slate-400">
                Client: <strong className="text-slate-200">{activeNotesMeeting.clientName}</strong> •{' '}
                {activeNotesMeeting.time}
              </div>
              <textarea
                rows={6}
                placeholder="Capture notes, architecture decisions, and follow-ups during the meeting..."
                className="w-full bg-[#080d14] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 resize-none focus:outline-none focus:border-cyan-500"
                value={activeNotesMeeting.notes}
                onChange={e => {
                  const val = e.target.value;
                  setActiveNotesMeeting({ ...activeNotesMeeting, notes: val });
                  setMeetings(prev => prev.map(m => (m.id === activeNotesMeeting.id ? { ...m, notes: val } : m)));
                }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveNotesMeeting(null)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition"
              >
                Save & Close Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          MODAL: ADD NEW MEETING
          ──────────────────────────────────────────────────────────────── */}
      {showAddMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={e => {
              e.preventDefault();
              const form = e.target as any;
              const newMeeting: MeetingItem = {
                id: `meet_${Date.now()}`,
                title: form.title.value,
                clientName: form.client.value,
                date: form.date.value,
                time: form.time.value,
                duration: Number(form.duration.value),
                location: form.location.value,
                priority: form.priority.value,
                status: 'scheduled',
                agenda: form.agenda.value,
                notes: '',
                attendees: form.attendees.value.split(',').map((s: string) => s.trim()),
              };
              setMeetings(prev => [...prev, newMeeting]);
              setShowAddMeetingModal(false);
            }}
            className="w-full max-w-lg bg-[#0c121d] border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl font-mono text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>➕</span> Schedule New Meeting
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMeetingModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block uppercase">Meeting Title</label>
                <input
                  required
                  name="title"
                  placeholder="e.g. Sprint Kickoff Call"
                  className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase">Client / Project</label>
                <input
                  required
                  name="client"
                  placeholder="e.g. CardVault AI"
                  className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase">Date</label>
                <input
                  type="date"
                  required
                  name="date"
                  defaultValue="2026-03-15"
                  className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase">Time</label>
                <input
                  required
                  name="time"
                  placeholder="e.g. 03:00 PM"
                  defaultValue="03:00 PM"
                  className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase">Duration (Minutes)</label>
                <input
                  type="number"
                  name="duration"
                  defaultValue={30}
                  className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase">Priority</label>
                <select name="priority" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option value="high">High 🔴</option>
                  <option value="medium">Medium 🟡</option>
                  <option value="low">Low 🟢</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase">Location</label>
                <select name="location" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option value="Video Call">Video Call</option>
                  <option value="In-Person">In-Person</option>
                  <option value="Phone">Phone</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase">Attendees</label>
                <input
                  name="attendees"
                  placeholder="You, Client"
                  defaultValue="You, Client"
                  className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block uppercase">Agenda</label>
              <textarea
                name="agenda"
                rows={2}
                placeholder="Review goals, architecture, and timeline..."
                className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddMeetingModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold">
                Save Meeting
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          MODAL: ADD NEW DECISION
          ──────────────────────────────────────────────────────────────── */}
      {showAddDecisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={e => {
              e.preventDefault();
              const form = e.target as any;
              const newDecision: DecisionLogEntry = {
                id: `dec_${Date.now()}`,
                date: form.date.value,
                decision: form.decision.value,
                context: form.context.value,
                madeBy: form.madeBy.value,
              };
              setDecisions(prev => [newDecision, ...prev]);
              setShowAddDecisionModal(false);
            }}
            className="w-full max-w-md bg-[#0c121d] border border-slate-700 rounded-2xl p-5 space-y-3.5 shadow-2xl font-mono text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>📋</span> Log New Executive Decision
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDecisionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block uppercase">Date</label>
              <input
                required
                name="date"
                defaultValue="Mar 15"
                className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block uppercase">Decision Summary</label>
              <input
                required
                name="decision"
                placeholder="e.g. Approve database sharding plan"
                className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block uppercase">Context / Rationale</label>
              <textarea
                name="context"
                rows={2}
                placeholder="Why this decision was made and impacted systems..."
                className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200 resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block uppercase">Decided By</label>
              <input
                name="madeBy"
                defaultValue="Founder"
                className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddDecisionModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold">
                Log Decision
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          MODAL: ADD ACTION ITEM
          ──────────────────────────────────────────────────────────────── */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={e => {
              e.preventDefault();
              const form = e.target as any;
              const newItem: ActionItem = {
                id: `act_${Date.now()}`,
                title: form.title.value,
                owner: form.owner.value,
                dueDate: form.dueDate.value,
                status: form.status.value,
              };
              setActionItems(prev => [newItem, ...prev]);
              setShowAddTaskModal(false);
            }}
            className="w-full max-w-md bg-[#0c121d] border border-slate-700 rounded-2xl p-5 space-y-3.5 shadow-2xl font-mono text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>✅</span> Add Action Item
              </h3>
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block uppercase">Action Task Description</label>
              <input
                required
                name="title"
                placeholder="e.g. Send updated pricing breakdown"
                className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block uppercase">Owner</label>
                <select name="owner" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option value="You">You</option>
                  <option value="Des">Des (Designer)</option>
                  <option value="Dev">Dev (Developer)</option>
                  <option value="Client">Client</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block uppercase">Due Date</label>
                <input
                  required
                  name="dueDate"
                  defaultValue="Tomorrow"
                  className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block uppercase">Urgency Status</label>
              <select name="status" className="w-full bg-[#080d14] border border-slate-800 rounded-lg p-2 text-slate-200">
                <option value="on_track">🟢 On Track</option>
                <option value="due_soon">🟡 Due Soon</option>
                <option value="overdue">🔴 Overdue</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold">
                Add Action Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          MODAL: MEETING TEMPLATE LIBRARY
          ──────────────────────────────────────────────────────────────── */}
      {showTemplateLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0c121d] border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>📋</span> MEETING TEMPLATE LIBRARY
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
                      <h4 className="text-sm font-bold text-cyan-300">📌 {t.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t.description}</p>
                    </div>
                    <button
                      onClick={() => handleApplyTemplate(t)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs transition"
                    >
                      📋 Use Template
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 space-y-0.5 text-[11px] text-slate-300">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Agenda Outline:</span>
                    {t.agendaItems.map((item, idx) => (
                      <div key={idx} className="text-slate-300">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          MODAL: MEETING ANALYTICS DETAIL
          ──────────────────────────────────────────────────────────────── */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0c121d] border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>📊</span> Meeting Analytics & Cadence Overview
              </h3>
              <button onClick={() => setShowAnalyticsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">TOTAL MEETINGS</span>
                <strong className="text-cyan-400 text-lg font-bold">12</strong>
              </div>
              <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">AVG DURATION</span>
                <strong className="text-amber-400 text-lg font-bold">32 min</strong>
              </div>
              <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">ACTION ITEMS</span>
                <strong className="text-purple-400 text-lg font-bold">24</strong>
              </div>
              <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">COMPLETION RATE</span>
                <strong className="text-emerald-400 text-lg font-bold">67%</strong>
              </div>
            </div>

            <div className="p-3 bg-[#080d14] rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Client Meeting Frequency</div>
              <div className="flex justify-between text-slate-300">
                <span>1. RNG Gamez</span>
                <span className="text-cyan-400 font-bold">3 Calls (90 min total)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>2. Atelier Parfums</span>
                <span className="text-cyan-400 font-bold">2 Calls (75 min total)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>3. DragonCard Vault</span>
                <span className="text-cyan-400 font-bold">2 Calls (60 min total)</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold"
              >
                Close Analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
