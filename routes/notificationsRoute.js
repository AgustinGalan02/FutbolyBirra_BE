import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import {
    getNotifications,
    markAsRead,
    markAllAsRead
} from '../controllers/notificationsController.js';

const router = Router();

router.get('/notifications', authRequired, getNotifications);
router.put('/notifications/:id/read', authRequired, markAsRead);
router.put('/notifications/read-all', authRequired, markAllAsRead);

export default router;