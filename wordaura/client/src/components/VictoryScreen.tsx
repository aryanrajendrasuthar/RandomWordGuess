import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { GuessEntry } from '../types';

interface Props {
  secretWord: string;
  guessCount: number;
  hintsUsed: number;
  isDaily: boolean;
  guesses: GuessEntry[];
  onPlayAgain: () => void;
}

function buildShareText(guessCount: number, guesses: GuessEntry[], isDaily: boolean): string {
  const emojiMap = (score: number) => {
    if (score <= 30) return '🟥';
    if (score <= 60) return '🟧';
    if (score <= 80) return '🟨';
    if (score < 100) return '🟩';
    return '🏆';
  };

  const sorted = [...guesses].sort((a, b) => a.guessNumber - b.guessNumber);
  const emojis = sorted.map(g => emojiMap(g.score)).join('');
  const tag = isDaily ? 'WordAura Daily' : 'WordAura';
  return `I solved ${tag} in ${guessCount} guesses!\n${emojis}\nPlay at wordaura.app`;
}

export default function VictoryScreen({ secretWord, guessCount, hintsUsed, isDaily, guesses, onPlayAgain }: Props) {
  useEffect(() => {
    const end = Date.now() + 2500;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const shareText = buildShareText(guessCount, guesses, isDaily);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText).then(() => alert('Copied to clipboard!'));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-yellow-400/30 rounded-2xl p-8 max-w-md w-full text-center animate-bounce-in shadow-2xl shadow-yellow-400/10">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold text-yellow-300 mb-2">You got it!</h2>
        <p className="text-gray-400 mb-6">The secret word was</p>
        <div className="text-4xl font-black text-white uppercase tracking-widest mb-6 py-3 px-6 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
          {secretWord}
        </div>
        <div className="flex justify-center gap-6 text-sm text-gray-300 mb-8">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-white">{guessCount}</span>
            <span className="text-gray-500">Guesses</span>
          </div>
          <div className="w-px bg-gray-700" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-white">{hintsUsed}</span>
            <span className="text-gray-500">Hints used</span>
          </div>
          {isDaily && (
            <>
              <div className="w-px bg-gray-700" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-blue-400">Daily</span>
                <span className="text-gray-500">Mode</span>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>📤</span> Share
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-xl font-bold transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
