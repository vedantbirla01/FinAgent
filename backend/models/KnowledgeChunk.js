import mongoose from 'mongoose';

const knowledgeChunkSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'general',
    },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

const KnowledgeChunk = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);

export default KnowledgeChunk;