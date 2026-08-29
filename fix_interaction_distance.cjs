const fs = require('fs');

let code = fs.readFileSync('src/core/engine.ts', 'utf-8');

// 1. Add getNearestInteraction method
const nearestInteractionMethod = `  getNearestInteraction(): { type: 'door' | 'mgmt_pc' | 'designer_pc' | 'dev_pc' | 'board_leads' | 'board_arch' | 'board_content'; text: string; x: number; y: number; id?: string } | null {
    const px = this.state.player.x;
    const py = this.state.player.y;
    let closest: { type: any; text: string; x: number; y: number; id?: string } | null = null;
    let minDist = 999;

    const check = (type: any, ox: number, oy: number, distThresh: number, text: string, id?: string) => {
      const d = Math.hypot(px - ox, py - oy);
      if (d < distThresh && d < minDist) {
        minDist = d;
        closest = { type, text, x: ox, y: oy, id };
      }
    };

    // Check doors with tight distance
    for (const d of DOORS) {
      const dx = TC(d.x);
      const dy = TC(d.y);
      const isOpen = this.state.doors[d.id];
      check('door', dx, dy, 55, isOpen ? '[E] Close Door' : '[E] Open Door', d.id);
    }

    // Check Workstations & Boards with tight radius right at the object
    check('mgmt_pc', T(DIAMOND_CX), T(DIAMOND_CY) - TILE_SIZE * 1.5, 65, '👑 [E] Open Management PC');
    check('designer_pc', T(38.0), T(9.0), 50, '🎨 [E] Open Designer Terminal');
    check('dev_pc', T(5), T(7), 50, '💻 [E] Dev Workstation');
    check('board_leads', T(22), T(37), 50, '🛎️ [E] Open Lead Registry');
    check('board_arch', T(21.5), T(2), 50, '📐 [E] View Architecture Whiteboard');
    check('board_content', T(39), T(28), 50, '📅 [E] View Content Calendar');

    return closest;
  }`;

// 2. Replace setupEvents keydown 'e' handler
const oldKeyDownE = `      if (key === 'e') {
        const px = this.state.player.x, py = this.state.player.y;
        if (Math.hypot(px - T(DIAMOND_CX), py - (T(DIAMOND_CY) - TILE_SIZE * 1.5)) < 95) { this.onOpenComputer?.(); return; }
        if (Math.hypot(px - T(38.0), py - T(9.0)) < 95) { this.onOpenDesignerPC?.(); return; }
        if (Math.hypot(px - T(5), py - T(7)) < 85) { this.onOpenMember?.('frontend'); return; }
        if (Math.hypot(px - T(22), py - T(37)) < 90) { this.onOpenBoard?.('leads'); return; }
        if (Math.hypot(px - T(21.5), py - T(2)) < 90) { this.onOpenBoard?.('architecture'); return; }
        if (Math.hypot(px - T(39), py - T(28)) < 90) { this.onOpenBoard?.('content'); return; }
        this.toggleNearestDoor();
      }`;

const newKeyDownE = `      if (key === 'e') {
        const interaction = this.getNearestInteraction();
        if (interaction) {
          if (interaction.type === 'door' && interaction.id) {
            this.state.doors[interaction.id] = !this.state.doors[interaction.id];
          } else if (interaction.type === 'mgmt_pc') {
            this.onOpenComputer?.();
          } else if (interaction.type === 'designer_pc') {
            this.onOpenDesignerPC?.();
          } else if (interaction.type === 'dev_pc') {
            this.onOpenMember?.('frontend');
          } else if (interaction.type === 'board_leads') {
            this.onOpenBoard?.('leads');
          } else if (interaction.type === 'board_arch') {
            this.onOpenBoard?.('architecture');
          } else if (interaction.type === 'board_content') {
            this.onOpenBoard?.('content');
          }
        }
      }`;

code = code.replace(oldKeyDownE, newKeyDownE);

// 3. Replace toggleNearestDoor with getNearestInteraction
const oldToggleNearestDoor = `  toggleNearestDoor() {
    let best: typeof DOORS[0]|null = null, bestD = 85;
    for (const d of DOORS) { const dist = Math.hypot(this.state.player.x - TC(d.x), this.state.player.y - TC(d.y)); if (dist<bestD) { bestD=dist; best=d; } }
    if (best) this.state.doors[best.id] = !this.state.doors[best.id];
  }`;

