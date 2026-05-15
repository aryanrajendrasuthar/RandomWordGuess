import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGame } from './hooks/useGame';
import GuessList from './components/GuessList';
import VictoryScreen from './components/VictoryScreen';
import Leaderboard from './components/Leaderboard';

const CATEGORY_EMOJI: Record<string, string> = {
  Animal: '🐾', Place: '🌍', Person: '👤', Thing: '🔧', Food: '🍎', Nature: '🌿',
};

export default function App() {
  const { game, error, setError, startGame, submitGuess, getHint, giveUp } = useGame();
  const [inputValue, setInputValue] = useState('');
  const [showCategory, setShowCategory] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when game starts
  useEffect(() => {
    if (game.sessionId && !game.won && !game.gaveUp) {
      inputRef.current?.focus();
    }
  }, [game.sessionId, game.won, game.gaveUp]);

  // Clear error after 3 seconds
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(t);
  }, [error, setError]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const val = inputValue.trim();
    if (!val || game.isLoading || game.won || game.gaveUp) return;
    submitGuess(val);
    setInputValue('');
  }, [inputValue, game.isLoading, game.won, game.gaveUp, submitGuess]);

  const handlePlayAgain = () => {
    setInputValue('');
    startGame(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-yellow-300 to-purple-400 bg-clip-text text-transparent">
              WordAura
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLeaderboard(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-yellow-300 hover:bg-gray-800 transition-colors text-lg"
              title="Leaderboard"
            >
              🏅
            </button>
            {game.sessionId && (
              <button
                onClick={handlePlayAgain}
                className="px-3 py-1.5 text-sm bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 rounded-lg border border-yellow-400/20 transition-colors font-medium"
              >
                New Game
              </button>
            )}
            {!game.sessionId && (
              <button
                onClick={() => startGame(true)}
                className="px-3 py-1.5 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg border border-blue-500/30 transition-colors font-medium"
              >
                Daily
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Landing / Start Screen */}
        {!game.sessionId && !game.isLoading && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 py-16 text-center">
            <div className="text-6xl">🔮</div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Guess the Secret Word</h2>
              <p className="text-gray-400 max-w-sm mx-auto text-sm leading-relaxed">
                Use semantic similarity scores to narrow in on the mystery word. The closer your guess, the higher the score.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => startGame(false)}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold rounded-2xl text-lg transition-all shadow-lg shadow-yellow-400/20 active:scale-95"
              >
                New Game
              </button>
              <button
                onClick={() => startGame(true)}
                className="px-8 py-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold rounded-2xl text-lg border border-blue-500/30 transition-colors"
              >
                Daily Challenge
              </button>
            </div>
            <div className="text-xs text-gray-600 max-w-xs">
              Type a word and get a % score showing how semantically similar it is to the secret word. Reach 100% to win!
            </div>
          </div>
        )}

        {/* Loading */}
        {game.isLoading && !game.sessionId && (
          <div className="flex items-center justify-center flex-1">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400 text-sm">Starting game…</span>
            </div>
          </div>
        )}

        {/* Active Game */}
        {game.sessionId && (
          <>
            {/* Game info bar */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  Guess <span className="font-bold text-white">#{game.guessCount + 1}</span>
                </span>
                {game.isDaily && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                    Daily Challenge
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {game.category && showCategory && (
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/20">
                    {CATEGORY_EMOJI[game.category]} {game.category}
                  </span>
                )}
                <button
                  onClick={() => setShowCategory(v => !v)}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  {showCategory ? 'hide hint' : 'show category'}
                </button>
              </div>
            </div>

            {/* Word length indicator */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 mr-1">Word:</span>
              {Array.from({ length: game.wordLength }).map((_, i) => (
                <div key={i} className="w-5 h-1 bg-gray-700 rounded-full" />
              ))}
              <span className="text-xs text-gray-600 ml-1">({game.wordLength} letters)</span>
            </div>

            {/* Hint display */}
            {game.hintDisplay && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-3 text-center">
                <span className="text-xs text-purple-400 block mb-1">Hint</span>
                <span className="font-mono text-xl font-bold tracking-[0.4em] text-purple-200 uppercase">
                  {game.hintDisplay}
                </span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm animate-fade-in">
                {error}
              </div>
            )}

            {/* Revealed answer (gave up) */}
            {game.gaveUp && game.secretWord && (
              <div className="bg-gray-800 border border-gray-600 rounded-xl px-4 py-4 text-center">
                <span className="text-gray-400 text-sm block mb-1">The secret word was</span>
                <span className="text-3xl font-black uppercase tracking-widest text-white">{game.secretWord}</span>
                <div className="mt-3">
                  <button
                    onClick={handlePlayAgain}
                    className="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-xl transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}

            {/* Input form */}
            {!game.gaveUp && !game.won && (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value.replace(/[^a-zA-Z\s-]/g, ''))}
                  placeholder="Type a word and press Enter…"
                  disabled={game.isLoading}
                  className="flex-1 bg-gray-800 border border-gray-700 focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none transition-all disabled:opacity-50"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || game.isLoading}
                  className="px-5 py-3 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-bold rounded-xl transition-colors"
                >
                  {game.isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin inline-block" />
                    </span>
                  ) : '→'}
                </button>
              </form>
            )}

            {/* Hint and Give Up controls */}
            {!game.gaveUp && !game.won && (
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={getHint}
                  disabled={game.hintsRemaining <= 0 || game.isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed text-purple-300 border border-purple-500/20 rounded-xl text-sm font-medium transition-colors"
                >
                  {game.hintsRemaining <= 0 ? (
                    <>🚫 No hints remaining</>
                  ) : (
                    <>💡 Get Hint <span className="text-xs text-purple-500">({game.hintsRemaining}/3 left)</span></>
                  )}
                </button>
                <button
                  onClick={giveUp}
                  disabled={game.isLoading}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-400 border border-gray-700 rounded-xl text-sm transition-colors"
                >
                  Give Up
                </button>
              </div>
            )}

            {/* Guess list */}
            {game.guesses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-400">
                    {game.guesses.length} {game.guesses.length === 1 ? 'guess' : 'guesses'} — sorted by score
                  </h3>
                </div>
                <div className="max-h-[50vh] overflow-y-auto pr-1">
                  <GuessList guesses={game.guesses} />
                </div>
              </div>
            )}

            {game.guesses.length === 0 && !game.gaveUp && !game.won && (
              <GuessList guesses={[]} />
            )}
          </>
        )}
      </main>

      {/* Victory overlay */}
      {game.won && game.secretWord && (
        <VictoryScreen
          secretWord={game.secretWord}
          guessCount={game.guessCount}
          hintsUsed={game.hintsUsed}
          isDaily={game.isDaily}
          guesses={game.guesses}
          onPlayAgain={handlePlayAgain}
        />
      )}

      {/* Leaderboard overlay */}
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
