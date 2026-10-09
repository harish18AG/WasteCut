import { Router } from 'express';
import { PickupController } from '../controllers/pickup.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();
const pickupController = new PickupController();

router.post('/', authenticate as any, requireRole(['NGO']) as any, pickupController.create as any);
router.get('/', authenticate as any, pickupController.list as any);
router.get('/:id', authenticate as any, pickupController.getById as any);
router.put('/:id/status', authenticate as any, requireRole(['NGO']) as any, pickupController.updateStatus as any);

export default router;
