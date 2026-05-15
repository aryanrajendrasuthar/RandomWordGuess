import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_TOKEN);
const embeddingCache = new Map<string, number[]>();

async function getEmbedding(word: string): Promise<number[]> {
  const key = word.toLowerCase().trim();
  if (embeddingCache.has(key)) return embeddingCache.get(key)!;

  const result = await hf.featureExtraction({
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    inputs: key,
  });

  // Single string input → number[]
  const embedding = result as number[];
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
  return Math.round(Math.max(0, Math.min(100, similarity * 100)));
}
