import { useState, useEffect, useMemo } from 'react';
import AgencyManager from '../core/agency';
import {
  Search,
  Palette,
  BookOpen,
  X,
  ShieldCheck,
  Copy,
  Sliders,
  Sparkles,
  Cast,
  Layers,
  ArrowRight,
  Database,
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
  Bookmark,
  Activity,
  RotateCcw,
  MousePointerClick
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

// Design-Specific Rich Fields
export interface DesignMetadata {
  colorPalette?: Array<{ name: string; hex: string; role: string }>;
  springPhysics?: { stiffness: number; damping: number; mass: number; latencyMs?: string };
  wcagContrast?: { ratio: string; level: 'AAA' | 'AA'; notes?: string };
  componentAnatomy?: string[];
}

// Content-Specific Rich Fields
export interface ContentMetadata {
  targetPersona?: string;
  pasFunnel?: { problem: string; agitate: string; solution: string };
  seoKeywords?: Array<{ keyword: string; volume: string; kd: string; intent: string }>;
  headlineSnippet?: string;
  callToAction?: string;
}

// Frontend-Specific Rich Fields
export interface FrontendMetadata {
  coreWebVitals?: { fcp: string; lcp: string; cls: string; inp: string };
  bundleSize?: { size: string; savingsPercent?: string; baseline?: string };
  frameworksCompared?: Array<{ name: string; bundle: string; dxScore: string; verdict: string }>;
}

// Backend-Specific Rich Fields
export interface BackendMetadata {
  architectureTopology?: string;
  databaseSchemaSql?: string;
  rlsSecurityPolicy?: string;
  apiEndpoints?: Array<{ method: string; path: string; latency: string; auth: string }>;
  tradeoffsEvaluated?: Array<{ option: string; pros: string; cons: string; status: 'Chosen' | 'Rejected' }>;
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

  // Differentiated Discipline Metadata
  designMeta?: DesignMetadata;
  contentMeta?: ContentMetadata;
  frontendMeta?: FrontendMetadata;
  backendMeta?: BackendMetadata;
}

// ── SEED RESEARCH KNOWLEDGE BASE (RICH & DIFFERENTIATED) ──────────────────

const INITIAL_RESEARCH_ENTRIES: ResearchEntry[] = [
  // ── 1. DESIGN SPEC (Apple / Stripe Model) ──
  {
    id: 'res_d01',
    title: 'Design Spec: Bento Grid & Glassmorphism System for High-Density Portals',
    discipline: 'design',
    type: 'teardown',
    status: 'validated',
    tags: ['UI/UX', 'Bento', 'Glassmorphism', 'Apple-Style', 'Tokens'],
    summary: 'Standardized modular Bento Grid layout with backdrop-blur-md for complex client dashboards to balance extreme metric density with visual calm.',
    problemStatement: 'Client portals (RNG Gamez, Fintech dashboards) displayed 24+ simultaneous metrics, causing user cognitive overload in traditional 3-column layouts.',
    keyFindings: [
      'Reduces dashboard cognitive scan time by 34% compared to uniform tables.',
      '1px subtle border highlights (#ffffff15) establish depth without artificial drop-shadow mud.',
      '16px rounded corners match macOS Sequoia and iOS 18 human interface guidelines.'
    ],
    designMeta: {
      colorPalette: [
        { name: 'Obsidian Void', hex: '#090d16', role: 'Main Canvas Background' },
        { name: 'Frosted Glass Card', hex: '#0f172a80', role: 'Container Surface' },
        { name: 'Neon Cyan Accent', hex: '#06b6d4', role: 'Primary CTAs & Active Glow' },
        { name: 'Champagne Gold', hex: '#d4af37', role: 'Executive Badges & Accents' }
      ],
      springPhysics: { stiffness: 400, damping: 28, mass: 0.8, latencyMs: '16ms' },
      wcagContrast: { ratio: '9.2 : 1', level: 'AAA', notes: 'Text #f8fafc on #090d16 passes WCAG AAA' },
      componentAnatomy: [
        'Outer Shell: 1px border with radial hover gradient',
        'Backdrop Blur: 16px Gaussian blur with 70% alpha fill',
        'Header Slot: 14px Semibold tracking-tight with icon badge',
        'Metric Block: 32px Tabular Black font for rapid scanning'
      ]
    },
    codeOrTokens: `/* Aeethod Signature Dark Glass Token */
.bento-glass-card {
  background: rgba(15, 23, 42, 0.70);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
  border-radius: 1rem;
}`,
    author: 'Elena Rostova (Lead Designer)',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-05'
  },
  {
    id: 'res_d02',
    title: 'Micro-Interaction Teardown: Sub-100ms Spring Physics Curve (Linear vs Stripe)',
    discipline: 'design',
    type: 'benchmark',
    status: 'validated',
    tags: ['Motion', 'Framer-Motion', 'Tactile', 'Springs', 'UX'],
    summary: 'Reverse-engineered the micro-interaction curves of Linear.app and Stripe to achieve sub-frame tactile feedback on active clicks.',
    problemStatement: 'Default CSS ease-in-out transitions feel synthetic and sluggish on interactive buttons, lowering perceived app speed.',
    keyFindings: [
      'Spring stiffness 420 with damping 26 eliminates rebound wobble while preserving instantaneous responsiveness.',
      'Active tap scale should never depress below 0.975 (0.95 feels broken or squishy to fingers).'
    ],
    designMeta: {
      springPhysics: { stiffness: 420, damping: 26, mass: 0.75, latencyMs: '12ms' },
      wcagContrast: { ratio: '11.4 : 1', level: 'AAA', notes: 'Button focus rings maintain 3px double offset' },
      componentAnatomy: [
        'Rest State: scale 1.0, shadow-sm',
        'Hover State: scale 1.015, translateY -1px, shadow-cyan-500/20',
        'Active Press: scale 0.98, translateY +0.5px'
      ]
    },
    codeOrTokens: `// Framer Motion Spring Configuration
export const tactileSpring = {
  type: "spring",
  stiffness: 420,
  damping: 26,
  mass: 0.75
};

// Component JSX: <motion.button whileTap={{ scale: 0.98 }} transition={tactileSpring} />`,
    author: 'Elena Rostova (Lead Designer)',
    createdAt: '2026-03-03',
    updatedAt: '2026-03-04'
  },

  // ── 2. CONTENT STRATEGY & COPY DECK (Reforge / Copyhackers Model) ──
  {
    id: 'res_c01',
    title: 'Content Blueprint: Problem-Agitate-Solution (PAS) High-Ticket Client Proposal',
    discipline: 'content',
    type: 'template',
    status: 'validated',
    tags: ['Copywriting', 'Pitch-Deck', 'Conversion', 'Discovery', 'PAS'],
    summary: 'A proven 3-stage copywriting architecture used to draft winning client proposals and landing page hero sections with 40%+ conversion.',
    problemStatement: 'Most technical agency proposals jump straight into tech specs (Next.js, Supabase) before quantifying the client\'s active financial leakage.',
    keyFindings: [
      'Quantifying financial leakage in Stage 2 (Agitate) anchors proposal ROI at 8x–12x before revealing fees.',
      'Proposals leading with PAS close at 62% vs 38% for feature-led engineering pitches.'
    ],
    contentMeta: {
      targetPersona: 'E-commerce Founders & Head of Product losing 30%+ checkout conversions on legacy Shopify Liquid themes.',
      pasFunnel: {
        problem: 'Your current monolithic checkout takes 4.2 seconds to render on mobile Safari, dropping 38% of card collectors on step 2.',
        agitate: 'At your current 150k monthly traffic, this leaks ~$24,000 every single month directly into the hands of TCGPlayer and TrollAndToad.',
        solution: 'Aeethod\'s Next.js 15 Sub-Second Headless Architecture renders in 650ms, recovering orders with 1-tap Apple Pay and 60-second instant buylist cashouts.'
      },
      seoKeywords: [
        { keyword: 'sell trading cards instant cashout', volume: '14,200 / mo', kd: 'KD 22', intent: 'Transactional' },
        { keyword: 'tcg buylist scanner app', volume: '9,800 / mo', kd: 'KD 18', intent: 'Commercial' },
        { keyword: 'how to bulk grade pokemon cards', volume: '22,400 / mo', kd: 'KD 29', intent: 'Informational' }
      ],
      headlineSnippet: '"Stop Leaking 38% of Card Buylists to Slow Mobile Checkouts."',
      callToAction: 'Book 30-Min Architecture Discovery Audit (Limited to 2 Clients/Month)'
    },
    codeOrTokens: `## [Aeethod PAS Proposal Template]
1. PROBLEM (Friction Point):
   "Your current checkout drops 38% of mobile buyers at step 2."
2. AGITATE (Annualized Financial Loss):
   "This leaks ~$288,000 annually to competitors with faster mobile experiences."
3. SOLUTION (Irreversible Architecture):
   "Aeethod Headless Next.js 15 Engine with 1-tap Apple Pay and instant Stripe payouts."`,
    author: 'Marcus Vance (Growth & Content)',
    createdAt: '2026-03-02',
    updatedAt: '2026-03-05'
  },
  {
    id: 'res_c02',
    title: 'SEO Cluster Teardown: High-Ticket Collectibles Programmatic Landing Pages',
    discipline: 'content',
    type: 'benchmark',
    status: 'validated',
    tags: ['SEO', 'Search-Intent', 'Keywords', 'Organic-Growth', 'pSEO'],
    summary: 'Identified 18 high-volume commercial keywords with low difficulty for TCG and luxury collectibles platforms.',
    problemStatement: 'Client needed organic search acquisition that bypassed bidding wars on generic "pokemon cards" head-terms.',
    keyFindings: [
      'Longtail "instant cashout" keywords have 14x higher transaction intent than general information queries.',
      'Programmatic SEO landing pages for each card set (e.g. /sell/lorcana-first-chapter) capture 8x more longtail traffic.'
    ],
    contentMeta: {
      targetPersona: 'Collectors holding $10k+ in card inventory seeking immediate liquidity.',
      seoKeywords: [
        { keyword: 'instant cash for trading cards near me', volume: '18,500 / mo', kd: 'KD 24', intent: 'Transactional' },
        { keyword: 'sell magic the gathering collection fast', volume: '12,100 / mo', kd: 'KD 21', intent: 'Transactional' },
        { keyword: 'tcg player buylist alternatives', volume: '6,400 / mo', kd: 'KD 15', intent: 'Commercial' }
      ],
      headlineSnippet: '"Cash Out Your Entire Card Binder in 60 Seconds Flat."',
      callToAction: 'Scan Your Binder with AI Camera'
    },
    author: 'Marcus Vance (Growth & Content)',
    createdAt: '2026-03-04',
    updatedAt: '2026-03-05'
  },

  // ── 3. FRONTEND ARCHITECTURE & SPIKE (Meta / Vercel Model) ──
  {
    id: 'res_f01',
    title: 'ADR-F01: Next.js 15 App Router & React Server Components (RSC) Architecture',
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
    keyFindings: [
      'Reduces initial client JS payload by 65% compared to Pages router.',
      'Streaming SSR with Suspense allows instant skeleton rendering while slow queries resolve.',
      'Server Actions eliminate the need for boilerplate /api route handlers.'
    ],
    frontendMeta: {
      coreWebVitals: { fcp: '0.65s', lcp: '1.1s', cls: '0.004', inp: '38ms' },
      bundleSize: { size: '48 KB', savingsPercent: '-65%', baseline: '142 KB' },
      frameworksCompared: [
        { name: 'Next.js 15 RSC', bundle: '48 KB', dxScore: '9.8 / 10', verdict: 'Standard Selected' },
        { name: 'Vite React SPA', bundle: '220 KB', dxScore: '9.0 / 10', verdict: 'No SSR/SEO' },
        { name: 'Remix v2 / RR7', bundle: '85 KB', dxScore: '8.5 / 10', verdict: 'Smaller ecosystem' }
      ]
    },
    codeOrTokens: `// Server Component with Direct DB Query & Suspense
import { Suspense } from 'react';
import { db } from '@/lib/db';

export default async function BuylistPage() {
  const cards = await db.cards.findMany({ take: 50 });
  return (
    <main className="max-w-6xl mx-auto p-6">
      <Suspense fallback={<SkeletonGrid />}>
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
    keyFindings: [
      'Zustand adds only 1.18 KB to the final bundle compared to Redux Toolkit\'s 11.8 KB (90% lighter).',
      'Selectors prevent full component tree re-renders during high-frequency live cart modifications.'
    ],
    frontendMeta: {
      coreWebVitals: { fcp: '0.58s', lcp: '0.92s', cls: '0.001', inp: '16ms' },
      bundleSize: { size: '1.18 KB', savingsPercent: '-90%', baseline: '11.8 KB' },
      frameworksCompared: [
        { name: 'Zustand', bundle: '1.18 KB', dxScore: '9.9 / 10', verdict: 'Winner' },
        { name: 'Jotai', bundle: '3.40 KB', dxScore: '8.8 / 10', verdict: 'Good for atoms' },
        { name: 'Redux Toolkit', bundle: '11.8 KB', dxScore: '7.5 / 10', verdict: 'Too bloated' }
      ]
    },
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

  // ── 4. BACKEND ARCHITECTURE & ADR (AWS / Google / Supabase Model) ──
  {
    id: 'res_b01',
    title: 'ADR-B01: Supabase Managed Postgres with Row-Level Security (RLS) Policy',
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
    keyFindings: [
      'RLS policies enforce multi-tenant isolation at the database kernel level, eliminating app-level authorization leakage.',
      'Dev setup drops from 4 days to 15 minutes.'
    ],
    backendMeta: {
      architectureTopology: 'Cloudflare Edge CDN ➔ Next.js Server Actions ➔ Supabase PgBouncer (Pooler) ➔ PostgreSQL 16 Kernel',
      databaseSchemaSql: `-- Secure Multi-Tenant RLS Policy
ALTER TABLE client_buylists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own buylists"
ON client_buylists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access"
ON client_buylists FOR ALL
USING (auth.jwt() ->> 'role' = 'agency_admin');`,
      rlsSecurityPolicy: 'Active: Strict Kernel-Level Tenant Isolation via auth.uid()',
      apiEndpoints: [
        { method: 'POST', path: '/api/v1/buylist/submit', latency: '24ms', auth: 'Bearer JWT' },
        { method: 'GET', path: '/api/v1/catalog/live-prices', latency: '12ms', auth: 'Public Edge Cache' }
      ],
      tradeoffsEvaluated: [
        { option: 'Supabase Postgres', pros: 'Open source, pgvector, built-in RLS', cons: 'Complex stored procs', status: 'Chosen' },
        { option: 'AWS RDS Postgres', pros: 'Infinitely scalable', cons: '$150/mo baseline, heavy setup', status: 'Rejected' },
        { option: 'Google Firestore', pros: 'Fast prototypes', cons: 'No joins, proprietary API', status: 'Rejected' }
      ]
    },
    codeOrTokens: `-- Supabase RLS Migration
ALTER TABLE client_buylists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_isolation" ON client_buylists
FOR ALL USING (auth.uid() = user_id);`,
    author: 'Devon Miles (Backend Lead)',
    createdAt: '2026-02-25',
    updatedAt: '2026-03-01'
  },
  {
    id: 'res_b02',
    title: 'Spike: Stripe Connect Custom Accounts for 60-Second Instant Debit Payouts',
    discipline: 'backend',
    type: 'spike',
    status: 'validated',
    tags: ['Stripe', 'Fintech', 'Payouts', 'Webhooks', 'Idempotency'],
    summary: 'Evaluated Stripe Connect Custom Accounts vs Express to facilitate instant debit card cashouts for card buylist sellers.',
    problemStatement: 'Sellers demand instant cashouts (<60s) to their debit cards instead of waiting 2-3 business days for ACH bank transfers.',
    keyFindings: [
      'Stripe Instant Payouts push funds to debit cards in ~45 seconds via Visa Direct / Mastercard Send.',
      'Webhook processing requires Redis distributed locks with idempotency keys to prevent double-spending.'
    ],
    backendMeta: {
      architectureTopology: 'Stripe Webhooks ➔ HMAC Validation ➔ Upstash Redis Idempotency Lock ➔ PostgreSQL Transaction',
      apiEndpoints: [
        { method: 'POST', path: '/api/payouts/instant-debit', latency: '45s arrival', auth: 'Stripe Secret Key' },
        { method: 'POST', path: '/webhooks/stripe', latency: '18ms', auth: 'Stripe-Signature' }
      ],
      tradeoffsEvaluated: [
        { option: 'Stripe Instant Payouts', pros: '45s arrival, 100% debit coverage', cons: '1% fee ($0.50 min)', status: 'Chosen' },
        { option: 'Standard ACH Transfer', pros: 'Zero fee', cons: '3-5 business days delay', status: 'Rejected' }
      ]
    },
    codeOrTokens: `// Idempotent Stripe Instant Payout
const payout = await stripe.payouts.create({
  amount: 25000, // $250.00
  currency: 'usd',
  method: 'instant',
  destination: cardId,
}, {
  idempotencyKey: \`payout_\${orderId}\`
});`,
    author: 'Devon Miles (Backend Lead)',
    createdAt: '2026-03-04',
    updatedAt: '2026-03-05'
  }
];

// ── 4 BLUEPRINT TEMPLATES CATALOG ──────────────────────────────────────────

export interface TemplateBlueprint {
  id: string;
  discipline: 'design' | 'content' | 'frontend' | 'backend';
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  accentColor: string;
  description: string;
  keyFields: string[];
  sampleTitle: string;
  sampleSummary: string;
  initialTags: string;
}

const TEMPLATES_CATALOG: TemplateBlueprint[] = [
  {
    id: 'template_design',
    discipline: 'design',
    title: 'Design Spec & Micro-Interaction Template',
    subtitle: 'Apple & Stripe HIG Standard',
    badge: 'DESIGN SPEC',
    icon: Palette,
    accentColor: 'border-pink-500/50 text-pink-400 bg-pink-950/20',
    description: 'Structured layout for UI component anatomy, color token palettes, spring physics curves (stiffness/damping), and WCAG AAA accessibility scores.',
    keyFields: ['Component Anatomy Slots', 'Color Palette & Hex Roles', 'Spring Physics (stiffness, damping)', 'WCAG Contrast Verification'],
    sampleTitle: 'Design Spec: [Component Name] Layout & Spring Tokens',
    sampleSummary: 'Design specification detailing component hierarchy, tactile feedback curves, and accessibility compliance.',
    initialTags: 'Design-Tokens, Spring-Physics, WCAG, UI-System'
  },
  {
    id: 'template_content',
    discipline: 'content',
    title: 'Content Strategy & PAS Copywriting Deck',
    subtitle: 'Reforge & Copyhackers Standard',
    badge: 'COPY DECK',
    icon: FileText,
    accentColor: 'border-amber-500/50 text-amber-400 bg-amber-950/20',
    description: 'High-converting copywriting template organized around Problem-Agitate-Solution (PAS), Target Persona, SEO Search Intent volume, and Hero CTAs.',
    keyFields: ['Target Customer Persona', 'PAS 3-Stage Copy Funnel', 'SEO Keywords & Monthly Volumes', 'Headline Hook & Call-To-Action'],
    sampleTitle: 'Content Architecture: PAS Pitch Deck & SEO Cluster for [Niche]',
    sampleSummary: 'High-conversion copywriting model quantifying client problem, financial agitation, and solution hooks.',
    initialTags: 'Copywriting, PAS, SEO-Cluster, Conversion, Pitch-Deck'
  },
  {
    id: 'template_frontend',
    discipline: 'frontend',
    title: 'Frontend Architecture & Spike RFC',
    subtitle: 'Meta & Vercel Performance Standard',
    badge: 'FRONTEND RFC',
    icon: Code2,
    accentColor: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/20',
    description: 'Engineering RFC template designed for Next.js 15 RSC, Core Web Vitals budgets (FCP/LCP/CLS), bundle size benchmarks, and copyable component boilerplate.',
    keyFields: ['Core Web Vitals Targets (FCP, LCP)', 'Bundle Size Limits & Gzip Diff', 'Framework Matrix Comparison', 'Server Component Boilerplate'],
    sampleTitle: 'ADR-F0X: [Architecture / Library Adoption] Benchmark & Implementation',
    sampleSummary: 'Frontend technical evaluation focusing on Sub-second Core Web Vitals, JS payload reduction, and state architecture.',
    initialTags: 'Next.js-15, React-19, Performance, CoreWebVitals, State'
  },
  {
    id: 'template_backend',
    discipline: 'backend',
    title: 'Backend Architecture & Database Security ADR',
    subtitle: 'AWS & Supabase Infrastructure Standard',
    badge: 'BACKEND ADR',
    icon: Database,
    accentColor: 'border-purple-500/50 text-purple-400 bg-purple-950/20',
    description: 'Mission-critical architectural decision record covering PostgreSQL schemas, Row-Level Security (RLS) policies, API endpoints latency, and webhook idempotency.',
    keyFields: ['Architecture Topology Flow', 'PostgreSQL Schema & RLS Policies', 'API Latency Benchmarks', 'Trade-offs & Alternatives Matrix'],
    sampleTitle: 'ADR-B0X: [Database / Service] Architecture & RLS Security Standard',
    sampleSummary: 'Backend architectural decision establishing database isolation, API contracts, and high-throughput data pipelines.',
    initialTags: 'Supabase, PostgreSQL, RLS, Security, APIs, Webhooks'
  }
];

// ── COMPONENT ──────────────────────────────────────────────────────────────

export default function ResearchModal({ isOpen, onClose, agencyManager }: ResearchModalProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'knowledge_base' | 'templates_hub' | 'new_entry' | 'cloud_calc'>('knowledge_base');
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Persistence
  const [entries, setEntries] = useState<ResearchEntry[]>(() => {
    try {
      const saved = localStorage.getItem('aeethod_research_entries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_RESEARCH_ENTRIES;
  });

  useEffect(() => {
    localStorage.setItem('aeethod_research_entries', JSON.stringify(entries));
  }, [entries]);

  // Form State
  const [formDiscipline, setFormDiscipline] = useState<'design' | 'content' | 'frontend' | 'backend'>('frontend');
  const [formType, setFormType] = useState<ResearchType>('adr');
  const [formStatus, setFormStatus] = useState<ResearchStatus>('validated');
  const [formTitle, setFormTitle] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formProblem, setFormProblem] = useState('');
  const [formFindings, setFormFindings] = useState('');
  const [formCode, setFormCode] = useState('');

  // Design-specific Form Fields
  const [formDesignColors, setFormDesignColors] = useState('#090d16 (Obsidian Void), #0f172a (Frosted Glass), #06b6d4 (Neon Cyan)');
  const [formSpringStiffness, setFormSpringStiffness] = useState(400);
  const [formSpringDamping, setFormSpringDamping] = useState(28);
  const [formWcagRatio, setFormWcagRatio] = useState('8.4 : 1 (AAA Pass)');

  // Content-specific Form Fields
  const [formPersona, setFormPersona] = useState('');
  const [formPasProblem, setFormPasProblem] = useState('');
  const [formPasAgitate, setFormPasAgitate] = useState('');
  const [formPasSolution, setFormPasSolution] = useState('');
  const [formHeadline, setFormHeadline] = useState('');
  const [formCta, setFormCta] = useState('');

  // Frontend-specific Form Fields
  const [formFcp, setFormFcp] = useState('0.65s');
  const [formLcp, setFormLcp] = useState('1.10s');
  const [formBundleSize, setFormBundleSize] = useState('48 KB');

  // Backend-specific Form Fields
  const [formTopology, setFormTopology] = useState('Edge CDN ➔ Vercel Server Actions ➔ Supabase PgBouncer ➔ PostgreSQL 16');
  const [formRlsPolicy, setFormRlsPolicy] = useState('ALTER TABLE client_data ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "user_isolation" ON client_data FOR ALL USING (auth.uid() = user_id);');

  // Interactive UI State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isCasting, setIsCasting] = useState(false);
  const [springTestActive, setSpringTestActive] = useState(false);
  const [knowledgePoints, setKnowledgePoints] = useState(() => {
    return agencyManager?.state.resources.knowledge || 1450;
  });

  // Cloud Calculator State
  const [monthlyUsers, setMonthlyUsers] = useState(150000);

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

  const handleResetToFactoryStandards = () => {
    setEntries(INITIAL_RESEARCH_ENTRIES);
    localStorage.setItem('aeethod_research_entries', JSON.stringify(INITIAL_RESEARCH_ENTRIES));
    setSelectedEntryId(INITIAL_RESEARCH_ENTRIES[0].id);
    triggerToast('🔄 Re-seeded Knowledge Base with Big Tech Reference Standards!');
  };

  const handleApplyBlueprint = (blueprint: TemplateBlueprint) => {
    setFormDiscipline(blueprint.discipline);
    setFormType(blueprint.discipline === 'design' ? 'teardown' : blueprint.discipline === 'content' ? 'template' : 'adr');
    setFormTitle(blueprint.sampleTitle);
    setFormSummary(blueprint.sampleSummary);
    setFormTags(blueprint.initialTags);

    if (blueprint.discipline === 'design') {
      setFormProblem('UI density causing cognitive overload; lack of standardized spring tactile response.');
      setFormFindings('Reduces cognitive scan time by 34%\nSpring curve stiffness: 400 with damping: 28\nWCAG AAA compliance verified');
      setFormDesignColors('#090d16 (Obsidian Void), #0f172a (Frosted Glass), #06b6d4 (Neon Cyan), #d4af37 (Gold)');
      setFormSpringStiffness(400);
      setFormSpringDamping(28);
      setFormWcagRatio('9.2 : 1 (AAA Pass)');
      setFormCode(`/* Design Tokens */\n--bg-canvas: #090d16;\n--glass-card: rgba(15, 23, 42, 0.70);\n--accent-cyan: #06b6d4;`);
    } else if (blueprint.discipline === 'content') {
      setFormProblem('Client losing 38% checkout conversions due to lack of quantified ROI in proposal.');
      setFormPersona('High-ticket store owners holding $50k+ inventory seeking instant liquidity.');
      setFormPasProblem('Mobile users drop 38% at checkout due to slow load times.');
      setFormPasAgitate('This leaks ~$24,000 every single month directly to competitors.');
      setFormPasSolution('Aeethod Sub-second Headless Engine with 1-tap Apple Pay and 60-sec cashouts.');
      setFormHeadline('"Stop Leaking 38% of Buylists to Slow Mobile Checkouts."');
      setFormCta('Book 30-Min Architecture Discovery Audit');
      setFormFindings('PAS structure lifts proposal close rates from 38% to 62%\nCommercial intent search volume: 18,500/mo');
    } else if (blueprint.discipline === 'frontend') {
      setFormProblem('Legacy client-side SPA suffers from 500KB JS bundle and 3.8s mobile LCP.');
      setFormFcp('0.65s');
      setFormLcp('1.10s');
      setFormBundleSize('48 KB (-65%)');
      setFormFindings('Cuts initial JS payload by 65%\nStreaming SSR skeleton renders in under 200ms\nZero layout shift (CLS: 0.004)');
      setFormCode(`// React 19 RSC Standard\nimport { Suspense } from 'react';\nexport default async function Page() {\n  const data = await fetchFeed();\n  return <Suspense fallback={<Skeleton />}><Feed data={data} /></Suspense>;\n}`);
    } else if (blueprint.discipline === 'backend') {
      setFormProblem('Managing self-hosted PostgreSQL instances creates high DevOps maintenance and security risk.');
      setFormTopology('Cloudflare Edge ➔ Next.js Server Actions ➔ Supabase PgBouncer ➔ PostgreSQL 16');
      setFormRlsPolicy(`ALTER TABLE client_buylists ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "user_isolation" ON client_buylists FOR ALL USING (auth.uid() = user_id);`);
      setFormFindings('Kernel-level tenant isolation with zero auth bypass\nSetup velocity: 15 minutes vs 4 days manual RDS\nSub-25ms average database latency');
      setFormCode(`-- Multi-Tenant RLS Policy\nALTER TABLE accounts ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "tenant_guard" ON accounts FOR ALL USING (auth.uid() = owner_id);`);
    }

    setActiveTab('new_entry');
    triggerToast(`⚡ Loaded "${blueprint.title}" into creation studio!`);
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
      keyFindings: formFindings ? formFindings.split('\n').map(f => f.trim()).filter(Boolean) : ['Research completed.'],
      codeOrTokens: formCode.trim() || undefined,
      author: 'You (Aeethod Strategy)',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],

      // Attach discipline-specific metadata
      ...(formDiscipline === 'design' && {
        designMeta: {
          colorPalette: formDesignColors.split(',').map(c => {
            const parts = c.trim().split(' ');
            return { hex: parts[0] || '#06b6d4', name: parts.slice(1).join(' ').replace(/[()]/g, '') || 'Token', role: 'Theme Color' };
          }),
          springPhysics: { stiffness: formSpringStiffness, damping: formSpringDamping, mass: 0.8, latencyMs: '16ms' },
          wcagContrast: { ratio: formWcagRatio, level: 'AAA' }
        }
      }),
      ...(formDiscipline === 'content' && {
        contentMeta: {
          targetPersona: formPersona || undefined,
          pasFunnel: formPasProblem ? { problem: formPasProblem, agitate: formPasAgitate, solution: formPasSolution } : undefined,
          headlineSnippet: formHeadline || undefined,
          callToAction: formCta || undefined
        }
      }),
      ...(formDiscipline === 'frontend' && {
        frontendMeta: {
          coreWebVitals: { fcp: formFcp, lcp: formLcp, cls: '0.005', inp: '32ms' },
          bundleSize: { size: formBundleSize }
        }
      }),
      ...(formDiscipline === 'backend' && {
        backendMeta: {
          architectureTopology: formTopology || undefined,
          rlsSecurityPolicy: formRlsPolicy || undefined
        }
      })
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

    triggerToast('🎉 New Custom Research Entry logged! (+100 KP)');
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    if (selectedEntryId === id) setSelectedEntryId(null);
    triggerToast('🗑️ Research entry archived.');
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

  // Cloud Calculator
  const vercelCost = monthlyUsers < 50000 ? 20 : Math.round(20 + ((monthlyUsers - 50000) / 10000) * 4);
  const supabaseCost = monthlyUsers < 100000 ? 25 : Math.round(25 + ((monthlyUsers - 100000) / 25000) * 10);
  const cloudflareCost = Math.round(5 + (monthlyUsers / 50000) * 3);
  const totalCloudCost = vercelCost + supabaseCost + cloudflareCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[90vh] flex flex-col rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-slate-700/80 shadow-2xl overflow-hidden font-sans">
        
        {/* Radiant Top Glow */}
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
                  BIG TECH RESEARCH TAXONOMY
                </span>
                {isCasting && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-950 text-amber-300 border border-amber-600 animate-pulse">
                    <Cast className="w-3 h-3" /> CASTING TO 85" SCREEN
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Plan & Meeting Room Terminal • Design, Content, Frontend & Backend Standards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Reset / Reseed Button */}
            <button
              onClick={handleResetToFactoryStandards}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition-colors"
              title="Reset knowledge base to default Big Tech reference entries"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Reset Standards
            </button>

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
              onClick={() => setActiveTab('templates_hub')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
                activeTab === 'templates_hub'
                  ? 'border-indigo-400 text-indigo-300 font-bold bg-indigo-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              Big Tech Templates Hub ({TEMPLATES_CATALOG.length})
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
              + Create Research Entry
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
            DB Status: LocalStorage + Boardroom Sync Active
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
                      {['all', 'adr', 'spike', 'teardown', 'benchmark', 'template'].map(t => (
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

                          <div className="text-xs font-bold text-white line-clamp-1">
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

              {/* RIGHT MAIN PANEL: Document Reader with Discipline-Tailored Visuals */}
              <div className="flex-1 flex flex-col overflow-y-auto bg-slate-900/30 p-6 space-y-6">
                {selectedEntry ? (
                  <div className="space-y-6 max-w-3xl">
                    
                    {/* Header Details */}
                    <div className="space-y-2 border-b border-slate-800 pb-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
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

                    {/* ── DISCIPLINE SPECIALIZATION 1: DESIGN SPEC WIDGETS ── */}
                    {selectedEntry.discipline === 'design' && selectedEntry.designMeta && (
                      <div className="space-y-4 p-4 rounded-xl bg-pink-950/10 border border-pink-900/30">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Palette className="w-4 h-4 text-pink-400" /> Design Tokens & Tactile Spec
                          </h3>
                          {selectedEntry.designMeta.wcagContrast && (
                            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                              WCAG {selectedEntry.designMeta.wcagContrast.level} ({selectedEntry.designMeta.wcagContrast.ratio})
                            </span>
                          )}
                        </div>

                        {/* Color Palette Swatches */}
                        {selectedEntry.designMeta.colorPalette && (
                          <div className="grid grid-cols-2 gap-2">
                            {selectedEntry.designMeta.colorPalette.map((col, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleCopy(col.hex, `Copied ${col.hex}`)}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-pink-500/50 transition-colors text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-md border border-white/20 shadow-inner" style={{ backgroundColor: col.hex.substring(0, 7) }} />
                                  <div>
                                    <div className="text-xs font-bold text-white">{col.name}</div>
                                    <div className="text-[10px] text-slate-400">{col.role}</div>
                                  </div>
                                </div>
                                <span className="text-[11px] font-mono text-cyan-300">{col.hex}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Interactive Spring Physics Simulation */}
                        {selectedEntry.designMeta.springPhysics && (
                          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-pink-400" /> Spring Motion Configuration
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Stiffness: <strong>{selectedEntry.designMeta.springPhysics.stiffness}</strong> • Damping: <strong>{selectedEntry.designMeta.springPhysics.damping}</strong> • Mass: <strong>{selectedEntry.designMeta.springPhysics.mass}</strong>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSpringTestActive(true);
                                setTimeout(() => setSpringTestActive(false), 450);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-transform duration-300 ${
                                springTestActive
                                  ? 'scale-90 bg-pink-500 text-white'
                                  : 'bg-slate-800 text-pink-300 hover:bg-slate-700'
                              }`}
                            >
                              <MousePointerClick className="w-3.5 h-3.5 inline mr-1" /> Test Spring
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── DISCIPLINE SPECIALIZATION 2: CONTENT & COPY FUNNEL WIDGETS ── */}
                    {selectedEntry.discipline === 'content' && selectedEntry.contentMeta && (
                      <div className="space-y-4 p-4 rounded-xl bg-amber-950/10 border border-amber-900/30">
                        <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-amber-400" /> Problem-Agitate-Solution (PAS) Architecture
                        </h3>

                        {selectedEntry.contentMeta.targetPersona && (
                          <div className="text-xs text-slate-300 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="font-bold text-amber-400">Target Persona: </span>
                            {selectedEntry.contentMeta.targetPersona}
                          </div>
                        )}

                        {selectedEntry.contentMeta.pasFunnel && (
                          <div className="space-y-2">
                            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/40 text-xs">
                              <span className="font-bold text-rose-400 uppercase text-[10px] block">1. Problem (The Friction):</span>
                              <p className="text-slate-200 mt-1">{selectedEntry.contentMeta.pasFunnel.problem}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/40 text-xs">
                              <span className="font-bold text-amber-400 uppercase text-[10px] block">2. Agitate (The Annualized Bleed):</span>
                              <p className="text-slate-200 mt-1">{selectedEntry.contentMeta.pasFunnel.agitate}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-xs">
                              <span className="font-bold text-emerald-400 uppercase text-[10px] block">3. Solution (Aeethod Architecture):</span>
                              <p className="text-slate-200 mt-1">{selectedEntry.contentMeta.pasFunnel.solution}</p>
                            </div>
                          </div>
                        )}

                        {/* SEO Keyword Cluster Table */}
                        {selectedEntry.contentMeta.seoKeywords && (
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-slate-300 uppercase">Target Commercial Keyword Cluster</div>
                            <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-900 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                                  <tr>
                                    <th className="p-2">Target Keyword</th>
                                    <th className="p-2">Monthly Vol</th>
                                    <th className="p-2">Difficulty</th>
                                    <th className="p-2">Search Intent</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                  {selectedEntry.contentMeta.seoKeywords.map((kw, kIdx) => (
                                    <tr key={kIdx} className="hover:bg-slate-900/40">
                                      <td className="p-2 font-mono text-cyan-300">{kw.keyword}</td>
                                      <td className="p-2 font-semibold text-white">{kw.volume}</td>
                                      <td className="p-2 text-emerald-400">{kw.kd}</td>
                                      <td className="p-2">
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                                          {kw.intent}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {selectedEntry.contentMeta.headlineSnippet && (
                          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] uppercase font-bold text-amber-400">Winning Copy Hook</div>
                              <div className="text-xs font-semibold text-white mt-0.5">{selectedEntry.contentMeta.headlineSnippet}</div>
                            </div>
                            <button
                              onClick={() => handleCopy(selectedEntry.contentMeta?.headlineSnippet!, 'Headline copied!')}
                              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                            >
                              <Copy className="w-3.5 h-3.5" /> Copy
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── DISCIPLINE SPECIALIZATION 3: FRONTEND CORE WEB VITALS ── */}
                    {selectedEntry.discipline === 'frontend' && selectedEntry.frontendMeta && (
                      <div className="space-y-4 p-4 rounded-xl bg-cyan-950/10 border border-cyan-900/30">
                        <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Code2 className="w-4 h-4 text-cyan-400" /> Core Web Vitals & Bundle Overhead
                        </h3>

                        {selectedEntry.frontendMeta.coreWebVitals && (
                          <div className="grid grid-cols-4 gap-2">
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                              <div className="text-[10px] text-slate-400 uppercase font-mono">FCP</div>
                              <div className="text-base font-black text-emerald-400 mt-0.5">{selectedEntry.frontendMeta.coreWebVitals.fcp}</div>
                              <div className="text-[9px] text-slate-500">Sub-second</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                              <div className="text-[10px] text-slate-400 uppercase font-mono">LCP</div>
                              <div className="text-base font-black text-emerald-400 mt-0.5">{selectedEntry.frontendMeta.coreWebVitals.lcp}</div>
                              <div className="text-[9px] text-slate-500">Mobile Safari</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                              <div className="text-[10px] text-slate-400 uppercase font-mono">CLS</div>
                              <div className="text-base font-black text-emerald-400 mt-0.5">{selectedEntry.frontendMeta.coreWebVitals.cls}</div>
                              <div className="text-[9px] text-slate-500">Zero shift</div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                              <div className="text-[10px] text-slate-400 uppercase font-mono">INP</div>
                              <div className="text-base font-black text-emerald-400 mt-0.5">{selectedEntry.frontendMeta.coreWebVitals.inp}</div>
                              <div className="text-[9px] text-slate-500">Instant tap</div>
                            </div>
                          </div>
                        )}

                        {selectedEntry.frontendMeta.bundleSize && (
                          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-white">Initial JavaScript Bundle Payload</div>
                              <div className="text-[11px] text-slate-400">Optimized client-side footprint</div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-cyan-400">{selectedEntry.frontendMeta.bundleSize.size}</span>
                              {selectedEntry.frontendMeta.bundleSize.savingsPercent && (
                                <span className="ml-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                                  {selectedEntry.frontendMeta.bundleSize.savingsPercent}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── DISCIPLINE SPECIALIZATION 4: BACKEND ARCHITECTURE & RLS ── */}
                    {selectedEntry.discipline === 'backend' && selectedEntry.backendMeta && (
                      <div className="space-y-4 p-4 rounded-xl bg-purple-950/10 border border-purple-900/30">
                        <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Database className="w-4 h-4 text-purple-400" /> Architecture Topology & Database Security
                        </h3>

                        {selectedEntry.backendMeta.architectureTopology && (
                          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                            <span className="text-[10px] font-bold text-purple-400 uppercase block mb-1">Data Pipeline Flow:</span>
                            <div className="p-2 rounded bg-slate-900/80 font-mono text-cyan-300 text-[11px]">
                              {selectedEntry.backendMeta.architectureTopology}
                            </div>
                          </div>
                        )}

                        {selectedEntry.backendMeta.rlsSecurityPolicy && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" /> PostgreSQL Row-Level Security (RLS)
                              </span>
                              <button
                                onClick={() => handleCopy(selectedEntry.backendMeta?.rlsSecurityPolicy!, 'SQL policy copied!')}
                                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                              >
                                <Copy className="w-3.5 h-3.5" /> Copy Policy
                              </button>
                            </div>
                            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                              {selectedEntry.backendMeta.rlsSecurityPolicy}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Problem Statement */}
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

                    {/* Key Findings */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-cyan-400" /> Core Empirical Findings
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

                    {/* Code Snippet / Tokens (if any) */}
                    {selectedEntry.codeOrTokens && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Code2 className="w-4 h-4 text-cyan-400" /> Code / CSS Tokens / SQL Migration
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

          {/* ════ VIEW 2: BIG TECH TEMPLATES HUB (GALLERY & BLUEPRINTS) ════ */}
          {activeTab === 'templates_hub' && (
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40">
              <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-900/50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white tracking-wide uppercase">
                        Big Tech Research Blueprints
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700">
                        PRODUCTION TESTED
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                      Each discipline utilizes a fundamentally distinct architecture schema. Select any blueprint to populate the creation studio with discipline-tailored inputs.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400">4 Core Disciplines</span>
                    <div className="text-xs text-emerald-400 font-mono font-bold">+100 KP / entry</div>
                  </div>
                </div>

                {/* 4 Specialized Blueprints Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {TEMPLATES_CATALOG.map(bp => {
                    const IconComponent = bp.icon;

                    return (
                      <div
                        key={bp.id}
                        className={`flex flex-col justify-between p-5 rounded-2xl bg-slate-900/80 border transition-all hover:shadow-xl hover:scale-[1.01] ${bp.accentColor}`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                              {bp.badge}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">{bp.subtitle}</span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <h4 className="text-sm font-bold text-white">{bp.title}</h4>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {bp.description}
                          </p>

                          {/* Key Fields Checklist */}
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Specialized Fields:
                            </span>
                            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                              {bp.keyFields.map((f, fIdx) => (
                                <div key={fIdx} className="flex items-center gap-1 text-slate-400">
                                  <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0" />
                                  <span className="truncate">{f}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">Tags: #{bp.initialTags.split(',')[0]}</span>
                          <button
                            onClick={() => handleApplyBlueprint(bp)}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 shadow-md transition-transform active:scale-95"
                          >
                            Use This Blueprint <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          )}

          {/* ════ VIEW 3: DYNAMIC RESEARCH ENTRY CREATION FORM ════ */}
          {activeTab === 'new_entry' && (
            <div className="flex-1 overflow-y-auto p-6 bg-slate-900/20">
              <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Discipline Selector Header */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-400" /> Log Big Tech Research Document
                      </h3>
                      <p className="text-xs text-slate-400">
                        Input fields dynamically calibrate to match the selected engineering discipline.
                      </p>
                    </div>

                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
                      REWARDS +100 KP
                    </span>
                  </div>

                  {/* Discipline Tab Buttons */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setFormDiscipline('design')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        formDiscipline === 'design'
                          ? 'bg-pink-950/40 border-pink-500 text-pink-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Palette className="w-4 h-4 mb-1 text-pink-400" />
                      <div className="text-xs font-bold">1. Design Spec</div>
                      <div className="text-[10px] text-slate-500">UI & Spring Tokens</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormDiscipline('content')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        formDiscipline === 'content'
                          ? 'bg-amber-950/40 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-4 h-4 mb-1 text-amber-400" />
                      <div className="text-xs font-bold">2. Content Deck</div>
                      <div className="text-[10px] text-slate-500">PAS & SEO Strategy</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormDiscipline('frontend')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        formDiscipline === 'frontend'
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Code2 className="w-4 h-4 mb-1 text-cyan-400" />
                      <div className="text-xs font-bold">3. Frontend RFC</div>
                      <div className="text-[10px] text-slate-500">Web Vitals & Bundle</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormDiscipline('backend')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        formDiscipline === 'backend'
                          ? 'bg-purple-950/40 border-purple-500 text-purple-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Database className="w-4 h-4 mb-1 text-purple-400" />
                      <div className="text-xs font-bold">4. Backend ADR</div>
                      <div className="text-[10px] text-slate-500">RLS & Data Pipeline</div>
                    </button>
                  </div>
                </div>

                {/* The Dynamic Form */}
                <form onSubmit={handleCreateEntry} className="space-y-4">
                  
                  {/* Common: Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Research Document Title *
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      placeholder="e.g. Design Spec: Bento Grid with 16px Spring Blur"
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Common: Format, Status, Tags */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Document Format</label>
                      <select
                        value={formType}
                        onChange={e => setFormType(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="adr">ADR (Architecture Record)</option>
                        <option value="spike">Spike / Benchmark</option>
                        <option value="teardown">Teardown / Analysis</option>
                        <option value="template">Reusable Template</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Status</label>
                      <select
                        value={formStatus}
                        onChange={e => setFormStatus(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="validated">Validated (Production Standard)</option>
                        <option value="evaluating">Evaluating (In Progress)</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Tags (Comma separated)</label>
                      <input
                        type="text"
                        value={formTags}
                        onChange={e => setFormTags(e.target.value)}
                        placeholder="e.g. Tokens, Motion, WCAG"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Common: Executive Summary */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Executive Summary (2-sentence takeaway)
                    </label>
                    <textarea
                      rows={2}
                      value={formSummary}
                      onChange={e => setFormSummary(e.target.value)}
                      placeholder="High-level engineering takeaway and measurable business impact."
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                    />
                  </div>

                  {/* ════════ DYNAMIC DISCIPLINE FIELDS ════════ */}

                  {/* DESIGN-SPECIFIC FIELDS */}
                  {formDiscipline === 'design' && (
                    <div className="p-4 rounded-xl bg-pink-950/20 border border-pink-800/40 space-y-3">
                      <div className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Palette className="w-4 h-4" /> Design System Tokens & Spatial Specs
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Color Palette Tokens (Hex and Name)
                        </label>
                        <input
                          type="text"
                          value={formDesignColors}
                          onChange={e => setFormDesignColors(e.target.value)}
                          placeholder="#090d16 (Obsidian Void), #06b6d4 (Neon Cyan)"
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Spring Stiffness</label>
                          <input
                            type="number"
                            value={formSpringStiffness}
                            onChange={e => setFormSpringStiffness(Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Spring Damping</label>
                          <input
                            type="number"
                            value={formSpringDamping}
                            onChange={e => setFormSpringDamping(Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">WCAG AAA Contrast</label>
                          <input
                            type="text"
                            value={formWcagRatio}
                            onChange={e => setFormWcagRatio(e.target.value)}
                            placeholder="9.2 : 1 (Pass)"
                            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CONTENT-SPECIFIC FIELDS */}
                  {formDiscipline === 'content' && (
                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-3">
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4" /> PAS Funnel & Copywriting Architecture
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Persona</label>
                        <input
                          type="text"
                          value={formPersona}
                          onChange={e => setFormPersona(e.target.value)}
                          placeholder="e.g. E-commerce founders losing 35%+ mobile conversions"
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={formPasProblem}
                          onChange={e => setFormPasProblem(e.target.value)}
                          placeholder="1. PROBLEM: What exact friction is causing user bounce?"
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-rose-300"
                        />
                        <input
                          type="text"
                          value={formPasAgitate}
                          onChange={e => setFormPasAgitate(e.target.value)}
                          placeholder="2. AGITATE: What is the annualized revenue loss from that friction?"
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-amber-300"
                        />
                        <input
                          type="text"
                          value={formPasSolution}
                          onChange={e => setFormPasSolution(e.target.value)}
                          placeholder="3. SOLUTION: How does Aeethod architecture permanently fix it?"
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-emerald-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Winning Headline Hook</label>
                          <input
                            type="text"
                            value={formHeadline}
                            onChange={e => setFormHeadline(e.target.value)}
                            placeholder='"Stop leaking 38% of orders to slow checkouts."'
                            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Primary Call to Action</label>
                          <input
                            type="text"
                            value={formCta}
                            onChange={e => setFormCta(e.target.value)}
                            placeholder="Book 30-Min Architecture Discovery Audit"
                            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FRONTEND-SPECIFIC FIELDS */}
                  {formDiscipline === 'frontend' && (
                    <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-3">
                      <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Code2 className="w-4 h-4" /> Core Web Vitals Targets & Bundle Budgets
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target FCP (First Contentful)</label>
                          <input
                            type="text"
                            value={formFcp}
                            onChange={e => setFormFcp(e.target.value)}
                            placeholder="0.65s"
                            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target LCP (Largest Paint)</label>
                          <input
                            type="text"
                            value={formLcp}
                            onChange={e => setFormLcp(e.target.value)}
                            placeholder="1.10s"
                            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">JS Bundle Overhead</label>
                          <input
                            type="text"
                            value={formBundleSize}
                            onChange={e => setFormBundleSize(e.target.value)}
                            placeholder="48 KB (-65%)"
                            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BACKEND-SPECIFIC FIELDS */}
                  {formDiscipline === 'backend' && (
                    <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-3">
                      <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Database className="w-4 h-4" /> System Topology & Row-Level Security
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Data Flow Architecture</label>
                        <input
                          type="text"
                          value={formTopology}
                          onChange={e => setFormTopology(e.target.value)}
                          placeholder="Edge CDN ➔ Server Actions ➔ Supabase PgBouncer ➔ PostgreSQL 16"
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">PostgreSQL RLS Policy (SQL)</label>
                        <textarea
                          rows={2}
                          value={formRlsPolicy}
                          onChange={e => setFormRlsPolicy(e.target.value)}
                          placeholder="CREATE POLICY user_isolation ON ..."
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-emerald-300 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Common: Problem Statement */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Context & Problem Statement
                    </label>
                    <textarea
                      rows={2}
                      value={formProblem}
                      onChange={e => setFormProblem(e.target.value)}
                      placeholder="What technical bottleneck or business obstacle forced this research?"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                    />
                  </div>

                  {/* Common: Key Findings */}
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

                  {/* Common: Code Snippet / Tokens */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Starter Code / CSS Tokens / SQL Schema (Optional)
                    </label>
                    <textarea
                      rows={3}
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

          {/* ════ VIEW 4: CLOUD COST & ARCHITECTURE LAB ════ */}
          {activeTab === 'cloud_calc' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-800/40 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-purple-400" /> Cloud Unit Economics & Scalability Modeler
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Real-time client infrastructure cost projection based on verified Big Tech production benchmarks.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-400 font-mono">${totalCloudCost}/mo</div>
                    <div className="text-[10px] text-slate-400">Total Infrastructure Bill</div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">Monthly Active Users (MAU)</span>
                    <span className="text-sm font-mono text-cyan-400 font-bold">{monthlyUsers.toLocaleString()} MAU</span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={1000000}
                    step={10000}
                    value={monthlyUsers}
                    onChange={e => setMonthlyUsers(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Vercel Edge SSR</span>
                      <span className="font-mono text-cyan-400 font-bold">${vercelCost}/mo</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Edge caching, Server Actions, zero-cold start global routing.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Supabase Postgres</span>
                      <span className="font-mono text-emerald-400 font-bold">${supabaseCost}/mo</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Connection pooling (PgBouncer), RLS kernels, daily backups.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Cloudflare R2</span>
                      <span className="font-mono text-purple-400 font-bold">${cloudflareCost}/mo</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Zero-egress asset CDN for card scans and product lookbooks.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* ── FOOTER ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800/80 bg-slate-950 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Aeethod Research Terminal: Plan & Meeting Room Node Online</span>
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
