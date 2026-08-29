const fs = require('fs');

let code = fs.readFileSync('src/core/engine.ts', 'utf-8');

// 1. Imports
code = code.replace("import { getTerrainSprite, getBuildingSprite } from '../render/SpriteManager';", 
"import { getTerrainSprite, getBuildingSprite } from '../render/SpriteManager';\nimport { AgencyManager } from './agency';");

// 2. Properties
code = code.replace("onOpenComputer: (() => void) | null = null;", 
`onOpenComputer: (() => void) | null = null;
  onOpenMember: ((memberId: string) => void) | null = null;
  onOpenBoard: ((boardType: 'leads' | 'architecture' | 'content') => void) | null = null;
  agencyManager: AgencyManager | null = null;`);

// 3. Interactive Triggers - E key
code = code.replace(`      if (key === 'e') {
        // Check if player is near CEO management computer
        const cx = T(DIAMOND_CX), cy = T(DIAMOND_CY);
        const distToPC = Math.hypot(this.state.player.x - cx, this.state.player.y - (cy - TILE_SIZE * 1.5));
        if (distToPC < 95) {
          this.onOpenComputer?.();
          return;
        }
        this.toggleNearestDoor();
      }`, `      if (key === 'e') {
        const px = this.state.player.x, py = this.state.player.y;
        if (Math.hypot(px - T(DIAMOND_CX), py - (T(DIAMOND_CY) - TILE_SIZE * 1.5)) < 95) { this.onOpenComputer?.(); return; }
        if (Math.hypot(px - T(5), py - T(7)) < 85) { this.onOpenMember?.('frontend'); return; }
        if (Math.hypot(px - T(36), py - T(7)) < 85) { this.onOpenMember?.('designer'); return; }
        if (Math.hypot(px - T(22), py - T(37)) < 90) { this.onOpenBoard?.('leads'); return; }
        if (Math.hypot(px - T(21.5), py - T(2)) < 90) { this.onOpenBoard?.('architecture'); return; }
        if (Math.hypot(px - T(39), py - T(28)) < 90) { this.onOpenBoard?.('content'); return; }
        this.toggleNearestDoor();
      }`);

// 4. Interactive Triggers - handleClick
code = code.replace(`    // Check if clicked near CEO management computer
    const cx = T(DIAMOND_CX), cy = T(DIAMOND_CY);
    const distClickToPC = Math.hypot(this.mouse.wx - cx, this.mouse.wy - (cy - TILE_SIZE * 1.5));
    const distPlayerToPC = Math.hypot(this.state.player.x - cx, this.state.player.y - (cy - TILE_SIZE * 1.5));
    if (distClickToPC < 60 && distPlayerToPC < 130) {
      this.onOpenComputer?.();
      return;
    }`, `    const px = this.state.player.x, py = this.state.player.y, mx = this.mouse.wx, my = this.mouse.wy;
    const checkClick = (ox, oy, maxPlayerDist, cb) => {
      if (Math.hypot(mx - ox, my - oy) < 60 && Math.hypot(px - ox, py - oy) < maxPlayerDist) { cb(); return true; }
      return false;
    };
    if (checkClick(T(DIAMOND_CX), T(DIAMOND_CY) - TILE_SIZE * 1.5, 130, () => this.onOpenComputer?.())) return;
    if (checkClick(T(5), T(7), 130, () => this.onOpenMember?.('frontend'))) return;
    if (checkClick(T(36), T(7), 130, () => this.onOpenMember?.('designer'))) return;
    if (checkClick(T(22), T(37), 130, () => this.onOpenBoard?.('leads'))) return;
    if (checkClick(T(21.5), T(2), 130, () => this.onOpenBoard?.('architecture'))) return;
    if (checkClick(T(39), T(28), 130, () => this.onOpenBoard?.('content'))) return;`);

