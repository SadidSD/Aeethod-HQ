const fs = require('fs');

let code = fs.readFileSync('src/core/engine.ts', 'utf-8');

// 1. Add onOpenDesignerPC property
code = code.replace(
  "onOpenComputer: (() => void) | null = null;",
  `onOpenComputer: (() => void) | null = null;
  onOpenDesignerPC: (() => void) | null = null;`
);

// 2. Interactive trigger in keydown 'e'
code = code.replace(
`      if (key === 'e') {
        const px = this.state.player.x, py = this.state.player.y;
        if (Math.hypot(px - T(DIAMOND_CX), py - (T(DIAMOND_CY) - TILE_SIZE * 1.5)) < 95) { this.onOpenComputer?.(); return; }
        if (Math.hypot(px - T(5), py - T(7)) < 85) { this.onOpenMember?.('frontend'); return; }
        if (Math.hypot(px - T(36), py - T(7)) < 85) { this.onOpenMember?.('designer'); return; }
        if (Math.hypot(px - T(22), py - T(37)) < 90) { this.onOpenBoard?.('leads'); return; }
        if (Math.hypot(px - T(21.5), py - T(2)) < 90) { this.onOpenBoard?.('architecture'); return; }
        if (Math.hypot(px - T(39), py - T(28)) < 90) { this.onOpenBoard?.('content'); return; }
        this.toggleNearestDoor();
      }`,
`      if (key === 'e') {
        const px = this.state.player.x, py = this.state.player.y;
        if (Math.hypot(px - T(DIAMOND_CX), py - (T(DIAMOND_CY) - TILE_SIZE * 1.5)) < 95) { this.onOpenComputer?.(); return; }
        if (Math.hypot(px - T(36.5), py - T(6)) < 90) { this.onOpenDesignerPC?.(); return; }
        if (Math.hypot(px - T(5), py - T(7)) < 85) { this.onOpenMember?.('frontend'); return; }
        if (Math.hypot(px - T(22), py - T(37)) < 90) { this.onOpenBoard?.('leads'); return; }
        if (Math.hypot(px - T(21.5), py - T(2)) < 90) { this.onOpenBoard?.('architecture'); return; }
        if (Math.hypot(px - T(39), py - T(28)) < 90) { this.onOpenBoard?.('content'); return; }
        this.toggleNearestDoor();
      }`
);

// 3. Interactive trigger in handleClick
code = code.replace(
`    if (checkClick(T(DIAMOND_CX), T(DIAMOND_CY) - TILE_SIZE * 1.5, 130, () => this.onOpenComputer?.())) return;
    if (checkClick(T(5), T(7), 130, () => this.onOpenMember?.('frontend'))) return;
    if (checkClick(T(36), T(7), 130, () => this.onOpenMember?.('designer'))) return;
    if (checkClick(T(22), T(37), 130, () => this.onOpenBoard?.('leads'))) return;
    if (checkClick(T(21.5), T(2), 130, () => this.onOpenBoard?.('architecture'))) return;
    if (checkClick(T(39), T(28), 130, () => this.onOpenBoard?.('content'))) return;`,
`    if (checkClick(T(DIAMOND_CX), T(DIAMOND_CY) - TILE_SIZE * 1.5, 130, () => this.onOpenComputer?.())) return;
    if (checkClick(T(36.5), T(6), 130, () => this.onOpenDesignerPC?.())) return;
    if (checkClick(T(5), T(7), 130, () => this.onOpenMember?.('frontend'))) return;
    if (checkClick(T(22), T(37), 130, () => this.onOpenBoard?.('leads'))) return;
    if (checkClick(T(21.5), T(2), 130, () => this.onOpenBoard?.('architecture'))) return;
    if (checkClick(T(39), T(28), 130, () => this.onOpenBoard?.('content'))) return;`
);

