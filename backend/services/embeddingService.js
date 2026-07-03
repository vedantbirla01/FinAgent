import { pipeline } from '@xenova/transformers';

let embedderPromise = null;

const getEmbedder = () => {
  if (!embedderPromise) {
    embedderPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedderPromise;
};

const getEmbedding = async (text) => {
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};

export { getEmbedding };