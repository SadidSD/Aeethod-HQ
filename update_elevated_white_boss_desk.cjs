const fs = require('fs');

let code = fs.readFileSync('src/core/engine.ts', 'utf-8');

const elevatedWhiteBossDesk = `  // --- DESIGN ROOM (Luxury All-White Architectural L-Shaped Boss Desk & Studio PC) ---
  private drawDesignRoom(ctx: CanvasRenderingContext2D, S: number) {
    const cx = T(38.0);
    const cy = T(9.0);
    const isNearPC = Math.hypot(this.state.player.x - cx, this.state.player.y - cy) < 55;

    // 1. Luxury White L-Shaped Boss Desk Geometry
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

    // 2. High-End Creative Studio Computer on Pristine White Desk (Screens facing Right toward Boss)
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

    // Minimalist White Magic Keyboard (Directly on white marble desk)
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

    // Designer Accessories on Clean Desk
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

    // 3. High-Backed Executive Boss Chair in Creamy White Leather (Inside Cockpit on the RIGHT, Facing Left)
    this.chair(ctx, mainX + mainW + 14, mainY + mainH / 2, -Math.PI / 2, 13);

    // 4. Luxury Visitor Armchairs on the LEFT Side (Facing Right towards Boss Desk)
    this.chair(ctx, mainX - 16, mainY + S * 1.2, Math.PI / 2, 10);
    this.chair(ctx, mainX - 16, mainY + mainH - S * 1.2, Math.PI / 2, 10);
  }`;

const designStart = code.indexOf("  // --- DESIGN ROOM");
const mgmtStart = code.indexOf("  // --- MANAGEMENT ROOM");

if (designStart !== -1 && mgmtStart !== -1) {
  code = code.slice(0, designStart) + elevatedWhiteBossDesk + "\n\n" + code.slice(mgmtStart);
}

fs.writeFileSync('src/core/engine.ts', code, 'utf-8');
console.log('Successfully elevated white boss desk: removed black blotter and added studio computer & luxury details!');
