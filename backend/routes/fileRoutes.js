import express from 'express';
import { chatController } from '../controllers/chatController.js';

const router = express.Router();

router.post('/message', chatController.sendMessage);
router.get('/history/:chatId', chatController.getChatHistory);
router.get('/histories', chatController.getAllChats);

// Simple handler for mode updates (if needed)
router.put('/mode/:chatId', (req, res) => {
  res.json({ message: "Mode updates are disabled - only Friendly Mode is available" });
});

router.delete('/:chatId', chatController.deleteChat);

export default router;