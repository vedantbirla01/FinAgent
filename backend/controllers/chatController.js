import asyncHandler from 'express-async-handler';
import runAgent from '../services/agentService.js';
import Conversation from '../models/Conversation.js';

const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  const result = await runAgent(req.user._id, message);
  res.json(result);
});

const getHistory = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ user: req.user._id });
  res.json(conversation ? conversation.messages : []);
});

export { sendMessage, getHistory };