import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { RequestService } from '../services/request.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const requestService = new RequestService();

const requestSchema = z.object({
  donationId: z.string().uuid(),
  quantityNeeded: z.string().min(1),
  notes: z.string().optional(),
});

export class RequestController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const recipientId = req.user?.recipientId;
      if (!recipientId) {
        return res.status(403).json({ message: 'Only registered Recipients can request food' });
      }

      const validatedData = requestSchema.parse(req.body);
      const request = await requestService.createRequest(recipientId, validatedData);
      return res.status(201).json(request);
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

      if (role === 'RECIPIENT') {
        filters.recipientId = req.user?.recipientId;
      } else if (role === 'DONOR') {
        // Handled inside service or filtered here: we only want requests where donation.donor.id === req.user.donorId
        // To support simple repository queries, we can fetch all and filter in memory or extend repository.
        // Let's filter in memory for simple code or let the repository return all and we check donorId.
      }

      const requests = await requestService.listRequests(filters);

      if (role === 'DONOR') {
        const donorId = req.user?.donorId;
        const userId = req.user?.id;
        const filtered = requests.filter(
          (r) =>
            (donorId && r.donation?.donorId === donorId) ||
            (userId && (r.donation as any)?.donor?.userId === userId)
        );
        return res.status(200).json(filtered);
      }

      return res.status(200).json(requests);
    } catch (error) {
      return next(error);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const donorUserId = req.user?.id;

      if (!donorUserId || req.user?.role !== 'DONOR') {
        return res.status(403).json({ message: 'Only donors can update request statuses' });
      }

      if (status !== 'APPROVED' && status !== 'REJECTED') {
        return res.status(400).json({ message: 'Status must be APPROVED or REJECTED' });
      }

      const updatedRequest = await requestService.updateRequestStatus(id, donorUserId, status);
      return res.status(200).json(updatedRequest);
    } catch (error) {
      return next(error);
    }
  }
}
