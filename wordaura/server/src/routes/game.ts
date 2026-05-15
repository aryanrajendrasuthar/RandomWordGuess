import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createGame,
  getSession,
  recordGuess,
  useHint,
} from '../services/gameService';
import { computeSimilarity } from '../services/embeddingService';

const router = Router();

const guessLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) => req.body?.sessionId || req.ip || 'unknown',
  message: { error: 'Too many guesses. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});

router.post('/new', (req: Request, res: Response) => {
  const daily = req.body?.daily === true;
  const session = createGame(daily);
  res.json({
    sessionId: session.sessionId,
    category: session.category,
    wordLength: session.secretWord.length,
    hintsRemaining: session.hintsRemaining,
  });
});

router.post('/guess', guessLimiter, async (req: Request, res: Response) => {
  const { sessionId, guess } = req.body;

  if (!sessionId || !guess) {
    return res.status(400).json({ error: 'sessionId and guess are required' });
  }

  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (!session.active) return res.status(400).json({ error: 'Game is already over' });

  const normalized = guess.trim().toLowerCase();
  if (!normalized || !/^[a-zA-Z\s-]+$/.test(normalized)) {
    return res.status(400).json({ error: 'Invalid guess — letters only' });
  }

  if (session.guesses.has(normalized)) {
    return res.status(400).json({ error: 'You already guessed that word', duplicate: true });
  }

  try {
    const score = await computeSimilarity(session.secretWord, normalized);
    const won = normalized === session.secretWord || score === 100;
    recordGuess(session, normalized);

    if (won) {
      session.active = false;
      return res.json({
        score: 100,
        won: true,
        guessCount: session.guessCount,
        secretWord: session.secretWord,
        hintsUsed: session.hintsUsed,
      });
    }

    res.json({
      score,
      won: false,
      guessCount: session.guessCount,
    });
  } catch (err: any) {
    console.error('Embedding error:', err);
    res.status(500).json({ error: 'Failed to compute similarity. Please try again.' });
  }
});

router.post('/hint', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (!session.active) return res.status(400).json({ error: 'Game is over' });

  try {
    const hintDisplay = useHint(session);
    res.json({
      hint: hintDisplay,
      hintsRemaining: session.hintsRemaining,
      hintsUsed: session.hintsUsed,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/giveup', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.active = false;
  res.json({ secretWord: session.secretWord, guessCount: session.guessCount });
});

export default router;
