import { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import { getPlayerStats, calculateNextDifficulty, onGameWin, PlayerStats } from './logic/DifficultySystem';
import './App.css';

function App() {
  const [stats, setStats] = useState<PlayerStats>(getPlayerStats());
  const [gameId, setGameId] = useState(0); // For resetting game
  const [tileCount, setTileCount] = useState(64);
  const [startTime, setStartTime] = useState(Date.now());
  const [showWinModal, setShowWinModal] = useState(false);

  useEffect(() => {
    setTileCount(calculateNextDifficulty(stats));
  }, [stats.level]);

  const handleWin = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const newStats = onGameWin(timeTaken);
    setStats(newStats);
    setShowWinModal(true);
  };

  const startNewGame = () => {
    setGameId(prev => prev + 1);
    setStartTime(Date.now());
    setShowWinModal(false);
  };

  const expToNextLevel = stats.level * 500;
  const progressPercent = (stats.experience / expToNextLevel) * 100;

  return (
    <div className="main-wrapper">
      <header className="header">
        <h1 style={{ fontSize: '1.5rem', color: 'var(--secondary)' }}>MAHJONG PREMIUM</h1>
        <button className="btn" onClick={startNewGame}>NEW GAME</button>
      </header>

      <main className="game-container">
        <GameBoard key={gameId} tileCount={tileCount} onWin={handleWin} />
      </main>

      <footer className="stats-bar">
        <div className="level-text">
          <span>Level {stats.level}</span>
          <span>{stats.experience} / {expToNextLevel} EXP</span>
        </div>
        <div className="progress-container">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.8, textAlign: 'center' }}>
          Difficulty: {tileCount} tiles | Wins: {stats.gamesWon}
        </div>
      </footer>

      {showWinModal && (
        <div className="modal">
          <h2 style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>VICTORY!</h2>
          <p style={{ marginBottom: '1.5rem' }}>You've mastered this level. Your skills are growing!</p>
          <button className="btn" onClick={startNewGame}>NEXT LEVEL</button>
        </div>
      )}
    </div>
  );
}

export default App;
