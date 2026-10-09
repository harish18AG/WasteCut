import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PickupService } from '../services/pickup.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const pickupService = new PickupService();

const pickupSchema = z.object({
  donationId: z.string().uuid(),
  requestId: z.string().uuid().nullable().optional(),
  scheduledTime: z.string(),
});

export class PickupController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ngoId = req.user?.ngoId;
      if (!ngoId) {
        return res.status(403).json({ message: 'Only registered NGOs can schedule pickups' });
      }

      const validatedData = pickupSchema.parse(req.body);
      const pickup = await pickupService.schedulePickup(ngoId, validatedData);
      return res.status(201).json(pickup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      return next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const role = req.user?.role;
      const filters: any = {};

      if (role === 'NGO') {
        filters.ngoId = req.user?.ngoId;
      }

      const pickups = await pickupService.listPickups(filters);

      // Filtering for Donors or Recipients in memory if needed
      if (role === 'DONOR') {
        const donorId = req.user?.donorId;
        const filtered = pickups.filter((p) => p.donation.donorId === donorId);
        return res.status(200).json(filtered);
      } else if (role === 'RECIPIENT') {
        const recipientId = req.user?.recipientId;
        const filtered = pickups.filter((p) => p.request?.recipientId === recipientId);
        return res.status(200).json(filtered);
      }

      return res.status(200).json(pickups);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pickup = await pickupService.getPickup(id);
      return res.status(200).json(pickup);
    } catch (error) {
      return next(error);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, deliveryConfirm } = req.body;
      const ngoUserId = req.user?.id;

      if (!ngoUserId || req.user?.role !== 'NGO') {
        return res.status(403).json({ message: 'Only NGOs can update pickup statuses' });
      }

      const updatedPickup = await pickupService.updatePickupStatus(id, ngoUserId, status, deliveryConfirm);
      return res.status(200).json(updatedPickup);
    } catch (error) {
      return next(error);
    }
  }
}
