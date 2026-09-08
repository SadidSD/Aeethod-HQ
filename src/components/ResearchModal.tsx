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
  MousePointerClick,
  Target,
  DollarSign,
  AlertTriangle,
  Ban
} from 'lucide-react';

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  agencyManager: AgencyManager | null;
}

// ── TYPES ──────────────────────────────────────────────────────────────────

export type Discipline = 'all' | 'design' | 'content' | 'frontend' | 'backend' | 'market';
export type ResearchType = 'adr' | 'spike' | 'teardown' | 'benchmark' | 'template';
export type ResearchStatus = 'validated' | 'evaluating' | 'archived';

export interface ResearchBenchmark {
  metric: string;
  value: string;
  comparison?: string;
}

// 1. Design-Specific Metadata
export interface DesignMetadata {
  colorPalette?: Array<{ name: string; hex: string; role: string }>;
  springPhysics?: { stiffness: number; damping: number; mass: number; latencyMs?: string };
  wcagContrast?: { ratio: string; level: 'AAA' | 'AA'; notes?: string };
  componentAnatomy?: string[];
}

// 2. Content-Specific Metadata
export interface ContentMetadata {
  targetPersona?: string;
  pasFunnel?: { problem: string; agitate: string; solution: string };
  seoKeywords?: Array<{ keyword: string; volume: string; kd: string; intent: string }>;
  headlineSnippet?: string;
  callToAction?: string;
}

// 3. Frontend-Specific Metadata
export interface FrontendMetadata {
  coreWebVitals?: { fcp: string; lcp: string; cls: string; inp: string };
  bundleSize?: { size: string; savingsPercent?: string; baseline?: string };
  frameworksCompared?: Array<{ name: string; bundle: string; dxScore: string; verdict: string }>;
}

// 4. Backend-Specific Metadata
export interface BackendMetadata {
  architectureTopology?: string;
  databaseSchemaSql?: string;
  rlsSecurityPolicy?: string;
  apiEndpoints?: Array<{ method: string; path: string; latency: string; auth: string }>;
  tradeoffsEvaluated?: Array<{ option: string; pros: string; cons: string; status: 'Chosen' | 'Rejected' }>;
}

// 5. Market Discovery & ICP Metadata (Stripe / Amazon / Reforge / McKinsey Model)
export interface MarketMaturityTier {
  tier: string;
  name: string;
  gmvRange: string;
  inventoryProfile: string;
  verdict: 'Disqualified' | 'SaaS Off-The-Shelf' | 'Ideal Agency ICP' | 'Enterprise Custom';
  verdictColor: string;
  symptoms: string;
}

export interface MarketMetadata {
  niche?: string;
  maturityTiers?: MarketMaturityTier[];
  economicFormula?: {
    monthlyGmv: number;
    marketplaceTakeRatePercent: number; // e.g. 13.5%
    annualFeeBleed: number;
    agencyBuildCost: number; // e.g. $25,000
    paybackMonths: number;
    yearOneRoiMultiple: string;
  };
  operationalTriggers?: string[];
  disqualificationFilters?: string[];
  costOfInactionSalesHook?: string;
}

export interface ResearchEntry {
  id: string;
  title: string;
  discipline: 'design' | 'content' | 'frontend' | 'backend' | 'market';
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

  // Differentiated Discipline Extensions
  designMeta?: DesignMetadata;
  contentMeta?: ContentMetadata;
  frontendMeta?: FrontendMetadata;
  backendMeta?: BackendMetadata;
  marketMeta?: MarketMetadata;
}

// ── SEED RESEARCH KNOWLEDGE BASE ──────────────────────────────────────────

