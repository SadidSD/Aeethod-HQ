import { useState } from 'react';
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
  Award
} from 'lucide-react';

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  agencyManager: AgencyManager | null;
}

type TabType = 'lead_intel' | 'competitor_radar' | 'tech_lab' | 'creative_trends' | 'knowledge_vault';

interface ClientPreset {
  domain: string;
  name: string;
  industry: string;
  funding: string;
  headcount: string;
  estRevenue: string;
  currentStack: string[];
  recommendedStack: string[];
  scores: { perf: number; a11y: number; seo: number; best: number };
  insights: string[];
}

const PRESET_CLIENTS: Record<string, ClientPreset> = {
  'rnggamez.com': {
    domain: 'rnggamez.com',
    name: 'RNG Gamez TCG Ecosystem',
    industry: 'Gaming & Collectibles E-Commerce',
    funding: 'Series A ($4.2M)',
    headcount: '18 employees',
    estRevenue: '$2.8M ARR',
    currentStack: ['Monolithic Shopify Liquid', 'jQuery', 'Custom Ruby API', 'Legacy Mailchimp'],
    recommendedStack: ['Next.js 15 App Router', 'Supabase (PostgreSQL)', 'Tailwind CSS v4', 'Stripe Connect Buylist'],
    scores: { perf: 94, a11y: 98, seo: 96, best: 100 },
    insights: [
      'High mobile bounce rate (~42%) on live tournament brackets due to un-cached Shopify liquid scripts.',
      'Instant buylist debit payouts via Stripe Connect will increase seller retention by ~38% against TCGPlayer.',
      'AI-powered Card Condition Scanner (Gemini Vision) reduces grading labor by 85%.'
    ]
  },
  'aurora-atelier.com': {
    domain: 'aurora-atelier.com',
    name: 'Aurora Atelier Paris',
    industry: 'Luxury Fashion & Haute Horlogerie',
    funding: 'Self-Funded / Private Family Office',
    headcount: '42 employees',
    estRevenue: '$8.5M Annual',
    currentStack: ['WooCommerce on AWS EC2', 'Elementor', 'MySQL', 'Braintree'],
    recommendedStack: ['Next.js 15', 'Sanity CMS', 'Medusa.js Headless Engine', 'Three.js 3D Showroom'],
    scores: { perf: 91, a11y: 95, seo: 97, best: 96 },
    insights: [
      'Site load time is 4.1s in North America due to un-CDN cached 4K lookbook imagery.',
      'Interactive 3D WebGL watch customizer will double time-on-site and VIP consultation bookings.',
      'Headless architecture allows private client portals with bespoke tier pricing.'
    ]
  },
  'zenith-fintech.io': {
    domain: 'zenith-fintech.io',
    name: 'Zenith B2B Treasury',
    industry: 'Institutional FinTech & Cross-Border FX',
    funding: 'Series B ($24M)',
    headcount: '85 employees',
    estRevenue: '$14.2M ARR',
    currentStack: ['Angular 14', 'Java Spring Boot', 'Oracle DB', 'Cloudflare DNS'],
    recommendedStack: ['React 19 / Vite SPA', 'Rust WebAssembly Calc Engine', 'Tailwind CSS', 'Pusher WebSockets'],
    scores: { perf: 96, a11y: 99, seo: 92, best: 100 },
    insights: [
      'Sub-millisecond FX ticker updates require WebSockets replacing their current 2-second HTTP polling.',
      'Compliance dashboard lacks WCAG 2.1 AA keyboard accessibility for European institutional clients.',
      'Modern dark-mode Bento grid layout will match Stripe/Linear standards.'
    ]
  }
};

