import { v4 as uuidv4 } from 'uuid';

export type Category = 'Animal' | 'Place' | 'Person' | 'Thing' | 'Food' | 'Nature';

interface WordEntry {
  word: string;
  category: Category;
}

const WORD_LIST: WordEntry[] = [
  // Animals
  { word: 'lion', category: 'Animal' }, { word: 'tiger', category: 'Animal' },
  { word: 'elephant', category: 'Animal' }, { word: 'dolphin', category: 'Animal' },
  { word: 'penguin', category: 'Animal' }, { word: 'giraffe', category: 'Animal' },
  { word: 'cheetah', category: 'Animal' }, { word: 'gorilla', category: 'Animal' },
  { word: 'crocodile', category: 'Animal' }, { word: 'kangaroo', category: 'Animal' },
  { word: 'panda', category: 'Animal' }, { word: 'wolf', category: 'Animal' },
  { word: 'eagle', category: 'Animal' }, { word: 'shark', category: 'Animal' },
  { word: 'parrot', category: 'Animal' }, { word: 'octopus', category: 'Animal' },
  { word: 'butterfly', category: 'Animal' }, { word: 'flamingo', category: 'Animal' },
  { word: 'cobra', category: 'Animal' }, { word: 'chimpanzee', category: 'Animal' },
  // Places
  { word: 'mountain', category: 'Place' }, { word: 'ocean', category: 'Place' },
  { word: 'desert', category: 'Place' }, { word: 'jungle', category: 'Place' },
  { word: 'island', category: 'Place' }, { word: 'valley', category: 'Place' },
  { word: 'volcano', category: 'Place' }, { word: 'cave', category: 'Place' },
  { word: 'glacier', category: 'Place' }, { word: 'waterfall', category: 'Place' },
  { word: 'canyon', category: 'Place' }, { word: 'swamp', category: 'Place' },
  { word: 'tundra', category: 'Place' }, { word: 'meadow', category: 'Place' },
  { word: 'harbor', category: 'Place' }, { word: 'peninsula', category: 'Place' },
  // Things / Objects
  { word: 'telescope', category: 'Thing' }, { word: 'compass', category: 'Thing' },
  { word: 'lantern', category: 'Thing' }, { word: 'anchor', category: 'Thing' },
  { word: 'sword', category: 'Thing' }, { word: 'shield', category: 'Thing' },
  { word: 'candle', category: 'Thing' }, { word: 'mirror', category: 'Thing' },
  { word: 'hourglass', category: 'Thing' }, { word: 'crown', category: 'Thing' },
  { word: 'diamond', category: 'Thing' }, { word: 'crystal', category: 'Thing' },
  { word: 'violin', category: 'Thing' }, { word: 'drum', category: 'Thing' },
  { word: 'hammer', category: 'Thing' }, { word: 'ladder', category: 'Thing' },
  { word: 'key', category: 'Thing' }, { word: 'clock', category: 'Thing' },
  { word: 'umbrella', category: 'Thing' }, { word: 'notebook', category: 'Thing' },
  // Food
  { word: 'pizza', category: 'Food' }, { word: 'sushi', category: 'Food' },
  { word: 'chocolate', category: 'Food' }, { word: 'mango', category: 'Food' },
  { word: 'avocado', category: 'Food' }, { word: 'strawberry', category: 'Food' },
  { word: 'pineapple', category: 'Food' }, { word: 'coconut', category: 'Food' },
  { word: 'sandwich', category: 'Food' }, { word: 'noodle', category: 'Food' },
  { word: 'croissant', category: 'Food' }, { word: 'taco', category: 'Food' },
  // Nature
  { word: 'thunder', category: 'Nature' }, { word: 'lightning', category: 'Nature' },
  { word: 'rainbow', category: 'Nature' }, { word: 'blizzard', category: 'Nature' },
  { word: 'tornado', category: 'Nature' }, { word: 'eclipse', category: 'Nature' },
  { word: 'aurora', category: 'Nature' }, { word: 'tide', category: 'Nature' },
  { word: 'comet', category: 'Nature' }, { word: 'meteor', category: 'Nature' },
  // Person / Roles
  { word: 'knight', category: 'Person' }, { word: 'wizard', category: 'Person' },
  { word: 'pirate', category: 'Person' }, { word: 'astronaut', category: 'Person' },
  { word: 'detective', category: 'Person' }, { word: 'chef', category: 'Person' },
  { word: 'architect', category: 'Person' }, { word: 'sculptor', category: 'Person' },
  { word: 'explorer', category: 'Person' }, { word: 'inventor', category: 'Person' },
];

export interface GameSession {
  sessionId: string;
  secretWord: string;
  category: Category;
  guessCount: number;
  hintsUsed: number;
  hintsRemaining: number;
  revealedLetters: (string | null)[];
  guesses: Set<string>;
  active: boolean;
  createdAt: number;
}

const sessions = new Map<string, GameSession>();

// Clean up sessions older than 2 hours
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.createdAt > 2 * 60 * 60 * 1000) sessions.delete(id);
  }
}, 30 * 60 * 1000);

function getDailyWord(date: string): WordEntry {
  // Deterministic daily word based on date string
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash * 31 + date.charCodeAt(i)) >>> 0;
  }
  return WORD_LIST[hash % WORD_LIST.length];
}

export function createGame(daily = false): GameSession {
  const sessionId = uuidv4();
  let entry: WordEntry;

  if (daily) {
    const today = new Date().toISOString().split('T')[0];
    entry = getDailyWord(today);
  } else {
    entry = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  }

  const session: GameSession = {
    sessionId,
    secretWord: entry.word,
    category: entry.category,
    guessCount: 0,
    hintsUsed: 0,
    hintsRemaining: 3,
    revealedLetters: new Array(entry.word.length).fill(null),
    guesses: new Set(),
    active: true,
    createdAt: Date.now(),
  };

  sessions.set(sessionId, session);
  return session;
}

export function getSession(sessionId: string): GameSession | undefined {
  return sessions.get(sessionId);
}

export function recordGuess(session: GameSession, guess: string): void {
  session.guesses.add(guess.toLowerCase());
  session.guessCount++;
}

export function useHint(session: GameSession): string {
  if (session.hintsRemaining <= 0) throw new Error('No hints remaining');

  const word = session.secretWord;
  const unrevealed: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (session.revealedLetters[i] === null) unrevealed.push(i);
  }

  if (unrevealed.length === 0) throw new Error('All letters already revealed');

  const idx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
  session.revealedLetters[idx] = word[idx];
  session.hintsUsed++;
  session.hintsRemaining--;

  return session.revealedLetters.map((l, i) => l ?? '_').join(' ');
}

