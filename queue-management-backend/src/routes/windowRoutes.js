import express from 'express';
import WindowController from '../controllers/windowController.js';

const router = express.Router();

// ===== STATIC ROUTES (must come before /:id) =====
router.get('/', WindowController.getAll);
router.get('/active', WindowController.getActive);
router.get('/queue/status', WindowController.queueStatus);
router.post('/queue/reset', WindowController.resetQueue);
router.post('/', WindowController.create);

// ===== ROUTES WITH :id =====
router.get('/:id', WindowController.getById);
router.post('/:id/call-next', WindowController.callNext);
router.post('/:id/recall', WindowController.reCall);
router.patch('/:id/announcement', WindowController.updateAnnouncement);
router.patch('/:id/toggle', WindowController.toggleActive);
router.delete('/:id/clear', WindowController.clear);
router.delete('/:id', WindowController.delete);
router.post('/:id/reset-counter', WindowController.resetCounter);

export default router;