export default function ResearchModal({ isOpen, onClose, agencyManager }: ResearchModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('lead_intel');
  const [targetUrl, setTargetUrl] = useState('rnggamez.com');
  const [isAuditing, setIsAuditing] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Cloud Calculator State
  const [monthlyUsers, setMonthlyUsers] = useState(150000);
  const [dbReadsPerDay, setDbReadsPerDay] = useState(500000);

  // Package Comparison State
  const [selectedComparison, setSelectedComparison] = useState<'state' | 'backend' | 'framework'>('backend');

  // Claimed KP tracker
  const [claimedKP, setClaimedKP] = useState(false);
  const [knowledgePoints, setKnowledgePoints] = useState(1450);

  if (!isOpen) return null;

  const currentClient = PRESET_CLIENTS[targetUrl] || PRESET_CLIENTS['rnggamez.com'];

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRunAudit = (url: string) => {
    setIsAuditing(true);
    setTimeout(() => {
      setTargetUrl(url);
      setIsAuditing(false);
      triggerToast(`⚡ Intel refreshed for ${url}!`);
    }, 600);
  };

  const handleCastToScreen = () => {
    setIsCasting(!isCasting);
    triggerToast(
      !isCasting
        ? '📺 Casted live research dossier to Boardroom 85" Smart Display!'
        : '📺 Boardroom presentation cast disconnected.'
    );
  };

  const handleExportToAgenda = () => {
    try {
      const existing = localStorage.getItem('aeethod_meeting_agenda');
      const agenda = existing ? JSON.parse(existing) : [];
      const newItems = currentClient.insights.map(ins => ({
        id: 'res_' + Math.random().toString(36).substring(2, 7),
        text: `[Research Intel] ${ins}`,
        checked: false
      }));
      localStorage.setItem('aeethod_meeting_agenda', JSON.stringify([...agenda, ...newItems]));
      triggerToast('📋 Discovery points exported into Meeting Room Agenda!');
    } catch {
      triggerToast('📋 Agenda updated for next boardroom session!');
    }
  };

  const handleClaimKP = () => {
    if (claimedKP) return;
    setClaimedKP(true);
    setKnowledgePoints(prev => prev + 150);
    if (agencyManager) {
      agencyManager.state.resources.knowledge = (agencyManager.state.resources.knowledge || 0) + 150;
      agencyManager.save();
    }
    triggerToast('🎉 +150 Knowledge Points (KP) claimed for Aeethod HQ!');
  };

  // Cloud Cost Calculation
  const vercelCost = monthlyUsers < 50000 ? 20 : Math.round(20 + ((monthlyUsers - 50000) / 10000) * 4);
  const supabaseCost = monthlyUsers < 100000 ? 25 : Math.round(25 + ((monthlyUsers - 100000) / 25000) * 10);
  const cloudflareCost = Math.round(5 + (monthlyUsers / 50000) * 3);
  const totalCloudCost = vercelCost + supabaseCost + cloudflareCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] flex flex-col rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

        {/* ── HEADER ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wide text-white uppercase flex items-center gap-2">
                  Aeethod Research & Intelligence Terminal
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                  LIVE INTEL STREAM
                </span>
                {isCasting && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-950/80 text-amber-300 border border-amber-600 animate-pulse">
                    <Cast className="w-3 h-3" /> CASTING TO BOARDROOM
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Agency intelligence nerve center • Plan & Meeting Room Workstation
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
              onClick={handleCastToScreen}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                isCasting
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Cast className="w-3.5 h-3.5" />
              {isCasting ? 'Stop Casting' : 'Cast to TV'}
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

        {/* ── NAVIGATION TABS ───────────────────────────────────── */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-800/80 bg-slate-950/80 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('lead_intel')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
              activeTab === 'lead_intel'
                ? 'border-cyan-400 text-cyan-300 font-semibold bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Search className="w-4 h-4 text-cyan-400" />
            1. Client Due Diligence & Audit
          </button>
          <button
            onClick={() => setActiveTab('competitor_radar')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
              activeTab === 'competitor_radar'
                ? 'border-purple-400 text-purple-300 font-semibold bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-purple-400" />
            2. Competitor & Market Radar
          </button>
          <button
            onClick={() => setActiveTab('tech_lab')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
              activeTab === 'tech_lab'
                ? 'border-emerald-400 text-emerald-300 font-semibold bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            3. Tech Stack & Cost Lab
          </button>
          <button
            onClick={() => setActiveTab('creative_trends')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
              activeTab === 'creative_trends'
                ? 'border-pink-400 text-pink-300 font-semibold bg-pink-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Palette className="w-4 h-4 text-pink-400" />
            4. Creative Trend Radar
          </button>
          <button
            onClick={() => setActiveTab('knowledge_vault')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
              activeTab === 'knowledge_vault'
                ? 'border-amber-400 text-amber-300 font-semibold bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            5. Agency IP & Knowledge Vault
          </button>
        </div>

        {/* ── TOAST NOTIFICATION ─────────────────────────────────── */}
        {toastMsg && (
          <div className="absolute top-20 right-8 z-50 flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900/95 text-cyan-300 border border-cyan-500/50 shadow-xl shadow-cyan-950/50 animate-in slide-in-from-top-2 duration-150">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            {toastMsg}
          </div>
        )}

        {/* ── TAB CONTENT ────────────────────────────────────────── */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">

          {/* ════ TAB 1: CLIENT DUE DILIGENCE & AUDIT ════ */}
          {activeTab === 'lead_intel' && (
            <div className="space-y-6">
              {/* URL Input Bar & Quick Presets */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-cyan-400" /> Target Prospect or Client URL
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    Quick Presets:
                    {Object.keys(PRESET_CLIENTS).map(k => (
                      <button
                        key={k}
                        onClick={() => handleRunAudit(k)}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                          targetUrl === k ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={targetUrl}
                      onChange={e => setTargetUrl(e.target.value)}
                      placeholder="https://client-domain.com"
                      className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                    />
                    <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                  <button
                    onClick={() => handleRunAudit(targetUrl)}
                    disabled={isAuditing}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-900/30 disabled:opacity-50"
                  >
                    {isAuditing ? <Sparkles className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {isAuditing ? 'Running Deep Scrape...' : 'Scan Target Site'}
                  </button>
                </div>
              </div>

              {/* Dossier Header Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Client Company</div>
                  <div className="text-sm font-bold text-white mt-1">{currentClient.name}</div>
                  <div className="text-xs text-cyan-400 font-mono mt-0.5">{currentClient.industry}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Funding Stage</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">{currentClient.funding}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Headcount: {currentClient.headcount}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Est. Annual Revenue</div>
                  <div className="text-sm font-bold text-amber-400 mt-1">{currentClient.estRevenue}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Enterprise Client Tier</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Meeting Sync</div>
                    <div className="text-xs text-slate-300 mt-1">Export findings to Boardroom</div>
                  </div>
                  <button
                    onClick={handleExportToAgenda}
                    className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Export
                  </button>
                </div>
              </div>

              {/* Lighthouse Scores + Tech Stacks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Lighthouse Radar Gauges */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-400" /> Automated Lighthouse Health Audit
                    </h3>
                    <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      Overall: 96 / 100
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="text-2xl font-black text-emerald-400">{currentClient.scores.perf}</div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase mt-1">Performance</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">FCP: 0.9s</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="text-2xl font-black text-emerald-400">{currentClient.scores.a11y}</div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase mt-1">Accessibility</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">WCAG AAA</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="text-2xl font-black text-cyan-400">{currentClient.scores.best}</div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase mt-1">Best Practices</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Modern DOM</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="text-2xl font-black text-emerald-400">{currentClient.scores.seo}</div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase mt-1">SEO Health</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Schema.org</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                    💡 <strong className="text-slate-200">Pitch Angle:</strong> Client is currently losing ~28% of mobile conversions on checkout because of third-party script bloat. Upgrading to Aeethod Next.js 15 Server Components will cut TBT (Total Blocking Time) from 640ms down to 45ms.
                  </div>
                </div>

                {/* Tech Stack Sniffer & Migration Opportunity */}
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" /> Tech Stack Sniffer & Transformation Pitch
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <div className="text-[11px] font-semibold text-rose-400 uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" /> Current Legacy Stack (Bottlenecks)
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {currentClient.currentStack.map(s => (
                          <span key={s} className="px-2.5 py-1 rounded text-xs bg-rose-950/30 text-rose-300 border border-rose-900/50 font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-[11px] font-semibold text-cyan-400 uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" /> Recommended Modern Stack (Aeethod Standard)
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {currentClient.recommendedStack.map(s => (
                          <span key={s} className="px-2.5 py-1 rounded text-xs bg-cyan-950/40 text-cyan-300 border border-cyan-800 font-mono font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Strategic Insights */}
                  <div className="space-y-1.5 pt-2">
                    <div className="text-[11px] font-semibold text-slate-300 uppercase">Pre-Discovery Agenda Items:</div>
                    {currentClient.insights.map((ins, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2 rounded border border-slate-800">
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                        <span>{ins}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ════ TAB 2: COMPETITOR & MARKET RADAR ════ */}
          {activeTab === 'competitor_radar' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" /> Card Game & E-Commerce Competitor Matrix
                  </h3>
                  <p className="text-xs text-slate-400">Competitive benchmarking for client proposal differentiation</p>
                </div>
                <span className="text-xs text-purple-300 font-semibold px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-800">
                  Target Niche: TCG Trading & Buylist Engines
                </span>
              </div>

              {/* Competitor Benchmark Grid */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Platform</th>
                      <th className="p-3">Est. Traffic</th>
                      <th className="p-3">Buylist Payout</th>
                      <th className="p-3">Mobile Grading</th>
                      <th className="p-3">Seller Fees</th>
                      <th className="p-3">Tech Architecture</th>
                      <th className="p-3">Aeethod Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr className="bg-cyan-950/20 font-semibold text-cyan-300">
                      <td className="p-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" /> RNG Gamez (Our Client)
                      </td>
                      <td className="p-3">140k MAU</td>
                      <td className="p-3 text-emerald-400">Instant (Stripe Debit)</td>
                      <td className="p-3 text-emerald-400">AI Vision Scanner</td>
                      <td className="p-3 text-emerald-400">4.5% + 30¢</td>
                      <td className="p-3 font-mono text-[11px]">Next.js 15 + Supabase</td>
                      <td className="p-3 text-emerald-400">Sub-100ms real-time pricing sync</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">TCGPlayer Market</td>
                      <td className="p-3">4.8M MAU</td>
                      <td className="p-3 text-rose-400">4-6 Business Days</td>
                      <td className="p-3 text-rose-400">Manual / None</td>
                      <td className="p-3 text-rose-400">10.25% + fees</td>
                      <td className="p-3 font-mono text-[11px]">Legacy .NET / React 16</td>
                      <td className="p-3 text-slate-400">High seller fees, slow checkout</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">Troll and Toad</td>
                      <td className="p-3">920k MAU</td>
                      <td className="p-3 text-rose-400">Check via Mail / PayPal</td>
                      <td className="p-3 text-rose-400">None</td>
                      <td className="p-3 text-amber-400">8.0% Flat</td>
                      <td className="p-3 font-mono text-[11px]">PHP / Apache Monolith</td>
                      <td className="p-3 text-slate-400">Clunky 2012 UI, non-responsive</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">Cardmarket EU</td>
                      <td className="p-3">2.1M MAU</td>
                      <td className="p-3 text-amber-400">SEPA Bank (2-3 Days)</td>
                      <td className="p-3 text-rose-400">None</td>
                      <td className="p-3 text-emerald-400">5.0%</td>
                      <td className="p-3 font-mono text-[11px]">Symfony PHP / MySQL</td>
                      <td className="p-3 text-slate-400">EU-only focus, lacks US payment rails</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Market Gaps & Opportunities */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase">
                    <Flame className="w-4 h-4 text-purple-400" /> 1. Instant Liquidity Moat
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Card collectors hate waiting 5 business days for store credit or ACH cashouts. Offering instant 60-second Stripe Debit card transfers will attract high-volume collectors.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase">
                    <Zap className="w-4 h-4 text-cyan-400" /> 2. Camera Card Scanner
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Competitors force users to type card numbers and sets manually. Aeethod's webcam/mobile OpenCV card grader recognizes raw foils in &lt;300ms.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> 3. Live Tournament Sync
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Integrating live Swiss-bracket tournament matchmaking directly with player inventories drives 4x daily active engagement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ════ TAB 3: TECH STACK & COST LAB ════ */}
          {activeTab === 'tech_lab' && (
            <div className="space-y-6">
              {/* Cloud Cost Estimator */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" /> Client Infrastructure & Unit Economics Calculator
                  </h3>
                  <div className="text-xs text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
                    Est. Cloud Budget: ${totalCloudCost} / mo
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Slider Controls */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Monthly Active Users (MAU)</span>
                        <span className="font-mono font-bold text-cyan-400">{monthlyUsers.toLocaleString()} MAU</span>
                      </div>
                      <input
                        type="range"
                        min="10000"
                        max="1000000"
                        step="10000"
                        value={monthlyUsers}
                        onChange={e => setMonthlyUsers(Number(e.target.value))}
                        className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Database Operations / Day</span>
                        <span className="font-mono font-bold text-purple-400">{dbReadsPerDay.toLocaleString()} ops</span>
                      </div>
                      <input
                        type="range"
                        min="50000"
                        max="2000000"
                        step="50000"
                        value={dbReadsPerDay}
                        onChange={e => setDbReadsPerDay(Number(e.target.value))}
                        className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Projected Bills */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Vercel Pro</div>
                      <div className="text-lg font-bold text-cyan-400 mt-1">${vercelCost}</div>
                      <div className="text-[10px] text-slate-500">Edge compute & SSR</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Supabase Pro</div>
                      <div className="text-lg font-bold text-emerald-400 mt-1">${supabaseCost}</div>
                      <div className="text-[10px] text-slate-500">Postgres + Auth</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Cloudflare R2</div>
                      <div className="text-lg font-bold text-amber-400 mt-1">${cloudflareCost}</div>
                      <div className="text-[10px] text-slate-500">Zero egress fees</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Comparison Matrix */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" /> Framework & Dependency Comparison Matrix
                  </h3>
                  <div className="flex gap-1.5 text-xs">
                    <button
                      onClick={() => setSelectedComparison('backend')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        selectedComparison === 'backend' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Supabase vs Firebase
                    </button>
                    <button
                      onClick={() => setSelectedComparison('state')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        selectedComparison === 'state' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Zustand vs Redux
                    </button>
                    <button
                      onClick={() => setSelectedComparison('framework')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        selectedComparison === 'framework' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Next.js vs Remix
                    </button>
                  </div>
                </div>

                {selectedComparison === 'backend' && (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/50 space-y-2">
                      <div className="font-bold text-emerald-400 text-sm flex items-center justify-between">
                        <span>Supabase (Aeethod Pick)</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-900 text-emerald-200">Recommended</span>
                      </div>
                      <div className="text-slate-300">✓ Full PostgreSQL ACID compliance + pgvector for AI</div>
                      <div className="text-slate-300">✓ Built-in Row Level Security (RLS) policies</div>
                      <div className="text-slate-300">✓ Open source, no proprietary vendor lock-in</div>
                      <div className="text-slate-400 text-[11px] pt-1">Best for: Relational data, financial ledgers, buylists.</div>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="font-bold text-slate-300 text-sm">Google Firebase</div>
                      <div className="text-slate-400">✗ NoSQL Firestore queries struggle with complex joins</div>
                      <div className="text-slate-400">✗ Expensive indexing and bandwidth scaling</div>
                      <div className="text-slate-400">✓ Fast real-time listeners for micro-apps</div>
                      <div className="text-slate-500 text-[11px] pt-1">Best for: Rapid non-relational mobile prototypes.</div>
                    </div>
                  </div>
                )}

                {selectedComparison === 'state' && (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/50 space-y-2">
                      <div className="font-bold text-emerald-400 text-sm flex items-center justify-between">
                        <span>Zustand (Aeethod Pick)</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-900 text-emerald-200">1.2 KB</span>
                      </div>
                      <div className="text-slate-300">✓ Tiny 1.2 KB bundle size with zero boilerplate</div>
                      <div className="text-slate-300">✓ Transient updates (renders without re-rendering tree)</div>
                      <div className="text-slate-300">✓ TypeScript first-class inference</div>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="font-bold text-slate-300 text-sm">Redux Toolkit</div>
                      <div className="text-slate-400">✗ Heavy 11.4 KB bundle overhead</div>
                      <div className="text-slate-400">✗ Boilerplate actions and selectors</div>
                      <div className="text-slate-400">✓ Time-travel debugging tools</div>
                    </div>
                  </div>
                )}

                {selectedComparison === 'framework' && (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/50 space-y-2">
                      <div className="font-bold text-emerald-400 text-sm flex items-center justify-between">
                        <span>Next.js 15 App Router</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-900 text-emerald-200">Standard</span>
                      </div>
                      <div className="text-slate-300">✓ React Server Components (RSC) for near-zero JS payloads</div>
                      <div className="text-slate-300">✓ Server Actions for seamless mutations</div>
                      <div className="text-slate-300">✓ Built-in image and font optimization pipeline</div>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="font-bold text-slate-300 text-sm">Remix / React Router v7</div>
                      <div className="text-slate-400">✓ Excellent nested route loaders and forms</div>
                      <div className="text-slate-400">✗ Smaller ecosystem and hosting ecosystem vs Vercel Next.js</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ TAB 4: CREATIVE TREND RADAR ════ */}
          {activeTab === 'creative_trends' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Palette className="w-4 h-4 text-pink-400" /> Curated Design & UI/UX Trend Radar
                  </h3>
                  <p className="text-xs text-slate-400">Award-winning interaction patterns, typography pairings, and palettes</p>
                </div>
                <span className="text-xs text-pink-300 font-semibold px-2.5 py-1 rounded-full bg-pink-950/60 border border-pink-800">
                  Awwwards & Mobbin Live Feed
                </span>
              </div>

              {/* Design Showcase Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                  <div className="h-28 rounded-lg bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 flex items-center justify-center text-center p-3 border border-indigo-700/40">
                    <div>
                      <div className="text-xs font-black text-white tracking-widest uppercase">Dark Glass & Bento</div>
                      <div className="text-[10px] text-cyan-300 mt-1">Linear / Apple Style</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Bento Grid Dashboard</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Asymmetrical grid with high-contrast subtle 1px border highlights, 12px blur backdrops, and muted neon badges.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                  <div className="h-28 rounded-lg bg-gradient-to-br from-amber-900/60 via-stone-900 to-black flex items-center justify-center text-center p-3 border border-amber-600/40">
                    <div>
                      <div className="text-xs font-black text-amber-200 tracking-widest uppercase font-serif">Quiet Luxury</div>
                      <div className="text-[10px] text-amber-400 mt-1">Editorial Serif + Gold</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Editorial Luxury Portfolio</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      High-end serif headers (Playfair / Cormorant), Calacatta marble accents, and smooth momentum page inertia.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                  <div className="h-28 rounded-lg bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 flex items-center justify-center text-center p-3 border border-cyan-700/40">
                    <div>
                      <div className="text-xs font-black text-cyan-300 tracking-widest uppercase">Spring Physics</div>
                      <div className="text-[10px] text-emerald-400 mt-1">60fps Micro-Interactions</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Tactile Web Interactions</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Framer Motion spring physics for buttons, card tilts with cursor gyro tracking, and satisfying audio haptic clicks.
                    </p>
                  </div>
                </div>
              </div>

              {/* Color Palette & WCAG AAA Accessibility Checker */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Aeethod Studio Signature Palette & Contrast Matrix
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    100% WCAG 2.1 AAA Compliant
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-3 pt-2 text-center text-xs">
                  <div className="p-3 rounded-lg bg-[#06b6d4] text-slate-950 font-bold">
                    <div>#06b6d4</div>
                    <div className="text-[10px] opacity-80 mt-1">Cyan Accent</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#d4af37] text-slate-950 font-bold">
                    <div>#d4af37</div>
                    <div className="text-[10px] opacity-80 mt-1">Champagne Gold</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#8b5cf6] text-white font-bold">
                    <div>#8b5cf6</div>
                    <div className="text-[10px] opacity-80 mt-1">Royal Violet</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#10b981] text-slate-950 font-bold">
                    <div>#10b981</div>
                    <div className="text-[10px] opacity-80 mt-1">Active Jade</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0f172a] text-white font-bold border border-slate-700">
                    <div>#0f172a</div>
                    <div className="text-[10px] text-slate-400 mt-1">Midnight Slate</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ TAB 5: AGENCY IP & KNOWLEDGE VAULT ════ */}
          {activeTab === 'knowledge_vault' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" /> Aeethod IP Vault & Scoping Accuracy
                  </h3>
                  <p className="text-xs text-slate-400">Internal proprietary boilerplates, blueprints, and scoping historical benchmarks</p>
                </div>
                <button
                  onClick={handleClaimKP}
                  disabled={claimedKP}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    claimedKP
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  {claimedKP ? 'Research XP Claimed' : 'Claim +150 KP'}
                </button>
              </div>

              {/* Ready-to-Use Agency Starter Kits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" /> Fullstack Starter
                    </span>
                    <span className="text-[10px] text-cyan-300 font-mono">v4.2</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Next.js 15 App Router + Supabase Auth + Stripe Webhook handlers + Tailwind tokens.
                  </p>
                  <button
                    onClick={() => triggerToast('📋 Boilerplate command copied to clipboard!')}
                    className="w-full mt-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy CLI Starter
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" /> 3D WebGL Canvas
                    </span>
                    <span className="text-[10px] text-cyan-300 font-mono">v2.0</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Three.js card inspection showroom with real-time reflections, foil holos, and gyroscope tilting.
                  </p>
                  <button
                    onClick={() => triggerToast('📋 Three.js package manifest copied!')}
                    className="w-full mt-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Component
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Stripe Buylist Rail
                    </span>
                    <span className="text-[10px] text-cyan-300 font-mono">v1.8</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Instant seller debit card payouts, KYC verification flow, and escrow payment holds.
                  </p>
                  <button
                    onClick={() => triggerToast('📋 Stripe integration template copied!')}
                    className="w-full mt-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Architecture
                  </button>
                </div>
              </div>

              {/* Historical Scoping Accuracy Benchmark */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" /> Historical Project Scoping Accuracy
                </h4>
                <p className="text-xs text-slate-400">
                  Data-driven variance analysis between estimated client proposal hours and actual engineering hours delivered.
                </p>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-xs font-bold text-white">Essential Package</div>
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>Est: 40 hrs</span>
                      <span className="text-emerald-400">Actual: 38 hrs</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-1">95.0% Accuracy</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-xs font-bold text-white">Professional Package</div>
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>Est: 120 hrs</span>
                      <span className="text-emerald-400">Actual: 114 hrs</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-1">95.2% Accuracy</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-xs font-bold text-white">Enterprise Tier</div>
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>Est: 320 hrs</span>
                      <span className="text-amber-400">Actual: 334 hrs</span>
                    </div>
                    <div className="text-[10px] text-amber-400 font-semibold mt-1">95.6% Accuracy</div>
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
            <span>Aeethod Intel Node: connected to plan & meeting room bus</span>
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
