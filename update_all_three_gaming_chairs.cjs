const fs = require('fs');

let code = fs.readFileSync('src/core/engine.ts', 'utf-8');

// 1. Add drawThemedGamingChair method right above chair helper
const themedGamingChairMethod = `  // --- THEMED LUXURY RACING GAMING CHAIR HELPER ---
  private drawThemedGamingChair(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, theme: 'kitty' | 'spiderman' | 'white_gold') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // 1. 5-Star Caster Wheel Base with Rolling Wheels
    const baseColor = theme === 'kitty' ? '#fce7f3' : (theme === 'spiderman' ? '#1e3a8a' : '#d4af37');
    const casterColor = '#0f172a';
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2.2;
    for (let a = 0; a < 5; a++) {
      const rad = (a * Math.PI * 2) / 5;
      const legX = Math.cos(rad) * 11;
      const legY = Math.sin(rad) * 11;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(legX, legY);
      ctx.stroke();
      // Mini wheel caster
      ctx.fillStyle = casterColor;
      ctx.beginPath();
      ctx.arc(legX, legY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Center Gas Lift Cylinder
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 2. Ergonomic Gaming Bucket Seat Cushion (Winged Contoured Base)
    let primaryColor = '#ffffff';
    let bolsterColor = '#f472b6';
    let pipingColor = '#ec4899';

    if (theme === 'kitty') {
      primaryColor = '#fdf2f8';
      bolsterColor = '#f472b6';
      pipingColor = '#ec4899';
    } else if (theme === 'spiderman') {
      primaryColor = '#dc2626';
      bolsterColor = '#1e3a8a';
      pipingColor = '#fbbf24';
    } else if (theme === 'white_gold') {
      primaryColor = '#ffffff';
      bolsterColor = '#f8fafc';
      pipingColor = '#d4af37';
    }

    // Drop Shadow for Seat
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.roundRect(-7, -8, 16, 17, 4);
    ctx.fill();

    // Side Bolsters (Racing Wings)
    ctx.fillStyle = bolsterColor;
    ctx.beginPath();
    ctx.roundRect(-8, -9, 18, 18, 5);
    ctx.fill();
    ctx.strokeStyle = pipingColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Main Center Seat Cushion
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(-6, -7, 14, 14, 3);
    ctx.fill();

    // 3. Ergonomic 4D Armrests
    const armrestColor = theme === 'kitty' ? '#f472b6' : (theme === 'spiderman' ? '#0f172a' : '#d4af37');
    ctx.fillStyle = armrestColor;
    ctx.fillRect(-4, -11, 10, 2.5); // Top Armrest
    ctx.fillRect(-4, 8.5, 10, 2.5); // Bottom Armrest

    // 4. High-Back Rest with Shoulder Bolsters
    ctx.fillStyle = bolsterColor;
    ctx.beginPath();
    ctx.roundRect(-10, -7, 5, 14, 2);
    ctx.fill();
    ctx.strokeStyle = pipingColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    // 5. Themed Headrest & Custom Crest Details
    if (theme === 'kitty') {
      // Adorable 3D Cat Ears on Headrest
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.moveTo(-11, -6); ctx.lineTo(-16, -9); ctx.lineTo(-9, -7);
      ctx.moveTo(-11, 6); ctx.lineTo(-16, 9); ctx.lineTo(-9, 7);
      ctx.fill();
      // Bright Red Ribbon Bow
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(-11, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-13, -1.5, 4, 3);
      // Pink Stitched Heart on Cushion
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme === 'spiderman') {
      // White Spider-Man Mask Eyes with Black Rim on Headrest
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.8;
      // Eye 1
      ctx.beginPath();
      ctx.moveTo(-10, -4); ctx.lineTo(-13, -2); ctx.lineTo(-10, 0);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // Eye 2
      ctx.beginPath();
      ctx.moveTo(-10, 4); ctx.lineTo(-13, 2); ctx.lineTo(-10, 0);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // Black Web Stitch Lines on Center Cushion
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-5, 0); ctx.lineTo(6, 0);
      ctx.moveTo(0, -6); ctx.lineTo(0, 6);
      ctx.stroke();
    } else if (theme === 'white_gold') {
      // Luxury Gold Crown / Master Emblem on Headrest
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.moveTo(-10, -4); ctx.lineTo(-13, -5); ctx.lineTo(-11, 0); ctx.lineTo(-13, 5); ctx.lineTo(-10, 4);
      ctx.closePath();
      ctx.fill();
      // Gold Diamond Stitching on Pure White Leather Cushion
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -4); ctx.lineTo(4, 0); ctx.lineTo(0, 4); ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();
  }
`;

// 2. Update Hello Kitty Chair in drawDevRoom
const oldKittyChair = `    // 🪑 Hello Kitty Gaming Chair on LEFT Side with Cat Ears & Red Bow
    this.chair(ctx, kMainX - 16, kMainY + kMainH / 2, Math.PI / 2, 12);
    // Cat ears on chair headrest
    ctx.save();
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(kMainX - 22, kMainY + kMainH / 2 - 8, 2, 0, Math.PI * 2); ctx.fill();
    ctx.arc(kMainX - 22, kMainY + kMainH / 2 + 8, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(kMainX - 24, kMainY + kMainH / 2 - 2, 3, 4); // Bow
    ctx.restore();`;

const newKittyChair = `    // 🪑 Custom Hello Kitty Ergonomic Racing Gaming Chair on LEFT Side
    this.drawThemedGamingChair(ctx, kMainX - 16, kMainY + kMainH / 2, Math.PI / 2, 'kitty');`;

code = code.replace(oldKittyChair, newKittyChair);

// 3. Update Spider-Man Chair in drawDevRoom
const oldSpideyChair = `    // 🪑 Spider-Man Racing Chair on LEFT Side with White Mask Eyes
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
    ctx.restore();`;

const newSpideyChair = `    // 🪑 Custom Spider-Man Hero Racing Gaming Chair on LEFT Side
    this.drawThemedGamingChair(ctx, sMainX - 16, sMainY + sMainH / 2, Math.PI / 2, 'spiderman');`;

code = code.replace(oldSpideyChair, newSpideyChair);

// 4. Update White & Gold Chair in drawDesignRoom
const oldDesignChair = `    // 3. High-Backed Executive Boss Chair in Creamy White Leather (Inside Cockpit on the RIGHT, Facing Left)
    this.chair(ctx, mainX + mainW + 14, mainY + mainH / 2, -Math.PI / 2, 13);`;

const newDesignChair = `    // 3. Custom White & Gold Luxury Master Designer Gaming Throne (Inside Cockpit on the RIGHT, Facing Left)
    this.drawThemedGamingChair(ctx, mainX + mainW + 14, mainY + mainH / 2, -Math.PI / 2, 'white_gold');`;

code = code.replace(oldDesignChair, newDesignChair);

// Insert drawThemedGamingChair helper before chair method
const chairHelperIndex = code.indexOf("  private chair(");
if (chairHelperIndex !== -1) {
  code = code.slice(0, chairHelperIndex) + themedGamingChairMethod + "\n" + code.slice(chairHelperIndex);
}

fs.writeFileSync('src/core/engine.ts', code, 'utf-8');
console.log('Successfully added custom themed gaming chairs for all 3 tables!');
