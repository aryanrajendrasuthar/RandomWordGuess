import React from 'react';
import type { LeaderboardEntry } from '../types';
import { getLeaderboard } from '../hooks/useGame';

interface Props {
  onClose: () => void;
}

export default function Leaderboard({ onClose }: Props) {
  const entries = getLeaderboard();

  return (
    <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full animate-fade-in shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">🏅 Leaderboard</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl">✕</button>
        </div>
        {entries.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No games played yet. Win a game to appear here!</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
            {entries.map((e, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-800/60 rounded-xl px-4 py-3 border border-gray-700/50">
                <span className="text-gray-500 text-sm w-6 shrink-0">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white capitalize">{e.word}</span>
                    {e.daily && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Daily</span>}
                  </div>
                  <span className="text-xs text-gray-500">{e.date}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-yellow-300">{e.guesses} guesses</div>
                  <div className="text-xs text-gray-500">{e.hints} hints</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
