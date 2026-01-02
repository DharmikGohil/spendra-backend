import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import {
  InvalidTransactionAmountError,
  InvalidTransactionTypeError,
  InvalidMerchantError,
  InvalidTransactionSourceError,
} from '../errors/transaction.errors.js';

/**
 * Transaction type - DEBIT (expense) or CREDIT (income)
 */
export type TransactionType = 'DEBIT' | 'CREDIT';

/**
 * Transaction source - where the transaction originated
 */
export type TransactionSource = 'UPI' | 'CARD' | 'BANK' | 'CASH' | 'OTHER';

const VALID_TRANSACTION_TYPES: TransactionType[] = ['DEBIT', 'CREDIT'];
const VALID_TRANSACTION_SOURCES: TransactionSource[] = ['UPI', 'CARD', 'BANK', 'CASH', 'OTHER'];

/**
 * Props for creating a new transaction
 */
export interface CreateTransactionProps {
  userId: string;
  amount: number;
  type: TransactionType;
  merchant: string;
  source: TransactionSource;
  timestamp: Date;
  rawTextHash?: string;
  balance?: number;
  metadata?: Record<string, unknown>;
  categoryId?: string;
  categoryConfidence?: number;
}

/**
 * Transaction entity - Immutable domain object representing a financial transaction.
 */
export class Transaction {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly merchant: string,
    public readonly merchantNormalized: string,
    public readonly source: TransactionSource,
    public readonly categoryId: string | undefined,
    public readonly categoryConfidence: number | undefined,
    public readonly timestamp: Date,
    public readonly rawTextHash: string,
    public readonly balance: number | undefined,
    public readonly metadata: Record<string, unknown>,
    public readonly isManuallyEdited: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    Object.freeze(this);
  }

  /**
   * Normalize merchant name for consistent matching.
   * Converts to uppercase, removes special characters, normalizes whitespace.
   */
  static normalizeMerchant(merchant: string): string {
    return merchant
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generate a hash for deduplication.
   * Uses amount, type, merchant, and timestamp to create unique identifier.
   */
  static generateHash(props: {
    amount: number;
    type: TransactionType;
    merchant: string;
    timestamp: Date;
  }): string {
    const data = `${props.amount}|${props.type}|${props.merchant}|${props.timestamp.toISOString()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
  }

  /**
   * Factory method to create a new Transaction entity.
   * Validates invariants before creation.
   */
  static create(props: CreateTransactionProps): Transaction {
    // Validate amount
    if (props.amount <= 0) {
      throw new InvalidTransactionAmountError(props.amount);
    }

    // Validate type
    if (!VALID_TRANSACTION_TYPES.includes(props.type)) {
      throw new InvalidTransactionTypeError(props.type);
    }

    // Validate merchant
    if (!props.merchant || props.merchant.trim().length === 0) {
      throw new InvalidMerchantError(props.merchant ?? '');
    }

    // Validate source
    if (!VALID_TRANSACTION_SOURCES.includes(props.source)) {
      throw new InvalidTransactionSourceError(props.source);
    }

    const now = new Date();
    const merchantNormalized = Transaction.normalizeMerchant(props.merchant);
    const rawTextHash = props.rawTextHash ?? Transaction.generateHash({
      amount: props.amount,
      type: props.type,
      merchant: props.merchant,
      timestamp: props.timestamp,
    });

    return new Transaction(
      uuidv4(),
      props.userId,
      props.amount,
      props.type,
      props.merchant.trim(),
      merchantNormalized,
      props.source,
      props.categoryId,
      props.categoryConfidence,
      props.timestamp,
      rawTextHash,
      props.balance,
      props.metadata ?? {},
      false,
      now,
      now
    );
  }

  /**
   * Reconstitute a Transaction entity from persistence data.
   * Used by mappers when loading from database.
   */
  static reconstitute(props: {
    id: string;
    userId: string;
    amount: number;
    type: TransactionType;
    merchant: string;
    merchantNormalized: string;
    source: TransactionSource;
    categoryId: string | undefined;
    categoryConfidence: number | undefined;
    timestamp: Date;
    rawTextHash: string;
    balance: number | undefined;
    metadata: Record<string, unknown>;
    isManuallyEdited: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Transaction {
    return new Transaction(
      props.id,
      props.userId,
      props.amount,
      props.type,
      props.merchant,
      props.merchantNormalized,
      props.source,
      props.categoryId,
      props.categoryConfidence,
      props.timestamp,
      props.rawTextHash,
      props.balance,
      props.metadata,
      props.isManuallyEdited,
      props.createdAt,
      props.updatedAt
    );
  }

  /**
   * Create a new Transaction with updated category.
   * Returns a new immutable Transaction instance.
   */
  updateCategory(categoryId: string, confidence: number = 1.0): Transaction {
    return new Transaction(
      this.id,
      this.userId,
      this.amount,
      this.type,
      this.merchant,
      this.merchantNormalized,
      this.source,
      categoryId,
      confidence,
      this.timestamp,
      this.rawTextHash,
      this.balance,
      this.metadata,
      true, // Mark as manually edited
      this.createdAt,
      new Date()
    );
  }

  /**
   * Check if this is a debit (expense) transaction.
   */
  isDebit(): boolean {
    return this.type === 'DEBIT';
  }

  /**
   * Check if this is a credit (income) transaction.
   */
  isCredit(): boolean {
    return this.type === 'CREDIT';
  }
}
