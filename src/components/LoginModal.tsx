import { useState, useRef, useEffect } from 'react';
import { MultiplayerManager, PlayerRole, CharacterSetup } from '../core/multiplayer';

interface LoginModalProps {
  multiplayer: MultiplayerManager;
  isOpen: boolean;
  onClose: () => void;
  onLoginComplete: () => void;
}

const PRESET_ROLES: { role: PlayerRole; label: string; icon: string; desc: string; defaultOutfit: CharacterSetup['outfit']; defaultAura: string }[] = [
  {
    role: 'Founder',
    label: 'Founder & CEO',
    icon: '👑',
    desc: 'Executive command, finances & studio roadmap',
    defaultOutfit: 'executive_suit',
    defaultAura: '#f59e0b',
  },
  {
    role: 'Developer',
    label: 'Frontend Engineer',
    icon: '🌸',
    desc: 'Hello Kitty station, React components & micro-interactions',
    defaultOutfit: 'kitty_hoodie',
    defaultAura: '#ec4899',
  },
  {
    role: 'Developer',
    label: 'Backend Architect',
    icon: '🕷️',
    desc: 'Spider-Man workstation, Redis queues & Postgres architecture',
    defaultOutfit: 'spider_jacket',
    defaultAura: '#06b6d4',
  },
  {
    role: 'Designer',
    label: 'Lead UI/UX Designer',
    icon: '🎨',
    desc: 'Creative studio, design systems & Figma prototypes',
    defaultOutfit: 'studio_turtleneck',
    defaultAura: '#a855f7',
  },
  {
    role: 'Marketer',
    label: 'Client Success Lead',
    icon: '🤝',
    desc: 'Executive CRM, contracts, SLA agreements & client portal',
    defaultOutfit: 'emerald_trench',
    defaultAura: '#10b981',
  },
];

const SKIN_TONES = [
  { label: 'Fair', color: '#ffdbac' },
  { label: 'Warm', color: '#f1c27d' },
  { label: 'Golden', color: '#e0ac69' },
  { label: 'Deep', color: '#8d5524' },
  { label: 'Cyber Blue', color: '#38bdf8' },
  { label: 'Neon Pink', color: '#f472b6' },
];

const HAIR_STYLES: { id: CharacterSetup['hairStyle']; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'spiky', label: 'Spiky Cyber' },
  { id: 'fade', label: 'Sleek Fade' },
  { id: 'bun', label: 'Top Bun' },
  { id: 'cyber_visor', label: 'Cyber Visor' },
  { id: 'executive_cap', label: 'Executive Cap' },
];

const HAIR_COLORS = [
  { label: 'Jet Black', color: '#0f172a' },
  { label: 'Espresso', color: '#451a03' },
  { label: 'Golden Blonde', color: '#fbbf24' },
  { label: 'Cyber Cyan', color: '#06b6d4' },
  { label: 'Neon Rose', color: '#ec4899' },
  { label: 'Platinum White', color: '#f8fafc' },
];

const OUTFITS: { id: CharacterSetup['outfit']; label: string; desc: string }[] = [
  { id: 'executive_suit', label: '👔 Executive Obsidian Suit', desc: 'Prestige charcoal blazer with gold lapel' },
  { id: 'kitty_hoodie', label: '🌸 Hello Kitty Pastel Hoodie', desc: 'Comfortable oversized pink & cream knit' },
  { id: 'spider_jacket', label: '🕷️ Spider Cyber Bomber', desc: 'Navy tech-fleece with crimson web trim' },
  { id: 'studio_turtleneck', label: '🎨 Creative Studio Turtleneck', desc: 'Minimalist noir knit with emerald accent' },
  { id: 'emerald_trench', label: '💼 Dealmaker Jade Trenchcoat', desc: 'Tailored emerald wool overcoat' },
];

