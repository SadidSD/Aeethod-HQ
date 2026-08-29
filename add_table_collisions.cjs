const fs = require('fs');

let code = fs.readFileSync('src/core/engine.ts', 'utf-8');

// 1. Add isInsideTable helper method before isSolid
const tableCollisionMethod = `  // --- SOLID TABLE OBSTACLE COLLISION CHECK ---
  isInsideTable(wx: number, wy: number): boolean {
    const S = TILE_SIZE;
    const cx = T(DIAMOND_CX), cy = T(DIAMOND_CY);

    // 1. Management Room: Big U-Shaped Executive Table
    const topW = S * 7.2;
    const topH = S * 1.8;
    const topX = cx - topW / 2;
    const topY = cy - S * 2.4;
    // Top desk bridge
    if (wx >= topX && wx <= topX + topW && wy >= topY && wy <= topY + topH) return true;
    // Left wing
    const wingW = S * 1.8;
    const wingH = S * 4.6;
    if (wx >= topX && wx <= topX + wingW && wy >= topY && wy <= topY + wingH) return true;
    // Right wing
    const rightX = topX + topW - wingW;
    if (wx >= rightX && wx <= rightX + wingW && wy >= topY && wy <= topY + wingH) return true;

    // 2. Design Room: White L-Shaped Boss Executive Table
    const dMainX = T(36.8), dMainY = T(6.0), dMainW = S * 1.9, dMainH = S * 5.6;
    if (wx >= dMainX && wx <= dMainX + dMainW && wy >= dMainY && wy <= dMainY + dMainH) return true;
    const dRetX = dMainX + dMainW, dRetY = T(6.0), dRetW = S * 2.4, dRetH = S * 1.9;
    if (wx >= dRetX && wx <= dRetX + dRetW && wy >= dRetY && wy <= dRetY + dRetH) return true;

    // 3. Dev Room: Top Hello Kitty L-Table
    const kMainX = T(5.8), kMainY = T(3.6), kMainW = S * 1.9, kMainH = S * 5.2;
    if (wx >= kMainX && wx <= kMainX + kMainW && wy >= kMainY && wy <= kMainY + kMainH) return true;
    const kRetX = T(3.5), kRetY = T(3.6), kRetW = S * 2.3, kRetH = S * 1.9;
    if (wx >= kRetX && wx <= kRetX + kRetW && wy >= kRetY && wy <= kRetY + kRetH) return true;

    // 4. Dev Room: Bottom Spider-Man L-Table
    const sMainX = T(5.8), sMainY = T(12.6), sMainW = S * 1.9, sMainH = S * 5.2;
    if (wx >= sMainX && wx <= sMainX + sMainW && wy >= sMainY && wy <= sMainY + sMainH) return true;
    const sRetX = T(3.5), sRetY = T(12.6), sRetW = S * 2.3, sRetH = S * 1.9;
    if (wx >= sRetX && wx <= sRetX + sRetW && wy >= sRetY && wy <= sRetY + sRetH) return true;

    // 5. Meeting Room: Long Conference Table
    const confX = T(16.5), confY = T(4.0), confW = S * 10, confH = S * 4;
    if (wx >= confX && wx <= confX + confW && wy >= confY && wy <= confY + confH) return true;

    // 6. Client Room: Workstation Bench & Consultation Table
    if (wx >= T(2) && wx <= T(4) && wy >= T(26) && wy <= T(36)) return true;
    if (Math.hypot(wx - T(8), wy - T(32)) <= S * 1.2) return true;

    // 7. Content Room: Workstation Bench & Round Table
    if (wx >= T(32) && wx <= T(34) && wy >= T(26) && wy <= T(36)) return true;
    if (Math.hypot(wx - T(36), wy - T(38)) <= S * 1.1) return true;

    // 8. Reception Desk
    const rDeskCX = T(22), rDeskCY = T(36);
    const rDist = Math.hypot(wx - rDeskCX, wy - rDeskCY);
    if (rDist >= S * 2.0 && rDist <= S * 3.4 && wy >= rDeskCY - 4) return true;

    return false;
  }
`;

// Insert isInsideTable method
const isSolidIndex = code.indexOf("  isSolid(wx: number, wy: number): boolean {");
if (isSolidIndex !== -1) {
  code = code.slice(0, isSolidIndex) + tableCollisionMethod + "\n" + code.slice(isSolidIndex);
}

// 2. Update isSolid to check isInsideTable
const oldIsSolid = `  isSolid(wx: number, wy: number): boolean {
    const tx = Math.floor(wx/TILE_SIZE), ty = Math.floor(wy/TILE_SIZE);
    const tile = this.getTile(tx,ty);
    if (!tile) return true;
    if (tile.isWall) return true;
    if (tile.isDoor) { const d = DOORS.find(dd=>dd.x===tx&&dd.y===ty); if (d&&!this.state.doors[d.id]) return true; }
    if (tile.building && tile.building.type !== 'conveyor') return true;
    return false;
  }`;

const newIsSolid = `  isSolid(wx: number, wy: number): boolean {
    const tx = Math.floor(wx/TILE_SIZE), ty = Math.floor(wy/TILE_SIZE);
    const tile = this.getTile(tx,ty);
    if (!tile) return true;
    if (tile.isWall) return true;
    if (tile.isDoor) { const d = DOORS.find(dd=>dd.x===tx&&dd.y===ty); if (d&&!this.state.doors[d.id]) return true; }
    if (tile.building && tile.building.type !== 'conveyor') return true;
    if (this.isInsideTable(wx, wy)) return true;
    return false;
  }`;

code = code.replace(oldIsSolid, newIsSolid);

// 3. Update player movement collision in update()
const oldMovement = `    const r=8, spd=this.state.player.speed;
    const nx=this.state.player.x+dx*spd, ny=this.state.player.y+dy*spd;
    if (!this.isSolid(nx-r,this.state.player.y)&&!this.isSolid(nx+r,this.state.player.y)) this.state.player.x=Math.max(16,Math.min(MAP_WIDTH*TILE_SIZE-16,nx));
    if (!this.isSolid(this.state.player.x,ny-r)&&!this.isSolid(this.state.player.x,ny+r)) this.state.player.y=Math.max(16,Math.min(MAP_HEIGHT*TILE_SIZE-16,ny));`;

const newMovement = `    const r = 6, spd = this.state.player.speed;
    const nx = this.state.player.x + dx * spd, ny = this.state.player.y + dy * spd;
    const canMoveX = !this.isSolid(nx - r, this.state.player.y - r) &&
                     !this.isSolid(nx - r, this.state.player.y + r) &&
                     !this.isSolid(nx + r, this.state.player.y - r) &&
                     !this.isSolid(nx + r, this.state.player.y + r);
    if (canMoveX) this.state.player.x = Math.max(16, Math.min(MAP_WIDTH * TILE_SIZE - 16, nx));

    const canMoveY = !this.isSolid(this.state.player.x - r, ny - r) &&
                     !this.isSolid(this.state.player.x + r, ny - r) &&
                     !this.isSolid(this.state.player.x - r, ny + r) &&
                     !this.isSolid(this.state.player.x + r, ny + r);
    if (canMoveY) this.state.player.y = Math.max(16, Math.min(MAP_HEIGHT * TILE_SIZE - 16, ny));`;

code = code.replace(oldMovement, newMovement);

fs.writeFileSync('src/core/engine.ts', code, 'utf-8');
console.log('Successfully enabled solid physical collisions for all tables!');