// 5. Visual Bottleneck Alerts in render
const bottleneck_code = `
    // --- BOTTLENECK ALERTS ---
    const bottlenecks = this.agencyManager?.getBottlenecks() || [];
    const bottleneckRooms = new Set(bottlenecks.map(b => b.room));
    ctx.save();
    ctx.lineWidth = 4;
    const alertPulse = (Math.sin(this.state.tick * 0.1) * 0.5 + 0.5);
    ctx.strokeStyle = \`rgba(239, 68, 68, \${0.4 + alertPulse * 0.3})\`;
    
    if (bottleneckRooms.has('dev')) {
      ctx.strokeRect(T(1), T(1), T(10), T(18));
      ctx.fillStyle = \`rgba(239, 68, 68, \${0.2 + alertPulse * 0.2})\`;
      ctx.fillRect(T(1), T(1), T(10), T(18));
    }
    if (bottleneckRooms.has('design')) {
      ctx.strokeRect(T(32), T(1), T(10), T(18));
      ctx.fillStyle = \`rgba(239, 68, 68, \${0.2 + alertPulse * 0.2})\`;
      ctx.fillRect(T(32), T(1), T(10), T(18));
    }
    if (bottleneckRooms.has('management')) {
      ctx.strokeRect(T(12), T(15), T(20), T(18));
      ctx.fillStyle = \`rgba(239, 68, 68, \${0.2 + alertPulse * 0.2})\`;
      ctx.fillRect(T(12), T(15), T(20), T(18));
    }
    ctx.restore();

    // Circulation dashed paths`;
code = code.replace("    // Circulation dashed paths", bottleneck_code);

// 6. Task Flow Belts (Factorio Conveyor Belts)
const flow_belts_code = `
    // Task Flow Belts
    ctx.save();
    const tMod = (this.state.tick * 0.01) % 1;
    const drawOrb = (x, y) => {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fill();
    };
    
    // Simple interpolation for flow belts
    const getPointOnBezier = (p0, p1, p2, p3, t) => {
      const u = 1 - t;
      const tt = t*t, uu = u*u;
      const uuu = uu * u, ttt = tt * t;
      let p = { x: uuu * p0.x, y: uuu * p0.y };
      p.x += 3 * uu * t * p1.x; p.y += 3 * uu * t * p1.y;
      p.x += 3 * u * tt * p2.x; p.y += 3 * u * tt * p2.y;
      p.x += ttt * p3.x; p.y += ttt * p3.y;
      return p;
    };
    const getPointOnQuad = (p0, p1, p2, t) => {
      const u = 1 - t;
      return {
        x: u*u*p0.x + 2*u*t*p1.x + t*t*p2.x,
        y: u*u*p0.y + 2*u*t*p1.y + t*t*p2.y
      };
    };

    // Reception to Management
    let pt = getPointOnBezier({x:T(22),y:T(40)}, {x:T(22),y:T(35)}, {x:T(22),y:T(32)}, {x:T(22),y:T(29)}, tMod);
    drawOrb(pt.x, pt.y);
    
    // Management left branch to dev
    pt = getPointOnBezier({x:T(22),y:T(33)}, {x:T(16),y:T(30)}, {x:T(13),y:T(24)}, {x:T(12),y:T(15)}, tMod);
    drawOrb(pt.x, pt.y);
    
    // Management right branch to design
    pt = getPointOnBezier({x:T(22),y:T(33)}, {x:T(28),y:T(30)}, {x:T(31),y:T(24)}, {x:T(31),y:T(15)}, tMod);
    drawOrb(pt.x, pt.y);
    
    // To meeting left
    pt = getPointOnQuad({x:T(12),y:T(14)}, {x:T(12),y:T(11)}, {x:T(16),y:T(10)}, tMod);
    drawOrb(pt.x, pt.y);
    
    // To meeting right
    pt = getPointOnQuad({x:T(31),y:T(14)}, {x:T(31),y:T(11)}, {x:T(27),y:T(10)}, tMod);
    drawOrb(pt.x, pt.y);

    ctx.restore();

    // === FURNITURE RENDERING ===`;
