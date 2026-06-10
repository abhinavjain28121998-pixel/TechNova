import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

// Load embeddings
let postEmbeddings: Record<string, number[]> = {};
try {
  const embeddingsPath = path.resolve(process.cwd(), 'src/data/embeddings.json');
  if (fs.existsSync(embeddingsPath)) {
    postEmbeddings = JSON.parse(fs.readFileSync(embeddingsPath, 'utf8'));
  }
} catch (e) {
  console.error("Failed to load embeddings in serverless route", e);
}

function dotProduct(a: number[], b: number[]) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}
function magnitude(a: number[]) {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
}
function cosineSimilarity(a: number[], b: number[]) {
  return dotProduct(a, b) / (magnitude(a) * magnitude(b));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { q } = req.body;
    if (!q || typeof q !== 'string') {
      return res.status(200).json({ results: [] });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
    }

    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: q,
    });

    const queryEmbedding = response.embeddings?.[0]?.values;
    if (!queryEmbedding) {
      return res.status(500).json({ error: 'Failed to generate query embedding' });
    }

    const results = Object.keys(postEmbeddings).map(postId => {
      const postEmb = postEmbeddings[postId];
      const score = cosineSimilarity(queryEmbedding, postEmb);
      return { id: postId, score };
    });

    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, 20);

    return res.status(200).json({ results: topResults });
  } catch (e) {
    console.error("Semantic search error in serverless route:", e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
