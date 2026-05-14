import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import gameRouter from './routes/game';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

app.use('/api/game', gameRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`WordAura server running on http://localhost:${PORT}`);
});
