const fs = require('fs');

let code = fs.readFileSync('src/core/engine.ts', 'utf-8');

const decoratedSpiderManDesk = `    // =========================================================================
    // 🕷️ 2. BOTTOM WORKSTATION: ENRICHED RED SPIDER-MAN THEMED L-DESK
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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
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

    // --- Spider Web Pattern & Giant Spider Emblem Inlay on Table ---
    // Radial Web Grid Lines
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sMainX + 2, sMainY + 10); ctx.lineTo(sMainX + sMainW - 2, sMainY + 22);
    ctx.moveTo(sMainX + 2, sMainY + 34); ctx.lineTo(sMainX + sMainW - 2, sMainY + 46);
    ctx.moveTo(sMainX + 2, sMainY + 58); ctx.lineTo(sMainX + sMainW - 2, sMainY + 70);
    ctx.moveTo(sRetX + 4, sRetY + 6); ctx.lineTo(sRetX + sRetW - 6, sRetY + 24);
    ctx.stroke();

    // Giant Black Spider Emblem on Table Surface
    ctx.fillStyle = '#0f172a';
    const embX = sMainX + 15, embY = sMainY + 65;
    ctx.beginPath(); ctx.ellipse(embX, embY, 4, 6, 0, 0, Math.PI * 2); ctx.fill(); // Spider body
    ctx.beginPath(); ctx.arc(embX, embY - 6, 2.5, 0, Math.PI * 2); ctx.fill(); // Spider head
    // 8 Spider legs
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(embX - 2, embY - 2); ctx.lineTo(embX - 8, embY - 6); ctx.lineTo(embX - 10, embY - 2);
    ctx.moveTo(embX + 2, embY - 2); ctx.lineTo(embX + 8, embY - 6); ctx.lineTo(embX + 10, embY - 2);
    ctx.moveTo(embX - 2, embY + 2); ctx.lineTo(embX - 8, embY + 6); ctx.lineTo(embX - 10, embY + 2);
    ctx.moveTo(embX + 2, embY + 2); ctx.lineTo(embX + 8, embY + 6); ctx.lineTo(embX + 10, embY + 2);
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

    // Gold Spider-Armor Accent Inlays
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(sMainX + 1, sMainY + 1, sMainW - 2, 4);

    // Seamless junction blend
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(sRetX + sRetW - 2, sRetY + 2, 4, sRetH - 4);

    // --- Spider-Man Dual Monitors with Spider-Eye HUD Bezels (Right Edge, Facing Left) ---
    const sPcX = sMainX + sMainW - 7;
    const sPcY = sMainY + S * 1.3;

    // White Angular Spider-Eye Bezels on top of monitors
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(sPcX + 1, sPcY - 1); ctx.lineTo(sPcX + 5, sPcY - 4); ctx.lineTo(sPcX + 4, sPcY - 1);
    ctx.moveTo(sPcX + 1, sPcY + 45); ctx.lineTo(sPcX + 5, sPcY + 48); ctx.lineTo(sPcX + 4, sPcY + 45);
    ctx.fill();

    // Display 1 (Top Screen - Backend PostgreSQL / Buylist Engine in Red & Cyan)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(sPcX, sPcY, 5, 22);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.strokeRect(sPcX, sPcY, 5, 22);
    ctx.fillStyle = '#020617';
    ctx.fillRect(sPcX + 1, sPcY + 1, 3, 20);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(sPcX + 1, sPcY + 3, 3, 6);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(sPcX + 1, sPcY + 11, 3, 7);

    // Display 2 (Bottom Screen - Spider-Sense Telemetry Waveform)
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
    ctx.fillStyle = 'rgba(220, 38, 38, 0.28)';
    ctx.beginPath();
    ctx.ellipse(sPcX - 8, sPcY + 23, 16, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spider-Man Midnight-Blue Web Desk Mat
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(sPcX - 16, sPcY + 6, 12, 36, 4);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Red Mechanical Keyboard with Black Keycaps & Cyan Glow
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(sPcX - 14, sPcY + 8, 6, 24);
    ctx.fillStyle = isNearSpidey ? '#38bdf8' : '#f87171';
    for (let k = 0; k < 5; k++) {
      ctx.fillRect(sPcX - 13, sPcY + 10 + k * 4.5, 4, 2.2);
    }
    // Web-Shooter Precision Gaming Mouse
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(sPcX - 13, sPcY + 34, 5, 6);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(sPcX - 12, sPcY + 35, 2, 2); // Cyan DPI button

    // --- Spider-Man Collectibles & Desk Accessories ---
    // 1. Spider-Man Hero 3D Figurine on Credenza
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(sRetX + 8, sRetY + 9, 4, 0, Math.PI * 2); ctx.fill(); // Head
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sRetX + 7, sRetY + 8, 2, 2); // White Spider eye
    ctx.fillRect(sRetX + 10, sRetY + 8, 2, 2);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(sRetX + 7, sRetY + 13, 5, 5); // Blue hero suit body

    // 2. Peter Parker's DSLR Camera
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(sRetX + 18, sRetY + 6, 7, 5);
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath(); ctx.arc(sRetX + 21, sRetY + 8, 2, 0, Math.PI * 2); ctx.fill(); // Lens

    // 3. Spider-Man Mug with animated spider-sense steam
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath(); ctx.arc(sRetX + 28, sRetY + 12, 3.5, 0, Math.PI * 2); ctx.fill();
    const sSteamY = (this.state.tick * 0.3 + 4) % 8;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(sRetX + 28, sRetY + 8 - sSteamY, 1.2, 0, Math.PI * 2); ctx.fill();

    // 4. Stark-Tech Spider PC Tower with Cyan Arc-Reactor Fan
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(sRetX + 34, sRetY + 5, 14, 18);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.strokeRect(sRetX + 34, sRetY + 5, 14, 18);
    // Glowing Cyan Spider-Arc Reactor fan
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(sRetX + 41, sRetY + 14, 3, 0, Math.PI * 2); ctx.fill();

    ctx.restore();

    // 🪑 Spider-Man Racing Chair on LEFT Side with White Mask Eyes
    this.chair(ctx, sMainX - 16, sMainY + sMainH / 2, Math.PI / 2, 12);
    // White Spider-Eyes on chair headrest
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(sMainX - 22, sMainY + sMainH / 2 - 6);
    ctx.lineTo(sMainX - 25, sMainY + sMainH / 2 - 2);
    ctx.lineTo(sMainX - 22, sMainY + sMainH / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sMainX - 22, sMainY + sMainH / 2 + 6);
    ctx.lineTo(sMainX - 25, sMainY + sMainH / 2 + 2);
    ctx.lineTo(sMainX - 22, sMainY + sMainH / 2);
    ctx.fill();
    ctx.restore();

    // Top Wall Architecture Whiteboard
    this.whiteboard(ctx, T(5), T(1.2), S * 5, 14, '</> CODE ARCHITECTURE');
  }`;

const spideyStart = code.indexOf("    // =========================================================================\n    // 🕷️ 2. BOTTOM WORKSTATION: RED SPIDER-MAN THEMED L-DESK");
const designStart = code.indexOf("  // --- DESIGN ROOM");

if (spideyStart !== -1 && designStart !== -1) {
  code = code.slice(0, spideyStart) + decoratedSpiderManDesk + "\n\n" + code.slice(designStart);
}

fs.writeFileSync('src/core/engine.ts', code, 'utf-8');
console.log('Successfully decorated Red Spider-Man desk with rich superhero themed elements!');
