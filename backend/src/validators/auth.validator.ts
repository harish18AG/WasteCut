import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().refine(
    (val) => val.endsWith('@gmail.com') || val.endsWith('@email.com'),
    { message: 'Email must end with @gmail.com or @email.com' }
  ),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().regex(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' }),
  role: z.enum(['ADMIN', 'DONOR', 'NGO', 'RECIPIENT']),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  donorType: z.string().optional(),
  registrationId: z.string().regex(/^[a-zA-Z0-9\/\-]{5,20}$/, { message: 'NGO registration ID must be 5-20 characters long and contain only alphanumeric, hyphen (-), or slash (/)' }).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
