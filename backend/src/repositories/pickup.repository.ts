import { Pickup, PickupStatus } from '@prisma/client';
import { IPickupRepository } from '../interfaces/repositories';
import prisma from '../config/database';

export class PickupRepository implements IPickupRepository {
  async findById(id: string): Promise<Pickup | null> {
    return prisma.pickup.findUnique({
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
        request: {
          include: {
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
          },
        },
      },
    });
  }

  async create(data: any): Promise<Pickup> {
    const { donationId, ngoId, requestId, scheduledTime } = data;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    return prisma.pickup.create({
      data: {
        donationId,
        ngoId,
        requestId: requestId || null,
        scheduledTime: new Date(scheduledTime),
        status: 'SCHEDULED',
        otpCode,
      },
      include: {
        donation: true,
        ngo: true,
      },
    });
  }

  async updateStatus(id: string, status: PickupStatus, deliveryConfirm?: string): Promise<Pickup> {
    return prisma.$transaction(async (tx) => {
      const updateData: any = { status };
      if (deliveryConfirm) {
        updateData.deliveryConfirm = deliveryConfirm;
      }

      const pickup = await tx.pickup.update({
        where: { id },
        data: updateData,
      });

      // Update related donation / request status if pickup status is updated
      if (status === 'COMPLETED') {
        // Mark donation as DELIVERED
        await tx.donation.update({
          where: { id: pickup.donationId },
          data: { status: 'DELIVERED' },
        });

        // Mark request as COMPLETED (if request is linked)
        if (pickup.requestId) {
          await tx.request.update({
            where: { id: pickup.requestId },
            data: { status: 'COMPLETED' },
          });
        }
      } else if (status === 'EN_ROUTE' || status === 'ARRIVED') {
        // Mark donation as PICKED_UP
        await tx.donation.update({
          where: { id: pickup.donationId },
          data: { status: 'PICKED_UP' },
        });
      } else if (status === 'CANCELLED') {
        // Rollback donation status to AVAILABLE
        await tx.donation.update({
          where: { id: pickup.donationId },
          data: { status: 'AVAILABLE' },
        });

        if (pickup.requestId) {
          await tx.request.update({
            where: { id: pickup.requestId },
            data: { status: 'PENDING' },
          });
        }
      }

      return tx.pickup.findUniqueOrThrow({
        where: { id: pickup.id },
        include: {
          donation: true,
          ngo: true,
          request: true,
        },
      });
    });
  }

  async findAll(filters: { ngoId?: string; status?: PickupStatus }): Promise<any[]> {
    const whereClause: any = {};
    if (filters.ngoId) whereClause.ngoId = filters.ngoId;
    if (filters.status) whereClause.status = filters.status;

    return prisma.pickup.findMany({
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
        request: {
          include: {
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
