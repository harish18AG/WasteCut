import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { DonationService } from '../services/donation.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const donationService = new DonationService();

const donationSchema = z.object({
  foodName: z.string().min(2),
  category: z.enum([
    'VEGETARIAN',
    'NON_VEGETARIAN',
    'BAKERY',
    'FRUITS',
    'VEGETABLES',
    'RICE',
    'SNACKS',
    'BEVERAGES',
    'DAIRY',
    'DESSERTS',
  ]),
  quantity: z.string().min(1),
  description: z.string().optional(),
  preparationTime: z.string(),
  expiryTime: z.string(),
  pickupTime: z.string(),
  pickupAddress: z.string().min(5),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  imageUrl: z.string().optional(),
});

export class DonationController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const donorId = req.user?.donorId;
      if (!donorId) {
        return res.status(403).json({ message: 'Only registered Donors can create donations' });
      }

      const validatedData = donationSchema.parse(req.body);
      const donation = await donationService.createDonation(donorId, validatedData);
      return res.status(201).json(donation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      return next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { category, status, latitude, longitude, distance, search, donorId, mine } = req.query;
      const filters: any = {};
      
      if (category) filters.category = category;
      if (status) filters.status = status;
      if (latitude) filters.latitude = parseFloat(latitude as string);
      if (longitude) filters.longitude = parseFloat(longitude as string);
      if (distance) filters.distance = parseFloat(distance as string);
      if (search) filters.search = search as string;
      
      // Allow explicit donorId filter
      if (donorId) filters.donorId = donorId as string;
      
      // Allow donor to fetch only their own donations with ?mine=true
      if (mine === 'true') {
        if (req.user?.donorId) {
          filters.donorId = req.user.donorId;
        } else if (req.user?.id) {
          filters.userId = req.user.id;
        }
      }

      const donations = await donationService.listDonations(filters);
      return res.status(200).json(donations);
    } catch (error) {
      return next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const donation = await donationService.getDonation(id);
      return res.status(200).json(donation);
    } catch (error) {
      return next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const donorId = req.user?.donorId;
      if (!donorId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const donation = await donationService.updateDonation(id, donorId, req.body);
      return res.status(200).json(donation);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const donorId = req.user?.donorId;
      if (!donorId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      await donationService.deleteDonation(id, donorId);
      return res.status(200).json({ message: 'Donation deleted successfully' });
    } catch (error) {
      return next(error);
    }
  }
}
