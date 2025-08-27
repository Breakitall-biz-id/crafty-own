export interface GameState {
  playerName: string;
  currentLevel: number;
  completedLevels: number[];
  soundEnabled: boolean;
  gameStarted: boolean;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  isCompleted: boolean;
  isUnlocked: boolean;
}

export type Screen = 'splash' | 'menu' | 'nameInput' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'about' | 'profile' | 'result';

export interface Fruit {
  id: string;
  type: 'apple' | 'pear' | 'pineapple' | 'watermelon' | 'grapes';
  color: 'red' | 'yellow' | 'green';
  x: number;
  y: number;
  isDragging: boolean;
  isPlaced: boolean;
}

export interface Basket {
  id: string;
  color: 'red' | 'yellow' | 'green';
  x: number;
  y: number;
  fruits: string[];
}

export interface GameResult {
  level: number;
  stars: number;
  timeElapsed: number;
  mistakes: number;
  completed: boolean;
}