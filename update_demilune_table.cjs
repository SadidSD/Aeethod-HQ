const fs = require('fs');

let code = fs.readFileSync('src/core/engine.ts', 'utf-8');

const demiluneDesignRoom = `  // --- DESIGN ROOM (Luxury Demilune Half-Moon Shaped White Table with Computer & Chair on Right) ---
  private drawDesignRoom(ctx: CanvasRenderingContext2D, S: number) {
    const cx = T(35.5);
    const cy = T(10);
    const R = S * 3.6; // ~58px radius
    const flatX = cx + 8; // Right straight flat working edge

    // 1. Subtle Elegant Floor Mat Accent Under Table
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy, R + 14, R + 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Solid Luxury Half-Moon / Demilune Table (D-Shaped Solid Tabletop)
    ctx.save();
    
    // Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.arc(flatX + 3, cy + 4, R, -Math.PI / 2, Math.PI / 2, true); // Left semi-circular curved arc
    ctx.lineTo(flatX + 3, cy - R + 4); // Right straight vertical edge
    ctx.closePath();
    ctx.fill();

    // Solid Tabletop: Pristine Matte White / Calacatta Lacquer
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(flatX, cy, R, -Math.PI / 2, Math.PI / 2, true);
    ctx.lineTo(flatX, cy - R);
    ctx.closePath();
    ctx.fill();

    // Luxury Brass / Champagne Gold Edge Trim
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner subtle concentric metallic inlay
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(flatX, cy, R - 6, -Math.PI / 2 + 0.15, Math.PI / 2 - 0.15, true);
    ctx.lineTo(flatX - 6, cy - R + 6);
    ctx.stroke();

    // Luxury Leather Desk Blotter Mat on working area
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(flatX - 22, cy - 20, 18, 40, 4);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. High-Tech Designer Computer (On Tabletop, Screen Facing Right toward Chair)
    const pcX = flatX - 28;
    const pcY = cy;

    // Monitor Stand & Base
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(pcX - 4, pcY - 8, 4, 16);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(pcX - 6, pcY - 5, 2, 10);

    // Ultrawide Designer Monitor (Profile facing Right)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(pcX, pcY - 18, 4, 36);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    ctx.strokeRect(pcX, pcY - 18, 4, 36);

    // Glowing Display Screen (facing right)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(pcX + 4, pcY - 16, 2, 32);
    // UI Screen pixels glowing towards right
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(pcX + 4, pcY - 12, 2, 8); // Figma card
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(pcX + 4, pcY - 2, 2, 10); // UI header
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(pcX + 4, pcY + 9, 2, 5);  // Pricing graph

    // Minimalist White Keyboard on Leather Blotter
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(flatX - 18, pcY - 10, 6, 20);
    ctx.fillStyle = '#cbd5e1';
    for (let k = 0; k < 4; k++) {
      ctx.fillRect(flatX - 17, pcY - 8 + k * 5, 4, 2);
    }
    // Precision Mouse
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(flatX - 10, pcY + 6, 5, 7);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(flatX - 10, pcY + 6, 5, 7);

    // Pantone Color Chips on Table
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(flatX - 32, cy - 24, 6, 6);
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(flatX - 32, cy - 16, 6, 6);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(flatX - 32, cy + 18, 6, 6);

    ctx.restore();

    // 4. Luxury Ergonomic Chair on the RIGHT Side (Facing Left towards Table & PC)
    this.chair(ctx, flatX + 18, cy, -Math.PI / 2, 12);
  }`;

const designStart = code.indexOf("  // --- DESIGN ROOM");
const mgmtStart = code.indexOf("  // --- MANAGEMENT ROOM");

if (designStart !== -1 && mgmtStart !== -1) {
  code = code.slice(0, designStart) + demiluneDesignRoom + "\n\n" + code.slice(mgmtStart);
}

fs.writeFileSync('src/core/engine.ts', code, 'utf-8');
console.log('Successfully updated Design Room to solid half-moon (demilune) white luxury table!');
