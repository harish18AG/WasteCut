import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();
const adminController = new AdminController();

router.get('/analytics', authenticate as any, requireRole(['ADMIN']) as any, adminController.getAnalytics as any);
router.get('/users', authenticate as any, requireRole(['ADMIN']) as any, adminController.listUsers as any);
router.delete('/users/:id', authenticate as any, requireRole(['ADMIN']) as any, adminController.deleteUser as any);
router.get('/feedback', authenticate as any, requireRole(['ADMIN']) as any, adminController.listFeedback as any);
router.get('/reports', authenticate as any, requireRole(['ADMIN']) as any, adminController.listReports as any);
router.post('/reports', authenticate as any, requireRole(['ADMIN']) as any, adminController.generateReport as any);
router.get('/reports/:id', authenticate as any, requireRole(['ADMIN']) as any, adminController.getReportById as any);
router.post('/feedback', authenticate as any, adminController.submitFeedback as any);

export default router;
