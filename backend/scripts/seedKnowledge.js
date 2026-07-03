import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import KnowledgeChunk from '../models/KnowledgeChunk.js';
import knowledgeSeedData from '../services/knowledgeSeedData.js';
import { getEmbedding } from '../services/embeddingService.js';
import mongoose from 'mongoose';

dotenv.config();

const seed = async () => {
  await connectDB();

  console.log('Clearing existing knowledge chunks...');
  await KnowledgeChunk.deleteMany({});

  console.log(`Generating embeddings for ${knowledgeSeedData.length} chunks...`);

  for (const item of knowledgeSeedData) {
    const embedding = await getEmbedding(item.text);
    await KnowledgeChunk.create({
      text: item.text,
      category: item.category,
      embedding,
    });
    console.log(`Seeded: [${item.category}] ${item.text.slice(0, 50)}...`);
  }

  console.log('Done seeding knowledge base.');
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});