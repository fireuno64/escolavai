import { Router } from 'express';
import { ChatbotController } from '../controllers/ChatbotController.js';
const router = Router();
const controller = new ChatbotController();
router.post('/chat', controller.processMessage.bind(controller));
export default router;
