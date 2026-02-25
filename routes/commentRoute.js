import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/validatorMiddleware.js';
import { createCommentSchema } from '../schemas/commentSchema.js';
import { createComment, getCommentsByPost, getCommentsByUser, deleteComment } from '../controllers/commentController.js';

const router = Router();

router.get('/comments/user/:userId', authRequired, getCommentsByUser);
router.get('/comments/:postId', authRequired, getCommentsByPost);
router.post('/comments', authRequired, validateSchema(createCommentSchema), createComment);
router.delete('/comments/:id', authRequired, deleteComment);

export default router;