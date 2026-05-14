export type Category = 'Animal' | 'Place' | 'Person' | 'Thing' | 'Food' | 'Nature';

export interface GuessEntry {
  word: string;
  score: number;
  guessNumber: number;
}

export interface GameState {
  sessionId: string | null;
  category: Category | null;
  wordLength: number;
  guesses: GuessEntry[];
  guessCount: number;
  hintsRemaining: number;
  hintsUsed: number;
  hintDisplay: string | null;
  won: boolean;
  gaveUp: boolean;
  secretWord: string | null;
  isLoading: boolean;
  isDaily: boolean;
}

export interface LeaderboardEntry {
  date: string;
  guesses: number;
  hints: number;
  word: string;
  daily: boolean;
}