code = code.replace("    // === FURNITURE RENDERING ===", flow_belts_code);

// 7. Animated NPCs
const dev_room_old = `      this.monitor(ctx, T(1.8), y-6, 10, 14);
      this.monitor(ctx, T(2.8), y-6, 10, 14);
      this.chair(ctx, T(5), y+2, -Math.PI/2, 10);`;
const dev_room_new = `      this.monitor(ctx, T(1.8), y-6, 10, 14);
      this.monitor(ctx, T(2.8), y-6, 10, 14);
      this.chair(ctx, T(5), y+2, -Math.PI/2, 10);
      if (i === 0) { // Frontend Dev at first desk
        ctx.save();
        const px = T(5), py = y-2; // Sitting position
        // Body
        ctx.fillStyle = '#1e293b';
        ctx.beginPath(); ctx.ellipse(px, py+5, 8, 6, 0, 0, Math.PI*2); ctx.fill();
        // Head with hoodie
        ctx.fillStyle = '#64748b';
        ctx.beginPath(); ctx.arc(px, py-2, 6, 0, Math.PI*2); ctx.fill();
        // Hair / glasses
        ctx.fillStyle = '#0f172a'; ctx.fillRect(px-7, py-4, 4, 1); ctx.fillRect(px-7, py-1, 4, 1); // Glasses frame
        // Animated hands typing
        const t = this.state.tick;
        const handY = py + 4 + Math.sin(t * 0.5) * 2;
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath(); ctx.arc(px - 7, handY, 2, 0, Math.PI*2); ctx.fill();
        const handY2 = py + 4 + Math.cos(t * 0.5) * 2;
        ctx.beginPath(); ctx.arc(px - 7, handY2 - 4, 2, 0, Math.PI*2); ctx.fill();
        
        // Screens glowing
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.fillRect(T(1.8), y-6, 10, 14);
        ctx.fillRect(T(2.8), y-6, 10, 14);
        // Coffee steam
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath(); ctx.arc(px - 2, py + 12 - (t%20)/2, 2, 0, Math.PI*2); ctx.fill();
        
        // Status bubble
        ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(px+5, py-10, 80, 12);
        const task = this.agencyManager?.getTasksByMember('frontend').find(t => t.status === 'in_progress');
        const blocked = this.agencyManager?.getTasksByMember('frontend').find(t => t.status === 'blocked');
        let status = '🟡 Idle / Awaiting tasks';
        if (blocked) status = '🔴 Blocked! ' + blocked.title;
        else if (task) status = '🟢 Coding Next.js...';
        ctx.fillStyle = 'white'; ctx.font = '6px sans-serif'; ctx.fillText(status, px+8, py-1);
        ctx.restore();
      }`;
code = code.replace(dev_room_old, dev_room_new);

const design_room_old = `      this.monitor(ctx, T(35), y-6, 12, 10);
      this.monitor(ctx, T(36.5), y-6, 12, 10);
      this.chair(ctx, T(33.2), y, Math.PI/2, 9);
      this.chair(ctx, T(38.8), y, -Math.PI/2, 9);`;