// 4. Prompts in drawDoorPrompts
code = code.replace(
`    check(T(DIAMOND_CX), T(DIAMOND_CY) - TILE_SIZE * 1.5, 95, '[E] Open Management PC');
    check(T(5), T(7), 85, '[E] Talk to Frontend Dev');
    check(T(36), T(7), 85, '[E] Talk to Designer');
    check(T(22), T(37), 90, '[E] Open Lead Registry');
    check(T(21.5), T(2), 90, '[E] View Architecture Whiteboard');
    check(T(39), T(28), 90, '[E] View Content Calendar');`,
`    check(T(DIAMOND_CX), T(DIAMOND_CY) - TILE_SIZE * 1.5, 95, '👑 [E] Open Management PC');
    check(T(36.5), T(6), 90, '🎨 [E] Open Designer Terminal');
    check(T(5), T(7), 85, '💻 [E] Dev Workstation');
    check(T(22), T(37), 90, '🛎️ [E] Open Lead Registry');
    check(T(21.5), T(2), 90, '📐 [E] View Architecture Whiteboard');
    check(T(39), T(28), 90, '📅 [E] View Content Calendar');`
);

// 5. Replace drawDevRoom (remove bot avatar, create sleek player dev stations)
const newDevRoom = `  // --- DEVELOPMENT ROOM ---
  private drawDevRoom(ctx: CanvasRenderingContext2D, S: number) {
    // Long workstation bench along left wall
    this.desk(ctx, T(1.5), T(3), S*2, S*16, '#ddd');

    // 4 Developer workstation setups (dual monitors, keyboards, desk lamps, coffee mugs)
    for (let i = 0; i < 4; i++) {
      const y = T(4.5 + i * 4);
      // Dual monitors
      this.monitor(ctx, T(1.8), y - 6, 10, 14);
      this.monitor(ctx, T(2.8), y - 6, 10, 14);
      // Ergonomic mesh chair
      this.chair(ctx, T(5), y + 2, -Math.PI / 2, 10);

      // Keyboard & mouse
      ctx.fillStyle = '#334155';
      ctx.fillRect(T(2.2), y - 2, 12, 5);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(T(2.2), y + 5, 4, 6);

      // Screen glow with code syntax lines
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fillRect(T(1.8), y - 6, 10, 14);
      ctx.fillRect(T(2.8), y - 6, 10, 14);
      // Code syntax scanlines
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(T(2.0), y - 4, 6, 1);
      ctx.fillRect(T(2.0), y - 1, 7, 1);
      ctx.fillRect(T(3.0), y - 4, 6, 1);
      ctx.fillRect(T(3.0), y - 1, 5, 1);

      // Coffee mug with steam
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath(); ctx.arc(T(3.2), y + 12, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.beginPath(); ctx.arc(T(3.2), y + 12, 2, 0, Math.PI * 2); ctx.fill();
      const steamY = (this.state.tick * 0.4 + i * 5) % 12;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath(); ctx.arc(T(3.2), y + 10 - steamY, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    // Second row of desks (center of room)
    this.desk(ctx, T(7), T(5), S*3, S*2, '#ddd');
    this.monitor(ctx, T(7.3), T(5.3), 10, 12);
    this.monitor(ctx, T(8.8), T(5.3), 10, 12);
    this.chair(ctx, T(8.5), T(8), 0, 9);
    this.chair(ctx, T(7.5), T(8), 0, 9);

    this.desk(ctx, T(7), T(11), S*3, S*2, '#ddd');
    this.monitor(ctx, T(7.3), T(11.3), 10, 12);
    this.monitor(ctx, T(8.8), T(11.3), 10, 12);
    this.chair(ctx, T(8.5), T(14), 0, 9);
    this.chair(ctx, T(7.5), T(14), 0, 9);

    // </> Whiteboard on top wall
    this.whiteboard(ctx, T(5), T(1.2), S*5, 14, '</> CODE ARCHITECTURE');
    ctx.fillStyle='#555'; ctx.font='bold 16px monospace'; ctx.fillText('</>', T(3.5), T(19.5));
  }`;

