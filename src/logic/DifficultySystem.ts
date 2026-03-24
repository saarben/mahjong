export interface PlayerStats {
  level: number;
  experience: number;
  gamesWon: number;
  totalTime: number;
}

const STORAGE_KEY = 'mahjong_player_stats';

export const getPlayerStats = (): PlayerStats => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return { level: 1, experience: 0, gamesWon: 0, totalTime: 0 };
};

export const savePlayerStats = (stats: PlayerStats) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

export const calculateNextDifficulty = (stats: PlayerStats): number => {
  // Start with 72 tiles (half set) and increase by 8 for every few levels
  // Max 144 tiles
  const baseTiles = 64;
  const extraTiles = Math.min(80, (stats.level - 1) * 8);
  return baseTiles + extraTiles;
};

export const onGameWin = (timeInSeconds: number) => {
  const stats = getPlayerStats();
  stats.gamesWon += 1;
  stats.totalTime += timeInSeconds;
  
  // Experience gain: base 100 + bonus for speed
  const baseExp = 100;
  const speedBonus = Math.max(0, 300 - timeInSeconds);
  stats.experience += baseExp + speedBonus;

  // Level up logic (simple linear)
  const expToNextLevel = stats.level * 500;
  if (stats.experience >= expToNextLevel) {
    stats.experience -= expToNextLevel;
    stats.level += 1;
  }

  savePlayerStats(stats);
  return stats;
};
