import { TransactionType, TransactionSource } from '../../entities/transaction.entity.js';
import { CategoryDTO } from './category.dto.js';

/**
 * Input for creating a transaction during sync.
 */
export interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  merchant: string;
  source: TransactionSource;
  timestamp: Date;
  rawTextHash?: string;
  balance?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Request DTO for syncing transactions from a device.
 */
export interface SyncTransactionsRequestDTO {
  deviceId: string;
  deviceFingerprint?: string;
  transactions: CreateTransactionInput[];
}

/**
 * Response DTO for sync transactions operation.
 */
export interface SyncTransactionsResponseDTO {
  success: boolean;
  created: number;
  skipped: number;
  errors: string[];
  data: TransactionDTO[];
}

/**
 * Request DTO for getting transactions.
 */
export interface GetTransactionsRequestDTO {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  type?: TransactionType;
  limit: number;
  offset: number;
}

/**
 * Transaction DTO for API responses.
 */
export interface TransactionDTO {
  id: string;
  amount: number;
  type: TransactionType;
  merchant: string;
  source: TransactionSource;
  category: CategoryDTO | null;
  categoryConfidence: number | null;
  timestamp: string;
  balance: number | null;
  isManuallyEdited: boolean;
}

/**
 * Pagination DTO for list responses.
 */
export interface PaginationDTO {
  limit: number;
  offset: number;
  count: number;
}

/**
 * Response DTO for getting transactions.
 */
export interface GetTransactionsResponseDTO {
  data: TransactionDTO[];
  pagination: PaginationDTO;
}

/**
 * Request DTO for updating transaction category.
 */
export interface UpdateCategoryRequestDTO {
  transactionId: string;
  categoryId: string;
  learn: boolean;
}