const AURAS = [
  { label: 'Gold Amber', color: '#f59e0b' },
  { label: 'Cyber Cyan', color: '#06b6d4' },
  { label: 'Emerald Jade', color: '#10b981' },
  { label: 'Rose Pink', color: '#ec4899' },
  { label: 'Electric Purple', color: '#a855f7' },
  { label: 'Ice Blue', color: '#3b82f6' },
];

const ACCESSORIES: { id: CharacterSetup['accessory']; label: string; icon: string }[] = [
  { id: 'none', label: 'None', icon: '🚫' },
  { id: 'coffee', label: 'Espresso Tumbler', icon: '☕' },
  { id: 'laptop', label: 'Cyber Deck Laptop', icon: '💻' },
  { id: 'hologram', label: 'Holo Smart-Watch', icon: '✨' },
  { id: 'contract', label: 'Enterprise Contract', icon: '📜' },
  { id: 'vip_badge', label: 'VIP Studio Keycard', icon: '⭐' },
];

export default function LoginModal({
  multiplayer,
  isOpen,
  onClose,
  onLoginComplete,
}: LoginModalProps) {
  const [name, setName] = useState(multiplayer.localPlayer.name || 'Sadid');
  const [selectedRoleIdx, setSelectedRoleIdx] = useState(0);
  const [character, setCharacter] = useState<CharacterSetup>(
    multiplayer.localPlayer.character || {
      skinTone: '#ffdbac',
      hairStyle: 'classic',
      hairColor: '#0f172a',
      outfit: 'executive_suit',
      auraColor: '#f59e0b',
      accessory: 'coffee',
      title: 'Founder & CEO',
    }
  );

  const [activeTab, setActiveTab] = useState<'profile' | 'outfit' | 'hair' | 'aura'>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live Canvas Character Preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animId: number;

    const render = () => {
      frame++;
      const bob = Math.sin(frame * 0.08) * 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 10 + bob;

      // 1. Ambient Floor Aura
      const auraGrad = ctx.createRadialGradient(cx, cy + 30, 5, cx, cy + 30, 45);
      auraGrad.addColorStop(0, character.auraColor + '99');
      auraGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 30, 45, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Drop Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 28, 22, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Torso / Outfit
      const outfitColors: Record<CharacterSetup['outfit'], { primary: string; secondary: string; trim: string }> = {
        executive_suit: { primary: '#0f172a', secondary: '#ffffff', trim: '#f59e0b' },
        kitty_hoodie: { primary: '#f472b6', secondary: '#fce7f3', trim: '#db2777' },
        spider_jacket: { primary: '#1e3a8a', secondary: '#dc2626', trim: '#38bdf8' },
        studio_turtleneck: { primary: '#18181b', secondary: '#10b981', trim: '#71717a' },
        emerald_trench: { primary: '#064e3b', secondary: '#047857', trim: '#fbbf24' },
      };
      const oCol = outfitColors[character.outfit];

      // Jacket / Body
      ctx.fillStyle = oCol.primary;
      ctx.beginPath();
      ctx.roundRect(cx - 16, cy - 10, 32, 36, 6);
      ctx.fill();

      // Shirt / Inset
      ctx.fillStyle = oCol.secondary;
      ctx.beginPath();
      ctx.roundRect(cx - 6, cy - 10, 12, 18, 2);
      ctx.fill();

      // Tie / Trim
      ctx.fillStyle = oCol.trim;
      ctx.fillRect(cx - 2, cy - 6, 4, 12);

      // 4. Arms & Hands
      ctx.fillStyle = oCol.primary;
      ctx.beginPath();
      ctx.roundRect(cx - 24, cy - 6, 9, 22, 4);
      ctx.roundRect(cx + 15, cy - 6, 9, 22, 4);
      ctx.fill();

      // Hands (skin tone)
      ctx.fillStyle = character.skinTone;
      ctx.beginPath();
      ctx.arc(cx - 20, cy + 18, 5, 0, Math.PI * 2);
      ctx.arc(cx + 20, cy + 18, 5, 0, Math.PI * 2);
      ctx.fill();

      // 5. Head
      ctx.fillStyle = character.skinTone;
      ctx.beginPath();
      ctx.arc(cx, cy - 22, 14, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx - 4.5, cy - 22, 2, 0, Math.PI * 2);
      ctx.arc(cx + 4.5, cy - 22, 2, 0, Math.PI * 2);
      ctx.fill();

      // Eye reflections
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 5.5, cy - 23.5, 1.2, 1.2);
      ctx.fillRect(cx + 3.5, cy - 23.5, 1.2, 1.2);

      // 6. Hair & Headwear
      ctx.fillStyle = character.hairColor;
      if (character.hairStyle === 'classic') {
        ctx.beginPath();
        ctx.arc(cx, cy - 26, 14, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - 14, cy - 26, 4, 10);
      } else if (character.hairStyle === 'spiky') {
        ctx.beginPath();
        ctx.moveTo(cx - 14, cy - 24);
        ctx.lineTo(cx - 10, cy - 40);
        ctx.lineTo(cx - 4, cy - 28);
        ctx.lineTo(cx, cy - 42);
        ctx.lineTo(cx + 4, cy - 28);
        ctx.lineTo(cx + 10, cy - 40);
        ctx.lineTo(cx + 14, cy - 24);
        ctx.closePath();
        ctx.fill();
      } else if (character.hairStyle === 'fade') {
        ctx.beginPath();
        ctx.arc(cx, cy - 27, 13, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - 13, cy - 27, 26, 5);
      } else if (character.hairStyle === 'bun') {
        ctx.beginPath();
        ctx.arc(cx, cy - 26, 14, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy - 40, 7, 0, Math.PI * 2);
        ctx.fill();
      } else if (character.hairStyle === 'cyber_visor') {
        ctx.beginPath();
        ctx.arc(cx, cy - 26, 14, Math.PI, Math.PI * 2);
        ctx.fill();
        // Glowing cyan visor
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.roundRect(cx - 12, cy - 26, 24, 7, 3);
        ctx.fill();
      } else if (character.hairStyle === 'executive_cap') {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(cx - 16, cy - 35, 32, 12, 4);
        ctx.fillRect(cx - 18, cy - 26, 36, 4);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx - 3, cy - 33, 6, 6);
      }

      // 7. Accessory
      if (character.accessory === 'coffee') {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx + 22, cy + 10, 7, 11);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 21, cy + 8, 9, 3);
      } else if (character.accessory === 'laptop') {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(cx - 26, cy + 12, 14, 10);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cx - 24, cy + 14, 10, 6);
      } else if (character.accessory === 'hologram') {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx - 20, cy + 18, 9, 0, Math.PI * 2);
        ctx.stroke();
      } else if (character.accessory === 'contract') {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(cx + 22, cy + 10, 9, 13);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(cx + 26, cy + 18, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (character.accessory === 'vip_badge') {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(cx + 6, cy + 2, 6, 9, 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [character]);

  const handleSelectRole = (index: number) => {
    setSelectedRoleIdx(index);
    const chosen = PRESET_ROLES[index];
    setCharacter(prev => ({
      ...prev,
      outfit: chosen.defaultOutfit,
      auraColor: chosen.defaultAura,
      title: chosen.label,
    }));
  };

  const handleSaveAndSpawn = async () => {
    setIsSubmitting(true);
    const chosenRole = PRESET_ROLES[selectedRoleIdx].role;
    const finalName = name.trim() || 'Founder';

    multiplayer.updateLocalProfile(finalName, chosenRole, character.auraColor, character);
    
    // Auto-connect to shared studio room
    await multiplayer.joinRoom('AEETHOD-HQ');
    
    setIsSubmitting(false);
    onLoginComplete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-3 sm:p-6 animate-in fade-in select-none">
      <div className="relative w-full max-w-4xl bg-[#080d14] border border-emerald-500/40 rounded-3xl shadow-[0_0_90px_rgba(16,185,129,0.3)] flex flex-col md:flex-row overflow-hidden text-slate-200 font-sans">

        {/* ════════════════════════════════════════════════════════════════════
            LEFT: LIVE 3D/2D CHARACTER PREVIEW & BADGE
            ════════════════════════════════════════════════════════════════════ */}
        <div className="w-full md:w-5/12 bg-[#04070b] border-b md:border-b-0 md:border-r border-slate-800/80 p-6 flex flex-col items-center justify-between shrink-0">
          <div className="w-full text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono text-emerald-300 font-bold mb-2">
              <span>⚡</span> AEETHOD DIGITAL STUDIO
            </div>
            <h2 className="text-lg font-black text-slate-100 font-mono tracking-wider">
              {name || 'Agent'}
            </h2>
            <p className="text-xs text-amber-400 font-mono font-bold mt-0.5">
              {PRESET_ROLES[selectedRoleIdx].icon} {character.title}
            </p>
          </div>

          {/* Interactive Character Avatar Canvas */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-44 h-48 rounded-2xl bg-[#090f18] border border-slate-800/90 flex items-center justify-center relative overflow-hidden shadow-inner">
              <canvas
                ref={canvasRef}
                width={176}
                height={192}
                className="w-full h-full object-contain"
              />
              <span className="absolute bottom-2 right-2 text-[9px] font-mono bg-black/60 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800">
                LIVE 60FPS
              </span>
            </div>
          </div>

          {/* Character Quick Stat Chips */}
          <div className="w-full grid grid-cols-2 gap-2 text-center text-[10px] font-mono text-slate-400">
            <div className="p-2 rounded-xl bg-[#0c131e] border border-slate-800/70">
              <span className="text-slate-500 block">ACCESS LEVEL</span>
              <strong className="text-emerald-400 text-xs">TIER 1 ARCHITECT</strong>
            </div>
            <div className="p-2 rounded-xl bg-[#0c131e] border border-slate-800/70">
              <span className="text-slate-500 block">STUDIO LOCATION</span>
              <strong className="text-cyan-300 text-xs">AEETHOD HQ FLOOR</strong>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT: CUSTOMIZATION SUITE
            ════════════════════════════════════════════════════════════════════ */}
        <div className="w-full md:w-7/12 p-6 flex flex-col justify-between overflow-y-auto max-h-[85vh] md:max-h-[620px]">
          
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-100 font-mono tracking-wider uppercase flex items-center gap-2">
                  <span>🧑‍💻</span> CHARACTER SETUP & LOGIN
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Configure your in-game persona, role, and custom visual gear.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Customization Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#05080c] rounded-xl border border-slate-800/90 mb-4 text-xs font-mono">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'profile' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>👑</span> Role
              </button>
              <button
                onClick={() => setActiveTab('outfit')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'outfit' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>👔</span> Outfit
              </button>
              <button
                onClick={() => setActiveTab('hair')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'hair' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>✂️</span> Hair & Skin
              </button>
              <button
                onClick={() => setActiveTab('aura')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'aura' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>✨</span> Aura & Gear
              </button>
            </div>

            {/* ──────────────── TAB 1: PROFILE & ROLE ──────────────── */}
            {activeTab === 'profile' && (
              <div className="space-y-4 text-xs font-mono animate-in fade-in">
                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold">Player Name / Handle:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your character name..."
                    className="w-full bg-[#04070b] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 font-bold outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-2 font-bold">Select Agency Role & Department:</label>
                  <div className="grid grid-cols-1 gap-2">
                    {PRESET_ROLES.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectRole(i)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                          selectedRoleIdx === i
                            ? 'bg-[#0f2119] border-emerald-500/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                            : 'bg-[#0b1017] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{r.icon}</span>
                          <div>
                            <strong className="text-slate-100 text-xs block">{r.label}</strong>
                            <span className="text-[10px] text-slate-500">{r.desc}</span>
                          </div>
                        </div>
                        {selectedRoleIdx === i && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px] border border-emerald-700/50">
                            SELECTED
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ──────────────── TAB 2: OUTFIT ──────────────── */}
            {activeTab === 'outfit' && (
              <div className="space-y-3 text-xs font-mono animate-in fade-in">
                <label className="block text-slate-400 font-bold mb-1">Wardrobe & Department Uniform:</label>
                <div className="grid grid-cols-1 gap-2">
                  {OUTFITS.map(o => (
                    <button
                      key={o.id}
                      onClick={() => setCharacter({ ...character, outfit: o.id })}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                        character.outfit === o.id
                          ? 'bg-[#0f2119] border-emerald-500/80 text-emerald-200'
                          : 'bg-[#0b1017] border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <strong className="text-slate-100 text-xs block">{o.label}</strong>
                        <span className="text-[10px] text-slate-500">{o.desc}</span>
                      </div>
                      {character.outfit === o.id && (
                        <span className="text-emerald-400 font-bold text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ──────────────── TAB 3: HAIR & SKIN ──────────────── */}
            {activeTab === 'hair' && (
              <div className="space-y-4 text-xs font-mono animate-in fade-in">
                <div>
                  <label className="block text-slate-400 font-bold mb-2">Skin Tone:</label>
                  <div className="grid grid-cols-6 gap-2">
                    {SKIN_TONES.map(s => (
                      <button
                        key={s.color}
                        onClick={() => setCharacter({ ...character, skinTone: s.color })}
                        className={`h-10 rounded-xl border flex items-center justify-center transition ${
                          character.skinTone === s.color
                            ? 'border-white scale-105 shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                            : 'border-slate-800 hover:scale-100'
                        }`}
                        style={{ backgroundColor: s.color }}
                        title={s.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-2">Hairstyle / Headgear:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {HAIR_STYLES.map(h => (
                      <button
                        key={h.id}
                        onClick={() => setCharacter({ ...character, hairStyle: h.id })}
                        className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition ${
                          character.hairStyle === h.id
                            ? 'bg-[#0f2119] border-emerald-500 text-emerald-300'
                            : 'bg-[#0b1017] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-2">Hair Color:</label>
                  <div className="grid grid-cols-6 gap-2">
                    {HAIR_COLORS.map(c => (
                      <button
                        key={c.color}
                        onClick={() => setCharacter({ ...character, hairColor: c.color })}
                        className={`h-9 rounded-xl border flex items-center justify-center transition ${
                          character.hairColor === c.color
                            ? 'border-white scale-105 shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                            : 'border-slate-800'
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ──────────────── TAB 4: AURA & ACCESSORY ──────────────── */}
            {activeTab === 'aura' && (
              <div className="space-y-4 text-xs font-mono animate-in fade-in">
                <div>
                  <label className="block text-slate-400 font-bold mb-2">Floor Energy Aura:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {AURAS.map(a => (
                      <button
                        key={a.color}
                        onClick={() => setCharacter({ ...character, auraColor: a.color })}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold text-[11px] transition ${
                          character.auraColor === a.color
                            ? 'bg-[#0f2119] border-emerald-500 text-emerald-300'
                            : 'bg-[#0b1017] border-slate-800 text-slate-400'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/50"
                          style={{ backgroundColor: a.color }}
                        />
                        <span>{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-2">Held Accessory / Badge:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ACCESSORIES.map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => setCharacter({ ...character, accessory: acc.id })}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] transition ${
                          character.accessory === acc.id
                            ? 'bg-[#0f2119] border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-[#0b1017] border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="text-base">{acc.icon}</span>
                        <span>{acc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 mt-4">
            <span className="text-[11px] font-mono text-slate-500">
              Auto-syncs profile with Supabase Studio Lobby
            </span>
            <button
              onClick={handleSaveAndSpawn}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold font-mono text-xs transition flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50"
            >
              <span>🚀</span>
              <span>{isSubmitting ? 'CONNECTING...' : 'ENTER AEETHOD HQ'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