// 6. Replace drawDesignRoom (Full dedicated studio with interactive Designer Computer)
const newDesignRoom = `  // --- DESIGN ROOM (Rich Creative Studio & Dedicated Workstation) ---
  private drawDesignRoom(ctx: CanvasRenderingContext2D, S: number) {
    // 1. Creative Studio Flooring Accent / Area Rug
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(T(33.5), T(3.5), S * 6.4, S * 5.2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(T(33.5), T(3.5), S * 6.4, S * 5.2);
    ctx.restore();

    // 2. Dedicated Lead Designer Workstation (Center of Design Room)
    const deskW = S * 4.6;
    const deskH = S * 1.8;
    const deskX = T(34.4);
    const deskY = T(4.4);

    // Desk shadow
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(deskX + 3, deskY + 4, deskW, deskH);
    // Desk surface (Matte Obsidian with brass edge)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(deskX, deskY, deskW, deskH);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(deskX, deskY, deskW, deskH);

    // Leather blotter mat
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(deskX + S * 0.8, deskY + 6, S * 3.0, deskH - 12);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(deskX + S * 0.8, deskY + 6, S * 3.0, deskH - 12);

    // Dual Color-Calibrated Graphic Design Displays (Ultrawide with top hood)
    // Left display (Figma UI Canvas)
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(deskX + S * 0.9, deskY + 8, 22, 14);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(deskX + S * 0.9 + 1, deskY + 9, 20, 12);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(deskX + S * 0.9 + 3, deskY + 11, 6, 8); // Figma wireframe card
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(deskX + S * 0.9 + 11, deskY + 11, 7, 3);
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(deskX + S * 0.9 + 11, deskY + 15, 7, 3);

    // Right display (Color Wheel & Assets)
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(deskX + S * 1.8, deskY + 8, 22, 14);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(deskX + S * 1.8 + 1, deskY + 9, 20, 12);
    // Color wheel circle
    ctx.fillStyle = '#ec4899';
    ctx.beginPath(); ctx.arc(deskX + S * 1.8 + 11, deskY + 15, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath(); ctx.arc(deskX + S * 1.8 + 11, deskY + 15, 2.5, 0, Math.PI); ctx.fill();

    // Wacom Cintiq Graphics Tablet with Stylus
    ctx.fillStyle = '#090d14';
    ctx.fillRect(deskX + S * 1.3, deskY + 28, 26, 16);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.strokeRect(deskX + S * 1.3, deskY + 28, 26, 16);
    // Stylus pen
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(deskX + S * 1.3 + 28, deskY + 30, 2, 12);

    // Designer PC Tower with RGB breathing ring
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(deskX + deskW - 16, deskY + 8, 12, 28);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(deskX + deskW - 16, deskY + 8, 12, 28);
    const rgbHue = (this.state.tick * 2) % 360;
    ctx.fillStyle = \`hsl(\${rgbHue}, 80%, 60%)\`;
    ctx.beginPath(); ctx.arc(deskX + deskW - 10, deskY + 16, 3, 0, Math.PI * 2); ctx.fill();

    // Pantone Swatch Fan Deck on Desk
    const swatches = ['#f43f5e', '#f59e0b', '#06b6d4', '#a855f7'];
    for (let s = 0; s < 4; s++) {
      ctx.fillStyle = swatches[s];
      ctx.fillRect(deskX + 6 + s * 4, deskY + 12 + s * 2, 8, 4);
    }

    // Ergonomic Herman-Miller style Creative Chair (facing the desk)
    this.chair(ctx, T(36.5), deskY + deskH + 12, 0, 11);

    // 3. Top Wall Design System Spec Board (y = 1.2)
    this.whiteboard(ctx, T(33), T(1.2), S * 7.5, 14, '🎨 FIGMA DESIGN SYSTEM • COMPONENT LIBRARY');
    // Mini UI mockup cards pinned on top wall
    const chipCols = ['#f43f5e', '#06b6d4', '#10b981', '#f59e0b', '#a855f7'];
    for (let c = 0; c < 5; c++) {
      ctx.fillStyle = chipCols[c];
      ctx.fillRect(T(33.5 + c * 1.5), T(1.5), 10, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(T(33.5 + c * 1.5 + 2), T(1.5 + 2), 6, 1.5);
    }

    // 4. East Wall Pantone Swatch Deck & Mood Board (x = 41)
    this.desk(ctx, T(41.2), T(3), 12, S * 13, '#1e293b');
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.strokeRect(T(41.2), T(3), 12, S * 13);
    const moodColors = ['#f43f5e', '#06b6d4', '#10b981', '#f59e0b', '#a855f7', '#3b82f6', '#ec4899', '#14b8a6'];
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = moodColors[i];
      ctx.fillRect(T(41.5), T(3.5 + i * 1.5), 9, 8);
    }
    // Sticky notes on right corkboard
    const stickies = ['#fff9c4', '#ffccbc', '#c8e6c9', '#bbdefb', '#e1bee7'];
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = stickies[i % 5];
      ctx.fillRect(T(39.5 + (i % 2) * 1.2), T(10 + Math.floor(i / 2) * 1.4), 8, 8);
    }

    // 5. Collaborative Prototyping Drafting Table (South Design Room, y = 13)
    this.desk(ctx, T(34), T(12.5), S * 4.5, S * 2.4, '#d8d4cb');
    // Blueprints & sketches on drafting table
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(T(34.8), T(13), S * 1.8, S * 1.4);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(T(34.8), T(13), S * 1.8, S * 1.4);
    // Design sketchpad
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(T(37.0), T(13.2), S * 1.2, S * 1.0);
    // Drafting stools around table
    this.chair(ctx, T(33.2), T(13.7), Math.PI / 2, 9);
    this.chair(ctx, T(39.2), T(13.7), -Math.PI / 2, 9);

    // 6. 3D Prototype Showcase Shelves (Packaging & UI Kits)
    this.desk(ctx, T(34), T(16.5), S * 3.0, 14, '#475569');
    // Packaging boxes
    ctx.fillStyle = '#f59e0b'; ctx.fillRect(T(34.4), T(16.6), 10, 8);
    ctx.fillStyle = '#06b6d4'; ctx.fillRect(T(35.6), T(16.6), 8, 8);
    ctx.fillStyle = '#a855f7'; ctx.fillRect(T(36.5), T(16.6), 9, 8);

    // 7. Studio Espresso & Coffee Credenza
    this.desk(ctx, T(39.5), T(16.5), S * 1.8, 14, '#334155');
    // Espresso machine
    ctx.fillStyle = '#e2e8f0'; ctx.fillRect(T(39.8), T(16.6), 8, 8);
    ctx.fillStyle = '#78350f'; ctx.fillRect(T(40.6), T(16.8), 3, 4);

    // Potted Monstera Plant
    this.plant(ctx, T(32.5), T(18), 16);
  }`;

