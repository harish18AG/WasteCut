import { z } from 'zod';

export const donationSchema = z.object({
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
