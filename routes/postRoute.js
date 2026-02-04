import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { getPosts, createPost, updatePost, deletePost, getPostById } from '../controllers/postController.js';

const router = Router();

router.get('/posts', authRequired, getPosts);
router.get('/posts/:id', authRequired, getPostById);
router.post('/posts', authRequired, createPost);
router.put('/posts/:id', authRequired, updatePost);
router.delete('/posts/:id', authRequired, deletePost);

export default router;