const design_room_new = `      this.monitor(ctx, T(35), y-6, 12, 10);
      this.monitor(ctx, T(36.5), y-6, 12, 10);
      this.chair(ctx, T(33.2), y, Math.PI/2, 9);
      this.chair(ctx, T(38.8), y, -Math.PI/2, 9);
      if (i === 0) { // Designer
        ctx.save();
        const px = T(33.5), py = y-2;
        // Body
        ctx.fillStyle = '#a855f7';
        ctx.beginPath(); ctx.ellipse(px, py+5, 8, 6, 0, 0, Math.PI*2); ctx.fill();
        // Head
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath(); ctx.arc(px, py-2, 6, 0, Math.PI*2); ctx.fill();
        // Headphones
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath(); ctx.arc(px, py-2, 7, -Math.PI/2, Math.PI/2); ctx.stroke();
        // Arm with stylus
        const t = this.state.tick;
        const armX = px + 8 + Math.sin(t * 0.2) * 3;
        const armY = py + 2 + Math.cos(t * 0.2) * 3;
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath(); ctx.arc(armX, armY, 2, 0, Math.PI*2); ctx.fill();
        
        // Floating Palette
        ctx.fillStyle = '#ec4899'; ctx.fillRect(px+8, py-12, 4, 4);
        ctx.fillStyle = '#3b82f6'; ctx.fillRect(px+12, py-12, 4, 4);
        ctx.fillStyle = '#eab308'; ctx.fillRect(px+10, py-8, 4, 4);
        
        // Status bubble
        ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(px-80, py-10, 80, 12);
        const task = this.agencyManager?.getTasksByMember('designer').find(t => t.status === 'in_progress');
        const blocked = this.agencyManager?.getTasksByMember('designer').find(t => t.status === 'blocked');
        let status = '🟡 Reviewing UI...';
        if (blocked) status = '🔴 Blocked!';
        else if (task) status = '🟢 Designing in Figma...';
        ctx.fillStyle = 'white'; ctx.font = '6px sans-serif'; ctx.fillText(status, px-76, py-1);
        ctx.restore();
      }`;
code = code.replace(design_room_old, design_room_new);

const reception_bot_old = `      // "Hello sir!" Text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Hello sir! 👋', bubbleX, bubbleY + 14);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 7px sans-serif';
      ctx.fillText('Welcome to the office', bubbleX, bubbleY + 26);`;
const reception_bot_new = `      // Bot Text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      
      const newLeadsCount = this.agencyManager?.getState().leads.filter(l => l.status === 'new').length || 0;
      if (newLeadsCount > 0) {
          ctx.fillText(\`Sir, \${newLeadsCount} new client\`, bubbleX, bubbleY + 14);
          ctx.fillStyle = '#64748b';
          ctx.font = '600 7px sans-serif';
          ctx.fillText('inquiries waiting! 📩', bubbleX, bubbleY + 26);
      } else {
          ctx.fillText('Hello sir! 👋', bubbleX, bubbleY + 14);
          ctx.fillStyle = '#64748b';
          ctx.font = '600 7px sans-serif';
          ctx.fillText('Welcome to Aeethod', bubbleX, bubbleY + 26);
      }`;
code = code.replace(reception_bot_old, reception_bot_new);

const client_room_old = `    this.chair(ctx, T(6.5),T(32), Math.PI/2, 9);
    this.chair(ctx, T(9.5),T(32), -Math.PI/2, 9);
    this.chair(ctx, T(8),T(30.5), Math.PI, 9);
    this.chair(ctx, T(8),T(33.5), 0, 9);`;
const client_room_new = `    this.chair(ctx, T(6.5),T(32), Math.PI/2, 9);
    this.chair(ctx, T(9.5),T(32), -Math.PI/2, 9);
    this.chair(ctx, T(8),T(30.5), Math.PI, 9);
    this.chair(ctx, T(8),T(33.5), 0, 9);
    
    // Client NPC sitting at table
    ctx.save();
    const cpx = T(9.5), cpy = T(32);
    ctx.fillStyle = '#475569';
    ctx.beginPath(); ctx.ellipse(cpx, cpy-4, 7, 5, 0, 0, Math.PI*2); ctx.fill(); // Body
    ctx.fillStyle = '#fde047';
    ctx.beginPath(); ctx.arc(cpx-4, cpy-4, 5, 0, Math.PI*2); ctx.fill(); // Head
    ctx.restore();`;
code = code.replace(client_room_old, client_room_new);

const content_room_old = `      this.monitor(ctx, T(32.3), y-5, 10, 12);
      this.chair(ctx, T(35), y+2, -Math.PI/2, 9);`;
