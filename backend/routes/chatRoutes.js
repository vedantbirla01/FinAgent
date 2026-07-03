import express from 'express';
import { sendMessage, getHistory } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/message', protect, sendMessage);
router.get('/history', protect, getHistory);

export default router;