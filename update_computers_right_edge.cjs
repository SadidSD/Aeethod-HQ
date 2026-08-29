const fs = require('fs');

let code = fs.readFileSync('src/core/engine.ts', 'utf-8');

// 1. Update interaction triggers in getNearestInteraction
code = code.replace(
  "check('dev_pc_kitty', T(5.2), T(6.3), 55, '🌸 [E] Dev Station (Hello Kitty)');",
  "check('dev_pc_kitty', T(6.5), T(6.3), 55, '🌸 [E] Dev Station (Hello Kitty)');"
);
code = code.replace(
  "check('dev_pc_spidey', T(5.2), T(15.1), 55, '🕷️ [E] Dev Station (Spider-Man)');",
  "check('dev_pc_spidey', T(6.5), T(15.1), 55, '🕷️ [E] Dev Station (Spider-Man)');"
);

// 2. Update interaction triggers in handleClick
code = code.replace(
  "if (checkClick(T(5.2), T(6.3), 60, () => this.onOpenMember?.('frontend'))) return;",
  "if (checkClick(T(6.5), T(6.3), 60, () => this.onOpenMember?.('frontend'))) return;"
);
code = code.replace(
  "if (checkClick(T(5.2), T(15.1), 60, () => this.onOpenMember?.('frontend'))) return;",
  "if (checkClick(T(6.5), T(15.1), 60, () => this.onOpenMember?.('frontend'))) return;"
);

