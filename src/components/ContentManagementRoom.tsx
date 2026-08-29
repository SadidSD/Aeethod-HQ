import React, { useState, useEffect, useMemo } from 'react';
import {
  Lightbulb,
  FileEdit,
  Video,
  Scissors,
  Sparkles,
  CheckCircle2,
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Target,
  Calendar as CalendarIcon,
  Tag,
  AlertCircle,
  CheckSquare,
  RotateCcw,
  Flame,
  Film,
  Images,
  CircleDot,
  FileText,
  Search,
  Check,
  ChevronDown,
  Trash2,
  CalendarDays,
  X,
  Type,
  Music,
} from 'lucide-react';
import { AgencyState } from '../core/agencyTypes';
import AgencyManager from '../core/agency';
import { getMultiplayerManager } from '../core/multiplayer';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PostFormat = 'reel' | 'carousel' | 'story';
export type PostStatus = 'idea' | 'scripted' | 'shot' | 'editing' | 'ready' | 'published';
export type ContentPillar = 'platform_pain' | 'solution' | 'education' | 'comparison' | 'case_study';
export type ScriptFormula = 'pas' | 'bab' | 'list' | 'opinion';
export type FunnelStage = 'awareness' | 'education' | 'trust' | 'conversion';

export interface ContentPost {
  id: string;
  title: string;
  caption?: string;
  format: PostFormat;
  pillar: ContentPillar;
  formula?: ScriptFormula;
  funnel?: FunnelStage;
  status: PostStatus;
  hookText?: string;
  retainText?: string;
  rewardText?: string;
  fullScript?: string;
  brollNotes?: string;
  textOverlays?: string;
  audioCues?: string;
  hasValue: boolean;
  hasVulnerability: boolean;
  hasAuthority: boolean;
  scheduledDate?: string; // YYYY-MM-DD
  cta?: string;
}

interface ContentManagementRoomProps {
  agency: AgencyState;
  manager: AgencyManager;
  onClose: () => void;
  onRefresh: () => void;
}

// ── Default Seed Posts ────────────────────────────────────────────────────────

const DEFAULT_POSTS: ContentPost[] = [
  {
    id: 'post-1',
    title: 'TCGplayer fees are stealing your profit',
    caption: 'Why paying 10% in platform fees is slowly draining your TCG store margin...',
    format: 'reel',
    pillar: 'platform_pain',
    formula: 'pas',
    funnel: 'awareness',
    status: 'published',
    hookText: 'TCGplayer just took $10,000 from this store last year.',
    retainText: "You're paying 8.95% fees plus listing fees, but you don't have to.",
    rewardText: "Build your own website. DM me 'TCG' to see how.",
    fullScript: 'If you run a TCG store, stop paying 10% in platform fees. Here is how custom inventory sync saves $10K/year.',
    hasValue: true,
    hasVulnerability: true,
    hasAuthority: true,
    scheduledDate: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 'post-2',
    title: 'Build Your Own Website vs TCGplayer',
    caption: 'Comparing customer ownership between marketplace sellers and direct store brands.',
    format: 'reel',
    pillar: 'solution',
    formula: 'bab',
    funnel: 'awareness',
    status: 'published',
    hookText: 'Who actually owns your customers?',
    retainText: 'On TCGplayer, they belong to the marketplace. On your own store, they belong to you.',
    rewardText: 'DM "OWN" to claim your free website architecture guide.',
    hasValue: true,
    hasVulnerability: false,
    hasAuthority: true,
    scheduledDate: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 'post-3',
    title: 'Before & After: How this TCG store saved $30K',
    caption: 'Full case study teardown of inventory sync & direct checkout.',
    format: 'reel',
    pillar: 'case_study',
    formula: 'bab',
    funnel: 'trust',
    status: 'ready',
    hookText: 'This single change added $30,000 back to an Ohio card shop.',
    retainText: 'We migrated their high-value inventory from marketplace-only to automated multi-channel.',
    rewardText: 'DM "CASE" for the full breakdown.',
    fullScript: 'Case study time: An Ohio store owner was losing $2,500 every single month to marketplace commission...',
    hasValue: true,
    hasVulnerability: true,
    hasAuthority: true,
    scheduledDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 'post-4',
    title: 'Shopify vs Custom Architecture for TCG',
    caption: 'Why generic Shopify stores break down when handling 20,000 card SKUs.',
    format: 'carousel',
    pillar: 'comparison',
    formula: 'list',
    funnel: 'education',
    status: 'editing',
    hookText: 'Why Shopify fails for trading card stores.',
    retainText: 'Variant limits, buylist friction, and pricing sync latency cause huge overselling risks.',
    rewardText: 'Swipe to see the custom stack comparison.',
    hasValue: true,
    hasVulnerability: false,
    hasAuthority: true,
    scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 'post-5',
    title: 'Watch AI list 100 cards in 30 seconds',
    caption: 'Live demo of computer vision scanning and condition grading workflow.',
    format: 'reel',
    pillar: 'solution',
    formula: 'pas',
    funnel: 'education',
    status: 'shot',
    hookText: 'Stop typing card titles manually.',
    retainText: 'Scanning 100 Pokemon cards with camera AI directly into your live storefront.',
    rewardText: 'DM "SCAN" to test the tool.',
    brollNotes: '[0-3s] Quick camera pan across graded slabs\n[4-10s] Mobile phone scanning a card\n[10-20s] Live store inventory instantly updating',
    hasValue: true,
    hasVulnerability: false,
    hasAuthority: true,
    scheduledDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 'post-6',
    title: 'PAS: TCG Buylist Automation',
    caption: 'How to accept card trade-ins online without drowning in manual spreadsheets.',
    format: 'reel',
    pillar: 'solution',
    formula: 'pas',
    funnel: 'education',
    status: 'scripted',
    hookText: 'The manual buylist nightmare ends here.',
    retainText: 'Store owners spend 15 hours a week manually looking up prices for customer collections.',
    rewardText: 'Automate trade-in quotes directly on your website.',
    fullScript: 'Problem: Customers bring boxes of cards and your staff takes 2 hours to price them. Solution: Automatic buylist pricing synced to TCG market value.',
    hasValue: true,
    hasVulnerability: true,
    hasAuthority: true,
    scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 'post-7',
    title: 'Is TCGplayer owning your business?',
    caption: 'Account suspensions happen without warning. Are you protected?',
    format: 'reel',
    pillar: 'platform_pain',
    formula: 'opinion',
    funnel: 'awareness',
    status: 'idea',
    hookText: 'What happens if your seller account gets locked tomorrow?',
    hasValue: true,
    hasVulnerability: true,
    hasAuthority: false,
  },
  {
    id: 'post-8',
    title: 'SortSwift vs TCG Sync vs Custom Code',
    caption: 'Full technical comparison of automation software available in 2026.',
    format: 'carousel',
    pillar: 'comparison',
    formula: 'list',
    funnel: 'trust',
    status: 'idea',
    hookText: 'Which inventory sync tool actually prevents double-selling?',
    hasValue: true,
    hasVulnerability: false,
    hasAuthority: true,
  },
  {
    id: 'post-9',
    title: 'TCG Pricing Automation: Real Results',
    caption: 'Dynamic repricing algorithms vs manual pricing updates.',
    format: 'reel',
    pillar: 'education',
    formula: 'list',
    funnel: 'education',
    status: 'idea',
    hookText: 'Never leave card prices outdated during market spikes.',
    hasValue: true,
    hasVulnerability: false,
    hasAuthority: true,
  },
];

