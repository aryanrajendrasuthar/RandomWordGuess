import { useState, useCallback, useRef } from 'react';
import type { GameState, GuessEntry, LeaderboardEntry } from '../types';

const API = '/api/game';

const initialState = (): GameState => ({
  sessionId: null,
  category: null,
  wordLength: 0,
  guesses: [],
  guessCount: 0,
  hintsRemaining: 3,
  hintsUsed: 0,
  hintDisplay: null,
  won: false,
  gaveUp: false,
  secretWord: null,
  isLoading: false,
  isDaily: false,
});

export function useGame() {
  const [game, setGame] = useState<GameState>(initialState);
  const [error, setError] = useState<string | null>(null);
  // Use a ref to read current game state synchronously inside callbacks
  const gameRef = useRef(game);
  gameRef.current = game;

  const startGame = useCallback(async (daily = false) => {
    setError(null);
    setGame({ ...initialState(), isLoading: true });
    try {
      const res = await fetch(`${API}/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daily }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGame(prev => ({
        ...prev,
        sessionId: data.sessionId,
        category: data.category,
        wordLength: data.wordLength,
        hintsRemaining: data.hintsRemaining,
        isLoading: false,
        isDaily: daily,
      }));
    } catch (e: any) {
      setError(e.message || 'Failed to start game');
      setGame(initialState());
    }
  }, []);

  const submitGuess = useCallback(async (guess: string) => {
    const current = gameRef.current;
    if (!current.sessionId || current.isLoading || current.won || current.gaveUp) return;

    const normalized = guess.trim().toLowerCase();
    if (!normalized) return;

    if (current.guesses.some(g => g.word === normalized)) {
      setError('You already guessed that word!');
      return;
    }

    setError(null);
    setGame(prev => ({ ...prev, isLoading: true }));

    try {
      const res = await fetch(`${API}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: current.sessionId, guess: normalized }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Guess failed');
        setGame(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const entry: GuessEntry = {
        word: normalized,
        score: data.score,
        guessNumber: data.guessCount,
      };

      setGame(prev => ({
        ...prev,
        isLoading: false,
        guesses: [...prev.guesses, entry].sort((a, b) => b.score - a.score),
        guessCount: data.guessCount,
        won: data.won,
        secretWord: data.won ? data.secretWord : prev.secretWord,
      }));

      if (data.won) {
        saveToLeaderboard({
          date: new Date().toISOString().split('T')[0],
          guesses: data.guessCount,
          hints: current.hintsUsed,
          word: data.secretWord,
          daily: current.isDaily,
        });
      }
    } catch (e: any) {
      setError(e.message || 'Network error');
      setGame(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const getHint = useCallback(async () => {
    const current = gameRef.current;
    if (!current.sessionId || current.hintsRemaining <= 0 || current.won || current.gaveUp) return;

    try {
      const res = await fetch(`${API}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: current.sessionId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setGame(prev => ({
        ...prev,
        hintDisplay: data.hint,
        hintsRemaining: data.hintsRemaining,
        hintsUsed: data.hintsUsed,
      }));
    } catch {
      setError('Failed to get hint');
    }
  }, []);

  const giveUp = useCallback(async () => {
    const current = gameRef.current;
    if (!current.sessionId) return;

    try {
      const res = await fetch(`${API}/giveup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: current.sessionId }),
      });
      const data = await res.json();
      setGame(prev => ({ ...prev, gaveUp: true, secretWord: data.secretWord }));
    } catch {
      setError('Network error');
    }
  }, []);

  return { game, error, setError, startGame, submitGuess, getHint, giveUp };
}

function saveToLeaderboard(entry: LeaderboardEntry) {
  try {
    const existing: LeaderboardEntry[] = JSON.parse(
      localStorage.getItem('wordaura_leaderboard') || '[]'
    );
    existing.unshift(entry);
    localStorage.setItem('wordaura_leaderboard', JSON.stringify(existing.slice(0, 50)));
  } catch {}
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    return JSON.parse(localStorage.getItem('wordaura_leaderboard') || '[]');
  } catch {
    return [];
  }
}
