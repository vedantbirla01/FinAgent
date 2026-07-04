import asyncHandler from 'express-async-handler';
import Conversation from '../models/Conversation.js';

// @desc    Get token usage summary for the logged-in user
// @route   GET /api/chat/cost-summary
// @access  Private
const getCostSummary = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ user: req.user._id });

  if (!conversation) {
    res.json({ totalTokens: 0, totalMessages: 0, estimatedCostUSD: 0 });
    return;
  }

  const assistantMessages = conversation.messages.filter((m) => m.role === 'assistant');

  const totals = assistantMessages.reduce(
    (acc, m) => {
      acc.promptTokens += m.promptTokens || 0;
      acc.completionTokens += m.completionTokens || 0;
      acc.totalTokens += m.totalTokens || 0;
      return acc;
    },
    { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
  );

  // Groq llama-3.3-70b-versatile approximate pricing (per million tokens) — update if pricing changes
  const INPUT_COST_PER_MILLION = 0.59;
  const OUTPUT_COST_PER_MILLION = 0.79;

  const estimatedCostUSD =
    (totals.promptTokens / 1_000_000) * INPUT_COST_PER_MILLION +
    (totals.completionTokens / 1_000_000) * OUTPUT_COST_PER_MILLION;

  res.json({
    ...totals,
    totalMessages: assistantMessages.length,
    estimatedCostUSD: Math.round(estimatedCostUSD * 10000) / 10000,
  });
});

export { getCostSummary };