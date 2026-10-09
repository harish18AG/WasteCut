import { PickupRepository } from '../repositories/pickup.repository';
import { DonationRepository } from '../repositories/donation.repository';
import { NotificationService } from './notification.service';
import { PickupStatus } from '@prisma/client';

const pickupRepository = new PickupRepository();
const donationRepository = new DonationRepository();

export class PickupService {
  async schedulePickup(ngoId: string, data: any) {
    const { donationId, requestId, scheduledTime } = data;

    const donation = await donationRepository.findById(donationId);
    if (!donation) {
      throw new Error('Donation not found');
    }

    if (donation.status === 'DELIVERED' || donation.status === 'PICKED_UP' || donation.status === 'EXPIRED') {
      throw new Error('Food is no longer available for pickup');
    }

    const pickup = await pickupRepository.create({
      donationId,
      ngoId,
      requestId,
      scheduledTime,
    });

    // Update donation status to ACCEPTED
    await donationRepository.update(donationId, { status: 'ACCEPTED' });

    // If there is an associated recipient request, automatically approve it now that NGO has accepted
    if (requestId) {
      try {
        const { RequestRepository } = require('../repositories/request.repository');
        const reqRepo = new RequestRepository();
        await reqRepo.updateStatus(requestId, 'APPROVED');
      } catch (reqErr) {
        console.error('Failed to auto-approve request on NGO pickup accept:', reqErr);
      }
    }

    // Fetch details for notifications
    try {
      const fullPickup = await pickupRepository.findById(pickup.id);
      const ngoName = (fullPickup as any)?.ngo?.user?.name || 'NGO';
      const donorUserId = (donation as any).donor.userId;

      // Notify donor
      await NotificationService.sendNotification(
        donorUserId,
        'NGO Accepted Pickup',
        `NGO ${ngoName} has accepted to collect "${donation.foodName}" on ${new Date(scheduledTime).toLocaleString()}.`
      );

      // Notify recipient if present
      if ((fullPickup as any)?.request?.recipient?.userId) {
        await NotificationService.sendNotification(
          (fullPickup as any).request.recipient.userId,
          'NGO Accepted Delivery',
          `NGO ${ngoName} has accepted to pick up and deliver "${donation.foodName}" to your address!`
        );
      }
    } catch (e) {
      console.error(e);
    }

    return pickup;
  }

  async listPickups(filters: any) {
    return pickupRepository.findAll(filters);
  }

  async getPickup(id: string) {
    const pickup = await pickupRepository.findById(id);
    if (!pickup) {
      throw new Error('Pickup not found');
    }
    return pickup;
  }

  async updatePickupStatus(id: string, ngoUserId: string, status: PickupStatus, deliveryConfirm?: string) {
    const pickup = await pickupRepository.findById(id);
    if (!pickup) {
      throw new Error('Pickup not found');
    }

    // Verify NGO is the owner of this pickup
    if ((pickup as any).ngo.userId !== ngoUserId) {
      throw new Error('Unauthorized to update this pickup');
    }

    // Enforce OTP verification before completing pickup
    if (status === 'COMPLETED') {
      if (!deliveryConfirm || deliveryConfirm.trim() !== (pickup as any).otpCode) {
        throw new Error('Invalid OTP code. Please enter the correct code shared by the donor.');
      }
    }

    const updatedPickup = await pickupRepository.updateStatus(id, status, deliveryConfirm);

    // Notify donor and recipient
    try {
      const donorUser = (updatedPickup as any).donation.donor.user;
      const donorUserId = donorUser.id || (updatedPickup as any).donation.donor.userId;
      const donorEmail = donorUser.email;
      const otpCode = (pickup as any).otpCode;
      
      let message = '';
      if (status === 'EN_ROUTE') {
        message = `The NGO is en route to pick up "${(updatedPickup as any).donation.foodName}".`;
      } else if (status === 'ARRIVED') {
        message = `The NGO has arrived at the pickup location for "${(updatedPickup as any).donation.foodName}". Share this secure OTP: ${otpCode} with the driver to confirm collection.`;

        // Send Email OTP to donor's email address
        if (donorEmail && otpCode) {
          try {
            const { OtpService } = require('./otp.service');
            const otpService = new OtpService();
            await otpService.sendEmailOtp(donorEmail, otpCode);
          } catch (emailErr) {
            console.error('Failed to send OTP email to donor:', emailErr);
          }
        }
      } else if (status === 'COMPLETED') {
        message = `Surplus food "${(updatedPickup as any).donation.foodName}" has been successfully delivered and distributed.`;
      } else if (status === 'CANCELLED') {
        const ngoName = (updatedPickup as any).ngo?.user?.name || 'NGO';
        message = `The pickup for "${(updatedPickup as any).donation.foodName}" has been cancelled by NGO ${ngoName}.`;
      }

      const notifTitle = status === 'CANCELLED' ? 'Order Cancelled by NGO' : `Pickup Status: ${status}`;
      await NotificationService.sendNotification(donorUserId, notifTitle, message);

      if ((updatedPickup as any).requestId && (updatedPickup as any).request) {
        await NotificationService.sendNotification(
          (updatedPickup as any).request.recipient.userId,
          notifTitle,
          message
        );
      }
    } catch (e) {
      console.error(e);
    }

    return updatedPickup;
  }
}
