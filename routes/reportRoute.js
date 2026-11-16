import { Router } from 'express';
import { authRequired, isModerator } from '../middlewares/validateToken.js';
import {
    createReport,
    getPendingReports,
    resolveReport,
    dismissReport
} from '../controllers/reportController.js';

const router = Router();

// Cualquier usuario autenticado puede denunciar contenido
router.post('/reports', authRequired, createReport);

// Solo moderadores o admins gestionan la bandeja de denuncias
router.get('/reports/pending', authRequired, isModerator, getPendingReports);
router.put('/reports/:id/resolve', authRequired, isModerator, resolveReport);
router.put('/reports/:id/dismiss', authRequired, isModerator, dismissReport);

export default router;