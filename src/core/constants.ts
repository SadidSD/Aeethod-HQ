import { Recipe, BuildingType } from './types';

export const TILE_SIZE = 32;
export const MAP_WIDTH = 44;   // Fixed 44 tiles wide (1408px)
export const MAP_HEIGHT = 44;  // Fixed 44 tiles high (1408px)

export const BIOME_COLORS: Record<string, string> = {
  silver: '#d2d9e2',   // Circulation corridors & silver floor
  meeting: '#334155',  // Plan & Meeting Room slate
  management: '#4a3728', // Executive Dark Timber
  dev: '#1e293b',      // Development Room tech slate
  design: '#e2e8f0',   // Design Studio pristine white
  client: '#2e3846',   // Client consultation room
  content: '#253342',  // Content management room
  grass: '#d2d9e2',
  snow: '#d2d9e2',
  forest: '#4a3728',
};

export const RESOURCE_COLORS: Record<string, string> = {
  iron: '#94a3b8',
  copper: '#f59e0b',
  coal: '#334155',
  stone: '#64748b',
  wood: '#d97706',
  oil: '#1e293b',
  water: '#38bdf8',
  uranium: '#22c55e',
  iron_plate: '#cbd5e1',
  copper_plate: '#fbbf24',
  steel_plate: '#94a3b8',
  gear: '#718096',
  circuit: '#10b981',
  advanced_circuit: '#06b6d4',
  battery: '#eab308',
  plastic: '#f1f5f9',
  conveyor_belt: '#475569',
  inserter_item: '#f59e0b',
  miner_item: '#64748b',
  furnace_item: '#ea580c',
  storage_item: '#854d0e',
  power_pole_item: '#3b82f6',
};

export const BUILDING_SIZES: Record<BuildingType, { w: number; h: number }> = {
  miner: { w: 2, h: 2 },
  furnace: { w: 2, h: 2 },
  assembler: { w: 3, h: 3 },
  conveyor: { w: 1, h: 1 },
  inserter: { w: 1, h: 1 },
  storage: { w: 2, h: 2 },
  power_pole: { w: 1, h: 1 },
};

export const RECIPES: Record<string, Recipe> = {
  iron_plate: {
    id: 'iron_plate',
    name: 'Iron Plate',
    category: 'smelting',
    time: 60,
    inputs: { iron: 1 },
    outputs: { iron_plate: 1 },
  },
  copper_plate: {
    id: 'copper_plate',
    name: 'Copper Plate',
    category: 'smelting',
    time: 60,
    inputs: { copper: 1 },
    outputs: { copper_plate: 1 },
  },
  gear: {
    id: 'gear',
    name: 'Iron Gear',
    category: 'crafting',
    time: 30,
    inputs: { iron_plate: 2 },
    outputs: { gear: 1 },
  },
  circuit: {
    id: 'circuit',
    name: 'Electronic Circuit',
    category: 'crafting',
    time: 40,
    inputs: { iron_plate: 1, copper_plate: 2 },
    outputs: { circuit: 1 },
  },
  conveyor_belt: {
    id: 'conveyor_belt',
    name: 'Conveyor Belt',
    category: 'crafting',
    time: 30,
    inputs: { iron_plate: 1, gear: 1 },
    outputs: { conveyor_belt: 2 },
  },
  inserter_item: {
    id: 'inserter_item',
    name: 'Robotic Inserter',
    category: 'crafting',
    time: 40,
    inputs: { iron_plate: 1, gear: 1, circuit: 1 },
    outputs: { inserter_item: 1 },
  },
  miner_item: {
    id: 'miner_item',
    name: 'Electric Miner',
    category: 'crafting',
    time: 60,
    inputs: { iron_plate: 4, gear: 2, circuit: 2 },
    outputs: { miner_item: 1 },
  },
  furnace_item: {
    id: 'furnace_item',
    name: 'Stone Furnace',
    category: 'crafting',
    time: 50,
    inputs: { stone: 5 },
    outputs: { furnace_item: 1 },
  },
};
