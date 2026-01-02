import { z } from 'zod';

// Enums
export const TransactionTypeSchema = z.enum(['DEBIT', 'CREDIT']);
export const TransactionSourceSchema = z.enum(['UPI', 'CARD', 'BANK', 'CASH', 'OTHER']);

// Create transaction input (for sync)
export const CreateTransactionInputSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: TransactionTypeSchema,
  merchant: z.string().min(1, 'Merchant is required').max(255, 'Merchant too long'),
  source: TransactionSourceSchema,
  timestamp: z.string().datetime({ message: 'Invalid timestamp' }).transform((s: string) => new Date(s)),
  rawTextHash: z.string().optional(),
  balance: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Sync transactions request
export const SyncTransactionsBodySchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  deviceFingerprint: z.string().optional(),
  transactions: z.array(CreateTransactionInputSchema).min(1, 'At least one transaction required'),
});

// Get transactions query
export const GetTransactionsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  type: TransactionTypeSchema.optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

// Update category request
export const UpdateCategoryBodySchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  learn: z.boolean().default(true),
});

export const TransactionIdParamsSchema = z.object({
  id: z.string().uuid('Invalid transaction ID'),
});

// Types
export type CreateTransactionInput = z.infer<typeof CreateTransactionInputSchema>;
export type SyncTransactionsBody = z.infer<typeof SyncTransactionsBodySchema>;
export type GetTransactionsQuery = z.infer<typeof GetTransactionsQuerySchema>;
export type UpdateCategoryBody = z.infer<typeof UpdateCategoryBodySchema>;
export type TransactionIdParams = z.infer<typeof TransactionIdParamsSchema>;
