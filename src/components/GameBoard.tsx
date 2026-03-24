import { useState, useEffect } from 'react';
import type { Tile } from '../logic/GameEngine';
import { createTileSet, getTurtleLayout, isTileSelectable, areTilesMatching, TILE_THICKNESS } from '../logic/GameEngine';

interface GameBoardProps {
  tileCount: number;
  onWin: () => void;
}

const tileIcons: Record<string, string> = {
  character: '萬',
  bamboo: '竹',
  dot: '筒',
  wind: '風',
  dragon: '龍',
  flower: '花',
  season: '季'
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
      setTiles(prev => prev.map(t => 
        (t.id === firstTile.id || t.id === tile.id) 
          ? { ...t, isMatched: true } 
          : t
      ));
      setSelectedId(null);
      
      // Check win condition
      if (tiles.length > 0 && tiles.filter(t => !t.isMatched).length === 2) {
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
              transform: `translate3d(0, 0, ${tile.z * TILE_THICKNESS}px)`
            }}
            onClick={() => handleTileClick(tile)}
          >
            {tileIcons[tile.type]}{tile.value}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
