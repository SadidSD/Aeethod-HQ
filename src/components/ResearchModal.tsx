import { useState, useEffect, useMemo } from 'react';
import AgencyManager from '../core/agency';
import {
  Search,
  Zap,
  Globe,
  TrendingUp,
  Cpu,
  Palette,
  BookOpen,
  X,
  ShieldCheck,
  Copy,
  Sliders,
  Sparkles,
  Cast,
  BarChart3,
  Layers,
  ArrowRight,
  Database,
  Flame,
  Award,
  Plus,
  Trash2,
  Check,
  Filter,
  Tag,
  FileText,
  ChevronRight,
  Code2,
  Terminal,
  Bookmark
} from 'lucide-react';

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  agencyManager: AgencyManager | null;
}

// ── TYPES ──────────────────────────────────────────────────────────────────

export type Discipline = 'all' | 'design' | 'content' | 'frontend' | 'backend';
export type ResearchType = 'adr' | 'spike' | 'teardown' | 'benchmark' | 'template';
export type ResearchStatus = 'validated' | 'evaluating' | 'archived';

export interface ResearchBenchmark {
  metric: string;
  value: string;
  comparison?: string;
}

export interface ResearchEntry {
  id: string;
  title: string;
  discipline: 'design' | 'content' | 'frontend' | 'backend';
  type: ResearchType;
  status: ResearchStatus;
  tags: string[];
  summary: string;
  problemStatement?: string;
  optionsEvaluated?: string[];
  decisionRationale?: string;
  consequences?: string;
  keyFindings: string[];
  benchmarks?: ResearchBenchmark[];
  codeOrTokens?: string;
  sourceUrls?: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
}

// ── SEED RESEARCH KNOWLEDGE BASE ──────────────────────────────────────────