// Find start and end of drawDevRoom and drawDesignRoom
const devStart = code.indexOf("  // --- DEVELOPMENT ROOM ---");
const mgmtStart = code.indexOf("  // --- MANAGEMENT ROOM");

if (devStart !== -1 && mgmtStart !== -1) {
  code = code.slice(0, devStart) + newDevRoom + "\n\n" + newDesignRoom + "\n\n" + code.slice(mgmtStart);
}

// Remove bot avatar in client room
const clientAvatarOld = `    // Client NPC sitting at table
    ctx.save();
    const cpx = T(9.5), cpy = T(32);
    ctx.fillStyle = '#475569';
    ctx.beginPath(); ctx.ellipse(cpx, cpy-4, 7, 5, 0, 0, Math.PI*2); ctx.fill(); // Body
    ctx.fillStyle = '#fde047';
    ctx.beginPath(); ctx.arc(cpx-4, cpy-4, 5, 0, Math.PI*2); ctx.fill(); // Head
    ctx.restore();`;
code = code.replace(clientAvatarOld, "");

// Remove bot avatar in content room
const contentAvatarOld = `      if (i === 1) { // Marketer
        ctx.save();
        const mpx = T(35), mpy = y-2;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.ellipse(mpx, mpy+5, 8, 6, 0, 0, Math.PI*2); ctx.fill(); // Body
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath(); ctx.arc(mpx, mpy-2, 6, 0, Math.PI*2); ctx.fill(); // Head
        ctx.restore();
      }`;
code = code.replace(contentAvatarOld, "");

fs.writeFileSync('src/core/engine.ts', code, 'utf-8');
console.log('Successfully updated Designer Room and removed bot avatars!');
