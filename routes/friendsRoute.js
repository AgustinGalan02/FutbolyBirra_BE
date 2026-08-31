import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import {
    getFriendsData,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend
} from '../controllers/friendsController.js';

const router = Router();

router.get('/friends', authRequired, getFriendsData);
router.post('/friends/request/:targetUsername', authRequired, sendFriendRequest);
router.post('/friends/accept/:senderId', authRequired, acceptFriendRequest);
router.post('/friends/reject/:senderId', authRequired, rejectFriendRequest);
router.delete('/friends/:friendId', authRequired, removeFriend);

export default router;