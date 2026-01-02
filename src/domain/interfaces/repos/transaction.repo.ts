import { Transaction, TransactionType } from '../../entities/transaction.entity.js';

/**
 * Filter options for querying transactions.
 */
export interface TransactionFilterOptions {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  type?: TransactionType;
  limit: number;
  offset: number;
}

/**
 * Spending summary item returned by getSpendingSummary.
 */
export interface SpendingSummaryItem {
  categoryId: string;
  categoryName: string;
  total: number;
  count: number;
}

/**
 * Result of saving multiple transactions.
 */
export interface SaveManyResult {
  created: number;
  skipped: number;
}

/**
 * Transaction repository interface - defines data access contract for transactions.
 */
export interface ITransactionRepository {
  /**
   * Save a new transaction to the database.
   */
  save(transaction: Transaction): Promise<Transaction>;

  /**
   * Save multiple transactions, skipping duplicates by hash.
   */
  saveMany(transactions: Transaction[]): Promise<SaveManyResult>;

  /**
   * Find a transaction by its ID.
   */
  findById(id: string): Promise<Transaction | null>;

  /**
   * Find a transaction by its raw text hash.
   */
  findByHash(hash: string): Promise<Transaction | null>;

  /**
   * Find transactions for a user with optional filters.
   */
  findByUserId(userId: string, options: TransactionFilterOptions): Promise<Transaction[]>;

  /**
   * Update an existing transaction.
   */
  update(transaction: Transaction): Promise<Transaction>;

  /**
   * Get spending summary grouped by category for a date range.
   */
  getSpendingSummary(userId: string, startDate: Date, endDate: Date): Promise<SpendingSummaryItem[]>;
}
