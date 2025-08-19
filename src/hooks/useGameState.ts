import { useState, useEffect } from 'react';
import { GameState, GameResult } from '../types/GameTypes';

const STORAGE_KEY = 'crafty-own-game-state';

const initialGameState: GameState = {
  playerName: '',
  currentLevel: 1,
  completedLevels: [],
  soundEnabled: true,
  gameStarted: false,
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  // Load game state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setGameState({ ...initialGameState, ...parsedState });
      } catch (error) {
        console.error('Error loading game state:', error);
      }
    }
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const resetGameState = () => {
    setGameState(initialGameState);
    localStorage.removeItem(STORAGE_KEY);
  };

  const canAccessLevel = (levelId: number): boolean => {
    if (levelId === 1) return true;
    return gameState.completedLevels.includes(levelId - 1);
  };

  const completeLevel = (levelId: number) => {
    if (!gameState.completedLevels.includes(levelId)) {
      const newCompletedLevels = [...gameState.completedLevels, levelId];
      updateGameState({
        completedLevels: newCompletedLevels,
        currentLevel: Math.min(levelId + 1, 10), // Assuming max 10 levels
      });
    }
  };

  const saveGameResult = (result: GameResult) => {
    const results = JSON.parse(localStorage.getItem('crafty-own-results') || '[]');
    results.push(result);
    localStorage.setItem('crafty-own-results', JSON.stringify(results));
  };

  const getGameResults = (): GameResult[] => {
    return JSON.parse(localStorage.getItem('crafty-own-results') || '[]');
  };

  return {
    gameState,
    updateGameState,
    resetGameState,
    canAccessLevel,
    completeLevel,
    saveGameResult,
    getGameResults,
  };
};