import { Router } from 'express';
import {
    getRestrictions,
    createRestriction,
    removeRestriction,
    auditReincidencia
} from '../controllers/restrictionsController.js';
import { authRequired, isModerator } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/validatorMiddleware.js';
import { createAccessRestrictionSchema } from '../schemas/accessRestrictionSchema.js';

const router = Router();

router.get('/restrictions', authRequired, getRestrictions);
router.get('/restrictions/reincidencia/:personTarget', authRequired, isModerator, auditReincidencia);
router.post('/restrictions', authRequired, validateSchema(createAccessRestrictionSchema), createRestriction);
router.delete('/restrictions/:personTarget', authRequired, removeRestriction);

export default router;