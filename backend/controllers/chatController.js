import asyncHandler from 'express-async-handler';
import runSingleTurn from '../services/chatService.js';

const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  const result = await runSingleTurn(req.user._id, message);
  res.json(result);
});

export { sendMessage };