const INITIAL_RESEARCH_ENTRIES: ResearchEntry[] = [
  // ── DESIGN ──
  {
    id: 'res_d01',
    title: 'ADR-D01: Bento Grid & 12px Glassmorphism Layout for High-Density Portals',
    discipline: 'design',
    type: 'adr',
    status: 'validated',
    tags: ['UI/UX', 'Bento', 'Glassmorphism', 'Apple-Style', 'Layout'],
    summary: 'Standardized Bento Grid layout with backdrop-blur-md for complex client dashboards to balance data density with visual calm.',
    problemStatement: 'Client portals (RNG Gamez, Fintech dashboards) displayed high metric density that overwhelmed users in traditional 3-column layouts.',
    optionsEvaluated: [
      'Strict 12-column flat card dashboard (High clutter, boring visual hierarchy)',
      'Tab-heavy segmented views (Hides critical analytics behind unnecessary clicks)',
      'Bento Grid with asymmetrical 1x1, 2x1, and 2x2 modular blocks (Chosen)'
    ],
    decisionRationale: 'Bento grids allow visual storytelling where North Star metrics get 2x2 prominence while ancillary stats occupy compact 1x1 widgets.',
    consequences: 'Requires strict responsive breakpoints to fold smoothly onto mobile without losing grouping logic.',
    keyFindings: [
      'Reduces dashboard scan time by 34% compared to uniform tables.',
      '1px subtle border highlights (#ffffff15) provide contrast without heavy shadows.',
      '12px rounded corners match iOS/macOS human interface guidelines.'
    ],
    benchmarks: [
      { metric: 'Dashboard Scan Time', value: '-34%', comparison: 'vs Uniform Grid' },
      { metric: 'Mobile Breakpoint Fidelity', value: '100%', comparison: 'Tailwind grid-cols-1 md:grid-cols-4' }
    ],
    codeOrTokens: `/* Aeethod Signature Dark Glass Token */
bg-slate-900/70 backdrop-blur-md 
border border-slate-700/60 
shadow-xl shadow-black/40 
rounded-2xl`,
    author: 'Elena Rostova (Lead Designer)',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-04'
  },
  {
    id: 'res_d02',
    title: 'Design Teardown: Linear vs Stripe — Spatial Depth & Spring Physics',
    discipline: 'design',
    type: 'teardown',
    status: 'validated',
    tags: ['Micro-Interactions', 'Spring-Physics', 'Framer-Motion', 'Tactile'],
    summary: 'Reverse-engineered the micro-interaction curves of Linear.app and Stripe to achieve crisp, sub-100ms tactile feedback on click events.',
    problemStatement: 'Standard ease-in-out CSS transitions feel sluggish and robotic in web apps compared to native macOS applications.',
    optionsEvaluated: [
      'Standard CSS ease-in-out (Feels synthetic and laggy on buttons)',
      'Linear CSS bezier curves (Better, but lacks dynamic velocity)',
      'Framer Motion spring physics (stiffness: 400, damping: 30) (Chosen)'
    ],
    decisionRationale: 'Springs respond immediately to user input without an unnatural deceleration curve, mimicking physical matter.',
    keyFindings: [
      'Spring stiffness 400 with damping 28 eliminates rebound wobble while keeping responsiveness.',
      'Active tap scale should never drop below 0.97 (0.95 feels broken or squishy).'
    ],
    benchmarks: [
      { metric: 'Button Response Latency', value: '16ms', comparison: 'Sub-frame tactile feel' },
      { metric: 'User Delight Score', value: '4.9 / 5', comparison: 'Internal review' }
    ],
    codeOrTokens: `// Framer Motion Spring Config
const springConfig = {
  type: "spring",
  stiffness: 400,
  damping: 28,
  mass: 0.8
};
// Button tap style: whileTap={{ scale: 0.98 }}`,
    author: 'Elena Rostova (Lead Designer)',
    createdAt: '2026-03-02',
    updatedAt: '2026-03-02'
  },

  // ── CONTENT ──
  {
    id: 'res_c01',
    title: 'Framework: Problem-Agitate-Solution (PAS) for High-Ticket Agency Proposals',
    discipline: 'content',
    type: 'template',
    status: 'validated',
    tags: ['Copywriting', 'Pitch-Deck', 'Conversion', 'Discovery'],
    summary: 'A proven 3-stage copywriting architecture used to draft winning client proposals and landing page hero sections with 40%+ conversion.',
    problemStatement: 'Most agency proposals list technical features before clients emotionally connect with the cost of their current technical debt.',
    optionsEvaluated: [
      'Feature-Led Proposal (Leads with Next.js/Supabase specs; clients compare prices)',
      'AIDA Framework (Good for consumer ads, too generic for B2B engineering)',
      'PAS Architecture with Quantified Financial Debt (Chosen)'
    ],
    decisionRationale: 'Quantifying what the client loses today (e.g. $42k/mo to slow checkout) establishes massive ROI before presenting our fee.',
    keyFindings: [
      'Stage 1 (Problem): State the exact friction point (e.g. 4.2s mobile load time).',
      'Stage 2 (Agitate): Calculate the annualized revenue loss from that problem.',
      'Stage 3 (Solution): Position Aeethod architecture as the irreversible fix.'
    ],
    benchmarks: [
      { metric: 'Proposal Close Rate', value: '62%', comparison: 'Up from 38%' },
      { metric: 'Avg Deal Size', value: '+$14,500', comparison: 'Value-based pricing' }
    ],
    codeOrTokens: `## [PAS Client Hook Formula]
1. PROBLEM: "Your current Shopify checkout drops 38% of mobile collectors on step 2."
2. AGITATE: "At your current traffic, this leaks ~$24,000 every month directly to TCGPlayer."
3. SOLUTION: "Aeethod's Next.js 15 Sub-Second Buylist recovers those orders with 1-tap Apple Pay."`,
    author: 'Marcus Vance (Growth & Content)',
    createdAt: '2026-02-28',
    updatedAt: '2026-03-03'
  },
  {
    id: 'res_c02',
    title: 'SEO Keyword Intent Cluster: High-Ticket Collectibles & Card Buylists',
    discipline: 'content',
    type: 'benchmark',
    status: 'validated',
    tags: ['SEO', 'Search-Intent', 'Keywords', 'Organic-Growth'],
    summary: 'Identified 18 high-volume commercial keywords with low difficulty for TCG and luxury collectibles platforms.',
    problemStatement: 'Client needed organic search acquisition that avoided fighting TCGPlayer on generic "pokemon cards" head-terms.',
    keyFindings: [
      '"Sell trading cards instant payout" has 14,200/mo volume and only KD 22.',
      '"Bulk card scanner app" has high intent with zero dominating search results.',
      'Programmatic SEO landing pages for each card set (e.g. /sell/lorcana-first-chapter) capture 8x more longtail traffic.'
    ],
    benchmarks: [
      { metric: 'Target Keyword Volume', value: '185,000 / mo', comparison: 'Combined cluster' },
      { metric: 'Avg Keyword Difficulty', value: 'KD 24', comparison: 'Low competition' }
    ],
    author: 'Marcus Vance (Growth & Content)',
    createdAt: '2026-03-04',
    updatedAt: '2026-03-05'
  },

  // ── FRONTEND ──
  {
    id: 'res_f01',
    title: 'ADR-F01: Next.js 15 App Router & React Server Components (RSC) Standard',
    discipline: 'frontend',
    type: 'adr',
    status: 'validated',
    tags: ['Next.js', 'React-19', 'RSC', 'Performance', 'Architecture'],
    summary: 'Mandated Next.js 15 with App Router as default frontend stack for all Aeethod production client builds.',
    problemStatement: 'Legacy Client-Side Rendered (CSR) SPAs suffer from large JavaScript bundles (500KB+), slow mobile FCP, and poor SEO indexing.',
    optionsEvaluated: [
      'Vite SPA + React 19 (Blazing dev server, but client-only rendering hurts SEO)',
      'Remix / React Router v7 (Great form loaders, smaller ecosystem than Vercel)',
      'Next.js 15 App Router with Turbopack & RSC (Chosen)'
    ],
    decisionRationale: 'Server Components keep database access and heavy Markdown/date libraries on the server, sending near-zero client JS for content pages.',
    consequences: 'Team must be disciplined about separating "use client" interactive widgets from Server Components.',
    keyFindings: [
      'Reduces initial client JS payload by 65% compared to Pages router.',
      'Streaming SSR with Suspense allows instant skeleton rendering while slow queries resolve.',
      'Server Actions eliminate the need for boilerplate /api route handlers.'
    ],
    benchmarks: [
      { metric: 'Client JS Payload', value: '-65%', comparison: '48KB vs 142KB baseline' },
      { metric: 'First Contentful Paint', value: '0.65s', comparison: 'Sub-second mobile FCP' }
    ],
    codeOrTokens: `// Server Component with Direct DB Query & Suspense
import { Suspense } from 'react';
import { db } from '@/lib/db';

export default async function BuylistPage() {
  const cards = await db.cards.findMany({ take: 50 });
  return (
    <main>
      <Suspense fallback={<CardSkeletonGrid />}>
        <LivePriceFeed initialData={cards} />
      </Suspense>
    </main>
  );
}`,
    author: 'Chloe Lin (Frontend Lead)',
    createdAt: '2026-02-26',
    updatedAt: '2026-03-01'
  },
  {
    id: 'res_f02',
    title: 'Spike: Zustand vs Redux Toolkit — Bundle Overhead & Performance Benchmark',
    discipline: 'frontend',
    type: 'spike',
    status: 'validated',
    tags: ['Zustand', 'State-Management', 'Redux', 'Bundle-Size'],
    summary: 'Timeboxed benchmark comparing Zustand and Redux Toolkit across bundle size impact, TypeScript DX, and re-render frequency.',
    problemStatement: 'Need a lightweight, scalable global state manager for complex multi-step checkout and buylist carts.',
    optionsEvaluated: [
      'Redux Toolkit + React-Redux (11.8 KB min+gzip, heavy boilerplate)',
      'Jotai Atomic State (3.4 KB, great for primitives, complex object stores get messy)',
      'Zustand (1.18 KB min+gzip, zero boilerplate, transient updates) (Chosen)'
    ],
    decisionRationale: 'Zustand is 10x smaller than Redux Toolkit, requires zero Context Provider wrapping, and supports subscriber selector memoization out of the box.',
    keyFindings: [
      'Zustand adds only 1.18 KB to the final bundle.',
      'Selectors prevent full component tree re-renders during high-frequency cart changes.'
    ],
    benchmarks: [
      { metric: 'Minified Bundle Size', value: '1.18 KB', comparison: 'vs Redux 11.8 KB (-90%)' },
      { metric: 'Setup Boilerplate Lines', value: '12 lines', comparison: 'vs Redux 84 lines' }
    ],
    codeOrTokens: `import { create } from 'zustand';

interface CartStore {
  items: Array<{ id: string; price: number }>;
  addItem: (item: { id: string; price: number }) => void;
}

export const useCart = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
}));`,
    author: 'Chloe Lin (Frontend Lead)',
    createdAt: '2026-03-02',
    updatedAt: '2026-03-02'
  },

  // ── BACKEND ──
  {
    id: 'res_b01',
    title: 'ADR-B01: Supabase Managed Postgres with Row-Level Security (RLS)',
    discipline: 'backend',
    type: 'adr',
    status: 'validated',
    tags: ['Supabase', 'PostgreSQL', 'RLS', 'Auth', 'Security'],
    summary: 'Selected Supabase as default relational database, authentication, and real-time backend engine for agency client projects.',
    problemStatement: 'Managing self-hosted PostgreSQL EC2 instances created high DevOps maintenance overhead and security patch burdens.',
    optionsEvaluated: [
      'Self-Hosted PostgreSQL on AWS RDS (High operational burden, manual auth setup)',
      'Google Firebase Firestore (NoSQL limits relational reporting, proprietary vendor lock-in)',
      'Supabase Cloud (PostgreSQL 16, built-in GoTrue Auth, pgvector, automated backups) (Chosen)'
    ],
    decisionRationale: 'Provides genuine open-source PostgreSQL with zero DevOps friction, instant GraphQL/REST reflection, and bulletproof Row Level Security.',
    consequences: 'Complex custom RPC logic must be written as PostgreSQL functions/triggers or Edge functions.',
    keyFindings: [
      'RLS policies enforce multi-tenant isolation at the database kernel level.',
      'Integrated Auth handles Google/GitHub OAuth, Magic Links, and JWT verification seamlessly.'
    ],
    benchmarks: [
      { metric: 'Dev Setup Velocity', value: '15 mins', comparison: 'vs 4 days manual RDS setup' },
      { metric: 'Database Latency', value: '14ms', comparison: 'Edge connection pooling' }
    ],
    codeOrTokens: `-- Secure Tenant RLS Policy
ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only read own workspace data"
ON client_projects FOR SELECT
USING (auth.uid() = owner_id);`,
    author: 'Devon Miles (Backend Lead)',
    createdAt: '2026-02-25',
    updatedAt: '2026-03-01'
  },
  {
    id: 'res_b02',
    title: 'Spike: Stripe Connect Custom vs Express for 60-Second Instant Payouts',
    discipline: 'backend',
    type: 'spike',
    status: 'validated',
    tags: ['Stripe', 'Fintech', 'Payouts', 'Webhooks', 'Idempotency'],
    summary: 'Evaluated Stripe Connect Custom Accounts vs Express to facilitate instant debit card cashouts for card buylist sellers.',
    problemStatement: 'Sellers demand instant cashouts (<60s) to their debit cards instead of waiting 2-3 business days for ACH bank transfers.',
    keyFindings: [
      'Stripe Instant Payouts push funds to debit cards in ~45 seconds via Visa Direct / Mastercard Send.',
      'Stripe fees are 1% (min $0.50) per instant payout, which can be passed to the seller or absorbed as a marketing perk.',
      'Webhook processing requires Redis distributed locks with idempotency keys to prevent double-spending.'
    ],
    benchmarks: [
      { metric: 'Payout Arrival Time', value: '45 seconds', comparison: 'vs 3-5 days ACH' },
      { metric: 'Seller Retention Lift', value: '+38%', comparison: 'Survey response' }
    ],
    author: 'Devon Miles (Backend Lead)',
    createdAt: '2026-03-04',
    updatedAt: '2026-03-05'
  }
];

