import { Tile, Door } from './types';
import { MAP_WIDTH, MAP_HEIGHT } from './constants';

export interface RoomDef {
  id: string;
  name: string;
}

export const ROOMS: RoomDef[] = [
  { id: 'meeting', name: 'Plan & Meeting Room' },
  { id: 'dev', name: 'Development Room' },
  { id: 'design', name: 'Design Room' },
  { id: 'management', name: 'Management Room' },
  { id: 'client', name: 'Client Management Room' },
  { id: 'content', name: 'Content Management Room' },
  { id: 'reception', name: 'Reception & Lobby' },
];

export const DOORS: Door[] = [
  // Main Entrance (bottom center, 2-tile wide)
  { id: 'door_entrance_l', name: 'Main Entrance Left', x: 21, y: 43, isOpen: true, isVertical: false },
  { id: 'door_entrance_r', name: 'Main Entrance Right', x: 22, y: 43, isOpen: true, isVertical: false },
  // Meeting Room (two doors on south wall, near left and right edges)
  { id: 'door_meeting_l', name: 'Meeting Room West', x: 16, y: 10, isOpen: false, isVertical: false },
  { id: 'door_meeting_r', name: 'Meeting Room East', x: 27, y: 10, isOpen: false, isVertical: false },
  // Dev Room (east wall, mid height)
  { id: 'door_dev', name: 'Development Room', x: 12, y: 14, isOpen: false, isVertical: true },
  // Design Room (west wall, mid height)
  { id: 'door_design', name: 'Design Room', x: 31, y: 14, isOpen: false, isVertical: true },
  // Management Room (south side of diamond)
  { id: 'door_mgmt', name: 'Management Room', x: 22, y: 28, isOpen: false, isVertical: false },
  // Client Management Room (east partition wall)
  { id: 'door_client', name: 'Client Management', x: 13, y: 33, isOpen: false, isVertical: true },
  // Content Management Room (west partition wall)
  { id: 'door_content', name: 'Content Management', x: 30, y: 33, isOpen: false, isVertical: true },
];

// Diamond (rotated square) management room center & size
export const DIAMOND_CX = 22;
export const DIAMOND_CY = 21;
export const DIAMOND_R = 7; // half-width in tiles

export function isInsideDiamond(x: number, y: number): boolean {
  return (Math.abs(x - DIAMOND_CX) + Math.abs(y - DIAMOND_CY)) <= DIAMOND_R;
}

export function isDiamondEdge(x: number, y: number): boolean {
  const d = Math.abs(x - DIAMOND_CX) + Math.abs(y - DIAMOND_CY);
  return d === DIAMOND_R || d === DIAMOND_R - 1;
}

export function getRoomAt(x: number, y: number): string {
  if (isInsideDiamond(x, y)) return 'Management Room';
  if (x >= 14 && x <= 29 && y >= 1 && y <= 9) return 'Plan & Meeting Room';
  if (x >= 1 && x <= 11 && y >= 1 && y <= 20) return 'Development Room';
  if (x >= 32 && x <= 42 && y >= 1 && y <= 20) return 'Design Room';
  // Client room: left side, below y=22, inside the angled partition
  if (x >= 1 && x <= 12 && y >= 24 && y <= 42) return 'Client Management Room';
  // Content room: right side, below y=22, inside the angled partition
  if (x >= 31 && x <= 42 && y >= 24 && y <= 42) return 'Content Management Room';
  if (x >= 16 && x <= 27 && y >= 33 && y <= 42) return 'Reception & Lobby';
  return 'Corridor';
}

function isOnLine(x: number, y: number, x1: number, y1: number, x2: number, y2: number): boolean {
  // Check if tile (x,y) lies on the rasterized line from (x1,y1) to (x2,y2)
  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  if (steps === 0) return x === x1 && y === y1;
  for (let i = 0; i <= steps; i++) {
    const lx = Math.round(x1 + (dx * i) / steps);
    const ly = Math.round(y1 + (dy * i) / steps);
    if (lx === x && ly === y) return true;
  }
  return false;
}

