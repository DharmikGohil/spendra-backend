import { BaseError } from './base.error.js';
import { TRANSACTION_ERROR_CODES } from './transaction.codes.js';

/**
 * Error thrown when a transaction is not found.
 */
export class TransactionNotFoundError extends BaseError {
  constructor(id: string) {
    super(
      TRANSACTION_ERROR_CODES.NOT_FOUND,
      `Transaction ${id} not found`,
      404
    );
  }
}

/**
 * Error thrown when transaction amount is invalid.
 */
export class InvalidTransactionAmountError extends BaseError {
  constructor(amount: number) {
    super(
      TRANSACTION_ERROR_CODES.INVALID_AMOUNT,
      `Invalid transaction amount: ${amount}. Amount must be positive.`,
      400
    );
  }
}

/**
 * Error thrown when transaction type is invalid.
 */
export class InvalidTransactionTypeError extends BaseError {
  constructor(type: string) {
    super(
      TRANSACTION_ERROR_CODES.INVALID_TYPE,
      `Invalid transaction type: ${type}. Must be DEBIT or CREDIT.`,
      400
    );
  }
}

/**
 * Error thrown when merchant name is invalid.
 */
export class InvalidMerchantError extends BaseError {
  constructor(merchant: string) {
    super(
      TRANSACTION_ERROR_CODES.INVALID_MERCHANT,
      `Invalid merchant name: "${merchant}". Merchant cannot be empty.`,
      400
    );
  }
}

/**
 * Error thrown when transaction source is invalid.
 */
export class InvalidTransactionSourceError extends BaseError {
  constructor(source: string) {
    super(
      TRANSACTION_ERROR_CODES.INVALID_SOURCE,
      `Invalid transaction source: ${source}. Must be UPI, CARD, BANK, CASH, or OTHER.`,
      400
    );
  }
}

/**
 * Error thrown when transaction sync fails.
 */
export class TransactionSyncFailedError extends BaseError {
  constructor(reason: string) {
    super(
      TRANSACTION_ERROR_CODES.SYNC_FAILED,
      `Transaction sync failed: ${reason}`,
      500
    );
  }
}
