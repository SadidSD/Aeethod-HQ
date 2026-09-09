import { useState, useRef, useEffect } from 'react';
import { MultiplayerManager, PlayerRole, CharacterSetup } from '../core/multiplayer';
import AgencyManager from '../core/agency';

interface LoginModalProps {
  multiplayer: MultiplayerManager;
  manager: AgencyManager;
  isOpen: boolean;
  onClose: () => void;
  onLoginComplete: () => void;
  initialStep?: 'code' | 'avatar';
}

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

function mapDepartmentToRole(dept?: string, roleName?: string): PlayerRole {
  const r = (roleName || '').toLowerCase();
  const d = (dept || '').toLowerCase();

  if (d === 'management' || r.includes('founder') || r.includes('ceo')) return 'Founder';
  if (d === 'design' || r.includes('design') || r.includes('ui') || r.includes('ux')) return 'Designer';
  if (d === 'client' || d === 'content' || r.includes('client') || r.includes('market')) return 'Marketer';
  return 'Developer';
}

function getDefaultOutfitForRole(role: PlayerRole): CharacterSetup['outfit'] {
  switch (role) {
    case 'Founder': return 'executive_suit';
    case 'Designer': return 'studio_turtleneck';
    case 'Marketer': return 'emerald_trench';
    default: return 'spider_jacket';
  }
}

