import { z } from 'zod';

// Same rules as the API's createAdminSchema (apps/api/src/validators/team.validator.ts).
// No role field: the endpoint only ever creates admins.
export const inviteAdminSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters'),
  email: z.email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be under 128 characters')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/\d/, 'Must contain a number'),
});

export type InviteAdminForm = z.infer<typeof inviteAdminSchema>;
