import { Router } from 'express';
import { getConversations, deleteConversation, acceptConversation } from '../controllers/conversationController.js';
import { authRequired } from '../middlewares/validateToken.js';

const router = Router();

router.get('/conversations', authRequired, getConversations);
router.put('/conversations/:id/accept', authRequired, acceptConversation);
router.delete('/conversations/:id', authRequired, deleteConversation);

export default router;