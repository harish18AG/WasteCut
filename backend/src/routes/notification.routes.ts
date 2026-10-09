import { Router, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate as any, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const notifications = await NotificationService.getUserNotifications(userId);
    return res.status(200).json(notifications);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as any);

router.put('/read-all', authenticate as any, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    await NotificationService.markAllAsRead(userId);
    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as any);

router.put('/:id/read', authenticate as any, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    await NotificationService.markAsRead(id, userId);
    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}) as any);

export default router;
