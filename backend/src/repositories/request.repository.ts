import { Request, RequestStatus } from '@prisma/client';
import { IRequestRepository } from '../interfaces/repositories';
import prisma from '../config/database';

export class RequestRepository implements IRequestRepository {
  async findById(id: string): Promise<Request | null> {
    return prisma.request.findUnique({
      where: { id },
      include: {
        donation: {
          include: {
            donor: {
              include: {
                user: {
                  select: {
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        recipient: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        pickups: true,
      },
    });
  }

  async create(data: any): Promise<Request> {
    const { donationId, recipientId, quantityNeeded, notes } = data;
    return prisma.request.create({
      data: {
        donationId,
        recipientId,
        quantityNeeded,
        notes,
        status: 'PENDING',
      },
      include: {
        donation: true,
      },
    });
  }

  async updateStatus(id: string, status: RequestStatus): Promise<Request> {
    return prisma.request.update({
      where: { id },
      data: { status },
      include: {
        donation: true,
      },
    });
  }

  async findAll(filters: {
    recipientId?: string;
    donationId?: string;
    status?: RequestStatus;
  }): Promise<any[]> {
    const whereClause: any = {};
    if (filters.recipientId) whereClause.recipientId = filters.recipientId;
    if (filters.donationId) whereClause.donationId = filters.donationId;
    if (filters.status) whereClause.status = filters.status;

    return prisma.request.findMany({
      where: whereClause,
      include: {
        donation: {
          include: {
            donor: {
              include: {
                user: {
                  select: {
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        recipient: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        pickups: {
          include: {
            ngo: {
              include: {
                user: {
                  select: {
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
