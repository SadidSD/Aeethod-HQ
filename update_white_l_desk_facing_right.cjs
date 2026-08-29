const fs = require('fs');

let code = fs.readFileSync('src/core/engine.ts', 'utf-8');

// 1. Update keydown 'e' check for Designer PC
code = code.replace(
  "if (Math.hypot(px - T(36.8), py - T(9.5)) < 95) { this.onOpenDesignerPC?.(); return; }",
  "if (Math.hypot(px - T(36.0), py - T(9.0)) < 95) { this.onOpenDesignerPC?.(); return; }"
);

// 2. Update handleClick check for Designer PC
code = code.replace(
  "if (checkClick(T(36.8), T(9.5), 130, () => this.onOpenDesignerPC?.())) return;",
  "if (checkClick(T(36.0), T(9.0), 130, () => this.onOpenDesignerPC?.())) return;"
);

// 3. Update drawDoorPrompts check for Designer PC
code = code.replace(
  "check(T(36.8), T(9.5), 95, '🎨 [E] Open Designer Terminal');",
  "check(T(36.0), T(9.0), 95, '🎨 [E] Open Designer Terminal');"
);

// 4. Replace drawDesignRoom with white L-shaped boss desk facing right
const whiteLDeskFacingRight = `  // --- DESIGN ROOM (Luxury White L-Shaped Boss Executive Desk Facing Right) ---
  private drawDesignRoom(ctx: CanvasRenderingContext2D, S: number) {
    const cx = T(36.0);
    const cy = T(9.0);
    const isNearPC = Math.hypot(this.state.player.x - cx, this.state.player.y - cy) < 95;

    // 1. Executive Slate Rug with Gold Perimeter Border
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(T(32.5), T(5.0), S * 7.5, S * 7.5);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(T(32.5), T(5.0), S * 7.5, S * 7.5);
    ctx.restore();

    // 2. Luxury White L-Shaped Boss Desk Geometry (Main desk vertical, facing Right)
    // Main vertical desk (facing Right / East)
    const mainX = T(35.2);
    const mainY = T(6.0);
    const mainW = S * 1.8; // 29px wide
    const mainH = S * 5.5; // 88px tall vertical span

    // Top horizontal return credenza (forming L on the top-left)
    const retX = T(33.0);
    const retY = T(6.0);
    const retW = S * 2.2;
    const retH = S * 1.8;

    ctx.save();

    // Drop Shadow for White L-Desk
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.fillRect(mainX + 3, mainY + 4, mainW, mainH);
    ctx.fillRect(retX + 3, retY + 4, retW, retH);

    // Pristine Gloss White / Calacatta Tabletop
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(mainX, mainY, mainW, mainH);
    ctx.fillRect(retX, retY, retW, retH);

    // Polished Champagne Gold / Brass Perimeter Trim
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.strokeRect(mainX, mainY, mainW, mainH);
    ctx.strokeRect(retX, retY, retW, retH);

    // Seamless junction blend for the white tabletop
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(retX + 2, retY + 2, retW + 2, retH - 4);

    // Executive Leather Desk Blotter on Main Vertical Desk
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(mainX + 4, mainY + S * 0.8, mainW - 8, S * 3.8);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(mainX + 4, mainY + S * 0.8, mainW - 8, S * 3.8);

    // 3. High-Tech Designer Computer Setup on White Desk (Screens facing Right / East)
    const pcX = mainX + 6;
    const pcY = mainY + S * 1.6;

    // Display 1 (Top Screen - Figma UI Wireframes)
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(pcX, pcY, 6, 22);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    ctx.strokeRect(pcX, pcY, 6, 22);
    // Screen glowing pixels facing right
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(pcX + 2, pcY + 1, 3, 20);
    ctx.fillStyle = '#f59e0b'; ctx.fillRect(pcX + 2, pcY + 3, 3, 6);
    ctx.fillStyle = '#06b6d4'; ctx.fillRect(pcX + 2, pcY + 11, 3, 7);

    // Display 2 (Bottom Screen - Color Tokens & System Spec)
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(pcX, pcY + 26, 6, 22);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    ctx.strokeRect(pcX, pcY + 26, 6, 22);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(pcX + 2, pcY + 27, 3, 20);
    ctx.fillStyle = '#ec4899'; ctx.fillRect(pcX + 2, pcY + 29, 3, 6);
    ctx.fillStyle = '#a855f7'; ctx.fillRect(pcX + 2, pcY + 37, 3, 8);

    // Minimalist White Keyboard in front of displays (facing Right)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(pcX + 10, pcY + 8, 6, 26);
    ctx.fillStyle = isNearPC ? '#38bdf8' : '#cbd5e1';
    for (let k = 0; k < 4; k++) {
      ctx.fillRect(pcX + 11, pcY + 10 + k * 6, 4, 2);
    }
    // Precision Mouse
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(pcX + 11, pcY + 38, 5, 7);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(pcX + 11, pcY + 38, 5, 7);

    // Tower PC on top return credenza with RGB ring
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(retX + 6, retY + 6, 22, 14);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(retX + 6, retY + 6, 22, 14);
    const rgbHue = (this.state.tick * 2) % 360;
    ctx.fillStyle = \`hsl(\${rgbHue}, 80%, 60%)\`;
    ctx.beginPath(); ctx.arc(retX + 17, retY + 13, 3, 0, Math.PI * 2); ctx.fill();

    // Ceramic Coffee Mug & Pen Stand on side credenza
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(retX + retW - 8, retY + 12, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.beginPath(); ctx.arc(retX + retW - 8, retY + 12, 2.2, 0, Math.PI * 2); ctx.fill();

    ctx.restore();

    // 4. High-Backed Executive Boss Chair (Inside the L-Cockpit on the Left, Facing Right)
    // Position at (mainX - 16, mainY + mainH / 2), angle = Math.PI / 2 (facing Right)
    this.chair(ctx, mainX - 14, mainY + mainH / 2, Math.PI / 2, 13);

    // 5. Luxury Visitor Armchairs on the RIGHT Side (Facing Left towards Boss Desk)
    this.chair(ctx, mainX + mainW + 16, mainY + S * 1.2, -Math.PI / 2, 10);
    this.chair(ctx, mainX + mainW + 16, mainY + mainH - S * 1.2, -Math.PI / 2, 10);
  }`;

const designStart = code.indexOf("  // --- DESIGN ROOM");
const mgmtStart = code.indexOf("  // --- MANAGEMENT ROOM");

if (designStart !== -1 && mgmtStart !== -1) {
  code = code.slice(0, designStart) + whiteLDeskFacingRight + "\n\n" + code.slice(mgmtStart);
}

fs.writeFileSync('src/core/engine.ts', code, 'utf-8');
console.log('Successfully updated Design Room to white L-shaped boss desk facing right!');
