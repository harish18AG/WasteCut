import { RequestRepository } from '../repositories/request.repository';
import { DonationRepository } from '../repositories/donation.repository';
import { NotificationService } from './notification.service';

const requestRepository = new RequestRepository();
const donationRepository = new DonationRepository();

export class RequestService {
  async createRequest(recipientId: string, data: any) {
    const { donationId, quantityNeeded, notes } = data;
    
    const donation = await donationRepository.findById(donationId);
    if (!donation) {
      throw new Error('Donation not found');
    }
    if (donation.status !== 'AVAILABLE') {
      throw new Error('This food is no longer available');
    }

    const request = await requestRepository.create({
      donationId,
      recipientId,
      quantityNeeded,
      notes,
    });

    // Update donation status to PENDING
    await donationRepository.update(donationId, { status: 'PENDING' });

    // Notify donor
    try {
      await NotificationService.sendNotification(
        (donation as any).donor.userId,
        'New Request Received',
        `A recipient has requested food from your listing "${donation.foodName}".`
      );
    } catch (e) {
      console.error(e);
    }

    return request;
  }

  async listRequests(filters: any) {
    return requestRepository.findAll(filters);
  }

  async updateRequestStatus(id: string, donorUserId: string, status: 'APPROVED' | 'REJECTED') {
    const request = await requestRepository.findById(id);
    if (!request) {
      throw new Error('Request not found');
    }

    // Verify donor is the owner of the donation
    if ((request as any).donation.donor.userId !== donorUserId) {
      throw new Error('Unauthorized to approve/reject this request');
    }

    const updatedRequest = await requestRepository.updateStatus(id, status);

    // Update donation status based on action
    if (status === 'APPROVED') {
      await donationRepository.update(request.donationId, { status: 'ACCEPTED' });
      
      // Notify recipient
      await NotificationService.sendNotification(
        (request as any).recipient.userId,
        'Request Approved!',
        `Your request for "${(request as any).donation.foodName}" has been approved by the donor.`
      );
    } else {
      await donationRepository.update(request.donationId, { status: 'AVAILABLE' });

      const donorName = (request as any).donation?.donor?.user?.name || 'Donor';
      // Notify recipient that request was cancelled by donor
      await NotificationService.sendNotification(
        (request as any).recipient.userId,
        'Order Cancelled by Donor',
        `Your food claim request for "${(request as any).donation.foodName}" has been cancelled by Donor ${donorName}.`
      );
    }

    return updatedRequest;
  }
}
