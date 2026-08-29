const fs = require('fs');

let code = fs.readFileSync('src/core/engine.ts', 'utf-8');

const luxuryDesignRoom = `  // --- DESIGN ROOM (Luxury Creative Studio & Art Director's Lounge) ---
  private drawDesignRoom(ctx: CanvasRenderingContext2D, S: number) {
    const cx = T(38.0);
    const cy = T(9.0);
    const isNearPC = Math.hypot(this.state.player.x - cx, this.state.player.y - cy) < 55;

    // =========================================================================
    // 🖼️ 1. FIGMA DESIGN SYSTEM & MOODBOARD WALL (Top Wall)
    // =========================================================================
    const mbX = T(33.5);
    const mbY = T(1.2);
    const mbW = S * 6.5;
    const mbH = 14;

    ctx.save();
    // Glass Pinboard Backing
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(mbX, mbY, mbW, mbH);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mbX, mbY, mbW, mbH);

    // Header Label
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 7px sans-serif';
    ctx.fillText('🎨 DESIGN SYSTEM & MOODBOARD', mbX + 6, mbY + 7);

    // Color Swatches on Board
    const swatches = ['#f43f5e', '#ec4899', '#f59e0b', '#06b6d4', '#8b5cf6', '#10b981'];
    for (let i = 0; i < swatches.length; i++) {
      ctx.fillStyle = swatches[i];
      ctx.fillRect(mbX + mbW - 38 + i * 6, mbY + 3, 4, 8);
    }
    // Wireframe thumbnail notes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(mbX + 6, mbY + 9, 8, 3);
    ctx.fillRect(mbX + 16, mbY + 9, 10, 3);
    ctx.fillRect(mbX + 28, mbY + 9, 8, 3);
    ctx.restore();


    // =========================================================================
    // 🌱 2. BIOPHILIC ARCHITECTURAL GREENERY
    // =========================================================================
    // Plant 1: Monstera Deliciosa (Top Left Corner)
    ctx.save();
    const p1X = T(32.4), p1Y = T(2.4);
    // Terracotta Planter Pot
    ctx.fillStyle = '#c2410c';
    ctx.beginPath(); ctx.arc(p1X, p1Y + 3, 5, 0, Math.PI * 2); ctx.fill();
    // Lush Broad Monstera Leaves
    ctx.fillStyle = '#15803d';
    ctx.beginPath(); ctx.arc(p1X - 3, p1Y - 2, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(p1X + 3, p1Y - 3, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(p1X, p1Y - 6, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath(); ctx.arc(p1X + 1, p1Y - 5, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Plant 2: Fiddle Leaf Fig (Side Wall)
    ctx.save();
    const p2X = T(41.6), p2Y = T(14.2);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath(); ctx.arc(p2X, p2Y + 2, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#166534';
    ctx.beginPath(); ctx.arc(p2X - 2, p2Y - 3, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(p2X + 2, p2Y - 2, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#15803d';
    ctx.beginPath(); ctx.arc(p2X, p2Y - 5, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();


    // =========================================================================
    // 📱 3. HARDWARE & DEVICE TESTING PEDESTAL (Right Wall)
    // =========================================================================
    const pedX = T(41.0);
    const pedY = T(6.5);
    const pedW = S * 1.0;
    const pedH = S * 3.5;

    ctx.save();
    // Minimalist White Display Podium
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(pedX + 2, pedY + 3, pedW, pedH);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(pedX, pedY, pedW, pedH);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pedX, pedY, pedW, pedH);

    // iPad Pro with Apple Pencil
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(pedX + 2, pedY + 4, 12, 16);
    ctx.fillStyle = '#06b6d4'; // Screen UI
    ctx.fillRect(pedX + 3, pedY + 5, 10, 14);
    // Apple Pencil
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(pedX + 13, pedY + 5, 1.5, 12);

    // iPhone Retina Device Mockup
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(pedX + 3, pedY + 24, 10, 16);
    ctx.fillStyle = '#ec4899'; // Screen UI
    ctx.fillRect(pedX + 4, pedY + 25, 8, 14);

    // Spatial VR Headset on Stand
    ctx.fillStyle = '#334155';
    ctx.beginPath(); ctx.roundRect(pedX + 2, pedY + 44, 12, 8, 3); ctx.fill();
    ctx.fillStyle = '#38bdf8'; // Glowing visor
    ctx.fillRect(pedX + 4, pedY + 46, 8, 3);
    ctx.restore();


    // =========================================================================
    // 🛋️ 4. CREATIVE LOUNGE CORNER (Bottom Left Area)
    // =========================================================================
    const loungeX = T(32.5);
    const loungeY = T(16.5);

    ctx.save();
    // Modern Plush L-Shaped Modular Lounge Sofa (Cream & Warm Oat)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath(); ctx.roundRect(loungeX + 2, loungeY + 3, S * 3.8, S * 2.8, 6); ctx.fill();

    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath(); ctx.roundRect(loungeX, loungeY, S * 3.8, S * 2.8, 5); ctx.fill();
    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.2; ctx.stroke();

    // Inner Corner cutout for L-sofa
    ctx.fillStyle = '#0c1015'; // Floor peek
    ctx.fillRect(loungeX + S * 1.8, loungeY, S * 2.0, S * 1.4);

    // Sofa Pillows
    ctx.fillStyle = '#d4af37';
    ctx.beginPath(); ctx.arc(loungeX + 6, loungeY + 6, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath(); ctx.arc(loungeX + S * 3.2, loungeY + S * 2.2, 3, 0, Math.PI * 2); ctx.fill();

    // Smoked Glass Coffee Table
    const tblX = loungeX + S * 1.5;
    const tblY = loungeY + S * 1.0;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.beginPath(); ctx.roundRect(tblX, tblY, 20, 14, 3); ctx.fill();
    ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 1; ctx.stroke();

    // Awwwards Trophy on Table
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.moveTo(tblX + 4, tblY + 7); ctx.lineTo(tblX + 7, tblY + 3); ctx.lineTo(tblX + 10, tblY + 7); ctx.fill();

    // Miniature Bonsai Tree on Table
    ctx.fillStyle = '#15803d';
    ctx.beginPath(); ctx.arc(tblX + 15, tblY + 6, 2.5, 0, Math.PI * 2); ctx.fill();

    // Architectural Gold Arc Floor Lamp
    const lampX = loungeX + S * 3.6;
    const lampY = loungeY - 8;
    ctx.fillStyle = '#d4af37';
    ctx.beginPath(); ctx.arc(lampX, lampY, 3, 0, Math.PI * 2); ctx.fill();
    // Warm Ambient Light Cone Glow
    ctx.fillStyle = 'rgba(251, 191, 36, 0.14)';
    ctx.beginPath(); ctx.arc(lampX, lampY, 22, 0, Math.PI * 2); ctx.fill();
    ctx.restore();


    // =========================================================================
    // ☕ 5. DESIGNER ITALIAN ESPRESSO BAR (Bottom Right Area)
    // =========================================================================
    const barX = T(39.0);
    const barY = T(17.0);
    const barW = S * 3.2;
    const barH = S * 2.2;

    ctx.save();
    // Calacatta Marble Counter Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(barX + 2, barY + 3, barW, barH);

    // Marble Counter
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX, barY, barW, barH);

    // Chrome Italian Dual-Group Espresso Machine
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(barX + 4, barY + 4, 18, 12);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX + 4, barY + 4, 18, 12);
    // Chrome pressure gauges & group heads
    ctx.fillStyle = '#d4af37';
    ctx.beginPath(); ctx.arc(barX + 8, barY + 8, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(barX + 14, barY + 8, 2, 0, Math.PI * 2); ctx.fill();
    // Animated espresso steam
    const eSteamY = (this.state.tick * 0.35) % 10;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath(); ctx.arc(barX + 11, barY + 3 - eSteamY, 1.5, 0, Math.PI * 2); ctx.fill();

    // Coffee Grinder & Syrup Bottles
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(barX + 25, barY + 4, 6, 8); // Grinder
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(barX + 34, barY + 4, 3, 7); // Vanilla syrup
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(barX + 39, barY + 4, 3, 7); // Hazelnut syrup

    // Ceramic Espresso Cups Tray
    for (let c = 0; c < 3; c++) {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.arc(barX + 8 + c * 8, barY + 24, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.beginPath(); ctx.arc(barX + 8 + c * 8, barY + 24, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();


    // =========================================================================
    // 👑 6. LUXURY WHITE L-SHAPED BOSS EXECUTIVE WORKSTATION
    // =========================================================================
    const mainX = T(36.8);
    const mainY = T(6.0);
    const mainW = S * 1.9; // 30px wide vertical main desk
    const mainH = S * 5.6; // 90px tall vertical span

    // Top horizontal return credenza
    const retX = mainX + mainW;
    const retY = T(6.0);
    const retW = S * 2.4;
    const retH = S * 1.9;

    ctx.save();

    // Soft Ambient Occlusion / Drop Shadow for White L-Desk
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.roundRect(mainX + 3, mainY + 4, mainW, mainH, 3);
    ctx.roundRect(retX + 3, retY + 4, retW, retH, 3);
    ctx.fill();

    // Pristine Solid White Marble / High-Gloss Lacquer Tabletop
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(mainX, mainY, mainW, mainH, 2);
    ctx.roundRect(retX, retY, retW, retH, 2);
    ctx.fill();

    // Subtle Marble Vein Accents for Luxury Texture
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mainX + 4, mainY + 12);
    ctx.lineTo(mainX + 18, mainY + 28);
    ctx.lineTo(mainX + 8, mainY + 44);
    ctx.moveTo(retX + 6, retY + 8);
    ctx.lineTo(retX + 22, retY + 18);
    ctx.stroke();

    // Polished Champagne Gold / Brass Perimeter Trim
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(mainX, mainY, mainW, mainH, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(retX, retY, retW, retH, 2);
    ctx.stroke();

    // Seamless Mitered Corner Junction Blend for the white tabletop
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(mainX + mainW - 2, retY + 2, 4, retH - 4);

    // Minimalist Brushed Gold Drawer Pulls on Side Credenza
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(retX + retW - 6, retY + 6, 2, 8);
    ctx.fillRect(retX + retW - 6, retY + 18, 2, 8);

    // High-End Creative Studio Computer on Pristine White Desk
    const pcX = mainX + 4;
    const pcY = mainY + S * 1.5;

    // Slim Aluminum Monitor Stands (Apple Studio Display style)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(pcX - 2, pcY + 8, 3, 10);
    ctx.fillRect(pcX - 2, pcY + 34, 3, 10);

    // Display 1 (Top Screen - Figma UI Wireframes)
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(pcX, pcY, 6, 24);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    ctx.strokeRect(pcX, pcY, 6, 24);
    // Screen glowing pixels
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(pcX + 2, pcY + 1, 3, 22);
    ctx.fillStyle = '#f59e0b'; ctx.fillRect(pcX + 2, pcY + 3, 3, 7);
    ctx.fillStyle = '#06b6d4'; ctx.fillRect(pcX + 2, pcY + 12, 3, 8);

    // Display 2 (Bottom Screen - Design Tokens & buylist stats)
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(pcX, pcY + 28, 6, 24);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    ctx.strokeRect(pcX, pcY + 28, 6, 24);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(pcX + 2, pcY + 29, 3, 22);
    ctx.fillStyle = '#ec4899'; ctx.fillRect(pcX + 2, pcY + 31, 3, 7);
    ctx.fillStyle = '#a855f7'; ctx.fillRect(pcX + 2, pcY + 40, 3, 9);

    // Architectural Warm Lightbar Glow behind displays
    ctx.fillStyle = 'rgba(251, 191, 36, 0.18)';
    ctx.beginPath();
    ctx.ellipse(pcX + 12, pcY + 26, 16, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Minimalist White Magic Keyboard
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(pcX + 10, pcY + 10, 6, 28);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(pcX + 10, pcY + 10, 6, 28);
    ctx.fillStyle = isNearPC ? '#38bdf8' : '#cbd5e1';
    for (let k = 0; k < 5; k++) {
      ctx.fillRect(pcX + 11, pcY + 12 + k * 5, 4, 2.5);
    }
    // Magic Trackpad & Mouse
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(pcX + 11, pcY + 41, 6, 8);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(pcX + 11, pcY + 41, 6, 8);

    // Pantone Color Chip Fan on Credenza
    const pSwatches = ['#f43f5e', '#f59e0b', '#06b6d4', '#a855f7'];
    for (let s = 0; s < 4; s++) {
      ctx.fillStyle = pSwatches[s];
      ctx.fillRect(retX + 6 + s * 3.5, retY + 6, 6, 3);
    }

    // Ceramic Coffee Mug with animated steam
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath(); ctx.arc(retX + retW - 14, retY + 14, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.beginPath(); ctx.arc(retX + retW - 14, retY + 14, 2.2, 0, Math.PI * 2); ctx.fill();
    const steamY = (this.state.tick * 0.3) % 8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath(); ctx.arc(retX + retW - 14, retY + 10 - steamY, 1.2, 0, Math.PI * 2); ctx.fill();

    // Stylus Dock & Digital Pen
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(mainX + 4, mainY + mainH - 12, 3, 8);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(mainX + 4, mainY + mainH - 16, 1.5, 6);

    ctx.restore();

    // 🪑 Custom White & Gold Luxury Master Designer Gaming Throne
    this.drawThemedGamingChair(ctx, mainX + mainW + 14, mainY + mainH / 2, -Math.PI / 2, 'white_gold');

    // Luxury Visitor Armchairs on the LEFT Side (Facing Right towards Boss Desk)
    this.chair(ctx, mainX - 16, mainY + S * 1.2, Math.PI / 2, 10);
    this.chair(ctx, mainX - 16, mainY + mainH - S * 1.2, Math.PI / 2, 10);
  }`;

const designStart = code.indexOf("  // --- DESIGN ROOM");
const mgmtStart = code.indexOf("  // --- MANAGEMENT ROOM");

if (designStart !== -1 && mgmtStart !== -1) {
  code = code.slice(0, designStart) + luxuryDesignRoom + "\n\n" + code.slice(mgmtStart);
}

fs.writeFileSync('src/core/engine.ts', code, 'utf-8');
console.log('Successfully decorated Design Room with luxury studio moodboard, lounge, espresso bar, and devices!');
