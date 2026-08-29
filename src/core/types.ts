export type Direction = 'up' | 'down' | 'left' | 'right';

export type BiomeType = 'grass' | 'forest' | 'desert' | 'snow' | 'swamp' | 'volcanic';

export type ResourceType =
  | 'iron'
  | 'copper'
  | 'coal'
  | 'stone'
  | 'wood'
  | 'oil'
  | 'water'
  | 'uranium';

export type ItemType =
  | ResourceType
  | 'iron_plate'
  | 'copper_plate'
  | 'steel_plate'
  | 'gear'
  | 'circuit'
  | 'advanced_circuit'
  | 'battery'
  | 'plastic'
  | 'conveyor_belt'
  | 'inserter_item'
  | 'miner_item'
  | 'furnace_item'
  | 'storage_item'
  | 'power_pole_item';

export type BuildingType =
  | 'miner'
  | 'furnace'
  | 'assembler'
  | 'conveyor'
  | 'inserter'
  | 'storage'
  | 'power_pole';

export interface Tile {
  x: number;
  y: number;
  biome: BiomeType;
  resource: ResourceType | null;
  resourceAmount: number;
  resourceYield: 'normal' | 'rich' | 'very_rich' | 'depleted';
  building: Building | null;
  pollution: number;
  visibility: number;
  isWall?: boolean;
  isDoor?: boolean;
}

export interface Building {
  id: string;
  type: BuildingType;
  x: number;
  y: number;
  dir: Direction;
  progress: number;
  recipe?: string;
  inventory: Record<string, number>;
  outputInventory?: Record<string, number>;
  energy?: number;
  maxEnergy?: number;
}

export interface ConveyorState {
  item: string;
  progress: number;
}

export interface Player {
  x: number;
  y: number;
  speed: number;
  inventory: Record<string, number>;
  miningProgress: number;
  targetTile: { x: number; y: number } | null;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  time: number;
  inputs: Record<string, number>;
  outputs: Record<string, number>;
}

export interface Door {
  id: string;
  x: number;
  y: number;
  isOpen: boolean;
  name: string;
  isVertical?: boolean;
}

export interface GameState {
  tick: number;
  worldSeed: number;
  player: Player;
  doors: Record<string, boolean>;
  activeRoom: string;
  camera: { x: number; y: number; zoom: number };
  buildings: Map<string, Building>;
  conveyors: Map<string, ConveyorState[]>;
  statistics: {
    itemsProduced: Record<string, number>;
    itemsConsumed: Record<string, number>;
    playtime: number;
  };
}
