import React, { useState, useEffect } from 'react';
import type { Tile, TileType } from '../logic/GameEngine';
import { createTileSet, getTurtleLayout, isTileSelectable, areTilesMatching, TILE_THICKNESS } from '../logic/GameEngine';

const tileIcons: Record<string, string> = {
  character: '萬',
  bamboo: '竹',
  dot: '筒',
  wind: '風',
  dragon: '龍',
  flower: '花',
  season: '季'
};

interface GameBoardProps {
  tileCount: number;
  onWin: () => void;
}

const BirdIcon = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <path d="M30,70 Q40,40 60,50 Q80,60 90,40" stroke="#2d5a27" strokeWidth="6" fill="none" />
    <path d="M60,50 Q70,80 50,95" stroke="#2d5a27" strokeWidth="6" fill="none" />
    <circle cx="35" cy="55" r="5" fill="#dc143c" />
    <path d="M55,50 L75,30" stroke="#2d5a27" strokeWidth="4" />
    <path d="M20,80 L40,70" stroke="#2d5a27" strokeWidth="4" />
  </svg>
);

const DragonRedIcon = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <text x="50" y="65" textAnchor="middle" fontSize="70" fontWeight="900" fill="#dc143c" style={{ fontFamily: 'serif' }}>中</text>
    <rect x="15" y="15" width="70" height="70" fill="none" stroke="#dc143c" strokeWidth="4" rx="4" />
  </svg>
);

const DragonGreenIcon = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <text x="50" y="65" textAnchor="middle" fontSize="70" fontWeight="900" fill="#2d5a27" style={{ fontFamily: 'serif' }}>發</text>
  </svg>
);

const DragonWhiteIcon = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <rect x="15" y="15" width="70" height="70" fill="none" stroke="#1e90ff" strokeWidth="6" rx="4" strokeDasharray="8 4" />
    <rect x="25" y="25" width="50" height="50" fill="none" stroke="#1e90ff" strokeWidth="2" rx="2" />
  </svg>
);

const WindIcon: React.FC<{ value: string }> = ({ value }) => {
  const windChars: Record<string, string> = { E: '東', S: '南', W: '西', N: '北' };
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <text x="50" y="70" textAnchor="middle" fontSize="60" fontWeight="900" fill="#333" style={{ fontFamily: 'serif' }}>{windChars[value] || value}</text>
    </svg>
  );
};

const FlowerIcon = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <path d="M50,20 Q60,40 50,60 Q40,40 50,20" fill="#ff69b4" />
    <path d="M50,20 Q60,40 50,60 Q40,40 50,20" fill="#ff69b4" transform="rotate(72 50 50)" />
    <path d="M50,20 Q60,40 50,60 Q40,40 50,20" fill="#ff69b4" transform="rotate(144 50 50)" />
    <path d="M50,20 Q60,40 50,60 Q40,40 50,20" fill="#ff69b4" transform="rotate(216 50 50)" />
    <path d="M50,20 Q60,40 50,60 Q40,40 50,20" fill="#ff69b4" transform="rotate(288 50 50)" />
    <circle cx="50" cy="50" r="8" fill="#ffd700" />
  </svg>
);

const TileContent: React.FC<{ type: TileType; value: number | string }> = ({ type, value }) => {
  if (type === 'dragon') {
    if (value === 'R') return <DragonRedIcon />;
    if (value === 'G') return <DragonGreenIcon />;
    return <DragonWhiteIcon />;
  }
  if (type === 'wind') return <WindIcon value={value as string} />;
  if (type === 'bamboo' && value === 1) return <BirdIcon />;
  if (type === 'flower' || type === 'season') return <FlowerIcon />;

  const iconText = tileIcons[type];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, height: '100%', justifyContent: 'center' }}>
      <span style={{ fontSize: '0.6em', opacity: 0.7, color: '#666' }}>{iconText}</span>
      <span style={{ fontSize: '1.4rem', color: type === 'character' ? '#dc143c' : (type === 'bamboo' ? '#2d5a27' : '#1e90ff') }}>{value}</span>
    </div>
  );
};

const GameBoard: React.FC<GameBoardProps> = ({ tileCount, onWin }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector('.game-container');
      if (!container) return;
      
      const { width, height } = container.getBoundingClientRect();
      const boardWidth = 600; // Total width including some padding
      const boardHeight = 440; // Total height including some padding
      
      const scaleX = (width - 40) / boardWidth;
      const scaleY = (height - 40) / boardHeight;
      setScale(Math.min(scaleX, scaleY, 1.5)); // Don't scale too much
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [tileCount]);

  const initializeGame = () => {
    const tileSet = createTileSet();
    const layout = getTurtleLayout(tileCount);
    
    // Shuffle tiles and match them to layout
    const shuffledSet = [...tileSet].sort(() => Math.random() - 0.5);
    const newTiles: Tile[] = layout.map((pos, i) => ({
      id: `tile-${i}`,
      type: shuffledSet[i % shuffledSet.length].type,
      value: shuffledSet[i % shuffledSet.length].value,
      ...pos,
      isMatched: false,
      isVisible: true,
    }));

    setTiles(newTiles);
    setSelectedId(null);
  };

  const handleTileClick = (tile: Tile) => {
    if (!isTileSelectable(tile, tiles)) return;

    if (selectedId === tile.id) {
      setSelectedId(null);
      return;
    }

    if (!selectedId) {
      setSelectedId(tile.id);
      return;
    }

    const firstTile = tiles.find(t => t.id === selectedId);
    if (firstTile && areTilesMatching(firstTile, tile)) {
      setTiles((prev: Tile[]) => prev.map((t: Tile) => 
        (t.id === firstTile.id || t.id === tile.id) 
          ? { ...t, isMatched: true } 
          : t
      ));
      setSelectedId(null);
      
      // Check win condition
      if (tiles.length > 0 && tiles.filter((t: Tile) => !t.isMatched).length === 2) {
        onWin();
      }
    } else {
      setSelectedId(tile.id);
    }
  };

  return (
    <div className="board-wrapper">
      <div className="board" style={{ transform: `scale(${scale})` }}>
        {tiles.map(tile => (
          <div
            key={tile.id}
            className={`tile v-${tile.type} ${tile.isMatched ? 'matched' : ''} ${selectedId === tile.id ? 'selected' : ''} ${isTileSelectable(tile, tiles) ? 'selectable' : 'blocked'}`}
            style={{
              left: `${tile.x * 22}px`,
              top: `${tile.y * 22}px`,
              zIndex: tile.z * 10 + tile.y,
              transform: `translate3d(0, 0, ${tile.z * TILE_THICKNESS}px)`,
              padding: '4px'
            }}
            onClick={() => handleTileClick(tile)}
          >
            <TileContent type={tile.type} value={tile.value} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