const content_room_new = `      this.monitor(ctx, T(32.3), y-5, 10, 12);
      this.chair(ctx, T(35), y+2, -Math.PI/2, 9);
      if (i === 1) { // Marketer
        ctx.save();
        const mpx = T(35), mpy = y-2;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.ellipse(mpx, mpy+5, 8, 6, 0, 0, Math.PI*2); ctx.fill(); // Body
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath(); ctx.arc(mpx, mpy-2, 6, 0, Math.PI*2); ctx.fill(); // Head
        ctx.restore();
      }`;
code = code.replace(content_room_old, content_room_new);

// Context Sensitive Interactions
code = code.replace(`  // --- DOOR PROMPTS ---
  private drawDoorPrompts(ctx: CanvasRenderingContext2D) {
    let best: typeof DOORS[0]|null=null, bestD=80;
    for (const d of DOORS) { const dist=Math.hypot(this.state.player.x-TC(d.x),this.state.player.y-TC(d.y)); if (dist<bestD) { bestD=dist; best=d; } }
    if (best) {
      const dx=TC(best.x), dy=TC(best.y), isOpen=this.state.doors[best.id];
      ctx.fillStyle='rgba(0,0,0,0.85)'; ctx.beginPath(); ctx.roundRect(dx-40,dy-26,80,18,4); ctx.fill();
      ctx.strokeStyle='#60a5fa'; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle='#60a5fa'; ctx.font='bold 8px sans-serif'; ctx.textAlign='center';
      ctx.fillText(isOpen?'[E] Close Door':'[E] Open Door', dx, dy-14);
      ctx.textAlign='left';
    }
  }`, `  // --- INTERACTION PROMPTS ---
  private drawDoorPrompts(ctx: CanvasRenderingContext2D) {
    const px = this.state.player.x;
    const py = this.state.player.y;
    let closestText = '';
    let closestX = 0;
    let closestY = 0;
    let minDist = 999;

    const check = (ox: number, oy: number, distThresh: number, text: string) => {
      const d = Math.hypot(px - ox, py - oy);
      if (d < distThresh && d < minDist) {
        minDist = d;
        closestText = text;
        closestX = ox;
        closestY = oy;
      }
    };

    check(T(DIAMOND_CX), T(DIAMOND_CY) - TILE_SIZE * 1.5, 95, '[E] Open Management PC');
    check(T(5), T(7), 85, '[E] Talk to Frontend Dev');
    check(T(36), T(7), 85, '[E] Talk to Designer');
    check(T(22), T(37), 90, '[E] Open Lead Registry');
    check(T(21.5), T(2), 90, '[E] View Architecture Whiteboard');
    check(T(39), T(28), 90, '[E] View Content Calendar');
    
    // Also check doors
    for (const d of DOORS) {
      const dx = TC(d.x);
      const dy = TC(d.y);
      const dist = Math.hypot(px - dx, py - dy);
      if (dist < 85 && dist < minDist) {
        minDist = dist;
        const isOpen = this.state.doors[d.id];
        closestText = isOpen ? '[E] Close Door' : '[E] Open Door';
        closestX = dx;
        closestY = dy;
      }
    }

    if (closestText) {
      const promptX = closestX;
      const promptY = closestY - 32 + Math.sin(this.state.tick * 0.1) * 2;
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      const w = ctx.measureText(closestText).width + 30; // approx
      ctx.beginPath();
      ctx.roundRect(promptX - w/2, promptY - 12, w, 24, 6);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(closestText, promptX, promptY + 4);
      ctx.textAlign = 'left';
      ctx.restore();
    }
  }`);

code = code.replace(`    // 9. Floating Interactive Prompt: [E] Open Computer
    if (isNearPC) {
      ctx.save();
      const promptX = cx;
      const promptY = deskY - 32 + Math.sin(this.state.tick * 0.1) * 2;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.beginPath();
      ctx.roundRect(promptX - 70, promptY - 12, 140, 24, 6);
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💻 [E] Open Management PC', promptX, promptY + 4);
      ctx.textAlign = 'left';
      ctx.restore();
    }`, "");

fs.writeFileSync('src/core/engine.ts', code);
