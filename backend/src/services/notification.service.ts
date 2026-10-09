import prisma from '../config/database';

export class NotificationService {
  static async sendNotification(recipientId: string, title: string, message: string) {
    try {
      return await prisma.notification.create({
        data: {
          recipientId,
          title,
          message,
          isRead: false,
        },
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  static async getUserNotifications(recipientId: string) {
    return prisma.notification.findMany({
      where: { recipientId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  static async markAsRead(id: string, recipientId: string) {
    return prisma.notification.updateMany({
      where: {
        id,
        recipientId,
      },
      data: {
        isRead: true,
      },
    });
  }

  static async markAllAsRead(recipientId: string) {
    return prisma.notification.updateMany({
      where: { recipientId },
      data: { isRead: true },
    });
  }
}
