const fs = require('fs');

let code = fs.readFileSync('src/core/engine.ts', 'utf-8');

// 1. Update keydown 'e' check for Designer PC
code = code.replace(
  "if (Math.hypot(px - T(36.5), py - T(6)) < 90) { this.onOpenDesignerPC?.(); return; }",
  "if (Math.hypot(px - T(36.5), py - T(10)) < 95) { this.onOpenDesignerPC?.(); return; }"
);

// 2. Update handleClick check for Designer PC
code = code.replace(
  "if (checkClick(T(36.5), T(6), 130, () => this.onOpenDesignerPC?.())) return;",
  "if (checkClick(T(36.5), T(10), 130, () => this.onOpenDesignerPC?.())) return;"
);

// 3. Update drawDoorPrompts check for Designer PC
code = code.replace(
  "check(T(36.5), T(6), 90, '🎨 [E] Open Designer Terminal');",
  "check(T(36.5), T(10), 95, '🎨 [E] Open Designer Terminal');"
);

// 4. Replace drawDesignRoom with clean white round table + computer + chair
const cleanDesignRoom = `  // --- DESIGN ROOM (Minimalist: Big Round-Shaped White Table with Computer & Chair) ---
  private drawDesignRoom(ctx: CanvasRenderingContext2D, S: number) {
    const cx = T(36.5);
    const cy = T(10);
    const tableRadius = S * 3.5; // Big round table

    // 1. Subtle Floor Accent Under Table
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.beginPath();
    ctx.arc(cx, cy, tableRadius + 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Big Round-Shaped White Table
    ctx.save();
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.arc(cx + 2, cy + 4, tableRadius, 0, Math.PI * 2);
    ctx.fill();

    // Pristine Matte White Table Surface
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, tableRadius, 0, Math.PI * 2);
    ctx.fill();

    // Subtle Metallic Chamfer Edge
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner subtle concentric ring
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, tableRadius - 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 3. High-Tech Designer Computer on White Table (upper-center)
    const pcX = cx;
    const pcY = cy - 10;

    // Monitor Base & Stand
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(pcX - 8, pcY + 8, 16, 3);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(pcX - 2, pcY + 4, 4, 6);

    // Monitor Bezel & Frame (Sleek Silver / Apple Studio Display Style)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(pcX - 22, pcY - 14, 44, 22);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pcX - 22, pcY - 14, 44, 22);

    // Glowing Display Screen (Figma UI Canvas & Color Palette)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(pcX - 20, pcY - 12, 40, 18);
    // Figma Wireframe Mockup UI on Screen
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(pcX - 17, pcY - 9, 14, 12); // Card layout
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(pcX - 1, pcY - 9, 18, 4);  // Header
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(pcX - 1, pcY - 3, 18, 5);  // Pricing graph

    // Minimalist White Keyboard & Mouse
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(pcX - 14, pcY + 16, 28, 8);
    ctx.fillStyle = '#cbd5e1';
    for (let k = 0; k < 4; k++) {
      ctx.fillRect(pcX - 12 + k * 6, pcY + 18, 4, 2);
      ctx.fillRect(pcX - 12 + k * 6, pcY + 21, 4, 2);
    }
    // Precision Magic Mouse
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(pcX + 18, pcY + 17, 6, 8);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(pcX + 18, pcY + 17, 6, 8);

    // 4. Ergonomic Chair (In front of Table facing the Computer)
    this.chair(ctx, cx, cy + tableRadius + 8, 0, 12);
  }`;

const designStart = code.indexOf("  // --- DESIGN ROOM");
const mgmtStart = code.indexOf("  // --- MANAGEMENT ROOM");

if (designStart !== -1 && mgmtStart !== -1) {
  code = code.slice(0, designStart) + cleanDesignRoom + "\n\n" + code.slice(mgmtStart);
}

fs.writeFileSync('src/core/engine.ts', code, 'utf-8');
console.log('Successfully updated Design Room to big round white table + computer + chair!');
