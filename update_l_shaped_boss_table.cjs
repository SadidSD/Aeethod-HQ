const fs = require('fs');

let code = fs.readFileSync('src/core/engine.ts', 'utf-8');

// 1. Update keydown 'e' check for Designer PC
code = code.replace(
  "if (Math.hypot(px - T(36.5), py - T(10)) < 95) { this.onOpenDesignerPC?.(); return; }",
  "if (Math.hypot(px - T(36.8), py - T(9.5)) < 95) { this.onOpenDesignerPC?.(); return; }"
);

// 2. Update handleClick check for Designer PC
code = code.replace(
  "if (checkClick(T(36.5), T(10), 130, () => this.onOpenDesignerPC?.())) return;",
  "if (checkClick(T(36.8), T(9.5), 130, () => this.onOpenDesignerPC?.())) return;"
);

// 3. Update drawDoorPrompts check for Designer PC
code = code.replace(
  "check(T(36.5), T(10), 95, '🎨 [E] Open Designer Terminal');",
  "check(T(36.8), T(9.5), 95, '🎨 [E] Open Designer Terminal');"
);

// 4. Replace drawDesignRoom with luxury L-shaped boss table
const lShapedBossRoom = `  // --- DESIGN ROOM (Luxury L-Shaped Boss Executive Desk & Workstation) ---
  private drawDesignRoom(ctx: CanvasRenderingContext2D, S: number) {
    const cx = T(36.8);
    const cy = T(9.5);
    const isNearPC = Math.hypot(this.state.player.x - cx, this.state.player.y - cy) < 95;

    // 1. Executive Slate Rug with Gold Trim
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(T(33.5), T(5.0), S * 6.5, S * 6.8);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(T(33.5), T(5.0), S * 6.5, S * 6.8);
    ctx.restore();

    // 2. L-Shaped Boss Desk Geometry
    const mainX = T(34.0);
    const mainY = T(8.8);
    const mainW = S * 5.4; // Main horizontal desk
    const mainH = S * 1.8;

    const retX = mainX + mainW - S * 1.8; // Right vertical return credenza
    const retY = T(5.2);
    const retW = S * 1.8;
    const retH = S * 3.6;

    ctx.save();

    // Drop Shadow for L-Desk
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(mainX + 3, mainY + 4, mainW, mainH);
    ctx.fillRect(retX + 3, retY + 4, retW, retH);

    // Desk Base (Dark Obsidian & Matte Charcoal)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(mainX, mainY, mainW, mainH);
    ctx.fillRect(retX, retY, retW, retH);

    // Desk Polished Brass / Gold Perimeter Trim
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.strokeRect(mainX, mainY, mainW, mainH);
    ctx.strokeRect(retX, retY, retW, retH);

    // Seamless junction blend
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(retX + 2, mainY - 2, retW - 4, 6);

    // Executive Leather Desk Blotter on Main Desk
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(mainX + S * 0.8, mainY + 6, S * 3.2, mainH - 12);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(mainX + S * 0.8, mainY + 6, S * 3.2, mainH - 12);

    // 3. High-End Dual Displays on Boss Desk
    const pcX = mainX + S * 1.4;
    const pcY = mainY;

    // Display 1 (Left - Figma UI Canvas)
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(pcX, pcY + 6, 22, 12);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    ctx.strokeRect(pcX, pcY + 6, 22, 12);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(pcX + 1, pcY + 7, 20, 10);
    // UI Screen content
    ctx.fillStyle = '#f59e0b'; ctx.fillRect(pcX + 3, pcY + 9, 6, 6);
    ctx.fillStyle = '#06b6d4'; ctx.fillRect(pcX + 10, pcY + 9, 8, 2);
    ctx.fillStyle = '#a855f7'; ctx.fillRect(pcX + 10, pcY + 12, 8, 3);

    // Display 2 (Right - Color System / Analytics)
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(pcX + 24, pcY + 6, 22, 12);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    ctx.strokeRect(pcX + 24, pcY + 6, 22, 12);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(pcX + 25, pcY + 7, 20, 10);
    // Color Wheel / Graphs
    ctx.fillStyle = '#ec4899';
    ctx.beginPath(); ctx.arc(pcX + 35, pcY + 12, 3.5, 0, Math.PI * 2); ctx.fill();

    // Keyboard & Precision Mouse on Leather Blotter
    ctx.fillStyle = '#334155';
    ctx.fillRect(pcX + 10, pcY + 22, 24, 6);
    ctx.fillStyle = isNearPC ? '#38bdf8' : '#cbd5e1';
    for (let k = 0; k < 4; k++) {
      ctx.fillRect(pcX + 12 + k * 5, pcY + 23, 3, 2);
    }
    // Mouse
    ctx.fillStyle = '#64748b';
    ctx.fillRect(pcX + 37, pcY + 22, 4, 6);

    // Executive Accessories on Side Return (Tower PC, Pen Holder, Document Trays)
    // Workstation Tower with RGB ring
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(retX + 6, retY + 8, 14, 26);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(retX + 6, retY + 8, 14, 26);
    const rgbHue = (this.state.tick * 2) % 360;
    ctx.fillStyle = \`hsl(\${rgbHue}, 80%, 60%)\`;
    ctx.beginPath(); ctx.arc(retX + 13, retY + 16, 3, 0, Math.PI * 2); ctx.fill();

    // Executive Coffee Mug & Pen Stand
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath(); ctx.arc(mainX + S * 0.4, mainY + 12, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.beginPath(); ctx.arc(mainX + S * 0.4, mainY + 12, 2.2, 0, Math.PI * 2); ctx.fill();

    ctx.restore();

    // 4. High-Backed Executive Boss Chair (Inside the L-Cockpit, facing the desk & room)
    this.chair(ctx, mainX + S * 2.4, mainY - 14, 0, 13);

    // 5. Executive Visitor Armchairs (In front of desk)
    this.chair(ctx, mainX + S * 1.2, mainY + mainH + 14, Math.PI, 10);
    this.chair(ctx, mainX + S * 3.6, mainY + mainH + 14, Math.PI, 10);
  }`;

const designStart = code.indexOf("  // --- DESIGN ROOM");
const mgmtStart = code.indexOf("  // --- MANAGEMENT ROOM");

if (designStart !== -1 && mgmtStart !== -1) {
  code = code.slice(0, designStart) + lShapedBossRoom + "\n\n" + code.slice(mgmtStart);
}

fs.writeFileSync('src/core/engine.ts', code, 'utf-8');
console.log('Successfully updated Design Room to luxury L-shaped boss table!');
