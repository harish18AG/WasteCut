import { Router } from 'express';
import { DonationController } from '../controllers/donation.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();
const donationController = new DonationController();

router.post('/', authenticate as any, requireRole(['DONOR']) as any, donationController.create as any);
router.get('/', authenticate as any, donationController.list as any);
router.get('/:id', authenticate as any, donationController.getById as any);
router.put('/:id', authenticate as any, requireRole(['DONOR']) as any, donationController.update as any);
router.delete('/:id', authenticate as any, requireRole(['DONOR', 'ADMIN']) as any, donationController.delete as any);

export default router;