// ── 90-Day Plan Topics ────────────────────────────────────────────────────────

const NINETY_DAY_TOPICS: { title: string; pillar: ContentPillar; funnel: FunnelStage }[] = [
  // Month 1: Awareness & Pain
  { title: 'TCGplayer fees are stealing your profit', pillar: 'platform_pain', funnel: 'awareness' },
  { title: '5 signs you have outgrown TCGplayer', pillar: 'platform_pain', funnel: 'awareness' },
  { title: 'TCG store owners: Stop overselling cards', pillar: 'platform_pain', funnel: 'awareness' },
  { title: 'The Pro Website Trap explained', pillar: 'platform_pain', funnel: 'awareness' },
  { title: 'How to calculate your true fee costs', pillar: 'education', funnel: 'awareness' },
  { title: 'Why your TCG store is losing margin', pillar: 'platform_pain', funnel: 'awareness' },
  { title: 'TCG inventory management nightmare', pillar: 'platform_pain', funnel: 'awareness' },
  { title: 'Manual listing vs AI automation', pillar: 'comparison', funnel: 'awareness' },
  { title: 'TCG store burnout: Stop working 80h weeks', pillar: 'platform_pain', funnel: 'awareness' },
  { title: 'TCG account suspension: Real story', pillar: 'platform_pain', funnel: 'awareness' },
  { title: 'Multi-channel sync failure explained', pillar: 'education', funnel: 'awareness' },
  { title: 'Is TCGplayer owning your business?', pillar: 'platform_pain', funnel: 'awareness' },

  // Month 2: Solution & Education
  { title: 'Watch AI list 100 cards in 30 seconds', pillar: 'solution', funnel: 'education' },
  { title: 'How a custom website saves $10K in fees', pillar: 'solution', funnel: 'education' },
  { title: 'The modern TCG store technology stack', pillar: 'education', funnel: 'education' },
  { title: 'Shopify vs Custom for TCG stores', pillar: 'comparison', funnel: 'education' },
  { title: 'Real-time sync: Marketplace to Website', pillar: 'solution', funnel: 'education' },
  { title: 'Automated card buylist explained', pillar: 'solution', funnel: 'education' },
  { title: 'TCG industry growth trends 2026', pillar: 'education', funnel: 'education' },
  { title: 'How to scale a single card inventory', pillar: 'education', funnel: 'education' },
  { title: 'TCG website must-have technical features', pillar: 'education', funnel: 'education' },
  { title: 'Inventory management for high-volume stores', pillar: 'solution', funnel: 'education' },
  { title: 'Dynamic pricing automation breakdown', pillar: 'solution', funnel: 'education' },
  { title: 'Customer retention in physical card shops', pillar: 'education', funnel: 'education' },

  // Month 3: Case Study & Conversion
  { title: 'This TCG store saved $30,000 in Year 1', pillar: 'case_study', funnel: 'trust' },
  { title: 'Store automation: Live client metrics', pillar: 'case_study', funnel: 'trust' },
  { title: 'Client interview: Why they left generic SaaS', pillar: 'case_study', funnel: 'trust' },
  { title: 'TCG storefront before vs after redesign', pillar: 'case_study', funnel: 'trust' },
  { title: 'How this store grew online sales 300%', pillar: 'case_study', funnel: 'trust' },
  { title: 'Custom website ROI breakdown', pillar: 'case_study', funnel: 'trust' },
  { title: 'SortSwift vs TCG Sync vs Custom Platform', pillar: 'comparison', funnel: 'trust' },
  { title: 'Top TCG management tools compared', pillar: 'comparison', funnel: 'trust' },
  { title: 'Why 7-figure stores build custom tech', pillar: 'case_study', funnel: 'trust' },
  { title: '3 TCG platforms built this quarter', pillar: 'case_study', funnel: 'conversion' },
  { title: 'Why we build dedicated TCG systems', pillar: 'case_study', funnel: 'conversion' },
  { title: 'DM me "TCG" for a free systems audit', pillar: 'case_study', funnel: 'conversion' },
];

