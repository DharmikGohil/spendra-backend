import { z } from 'zod';

// Category ID params
export const CategoryIdParamsSchema = z.object({
  id: z.string().uuid('Invalid category ID'),
});

// Types
export type CategoryIdParams = z.infer<typeof CategoryIdParamsSchema>;
