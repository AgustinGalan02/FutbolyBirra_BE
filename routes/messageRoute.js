import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { authRequired } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/validatorMiddleware.js';
import { createMessageSchema } from '../schemas/messageSchema.js';

const router = Router();

router.get('/messages/:conversationId', authRequired, getMessages);
router.post('/messages', authRequired, validateSchema(createMessageSchema), sendMessage);

export default router;