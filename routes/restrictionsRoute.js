import { Router } from 'express';
import { getRestrictions, createRestriction, removeRestriction } from '../controllers/restrictionsController.js';
import { authRequired } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/validatorMiddleware.js';
import { createAccessRestrictionSchema } from '../schemas/accessRestrictionSchema.js';

const router = Router();

router.get('/restrictions', authRequired, getRestrictions);
router.post('/restrictions', authRequired, validateSchema(createAccessRestrictionSchema), createRestriction);
router.delete('/restrictions/:userTarget', authRequired, removeRestriction);

export default router;