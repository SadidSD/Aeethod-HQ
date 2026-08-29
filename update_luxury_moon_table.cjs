const fs = require('fs');

let code = fs.readFileSync('src/core/engine.ts', 'utf-8');

const luxuryMoonDesignRoom = `  // --- DESIGN ROOM (Luxury Half-Round Moon-Shaped White Table with Computer & Chair on Right) ---
  private drawDesignRoom(ctx: CanvasRenderingContext2D, S: number) {
    const cx = T(36);
    const cy = T(10);
    const R = S * 4.0; // 64px radius

    // 1. Subtle Architectural Floor Mat Accent
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx + 8, cy, R + 14, R + 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Luxury Half-Round Moon-Shaped Table (Convex on Left, Open/Facing Right)
    ctx.save();
    
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.arc(cx + 3, cy + 4, R, -Math.PI / 2, Math.PI / 2, true); // Outer convex arc to the left
    ctx.arc(cx + 20 + 3, cy + 4, R - 20, Math.PI / 2, -Math.PI / 2, false); // Inner concave curve
    ctx.closePath();
    ctx.fill();

    // Table Top: Pristine Calacatta White Marble / Gloss White Lacquer
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2, true); // Outer left arc
    ctx.arc(cx + 20, cy, R - 20, Math.PI / 2, -Math.PI / 2, false); // Inner right curve
    ctx.closePath();
    ctx.fill();

    // Luxury Brass / Champagne Gold Edge Trim
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner subtle concentric line for sculptural depth
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R - 6, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1, true);
    ctx.stroke();

    // Luxury Leather Desk Blotter Mat on the inner curve
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx - 2, cy, R - 14, -Math.PI / 4, Math.PI / 4, true);
    ctx.arc(cx + 18, cy, R - 24, Math.PI / 4, -Math.PI / 4, false);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. High-Tech Designer Computer (Facing the Right Side toward the Chair)
    // Monitor Stand & Base
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(cx - 14, cy - 8, 4, 16);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cx - 16, cy - 5, 2, 10);

    // Ultrawide Designer Monitor Body (Vertical profile facing East/Right)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 10, cy - 20, 5, 40);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 10, cy - 20, 5, 40);

    // Glowing Display Screen (facing right)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 5, cy - 18, 3, 36);
    // UI Screen pixels glowing towards right
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(cx - 5, cy - 14, 3, 8); // Figma card
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(cx - 5, cy - 3, 3, 10); // UI header
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(cx - 5, cy + 9, 3, 6);  // Pricing graph

    // Sleek White Minimalist Keyboard in front of monitor
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cx + 2, cy - 12, 6, 24);
    ctx.fillStyle = '#cbd5e1';
    for (let k = 0; k < 4; k++) {
      ctx.fillRect(cx + 3, cy - 10 + k * 6, 4, 2);
    }
    // Precision Mouse
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cx + 10, cy + 6, 5, 7);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(cx + 10, cy + 6, 5, 7);

    // Elegant Coffee Cup / Pantone Swatch on desk
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(cx - 4, cy - 28, 4, 8); // Pantone swatch
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(cx - 4, cy - 33, 4, 4);

    ctx.restore();

    // 4. Luxury Ergonomic Chair on the RIGHT Side (Facing Left towards Table & PC)
    // Sitting position at (cx + 30, cy) facing left (angle = -Math.PI / 2)
    this.chair(ctx, cx + 30, cy, -Math.PI / 2, 12);
  }`;

const designStart = code.indexOf("  // --- DESIGN ROOM");
const mgmtStart = code.indexOf("  // --- MANAGEMENT ROOM");

if (designStart !== -1 && mgmtStart !== -1) {
  code = code.slice(0, designStart) + luxuryMoonDesignRoom + "\n\n" + code.slice(mgmtStart);
}

fs.writeFileSync('src/core/engine.ts', code, 'utf-8');
console.log('Successfully updated Design Room to luxury half-round moon-shaped table facing right!');
