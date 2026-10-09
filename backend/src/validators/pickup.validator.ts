import { z } from 'zod';

export const pickupSchema = z.object({
  donationId: z.string().uuid(),
  requestId: z.string().uuid().nullable().optional(),
  scheduledTime: z.string(),
});
