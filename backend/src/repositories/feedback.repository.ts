import { Feedback } from '@prisma/client';
import { IFeedbackRepository } from '../interfaces/repositories';
import prisma from '../config/database';

export class FeedbackRepository implements IFeedbackRepository {
  async create(data: any): Promise<Feedback> {
    const { senderId, rating, comments } = data;
    return prisma.feedback.create({
      data: {
        senderId,
        rating: parseInt(rating),
        comments,
      },
      include: {
        sender: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findAll(): Promise<any[]> {
    return prisma.feedback.findMany({
      include: {
        sender: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
