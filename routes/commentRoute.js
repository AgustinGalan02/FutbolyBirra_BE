import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { createComment, getCommentsByPost, deleteComment } from '../controllers/commentController.js';

const router = Router();
router.get('/comments/:postId', authRequired, getCommentsByPost);
router.post('/comments', authRequired, createComment);
router.delete('/comments/:id', authRequired, deleteComment);

export default router;