export default function ContentManagementRoom({
  agency,
  manager,
  onClose,
  onRefresh,
}: ContentManagementRoomProps) {
  // ── State Persistence ─────────────────────────────────────────────────────────

  const [posts, setPosts] = useState<ContentPost[]>(() => {
    const saved = localStorage.getItem('factory_content_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_POSTS;
  });

  const [engagement, setEngagement] = useState<{
    engagedTcg: boolean;
    repliedComments: boolean;
    dmedOwners: boolean;
    watchedReels: boolean;
  }>(() => {
    const saved = localStorage.getItem('factory_content_engagement');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const todayStr = new Date().toISOString().split('T')[0];
        if (parsed.date === todayStr) {
          return parsed.data;
        }
      } catch (e) {}
    }
    return {
      engagedTcg: true,
      repliedComments: true,
      dmedOwners: true,
      watchedReels: false,
    };
  });

  // Multiplayer Real-Time Sync
  const multiplayer = useMemo(() => getMultiplayerManager(), []);

  useEffect(() => {
    multiplayer.onBoardUpdate = (type, data) => {
      if (type === 'post_sync' && Array.isArray(data)) {
        setPosts(data);
      }
    };
  }, [multiplayer]);

  // Save changes locally and broadcast to connected office players
  useEffect(() => {
    localStorage.setItem('factory_content_posts', JSON.stringify(posts));
    multiplayer.broadcastBoardUpdate('post_sync', posts);
  }, [posts, multiplayer]);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem(
      'factory_content_engagement',
      JSON.stringify({ date: todayStr, data: engagement })
    );
  }, [engagement]);

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // ── Scripting Studio Dialog State ───────────────────────────────────────────

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ContentPost | null>(null);
  const [editorTab, setEditorTab] = useState<'script' | 'structure' | 'broll' | 'meta'>('script');

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formPillar, setFormPillar] = useState<ContentPillar>('platform_pain');
  const [formFormat, setFormFormat] = useState<PostFormat>('reel');
  const [formStatus, setFormStatus] = useState<PostStatus>('idea');
  const [formHook, setFormHook] = useState('');
  const [formRetain, setFormRetain] = useState('');
  const [formReward, setFormReward] = useState('');
  const [formFullScript, setFormFullScript] = useState('');
  const [formBroll, setFormBroll] = useState('');
  const [formTextOverlays, setFormTextOverlays] = useState('');
  const [formAudioCues, setFormAudioCues] = useState('');
  const [formHasValue, setFormHasValue] = useState(true);
  const [formHasVulnerability, setFormHasVulnerability] = useState(true);
  const [formHasAuthority, setFormHasAuthority] = useState(false);
  const [formDate, setFormDate] = useState('');

  const openCreateDialog = (initialDate?: string) => {
    setEditingPost(null);
    setFormTitle('');
    setFormPillar('platform_pain');
    setFormFormat('reel');
    setFormStatus('idea');
    setFormHook('');
    setFormRetain('');
    setFormReward('');
    setFormFullScript('');
    setFormBroll('');
    setFormTextOverlays('');
    setFormAudioCues('');
    setFormHasValue(true);
    setFormHasVulnerability(true);
    setFormHasAuthority(false);
    setFormDate(initialDate || new Date().toISOString().split('T')[0]);
    setEditorTab('script');
    setIsEditorOpen(true);
  };

  const openEditDialog = (post: ContentPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormPillar(post.pillar);
    setFormFormat(post.format);
    setFormStatus(post.status);
    setFormHook(post.hookText || '');
    setFormRetain(post.retainText || '');
    setFormReward(post.rewardText || '');
    setFormFullScript(post.fullScript || '');
    setFormBroll(post.brollNotes || '');
    setFormTextOverlays(post.textOverlays || '');
    setFormAudioCues(post.audioCues || '');
    setFormHasValue(post.hasValue);
    setFormHasVulnerability(post.hasVulnerability);
    setFormHasAuthority(post.hasAuthority);
    setFormDate(post.scheduledDate || '');
    setEditorTab('script');
    setIsEditorOpen(true);
  };

  const savePost = (statusOverride?: PostStatus) => {
    if (!formTitle.trim()) return;

    const targetStatus = statusOverride || formStatus;
    const postData: ContentPost = {
      id: editingPost ? editingPost.id : `post-${Date.now()}`,
      title: formTitle.trim(),
      pillar: formPillar,
      format: formFormat,
      status: targetStatus,
      hookText: formHook,
      retainText: formRetain,
      rewardText: formReward,
      fullScript: formFullScript,
      brollNotes: formBroll,
      textOverlays: formTextOverlays,
      audioCues: formAudioCues,
      hasValue: formHasValue,
      hasVulnerability: formHasVulnerability,
      hasAuthority: formHasAuthority,
      scheduledDate: formDate || undefined,
    };

    if (editingPost) {
      setPosts((prev) => prev.map((p) => (p.id === editingPost.id ? postData : p)));
    } else {
      setPosts((prev) => [postData, ...prev]);
      manager.addXP(25); // Gamified XP reward for creating a post in the agency!
      onRefresh();
    }

    setIsEditorOpen(false);
  };

  const advancePostStatus = (postId: string, nextStatus: PostStatus) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status: nextStatus } : p))
    );
    manager.addXP(15);
    onRefresh();
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // ── 90-Day Plan Auto-Populate ────────────────────────────────────────────────

  const populateNinetyDayPlan = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon
    const daysUntilNextMon = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7 || 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + daysUntilNextMon);

    const newPosts: ContentPost[] = NINETY_DAY_TOPICS.map((topic, i) => {
      const weekIndex = Math.floor(i / 3);
      const dayOffset = i % 3 === 0 ? 0 : i % 3 === 1 ? 2 : 4; // Mon (+0), Wed (+2), Fri (+4)
      const postDate = new Date(startDate);
      postDate.setDate(startDate.getDate() + weekIndex * 7 + dayOffset);

      return {
        id: `ninety-${i}-${Date.now()}`,
        title: topic.title,
        pillar: topic.pillar,
        funnel: topic.funnel,
        format: 'reel',
        status: 'idea',
        hasValue: true,
        hasVulnerability: true,
        hasAuthority: false,
        scheduledDate: postDate.toISOString().split('T')[0],
        cta: 'DM me "TCG" to see how I can help.',
      };
    });

    setPosts((prev) => [...newPosts, ...prev]);
    manager.addXP(150);
    onRefresh();
  };

  // ── Calculations ─────────────────────────────────────────────────────────────

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthPosts = posts.filter((p) => {
    if (!p.scheduledDate) return false;
    const d = new Date(p.scheduledDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const inPipelineCount = posts.filter(
    (p) => p.status === 'idea' || p.status === 'scripted' || p.status === 'shot' || p.status === 'editing' || p.status === 'ready'
  ).length;

  const thisWeekPostsCount = posts.filter((p) => {
    if (!p.scheduledDate) return false;
    const d = new Date(p.scheduledDate);
    const diff = (d.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diff >= -3 && diff <= 4;
  }).length;

  // Calendar navigation state
  const [calendarMonth, setCalendarMonth] = useState(new Date(currentYear, currentMonth, 1));
  const calYear = calendarMonth.getFullYear();
  const calMonth = calendarMonth.getMonth();
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  // Table filter state
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState('all');
  const [tablePillarFilter, setTablePillarFilter] = useState('all');

  const filteredPosts = posts.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(tableSearch.toLowerCase());
    const matchesStatus = tableStatusFilter === 'all' || p.status === tableStatusFilter;
    const matchesPillar = tablePillarFilter === 'all' || p.pillar === tablePillarFilter;
    return matchesSearch && matchesStatus && matchesPillar;
  });

  // Pillar counts
  const pillarStats = useMemo(() => {
    const counts: Record<ContentPillar, number> = {
      platform_pain: 0,
      solution: 0,
      education: 0,
      comparison: 0,
      case_study: 0,
    };
    posts.forEach((p) => {
      if (counts[p.pillar] !== undefined) counts[p.pillar]++;
    });
    const total = posts.length || 1;
    return [
      { id: 'platform_pain', label: 'Platform Pain', count: counts.platform_pain, pct: Math.round((counts.platform_pain / total) * 100), color: 'bg-rose-500', text: 'text-rose-400' },
      { id: 'solution', label: 'Solution', count: counts.solution, pct: Math.round((counts.solution / total) * 100), color: 'bg-cyan-500', text: 'text-cyan-400' },
      { id: 'education', label: 'Education', count: counts.education, pct: Math.round((counts.education / total) * 100), color: 'bg-amber-500', text: 'text-amber-400' },
      { id: 'comparison', label: 'Comparison', count: counts.comparison, pct: Math.round((counts.comparison / total) * 100), color: 'bg-purple-500', text: 'text-purple-400' },
      { id: 'case_study', label: 'Case Study', count: counts.case_study, pct: Math.round((counts.case_study / total) * 100), color: 'bg-emerald-500', text: 'text-emerald-400' },
    ];
  }, [posts]);

  const zeroPillars = pillarStats.filter((p) => p.count === 0);

  // Engagement stats
  const completedHabits = Object.values(engagement).filter(Boolean).length;
  const habitPercentage = Math.round((completedHabits / 4) * 100);

  // Word count & duration calculation
  const wordCount = formFullScript.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.ceil(wordCount / 2.5);

  const vvaCount = [formHasValue, formHasVulnerability, formHasAuthority].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-6xl bg-[#0c1219] border border-cyan-500/40 rounded-xl shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-slate-200">
        
        {/* ───────────────────────────────────────────────────────────────────
            Header Top Bar: Section 1
        ─────────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2.5 px-6 py-4 bg-[#101820] border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🎬</span>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-mono tracking-wide text-cyan-400">
                  CONTENT MANAGEMENT ROOM — {agency.agency.name || 'Aeethod'} — Founder
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                  <span>📅 {now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span>⏰ {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-cyan-500/80">• Personal Branding & Sales Engine</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => populateNinetyDayPlan()}
                className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 rounded text-xs font-bold font-mono transition flex items-center gap-1.5"
              >
                <CalendarDays className="h-3.5 w-3.5 text-purple-400" />
                ⚡ 90-Day Plan
              </button>
              <button
                onClick={() => openCreateDialog()}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                New Idea
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 rounded text-xs font-mono transition ml-1"
              >
                ESC
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
                📊 Content Health: 🟢 Excellent
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800/60 border border-slate-700 text-slate-300">
                🔄 Pipeline: <strong className="text-cyan-400">{inPipelineCount} Posts</strong>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800/60 border border-slate-700 text-slate-300">
                📅 This Month: <strong className="text-cyan-400">{monthPosts.length} Posts</strong>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800/60 border border-slate-700 text-slate-300">
                🎯 Weekly Target: <strong className="text-emerald-400">{Math.min(thisWeekPostsCount, 3)}/3</strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Ken Tjandra Framework: AAA • Triple C • VVA
            </span>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────
            Main Scrollable Workspace
        ─────────────────────────────────────────────────────────────────── */}
        <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(92vh-115px)] text-slate-300">
          
          {/* Section 2: 🔄 PRODUCTION PIPELINE (6-Stage Kanban) */}
          <div className="bg-[#101820]/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-cyan-400 flex items-center gap-2">
                <span>🔄 PRODUCTION PIPELINE (6-Stage Kanban)</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Click any card to edit script • 1-click stage advancement
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {[
                { stage: 'idea' as PostStatus, title: '💡 IDEAS', icon: Lightbulb, color: 'border-slate-700/60 bg-slate-900/40 text-slate-300', next: 'scripted' as PostStatus, label: 'Scripted ✍️' },
                { stage: 'scripted' as PostStatus, title: '✍️ SCRIPTED', icon: FileEdit, color: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300', next: 'shot' as PostStatus, label: 'Mark Shot 🎥' },
                { stage: 'shot' as PostStatus, title: '🎥 SHOT', icon: Video, color: 'border-orange-500/30 bg-orange-950/20 text-orange-300', next: 'editing' as PostStatus, label: 'Editing ✂️' },
                { stage: 'editing' as PostStatus, title: '✂️ EDITING', icon: Scissors, color: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300', next: 'ready' as PostStatus, label: 'Mark Ready ✨' },
                { stage: 'ready' as PostStatus, title: '✨ READY', icon: Sparkles, color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300', next: 'published' as PostStatus, label: 'Mark Posted 🚀' },
                { stage: 'published' as PostStatus, title: '🚀 POSTED', icon: CheckCircle2, color: 'border-pink-500/30 bg-pink-950/20 text-pink-300', next: null, label: null },
              ].map((col) => {
                const stagePosts = posts.filter((p) => p.status === col.stage);
                return (
                  <div key={col.stage} className={`rounded-lg border p-2.5 flex flex-col min-h-[260px] ${col.color}`}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                      <span className="text-[11px] font-bold font-mono">{col.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/40 border border-slate-700 text-slate-400 font-bold">
                        {stagePosts.length}
                      </span>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-0.5">
                      {stagePosts.length === 0 ? (
                        <div className="h-20 border border-dashed border-slate-800 rounded flex items-center justify-center text-[10px] text-slate-500 text-center">
                          Empty
                        </div>
                      ) : (
                        stagePosts.map((post) => (
                          <div
                            key={post.id}
                            onClick={() => openEditDialog(post)}
                            className="bg-[#141d27] border border-slate-800 hover:border-cyan-500/60 rounded p-2 text-xs space-y-1.5 cursor-pointer transition group shadow-xs"
                          >
                            <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-tight">
                              📌 {post.title}
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="capitalize text-cyan-400/80">{post.pillar.replace('_', ' ')}</span>
                              <span>{post.format === 'reel' ? '🎥' : post.format === 'carousel' ? '🖼️' : '🔘'}</span>
                            </div>

                            {col.next && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  advancePostStatus(post.id, col.next!);
                                }}
                                className="w-full mt-1 py-1 bg-slate-800/90 hover:bg-cyan-600 text-slate-300 hover:text-white rounded text-[10px] font-mono font-medium flex items-center justify-center gap-1 transition"
                              >
                                <span>{col.label}</span>
                                <ArrowRight className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3 & 4: Analytics (Left) & Pillar Balance (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 📊 CONTENT ANALYTICS */}
            <div className="bg-[#101820]/90 border border-slate-800 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-cyan-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>📊 CONTENT ANALYTICS</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Target: 21 Posts / Month
                </span>
              </div>

              <div className="space-y-2 bg-[#0b1016] p-3 rounded-lg border border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">📈 Posts by Week</span>
                {[
                  { week: 'Week 1', count: 4, bar: 'w-4/5' },
                  { week: 'Week 2', count: 6, bar: 'w-full' },
                  { week: 'Week 3', count: 4, bar: 'w-4/5' },
                  { week: 'Week 4', count: 3, bar: 'w-3/5' },
                ].map((w, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">{w.week}</span>
                      <span className="text-cyan-400 font-semibold">{w.count} Posts</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-cyan-500 rounded-full ${w.bar}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 text-xs font-mono">
                <span>📅 This Month: <strong className="text-cyan-400">{monthPosts.length} Posts</strong></span>
                <span>🎯 Target: 21 Posts (<strong className="text-emerald-400">{Math.round((monthPosts.length / 21) * 100)}%</strong>)</span>
              </div>
            </div>

            {/* 🏷️ PILLAR BALANCE */}
            <div className="bg-[#101820]/90 border border-slate-800 rounded-xl p-4 space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-cyan-400 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>🏷️ PILLAR BALANCE</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {posts.length} Total Posts
                  </span>
                </div>

                <div className="space-y-2.5 bg-[#0b1016] p-3 rounded-lg border border-slate-800/80">
                  {pillarStats.map((p) => (
                    <div key={p.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={p.text}>{p.label}</span>
                        <span className="text-slate-300 font-bold">{p.pct}% ({p.count} posts)</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${p.color} rounded-full transition-all duration-500`} style={{ width: `${p.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {zeroPillars.length > 0 ? (
                <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>⚠️ Warning: &quot;{zeroPillars.map((p) => p.label).join(', ')}&quot; has 0 posts this month!</span>
                </div>
              ) : (
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>All 5 content pillars actively represented.</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: 📅 CONTENT CALENDAR (Full Width) */}
          <div className="bg-[#101820]/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-400">
                <CalendarIcon className="h-4 w-4" />
                <span>📅 CONTENT CALENDAR — {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-cyan-500/80 hidden sm:inline">
                  📌 Mon / Wed / Fri highlighted (Posting Days)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCalendarMonth(new Date(calYear, calMonth - 1, 1))}
                    className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setCalendarMonth(new Date(calYear, calMonth + 1, 1))}
                    className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="py-1 text-center font-mono font-bold text-slate-400 uppercase text-[10px] bg-slate-900/60 rounded">
                  {day}
                </div>
              ))}

              {Array.from({ length: (firstDayIndex + 6) % 7 }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-20 bg-slate-950/30 rounded border border-slate-900/40 p-1 opacity-30" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNumber = idx + 1;
                const d = new Date(calYear, calMonth, dayNumber);
                const dayOfWeek = d.getDay();
                const isPostingDay = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5; // Mon, Wed, Fri
                const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                const dayPosts = posts.filter((p) => p.scheduledDate === dateKey);

                return (
                  <div
                    key={dayNumber}
                    onClick={() => openCreateDialog(dateKey)}
                    className={`h-20 p-1.5 rounded border transition-colors cursor-pointer flex flex-col justify-between ${
                      isPostingDay
                        ? 'bg-cyan-950/15 border-cyan-500/30 hover:border-cyan-400'
                        : 'bg-[#0e141c] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className={isPostingDay ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
                        [{dayNumber}]
                      </span>
                      {isPostingDay && <span className="text-[9px] text-cyan-500">Drop</span>}
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      {dayPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(post);
                          }}
                          className="px-1 py-0.5 rounded bg-slate-800/90 text-cyan-300 text-[10px] font-mono truncate hover:bg-cyan-700 hover:text-white"
                          title={post.title}
                        >
                          {post.status === 'published' ? '🚀' : post.status === 'ready' ? '✨' : post.status === 'editing' ? '✂️' : post.status === 'shot' ? '🎥' : '📝'}{' '}
                          {post.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 6 & 7: Post List (Left) & Daily Engagement Checklist (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 📋 POST LIST (Table View) */}
            <div className="bg-[#101820]/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-cyan-400 flex items-center gap-2">
                  <span>📋 POST LIST (Table View)</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {filteredPosts.length} of {posts.length} Posts
                </span>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 text-xs">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    placeholder="Search posts..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="w-full bg-[#0b1016] border border-slate-800 rounded pl-8 pr-2 py-1 text-xs text-slate-200 font-mono"
                  />
                </div>
                <select
                  value={tableStatusFilter}
                  onChange={(e) => setTableStatusFilter(e.target.value)}
                  className="bg-[#0b1016] border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 font-mono"
                >
                  <option value="all">All Status</option>
                  <option value="idea">Idea 💡</option>
                  <option value="scripted">Scripted ✍️</option>
                  <option value="shot">Shot 🎥</option>
                  <option value="editing">Editing ✂️</option>
                  <option value="ready">Ready ✨</option>
                  <option value="published">Posted 🚀</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto max-h-[260px]">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                      <th className="pb-1.5 font-bold">Title</th>
                      <th className="pb-1.5 font-bold">Status</th>
                      <th className="pb-1.5 font-bold">Pillar</th>
                      <th className="pb-1.5 font-bold">VVA</th>
                      <th className="pb-1.5 font-bold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredPosts.map((post) => {
                      const vva = [post.hasValue, post.hasVulnerability, post.hasAuthority].filter(Boolean).length;
                      return (
                        <tr
                          key={post.id}
                          onClick={() => openEditDialog(post)}
                          className="hover:bg-slate-800/40 cursor-pointer transition"
                        >
                          <td className="py-2 pr-2 font-medium text-slate-200 truncate max-w-[150px]">
                            {post.title}
                          </td>
                          <td className="py-2 pr-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                              {post.status === 'published' ? '🚀' : post.status === 'ready' ? '✨' : post.status === 'editing' ? '✂️' : post.status === 'shot' ? '🎥' : post.status === 'scripted' ? '✍️' : '💡'}{' '}
                              {post.status}
                            </span>
                          </td>
                          <td className="py-2 pr-2 text-slate-400 capitalize">
                            {post.pillar.replace('_', ' ')}
                          </td>
                          <td className="py-2 pr-2 text-emerald-400">
                            {'✅'.repeat(vva)}
                          </td>
                          <td className="py-2 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePost(post.id);
                              }}
                              className="text-slate-500 hover:text-rose-400 transition"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 📝 DAILY ENGAGEMENT CHECKLIST */}
            <div className="bg-[#101820]/90 border border-slate-800 rounded-xl p-4 space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-cyan-400 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    <span>📝 DAILY ENGAGEMENT CHECKLIST</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    Daily 30-min habit
                  </span>
                </div>

                <div className="space-y-3 bg-[#0b1016] p-3 rounded-lg border border-slate-800/80 text-xs font-mono">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={engagement.engagedTcg}
                      onChange={(e) => setEngagement({ ...engagement, engagedTcg: e.target.checked })}
                      className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500"
                    />
                    <div>
                      <span className="text-slate-200 font-semibold">☑️ Engaged with TCG content</span>
                      <span className="block text-[11px] text-slate-400">15-20 likes, 3-5 thoughtful comments</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={engagement.repliedComments}
                      onChange={(e) => setEngagement({ ...engagement, repliedComments: e.target.checked })}
                      className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500"
                    />
                    <div>
                      <span className="text-slate-200 font-semibold">☑️ Replied to ALL comments and DMs</span>
                      <span className="block text-[11px] text-slate-400">Build warm store owner relationships</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={engagement.dmedOwners}
                      onChange={(e) => setEngagement({ ...engagement, dmedOwners: e.target.checked })}
                      className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500"
                    />
                    <div>
                      <span className="text-slate-200 font-semibold">☑️ DM&apos;d 2-3 TCG store owners</span>
                      <span className="block text-[11px] text-slate-400">Direct outbound founder conversation</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={engagement.watchedReels}
                      onChange={(e) => setEngagement({ ...engagement, watchedReels: e.target.checked })}
                      className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500"
                    />
                    <div>
                      <span className="text-slate-200 font-semibold">☑️ Watched TCG Reels (saved 3-5)</span>
                      <span className="block text-[11px] text-slate-400">Market warming & research hooks</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-2 pt-1 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-orange-400" />
                    <span>Progress: <strong className="text-cyan-400">{completedHabits}/4</strong> ({habitPercentage}%)</span>
                  </span>
                  <button
                    onClick={() => setEngagement({ engagedTcg: false, repliedComments: false, dmedOwners: false, watchedReels: false })}
                    className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${habitPercentage}%` }} />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#101820] border-t border-slate-800 flex justify-between items-center text-xs font-mono text-slate-500">
          <span>Press ESC or click Done to return to office</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition"
          >
            Done
          </button>
        </div>

      </div>

      {/* ───────────────────────────────────────────────────────────────────
          Scripting Studio Modal (Post Editor)
      ─────────────────────────────────────────────────────────────────── */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-3">
          <div className="w-full max-w-2xl bg-[#0c1219] border border-cyan-500/60 rounded-xl shadow-2xl p-5 space-y-4 max-h-[88vh] overflow-y-auto font-mono text-xs text-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                  <span>📝 SCRIPTING STUDIO</span>
                  <span className="text-slate-400 font-normal text-xs">
                    {editingPost ? '— Edit Post' : '— New Content Idea'}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Title & Core Fields */}
            <div className="space-y-2">
              <label className="block text-[11px] text-slate-400 uppercase font-bold">Post Title / Main Hook</label>
              <input
                required
                placeholder="e.g., TCGplayer just took $10,000 from this store..."
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-[#121b26] border border-slate-700 rounded p-2 text-xs text-slate-100 font-semibold"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Content Pillar</label>
                <select
                  value={formPillar}
                  onChange={(e) => setFormPillar(e.target.value as ContentPillar)}
                  className="w-full bg-[#121b26] border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                >
                  <option value="platform_pain">Platform Pain</option>
                  <option value="solution">Solution</option>
                  <option value="education">Education</option>
                  <option value="comparison">Comparison</option>
                  <option value="case_study">Case Study</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Format</label>
                <select
                  value={formFormat}
                  onChange={(e) => setFormFormat(e.target.value as PostFormat)}
                  className="w-full bg-[#121b26] border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                >
                  <option value="reel">Reel 🎥</option>
                  <option value="carousel">Carousel 🖼️</option>
                  <option value="story">Story 🔘</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as PostStatus)}
                  className="w-full bg-[#121b26] border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                >
                  <option value="idea">Idea 💡</option>
                  <option value="scripted">Scripted ✍️</option>
                  <option value="shot">Shot 🎥</option>
                  <option value="editing">Editing ✂️</option>
                  <option value="ready">Ready ✨</option>
                  <option value="published">Posted 🚀</option>
                </select>
              </div>
            </div>

            {/* Scripting Studio Tabs */}
            <div className="border border-slate-800 rounded-lg p-3 space-y-3 bg-[#0a0f14]">
              <div className="flex border-b border-slate-800 pb-2 gap-2 text-xs">
                {[
                  { id: 'script' as const, label: '💬 Spoken Script' },
                  { id: 'structure' as const, label: '🎯 3-Part Story' },
                  { id: 'broll' as const, label: '🎥 B-Roll & Cues' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setEditorTab(t.id)}
                    className={`px-2.5 py-1 rounded text-xs transition ${
                      editorTab === t.id
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {editorTab === 'script' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Teleprompter Dialogue Lines:</span>
                    <span className="text-cyan-400">
                      📊 {wordCount} words • ⏱️ ~{estimatedSeconds}s speech
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    placeholder={`"If you run a TCG store, stop paying 10% in platform fees...\nHere is how we built a custom web platform that synced TCGplayer with Shopify..."`}
                    value={formFullScript}
                    onChange={(e) => setFormFullScript(e.target.value)}
                    className="w-full bg-[#121b26] border border-slate-700 rounded p-2 text-xs text-slate-200 font-mono leading-relaxed"
                  />
                </div>
              )}

              {editorTab === 'structure' && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] text-rose-400 font-semibold mb-0.5">
                      1. Hook (0-3s) — Scroll Stopper
                    </label>
                    <input
                      placeholder="e.g. TCGplayer just took $10,000 from this store last year."
                      value={formHook}
                      onChange={(e) => setFormHook(e.target.value)}
                      className="w-full bg-[#121b26] border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-indigo-400 font-semibold mb-0.5">
                      2. Retain (4-20s) — Problem & Value Narrative
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. You're paying 8.95% fees plus listing fees, but you don't have to..."
                      value={formRetain}
                      onChange={(e) => setFormRetain(e.target.value)}
                      className="w-full bg-[#121b26] border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-emerald-400 font-semibold mb-0.5">
                      3. Reward (21-30s+) — Takeaway & CTA
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Build your own website. DM me 'TCG' to see how."
                      value={formReward}
                      onChange={(e) => setFormReward(e.target.value)}
                      className="w-full bg-[#121b26] border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>
              )}

              {editorTab === 'broll' && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] text-amber-400 font-semibold mb-0.5">
                      Visual Shot List & B-Roll directions
                    </label>
                    <textarea
                      rows={4}
                      placeholder="[0-3s] Split screen: Coding UI vs TCG store&#10;[4-10s] Screen recording: Live inventory sync&#10;[10-20s] Talking head with mic"
                      value={formBroll}
                      onChange={(e) => setFormBroll(e.target.value)}
                      className="w-full bg-[#121b26] border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">On-Screen Text Overlays</label>
                      <input
                        placeholder='e.g. "10% FEES LOST"'
                        value={formTextOverlays}
                        onChange={(e) => setFormTextOverlays(e.target.value)}
                        className="w-full bg-[#121b26] border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-0.5">Audio Cues</label>
                      <input
                        placeholder="e.g. Upbeat tech synth audio"
                        value={formAudioCues}
                        onChange={(e) => setFormAudioCues(e.target.value)}
                        className="w-full bg-[#121b26] border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* VVA Framework Checkboxes */}
            <div className="p-2.5 bg-[#121b26] border border-slate-800 rounded flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formHasValue}
                    onChange={(e) => setFormHasValue(e.target.checked)}
                  />
                  <span>Value</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formHasVulnerability}
                    onChange={(e) => setFormHasVulnerability(e.target.checked)}
                  />
                  <span>Vulnerability</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formHasAuthority}
                    onChange={(e) => setFormHasAuthority(e.target.checked)}
                  />
                  <span>Authority</span>
                </label>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  vvaCount >= 2
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                VVA Rule: {vvaCount}/3 {vvaCount >= 2 ? '✅' : '⚠️ (Aim for ≥2)'}
              </span>
            </div>

            {/* Scheduled Date */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Scheduled Date (Optional)</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="bg-[#121b26] border border-slate-700 rounded p-1.5 text-xs text-slate-200"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {formStatus === 'idea' && (
                  <button
                    type="button"
                    onClick={() => savePost('scripted')}
                    className="px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 rounded text-xs font-bold"
                  >
                    ✍️ Mark Scripted & Save
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => savePost()}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold shadow"
                >
                  💾 Save Post
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
