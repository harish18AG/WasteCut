import { z } from 'zod';

export const requestSchema = z.object({
  donationId: z.string().uuid(),
  quantityNeeded: z.string().min(1),
  notes: z.string().optional(),
});
