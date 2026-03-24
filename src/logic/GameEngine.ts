export type TileType = 'bamboo' | 'dot' | 'character' | 'wind' | 'dragon' | 'flower' | 'season';

export interface Tile {
  id: string;
  type: TileType;
  value: number | string;
  x: number;
  y: number;
  z: number;
  isMatched: boolean;
  isVisible: boolean;
}

export const TILE_WIDTH = 60;
export const TILE_HEIGHT = 80;
export const TILE_THICKNESS = 10;

// standard Mahjong set (144 tiles)
export const createTileSet = (): { type: TileType; value: number | string }[] => {
  const set: { type: TileType; value: number | string }[] = [];

  // Characters, Bamboo, Dots (1-9, 4 of each)
  for (let i = 1; i <= 9; i++) {
    for (let j = 0; j < 4; j++) {
      set.push({ type: 'character', value: i });
      set.push({ type: 'bamboo', value: i });
      set.push({ type: 'dot', value: i });
    }
  }

  // Winds (ESWN, 4 of each)
  const winds = ['E', 'S', 'W', 'N'];
  winds.forEach(w => {
    for (let j = 0; j < 4; j++) set.push({ type: 'wind', value: w });
  });

  // Dragons (Red, Green, White, 4 of each)
  const dragons = ['R', 'G', 'W'];
  dragons.forEach(d => {
    for (let j = 0; j < 4; j++) set.push({ type: 'dragon', value: d });
  });

  // Flowers (1-4)
  for (let i = 1; i <= 4; i++) set.push({ type: 'flower', value: i });

  // Seasons (1-4)
  for (let i = 1; i <= 4; i++) set.push({ type: 'season', value: i });

  return set;
};

// Turtle layout (Standard Shanghai Solitaire)
// Positions are in terms of half-tile units for easier alignment
export const getTurtleLayout = (totalTiles: number): { x: number; y: number; z: number }[] => {
  const layout: { x: number; y: number; z: number }[] = [];

  // Layer 0: 12x8 base (approx)
  // This is a simplified version of the Turtle layout
  // In a real Turtle layout, the positions are specific.
  
  // Layer 0 (Bottom)
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 12; x++) {
      // Create a diamond/turtle shape
      if ((y === 0 || y === 7) && (x < 4 || x > 7)) continue;
      if ((y === 1 || y === 6) && (x < 2 || x > 9)) continue;
      layout.push({ x: x * 2, y: y * 2, z: 0 });
    }
  }

  // Layer 1
  for (let y = 1; y < 7; y++) {
    for (let x = 3; x < 9; x++) {
      layout.push({ x: x * 2 + 1, y: y * 2 + 1, z: 1 });
    }
  }

  // Layer 2
  for (let y = 2; y < 6; y++) {
    for (let x = 4; x < 8; x++) {
      layout.push({ x: x * 2, y: y * 2, z: 2 });
    }
  }

  // Layer 3
  for (let y = 3; y < 5; y++) {
    for (let x = 5; x < 7; x++) {
      layout.push({ x: x * 2 + 1, y: y * 2 + 1, z: 3 });
    }
  }

  // Layer 4 (Top)
  layout.push({ x: 11, y: 7, z: 4 });

  // Shuffle and pick the required number of tiles
  return layout.sort(() => Math.random() - 0.5).slice(0, totalTiles);
};

export const isTileSelectable = (tile: Tile, allTiles: Tile[]): boolean => {
  if (tile.isMatched) return false;

  const activeTiles = allTiles.filter(t => !t.isMatched);

  // Check if there is a tile directly on top
  const isBlockedAbove = activeTiles.some(t => 
    t.z === tile.z + 1 && 
    Math.abs(t.x - tile.x) < 2 && 
    Math.abs(t.y - tile.y) < 2
  );
  if (isBlockedAbove) return false;

  // Check left and right
  const isBlockedLeft = activeTiles.some(t => 
    t.z === tile.z && 
    t.x === tile.x - 2 && 
    Math.abs(t.y - tile.y) < 2
  );
  const isBlockedRight = activeTiles.some(t => 
    t.z === tile.z && 
    t.x === tile.x + 2 && 
    Math.abs(t.y - tile.y) < 2
  );

  return !isBlockedLeft || !isBlockedRight;
};

export const areTilesMatching = (t1: Tile, t2: Tile): boolean => {
  if (t1.id === t2.id) return false;
  if (t1.type !== t2.type) return false;

  // Flowers and Seasons match any of their kind
  if (t1.type === 'flower' || t1.type === 'season') return true;

  return t1.value === t2.value;
};
