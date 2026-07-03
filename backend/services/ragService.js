import KnowledgeChunk from '../models/KnowledgeChunk.js';
import { getEmbedding } from './embeddingService.js';

const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i += 1) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const searchFinancialTips = async (query, topK = 3) => {
  const queryEmbedding = await getEmbedding(query);
  const allChunks = await KnowledgeChunk.find({});

  const scored = allChunks.map((chunk) => ({
    text: chunk.text,
    category: chunk.category,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map(({ text, category, score }) => ({
    text,
    category,
    relevance: Math.round(score * 100) / 100,
  }));
};

export default searchFinancialTips;