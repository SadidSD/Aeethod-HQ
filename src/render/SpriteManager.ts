import { TILE_SIZE, BUILDING_SIZES } from '../core/constants';
import { BuildingType } from '../core/types';

function createCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function ctx(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  return g;
}

function hash(x: number, y: number, seed: number = 0): number {
  let h = seed + x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) >>> 0;
}

function hashf(x: number, y: number, seed: number = 0): number {
  return (hash(x, y, seed) & 0xffff) / 0xffff;
}

function valueNoise(x: number, y: number, scale: number, seed: number): number {
  const sx = x / scale, sy = y / scale;
  const ix = Math.floor(sx), iy = Math.floor(sy);
  const fx = sx - ix, fy = sy - iy;
  const wx = fx * fx * (3 - 2 * fx);
  const wy = fy * fy * (3 - 2 * fy);
  const n00 = hashf(ix, iy, seed);
  const n10 = hashf(ix + 1, iy, seed);
  const n01 = hashf(ix, iy + 1, seed);
  const n11 = hashf(ix + 1, iy + 1, seed);
  return n00 * (1 - wx) * (1 - wy) + n10 * wx * (1 - wy) + n01 * (1 - wx) * wy + n11 * wx * wy;
}

function fbmNoise(x: number, y: number, octaves: number, seed: number): number {
  let val = 0, amp = 0.5, freq = 1, maxVal = 0;
  for (let i = 0; i < octaves; i++) {
    val += valueNoise(x * freq, y * freq, 4, seed + i * 1000) * amp;
    maxVal += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return val / maxVal;
}

interface BiomeParams {
  baseR: number; baseG: number; baseB: number;
  noiseR: number; noiseG: number; noiseB: number;
  noiseScale: number;
  detailAmount: number;
  detailColor: [number, number, number];
}

const BIOME_PARAMS: Record<string, BiomeParams> = {
  grass: {
    baseR: 44, baseG: 50, baseB: 60,
    noiseR: 6, noiseG: 6, noiseB: 8,
    noiseScale: 3, detailAmount: 0.25,
    detailColor: [36, 42, 52],
  },
  forest: {
    baseR: 86, baseG: 58, baseB: 36,
    noiseR: 10, noiseG: 6, noiseB: 5,
    noiseScale: 4, detailAmount: 0.4,
    detailColor: [62, 40, 24],
  },
  desert: {
    baseR: 165, baseG: 170, baseB: 176,
    noiseR: 8, noiseG: 8, noiseB: 8,
    noiseScale: 5, detailAmount: 0.2,
    detailColor: [185, 190, 196],
  },
  snow: {
    baseR: 205, baseG: 215, baseB: 225,
    noiseR: 6, noiseG: 6, noiseB: 8,
    noiseScale: 6, detailAmount: 0.15,
    detailColor: [225, 235, 245],
  },
  swamp: {
    baseR: 30, baseG: 45, baseB: 68,
    noiseR: 6, noiseG: 8, noiseB: 12,
    noiseScale: 4, detailAmount: 0.3,
    detailColor: [22, 34, 54],
  },
  volcanic: {
    baseR: 68, baseG: 44, baseB: 36,
    noiseR: 10, noiseG: 6, noiseB: 5,
    noiseScale: 4, detailAmount: 0.35,
    detailColor: [88, 54, 44],
  },
};

function generateTerrainTile(biome: string, variantX: number, variantY: number): HTMLCanvasElement {
  const c = createCanvas(TILE_SIZE, TILE_SIZE);
  const g = ctx(c);
  const seed = variantX * 10007 + variantY * 31 + 42;
  const imgData = g.createImageData(TILE_SIZE, TILE_SIZE);

  const isHardwood = biome === 'forest';

  for (let py = 0; py < TILE_SIZE; py++) {
    for (let px = 0; px < TILE_SIZE; px++) {
      const wx = variantX * TILE_SIZE + px;
      const wy = variantY * TILE_SIZE + py;

      const n1 = fbmNoise(wx, wy, 3, seed);
      const n2 = valueNoise(wx * 2, wy * 2, 2, seed + 333);

      let r: number, g2: number, b: number;

      if (isHardwood) {
        // Executive Dark Mahogany / Teak Hardwood
        r = 78 + (n1 - 0.5) * 10;
        g2 = 52 + (n1 - 0.5) * 8;
        b = 34 + (n1 - 0.5) * 6;

        const plankY = py % 8;
        if (plankY === 0) {
          r *= 0.65; g2 *= 0.65; b *= 0.65;
        } else {
          const grain = Math.sin(wx * 0.4 + n1 * 5) * 0.5 + 0.5;
          r += (grain - 0.5) * 12;
          g2 += (grain - 0.5) * 8;
          b += (grain - 0.5) * 5;
        }
      } else {
        // Silver / Platinum metallic base
        r = 208 + (n1 - 0.5) * 8;
        g2 = 216 + (n1 - 0.5) * 8;
        b = 224 + (n1 - 0.5) * 10;

        if ((px + py) % 2 === 0) {
          r += (n2 - 0.5) * 4;
          g2 += (n2 - 0.5) * 4;
          b += (n2 - 0.5) * 4;
        }

        const isOuterBorder = (px === 0 || py === 0);
        const isInnerBorder = (px === TILE_SIZE - 1 || py === TILE_SIZE - 1);
        const isHighlight = (px === 1 || py === 1);

        if (isOuterBorder) {
          r *= 0.76; g2 *= 0.76; b *= 0.78;
        } else if (isInnerBorder) {
          r *= 0.84; g2 *= 0.84; b *= 0.86;
        } else if (isHighlight) {
          r = Math.min(255, r + 18);
          g2 = Math.min(255, g2 + 18);
          b = Math.min(255, b + 20);
        }
      }

      const idx = (py * TILE_SIZE + px) * 4;
      imgData.data[idx] = Math.max(0, Math.min(255, r | 0));
      imgData.data[idx + 1] = Math.max(0, Math.min(255, g2 | 0));
      imgData.data[idx + 2] = Math.max(0, Math.min(255, b | 0));
      imgData.data[idx + 3] = 255;
    }
  }

  g.putImageData(imgData, 0, 0);
  return c;
}

function generateOfficeProp(variant: number): HTMLCanvasElement {
  const c = createCanvas(TILE_SIZE, TILE_SIZE + 8);
  const g = ctx(c);
  const propType = variant % 6;
  const cx = TILE_SIZE / 2;
  const groundY = TILE_SIZE + 2;

  switch (propType) {
    case 0: {
      // Potted Office Plant
      g.fillStyle = 'rgba(0,0,0,0.22)';
      g.beginPath();
      g.ellipse(cx, groundY, 8, 3, 0, 0, Math.PI * 2);
      g.fill();

      const potW = 12, potH = 10, potTop = groundY - potH;
      g.fillStyle = '#dcdad5';
      g.beginPath();
      g.moveTo(cx - potW / 2, potTop);
      g.lineTo(cx + potW / 2, potTop);
      g.lineTo(cx + potW / 2 - 1.5, groundY);
      g.lineTo(cx - potW / 2 + 1.5, groundY);
      g.closePath();
      g.fill();

      g.fillStyle = '#f0eee8';
      g.fillRect(cx - potW / 2 - 1, potTop - 2, potW + 2, 3);
      g.fillStyle = '#3a2718';
      g.fillRect(cx - potW / 2, potTop, potW, 2);

      g.strokeStyle = '#2d5a22';
      g.lineWidth = 1.5;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(cx, potTop);
      g.lineTo(cx, potTop - 18);
      g.moveTo(cx - 1, potTop);
      g.quadraticCurveTo(cx - 5, potTop - 8, cx - 7, potTop - 15);
      g.moveTo(cx + 1, potTop);
      g.quadraticCurveTo(cx + 4, potTop - 9, cx + 8, potTop - 14);
      g.stroke();

      const drawLeaf = (lx: number, ly: number, angle: number, size: number, color: string, hl: string) => {
        g.save();
        g.translate(lx, ly);
        g.rotate(angle);
        g.fillStyle = color;
        g.beginPath();
        g.ellipse(0, 0, size * 1.6, size * 0.9, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = hl;
        g.beginPath();
        g.ellipse(-size * 0.3, -size * 0.2, size * 0.9, size * 0.35, -0.2, 0, Math.PI * 2);
        g.fill();
        g.restore();
      };
      drawLeaf(cx - 8, potTop - 15, -0.5, 4.5, '#1e6822', '#389e3e');
      drawLeaf(cx + 9, potTop - 14, 0.6, 4.2, '#185e1c', '#2f8c35');
      drawLeaf(cx - 1, potTop - 19, -0.1, 4.8, '#267d2b', '#48b84e');
      break;
    }

    case 1: {
      // Workstation Desk & Monitors
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.fillRect(cx - 14, groundY - 2, 28, 5);

      g.fillStyle = '#1c2024';
      g.beginPath();
      g.roundRect(cx - 5, groundY - 22, 10, 11, 3);
      g.fill();

      g.fillStyle = '#4a5568';
      g.fillRect(cx - 13, groundY - 10, 2, 11);
      g.fillRect(cx + 11, groundY - 10, 2, 11);

      g.fillStyle = '#8c6848';
      g.fillRect(cx - 14, groundY - 11, 28, 4);
      g.fillStyle = '#a6805d';
      g.fillRect(cx - 14, groundY - 11, 28, 1);

      g.fillStyle = '#1a202c';
      g.fillRect(cx - 11, groundY - 24, 13, 10);
      g.fillStyle = '#0284c7';
      g.fillRect(cx - 9, groundY - 22, 9, 6);
      g.fillStyle = '#38bdf8';
      g.fillRect(cx - 8, groundY - 21, 5, 1);
      g.fillRect(cx - 8, groundY - 19, 7, 1);

      g.fillStyle = '#1a202c';
      g.fillRect(cx + 3, groundY - 23, 9, 9);
      g.fillStyle = '#047857';
      g.fillRect(cx + 4, groundY - 22, 7, 7);

      g.fillStyle = '#cbd5e1';
      g.fillRect(cx - 6, groundY - 10, 8, 2);
      break;
    }

    case 2: {
      // Water Cooler
      g.fillStyle = 'rgba(0,0,0,0.22)';
      g.beginPath();
      g.ellipse(cx, groundY, 7, 3, 0, 0, Math.PI * 2);
      g.fill();

      const coolerW = 10, coolerH = 16, coolerTop = groundY - coolerH;
      g.fillStyle = '#e2e8f0';
      g.beginPath();
      g.roundRect(cx - coolerW / 2, coolerTop, coolerW, coolerH, 2);
      g.fill();

      g.fillStyle = '#475569';
      g.fillRect(cx - 3.5, coolerTop + 4, 7, 6);
      g.fillStyle = '#ef4444';
      g.fillRect(cx - 2.5, coolerTop + 4.5, 2, 2);
      g.fillStyle = '#3b82f6';
      g.fillRect(cx + 0.5, coolerTop + 4.5, 2, 2);

      const bottleW = 8, bottleH = 10, bottleTop = coolerTop - bottleH;
      g.fillStyle = 'rgba(56, 189, 248, 0.85)';
      g.beginPath();
      g.roundRect(cx - bottleW / 2, bottleTop, bottleW, bottleH, [4, 4, 1, 1]);
      g.fill();
      g.fillStyle = 'rgba(186, 230, 253, 0.9)';
      g.fillRect(cx - bottleW / 2 + 1, bottleTop + 2, 2, bottleH - 4);
      break;
    }

    case 3: {
      // Laser Copier
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.fillRect(cx - 9, groundY - 2, 18, 5);

      const copW = 14, copH = 18, copTop = groundY - copH;
      g.fillStyle = '#334155';
      g.fillRect(cx - copW / 2, copTop + 8, copW, 10);
      g.fillStyle = '#f1f5f9';
      g.beginPath();
      g.roundRect(cx - copW / 2, copTop + 2, copW, 6, 1);
      g.fill();
      g.fillStyle = '#0f172a';
      g.fillRect(cx + 1, copTop + 2.5, 5, 4);
      g.fillStyle = '#38bdf8';
      g.fillRect(cx + 1.5, copTop + 3, 4, 2.5);
      g.fillStyle = '#22c55e';
      g.fillRect(cx + 5, copTop + 1, 1.5, 1.5);
      break;
    }

    case 4: {
      // Coffee Machine
      g.fillStyle = 'rgba(0,0,0,0.22)';
      g.fillRect(cx - 10, groundY - 2, 20, 5);

      g.fillStyle = '#5c4033';
      g.fillRect(cx - 9, groundY - 8, 18, 8);
      g.fillStyle = '#7a5542';
      g.fillRect(cx - 10, groundY - 9, 20, 2);

      const cmTop = groundY - 21;
      g.fillStyle = '#1e293b';
      g.beginPath();
      g.roundRect(cx - 6, cmTop, 12, 12, 2);
      g.fill();
      g.fillStyle = '#94a3b8';
      g.fillRect(cx - 5, cmTop + 1, 10, 3);
      g.fillStyle = '#451a03';
      g.fillRect(cx - 2.5, cmTop + 7.5, 5, 2.5);
      g.fillStyle = '#ffffff';
      g.fillRect(cx + 4, groundY - 13, 3, 4);
      break;
    }

    case 5:
    default: {
      // Filing Cabinet
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.fillRect(cx - 8, groundY - 2, 16, 5);

      const cabW = 12, cabH = 20, cabTop = groundY - cabH;
      g.fillStyle = '#334155';
      g.beginPath();
      g.roundRect(cx - cabW / 2, cabTop, cabW, cabH, 1);
      g.fill();

      for (let d = 0; d < 3; d++) {
        const dy = cabTop + 1 + d * 6.2;
        g.fillStyle = '#475569';
        g.fillRect(cx - cabW / 2 + 1, dy, cabW - 2, 5.5);
        g.fillStyle = '#cbd5e1';
        g.fillRect(cx - 2, dy + 2.5, 4, 1);
      }
      g.fillStyle = '#d97706';
      g.fillRect(cx - 4, cabTop - 2, 8, 2);
      break;
    }
  }

  return c;
}

function generateBuilding(type: BuildingType): HTMLCanvasElement {
  const size = BUILDING_SIZES[type] || { w: 1, h: 1 };
  const w = size.w * TILE_SIZE;
  const h = size.h * TILE_SIZE;
  const c = createCanvas(w, h);
  const g = ctx(c);

  g.fillStyle = 'rgba(0,0,0,0.3)';
  g.fillRect(2, 2, w - 4, h - 4);

  switch (type) {
    case 'miner':
      g.fillStyle = '#475569';
      g.beginPath();
      g.roundRect(4, 4, w - 8, h - 8, 4);
      g.fill();
      g.fillStyle = '#0284c7';
      g.beginPath();
      g.arc(w / 2, h / 2, 12, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#38bdf8';
      g.beginPath();
      g.arc(w / 2, h / 2, 6, 0, Math.PI * 2);
      g.fill();
      break;

    case 'furnace':
      g.fillStyle = '#7c2d12';
      g.beginPath();
      g.roundRect(4, 4, w - 8, h - 8, 4);
      g.fill();
      g.fillStyle = '#ea580c';
      g.beginPath();
      g.arc(w / 2, h / 2, 10, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#fbbf24';
      g.beginPath();
      g.arc(w / 2, h / 2, 5, 0, Math.PI * 2);
      g.fill();
      break;

    case 'assembler':
      g.fillStyle = '#1e293b';
      g.beginPath();
      g.roundRect(4, 4, w - 8, h - 8, 6);
      g.fill();
      g.fillStyle = '#10b981';
      g.beginPath();
      g.arc(w / 2, h / 2, 16, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#34d399';
      g.beginPath();
      g.arc(w / 2, h / 2, 8, 0, Math.PI * 2);
      g.fill();
      break;

    case 'conveyor':
      g.fillStyle = '#334155';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#64748b';
      g.fillRect(4, 0, w - 8, h);
      g.fillStyle = '#f59e0b';
      g.beginPath();
      g.moveTo(w / 2, 6);
      g.lineTo(w / 2 + 5, 14);
      g.lineTo(w / 2 - 5, 14);
      g.closePath();
      g.fill();
      break;

    case 'inserter':
      g.fillStyle = '#1e293b';
      g.beginPath();
      g.arc(w / 2, h / 2, 6, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#f59e0b';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(w / 2, h / 2);
      g.lineTo(w / 2 + 8, h / 2 - 8);
      g.stroke();
      break;

    case 'storage':
      g.fillStyle = '#78350f';
      g.beginPath();
      g.roundRect(4, 4, w - 8, h - 8, 3);
      g.fill();
      g.fillStyle = '#d97706';
      g.fillRect(8, 8, w - 16, h - 16);
      break;

    case 'power_pole':
      g.fillStyle = '#3b82f6';
      g.beginPath();
      g.arc(w / 2, h / 2, 4, 0, Math.PI * 2);
      g.fill();
      break;
  }

  return c;
}

const CACHE = new Map<string, HTMLCanvasElement>();

export function getTerrainSprite(biome: string, tileX: number, tileY: number): HTMLCanvasElement {
  const vx = ((tileX % 4) + 4) % 4;
  const vy = ((tileY % 4) + 4) % 4;
  const key = `floor_${biome}_${vx}_${vy}`;
  let sprite = CACHE.get(key);
  if (!sprite) {
    sprite = generateTerrainTile(biome, vx, vy);
    CACHE.set(key, sprite);
  }
  return sprite;
}

export function getOfficePropSprite(tileX: number, tileY: number): HTMLCanvasElement {
  const variant = hash(tileX, tileY, 42) % 6;
  const key = `prop_${variant}`;
  let sprite = CACHE.get(key);
  if (!sprite) {
    sprite = generateOfficeProp(variant);
    CACHE.set(key, sprite);
  }
  return sprite;
}

export function getBuildingSprite(type: BuildingType): HTMLCanvasElement {
  const key = `bld_${type}`;
  let sprite = CACHE.get(key);
  if (!sprite) {
    sprite = generateBuilding(type);
    CACHE.set(key, sprite);
  }
  return sprite;
}
