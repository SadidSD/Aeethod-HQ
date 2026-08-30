import { GameState, Tile, BuildingType, Direction, Building } from './types';
import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, BUILDING_SIZES } from './constants';
import { createFixedMap, DOORS, getRoomAt, DIAMOND_CX, DIAMOND_CY, DIAMOND_R } from './world';
import { getTerrainSprite, getBuildingSprite } from '../render/SpriteManager';
import { AgencyManager } from './agency';
import { RemotePlayer, CharacterSetup } from './multiplayer';

// Helper: Convert tile coords to pixel center
const T = (v: number) => v * TILE_SIZE;
const TC = (v: number) => (v + 0.5) * TILE_SIZE;

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  state: GameState;
  map: Tile[][];
  keys = new Set<string>();
  mouse = { x: 0, y: 0, wx: 0, wy: 0, down: false, rightDown: false };
  selectedBuilding: BuildingType | null = null;
  selectedDirection: Direction = 'up';
  running = false;
  onStateChange: ((state: GameState) => void) | null = null;
  onOpenComputer: (() => void) | null = null;
  onOpenDesignerPC: (() => void) | null = null;
  onOpenMember: ((memberId: string) => void) | null = null;
  onOpenBoard: ((boardType: 'leads' | 'architecture' | 'content') => void) | null = null;
  onOpenClientPC: (() => void) | null = null;
  agencyManager: AgencyManager | null = null;
  remotePlayers = new Map<string, RemotePlayer>();
  onPositionChange: ((x: number, y: number, facing: 'up' | 'down' | 'left' | 'right', room: string) => void) | null = null;
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.map = createFixedMap();

    const startX = TC(21);
    const startY = T(40);

    const initialDoors: Record<string, boolean> = {};
    for (const d of DOORS) initialDoors[d.id] = d.isOpen;

    this.state = {
      tick: 0, worldSeed: 12345, doors: initialDoors, activeRoom: 'Reception & Lobby',
      player: { x: startX, y: startY, speed: 3.6, inventory: { iron: 20, copper: 20, coal: 20, conveyor_belt: 40, miner_item: 4, furnace_item: 2, inserter_item: 4, storage_item: 2 }, miningProgress: 0, targetTile: null },
      camera: { x: startX, y: startY, zoom: 0.85 },
      buildings: new Map(), conveyors: new Map(),
      statistics: { itemsProduced: {}, itemsConsumed: {}, playtime: 0 },
    };
    this.setupEvents();
  }

  private setupEvents() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      this.keys.add(key);
      if (key === 'q') { const d: Direction[] = ['up','right','down','left']; this.selectedDirection = d[(d.indexOf(this.selectedDirection)+1)%4]; }
      if (key === 'e') {
        const interaction = this.getNearestInteraction();
        if (interaction) {
          if (interaction.type === 'door' && interaction.id) {
            this.state.doors[interaction.id] = !this.state.doors[interaction.id];
          } else if (interaction.type === 'mgmt_pc') {
            this.onOpenComputer?.();
          } else if (interaction.type === 'designer_pc') {
            this.onOpenDesignerPC?.();
          } else if (interaction.type === 'client_pc') {
            this.onOpenClientPC?.();
          } else if (interaction.type === 'dev_pc_kitty') {
            this.onOpenMember?.('frontend');
          } else if (interaction.type === 'dev_pc_spidey') {
            this.onOpenMember?.('backend');
          } else if (interaction.type === 'board_leads') {
            this.onOpenBoard?.('leads');
          } else if (interaction.type === 'board_arch') {
            this.onOpenBoard?.('architecture');
          } else if (interaction.type === 'board_content') {
            this.onOpenBoard?.('content');
          }
        }
      }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    this.canvas.addEventListener('mousemove', (e) => {
      const r = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left; this.mouse.y = e.clientY - r.top;
      const cx = this.canvas.width/2, cy = this.canvas.height/2;
      this.mouse.wx = (this.mouse.x - cx) / this.state.camera.zoom + this.state.camera.x;
      this.mouse.wy = (this.mouse.y - cy) / this.state.camera.zoom + this.state.camera.y;
    });
    this.canvas.addEventListener('mousedown', (e) => { if (e.button===0) { this.mouse.down=true; this.handleClick(); } else if (e.button===2) { this.mouse.rightDown=true; this.handleRightClick(); } });
    this.canvas.addEventListener('mouseup', (e) => { if (e.button===0) this.mouse.down=false; if (e.button===2) this.mouse.rightDown=false; });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    this.canvas.addEventListener('wheel', (e) => { e.preventDefault(); this.state.camera.zoom = Math.max(0.4, Math.min(2.5, this.state.camera.zoom * (e.deltaY<0?1.08:0.92))); });
  }

  getNearestInteraction(): { type: 'door' | 'mgmt_pc' | 'designer_pc' | 'client_pc' | 'dev_pc' | 'dev_pc_kitty' | 'dev_pc_spidey' | 'board_leads' | 'board_arch' | 'board_content'; text: string; x: number; y: number; id?: string } | null {
    const px = this.state.player.x;
    const py = this.state.player.y;
    let closest: { type: any; text: string; x: number; y: number; id?: string } | null = null;
    let minDist = 999;

    const check = (type: any, ox: number, oy: number, distThresh: number, text: string, id?: string) => {
      const d = Math.hypot(px - ox, py - oy);
      if (d < distThresh && d < minDist) {
        minDist = d;
        closest = { type, text, x: ox, y: oy, id };
      }
    };

    // Check doors with tight distance
    for (const d of DOORS) {
      const dx = TC(d.x);
      const dy = TC(d.y);
      const isOpen = this.state.doors[d.id];
      check('door', dx, dy, 55, isOpen ? '[E] Close Door' : '[E] Open Door', d.id);
    }

    // Check Workstations & Boards with tight radius right at the object
    check('mgmt_pc', T(DIAMOND_CX), T(DIAMOND_CY) - TILE_SIZE * 1.5, 65, '👑 [E] Open Management PC');
    check('designer_pc', T(38.0), T(9.0), 50, '🎨 [E] Open Designer Terminal');
    check('client_pc', T(3.5), T(30.5), 55, '🤝 [E] Open Client Relations PC');
    check('dev_pc_kitty', T(6.5), T(6.3), 55, '🌸 [E] Frontend Dev (Hello Kitty)');
    check('dev_pc_spidey', T(6.5), T(15.1), 55, '🕷️ [E] Backend Dev (Spider-Man)');
    check('board_leads', T(22), T(37), 50, '🛎️ [E] Open Lead Registry');
    check('board_arch', T(21.5), T(2), 55, '📅 [E] Meeting & Planning Room');
    check('board_content', T(39), T(28), 50, '📅 [E] View Content Calendar');

    return closest;
  }

  getTile(tx: number, ty: number): Tile|null { return (tx<0||tx>=MAP_WIDTH||ty<0||ty>=MAP_HEIGHT) ? null : this.map[ty][tx]; }

  // --- SOLID TABLE OBSTACLE COLLISION CHECK ---
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

    // 8. Reception Desk (Centered at T(22), T(33.5))
    const rDeskCX = T(22), rDeskCY = T(33.5);
    const rDist = Math.hypot(wx - rDeskCX, wy - rDeskCY);
    const angle = Math.atan2(wy - rDeskCY, wx - rDeskCX);
    if (rDist >= S * 2.6 && rDist <= S * 3.8 && angle >= Math.PI * 0.16 && angle <= Math.PI * 0.84) return true;

    return false;
  }

  isSolid(wx: number, wy: number): boolean {
    const tx = Math.floor(wx/TILE_SIZE), ty = Math.floor(wy/TILE_SIZE);
    const tile = this.getTile(tx,ty);
    if (!tile) return true;
    if (tile.isWall) return true;
    if (tile.isDoor) { const d = DOORS.find(dd=>dd.x===tx&&dd.y===ty); if (d&&!this.state.doors[d.id]) return true; }
    if (tile.building && tile.building.type !== 'conveyor') return true;
    if (this.isInsideTable(wx, wy)) return true;
    return false;
  }

  handleClick() {
    const tx = Math.floor(this.mouse.wx/TILE_SIZE), ty = Math.floor(this.mouse.wy/TILE_SIZE);
    const tile = this.getTile(tx,ty); if (!tile) return;

    const px = this.state.player.x, py = this.state.player.y, mx = this.mouse.wx, my = this.mouse.wy;
    if (tile.isDoor) {
      const d = DOORS.find(dd => dd.x === tx && dd.y === ty);
      if (d && Math.hypot(this.state.player.x - TC(d.x), this.state.player.y - TC(d.y)) < 65) {
        this.state.doors[d.id] = !this.state.doors[d.id];
        return;
      }
    }

    const checkClick = (ox: number, oy: number, maxPlayerDist: number, cb: () => void) => {
      if (Math.hypot(mx - ox, my - oy) < 40 && Math.hypot(px - ox, py - oy) < maxPlayerDist) {
        cb();
        return true;
      }
      return false;
    };
    if (checkClick(T(DIAMOND_CX), T(DIAMOND_CY) - TILE_SIZE * 1.5, 75, () => this.onOpenComputer?.())) return;
    if (checkClick(T(38.0), T(9.0), 55, () => this.onOpenDesignerPC?.())) return;
    if (checkClick(T(3.5), T(30.5), 55, () => this.onOpenClientPC?.())) return;
    if (checkClick(T(6.5), T(6.3), 60, () => this.onOpenMember?.('frontend'))) return;
    if (checkClick(T(6.5), T(15.1), 60, () => this.onOpenMember?.('backend'))) return;
    if (checkClick(T(22), T(37), 55, () => this.onOpenBoard?.('leads'))) return;
    if (checkClick(T(21.5), T(2), 55, () => this.onOpenBoard?.('architecture'))) return;
    if (checkClick(T(39), T(28), 55, () => this.onOpenBoard?.('content'))) return;
    if (this.selectedBuilding) {
      const sz = BUILDING_SIZES[this.selectedBuilding]; let ok=true;
      for (let dx=0;dx<sz.w;dx++) for (let dy=0;dy<sz.h;dy++) { const t=this.getTile(tx+dx,ty+dy); if (!t||t.building||t.isWall||t.isDoor||this.isSolid(T(tx+dx)+16,T(ty+dy)+16)) ok=false; }
      if (ok) {
        const ik = this.selectedBuilding==='conveyor'?'conveyor_belt':`${this.selectedBuilding}_item`;
        if ((this.state.player.inventory[ik]||0)<=0) return;
        this.state.player.inventory[ik]--;
        const b: Building = { id:`${this.selectedBuilding}_${tx}_${ty}`, type:this.selectedBuilding, x:tx, y:ty, dir:this.selectedDirection, progress:0, inventory:{}, outputInventory:{} };
        for (let dx=0;dx<sz.w;dx++) for (let dy=0;dy<sz.h;dy++) { const t=this.getTile(tx+dx,ty+dy); if(t) t.building=b; }
        this.state.buildings.set(`${tx},${ty}`, b);
      }
    } else if (tile.resource && tile.resourceAmount>0) { tile.resourceAmount--; this.state.player.inventory[tile.resource]=(this.state.player.inventory[tile.resource]||0)+1; }
  }

  handleRightClick() {
    const tx=Math.floor(this.mouse.wx/TILE_SIZE), ty=Math.floor(this.mouse.wy/TILE_SIZE);
    const tile=this.getTile(tx,ty); if (!tile||!tile.building) return;
    const b=tile.building, sz=BUILDING_SIZES[b.type];
    const ik=b.type==='conveyor'?'conveyor_belt':`${b.type}_item`;
    this.state.player.inventory[ik]=(this.state.player.inventory[ik]||0)+1;
    for (let dx=0;dx<sz.w;dx++) for (let dy=0;dy<sz.h;dy++) { const t=this.getTile(b.x+dx,b.y+dy); if(t) t.building=null; }
    this.state.buildings.delete(`${b.x},${b.y}`);
  }

  start() { if (this.running) return; this.running=true; this.loop(); }
  stop() { this.running=false; if (this.animationFrameId!==null) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId=null; } }
  private loop = () => { if (!this.running) return; this.update(); this.render(); this.animationFrameId=requestAnimationFrame(this.loop); };

  private update() {
    this.state.tick++;
    let dx=0, dy=0;
    if (this.keys.has('w')||this.keys.has('arrowup')) dy-=1;
    if (this.keys.has('s')||this.keys.has('arrowdown')) dy+=1;
    if (this.keys.has('a')||this.keys.has('arrowleft')) dx-=1;
    if (this.keys.has('d')||this.keys.has('arrowright')) dx+=1;
    if (dx!==0&&dy!==0) { dx*=0.7071; dy*=0.7071; }
    const baseSpeed = 3.6;
    const isSprinting = this.keys.has('shift');
    const spd = isSprinting ? baseSpeed * 1.85 : baseSpeed;
    this.state.player.speed = spd;

    const r = 6;
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
    if (canMoveY) this.state.player.y = Math.max(16, Math.min(MAP_HEIGHT * TILE_SIZE - 16, ny));
    this.state.activeRoom = getRoomAt(this.state.player.x/TILE_SIZE, this.state.player.y/TILE_SIZE);
    this.state.camera.x += (this.state.player.x - this.state.camera.x)*0.1;
    this.state.camera.y += (this.state.player.y - this.state.camera.y)*0.1;

    // Multiplayer: emit position changes
    if (dx !== 0 || dy !== 0) {
      const facing: 'up' | 'down' | 'left' | 'right' = dy < 0 ? 'up' : dy > 0 ? 'down' : dx < 0 ? 'left' : 'right';
      this.onPositionChange?.(this.state.player.x, this.state.player.y, facing, this.state.activeRoom);
    }

    // Multiplayer: interpolate remote players
    for (const rp of this.remotePlayers.values()) {
      rp.x += (rp.targetX - rp.x) * 0.25;
      rp.y += (rp.targetY - rp.y) * 0.25;
    }

    for (const b of this.state.buildings.values()) { if (b.type==='miner') { b.progress++; if (b.progress>=100) { b.progress=0; const t=this.getTile(b.x,b.y); if (t?.resource&&t.resourceAmount>0) { t.resourceAmount--; b.inventory[t.resource]=(b.inventory[t.resource]||0)+1; } } } }
    if (this.state.tick%10===0&&this.onStateChange) this.onStateChange({...this.state});
  }

  private render() {
    const { ctx, canvas } = this;
    const S = TILE_SIZE;
    ctx.fillStyle='#060a0e'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(this.state.camera.zoom, this.state.camera.zoom);
    ctx.translate(-this.state.camera.x, -this.state.camera.y);
    const MW=MAP_WIDTH*S, MH=MAP_HEIGHT*S;

    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(10,10,MW,MH);

    // Floor tiles
    for (let ty=0;ty<MAP_HEIGHT;ty++) for (let tx=0;tx<MAP_WIDTH;tx++) {
      const tile=this.map[ty][tx];
      ctx.drawImage(getTerrainSprite(tile.biome,tx,ty), tx*S, ty*S, S, S);
    }


    // --- EXECUTIVE COMMAND RADAR: FLOATING ALERT BEACONS ---
    // Only visible when the CEO is inside the Management Room
    const isInsideMgmt = this.state.activeRoom === 'Management Room';
    if (isInsideMgmt && this.agencyManager) {
      const alerts = this.agencyManager.getDepartmentAlerts();

      ctx.save();
      for (const alert of alerts) {
        let labelX = 0, labelY = 0;
        if (alert.room === 'dev') {
          labelX = T(6.2); labelY = T(10);
        } else if (alert.room === 'design') {
          labelX = T(37.2); labelY = T(10);
        } else if (alert.room === 'client') {
          labelX = T(7); labelY = T(33);
        } else if (alert.room === 'content') {
          labelX = T(36.5); labelY = T(33);
        }

        if (labelX > 0) {
          const isRed = alert.severity === 'red';

          // Floating Alert Beacon Badge over room
          ctx.save();
          const badgeText = isRed ? `🔴 CRITICALLY STUCK` : `⚠️ STALLED (${alert.daysStalled}d)`;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
          ctx.beginPath();
          ctx.roundRect(labelX - 55, labelY - 26, 110, 20, 5);
          ctx.fill();
          ctx.strokeStyle = isRed ? '#ef4444' : '#eab308';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = isRed ? '#fca5a5' : '#fde047';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(badgeText, labelX, labelY - 13);
          ctx.restore();
        }
      }
      ctx.restore();
    }

    // Circulation dashed paths
    ctx.save(); ctx.strokeStyle='rgba(100,116,139,0.35)'; ctx.lineWidth=1.5; ctx.setLineDash([8,8]);
    // Reception up to management
    ctx.beginPath(); ctx.moveTo(T(22),T(40)); ctx.bezierCurveTo(T(22),T(35),T(22),T(32),T(22),T(29)); ctx.stroke();
    // Left branch to dev
    ctx.beginPath(); ctx.moveTo(T(22),T(33)); ctx.bezierCurveTo(T(16),T(30),T(13),T(24),T(12),T(15)); ctx.stroke();
    // Right branch to design
    ctx.beginPath(); ctx.moveTo(T(22),T(33)); ctx.bezierCurveTo(T(28),T(30),T(31),T(24),T(31),T(15)); ctx.stroke();
    // To meeting left
    ctx.beginPath(); ctx.moveTo(T(12),T(14)); ctx.quadraticCurveTo(T(12),T(11),T(16),T(10)); ctx.stroke();
    // To meeting right
    ctx.beginPath(); ctx.moveTo(T(31),T(14)); ctx.quadraticCurveTo(T(31),T(11),T(27),T(10)); ctx.stroke();
    // To client
    ctx.beginPath(); ctx.moveTo(T(18),T(34)); ctx.bezierCurveTo(T(14),T(34),T(13),T(33),T(13),T(33)); ctx.stroke();
    // To content
    ctx.beginPath(); ctx.moveTo(T(26),T(34)); ctx.bezierCurveTo(T(29),T(34),T(30),T(33),T(30),T(33)); ctx.stroke();
    ctx.restore();


    // Task Flow Belts
    ctx.save();
    const tMod = (this.state.tick * 0.01) % 1;
    const drawOrb = (x: number, y: number) => {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fill();
    };
    
    // Simple interpolation for flow belts
    const getPointOnBezier = (p0: {x:number,y:number}, p1: {x:number,y:number}, p2: {x:number,y:number}, p3: {x:number,y:number}, t: number) => {
      const u = 1 - t;
      const tt = t*t, uu = u*u;
      const uuu = uu * u, ttt = tt * t;
      let p = { x: uuu * p0.x, y: uuu * p0.y };
      p.x += 3 * uu * t * p1.x; p.y += 3 * uu * t * p1.y;
      p.x += 3 * u * tt * p2.x; p.y += 3 * u * tt * p2.y;
      p.x += ttt * p3.x; p.y += ttt * p3.y;
      return p;
    };
    const getPointOnQuad = (p0: {x:number,y:number}, p1: {x:number,y:number}, p2: {x:number,y:number}, t: number) => {
      const u = 1 - t;
      return {
        x: u*u*p0.x + 2*u*t*p1.x + t*t*p2.x,
        y: u*u*p0.y + 2*u*t*p1.y + t*t*p2.y
      };
    };

    // Reception to Management
    let pt = getPointOnBezier({x:T(22),y:T(40)}, {x:T(22),y:T(35)}, {x:T(22),y:T(32)}, {x:T(22),y:T(29)}, tMod);
    drawOrb(pt.x, pt.y);
    
    // Management left branch to dev
    pt = getPointOnBezier({x:T(22),y:T(33)}, {x:T(16),y:T(30)}, {x:T(13),y:T(24)}, {x:T(12),y:T(15)}, tMod);
    drawOrb(pt.x, pt.y);
    
    // Management right branch to design
    pt = getPointOnBezier({x:T(22),y:T(33)}, {x:T(28),y:T(30)}, {x:T(31),y:T(24)}, {x:T(31),y:T(15)}, tMod);
    drawOrb(pt.x, pt.y);
    
    // To meeting left
    pt = getPointOnQuad({x:T(12),y:T(14)}, {x:T(12),y:T(11)}, {x:T(16),y:T(10)}, tMod);
    drawOrb(pt.x, pt.y);
    
    // To meeting right
    pt = getPointOnQuad({x:T(31),y:T(14)}, {x:T(31),y:T(11)}, {x:T(27),y:T(10)}, tMod);
    drawOrb(pt.x, pt.y);

    ctx.restore();

    // === FURNITURE RENDERING ===
    this.drawReception(ctx, S);
    this.drawMeetingRoom(ctx, S);
    this.drawDevRoom(ctx, S);
    this.drawDesignRoom(ctx, S);
    this.drawManagementRoom(ctx, S);
    this.drawClientRoom(ctx, S);
    this.drawContentRoom(ctx, S);
    this.drawCornerPlants(ctx, S);

    // Walls & Doors
    this.drawWallsAndDoors(ctx, S);

    // Placed buildings
    for (const b of this.state.buildings.values()) { const sz=BUILDING_SIZES[b.type]; ctx.drawImage(getBuildingSprite(b.type), b.x*S, b.y*S, sz.w*S, sz.h*S); }

    // Ghost preview
    if (this.selectedBuilding) {
      const tx=Math.floor(this.mouse.wx/S), ty=Math.floor(this.mouse.wy/S), sz=BUILDING_SIZES[this.selectedBuilding];
      if (tx>=0&&tx+sz.w<=MAP_WIDTH&&ty>=0&&ty+sz.h<=MAP_HEIGHT) {
        ctx.save(); ctx.globalAlpha=0.5;
        ctx.drawImage(getBuildingSprite(this.selectedBuilding), tx*S, ty*S, sz.w*S, sz.h*S);
        ctx.strokeStyle='#38bdf8'; ctx.lineWidth=1.5; ctx.strokeRect(tx*S,ty*S,sz.w*S,sz.h*S);
        ctx.restore();
      }
    }

    // Player
    this.drawPlayer(ctx);

    // Multiplayer: Remote Players
    this.drawRemotePlayers(ctx);

    // Room labels
    this.drawLabels(ctx, S);

    // Door prompts
    this.drawDoorPrompts(ctx);

    ctx.restore();
  }

  // ====== FURNITURE DRAWING METHODS ======

  // --- THEMED LUXURY RACING GAMING CHAIR HELPER ---
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

  private chair(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, size: number = 10) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
    // Seat
    ctx.fillStyle='#e8e4df';
    ctx.beginPath(); ctx.arc(0,0,size*0.7,0,Math.PI*2); ctx.fill();
    // Back rest
    ctx.fillStyle='#d0ccc6';
    ctx.beginPath(); ctx.arc(0,-size*0.5,size*0.55,Math.PI*0.8,Math.PI*0.2,true); ctx.fill();
    ctx.restore();
  }

  private desk(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string = '#e0ddd8') {
    ctx.fillStyle='rgba(0,0,0,0.15)'; ctx.fillRect(x+2,y+3,w,h);
    ctx.fillStyle=color; ctx.fillRect(x,y,w,h);
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fillRect(x,y,w,2);
  }

  private monitor(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.fillStyle='#222'; ctx.fillRect(x-1,y-1,w+2,h+2);
    ctx.fillStyle='#6ec6f0'; ctx.fillRect(x,y,w,h);
    // Stand
    ctx.fillStyle='#444'; ctx.fillRect(x+w/2-2,y+h,4,4);
  }

  private plant(ctx: CanvasRenderingContext2D, x: number, y: number, size: number = 14) {
    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(x,y+3,size*0.6,size*0.25,0,0,Math.PI*2); ctx.fill();
    // Pot
    ctx.fillStyle='#b8a48a';
    ctx.beginPath(); ctx.moveTo(x-size*0.3,y-size*0.1); ctx.lineTo(x+size*0.3,y-size*0.1); ctx.lineTo(x+size*0.22,y+3); ctx.lineTo(x-size*0.22,y+3); ctx.closePath(); ctx.fill();
    // Leaves (star pattern)
    ctx.fillStyle='#3d8c4a';
    for (let i=0;i<7;i++) {
      const a=(i*Math.PI*2)/7-Math.PI/2;
      ctx.beginPath();
      ctx.ellipse(x+Math.cos(a)*size*0.45, y-size*0.4+Math.sin(a)*size*0.35, size*0.35, size*0.14, a, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.fillStyle='#2d6e38';
    for (let i=0;i<5;i++) {
      const a=(i*Math.PI*2)/5;
      ctx.beginPath();
      ctx.ellipse(x+Math.cos(a)*size*0.25, y-size*0.5+Math.sin(a)*size*0.2, size*0.22, size*0.1, a, 0, Math.PI*2);
      ctx.fill();
    }
  }

  private whiteboard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, text: string) {
    ctx.fillStyle='#f5f5f0'; ctx.fillRect(x,y,w,h);
    ctx.strokeStyle='#bbb'; ctx.lineWidth=1; ctx.strokeRect(x,y,w,h);
    ctx.fillStyle='#555'; ctx.font='bold 6px sans-serif'; ctx.textAlign='center'; ctx.fillText(text,x+w/2,y+h/2+2); ctx.textAlign='left';
  }

  // --- RECEPTION ---
  private drawReception(ctx: CanvasRenderingContext2D, S: number) {
    const deskCenterX = T(22);
    const deskCenterY = T(33.5);
    const outerR = S * 3.8;
    const innerR = S * 2.6;

    // Curved reception desk (arc shape)
    ctx.save();
    // Drop shadow under desk
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.arc(deskCenterX, deskCenterY + 4, outerR, Math.PI * 0.16, Math.PI * 0.84);
    ctx.arc(deskCenterX, deskCenterY + 4, innerR, Math.PI * 0.84, Math.PI * 0.16, true);
    ctx.closePath();
    ctx.fill();

    // Desk main surface
    ctx.fillStyle = '#e2ded9';
    ctx.beginPath();
    ctx.arc(deskCenterX, deskCenterY, outerR, Math.PI * 0.16, Math.PI * 0.84);
    ctx.arc(deskCenterX, deskCenterY, innerR, Math.PI * 0.84, Math.PI * 0.16, true);
    ctx.closePath();
    ctx.fill();

    // Wood/glass accent rim
    ctx.strokeStyle = '#b8b0a5';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Glass privacy panel along front curved edge
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(deskCenterX, deskCenterY, outerR - 2, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
    ctx.restore();

    // Dual monitors on desk
    this.monitor(ctx, T(20.6), deskCenterY + innerR + 4, 13, 8);
    this.monitor(ctx, T(22.8), deskCenterY + innerR + 4, 13, 8);

    // Receptionist chair behind desk
    this.chair(ctx, deskCenterX, deskCenterY + innerR - 10, 0, 9);

    // Receptionist BOT character
    this.drawReceptionBot(ctx, deskCenterX, deskCenterY + innerR - 8);

    // Visitor waiting area (left side)
    this.chair(ctx, T(17), T(35), Math.PI / 2, 9);
    this.chair(ctx, T(17), T(37), Math.PI / 2, 9);
    // Coffee table with magazine
    ctx.fillStyle = '#a8a29e';
    ctx.beginPath();
    ctx.arc(T(18.2), T(36), 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(T(18.0) - 3, T(36) - 2, 6, 4);

    // Visitor waiting area (right side)
    this.chair(ctx, T(27), T(35), -Math.PI / 2, 9);
    this.chair(ctx, T(27), T(37), -Math.PI / 2, 9);
    ctx.fillStyle = '#a8a29e';
    ctx.beginPath();
    ctx.arc(T(25.8), T(36), 8, 0, Math.PI * 2);
    ctx.fill();

    // Large decorative reception plants
    this.plant(ctx, T(16.5), T(39.5), 18);
    this.plant(ctx, T(27.5), T(39.5), 18);

    // Entrance welcome chevron / arrow
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(T(22), T(42.6));
    ctx.lineTo(T(21.2), T(43.4));
    ctx.lineTo(T(21.7), T(43.4));
    ctx.lineTo(T(21.7), T(44.2));
    ctx.lineTo(T(22.3), T(44.2));
    ctx.lineTo(T(22.3), T(43.4));
    ctx.lineTo(T(22.8), T(43.4));
    ctx.closePath();
    ctx.fill();
  }

  // --- RECEPTIONIST BOT CHARACTER & SPEECH BUBBLE ---
  private drawReceptionBot(ctx: CanvasRenderingContext2D, bx: number, by: number) {
    const distToPlayer = Math.hypot(this.state.player.x - bx, this.state.player.y - (by + 40));
    const isPlayerNear = distToPlayer < 145;

    // Subtle breathing / floating animation
    const bob = Math.sin(this.state.tick * 0.08) * 1.5;
    const currentY = by + bob;

    ctx.save();

    // Bot Body (Suit & chassis)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(bx - 7, currentY - 2, 14, 12, 3);
    ctx.fill();

    // Blue receptionist tie / collar
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(bx - 1.5, currentY - 1, 3, 7);

    // Glowing core / nametag badge
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(bx + 4, currentY + 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Bot Head
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(bx - 6, currentY - 14, 12, 11, 3);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Digital Visor / Eyes (Cyan LED with blink animation)
    const isBlinking = this.state.tick % 150 > 142;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bx - 5, currentY - 11, 10, 5);

    if (!isBlinking) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(bx - 4, currentY - 10, 3, 3);
      ctx.fillRect(bx + 1, currentY - 10, 3, 3);
      // Eye glow
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.fillRect(bx - 5, currentY - 11, 10, 5);
    } else {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(bx - 4, currentY - 9, 8, 1);
    }

    // Antenna with pulsating orb
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx, currentY - 14);
    ctx.lineTo(bx, currentY - 19);
    ctx.stroke();

    const pulseGlow = Math.sin(this.state.tick * 0.15) * 0.5 + 0.5;
    ctx.fillStyle = isPlayerNear ? '#22c55e' : '#38bdf8';
    ctx.beginPath();
    ctx.arc(bx, currentY - 20, 2.5 + pulseGlow, 0, Math.PI * 2);
    ctx.fill();

    // Headset Microphone
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(bx + 6, currentY - 8, 4, Math.PI * 0.5, Math.PI * 1.5, true);
    ctx.lineTo(bx + 2, currentY - 6);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(bx + 2, currentY - 6, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Bot Arms (Waving if player is near!)
    if (isPlayerNear) {
      const waveAngle = Math.sin(this.state.tick * 0.25) * 0.35 - 0.4;
      ctx.save();
      ctx.translate(bx + 8, currentY + 1);
      ctx.rotate(waveAngle);
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(0, -2, 9, 4, 2);
      ctx.fill();
      // Little hand
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(9, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Resting arms
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(bx - 8, currentY + 1, 3, 6);
      ctx.fillRect(bx + 5, currentY + 1, 3, 6);
    }

    ctx.restore();

    // --- SPEECH BUBBLE: "Hello sir!" ---
    if (isPlayerNear) {
      ctx.save();
      const bubbleX = bx;
      const bubbleY = currentY - 44;
      const bubbleW = 100;
      const bubbleH = 34;

      // Soft glow / shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.roundRect(bubbleX - bubbleW / 2 + 2, bubbleY + 2, bubbleW, bubbleH, 7);
      ctx.fill();

      // Bubble Body
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(bubbleX - bubbleW / 2, bubbleY, bubbleW, bubbleH, 7);
      ctx.fill();

      // Cyan accent border
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Speech bubble pointer tail
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(bubbleX - 5, bubbleY + bubbleH);
      ctx.lineTo(bubbleX, bubbleY + bubbleH + 7);
      ctx.lineTo(bubbleX + 5, bubbleY + bubbleH);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(bubbleX - 5, bubbleY + bubbleH);
      ctx.lineTo(bubbleX, bubbleY + bubbleH + 7);
      ctx.lineTo(bubbleX + 5, bubbleY + bubbleH);
      ctx.stroke();

      // Bot Text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      
      const newLeadsCount = this.agencyManager?.getState().leads.filter(l => l.status === 'new').length || 0;
      if (newLeadsCount > 0) {
          ctx.fillText(`Sir, ${newLeadsCount} new client`, bubbleX, bubbleY + 14);
          ctx.fillStyle = '#64748b';
          ctx.font = '600 7px sans-serif';
          ctx.fillText('inquiries waiting! 📩', bubbleX, bubbleY + 26);
      } else {
          ctx.fillText('Hello sir! 👋', bubbleX, bubbleY + 14);
          ctx.fillStyle = '#64748b';
          ctx.font = '600 7px sans-serif';
          ctx.fillText('Welcome to Aeethod', bubbleX, bubbleY + 26);
      }

      ctx.restore();
    }
  }

  // --- MEETING ROOM ---
  private drawMeetingRoom(ctx: CanvasRenderingContext2D, S: number) {
    // Long conference table
    this.desk(ctx, T(16.5), T(4), S*10, S*4, '#e8e4de');
    // "PLAN & MEETING ROOM" label on table
    ctx.fillStyle='#888'; ctx.font='bold 8px sans-serif'; ctx.textAlign='center';
    ctx.fillText('PLAN &', T(21.5), T(5.5));
    ctx.fillText('MEETING ROOM', T(21.5), T(6.8));
    ctx.textAlign='left';

    // 8 chairs around table (3 top, 3 bottom, 1 left head, 1 right head)
    for (let i=0;i<3;i++) { this.chair(ctx, T(18+i*2.5), T(3.3), Math.PI, 10); this.chair(ctx, T(18+i*2.5), T(8.7), 0, 10); }
    this.chair(ctx, T(15.8), T(6), Math.PI/2, 10);
    this.chair(ctx, T(27.2), T(6), -Math.PI/2, 10);

    // Whiteboard on top wall
    this.whiteboard(ctx, T(17), T(1.2), S*9, 14, 'PROJECT ROADMAP');

    // Side cabinets
    this.desk(ctx, T(14.2), T(3), 10, S*5, '#bbb');
    this.desk(ctx, T(29.2), T(3), 10, S*5, '#bbb');
  }

  // --- DEVELOPMENT ROOM (Enriched Hello Kitty Themed Battlestation & Spider-Man Desk) ---
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

    // 🪑 Custom Hello Kitty Ergonomic Racing Gaming Chair on LEFT Side
    this.drawThemedGamingChair(ctx, kMainX - 16, kMainY + kMainH / 2, Math.PI / 2, 'kitty');


    // =========================================================================
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

    // 🪑 Custom Spider-Man Hero Racing Gaming Chair on LEFT Side
    this.drawThemedGamingChair(ctx, sMainX - 16, sMainY + sMainH / 2, Math.PI / 2, 'spiderman');

    // Top Wall Architecture Whiteboard
    this.whiteboard(ctx, T(5), T(1.2), S * 5, 14, '</> CODE ARCHITECTURE');
  }

  // --- DESIGN ROOM (Luxury All-White Architectural L-Shaped Boss Desk & Studio PC) ---
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

    // 2. High-End Creative Studio Computer on Pristine White Desk
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

    // 3. Custom White & Gold Luxury Master Designer Gaming Throne
    this.drawThemedGamingChair(ctx, mainX + mainW + 14, mainY + mainH / 2, -Math.PI / 2, 'white_gold');

    // 4. Luxury Visitor Armchairs on the LEFT Side (Facing Right towards Boss Desk)
    this.chair(ctx, mainX - 16, mainY + S * 1.2, Math.PI / 2, 10);
    this.chair(ctx, mainX - 16, mainY + mainH - S * 1.2, Math.PI / 2, 10);
  }

  // --- MANAGEMENT ROOM (Big Luxury U-Shaped Executive Table & Command PC) ---
  private drawManagementRoom(ctx: CanvasRenderingContext2D, S: number) {
    const cx = T(DIAMOND_CX), cy = T(DIAMOND_CY);
    const distToPC = Math.hypot(this.state.player.x - cx, this.state.player.y - (cy - S * 1.5));
    const isNearPC = distToPC < 70;

    // =========================================================================
    // 👑 BIG U-SHAPED EXECUTIVE TABLE
    // =========================================================================
    // Dimensions
    const topW = S * 7.2; // 115px wide top horizontal bridge
    const topH = S * 1.8; // 29px tall
    const topX = cx - topW / 2;
    const topY = cy - S * 2.4;

    const wingW = S * 1.8; // 29px wide left and right wings
    const wingH = S * 4.6; // 74px long vertical wings extending downwards
    const leftX = topX;
    const leftY = topY;

    const rightX = topX + topW - wingW;
    const rightY = topY;

    ctx.save();

    // 1. Soft Ambient Occlusion / Drop Shadow for entire U-Table
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.beginPath();
    ctx.roundRect(topX + 4, topY + 4, topW, topH, 3);
    ctx.roundRect(leftX + 4, leftY + 4, wingW, wingH, 3);
    ctx.roundRect(rightX + 4, rightY + 4, wingW, wingH, 3);
    ctx.fill();

    // 2. Executive Tabletop (Dark Obsidian & Smoked Ash with Brass Trim)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(topX, topY, topW, topH, 2);
    ctx.roundRect(leftX, leftY, wingW, wingH, 2);
    ctx.roundRect(rightX, rightY, wingW, wingH, 2);
    ctx.fill();

    // Polished Champagne Gold / Brass Perimeter Trim
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(topX, topY, topW, topH, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(leftX, leftY, wingW, wingH, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(rightX, rightY, wingW, wingH, 2);
    ctx.stroke();

    // Seamless Mitered Corner Junction Blends (Removes interior dividing lines)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(leftX + 2, topY + 2, wingW - 4, topH - 4);
    ctx.fillRect(rightX + 2, topY + 2, wingW - 4, topH - 4);

    // Executive Inlaid Leather Blotters
    // Top Desk Center Blotter
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - S * 1.8, topY + 5, S * 3.6, topH - 10);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - S * 1.8, topY + 5, S * 3.6, topH - 10);

    // Left Wing Blotter
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(leftX + 5, topY + topH + 6, wingW - 10, wingH - topH - 16);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(leftX + 5, topY + topH + 6, wingW - 10, wingH - topH - 16);

    // Right Wing Blotter
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(rightX + 5, topY + topH + 6, wingW - 10, wingH - topH - 16);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(rightX + 5, topY + topH + 6, wingW - 10, wingH - topH - 16);


    // =========================================================================
    // 🖥️ 3. HIGH-TECH COMMAND PC (On Top of the U-Table)
    // =========================================================================
    const pcX = cx;
    const pcY = topY + 4;

    // Ultrawide Curved Studio Monitor (Centered on top span)
    ctx.fillStyle = '#090d12';
    ctx.fillRect(pcX - 26, pcY + 2, 52, 14);
    ctx.strokeStyle = isNearPC ? '#38bdf8' : '#d4af37';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pcX - 26, pcY + 2, 52, 14);

    // Live Executive Agency Analytics Screen
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(pcX - 24, pcY + 4, 48, 10);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(pcX - 22, pcY + 5, 12, 8); // Window 1 (Projects)
    ctx.fillStyle = '#22c55e'; ctx.fillRect(pcX - 8, pcY + 5, 16, 8);  // Window 2 (Revenue Chart)
    ctx.fillStyle = '#fbbf24'; ctx.fillRect(pcX + 10, pcY + 5, 12, 8); // Window 3 (Quests)

    // Warm Architectural Lightbar Glow behind monitor
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.beginPath();
    ctx.ellipse(pcX, pcY + 10, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Executive Keyboard on Leather Blotter
    ctx.fillStyle = '#334155';
    ctx.fillRect(pcX - 14, topY + topH - 9, 28, 6);
    ctx.fillStyle = isNearPC ? '#38bdf8' : '#cbd5e1';
    for (let k = 0; k < 4; k++) {
      ctx.fillRect(pcX - 12 + k * 6, topY + topH - 8, 4, 2);
      ctx.fillRect(pcX - 12 + k * 6, topY + topH - 5, 4, 2);
    }
    // Precision Mouse
    ctx.fillStyle = '#64748b';
    ctx.fillRect(pcX + 17, topY + topH - 8, 4, 6);

    // Workstation Tower PC with Breathing RGB Strip (on top-right of U-table)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(topX + topW - 22, topY + 4, 14, 20);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(topX + topW - 22, topY + 4, 14, 20);
    const rgbHue = (this.state.tick * 2) % 360;
    ctx.fillStyle = `hsl(${rgbHue}, 90%, 60%)`;
    ctx.fillRect(topX + topW - 20, topY + 7, 2, 14);

    // CEO Ceramic Coffee Mug
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath(); ctx.arc(topX + 16, topY + 12, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.beginPath(); ctx.arc(topX + 16, topY + 12, 2.2, 0, Math.PI * 2); ctx.fill();
    const steamY = (this.state.tick * 0.3) % 8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath(); ctx.arc(topX + 16, topY + 8 - steamY, 1.2, 0, Math.PI * 2); ctx.fill();

    ctx.restore();

    // =========================================================================
    // 🪑 4. SEATING
    // =========================================================================
    // High-Backed CEO Executive Boss Chair (Behind the top desk, facing down into U-cockpit)
    this.chair(ctx, cx, topY - 14, 0, 13);

    // Executive Wing Chairs along the Left and Right Wings
    // Left Wing Chairs (Facing Right into the U)
    this.chair(ctx, leftX - 14, leftY + S * 1.8, Math.PI / 2, 10);
    this.chair(ctx, leftX - 14, leftY + S * 3.4, Math.PI / 2, 10);

    // Right Wing Chairs (Facing Left into the U)
    this.chair(ctx, rightX + wingW + 14, rightY + S * 1.8, -Math.PI / 2, 10);
    this.chair(ctx, rightX + wingW + 14, rightY + S * 3.4, -Math.PI / 2, 10);
  }

  // --- CLIENT MANAGEMENT ROOM ---
  private drawClientRoom(ctx: CanvasRenderingContext2D, S: number) {
    // Workstations along left wall
    this.desk(ctx, T(2), T(26), S*2, S*10, '#ddd');
    for (let i=0;i<3;i++) {
      const y = T(27.5+i*3);
      if (i === 1) {
        // Main Client Management PC (T(3.5), T(30.5))
        // Emerald aura glow
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.beginPath();
        ctx.arc(T(3.5), y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Dual monitor setup
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(T(2.2), y - 10, 14, 18);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(T(2.5), y - 8, 10, 14);

        // Desk accessories / contract folder
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(T(3.4), y + 4, 8, 6);

        this.chair(ctx, T(5), y+2, -Math.PI/2, 10);
      } else {
        this.monitor(ctx, T(2.3), y-5, 10, 12);
        this.chair(ctx, T(5), y+2, -Math.PI/2, 9);
      }
    }

    // Round consultation table (4 chairs)
    ctx.fillStyle='#ccc'; ctx.beginPath(); ctx.arc(T(8),T(32),S*1.2,0,Math.PI*2); ctx.fill();
    this.chair(ctx, T(6.5),T(32), Math.PI/2, 9);
    this.chair(ctx, T(9.5),T(32), -Math.PI/2, 9);
    this.chair(ctx, T(8),T(30.5), Math.PI, 9);
    this.chair(ctx, T(8),T(33.5), 0, 9);
    


    // Filing cabinets near wall
    this.desk(ctx, T(2), T(38), S*1.5, S*3, '#b8b0a5');
  }

  // --- CONTENT MANAGEMENT ROOM ---
  private drawContentRoom(ctx: CanvasRenderingContext2D, S: number) {
    // Creator workstations
    this.desk(ctx, T(32), T(26), S*2, S*10, '#ddd');
    for (let i=0;i<3;i++) {
      const y = T(27.5+i*3);
      this.monitor(ctx, T(32.3), y-5, 10, 12);
      this.chair(ctx, T(35), y+2, -Math.PI/2, 9);

    }

    // CONTENT CALENDAR board on right wall
    ctx.fillStyle='#f8f4ee'; ctx.fillRect(T(37), T(25), S*4.5, S*8);
    ctx.strokeStyle='#d4a030'; ctx.lineWidth=2; ctx.strokeRect(T(37), T(25), S*4.5, S*8);
    ctx.fillStyle='#d4a030'; ctx.font='bold 7px sans-serif'; ctx.textAlign='center';
    ctx.fillText('CONTENT', T(39.2), T(26));
    ctx.fillText('CALENDAR', T(39.2), T(27));
    ctx.textAlign='left';
    // Grid lines
    ctx.strokeStyle='#ddd'; ctx.lineWidth=0.5;
    for (let i=1;i<7;i++) { ctx.beginPath(); ctx.moveTo(T(37),T(27+i)); ctx.lineTo(T(41.5),T(27+i)); ctx.stroke(); }
    for (let i=1;i<4;i++) { ctx.beginPath(); ctx.moveTo(T(37+i*1.1),T(27)); ctx.lineTo(T(37+i*1.1),T(33)); ctx.stroke(); }
    // Sticky notes on calendar
    const stickies = ['#fff9c4','#ffccbc','#c8e6c9','#bbdefb','#e1bee7','#fff9c4','#ffccbc','#c8e6c9'];
    for (let i=0;i<8;i++) { ctx.fillStyle=stickies[i]; ctx.fillRect(T(37.3+(i%3)*1.4), T(27.5+Math.floor(i/3)*2), 10, 10); }

    // Breakout round table
    ctx.fillStyle='#ccc'; ctx.beginPath(); ctx.arc(T(36),T(38),S*1.1,0,Math.PI*2); ctx.fill();
    this.chair(ctx, T(34.8),T(38), Math.PI/2, 9);
    this.chair(ctx, T(37.2),T(38), -Math.PI/2, 9);
    this.chair(ctx, T(36),T(36.8), Math.PI, 9);
    this.chair(ctx, T(36),T(39.2), 0, 9);
  }

  // --- CORNER PLANTS ---
  private drawCornerPlants(ctx: CanvasRenderingContext2D, S: number) {
    // Outer corner plants (as in blueprint)
    this.plant(ctx, T(1.5), T(1.5), 16);    // Top-left corner
    this.plant(ctx, T(42.5), T(1.5), 16);   // Top-right corner
    this.plant(ctx, T(1.5), T(42.5), 16);   // Bottom-left corner
    this.plant(ctx, T(42.5), T(42.5), 16);  // Bottom-right corner

    // Dev room corners
    this.plant(ctx, T(11), T(1.5), 14);
    this.plant(ctx, T(11), T(19), 14);
    this.plant(ctx, T(1.5), T(19), 14);

    // Design room corners
    this.plant(ctx, T(32.5), T(1.5), 14);
    this.plant(ctx, T(42), T(19), 14);

    // Meeting room plants
    this.plant(ctx, T(14.5), T(1.5), 14);
    this.plant(ctx, T(29), T(1.5), 14);

    // Client/Content room plants
    this.plant(ctx, T(1.5), T(23.5), 14);
    this.plant(ctx, T(42), T(23.5), 14);
    this.plant(ctx, T(1.5), T(41), 14);
    this.plant(ctx, T(42), T(41), 14);

    // Open area scattered items (small objects like in blueprint)
    // Laptops, papers etc. in corridors
    ctx.fillStyle='#ccc'; ctx.fillRect(T(17),T(25),8,6); // laptop
    ctx.fillStyle='#bbb'; ctx.fillRect(T(26),T(25),8,6);
    ctx.fillStyle='#ddd'; ctx.fillRect(T(10),T(30),6,8); // paper
    ctx.fillStyle='#ddd'; ctx.fillRect(T(33),T(30),6,8);
  }

  // --- WALLS & DOORS ---
  private drawWallsAndDoors(ctx: CanvasRenderingContext2D, S: number) {
    const isInsideMgmt = this.state.activeRoom === 'Management Room';
    const alerts = isInsideMgmt && this.agencyManager ? this.agencyManager.getDepartmentAlerts() : [];
    const alertPulse = (Math.sin(this.state.tick * 0.14) * 0.5 + 0.5);

    // Map department alerts
    const roomAlertMap = new Map<string, typeof alerts[0]>();
    for (const a of alerts) {
      roomAlertMap.set(a.room, a);
    }

    const getWallRoom = (tx: number, ty: number): string | null => {
      // Dev Room perimeter & partitions (top-left)
      if (tx <= 12 && ty <= 20) return 'dev';
      // Design Room perimeter & partitions (top-right)
      if (tx >= 31 && ty <= 20) return 'design';
      // Meeting Room perimeter & partitions (top-center)
      if (tx >= 13 && tx <= 30 && ty <= 10) return 'meeting';
      // Client Management Room (bottom-left)
      if (tx <= 13 && ty >= 22 && ty <= 43) return 'client';
      // Content Management Room (bottom-right)
      if (tx >= 30 && ty >= 22 && ty <= 43) return 'content';
      return null;
    };

    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        const tile = this.map[ty][tx];
        const px = tx * S, py = ty * S;

        if (tile.isWall) {
          const wallRoom = getWallRoom(tx, ty);
          const alert = wallRoom ? roomAlertMap.get(wallRoom) : null;

          if (alert) {
            const isRed = alert.severity === 'red';
            const glowColor = isRed ? '#ef4444' : '#eab308';
            const glowAlpha = 0.45 + alertPulse * 0.45;

            // Glowing Alert Wall Shadow
            ctx.fillStyle = isRed ? 'rgba(239, 68, 68, 0.35)' : 'rgba(234, 179, 8, 0.3)';
            ctx.fillRect(px, py + 1, S, S + 2);

            // Alert Wall Body (Dark chassis with glowing neon LED core)
            ctx.fillStyle = isRed ? '#2b1013' : '#272007';
            ctx.fillRect(px, py, S, S);

            // Pulsating Neon LED core panel
            ctx.fillStyle = isRed ? `rgba(239, 68, 68, ${glowAlpha})` : `rgba(234, 179, 8, ${glowAlpha})`;
            ctx.fillRect(px + 2.5, py + 2.5, S - 5, S - 5);

            // Outer glowing neon outline
            ctx.strokeStyle = glowColor;
            ctx.lineWidth = 1.5 + alertPulse * 1;
            ctx.strokeRect(px + 1, py + 1, S - 2, S - 2);

            // Top neon highlight edge
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 3, py + 3, S - 6, 1.5);
          } else {
            // Standard sleek metallic wall
            ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(px + 1, py + 2, S, S);
            ctx.fillStyle = '#2a2a2a'; ctx.fillRect(px, py, S, S);
            ctx.fillStyle = '#3a3a3a'; ctx.fillRect(px + 2, py + 2, S - 4, S - 4);
            ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(px, py, S, 1.5); ctx.fillRect(px, py, 1.5, S);
          }
        }

        if (tile.isDoor) {
          const d = DOORS.find(dd => dd.x === tx && dd.y === ty);
          const isOpen = d ? this.state.doors[d.id] : false;
          if (isOpen) {
            // Brass threshold
            ctx.fillStyle = '#c8a050'; ctx.fillRect(px, py + S - 3, S, 3);
            // Green indicator
            ctx.fillStyle = '#4ade80'; ctx.beginPath(); ctx.arc(px + 5, py + 5, 3, 0, Math.PI * 2); ctx.fill();
          } else {
            // Closed door
            ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(px + 1, py + 2, S, S);
            ctx.fillStyle = '#444'; ctx.fillRect(px, py, S, S);
            // Frosted glass
            ctx.fillStyle = 'rgba(140,180,210,0.4)'; ctx.fillRect(px + 3, py + 3, S - 6, S - 6);
            // Handle
            ctx.fillStyle = '#d4a030'; ctx.fillRect(px + 4, py + S / 2 - 3, 4, 6);
            // Card reader LED
            ctx.fillStyle = '#60a5fa'; ctx.beginPath(); ctx.arc(px + S - 5, py + 5, 2.5, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
    }
    // Outer border
    const MW = MAP_WIDTH * S, MH = MAP_HEIGHT * S;
    ctx.strokeStyle = 'rgba(100,100,100,0.5)'; ctx.lineWidth = 4; ctx.strokeRect(0, 0, MW, MH);
  }

  // --- PLAYER & CHARACTER RENDERING ---
  public localPlayerInfo?: { name: string; role: string; color: string; character?: CharacterSetup };

  private drawCustomCharacter(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    char?: CharacterSetup,
    name?: string,
    role?: string,
    color?: string
  ) {
    const skin = char?.skinTone || '#ffdbac';
    const hair = char?.hairColor || '#0f172a';
    const style = char?.hairStyle || 'classic';
    const outfit = char?.outfit || 'executive_suit';
    const aura = char?.auraColor || color || '#f59e0b';
    const acc = char?.accessory || 'none';

    // 1. Ambient Floor Aura
    const auraGrad = ctx.createRadialGradient(x, y + 8, 3, x, y + 8, 20);
    auraGrad.addColorStop(0, aura + '66');
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(x, y + 8, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y + 8, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Body / Outfit
    const outfitColors: Record<string, { p: string; s: string; t: string }> = {
      executive_suit: { p: '#0f172a', s: '#ffffff', t: '#f59e0b' },
      kitty_hoodie: { p: '#f472b6', s: '#fce7f3', t: '#db2777' },
      spider_jacket: { p: '#1e3a8a', s: '#dc2626', t: '#38bdf8' },
      studio_turtleneck: { p: '#18181b', s: '#10b981', t: '#71717a' },
      emerald_trench: { p: '#064e3b', s: '#047857', t: '#fbbf24' },
    };
    const o = outfitColors[outfit] || outfitColors.executive_suit;

    ctx.fillStyle = o.p;
    ctx.fillRect(x - 6, y - 6, 12, 14);

    // Shirt & Tie/Trim
    ctx.fillStyle = o.s;
    ctx.fillRect(x - 2, y - 6, 4, 6);
    ctx.fillStyle = o.t;
    ctx.fillRect(x - 1, y - 4, 2, 5);

    // Hands
    ctx.fillStyle = skin;
    ctx.fillRect(x - 8, y + 2, 2, 3);
    ctx.fillRect(x + 6, y + 2, 2, 3);

    // 4. Head (Skin Tone)
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(x, y - 11, 5, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 2.5, y - 11.5, 1, 1.5);
    ctx.fillRect(x + 1.5, y - 11.5, 1, 1.5);

    // 5. Hair & Style
    ctx.fillStyle = hair;
    if (style === 'classic') {
      ctx.beginPath();
      ctx.arc(x, y - 13, 5, Math.PI, Math.PI * 2);
      ctx.fill();
    } else if (style === 'spiky') {
      ctx.beginPath();
      ctx.moveTo(x - 5, y - 12);
      ctx.lineTo(x - 3, y - 18);
      ctx.lineTo(x, y - 14);
      ctx.lineTo(x + 3, y - 18);
      ctx.lineTo(x + 5, y - 12);
      ctx.closePath();
      ctx.fill();
    } else if (style === 'fade') {
      ctx.beginPath();
      ctx.arc(x, y - 13.5, 4.5, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 4.5, y - 13.5, 9, 2);
    } else if (style === 'bun') {
      ctx.beginPath();
      ctx.arc(x, y - 13, 5, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y - 18, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 'cyber_visor') {
      ctx.beginPath();
      ctx.arc(x, y - 13, 5, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(x - 4, y - 12, 8, 2.5);
    } else if (style === 'executive_cap') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - 6, y - 16, 12, 4);
      ctx.fillRect(x - 7, y - 13, 14, 1.5);
    }

    // 6. Held Accessory
    if (acc === 'coffee') {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 8, y, 3, 5);
    } else if (acc === 'laptop') {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x - 9, y - 1, 4, 5);
    } else if (acc === 'hologram') {
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(x + 8, y + 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (acc === 'contract') {
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 7, y - 1, 4, 6);
    } else if (acc === 'vip_badge') {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 2, y - 2, 2, 3);
    }

    // 7. Floating Name & Role Badge
    if (name) {
      ctx.save();
      const roleLabel = role ? `[${role}] ` : '';
      const nameTag = `${roleLabel}${name}`;
      ctx.font = 'bold 8px sans-serif';
      const tw = ctx.measureText(nameTag).width;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(x - (tw + 10) / 2, y - 27, tw + 10, 12, 3);
      ctx.fill();
      ctx.strokeStyle = aura || '#38bdf8';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText(nameTag, x, y - 18);
      ctx.restore();
    }
  }

  // --- PLAYER ---
  private drawPlayer(ctx: CanvasRenderingContext2D) {
    const px = this.state.player.x;
    const py = this.state.player.y;
    const pInfo = this.localPlayerInfo;
    this.drawCustomCharacter(
      ctx,
      px,
      py,
      pInfo?.character,
      pInfo?.name || 'You',
      pInfo?.role || 'Founder',
      pInfo?.color || '#f59e0b'
    );
  }

  // --- MULTIPLAYER REMOTE PLAYERS ---
  private drawRemotePlayers(ctx: CanvasRenderingContext2D) {
    for (const rp of this.remotePlayers.values()) {
      const rx = rp.x;
      const ry = rp.y;

      this.drawCustomCharacter(
        ctx,
        rx,
        ry,
        rp.character,
        rp.name,
        rp.role,
        rp.color
      );

      // Speech Bubble if recent chat
      if (rp.lastMessage && Date.now() - rp.lastMessage.timestamp < 6000) {
        ctx.save();
        const msg = rp.lastMessage.text;
        ctx.font = 'bold 9px sans-serif';
        const mw = Math.min(ctx.measureText(msg).width + 16, 160);
        ctx.fillStyle = 'rgba(10, 15, 26, 0.95)';
        ctx.beginPath();
        ctx.roundRect(rx - mw / 2, ry - 50, mw, 18, 4);
        ctx.fill();
        ctx.strokeStyle = rp.color || '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Speech bubble triangle tail
        ctx.beginPath();
        ctx.moveTo(rx - 3, ry - 32);
        ctx.lineTo(rx, ry - 28);
        ctx.lineTo(rx + 3, ry - 32);
        ctx.closePath();
        ctx.fillStyle = rp.color || '#38bdf8';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(msg.length > 22 ? msg.slice(0, 21) + '…' : msg, rx, ry - 38);
        ctx.restore();
      }
    }
  }

  // --- ROOM LABELS ---
  private drawLabels(ctx: CanvasRenderingContext2D, S: number) {
    const label = (text: string, x: number, y: number) => {
      ctx.fillStyle='rgba(0,0,0,0.6)';
      ctx.beginPath(); ctx.roundRect(x-40,y-7,80,14,3); ctx.fill();
      ctx.fillStyle='#ccc'; ctx.font='bold 7px sans-serif'; ctx.textAlign='center'; ctx.fillText(text,x,y+3); ctx.textAlign='left';
    };
    label('DEVELOPMENT', T(6), T(11));
    label('PLAN & MEETING', T(22), T(2.5));
    label('DESIGN ROOM', T(37), T(11));
    label('MANAGEMENT', T(22), T(20));
    label('CLIENT MGMT', T(7), T(35));
    label('CONTENT MGMT', T(37), T(35));
    label('RECEPTION', T(22), T(42));
  }

  // --- INTERACTION PROMPTS ---
  private drawDoorPrompts(ctx: CanvasRenderingContext2D) {
    const interaction = this.getNearestInteraction();
    if (!interaction) return;

    const promptX = interaction.x;
    const promptY = interaction.y - 28 + Math.sin(this.state.tick * 0.1) * 2;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    const w = ctx.measureText(interaction.text).width + 30;
    ctx.beginPath();
    ctx.roundRect(promptX - w / 2, promptY - 12, w, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(interaction.text, promptX, promptY + 4);
    ctx.textAlign = 'left';
    ctx.restore();
  }
}