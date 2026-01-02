import { z } from 'zod';

// Date range query for spending summary
export const DateRangeQuerySchema = z.object({
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  { message: 'Start date must be before or equal to end date' }
);

// Types
export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;