const INITIAL_RESEARCH_ENTRIES: ResearchEntry[] = [
  // ── 5. MARKET DISCOVERY & ICP STRATEGY (Stripe / Reforge Model) ──
  {
    id: 'res_m01',
    title: 'Market Opportunity Teardown: TCG Store Maturity & The Custom Website Tipping Point',
    discipline: 'market',
    type: 'teardown',
    status: 'validated',
    tags: ['Market-Discovery', 'ICP-Strategy', 'TCG-Ecosystem', 'Unit-Economics', 'Stripe', 'Reforge', 'McKinsey'],
    summary: 'Stripe & Reforge customer readiness analysis identifying the exact GMV, inventory, and operational thresholds where a trading card store transitions from marketplace seller to high-ticket custom headless buylist.',
    problemStatement: 'Agency sales teams waste 60%+ of prospecting cycles pitching custom platforms to Tier 1 hobby stores who lack inventory velocity, while missing Tier 3 stores bleeding $12k+/mo to TCGPlayer commission.',
    keyFindings: [
      'Stripe Take-Rate Arbitrage: At $100k/mo sales, stores bleed $162,000/yr in marketplace fees. A $25k Aeethod build achieves break-even in 56 days.',
      'Amazon Disqualification Rule: Stores under $15k/mo or selling only sealed booster packs are strictly disqualified from custom builds.',
      'Reforge Tipping Point: Operational friction peaks when buylist lines exceed 20 minutes on tournament nights and inventory desync causes overselling.'
    ],
    marketMeta: {
      niche: 'Trading Card Games (Pokemon, Magic: The Gathering, Lorcana, One Piece)',
      maturityTiers: [
        {
          tier: 'Tier 1: DIY Hobbyist',
          name: 'Local Binder & Tabletop Shop',
          gmvRange: '< $15,000 / mo',
          inventoryProfile: '< 2,000 singles in glass binders',
          verdict: 'Disqualified',
          verdictColor: 'text-rose-400 bg-rose-950/60 border-rose-800',
          symptoms: 'Uses pen & paper or basic Square POS. Cannot support shipping logistics or $25k build cost.'
        },
        {
          tier: 'Tier 2: Standard SaaS',
          name: 'Marketplace Scaling Merchant',
          gmvRange: '$15,000 – $50,000 / mo',
          inventoryProfile: '5,000 – 15,000 singles on TCGPlayer/eBay',
          verdict: 'SaaS Off-The-Shelf',
          verdictColor: 'text-amber-400 bg-amber-950/60 border-amber-800',
          symptoms: 'Standard Shopify ($29/mo) or TCGPlayer Pro is adequate. Fee bleed is annoying ($3k/mo) but sustainable.'
        },
        {
          tier: 'Tier 3: The Tipping Point',
          name: 'Regional Singles Powerhouse',
          gmvRange: '$50,000 – $250,000 / mo',
          inventoryProfile: '50,000+ singles across 4 conditions (NM/LP/MP/DMG)',
          verdict: 'Ideal Agency ICP',
          verdictColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
          symptoms: 'Bleeding $8,000–$33,000/mo to marketplace fees. Buylist queue backed up 45 mins. Urgent need for Aeethod Headless Buylist + Instant Stripe Payouts.'
        },
        {
          tier: 'Tier 4: Enterprise Scale',
          name: 'Omnichannel National Distributor',
          gmvRange: '$250,000+ / mo',
          inventoryProfile: '250,000+ card multi-warehouse repository',
          verdict: 'Enterprise Custom',
          verdictColor: 'text-purple-400 bg-purple-950/60 border-purple-800',
          symptoms: 'Card Kingdom / Star City Games level. Requires custom ERP, AI camera grading scanners, and warehouse robotics.'
        }
      ],
      economicFormula: {
        monthlyGmv: 100000,
        marketplaceTakeRatePercent: 13.5,
        annualFeeBleed: 162000,
        agencyBuildCost: 25000,
        paybackMonths: 1.9,
        yearOneRoiMultiple: '6.5x Net Capital Return'
      },
      operationalTriggers: [
        'Friday Night Buylist Congestion: Players wait 30+ mins in line while clerks look up card prices one-by-one on smartphones.',
        'Inventory Desync Penalties: A $350 serialized card sells in the physical display case while simultaneously bought on TCGPlayer, incurring marketplace order cancellation strikes.',
        'Cash Flow Payout Delay: TCGPlayer/eBay hold funds for 7–14 days, preventing store owners from buying hot collections on weekends.',
        'Zero Collector Retention: Marketplaces own the customer email; the store cannot re-target buyers with VIP drops.'
      ],
      disqualificationFilters: [
        'Monthly Gross Revenue < $15,000 (Store cash flow cannot absorb custom software).',
        'Sealed Product Only: Stores that refuse to buy/sell singles (sealed margins are 10–14%, singles margins are 50–65%).',
        'Solo Operator with No Shipping Team: Cannot fulfill 40+ daily direct-to-consumer online shipments.',
        'Owner unwilling to market buylist locally.'
      ],
      costOfInactionSalesHook: '"Last year you paid TCGPlayer approximately $145,000 in transaction commissions. For a one-time $25,000 investment, Aeethod deploys your own sub-second headless buylist with 1-tap Apple Pay and instant Stripe debit payouts—putting over $120,000 back into your inventory budget in year one alone."'
    },
    codeOrTokens: `/* Stripe Take-Rate Arbitrage Formula */
const monthlyGMV = 100000;
const marketplaceTakeRate = 0.135; // 13.5% TCGPlayer/eBay blended
const annualFeeBleed = monthlyGMV * marketplaceTakeRate * 12; // $162,000/yr
const aeethodBuildCost = 25000; // One-time custom platform
const paybackDays = (aeethodBuildCost / (annualFeeBleed / 365)).toFixed(0); // ~56 days
const netYearOneSavings = annualFeeBleed - aeethodBuildCost; // $137,000 net profit`,
    author: 'Sadid (Founder & Strategy)',
    createdAt: '2026-03-05',
    updatedAt: '2026-03-08'
  },

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
USING (auth.uid() = user_id);`,
      rlsSecurityPolicy: 'Active: Strict Kernel-Level Tenant Isolation via auth.uid()',
      apiEndpoints: [
        { method: 'POST', path: '/api/v1/buylist/submit', latency: '24ms', auth: 'Bearer JWT' },
        { method: 'GET', path: '/api/v1/catalog/live-prices', latency: '12ms', auth: 'Public Edge Cache' }
      ]
    },
    codeOrTokens: `-- Supabase RLS Migration
ALTER TABLE client_buylists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_isolation" ON client_buylists
FOR ALL USING (auth.uid() = user_id);`,
    author: 'Devon Miles (Backend Lead)',
    createdAt: '2026-02-25',
    updatedAt: '2026-03-01'
  }
];

// ── 5 BLUEPRINT TEMPLATES CATALOG ──────────────────────────────────────────

export interface TemplateBlueprint {
  id: string;
  discipline: 'design' | 'content' | 'frontend' | 'backend' | 'market';
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
    id: 'template_market',
    discipline: 'market',
    title: 'Market Discovery & ICP Readiness Blueprint',
    subtitle: 'Stripe & Reforge Market Opportunity Standard',
    badge: 'MARKET STRATEGY',
    icon: Target,
    accentColor: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/20',
    description: 'Executive framework to size market opportunity, map Reforge 4-tier customer maturity stages, calculate Stripe take-rate arbitrage tipping points, and establish Amazon disqualification filters.',
    keyFields: ['4-Tier Maturity Lifecycle (Reforge)', 'Take-Rate Arbitrage Calculator (Stripe)', 'Hair-on-Fire Pain Triggers (Amazon)', 'Cost of Inaction (McKinsey COI)', 'Disqualification Filters'],
    sampleTitle: 'Market Discovery: [Niche] Maturity Stages & Website Tipping Point',
    sampleSummary: 'Market opportunity analysis mapping customer operational tiers, platform take-rate bleed, and exact unit economic break-even triggers.',
    initialTags: 'Market-Discovery, ICP, Tipping-Point, Unit-Economics, Strategy'
  },
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
  const [formDiscipline, setFormDiscipline] = useState<'design' | 'content' | 'frontend' | 'backend' | 'market'>('market');
  const [formType, setFormType] = useState<ResearchType>('teardown');
  const [formStatus, setFormStatus] = useState<ResearchStatus>('validated');
  const [formTitle, setFormTitle] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formProblem, setFormProblem] = useState('');
  const [formFindings, setFormFindings] = useState('');
  const [formCode, setFormCode] = useState('');

  // 1. Design Form Fields
  const [formDesignColors, setFormDesignColors] = useState('#090d16 (Obsidian Void), #0f172a (Frosted Glass), #06b6d4 (Neon Cyan)');
  const [formSpringStiffness, setFormSpringStiffness] = useState(400);
  const [formSpringDamping, setFormSpringDamping] = useState(28);
  const [formWcagRatio, setFormWcagRatio] = useState('8.4 : 1 (AAA Pass)');

  // 2. Content Form Fields
  const [formPersona, setFormPersona] = useState('');
  const [formPasProblem, setFormPasProblem] = useState('');
  const [formPasAgitate, setFormPasAgitate] = useState('');
  const [formPasSolution, setFormPasSolution] = useState('');
  const [formHeadline, setFormHeadline] = useState('');
  const [formCta, setFormCta] = useState('');

  // 3. Frontend Form Fields
  const [formFcp, setFormFcp] = useState('0.65s');
  const [formLcp, setFormLcp] = useState('1.10s');
  const [formBundleSize, setFormBundleSize] = useState('48 KB');

  // 4. Backend Form Fields
  const [formTopology, setFormTopology] = useState('Edge CDN ➔ Vercel Server Actions ➔ Supabase PgBouncer ➔ PostgreSQL 16');
  const [formRlsPolicy, setFormRlsPolicy] = useState('ALTER TABLE client_data ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "user_isolation" ON client_data FOR ALL USING (auth.uid() = user_id);');

  // 5. Market Strategy Form Fields (Stripe / Reforge Model)
  const [formMarketNiche, setFormMarketNiche] = useState('Trading Card Game (TCG) & Collectibles Retail');
  const [formMonthlyGmv, setFormMonthlyGmv] = useState(100000);
  const [formMarketTakeRate, setFormMarketTakeRate] = useState(13.5);
  const [formAgencyFee, setFormAgencyFee] = useState(25000);
  const [formTriggers, setFormTriggers] = useState('Friday Night Buylist Congestion > 30 mins\nInventory desync between in-store showcase and online\nDelayed ACH bank payout delays hurting cash flow');
  const [formDisqualification, setFormDisqualification] = useState('Monthly gross revenue < $15k/mo\nSealed products only (no singles inventory)\nSolo operator without daily packing/shipping staff');
  const [formCoiHook, setFormCoiHook] = useState('"Last year you paid TCGPlayer ~$145,000 in fees. An Aeethod headless buylist costs $25k one-time, saving you $120k+ in Year 1 alone."');

  // Interactive UI State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isCasting, setIsCasting] = useState(false);
  const [springTestActive, setSpringTestActive] = useState(false);
  const [simulatorMonthlyGmv, setSimulatorMonthlyGmv] = useState(90000);
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
    setFormType(blueprint.discipline === 'market' ? 'teardown' : blueprint.discipline === 'design' ? 'teardown' : blueprint.discipline === 'content' ? 'template' : 'adr');
    setFormTitle(blueprint.sampleTitle);
    setFormSummary(blueprint.sampleSummary);
    setFormTags(blueprint.initialTags);

    if (blueprint.discipline === 'market') {
      setFormProblem('Merchants trapped in 13%+ marketplace commission bleed without knowing their custom website tipping point.');
      setFormFindings('At $100k/mo sales, marketplace take-rate burns $162,000/yr in fees\nA $25,000 Aeethod custom build achieves full payback in 56 days\nStores under $15k/mo are strictly disqualified to protect agency win rates');
      setFormMarketNiche('Trading Card Games (TCG) & High-Ticket Collectibles');
      setFormMonthlyGmv(100000);
      setFormMarketTakeRate(13.5);
      setFormAgencyFee(25000);
      setFormTriggers('Buylist wait times exceed 20 mins on Friday nights\nInventory desync between showcase and online\nDelayed ACH cash flow');
      setFormDisqualification('Under $15k/mo GMV\nNo singles buylist\nNo fulfillment staff');
      setFormCoiHook('"Last year you paid TCGPlayer ~$145,000 in fees. An Aeethod headless buylist pays for itself in under 60 days."');
      setFormCode(`// Stripe Take-Rate Arbitrage Math
const monthlyGMV = 100000;
const annualFees = monthlyGMV * 0.135 * 12; // $162,000
const buildCost = 25000;
const netYear1Savings = annualFees - buildCost; // $137,000 net profit`);
    } else if (blueprint.discipline === 'design') {
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

    const annualFeeBleed = Math.round(formMonthlyGmv * (formMarketTakeRate / 100) * 12);
    const paybackMonths = Number(((formAgencyFee / (annualFeeBleed / 12))).toFixed(1));
    const netYear1 = annualFeeBleed - formAgencyFee;

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
      ...(formDiscipline === 'market' && {
        marketMeta: {
          niche: formMarketNiche,
          economicFormula: {
            monthlyGmv: formMonthlyGmv,
            marketplaceTakeRatePercent: formMarketTakeRate,
            annualFeeBleed: annualFeeBleed,
            agencyBuildCost: formAgencyFee,
            paybackMonths: paybackMonths,
            yearOneRoiMultiple: `${(annualFeeBleed / formAgencyFee).toFixed(1)}x Net ROI ($${netYear1.toLocaleString()} saved)`
          },
          operationalTriggers: formTriggers.split('\n').filter(Boolean),
          disqualificationFilters: formDisqualification.split('\n').filter(Boolean),
          costOfInactionSalesHook: formCoiHook,
          maturityTiers: [
            {
              tier: 'Tier 1: DIY Hobbyist',
              name: 'Early Binder Shop',
              gmvRange: '< $15,000 / mo',
              inventoryProfile: '< 2,000 singles',
              verdict: 'Disqualified',
              verdictColor: 'text-rose-400 bg-rose-950/60 border-rose-800',
              symptoms: 'Uses pen & paper or basic Square POS. Cannot support shipping logistics or $25k build cost.'
            },
            {
              tier: 'Tier 2: Standard SaaS',
              name: 'Marketplace Dependent',
              gmvRange: '$15k – $50k / mo',
              inventoryProfile: '5k – 15k singles',
              verdict: 'SaaS Off-The-Shelf',
              verdictColor: 'text-amber-400 bg-amber-950/60 border-amber-800',
              symptoms: 'Standard Shopify or TCGPlayer Pro is adequate. Fee bleed is annoying but sustainable.'
            },
            {
              tier: 'Tier 3: The Tipping Point',
              name: 'Singles Powerhouse (Prime ICP)',
              gmvRange: '$50k – $250k / mo',
              inventoryProfile: '50,000+ singles',
              verdict: 'Ideal Agency ICP',
              verdictColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
              symptoms: 'Bleeding $8k-$33k/mo to fees. Buylist queue backed up. Urgent need for Aeethod Headless Platform.'
            },
            {
              tier: 'Tier 4: Enterprise Scale',
              name: 'National Distributor',
              gmvRange: '$250k+ / mo',
              inventoryProfile: '250,000+ cards',
              verdict: 'Enterprise Custom',
              verdictColor: 'text-purple-400 bg-purple-950/60 border-purple-800',
              symptoms: 'Requires custom ERP, warehouse robotics, and AI camera grading pipelines.'
            }
          ]
        }
      }),
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

    triggerToast('🎉 New Market & Strategy Dossier logged! (+100 KP)');
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

  // Real-time Market Simulator Calculations
  const simMarketplaceFeeBleedAnnual = Math.round(simulatorMonthlyGmv * 0.135 * 12);
  const simMonthsToPayback = Number(((25000 / (simMarketplaceFeeBleedAnnual / 12))).toFixed(1));
  const simYearOneSavings = simMarketplaceFeeBleedAnnual - 25000;
  const simTier =
    simulatorMonthlyGmv < 15000
      ? { label: 'Tier 1: Disqualified', color: 'text-rose-400 bg-rose-950/60 border-rose-800' }
      : simulatorMonthlyGmv < 50000
      ? { label: 'Tier 2: Generic SaaS Only', color: 'text-amber-400 bg-amber-950/60 border-amber-800' }
      : simulatorMonthlyGmv <= 250000
      ? { label: 'Tier 3: ★ PRIME AEETHOD ICP', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500 animate-pulse' }
      : { label: 'Tier 4: Enterprise Scale', color: 'text-purple-400 bg-purple-950/60 border-purple-800' };

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
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-400 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-wide text-white uppercase flex items-center gap-2">
                  Aeethod Research & Intelligence System
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  5 BIG TECH DISCIPLINES
                </span>
                {isCasting && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-950 text-amber-300 border border-amber-600 animate-pulse">
                    <Cast className="w-3 h-3" /> CASTING TO 85" SCREEN
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Plan & Meeting Room Terminal • Market ICP, Design, Content, Frontend & Backend Standards
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
                  ? 'border-emerald-400 text-emerald-300 font-bold bg-emerald-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              Big Tech Templates Hub ({TEMPLATES_CATALOG.length})
            </button>

            <button
              onClick={() => setActiveTab('new_entry')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
                activeTab === 'new_entry'
                  ? 'border-indigo-400 text-indigo-300 font-bold bg-indigo-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-4 h-4 text-indigo-400" />
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
                      placeholder="Search ADRs, spikes, market ICP, tags..."
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* 5 Core Disciplines Pill Filter */}
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
                      onClick={() => setSelectedDiscipline('market')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors shrink-0 ${
                        selectedDiscipline === 'market'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold'
                          : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Target className="w-3 h-3 text-emerald-400" />
                      Market & ICP
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
                      {['all', 'teardown', 'adr', 'spike', 'benchmark', 'template'].map(t => (
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
                        entry.discipline === 'market' ? 'text-emerald-400' :
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
                            selectedEntry.discipline === 'market' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700' :
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

                    {/* ── DISCIPLINE SPECIALIZATION 5: MARKET DISCOVERY & ICP WIDGETS ── */}
                    {selectedEntry.discipline === 'market' && selectedEntry.marketMeta && (
                      <div className="space-y-5 p-5 rounded-2xl bg-emerald-950/15 border border-emerald-800/40">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Target className="w-4 h-4" /> Reforge Customer Maturity Lifecycle
                          </h3>
                          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                            ICP TIPPING POINT FRAMEWORK
                          </span>
                        </div>

                        {/* Interactive TCG Store Tipping Point Simulator */}
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Interactive Store Tipping Point Simulator
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Slide store monthly GMV to calculate marketplace take-rate bleed vs Aeethod build ROI
                              </div>
                            </div>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${simTier.color}`}>
                              {simTier.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 pt-1">
                            <input
                              type="range"
                              min={10000}
                              max={300000}
                              step={5000}
                              value={simulatorMonthlyGmv}
                              onChange={e => setSimulatorMonthlyGmv(Number(e.target.value))}
                              className="w-full accent-emerald-400"
                            />
                            <span className="text-xs font-mono font-bold text-cyan-300 shrink-0 w-24 text-right">
                              ${simulatorMonthlyGmv.toLocaleString()}/mo
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2.5 pt-2">
                            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                              <div className="text-[10px] text-rose-400 uppercase font-bold">Annual Fee Bleed (13.5%)</div>
                              <div className="text-base font-black text-rose-400 font-mono mt-0.5">
                                ${simMarketplaceFeeBleedAnnual.toLocaleString()}
                              </div>
                              <div className="text-[9px] text-slate-500">Paid to TCGPlayer/eBay</div>
                            </div>

                            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                              <div className="text-[10px] text-cyan-400 uppercase font-bold">Aeethod Build Cost</div>
                              <div className="text-base font-black text-white font-mono mt-0.5">$25,000</div>
                              <div className="text-[9px] text-slate-500">One-time fixed capital</div>
                            </div>

                            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                              <div className="text-[10px] text-emerald-400 uppercase font-bold">Months to Payback</div>
                              <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                                {simMonthsToPayback > 12 ? '> 12 mos' : `${simMonthsToPayback} mos`}
                              </div>
                              <div className="text-[9px] text-slate-500">
                                {simYearOneSavings > 0 ? `+$${simYearOneSavings.toLocaleString()} Year 1 Net` : 'Not profitable'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Reforge 4-Tier Maturity Stages Matrix */}
                        {selectedEntry.marketMeta.maturityTiers && (
                          <div className="space-y-2">
                            <div className="text-[11px] font-bold text-slate-300 uppercase">Customer Readiness Tiers</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {selectedEntry.marketMeta.maturityTiers.map((tier, tIdx) => (
                                <div key={tIdx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">{tier.tier}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${tier.verdictColor}`}>
                                      {tier.verdict}
                                    </span>
                                  </div>
                                  <div className="text-xs font-bold text-white">{tier.name}</div>
                                  <div className="text-[11px] text-cyan-300 font-mono">Volume: {tier.gmvRange} • {tier.inventoryProfile}</div>
                                  <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">{tier.symptoms}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Amazon Operational Triggers & Disqualification Filters */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          {/* Hair-on-fire Triggers */}
                          {selectedEntry.marketMeta.operationalTriggers && (
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                              <div className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" /> Hair-On-Fire Pain Symptoms
                              </div>
                              <div className="space-y-1.5">
                                {selectedEntry.marketMeta.operationalTriggers.map((trig, i) => (
                                  <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
                                    <span className="text-amber-400 mt-0.5">•</span>
                                    <span>{trig}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Disqualification Filters */}
                          {selectedEntry.marketMeta.disqualificationFilters && (
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                              <div className="text-xs font-bold text-rose-400 uppercase flex items-center gap-1.5">
                                <Ban className="w-3.5 h-3.5" /> Amazon Disqualification Criteria
                              </div>
                              <div className="space-y-1.5">
                                {selectedEntry.marketMeta.disqualificationFilters.map((filt, i) => (
                                  <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
                                    <span className="text-rose-400 mt-0.5">✕</span>
                                    <span>{filt}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* McKinsey Cost of Inaction (COI) Sales Pitch Box */}
                        {selectedEntry.marketMeta.costOfInactionSalesHook && (
                          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/50 flex items-center justify-between gap-4">
                            <div>
                              <div className="text-[10px] uppercase font-bold text-emerald-400">
                                McKinsey Cost of Inaction (COI) Outreach Hook
                              </div>
                              <p className="text-xs font-medium text-white mt-1 italic leading-relaxed">
                                {selectedEntry.marketMeta.costOfInactionSalesHook}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCopy(selectedEntry.marketMeta?.costOfInactionSalesHook!, 'COI sales hook copied!')}
                              className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" /> Copy Hook
                            </button>
                          </div>
                        )}
                      </div>
                    )}

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
                            <Code2 className="w-4 h-4 text-cyan-400" /> Code / Token / Formula Snippet
                          </h3>
                          <button
                            onClick={() => handleCopy(selectedEntry.codeOrTokens!, 'Snippet copied!')}
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
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-900/50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white tracking-wide uppercase">
                        5 Big Tech Research Blueprints
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                        STRIPE • AMAZON • REFORGE • APPLE
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                      Each engineering and strategic discipline uses a fundamentally distinct methodology. Select any blueprint to pre-populate the studio with specialized inputs.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400">5 Specialized Hubs</span>
                    <div className="text-xs text-emerald-400 font-mono font-bold">+100 KP / entry</div>
                  </div>
                </div>

                {/* 5 Specialized Blueprints Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                            <span className="text-[10px] text-slate-400 font-mono">{bp.subtitle.split(' ')[0]}</span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs font-bold text-white">{bp.title}</h4>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                            {bp.description}
                          </p>

                          {/* Key Fields Checklist */}
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Specialized Schema:
                            </span>
                            <div className="space-y-0.5 text-[10px] text-slate-300">
                              {bp.keyFields.slice(0, 3).map((f, fIdx) => (
                                <div key={fIdx} className="flex items-center gap-1 text-slate-400">
                                  <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0" />
                                  <span className="truncate">{f}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[9px] font-mono text-slate-400">#{bp.initialTags.split(',')[0]}</span>
                          <button
                            onClick={() => handleApplyBlueprint(bp)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-md transition-transform active:scale-95"
                          >
                            Use Blueprint <ArrowRight className="w-3 h-3" />
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
                        Choose your discipline to dynamically calibrate inputs.
                      </p>
                    </div>

                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
                      REWARDS +100 KP
                    </span>
                  </div>

                  {/* 5 Discipline Tab Buttons */}
                  <div className="grid grid-cols-5 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setFormDiscipline('market')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        formDiscipline === 'market'
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5 mb-1 text-emerald-400" />
                      <div className="text-[11px] font-bold">1. Market ICP</div>
                      <div className="text-[9px] text-slate-500">Tipping Point Sizing</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormDiscipline('design')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        formDiscipline === 'design'
                          ? 'bg-pink-950/40 border-pink-500 text-pink-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Palette className="w-3.5 h-3.5 mb-1 text-pink-400" />
                      <div className="text-[11px] font-bold">2. Design Spec</div>
                      <div className="text-[9px] text-slate-500">UI & Spring Tokens</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormDiscipline('content')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        formDiscipline === 'content'
                          ? 'bg-amber-950/40 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 mb-1 text-amber-400" />
                      <div className="text-[11px] font-bold">3. Content Deck</div>
                      <div className="text-[9px] text-slate-500">PAS & SEO Strategy</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormDiscipline('frontend')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        formDiscipline === 'frontend'
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5 mb-1 text-cyan-400" />
                      <div className="text-[11px] font-bold">4. Frontend RFC</div>
                      <div className="text-[9px] text-slate-500">Web Vitals & Bundle</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormDiscipline('backend')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        formDiscipline === 'backend'
                          ? 'bg-purple-950/40 border-purple-500 text-purple-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5 mb-1 text-purple-400" />
                      <div className="text-[11px] font-bold">5. Backend ADR</div>
                      <div className="text-[9px] text-slate-500">RLS & Data Pipeline</div>
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
                      placeholder="e.g. Market Discovery: TCG Store Maturity Lifecycle & Buylist Tipping Point"
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
                        <option value="teardown">Teardown / Market Discovery</option>
                        <option value="adr">ADR (Architecture Record)</option>
                        <option value="spike">Spike / Benchmark</option>
                        <option value="template">Reusable Blueprint</option>
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
                        placeholder="e.g. Market, ICP, TCG, Tipping-Point"
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
                      placeholder="High-level commercial takeaway and the strategic tipping point."
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                    />
                  </div>

                  {/* ════════ DYNAMIC DISCIPLINE FIELDS ════════ */}

                  {/* 5. MARKET STRATEGY FIELDS (Stripe / Reforge Model) */}
                  {formDiscipline === 'market' && (
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Target className="w-4 h-4" /> Stripe Take-Rate Arbitrage & Reforge Maturity Model
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Industry Niche & Segment
                        </label>
                        <input
                          type="text"
                          value={formMarketNiche}
                          onChange={e => setFormMarketNiche(e.target.value)}
                          placeholder="e.g. Trading Card Game Retailers ($50k-$200k/mo sales)"
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Store Monthly GMV ($)</label>
                          <input
                            type="number"
                            value={formMonthlyGmv}
                            onChange={e => setFormMonthlyGmv(Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Marketplace Take-Rate (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={formMarketTakeRate}
                            onChange={e => setFormMarketTakeRate(Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Aeethod Build Fee ($)</label>
                          <input
                            type="number"
                            value={formAgencyFee}
                            onChange={e => setFormAgencyFee(Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-amber-400 mb-1">
                            Hair-On-Fire Pain Triggers (1 per line)
                          </label>
                          <textarea
                            rows={3}
                            value={formTriggers}
                            onChange={e => setFormTriggers(e.target.value)}
                            placeholder="e.g. Buylist wait times > 30 mins&#10;Inventory desync&#10;Delayed ACH bank payouts"
                            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-rose-400 mb-1">
                            Disqualification Criteria (1 per line)
                          </label>
                          <textarea
                            rows={3}
                            value={formDisqualification}
                            onChange={e => setFormDisqualification(e.target.value)}
                            placeholder="e.g. Under $15k/mo GMV&#10;Sealed product only&#10;No daily shipping team"
                            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                          McKinsey Cost of Inaction (COI) Sales Hook
                        </label>
                        <input
                          type="text"
                          value={formCoiHook}
                          onChange={e => setFormCoiHook(e.target.value)}
                          placeholder='"Last year you paid TCGPlayer ~$145,000 in fees. An Aeethod build saves you $120k in Year 1 alone."'
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* 1. DESIGN FIELDS */}
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

                  {/* 2. CONTENT FIELDS */}
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
                    </div>
                  )}

                  {/* 3. FRONTEND FIELDS */}
                  {formDiscipline === 'frontend' && (
                    <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-3">
                      <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Code2 className="w-4 h-4" /> Core Web Vitals Targets & Bundle Budgets
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target FCP</label>
                          <input
                            type="text"
                            value={formFcp}
                            onChange={e => setFormFcp(e.target.value)}
                            placeholder="0.65s"
                            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target LCP</label>
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

                  {/* 4. BACKEND FIELDS */}
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
                      placeholder="What market barrier or operational obstacle forced this research?"
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
                      placeholder="e.g. Break-even achieved in 56 days&#10;Disqualification threshold is $15k/mo&#10;Friday night buylist line bottleneck"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                    />
                  </div>

                  {/* Common: Code Snippet / Tokens */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Starter Code / Token / Formula Snippet (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formCode}
                      onChange={e => setFormCode(e.target.value)}
                      placeholder="Paste copyable formulas, code, or tokens..."
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
