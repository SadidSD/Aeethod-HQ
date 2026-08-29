const fs = require('fs');

let code = fs.readFileSync('src/core/engine.ts', 'utf-8');

const uShapedManagementRoom = `  // --- MANAGEMENT ROOM (Big Luxury U-Shaped Executive Table & Command PC) ---
  private drawManagementRoom(ctx: CanvasRenderingContext2D, S: number) {
    const cx = T(DIAMOND_CX), cy = T(DIAMOND_CY);
    const distToPC = Math.hypot(this.state.player.x - cx, this.state.player.y - (cy - S * 1.5));
    const isNearPC = distToPC < 70;

    // =========================================================================
    // 👑 BIG U-SHAPED EXECUTIVE TABLE
    // =========================================================================
    // Dimensions
    const topW = S * 7.2; // 115px wide top horizontal bridge
    const topH = S * 1.8; // 29px tall
    const topX = cx - topW / 2;
    const topY = cy - S * 2.4;

    const wingW = S * 1.8; // 29px wide left and right wings
    const wingH = S * 4.6; // 74px long vertical wings extending downwards
    const leftX = topX;
    const leftY = topY;

    const rightX = topX + topW - wingW;
    const rightY = topY;

    ctx.save();

    // 1. Soft Ambient Occlusion / Drop Shadow for entire U-Table
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.beginPath();
    ctx.roundRect(topX + 4, topY + 4, topW, topH, 3);
    ctx.roundRect(leftX + 4, leftY + 4, wingW, wingH, 3);
    ctx.roundRect(rightX + 4, rightY + 4, wingW, wingH, 3);
    ctx.fill();

    // 2. Executive Tabletop (Dark Obsidian & Smoked Ash with Brass Trim)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(topX, topY, topW, topH, 2);
    ctx.roundRect(leftX, leftY, wingW, wingH, 2);
    ctx.roundRect(rightX, rightY, wingW, wingH, 2);
    ctx.fill();

    // Polished Champagne Gold / Brass Perimeter Trim
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(topX, topY, topW, topH, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(leftX, leftY, wingW, wingH, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(rightX, rightY, wingW, wingH, 2);
    ctx.stroke();

    // Seamless Mitered Corner Junction Blends (Removes interior dividing lines)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(leftX + 2, topY + 2, wingW - 4, topH - 4);
    ctx.fillRect(rightX + 2, topY + 2, wingW - 4, topH - 4);

    // Executive Inlaid Leather Blotters
    // Top Desk Center Blotter
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - S * 1.8, topY + 5, S * 3.6, topH - 10);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - S * 1.8, topY + 5, S * 3.6, topH - 10);

    // Left Wing Blotter
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(leftX + 5, topY + topH + 6, wingW - 10, wingH - topH - 16);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(leftX + 5, topY + topH + 6, wingW - 10, wingH - topH - 16);

    // Right Wing Blotter
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(rightX + 5, topY + topH + 6, wingW - 10, wingH - topH - 16);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(rightX + 5, topY + topH + 6, wingW - 10, wingH - topH - 16);


    // =========================================================================
    // 🖥️ 3. HIGH-TECH COMMAND PC (On Top of the U-Table)
    // =========================================================================
    const pcX = cx;
    const pcY = topY + 4;

    // Ultrawide Curved Studio Monitor (Centered on top span)
    ctx.fillStyle = '#090d12';
    ctx.fillRect(pcX - 26, pcY + 2, 52, 14);
    ctx.strokeStyle = isNearPC ? '#38bdf8' : '#d4af37';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pcX - 26, pcY + 2, 52, 14);

    // Live Executive Agency Analytics Screen
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(pcX - 24, pcY + 4, 48, 10);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(pcX - 22, pcY + 5, 12, 8); // Window 1 (Projects)
    ctx.fillStyle = '#22c55e'; ctx.fillRect(pcX - 8, pcY + 5, 16, 8);  // Window 2 (Revenue Chart)
    ctx.fillStyle = '#fbbf24'; ctx.fillRect(pcX + 10, pcY + 5, 12, 8); // Window 3 (Quests)

    // Warm Architectural Lightbar Glow behind monitor
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.beginPath();
    ctx.ellipse(pcX, pcY + 10, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Executive Keyboard on Leather Blotter
    ctx.fillStyle = '#334155';
    ctx.fillRect(pcX - 14, topY + topH - 9, 28, 6);
    ctx.fillStyle = isNearPC ? '#38bdf8' : '#cbd5e1';
    for (let k = 0; k < 4; k++) {
      ctx.fillRect(pcX - 12 + k * 6, topY + topH - 8, 4, 2);
      ctx.fillRect(pcX - 12 + k * 6, topY + topH - 5, 4, 2);
    }
    // Precision Mouse
    ctx.fillStyle = '#64748b';
    ctx.fillRect(pcX + 17, topY + topH - 8, 4, 6);

    // Workstation Tower PC with Breathing RGB Strip (on top-right of U-table)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(topX + topW - 22, topY + 4, 14, 20);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(topX + topW - 22, topY + 4, 14, 20);
    const rgbHue = (this.state.tick * 2) % 360;
    ctx.fillStyle = \`hsl(\${rgbHue}, 90%, 60%)\`;
    ctx.fillRect(topX + topW - 20, topY + 7, 2, 14);

    // CEO Ceramic Coffee Mug
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath(); ctx.arc(topX + 16, topY + 12, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.beginPath(); ctx.arc(topX + 16, topY + 12, 2.2, 0, Math.PI * 2); ctx.fill();
    const steamY = (this.state.tick * 0.3) % 8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath(); ctx.arc(topX + 16, topY + 8 - steamY, 1.2, 0, Math.PI * 2); ctx.fill();

    ctx.restore();

    // =========================================================================
    // 🪑 4. SEATING
    // =========================================================================
    // High-Backed CEO Executive Boss Chair (Behind the top desk, facing down into U-cockpit)
    this.chair(ctx, cx, topY - 14, 0, 13);

    // Executive Wing Chairs along the Left and Right Wings
    // Left Wing Chairs (Facing Right into the U)
    this.chair(ctx, leftX - 14, leftY + S * 1.8, Math.PI / 2, 10);
    this.chair(ctx, leftX - 14, leftY + S * 3.4, Math.PI / 2, 10);

    // Right Wing Chairs (Facing Left into the U)
    this.chair(ctx, rightX + wingW + 14, rightY + S * 1.8, -Math.PI / 2, 10);
    this.chair(ctx, rightX + wingW + 14, rightY + S * 3.4, -Math.PI / 2, 10);
  }`;

const mgmtStart = code.indexOf("  // --- MANAGEMENT ROOM");
const clientStart = code.indexOf("  // --- CLIENT MANAGEMENT ROOM");

if (mgmtStart !== -1 && clientStart !== -1) {
  code = code.slice(0, mgmtStart) + uShapedManagementRoom + "\n\n" + code.slice(clientStart);
}

fs.writeFileSync('src/core/engine.ts', code, 'utf-8');
console.log('Successfully updated Management Room with big U-shaped table and PC on top!');
