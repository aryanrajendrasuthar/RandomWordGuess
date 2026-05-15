# WordAura ✨

A semantic word-guessing game powered by HuggingFace embeddings (100% free). Guess the secret word using similarity scores as your guide.

## How to Play

1. Start a new game or try the Daily Challenge
2. Type any word and submit — you'll get a **0–100% similarity score**
3. Use the scores to navigate toward the secret word
4. Exact match = 100% = You Win! 🏆

**Score guide:**
- 🟥 0–30% — Completely unrelated
- 🟧 31–60% — Loosely related
- 🟨 61–80% — Same broad category
- 🟩 81–99% — Very close!
- 🏆 100% — You got it!

---

## Setup

### 1. Get a Free HuggingFace Token

1. Go to [huggingface.co](https://huggingface.co) and create a free account
2. Navigate to **Settings → Access Tokens**
3. Click **New token** → Role: **Read** → Copy the token (starts with `hf_...`)

No credit card required — the Inference API is free.

### 2. Configure Environment

```bash
# The .env file lives inside server/
cp wordaura/server/.env.example wordaura/server/.env
# Edit wordaura/server/.env and paste your token:
# HF_TOKEN=hf_...your-token-here...
```

### 3. Install & Run the Server

```bash
cd server
npm install
npm run dev
# Server starts on http://localhost:3001
```

### 4. Install & Run the Client (new terminal tab)

```bash
cd client
npm install
npm run dev
# Client starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
wordaura/
├── client/                  # React + TypeScript + Tailwind frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── GuessList.tsx     # Sortable guess history with score bars
│   │   │   ├── ScoreBar.tsx      # Animated colored progress bar
│   │   │   ├── VictoryScreen.tsx # Confetti win screen + share button
│   │   │   └── Leaderboard.tsx   # localStorage-backed leaderboard
│   │   ├── hooks/
│   │   │   └── useGame.ts        # All game logic and API calls
│   │   ├── types/index.ts
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── server/                  # Express + TypeScript backend
│   ├── src/
│   │   ├── routes/game.ts        # POST /new /guess /hint /giveup
│   │   ├── services/
│   │   │   ├── embeddingService.ts  # HuggingFace sentence-transformers embeddings
│   │   │   └── gameService.ts       # Session management, word list, hints
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/game/new` | Start a new game. Body: `{ daily?: boolean }` |
| POST | `/api/game/guess` | Submit a guess. Body: `{ sessionId, guess }` |
| POST | `/api/game/hint` | Get a letter hint. Body: `{ sessionId }` |
| POST | `/api/game/giveup` | Reveal secret word. Body: `{ sessionId }` |

---

## Features

- **Semantic scoring** via `sentence-transformers/all-MiniLM-L6-v2` (free) — no hardcoded rules
- **Hint system** — up to 3 letter-reveal hints per game
- **Daily Challenge** — same word for everyone each day (deterministic)
- **Leaderboard** — stored in localStorage, tracks guesses + hints
- **Share button** — Wordle-style emoji summary
- **Rate limiting** — 60 guesses/minute per session
- **Embedding cache** — server-side cache avoids redundant API calls
- **Confetti** on victory 🎉
- **Dark mode** UI, mobile responsive

---

## Git Setup (run manually)

```bash
git init
git add .
git commit -m "Initial WordAura implementation"
```
