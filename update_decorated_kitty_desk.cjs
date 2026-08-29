const fs = require('fs');

let code = fs.readFileSync('src/core/engine.ts', 'utf-8');

const decoratedKittyDevRoom = `  // --- DEVELOPMENT ROOM (Enriched Hello Kitty Themed Battlestation & Spider-Man Desk) ---
  private drawDevRoom(ctx: CanvasRenderingContext2D, S: number) {
    const isNearKitty = Math.hypot(this.state.player.x - T(6.5), this.state.player.y - T(6.3)) < 55;
    const isNearSpidey = Math.hypot(this.state.player.x - T(6.5), this.state.player.y - T(15.1)) < 55;

    // =========================================================================
    // 🌸 1. TOP WORKSTATION: ENRICHED PINK HELLO KITTY THEMED L-DESK
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

    // Soft Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.roundRect(kMainX + 3, kMainY + 4, kMainW, kMainH, 3);
    ctx.roundRect(kRetX + 3, kRetY + 4, kRetW, kRetH, 3);
    ctx.fill();

    // Pastel Baby Pink Gloss Lacquer Tabletop
    ctx.fillStyle = '#fdf2f8';
    ctx.beginPath();
    ctx.roundRect(kMainX, kMainY, kMainW, kMainH, 2);
    ctx.roundRect(kRetX, kRetY, kRetW, kRetH, 2);
    ctx.fill();

    // Rose-Gold & Hot-Pink Metallic Perimeter Trim
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

    // --- Hello Kitty Table Inlays & Art ---
    // Inlaid Hello Kitty Face Silhouette on Desk Surface
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(kMainX + 15, kMainY + 65, 8, 0, Math.PI * 2); // Kitty head outline
    ctx.stroke();
    // Kitty ears outline
    ctx.beginPath();
    ctx.moveTo(kMainX + 9, kMainY + 60); ctx.lineTo(kMainX + 7, kMainY + 54); ctx.lineTo(kMainX + 13, kMainY + 57);
    ctx.moveTo(kMainX + 17, kMainY + 57); ctx.lineTo(kMainX + 23, kMainY + 54); ctx.lineTo(kMainX + 21, kMainY + 60);
    ctx.stroke();
    // Red bow inlay
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath(); ctx.arc(kMainX + 19, kMainY + 57, 2.5, 0, Math.PI * 2); ctx.fill();

    // Cute pastel stars and hearts on credenza
    ctx.fillStyle = '#f472b6';
    ctx.beginPath(); ctx.arc(kRetX + 8, kRetY + 14, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(kRetX + 14, kRetY + 14, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fb7185';
    ctx.beginPath(); ctx.arc(kRetX + 11, kRetY + 14, 1.8, 0, Math.PI * 2); ctx.fill();

    // --- Hello Kitty Dual Monitors with Cat-Ear Hoods (Right Edge, Facing Left) ---
    const kPcX = kMainX + kMainW - 7;
    const kPcY = kMainY + S * 1.3;

    // Cat-Ear Hoods on top of monitors
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.moveTo(kPcX + 1, kPcY - 1); ctx.lineTo(kPcX + 3, kPcY - 4); ctx.lineTo(kPcX + 5, kPcY - 1);
    ctx.moveTo(kPcX + 1, kPcY + 45); ctx.lineTo(kPcX + 3, kPcY + 48); ctx.lineTo(kPcX + 5, kPcY + 45);
    ctx.fill();

    // Display 1 (Top Screen - Next.js / React with Kitty Pink syntax)
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(kPcX, kPcY, 5, 22);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1;
    ctx.strokeRect(kPcX, kPcY, 5, 22);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(kPcX + 1, kPcY + 1, 3, 20);
    ctx.fillStyle = '#f472b6'; ctx.fillRect(kPcX + 1, kPcY + 3, 3, 6);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(kPcX + 1, kPcY + 11, 3, 7);

    // Display 2 (Bottom Screen - CSS Tokens & Kitty Bow Preview)
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
    ctx.fillStyle = 'rgba(244, 114, 182, 0.25)';
    ctx.beginPath();
    ctx.ellipse(kPcX - 8, kPcY + 23, 16, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Giant Hello Kitty Face Shaped Pastel Mousepad
    ctx.fillStyle = '#fce7f3';
    ctx.beginPath();
    ctx.roundRect(kPcX - 16, kPcY + 6, 12, 36, 4);
    ctx.fill();
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Pink Pudding Mechanical Keyboard with White Keycaps
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(kPcX - 14, kPcY + 8, 6, 24);
    ctx.fillStyle = isNearKitty ? '#ec4899' : '#ffffff';
    for (let k = 0; k < 5; k++) {
      ctx.fillRect(kPcX - 13, kPcY + 10 + k * 4.5, 4, 2.2);
    }
    // Precision Pastel Pink Mouse
    ctx.fillStyle = '#fb7185';
    ctx.fillRect(kPcX - 13, kPcY + 34, 5, 6);

    // --- Hello Kitty Collectibles & Desk Accessories ---
    // 1. Hello Kitty 3D Figurine on Credenza
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(kRetX + 8, kRetY + 9, 4, 0, Math.PI * 2); ctx.fill(); // Head
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(kRetX + 10, kRetY + 6, 3, 2.5); // Bright Red Bow
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(kRetX + 7, kRetY + 9, 1.5, 1); // Yellow Nose

    // 2. Strawberry Milk Carton with Red Straw
    ctx.fillStyle = '#fce7f3';
    ctx.fillRect(kRetX + 18, kRetY + 6, 5, 7);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(kRetX + 18, kRetY + 6, 5, 2); // Strawb label
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(kRetX + 20, kRetY + 6); ctx.lineTo(kRetX + 22, kRetY + 3); ctx.stroke(); // Straw

    // 3. Cute Pink Mug with animated Heart Steam
    ctx.fillStyle = '#f472b6';
    ctx.beginPath(); ctx.arc(kRetX + 28, kRetY + 12, 3.5, 0, Math.PI * 2); ctx.fill();
    const kSteamY = (this.state.tick * 0.3) % 8;
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath(); ctx.arc(kRetX + 28, kRetY + 8 - kSteamY, 1.2, 0, Math.PI * 2); ctx.fill(); // Heart bubble

    // 4. Custom Hello Kitty PC Tower on Credenza with Pink RGB Fan
    ctx.fillStyle = '#fdf2f8';
    ctx.fillRect(kRetX + 34, kRetY + 5, 14, 18);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1;
    ctx.strokeRect(kRetX + 34, kRetY + 5, 14, 18);
    // Glowing pink heart RGB fan
    ctx.fillStyle = '#ec4899';
    ctx.beginPath(); ctx.arc(kRetX + 41, kRetY + 14, 3, 0, Math.PI * 2); ctx.fill();

    ctx.restore();

    // 🪑 Hello Kitty Gaming Chair on LEFT Side with Cat Ears & Red Bow
    this.chair(ctx, kMainX - 16, kMainY + kMainH / 2, Math.PI / 2, 12);
    // Cat ears on chair headrest
    ctx.save();
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(kMainX - 22, kMainY + kMainH / 2 - 8, 2, 0, Math.PI * 2); ctx.fill();
    ctx.arc(kMainX - 22, kMainY + kMainH / 2 + 8, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(kMainX - 24, kMainY + kMainH / 2 - 2, 3, 4); // Bow
    ctx.restore();


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
    const sPcX = sMainX + sMainW - 7;
    const sPcY = sMainY + S * 1.3;

    // Red & Blue Monitor Stands
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
  code = code.slice(0, devStart) + decoratedKittyDevRoom + "\n\n" + code.slice(designStart);
}

fs.writeFileSync('src/core/engine.ts', code, 'utf-8');
console.log('Successfully decorated Pink Hello Kitty desk with rich Sanrio themed elements!');
