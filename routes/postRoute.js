import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/validatorMiddleware.js';
import { createPostSchema, updatePostSchema } from '../schemas/postSchema.js';
import { getPosts, createPost, updatePost, deletePost, getPostById, getPostsByUser} from '../controllers/postController.js';

const router = Router();

router.get('/posts', authRequired, getPosts);
router.get('/posts/user/:userId', authRequired, getPostsByUser);
router.get('/posts/:id', authRequired, getPostById);
router.post('/posts', authRequired, validateSchema(createPostSchema), createPost);
router.put('/posts/:id', authRequired, validateSchema(updatePostSchema), updatePost);
router.delete('/posts/:id', authRequired, deletePost);

export default router;