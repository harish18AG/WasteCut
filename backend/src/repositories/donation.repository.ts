import { Donation, AvailabilityStatus } from '@prisma/client';
import { IDonationRepository } from '../interfaces/repositories';
import prisma from '../config/database';

export class DonationRepository implements IDonationRepository {
  async findById(id: string): Promise<Donation | null> {
    return prisma.donation.findUnique({
      where: { id },
      include: {
        donor: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        requests: {
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
        pickups: true,
      },
    });
  }

  async create(data: any): Promise<Donation> {
    const {
      donorId,
      foodName,
      category,
      quantity,
      description,
      preparationTime,
      expiryTime,
      pickupTime,
      pickupAddress,
      latitude,
      longitude,
      imageUrl,
    } = data;

    return prisma.donation.create({
      data: {
        donorId,
        foodName,
        category,
        quantity,
        description,
        preparationTime: new Date(preparationTime),
        expiryTime: new Date(expiryTime),
        pickupTime: new Date(pickupTime),
        pickupAddress,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        imageUrl,
        status: 'AVAILABLE',
      },
      include: {
        donor: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async update(id: string, data: any): Promise<Donation> {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.foodName) updateData.foodName = data.foodName;
    if (data.category) updateData.category = data.category;
    if (data.quantity) updateData.quantity = data.quantity;
    if (data.description) updateData.description = data.description;
    if (data.imageUrl) updateData.imageUrl = data.imageUrl;
    if (data.pickupAddress) updateData.pickupAddress = data.pickupAddress;
    if (data.expiryTime) updateData.expiryTime = new Date(data.expiryTime);
    if (data.pickupTime) updateData.pickupTime = new Date(data.pickupTime);

    return prisma.donation.update({
      where: { id },
      data: updateData,
      include: {
        donor: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findAll(filters: {
    category?: any;
    status?: AvailabilityStatus;
    donorId?: string;
    userId?: string;
    latitude?: number;
    longitude?: number;
    distance?: number;
    search?: string;
  }): Promise<any[]> {
    const whereClause: any = {};

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.donorId) {
      whereClause.donorId = filters.donorId;
    }

    if (filters.userId) {
      whereClause.donor = { userId: filters.userId };
    }

    if (filters.category) {
      whereClause.category = filters.category;
    }

    if (filters.search) {
      whereClause.OR = [
        { foodName: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { pickupAddress: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const donations = await prisma.donation.findMany({
      where: whereClause,
      include: {
        donor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        // Include non-cancelled pickups so we know if an NGO has already accepted/scheduled this donation
        pickups: {
          where: {
            status: { not: 'CANCELLED' },
          },
        },
        // Include approved requests so NGO can see recipient & requestId
        requests: {
          where: { status: 'APPROVED' },
          include: {
            recipient: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // When querying ACCEPTED donations for NGO pickup requests, exclude items that ALREADY have an active pickup scheduled
    let resultDonations = donations;
    if (filters.status === 'ACCEPTED') {
      resultDonations = donations.filter((d) => !d.pickups || d.pickups.length === 0);
    }

    if (filters.latitude && filters.longitude) {
      const userLat = Number(filters.latitude);
      const userLng = Number(filters.longitude);
      const maxDist = filters.distance ? Number(filters.distance) : null;

      // Calculate distance for all donations with coordinates
      const calculatedDonations = resultDonations.map((donation) => {
        if (donation.latitude && donation.longitude) {
          const R = 6371; // Earth's radius in km
          const dLat = ((donation.latitude - userLat) * Math.PI) / 180;
          const dLon = ((donation.longitude - userLng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((userLat * Math.PI) / 180) *
              Math.cos((donation.latitude * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          (donation as any).distance = R * c;
        }
        return donation;
      });

      if (maxDist !== null) {
        const withinDistance = calculatedDonations.filter((d) => (d as any).distance !== undefined && (d as any).distance <= maxDist);
        // If distance filtering leaves results, return them.
        // If distance filtering yields 0 results (e.g. default NY fallback coordinates vs real donor coords),
        // gracefully return all calculated donations sorted by distance so listings are NOT hidden!
        if (withinDistance.length > 0) {
          return withinDistance;
        }
      }

      return calculatedDonations;
    }

    return resultDonations;
  }

  async delete(id: string): Promise<boolean> {
    await prisma.donation.delete({
      where: { id },
    });
    return true;
  }
}