export default function LoginModal({
  multiplayer,
  manager,
  isOpen,
  onClose,
  onLoginComplete,
  initialStep,
}: LoginModalProps) {
  // Step: 'code' or 'avatar'
  const [step, setStep] = useState<'code' | 'avatar'>(() => {
    if (initialStep) return initialStep;
    const hasLoggedIn = localStorage.getItem('aeethod_logged_in') === 'true';
    return hasLoggedIn ? 'avatar' : 'code';
  });

  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  const [verifiedRole, setVerifiedRole] = useState<{ roleName: string; department: string }>(() => {
    try {
      const saved = localStorage.getItem('aeethod_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role) return { roleName: parsed.role, department: parsed.department || 'dev' };
      }
    } catch (e) {}
    return { roleName: 'Founder', department: 'management' };
  });

  const [name, setName] = useState(() => localStorage.getItem('coop_player_name') || '');
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

  const [activeTab, setActiveTab] = useState<'outfit' | 'hair' | 'aura'>('outfit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync step if initialStep prop changes
  useEffect(() => {
    if (initialStep) setStep(initialStep);
  }, [initialStep]);

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
      const oCol = outfitColors[character.outfit] || outfitColors.executive_suit;

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
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(cx - 12, cy - 25, 24, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 8, cy - 24, 16, 2);
      } else if (character.hairStyle === 'executive_cap') {
        ctx.beginPath();
        ctx.arc(cx, cy - 26, 14, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(cx - 15, cy - 36, 30, 10, 3);
        ctx.fill();
        ctx.fillRect(cx - 18, cy - 28, 36, 4);
      }

      // 7. Accessories
      if (character.accessory === 'coffee') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 18, cy + 11, 7, 11);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(cx + 19, cy + 14, 5, 5);
      } else if (character.accessory === 'laptop') {
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

  // Code Validation Handler
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError(null);

    const result = manager.validateAccessCode(accessCodeInput);
    if (!result.valid) {
      setCodeError(result.error || 'Invalid access code.');
      return;
    }

    const assignedRole = result.roleName || 'Team Specialist';
    const dept = result.department || 'dev';
    setVerifiedRole({ roleName: assignedRole, department: dept });

    const mappedRole = mapDepartmentToRole(dept, assignedRole);
    const suggestedOutfit = getDefaultOutfitForRole(mappedRole);

    setCharacter(prev => ({
      ...prev,
      title: assignedRole,
      outfit: prev.outfit === 'executive_suit' ? suggestedOutfit : prev.outfit,
    }));

    setStep('avatar');
  };

  // Complete Setup & Save Handler
  const handleSaveAndSpawn = async () => {
    const finalName = name.trim() || verifiedRole.roleName.split(' ')[0] || 'Agent';
    setIsSubmitting(true);

    const mappedRole = mapDepartmentToRole(verifiedRole.department, verifiedRole.roleName);
    const updatedChar = { ...character, title: verifiedRole.roleName };

    // 1. Claim code usage in agency manager
    if (accessCodeInput) {
      manager.claimAccessCode(accessCodeInput, finalName);
    }

    // 2. Update local player multiplayer profile
    multiplayer.updateLocalProfile(finalName, mappedRole, updatedChar.auraColor, updatedChar);

    // 3. Save to localStorage cache for persistent auto-login
    localStorage.setItem('aeethod_logged_in', 'true');
    localStorage.setItem('aeethod_user_code', accessCodeInput || 'FOUNDER-HQ');
    localStorage.setItem(
      'aeethod_user_session',
      JSON.stringify({
        name: finalName,
        role: verifiedRole.roleName,
        department: verifiedRole.department,
        code: accessCodeInput,
        character: updatedChar,
      })
    );
    localStorage.setItem('coop_player_name', finalName);
    localStorage.setItem('coop_player_role', mappedRole);
    localStorage.setItem('coop_player_color', updatedChar.auraColor);
    localStorage.setItem('aeethod_character_setup', JSON.stringify(updatedChar));

    // 4. Connect to shared HQ room
    await multiplayer.joinRoom('AEETHOD-HQ');

    setIsSubmitting(false);
    onLoginComplete();
    onClose();
  };

  const handleLogoutSwitchAccount = () => {
    localStorage.removeItem('aeethod_logged_in');
    localStorage.removeItem('aeethod_user_code');
    localStorage.removeItem('aeethod_user_session');
    setAccessCodeInput('');
    setCodeError(null);
    setStep('code');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-3 sm:p-6 animate-in fade-in select-none">
      
      {/* ════════════════════════════════════════════════════════════════════
          STEP 1: CODE GATEWAY (Enter Access Key)
          ════════════════════════════════════════════════════════════════════ */}
      {step === 'code' ? (
        <div className="relative w-full max-w-md bg-[#080d14] border border-cyan-500/40 rounded-3xl shadow-[0_0_90px_rgba(6,182,212,0.25)] p-6 sm:p-8 text-slate-200 font-sans animate-in zoom-in-95">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 font-bold mb-3">
              <span>⚡</span> AEETHOD DIGITAL STUDIO
            </div>
            <h1 className="text-2xl font-black text-slate-100 font-mono tracking-wider">
              ACCESS GATEWAY
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Enter your studio role access key to authenticate and enter HQ.
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-2 text-center uppercase tracking-wider">
                Enter 5-Letter Role Access Code:
              </label>
              <input
                type="text"
                autoFocus
                required
                maxLength={5}
                value={accessCodeInput}
                onChange={e => {
                  setAccessCodeInput(e.target.value.toUpperCase());
                  setCodeError(null);
                }}
                placeholder="5-LETTER CODE"
                className="w-full bg-[#04070b] border-2 border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3.5 text-center font-mono font-black text-xl tracking-[0.35em] text-cyan-300 placeholder-slate-600 outline-none transition shadow-inner uppercase"
              />
            </div>

            {codeError && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/60 rounded-xl text-rose-300 text-xs font-mono text-center flex items-center justify-center gap-2 animate-in fade-in">
                <span>⚠️</span> {codeError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-mono font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🔓</span> Verify Key & Create Avatar
            </button>
          </form>

          {(() => {
            const founderCode = manager.getRoleAccessCodes().find(c => c.roleName.toLowerCase().includes('founder'))?.code || 
              (typeof window !== 'undefined' ? localStorage.getItem('aeethod_founder_code') : '') || '';
            if (!founderCode) return null;
            return (
              <div className="mt-5 p-3.5 bg-[#0c1420] border border-amber-500/40 rounded-2xl text-center font-mono text-xs">
                <span className="text-slate-400 block text-[11px] mb-1.5 font-bold">FOUNDER ROLE ACCESS CODE:</span>
                <button
                  type="button"
                  onClick={() => {
                    setAccessCodeInput(founderCode);
                    setCodeError(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-950/70 border border-amber-500/60 rounded-xl text-amber-300 font-mono font-black text-lg tracking-widest hover:bg-amber-900 hover:text-amber-100 transition cursor-pointer shadow-lg"
                >
                  <span>👑</span>
                  <span>{founderCode}</span>
                  <span className="text-[10px] text-amber-400/80 font-normal underline ml-1">(Click to enter)</span>
                </button>
              </div>
            );
          })()}
        </div>
      ) : (

        /* ════════════════════════════════════════════════════════════════════
            STEP 2: AVATAR CUSTOMIZATION & PROFILE (One-Time Setup)
            ════════════════════════════════════════════════════════════════════ */
        <div className="relative w-full max-w-4xl bg-[#080d14] border border-emerald-500/40 rounded-3xl shadow-[0_0_90px_rgba(16,185,129,0.3)] flex flex-col md:flex-row overflow-hidden text-slate-200 font-sans animate-in zoom-in-95">

          {/* LEFT: LIVE CHARACTER CANVAS PREVIEW */}
          <div className="w-full md:w-5/12 bg-[#04070b] border-b md:border-b-0 md:border-r border-slate-800/80 p-6 flex flex-col items-center justify-between shrink-0">
            <div className="w-full text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono text-emerald-300 font-bold mb-2">
                <span>✓</span> ACCESS GRANTED
              </div>
              <h2 className="text-lg font-black text-slate-100 font-mono tracking-wider">
                {name || 'Agent'}
              </h2>
              <p className="text-xs text-amber-400 font-mono font-bold mt-0.5">
                👑 {verifiedRole.roleName}
              </p>
            </div>

            {/* Character Canvas */}
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

            {/* Quick Stat Chips */}
            <div className="w-full grid grid-cols-2 gap-2 text-center text-[10px] font-mono text-slate-400">
              <div className="p-2 rounded-xl bg-[#0c131e] border border-slate-800/70">
                <span className="text-slate-500 block">ROLE CODE</span>
                <strong className="text-emerald-400 text-xs truncate block">{accessCodeInput || 'AUTHENTICATED'}</strong>
              </div>
              <div className="p-2 rounded-xl bg-[#0c131e] border border-slate-800/70">
                <span className="text-slate-500 block">HQ LOCATION</span>
                <strong className="text-cyan-300 text-xs">AEETHOD HQ FLOOR</strong>
              </div>
            </div>
          </div>

          {/* RIGHT: AVATAR CUSTOMIZATION CONTROLS */}
          <div className="w-full md:w-7/12 p-6 flex flex-col justify-between overflow-y-auto max-h-[85vh] md:max-h-[620px]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-100 font-mono tracking-wider uppercase flex items-center gap-2">
                    <span>🎨</span> AVATAR SETUP STUDIO
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Customize your character. This avatar will be cached permanently for your account!
                  </p>
                </div>
                {localStorage.getItem('aeethod_logged_in') && (
                  <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Player Name Field */}
              <div className="mb-4 font-mono text-xs">
                <label className="block text-slate-300 mb-1.5 font-bold">Your Display Name / Handle:</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Type your name..."
                  className="w-full bg-[#04070b] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 font-bold outline-none focus:border-emerald-500 transition text-xs"
                />
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#05080c] rounded-xl border border-slate-800/90 mb-4 text-xs font-mono">
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

              {/* TAB 1: OUTFIT */}
              {activeTab === 'outfit' && (
                <div className="space-y-2.5 font-mono text-xs animate-in fade-in">
                  {OUTFITS.map(o => (
                    <button
                      key={o.id}
                      onClick={() => setCharacter(prev => ({ ...prev, outfit: o.id }))}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                        character.outfit === o.id
                          ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                          : 'bg-[#090f18] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="font-bold block text-slate-100">{o.label}</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">{o.desc}</span>
                      </div>
                      {character.outfit === o.id && <span className="text-emerald-400 font-bold">✓ Selected</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* TAB 2: HAIR & SKIN */}
              {activeTab === 'hair' && (
                <div className="space-y-4 font-mono text-xs animate-in fade-in">
                  <div>
                    <label className="block text-slate-400 mb-2 font-bold">Skin Tone:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {SKIN_TONES.map(s => (
                        <button
                          key={s.label}
                          onClick={() => setCharacter(prev => ({ ...prev, skinTone: s.color }))}
                          className={`p-2 rounded-lg border flex items-center gap-2 transition cursor-pointer ${
                            character.skinTone === s.color
                              ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200'
                              : 'border-slate-800 bg-[#090f18] text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full border border-black/40" style={{ backgroundColor: s.color }} />
                          <span className="text-[11px] font-bold">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-2 font-bold">Hair Style:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {HAIR_STYLES.map(h => (
                        <button
                          key={h.id}
                          onClick={() => setCharacter(prev => ({ ...prev, hairStyle: h.id }))}
                          className={`p-2 rounded-lg border text-left font-bold text-xs transition cursor-pointer ${
                            character.hairStyle === h.id
                              ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200'
                              : 'border-slate-800 bg-[#090f18] text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {h.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-2 font-bold">Hair Color:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {HAIR_COLORS.map(c => (
                        <button
                          key={c.label}
                          onClick={() => setCharacter(prev => ({ ...prev, hairColor: c.color }))}
                          className={`p-2 rounded-lg border flex items-center gap-2 transition cursor-pointer ${
                            character.hairColor === c.color
                              ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200'
                              : 'border-slate-800 bg-[#090f18] text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full border border-black/40" style={{ backgroundColor: c.color }} />
                          <span className="text-[11px] font-bold">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AURA & ACCESSORIES */}
              {activeTab === 'aura' && (
                <div className="space-y-4 font-mono text-xs animate-in fade-in">
                  <div>
                    <label className="block text-slate-400 mb-2 font-bold">Floor Aura Energy:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {AURAS.map(a => (
                        <button
                          key={a.label}
                          onClick={() => setCharacter(prev => ({ ...prev, auraColor: a.color }))}
                          className={`p-2 rounded-lg border flex items-center gap-2 transition cursor-pointer ${
                            character.auraColor === a.color
                              ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200'
                              : 'border-slate-800 bg-[#090f18] text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: a.color }} />
                          <span className="text-[11px] font-bold">{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-2 font-bold">Studio Gear / Accessory:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ACCESSORIES.map(acc => (
                        <button
                          key={acc.id}
                          onClick={() => setCharacter(prev => ({ ...prev, accessory: acc.id }))}
                          className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition cursor-pointer ${
                            character.accessory === acc.id
                              ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200'
                              : 'border-slate-800 bg-[#090f18] text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-base">{acc.icon}</span>
                          <span className="text-xs font-bold">{acc.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleLogoutSwitchAccount}
                className="text-xs font-mono text-slate-500 hover:text-rose-400 transition underline cursor-pointer"
              >
                Switch Key / Log Out
              </button>

              <button
                onClick={handleSaveAndSpawn}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-mono font-bold text-xs shadow-[0_0_25px_rgba(16,185,129,0.35)] transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>🚀</span> Save & Enter Office HQ
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
