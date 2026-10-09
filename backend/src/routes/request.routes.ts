import { Router } from 'express';
import { RequestController } from '../controllers/request.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();
const requestController = new RequestController();

router.post('/', authenticate as any, requireRole(['RECIPIENT']) as any, requestController.create as any);
router.get('/', authenticate as any, requestController.list as any);
router.put('/:id/status', authenticate as any, requireRole(['DONOR']) as any, requestController.updateStatus as any);

export default router;
