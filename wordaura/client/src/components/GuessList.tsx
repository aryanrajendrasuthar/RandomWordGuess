import React from 'react';
import type { GuessEntry } from '../types';
import ScoreBar from './ScoreBar';

interface Props {
  guesses: GuessEntry[];
}

function scoreColor(score: number): string {
  if (score <= 30) return 'text-red-400';
  if (score <= 60) return 'text-orange-400';
  if (score <= 80) return 'text-yellow-400';
  if (score < 100) return 'text-green-400';
  return 'text-yellow-300';
}

export default function GuessList({ guesses }: Props) {
  if (guesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-600">
        <div className="text-4xl mb-3">🔮</div>
        <p className="text-sm">Your guesses will appear here, sorted by score</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {guesses.map((g, idx) => (
        <div
          key={`${g.word}-${g.guessNumber}`}
          className="flex items-center gap-3 bg-gray-800/60 rounded-xl px-4 py-3 border border-gray-700/50 animate-slide-down"
          style={{ animationDelay: `${idx * 30}ms` }}
        >
          <span className="text-gray-500 text-xs w-6 text-right shrink-0">#{g.guessNumber}</span>
          <span className="font-semibold text-gray-100 w-28 shrink-0 capitalize">{g.word}</span>
          <ScoreBar score={g.score} />
          <span className={`font-bold text-sm w-12 text-right shrink-0 ${scoreColor(g.score)}`}>
            {g.score}%
          </span>
        </div>
      ))}
    </div>
  );
}
