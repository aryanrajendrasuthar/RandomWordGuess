import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const embeddingCache = new Map<string, number[]>();

async function getEmbedding(word: string): Promise<number[]> {
  const key = word.toLowerCase().trim();
  if (embeddingCache.has(key)) return embeddingCache.get(key)!;

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: key,
  });

  const embedding = response.data[0].embedding;
  embeddingCache.set(key, embedding);
  return embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function computeSimilarity(word1: string, word2: string): Promise<number> {
  const [e1, e2] = await Promise.all([getEmbedding(word1), getEmbedding(word2)]);
  const similarity = cosineSimilarity(e1, e2);
  // Map cosine similarity (typically 0.0–1.0 for related words) to 0–100
  // Cosine similarity ranges from -1 to 1, but word embeddings usually 0–1
  // Scale: exact match ~1.0, unrelated ~0.0–0.2
  const score = Math.round(Math.max(0, Math.min(100, similarity * 100)));
  return score;
}