export function createFixedMap(): Tile[][] {
  const map: Tile[][] = [];

  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      let isWall = false;
      let isDoorTile = false;
      let biome: Tile['biome'] = 'snow'; // default silver corridor floor

      // Check if this tile is a door
      const doorHere = DOORS.find((d) => d.x === x && d.y === y);
      if (doorHere) isDoorTile = true;

      // --- Outer perimeter walls ---
      if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
        if (!isDoorTile) isWall = true;
      }

      // --- Meeting Room (top center, y: 1..10, x: 14..29) ---
      // Left wall
      if (x === 13 && y >= 1 && y <= 10 && !isDoorTile) isWall = true;
      // Right wall
      if (x === 30 && y >= 1 && y <= 10 && !isDoorTile) isWall = true;
      // Bottom wall (with gaps for doors at x=16 and x=27)
      if (y === 10 && x >= 13 && x <= 30 && !isDoorTile) isWall = true;

      // --- Development Room (top left, y: 1..20, x: 1..12) ---
      // Right wall (east side)
      if (x === 12 && y >= 1 && y <= 20 && !isDoorTile) isWall = true;
      // Bottom wall (full width across x=1..12)
      if (y === 20 && x >= 1 && x <= 12 && !isDoorTile) isWall = true;

      // --- Design Room (top right, y: 1..20, x: 32..42) ---
      // Left wall (west side)
      if (x === 31 && y >= 1 && y <= 20 && !isDoorTile) isWall = true;
      // Bottom wall (full width across x=31..42)
      if (y === 20 && x >= 31 && x <= 42 && !isDoorTile) isWall = true;

      // --- Diamond Management Room walls ---
      if (isDiamondEdge(x, y) && !isDoorTile) {
        // Leave the south vertex area open for the door
        const d = Math.abs(x - DIAMOND_CX) + Math.abs(y - DIAMOND_CY);
        if (d === DIAMOND_R) {
          isWall = true;
        }
      }

      // --- Client Management Room (bottom left) ---
      // Angled top wall: diagonal from (8,22) to (13,27)
      if (isOnLine(x, y, 8, 22, 13, 27) && !isDoorTile) isWall = true;
      // Vertical east partition wall
      if (x === 13 && y >= 27 && y <= 38 && !isDoorTile) isWall = true;
      // Angled bottom wall: diagonal from (13,38) to (8,43)
      if (isOnLine(x, y, 13, 38, 8, 43) && !isDoorTile) isWall = true;
      // Horizontal stub connecting angle to outer wall
      if (y === 22 && x >= 1 && x <= 8 && !isDoorTile) isWall = true;

      // --- Content Management Room (bottom right, mirror) ---
      // Angled top wall: diagonal from (35,22) to (30,27)
      if (isOnLine(x, y, 35, 22, 30, 27) && !isDoorTile) isWall = true;
      // Vertical west partition wall
      if (x === 30 && y >= 27 && y <= 38 && !isDoorTile) isWall = true;
      // Angled bottom wall: diagonal from (30,38) to (35,43)
      if (isOnLine(x, y, 30, 38, 35, 43) && !isDoorTile) isWall = true;
      // Horizontal stub
      if (y === 22 && x >= 35 && x <= 42 && !isDoorTile) isWall = true;

      // --- Reception partition (subtle low wall at y=33 from x=16 to x=27) ---
      // No hard wall, just the reception area boundary

      // --- Set biome for room interiors ---
      if (x >= 14 && x <= 29 && y >= 1 && y <= 9) biome = 'snow';       // Meeting
      if (x >= 1 && x <= 11 && y >= 1 && y <= 19) biome = 'snow';       // Dev
      if (x >= 32 && x <= 42 && y >= 1 && y <= 19) biome = 'snow';      // Design
      if (isInsideDiamond(x, y)) biome = 'forest';                       // Management (dark wood)
      if (x >= 16 && x <= 27 && y >= 34 && y <= 42) biome = 'snow';     // Reception

      // Disallow door on the diamond wall door position
      if (isDoorTile && isDiamondEdge(x, y)) {
        isWall = false;
      }

      map[y][x] = {
        x,
        y,
        biome,
        resource: null,
        resourceAmount: 0,
        resourceYield: 'normal',
        building: null,
        pollution: 0,
        visibility: 1,
        isWall: isWall && !isDoorTile,
        isDoor: isDoorTile,
      };
    }
  }

  return map;
}
