import { DonationRepository } from '../repositories/donation.repository';
import { NotificationService } from './notification.service';
import prisma from '../config/database';

const donationRepository = new DonationRepository();

export class DonationService {
  async createDonation(donorId: string, data: any) {
    const donation = await donationRepository.create({
      ...data,
      donorId,
    });

    // Notify all NGOs that a new donation is available
    try {
      const ngos = await prisma.ngoProfile.findMany({
        include: { user: true },
      });

      for (const ngo of ngos) {
        await NotificationService.sendNotification(
          ngo.userId,
          'New Surplus Food Available!',
          `A new donation "${donation.foodName}" has been posted by ${(donation as any).donor.user.name} at ${donation.pickupAddress}.`
        );
      }
    } catch (e) {
      console.error('Failed to notify NGOs:', e);
    }

    return donation;
  }

  async getDonation(id: string) {
    const donation = await donationRepository.findById(id);
    if (!donation) {
      throw new Error('Donation not found');
    }
    return donation;
  }

  async listDonations(filters: any) {
    return donationRepository.findAll(filters);
  }

  async updateDonation(id: string, donorId: string, data: any) {
    const donation = await donationRepository.findById(id);
    if (!donation) {
      throw new Error('Donation not found');
    }
    if (donation.donorId !== donorId) {
      throw new Error('Unauthorized to update this donation');
    }

    return donationRepository.update(id, data);
  }

  async deleteDonation(id: string, donorId: string) {
    const donation = await donationRepository.findById(id);
    if (!donation) {
      throw new Error('Donation not found');
    }
    if (donation.donorId !== donorId) {
      throw new Error('Unauthorized to delete this donation');
    }

    return donationRepository.delete(id);
  }
}