code = code.replace(oldToggleNearestDoor, nearestInteractionMethod);

// 4. Update handleClick click distances
const oldHandleClick = `    const checkClick = (ox: number, oy: number, maxPlayerDist: number, cb: () => void) => {
      if (Math.hypot(mx - ox, my - oy) < 60 && Math.hypot(px - ox, py - oy) < maxPlayerDist) { cb(); return true; }
      return false;
    };
    if (checkClick(T(DIAMOND_CX), T(DIAMOND_CY) - TILE_SIZE * 1.5, 130, () => this.onOpenComputer?.())) return;
    if (checkClick(T(38.0), T(9.0), 130, () => this.onOpenDesignerPC?.())) return;
    if (checkClick(T(5), T(7), 130, () => this.onOpenMember?.('frontend'))) return;
    if (checkClick(T(22), T(37), 130, () => this.onOpenBoard?.('leads'))) return;
    if (checkClick(T(21.5), T(2), 130, () => this.onOpenBoard?.('architecture'))) return;
    if (checkClick(T(39), T(28), 130, () => this.onOpenBoard?.('content'))) return;

    if (tile.isDoor) { const d = DOORS.find(dd=>dd.x===tx&&dd.y===ty); if (d && Math.hypot(this.state.player.x-TC(d.x), this.state.player.y-TC(d.y))<100) { this.state.doors[d.id]=!this.state.doors[d.id]; return; } }`;

const newHandleClick = `    if (tile.isDoor) {
      const d = DOORS.find(dd => dd.x === tx && dd.y === ty);
      if (d && Math.hypot(this.state.player.x - TC(d.x), this.state.player.y - TC(d.y)) < 65) {
        this.state.doors[d.id] = !this.state.doors[d.id];
        return;
      }
    }

    const checkClick = (ox: number, oy: number, maxPlayerDist: number, cb: () => void) => {
      if (Math.hypot(mx - ox, my - oy) < 40 && Math.hypot(px - ox, py - oy) < maxPlayerDist) {
        cb();
        return true;
      }
      return false;
    };
    if (checkClick(T(DIAMOND_CX), T(DIAMOND_CY) - TILE_SIZE * 1.5, 75, () => this.onOpenComputer?.())) return;
    if (checkClick(T(38.0), T(9.0), 55, () => this.onOpenDesignerPC?.())) return;
    if (checkClick(T(5), T(7), 55, () => this.onOpenMember?.('frontend'))) return;
    if (checkClick(T(22), T(37), 55, () => this.onOpenBoard?.('leads'))) return;
    if (checkClick(T(21.5), T(2), 55, () => this.onOpenBoard?.('architecture'))) return;
    if (checkClick(T(39), T(28), 55, () => this.onOpenBoard?.('content'))) return;`;

code = code.replace(oldHandleClick, newHandleClick);

// 5. Update drawDoorPrompts to use getNearestInteraction
const drawDoorPromptsStart = code.indexOf("  // --- INTERACTION PROMPTS ---");
const newDrawDoorPrompts = `  // --- INTERACTION PROMPTS ---
  private drawDoorPrompts(ctx: CanvasRenderingContext2D) {
    const interaction = this.getNearestInteraction();
    if (!interaction) return;

    const promptX = interaction.x;
    const promptY = interaction.y - 28 + Math.sin(this.state.tick * 0.1) * 2;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    const w = ctx.measureText(interaction.text).width + 30;
    ctx.beginPath();
    ctx.roundRect(promptX - w / 2, promptY - 12, w, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(interaction.text, promptX, promptY + 4);
    ctx.textAlign = 'left';
    ctx.restore();
  }
}`;

if (drawDoorPromptsStart !== -1) {
  code = code.slice(0, drawDoorPromptsStart) + newDrawDoorPrompts;
}

fs.writeFileSync('src/core/engine.ts', code, 'utf-8');
console.log('Successfully fixed interaction distance separation between Door and Designer PC!');