// 3. Replace drawDevRoom with computers on the right edge of both tables
const devRoomComputersRightEdge = `  // --- DEVELOPMENT ROOM (Themed L-Shaped Desks: Computers on Right Edge of Tables) ---
  private drawDevRoom(ctx: CanvasRenderingContext2D, S: number) {
    const isNearKitty = Math.hypot(this.state.player.x - T(6.5), this.state.player.y - T(6.3)) < 55;
    const isNearSpidey = Math.hypot(this.state.player.x - T(6.5), this.state.player.y - T(15.1)) < 55;

    // =========================================================================
    // 🌸 1. TOP WORKSTATION: PINK HELLO KITTY THEMED L-DESK
    // =========================================================================
    const kMainX = T(5.8);
    const kMainY = T(3.6);
    const kMainW = S * 1.9; // 30px wide vertical desk
    const kMainH = S * 5.2; // 83px tall vertical span

    const kRetX = T(3.5); // Left horizontal return credenza
    const kRetY = T(3.6);
    const kRetW = S * 2.3;
    const kRetH = S * 1.9;

    ctx.save();

    // Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.roundRect(kMainX + 3, kMainY + 4, kMainW, kMainH, 3);
    ctx.roundRect(kRetX + 3, kRetY + 4, kRetW, kRetH, 3);
    ctx.fill();

    // Pastel Baby Pink Lacquer Tabletop
    ctx.fillStyle = '#fdf2f8';
    ctx.beginPath();
    ctx.roundRect(kMainX, kMainY, kMainW, kMainH, 2);
    ctx.roundRect(kRetX, kRetY, kRetW, kRetH, 2);
    ctx.fill();

    // Cute Rose-Gold / Hot-Pink Metallic Trim
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(kMainX, kMainY, kMainW, kMainH, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(kRetX, kRetY, kRetW, kRetH, 2);
    ctx.stroke();

    // Seamless junction blend
    ctx.fillStyle = '#fdf2f8';
    ctx.fillRect(kRetX + kRetW - 2, kRetY + 2, 4, kRetH - 4);

    // Cute Hello Kitty bow inlays on credenza
    ctx.fillStyle = '#f472b6';
    ctx.beginPath(); ctx.arc(kRetX + 8, kRetY + 14, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(kRetX + 16, kRetY + 14, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fb7185';
    ctx.beginPath(); ctx.arc(kRetX + 12, kRetY + 14, 2, 0, Math.PI * 2); ctx.fill();

    // --- Hello Kitty Dual Monitors on RIGHT EDGE of Table (Facing LEFT toward Chair) ---
    const kPcX = kMainX + kMainW - 7; // Flush along the right edge of desk
    const kPcY = kMainY + S * 1.3;

    // Pastel Pink Monitor Stands on the right edge
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(kPcX + 4, kPcY + 6, 2, 10);
    ctx.fillRect(kPcX + 4, kPcY + 30, 2, 10);

    // Display 1 (Top Screen - Next.js / React with Kitty Pink syntax facing Left)
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(kPcX, kPcY, 5, 22);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1;
    ctx.strokeRect(kPcX, kPcY, 5, 22);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(kPcX + 1, kPcY + 1, 3, 20);
    ctx.fillStyle = '#f472b6'; ctx.fillRect(kPcX + 1, kPcY + 3, 3, 6);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(kPcX + 1, kPcY + 11, 3, 7);

    // Display 2 (Bottom Screen - CSS Tokens & Kitty Bow Preview facing Left)
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(kPcX, kPcY + 24, 5, 22);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1;
    ctx.strokeRect(kPcX, kPcY + 24, 5, 22);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(kPcX + 1, kPcY + 25, 3, 20);
    ctx.fillStyle = '#fb7185'; ctx.fillRect(kPcX + 1, kPcY + 27, 3, 6);
    ctx.fillStyle = '#c084fc'; ctx.fillRect(kPcX + 1, kPcY + 35, 3, 7);

    // Warm Pink Backlight Glow (illuminating Left toward Developer)
    ctx.fillStyle = 'rgba(244, 114, 182, 0.22)';
    ctx.beginPath();
    ctx.ellipse(kPcX - 8, kPcY + 23, 16, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pink Mechanical Keyboard on Desk in front of monitors
    ctx.fillStyle = '#fce7f3';
    ctx.fillRect(kPcX - 12, kPcY + 8, 6, 26);
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(kPcX - 12, kPcY + 8, 6, 26);
    ctx.fillStyle = isNearKitty ? '#ec4899' : '#ffffff';
    for (let k = 0; k < 5; k++) {
      ctx.fillRect(kPcX - 11, kPcY + 10 + k * 5, 4, 2.5);
    }
    // Precision Mouse
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(kPcX - 11, kPcY + 37, 5, 6);

    // Hello Kitty Figurine on Credenza
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(kRetX + 10, kRetY + 10, 4, 0, Math.PI * 2); ctx.fill(); // Head
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(kRetX + 12, kRetY + 7, 3, 2); // Bow

    // Cute Pink Mug with animated steam
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath(); ctx.arc(kRetX + 22, kRetY + 14, 3, 0, Math.PI * 2); ctx.fill();
    const kSteamY = (this.state.tick * 0.3) % 8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath(); ctx.arc(kRetX + 22, kRetY + 10 - kSteamY, 1.2, 0, Math.PI * 2); ctx.fill();

    ctx.restore();

    // 🪑 Hello Kitty Gaming Chair on the LEFT Side (Facing Right toward Desk & Monitors)
    this.chair(ctx, kMainX - 16, kMainY + kMainH / 2, Math.PI / 2, 12);


    // =========================================================================
    // 🕷️ 2. BOTTOM WORKSTATION: RED SPIDER-MAN THEMED L-DESK
    // =========================================================================
    const sMainX = T(5.8);
    const sMainY = T(12.6);
    const sMainW = S * 1.9; // 30px wide vertical desk
    const sMainH = S * 5.2; // 83px tall vertical span

    const sRetX = T(3.5); // Left horizontal return credenza
    const sRetY = T(12.6);
    const sRetW = S * 2.3;
    const sRetH = S * 1.9;

    ctx.save();

    // Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.roundRect(sMainX + 3, sMainY + 4, sMainW, sMainH, 3);
    ctx.roundRect(sRetX + 3, sRetY + 4, sRetW, sRetH, 3);
    ctx.fill();

    // Spider-Man Crimson Red Lacquer Tabletop
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(sMainX, sMainY, sMainW, sMainH, 2);
    ctx.roundRect(sRetX, sRetY, sRetW, sRetH, 2);
    ctx.fill();

    // Subtle Spider Web Pattern Lines on Table
    ctx.strokeStyle = 'rgba(30, 58, 138, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sMainX + 2, sMainY + 10);
    ctx.lineTo(sMainX + sMainW - 2, sMainY + 22);
    ctx.lineTo(sMainX + 2, sMainY + 34);
    ctx.moveTo(sRetX + 4, sRetY + 6);
    ctx.lineTo(sRetX + sRetW - 6, sRetY + 20);
    ctx.stroke();

    // Metallic Midnight-Blue & Spider-Gold Perimeter Trim
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(sMainX, sMainY, sMainW, sMainH, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(sRetX, sRetY, sRetW, sRetH, 2);
    ctx.stroke();

    // Gold spider accent corner
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(sMainX + 1, sMainY + 1, sMainW - 2, 4);

    // Seamless junction blend
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(sRetX + sRetW - 2, sRetY + 2, 4, sRetH - 4);

    // --- Spider-Man Dual Monitors on RIGHT EDGE of Table (Facing LEFT toward Chair) ---
    const sPcX = sMainX + sMainW - 7; // Flush along the right edge of desk
    const sPcY = sMainY + S * 1.3;

    // Red & Blue Monitor Stands on right edge
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(sPcX + 4, sPcY + 6, 2, 10);
    ctx.fillRect(sPcX + 4, sPcY + 30, 2, 10);

    // Display 1 (Top Screen - Backend PostgreSQL / Buylist Engine facing Left)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(sPcX, sPcY, 5, 22);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.strokeRect(sPcX, sPcY, 5, 22);
    ctx.fillStyle = '#020617';
    ctx.fillRect(sPcX + 1, sPcY + 1, 3, 20);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(sPcX + 1, sPcY + 3, 3, 6);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(sPcX + 1, sPcY + 11, 3, 7);

    // Display 2 (Bottom Screen - Spider-Sense Telemetry Waveform facing Left)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(sPcX, sPcY + 24, 5, 22);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(sPcX, sPcY + 24, 5, 22);
    ctx.fillStyle = '#020617';
    ctx.fillRect(sPcX + 1, sPcY + 25, 3, 20);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(sPcX + 1, sPcY + 27, 3, 6);
    ctx.fillStyle = '#fbbf24'; ctx.fillRect(sPcX + 1, sPcY + 35, 3, 7);

    // Spider-Sense Red/Cyan RGB Glow (illuminating Left toward Developer)
    ctx.fillStyle = 'rgba(220, 38, 38, 0.25)';
    ctx.beginPath();
    ctx.ellipse(sPcX - 8, sPcY + 23, 16, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red Mechanical Keyboard on Desk in front of monitors
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(sPcX - 12, sPcY + 8, 6, 26);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(sPcX - 12, sPcY + 8, 6, 26);
    ctx.fillStyle = isNearSpidey ? '#38bdf8' : '#f87171';
    for (let k = 0; k < 5; k++) {
      ctx.fillRect(sPcX - 11, sPcY + 10 + k * 5, 4, 2.5);
    }
    // Web-Shooter Mouse
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(sPcX - 11, sPcY + 37, 5, 6);

    // Spider-Man Figurine on Credenza
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(sRetX + 10, sRetY + 10, 4, 0, Math.PI * 2); ctx.fill(); // Head
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sRetX + 9, sRetY + 9, 2, 2); // Spider eyes
    ctx.fillRect(sRetX + 12, sRetY + 9, 2, 2);

    // Spider-Man Mug with animated steam
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath(); ctx.arc(sRetX + 22, sRetY + 14, 3, 0, Math.PI * 2); ctx.fill();
    const sSteamY = (this.state.tick * 0.3 + 4) % 8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath(); ctx.arc(sRetX + 22, sRetY + 10 - sSteamY, 1.2, 0, Math.PI * 2); ctx.fill();

    ctx.restore();

    // 🪑 Spider-Man Racing Chair on the LEFT Side (Facing Right toward Desk & Monitors)
    this.chair(ctx, sMainX - 16, sMainY + sMainH / 2, Math.PI / 2, 12);

    // Top Wall Architecture Whiteboard
    this.whiteboard(ctx, T(5), T(1.2), S * 5, 14, '</> CODE ARCHITECTURE');
  }`;

const devStart = code.indexOf("  // --- DEVELOPMENT ROOM");
const designStart = code.indexOf("  // --- DESIGN ROOM");

if (devStart !== -1 && designStart !== -1) {
  code = code.slice(0, devStart) + devRoomComputersRightEdge + "\n\n" + code.slice(designStart);
}

fs.writeFileSync('src/core/engine.ts', code, 'utf-8');
console.log('Successfully moved computers to the right edge of both Dev Room tables!');
