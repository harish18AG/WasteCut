import { User } from '@prisma/client';
import { IUserRepository } from '../interfaces/repositories';
import prisma from '../config/database';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        donorProfile: true,
        ngoProfile: true,
        recipientProfile: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        donorProfile: true,
        ngoProfile: true,
        recipientProfile: true,
      },
    });
  }

  async create(data: any): Promise<User> {
    const { email, passwordHash, name, phone, role, address, latitude, longitude, donorType, registrationId } = data;

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          phone,
          role,
        },
      });

      if (role === 'DONOR') {
        await tx.donorProfile.create({
          data: {
            userId: user.id,
            donorType: donorType || 'INDIVIDUAL',
            address: address || '',
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
          },
        });
      } else if (role === 'NGO') {
        await tx.ngoProfile.create({
          data: {
            userId: user.id,
            registrationId: registrationId || '',
            address: address || '',
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
          },
        });
      } else if (role === 'RECIPIENT') {
        await tx.recipientProfile.create({
          data: {
            userId: user.id,
            address: address || '',
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
          },
        });
      }

      return tx.user.findUniqueOrThrow({
        where: { id: user.id },
        include: {
          donorProfile: true,
          ngoProfile: true,
          recipientProfile: true,
        },
      });
    });
  }

  async update(id: string, data: any): Promise<User> {
    const { name, phone, avatarUrl, address, latitude, longitude, donorType, registrationId } = data;

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: {
          name,
          phone,
          avatarUrl,
        },
      });

      if (user.role === 'DONOR') {
        await tx.donorProfile.update({
          where: { userId: id },
          data: {
            donorType,
            address,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
          },
        });
      } else if (user.role === 'NGO') {
        await tx.ngoProfile.update({
          where: { userId: id },
          data: {
            registrationId,
            address,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
          },
        });
      } else if (user.role === 'RECIPIENT') {
        await tx.recipientProfile.update({
          where: { userId: id },
          data: {
            address,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
          },
        });
      }

      return tx.user.findUniqueOrThrow({
        where: { id },
        include: {
          donorProfile: true,
          ngoProfile: true,
          recipientProfile: true,
        },
      });
    });
  }

  async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      include: {
        donorProfile: true,
        ngoProfile: true,
        recipientProfile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async delete(id: string): Promise<boolean> {
    await prisma.user.delete({
      where: { id },
    });
    return true;
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }
}