export default function ResearchModal({ isOpen, onClose, agencyManager }: ResearchModalProps) {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'knowledge_base' | 'new_entry' | 'lead_audit' | 'cloud_calc'>('knowledge_base');
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Persistence State
  const [entries, setEntries] = useState<ResearchEntry[]>(() => {
    try {
      const saved = localStorage.getItem('aeethod_research_entries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to initial
    }
    return INITIAL_RESEARCH_ENTRIES;
  });

  // Save to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('aeethod_research_entries', JSON.stringify(entries));
  }, [entries]);

  // Form State for New Research Entry
  const [formDiscipline, setFormDiscipline] = useState<'design' | 'content' | 'frontend' | 'backend'>('frontend');
  const [formType, setFormType] = useState<ResearchType>('adr');
  const [formStatus, setFormStatus] = useState<ResearchStatus>('validated');
  const [formTitle, setFormTitle] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formProblem, setFormProblem] = useState('');
  const [formOptions, setFormOptions] = useState('');
  const [formDecision, setFormDecision] = useState('');
  const [formFindings, setFormFindings] = useState('');
  const [formCode, setFormCode] = useState('');

  // UI State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isCasting, setIsCasting] = useState(false);
  const [knowledgePoints, setKnowledgePoints] = useState(() => {
    return agencyManager?.state.resources.knowledge || 1450;
  });

  // Cloud Calculator State
  const [monthlyUsers, setMonthlyUsers] = useState(150000);
  const [dbReadsPerDay, setDbReadsPerDay] = useState(500000);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const handleCastToScreen = (title?: string) => {
    setIsCasting(!isCasting);
    triggerToast(
      !isCasting
        ? `📺 Casting "${title || 'Research Dossier'}" to Boardroom 85" Smart Display!`
        : '📺 Boardroom presentation cast disconnected.'
    );
  };

  const handleExportToAgenda = (entry: ResearchEntry) => {
    try {
      const existing = localStorage.getItem('aeethod_meeting_agenda');
      const agenda = existing ? JSON.parse(existing) : [];
      const newItems = entry.keyFindings.map(ins => ({
        id: 'res_' + Math.random().toString(36).substring(2, 7),
        text: `[${entry.discipline.toUpperCase()} Intel] ${ins}`,
        checked: false
      }));
      localStorage.setItem('aeethod_meeting_agenda', JSON.stringify([...agenda, ...newItems]));
      triggerToast(`📋 "${entry.title}" exported into Meeting Room Agenda!`);
    } catch {
      triggerToast('📋 Agenda updated for next boardroom session!');
    }
  };

  const handleCopy = (text: string, label = 'Copied to clipboard!') => {
    navigator.clipboard?.writeText(text);
    triggerToast(`📋 ${label}`);
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      triggerToast('⚠️ Please provide an entry title.');
      return;
    }

    const newEntry: ResearchEntry = {
      id: 'res_' + Date.now().toString(36),
      title: formTitle.trim(),
      discipline: formDiscipline,
      type: formType,
      status: formStatus,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      summary: formSummary.trim() || 'No summary provided.',
      problemStatement: formProblem.trim() || undefined,
      optionsEvaluated: formOptions ? formOptions.split('\n').map(o => o.trim()).filter(Boolean) : undefined,
      decisionRationale: formDecision.trim() || undefined,
      keyFindings: formFindings ? formFindings.split('\n').map(f => f.trim()).filter(Boolean) : ['Initial research spike completed.'],
      codeOrTokens: formCode.trim() || undefined,
      author: 'You (Founder & Strategy)',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    setSelectedEntryId(newEntry.id);
    setActiveTab('knowledge_base');

    // Reward Knowledge Points
    const newKP = knowledgePoints + 100;
    setKnowledgePoints(newKP);
    if (agencyManager) {
      agencyManager.state.resources.knowledge = newKP;
      agencyManager.save();
    }

    // Reset Form
    setFormTitle('');
    setFormTags('');
    setFormSummary('');
    setFormProblem('');
    setFormOptions('');
    setFormDecision('');
    setFormFindings('');
    setFormCode('');

    triggerToast('🎉 New Research Entry logged to Knowledge Base! (+100 KP)');
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    if (selectedEntryId === id) setSelectedEntryId(null);
    triggerToast('🗑️ Research entry archived.');
  };

  const handleLoadTemplate = (t: 'adr' | 'spike' | 'design' | 'content') => {
    if (t === 'adr') {
      setFormType('adr');
      setFormTitle('ADR-00X: Title of Architectural Decision');
      setFormProblem('What technical constraint or business challenge forced this research?');
      setFormOptions('Option A: Description and trade-offs\nOption B: Description and trade-offs\nOption C: Recommended winner');
      setFormDecision('Why was the winning option selected over alternatives?');
      setFormFindings('Metric or latency improvement\nDeveloper velocity gain\nMaintenance cost impact');
      setFormSummary('Executive 2-sentence summary of the decision and consequences.');
    } else if (t === 'spike') {
      setFormType('spike');
      setFormTitle('Spike: Proof-of-Concept & Benchmark Experiment');
      setFormProblem('What specific technical hypothesis were we evaluating under a timebox?');
      setFormFindings('Quantitative finding 1\nQuantitative finding 2\nEdge-case or failure mode discovered');
      setFormSummary('Timeboxed technical spike evaluating feasibility and throughput.');
      setFormCode(`// Spike Benchmark Snippet\nconsole.time("execution");\n// Test payload\nconsole.timeEnd("execution");`);
    } else if (t === 'design') {
      setFormDiscipline('design');
      setFormType('teardown');
      setFormTitle('Design Spec: Component Pattern & Spatial Physics');
      setFormProblem('User experience friction or design system inconsistency being addressed.');
      setFormFindings('Figma frame reference\nWCAG AAA color contrast ratio: 8.4:1\nSpring physics configuration');
      setFormCode(`/* Design Tokens */\n--color-accent: #06b6d4;\n--radius-card: 16px;\n--blur-glass: 12px;`);
    } else if (t === 'content') {
      setFormDiscipline('content');
      setFormType('template');
      setFormTitle('Content Architecture: Value Proposition & Hooks');
      setFormProblem('Client acquisition bottleneck or messaging misalignment.');
      setFormFindings('Target persona pain points\nHigh-volume commercial keyword search volume\nObjection rebuttal formula');
    }
    triggerToast(`⚡ Loaded ${t.toUpperCase()} Big Tech Template!`);
  };

  // Filtered Entries
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchDiscipline = selectedDiscipline === 'all' || e.discipline === selectedDiscipline;
      const matchType = selectedType === 'all' || e.type === selectedType;
      const matchQuery =
        !searchQuery.trim() ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchDiscipline && matchType && matchQuery;
    });
  }, [entries, selectedDiscipline, selectedType, searchQuery]);

  const selectedEntry = entries.find(e => e.id === selectedEntryId) || filteredEntries[0] || null;

  // Cloud Calculator Bill
  const vercelCost = monthlyUsers < 50000 ? 20 : Math.round(20 + ((monthlyUsers - 50000) / 10000) * 4);
  const supabaseCost = monthlyUsers < 100000 ? 25 : Math.round(25 + ((monthlyUsers - 100000) / 25000) * 10);
  const cloudflareCost = Math.round(5 + (monthlyUsers / 50000) * 3);
  const totalCloudCost = vercelCost + supabaseCost + cloudflareCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[90vh] flex flex-col rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-slate-700/80 shadow-2xl overflow-hidden font-sans">
        
        {/* Top Radiant Specular Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-90" />

        {/* ── HEADER BAR ────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-wide text-white uppercase flex items-center gap-2">
                  Aeethod Research & Intelligence System
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  BIG TECH TAXONOMY
                </span>
                {isCasting && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-950 text-amber-300 border border-amber-600 animate-pulse">
                    <Cast className="w-3 h-3" /> CASTING TO 85" SCREEN
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Plan & Meeting Room Terminal • Design, Content, Frontend & Backend Knowledge Base
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Knowledge Points Meter */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <Award className="w-4 h-4 text-amber-400" />
              <div className="text-xs font-semibold text-slate-200">
                <span className="text-amber-400 font-bold">{knowledgePoints}</span> KP
              </div>
            </div>

            {/* Cast to Screen Button */}
            <button
              onClick={() => handleCastToScreen(selectedEntry?.title)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                isCasting
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Cast className="w-3.5 h-3.5" />
              {isCasting ? 'Stop Cast' : 'Cast to TV'}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── PRIMARY MODULE NAVIGATION ─────────────────────────── */}
        <div className="flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950 text-xs font-medium">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('knowledge_base')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
                activeTab === 'knowledge_base'
                  ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Intelligence Repository ({entries.length})
            </button>
            <button
              onClick={() => setActiveTab('new_entry')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
                activeTab === 'new_entry'
                  ? 'border-emerald-400 text-emerald-300 font-bold bg-emerald-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              + Create Research Entry (RFC / ADR)
            </button>
            <button
              onClick={() => setActiveTab('cloud_calc')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
                activeTab === 'cloud_calc'
                  ? 'border-purple-400 text-purple-300 font-bold bg-purple-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4 text-purple-400" />
              Cloud Architecture & Unit Economics
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            DB Status: Connected to Local + Cloud Sync
          </div>
        </div>

        {/* ── TOAST ALERT ───────────────────────────────────────── */}
        {toastMsg && (
          <div className="absolute top-20 right-8 z-50 flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900/95 text-cyan-300 border border-cyan-500/50 shadow-xl shadow-cyan-950/50 animate-in slide-in-from-top-2 duration-150">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            {toastMsg}
          </div>
        )}

        {/* ── BODY VIEWPORT ─────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">

          {/* ════ VIEW 1: KNOWLEDGE BASE REPOSITORY ════ */}
          {activeTab === 'knowledge_base' && (
            <div className="flex-1 flex overflow-hidden">
              
              {/* LEFT SIDEBAR: Filters & Research Entry Cards */}
              <div className="w-[420px] shrink-0 border-r border-slate-800 flex flex-col bg-slate-950/60">
                
                {/* Search & Filter Header */}
                <div className="p-4 border-b border-slate-800/80 space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search ADRs, spikes, tags, tech..."
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* 4 Core Disciplines Pill Filter */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-medium">
                    <button
                      onClick={() => setSelectedDiscipline('all')}
                      className={`px-2.5 py-1 rounded-full transition-colors shrink-0 ${
                        selectedDiscipline === 'all'
                          ? 'bg-white text-slate-950 font-bold'
                          : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      All ({entries.length})
                    </button>
                    <button
                      onClick={() => setSelectedDiscipline('design')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors shrink-0 ${
                        selectedDiscipline === 'design'
                          ? 'bg-pink-500/20 text-pink-300 border border-pink-500/50 font-bold'
                          : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Palette className="w-3 h-3 text-pink-400" />
                      Design
                    </button>
                    <button
                      onClick={() => setSelectedDiscipline('content')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors shrink-0 ${
                        selectedDiscipline === 'content'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                          : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <FileText className="w-3 h-3 text-amber-400" />
                      Content
                    </button>
                    <button
                      onClick={() => setSelectedDiscipline('frontend')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors shrink-0 ${
                        selectedDiscipline === 'frontend'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                          : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Code2 className="w-3 h-3 text-cyan-400" />
                      Frontend
                    </button>
                    <button
                      onClick={() => setSelectedDiscipline('backend')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors shrink-0 ${
                        selectedDiscipline === 'backend'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 font-bold'
                          : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Database className="w-3 h-3 text-purple-400" />
                      Backend
                    </button>
                  </div>

                  {/* Format Filter */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Filter className="w-3 h-3 text-slate-500" /> Type:
                    </span>
                    <div className="flex gap-1">
                      {['all', 'adr', 'spike', 'teardown', 'benchmark'].map(t => (
                        <button
                          key={t}
                          onClick={() => setSelectedType(t)}
                          className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono transition-colors ${
                            selectedType === t
                              ? 'bg-slate-700 text-white font-bold'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Entry List Scrollable */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
                  {filteredEntries.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No research entries match the filter.
                    </div>
                  ) : (
                    filteredEntries.map(entry => {
                      const isSelected = selectedEntry?.id === entry.id;
                      const discColor =
                        entry.discipline === 'design' ? 'text-pink-400' :
                        entry.discipline === 'content' ? 'text-amber-400' :
                        entry.discipline === 'frontend' ? 'text-cyan-400' : 'text-purple-400';

                      return (
                        <button
                          key={entry.id}
                          onClick={() => setSelectedEntryId(entry.id)}
                          className={`w-full text-left p-3 rounded-xl transition-all border ${
                            isSelected
                              ? 'bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-950/40'
                              : 'border-transparent hover:bg-slate-900/50 hover:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-black uppercase tracking-wider ${discColor}`}>
                                {entry.discipline}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                                {entry.type}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">{entry.updatedAt}</span>
                          </div>

                          <div className="text-xs font-bold text-white line-clamp-1 group-hover:text-cyan-300">
                            {entry.title}
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {entry.summary}
                          </p>

                          {/* Tag Chips */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.tags.slice(0, 3).map(tg => (
                              <span key={tg} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                                #{tg}
                              </span>
                            ))}
                            {entry.tags.length > 3 && (
                              <span className="text-[9px] text-slate-500">+{entry.tags.length - 3}</span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT MAIN PANEL: Document Reader / Deep Inspection */}
              <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900/30 p-6 space-y-6">
                {selectedEntry ? (
                  <div className="space-y-6 max-w-3xl">
                    
                    {/* Header Details */}
                    <div className="space-y-2 border-b border-slate-800 pb-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            selectedEntry.discipline === 'design' ? 'bg-pink-950/60 text-pink-300 border-pink-800' :
                            selectedEntry.discipline === 'content' ? 'bg-amber-950/60 text-amber-300 border-amber-800' :
                            selectedEntry.discipline === 'frontend' ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800' :
                            'bg-purple-950/60 text-purple-300 border-purple-800'
                          }`}>
                            {selectedEntry.discipline}
                          </span>
                          <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {selectedEntry.type}
                          </span>
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> {selectedEntry.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleExportToAgenda(selectedEntry)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-md"
                          >
                            <Bookmark className="w-3.5 h-3.5" /> Push to Agenda
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(selectedEntry.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h1 className="text-lg font-black text-white tracking-wide">
                        {selectedEntry.title}
                      </h1>

                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                        <span>Author: <strong className="text-slate-200">{selectedEntry.author}</strong></span>
                        <span>•</span>
                        <span>Logged: <strong className="text-slate-200">{selectedEntry.createdAt}</strong></span>
                      </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                        Executive Takeaway
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {selectedEntry.summary}
                      </p>
                    </div>

                    {/* Problem Statement (Context) */}
                    {selectedEntry.problemStatement && (
                      <div className="space-y-1.5">
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Terminal className="w-4 h-4 text-amber-400" /> Context & Problem Statement
                        </h3>
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                          {selectedEntry.problemStatement}
                        </div>
                      </div>
                    )}

                    {/* Options Evaluated Matrix */}
                    {selectedEntry.optionsEvaluated && selectedEntry.optionsEvaluated.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-purple-400" /> Options Evaluated & Trade-offs
                        </h3>
                        <div className="space-y-1.5">
                          {selectedEntry.optionsEvaluated.map((opt, i) => (
                            <div key={i} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                              <ChevronRight className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Decision Rationale */}
                    {selectedEntry.decisionRationale && (
                      <div className="space-y-1.5">
                        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-400" /> Decision & Technical Conviction
                        </h3>
                        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-slate-200 leading-relaxed font-medium">
                          {selectedEntry.decisionRationale}
                        </div>
                      </div>
                    )}

                    {/* Key Findings */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-cyan-400" /> Core Research Findings & Actionable Insights
                      </h3>
                      <div className="space-y-1.5">
                        {selectedEntry.keyFindings.map((finding, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-[10px] shrink-0 font-bold">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{finding}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Benchmarks Grid (if any) */}
                    {selectedEntry.benchmarks && selectedEntry.benchmarks.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <BarChart3 className="w-4 h-4 text-emerald-400" /> Empirical Benchmarks
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedEntry.benchmarks.map((bm, bIdx) => (
                            <div key={bIdx} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                              <div className="text-lg font-black text-emerald-400">{bm.value}</div>
                              <div className="text-xs font-semibold text-slate-300 mt-0.5">{bm.metric}</div>
                              {bm.comparison && <div className="text-[10px] text-slate-500 mt-0.5">{bm.comparison}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Code Snippet / Tokens (if any) */}
                    {selectedEntry.codeOrTokens && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Code2 className="w-4 h-4 text-cyan-400" /> Starter Code / Tokens / Schema
                          </h3>
                          <button
                            onClick={() => handleCopy(selectedEntry.codeOrTokens!, 'Code snippet copied!')}
                            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy Code
                          </button>
                        </div>
                        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                          {selectedEntry.codeOrTokens}
                        </pre>
                      </div>
                    )}

                    {/* Tags Footer */}
                    <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEntry.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                    Select a research entry from the left to view documentation.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ════ VIEW 2: CREATE NEW RESEARCH ENTRY (BIG TECH TEMPLATES) ════ */}
          {activeTab === 'new_entry' && (
            <div className="flex-1 overflow-y-auto p-6 bg-slate-900/20">
              <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Header & Quick Template Select */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-400" /> Log New Research Document
                      </h3>
                      <p className="text-xs text-slate-400">
                        Use Big Tech templates (ADR, Spike, Design Spec, Content Strategy)
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleLoadTemplate('adr')}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/50"
                      >
                        Load ADR Template
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadTemplate('spike')}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-800/50"
                      >
                        Load Spike Template
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadTemplate('design')}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-pink-300 border border-pink-800/50"
                      >
                        Load Design Spec
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadTemplate('content')}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/50"
                      >
                        Load Content Doc
                      </button>
                    </div>
                  </div>
                </div>

                {/* The Form */}
                <form onSubmit={handleCreateEntry} className="space-y-4">
                  
                  {/* Row 1: Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Research Document Title *
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      placeholder="e.g. ADR-012: Adoption of Cloudflare R2 for Zero-Egress Lookbook Images"
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Row 2: Discipline, Type, Status */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Discipline</label>
                      <select
                        value={formDiscipline}
                        onChange={e => setFormDiscipline(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="design">🎨 Design (UI/UX, Tokens)</option>
                        <option value="content">✍️ Content (Copy, SEO, Strategy)</option>
                        <option value="frontend">⚡ Frontend (Next.js, React, WebGL)</option>
                        <option value="backend">🛡️ Backend (DB, APIs, Stripe)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Document Format</label>
                      <select
                        value={formType}
                        onChange={e => setFormType(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="adr">ADR (Architecture Decision Record)</option>
                        <option value="spike">Spike / Technical POC</option>
                        <option value="teardown">Competitor / Product Teardown</option>
                        <option value="benchmark">Empirical Benchmark Log</option>
                        <option value="template">Reusable Starter Template</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Lifecycle Status</label>
                      <select
                        value={formStatus}
                        onChange={e => setFormStatus(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="validated">✅ Validated (Production Standard)</option>
                        <option value="evaluating">⏳ Evaluating (In Progress)</option>
                        <option value="archived">📦 Archived</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Tags & Summary */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={e => setFormTags(e.target.value)}
                      placeholder="e.g. Next.js, Stripe, Performance, Buylist"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Executive Summary (2-sentence takeaway)
                    </label>
                    <textarea
                      rows={2}
                      value={formSummary}
                      onChange={e => setFormSummary(e.target.value)}
                      placeholder="Briefly state what decision was made and the primary business/engineering benefit."
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                    />
                  </div>

                  {/* Row 4: Problem Statement & Options Evaluated */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                        Context & Problem Statement
                      </label>
                      <textarea
                        rows={3}
                        value={formProblem}
                        onChange={e => setFormProblem(e.target.value)}
                        placeholder="What bottleneck or constraint required this investigation?"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                        Options Evaluated (1 per line)
                      </label>
                      <textarea
                        rows={3}
                        value={formOptions}
                        onChange={e => setFormOptions(e.target.value)}
                        placeholder="Option A: Details&#10;Option B: Details&#10;Option C: Winner"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  {/* Row 5: Decision Rationale & Core Findings */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Decision Rationale & Technical Conviction
                    </label>
                    <textarea
                      rows={2}
                      value={formDecision}
                      onChange={e => setFormDecision(e.target.value)}
                      placeholder="Why did we select this option? What was the non-obvious engineering insight?"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Key Findings / Empirical Metrics (1 per line)
                    </label>
                    <textarea
                      rows={3}
                      value={formFindings}
                      onChange={e => setFormFindings(e.target.value)}
                      placeholder="e.g. Cuts initial JS bundle by 65%&#10;Sub-second FCP on mobile Safari&#10;Zero vendor lock-in"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                    />
                  </div>

                  {/* Row 6: Code Snippet / Tokens */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Starter Code / CSS Tokens / SQL Schema (Optional)
                    </label>
                    <textarea
                      rows={4}
                      value={formCode}
                      onChange={e => setFormCode(e.target.value)}
                      placeholder="Paste copyable code, SQL migrations, or CSS tokens..."
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-cyan-300 font-mono"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('knowledge_base')}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-900/30"
                    >
                      <Sparkles className="w-4 h-4" /> Save Entry & Claim +100 KP
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

          {/* ════ VIEW 3: CLOUD COST & ARCHITECTURE LAB ════ */}
          {activeTab === 'cloud_calc' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Cloud Cost Calculator Card */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-emerald-400" /> Client Infrastructure & Unit Economics Calculator
                      </h3>
                      <p className="text-xs text-slate-400">
                        Forecast monthly cloud hosting and database bills for client proposals across Vercel, Supabase, and Cloudflare.
                      </p>
                    </div>
                    <div className="text-xs text-emerald-400 font-bold bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800">
                      Est. Monthly Cloud Spend: ${totalCloudCost} / mo
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-4">
                    {/* Sliders */}
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                          <span className="font-semibold">Monthly Active Users (MAU)</span>
                          <span className="font-mono font-bold text-cyan-400 text-sm">{monthlyUsers.toLocaleString()} MAU</span>
                        </div>
                        <input
                          type="range"
                          min="10000"
                          max="1500000"
                          step="10000"
                          value={monthlyUsers}
                          onChange={e => setMonthlyUsers(Number(e.target.value))}
                          className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                          <span className="font-semibold">Database Operations / Day</span>
                          <span className="font-mono font-bold text-purple-400 text-sm">{dbReadsPerDay.toLocaleString()} ops</span>
                        </div>
                        <input
                          type="range"
                          min="50000"
                          max="3000000"
                          step="50000"
                          value={dbReadsPerDay}
                          onChange={e => setDbReadsPerDay(Number(e.target.value))}
                          className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Breakdown Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center flex flex-col justify-center">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Vercel Pro</div>
                        <div className="text-xl font-bold text-cyan-400 mt-1">${vercelCost}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Edge SSR Compute</div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center flex flex-col justify-center">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Supabase Pro</div>
                        <div className="text-xl font-bold text-emerald-400 mt-1">${supabaseCost}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Postgres + Auth</div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center flex flex-col justify-center">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Cloudflare R2</div>
                        <div className="text-xl font-bold text-amber-400 mt-1">${cloudflareCost}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Zero-Egress Images</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Big Tech Research Philosophy Guide */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Big Tech Research Playbook: How to Conduct & Store Research
                  </h4>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                      <div className="font-bold text-cyan-300">1. Architecture Decision Records (ADRs)</div>
                      <p className="text-slate-400 leading-relaxed">
                        Never make architecture choices without documenting why. Format: <em>Title, Status, Context, Options, Decision, Consequences</em>. Stripe and Google keep ADRs immutable in git.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                      <div className="font-bold text-purple-300">2. Timeboxed Engineering Spikes</div>
                      <p className="text-slate-400 leading-relaxed">
                        Timebox exploration to 2–4 hours with a specific question (e.g. <em>Can Three.js render 50 foil cards at 60fps on iOS?</em>). Deliverable must be code + empirical benchmark.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                      <div className="font-bold text-pink-300">3. Deconstructed Design Tokens</div>
                      <p className="text-slate-400 leading-relaxed">
                        Extract and document concrete tokens (hex, spring physics, contrast ratios) rather than saving static screenshots.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                      <div className="font-bold text-amber-300">4. Content & Messaging Hierarchy</div>
                      <p className="text-slate-400 leading-relaxed">
                        Structure copywriting into Problem-Agitate-Solution frameworks mapped to commercial search volume clusters.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* ── FOOTER BAR ────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800/80 bg-slate-950 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Aeethod Research Bus: Plan & Meeting Room Node Online</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">ESC</kbd> to exit</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
            >
              Close Terminal
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
