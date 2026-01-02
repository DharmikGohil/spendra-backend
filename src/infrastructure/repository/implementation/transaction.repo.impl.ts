import { Transaction } from '../../../domain/entities/transaction.entity.js';
import {
  ITransactionRepository,
  TransactionFilterOptions,
  SpendingSummaryItem,
  SaveManyResult,
} from '../../../domain/interfaces/repos/transaction.repo.js';
import { TransactionMapper } from '../mappers/transaction.mapper.js';
import { prisma } from '../../database/client.js';

/**
 * Transaction repository implementation using Prisma.
 */
export class TransactionRepository implements ITransactionRepository {
  /**
   * Save a new transaction to the database.
   */
  async save(transaction: Transaction): Promise<Transaction> {
    const data = TransactionMapper.toPersistence(transaction);
    const created = await prisma.transaction.create({ data });
    return TransactionMapper.toDomain(created);
  }

  /**
   * Save multiple transactions, skipping duplicates by hash.
   */
  async saveMany(transactions: Transaction[]): Promise<SaveManyResult> {
    let created = 0;
    let skipped = 0;

    for (const transaction of transactions) {
      const existing = await this.findByHash(transaction.rawTextHash);
      if (existing) {
        skipped++;
        continue;
      }

      const data = TransactionMapper.toPersistence(transaction);
      await prisma.transaction.create({ data });
      created++;
    }

    return { created, skipped };
  }

  /**
   * Find a transaction by its ID.
   */
  async findById(id: string): Promise<Transaction | null> {
    const transaction = await prisma.transaction.findUnique({ where: { id } });
    return transaction ? TransactionMapper.toDomain(transaction) : null;
  }

  /**
   * Find a transaction by its raw text hash.
   */
  async findByHash(hash: string): Promise<Transaction | null> {
    const transaction = await prisma.transaction.findUnique({
      where: { rawTextHash: hash },
    });
    return transaction ? TransactionMapper.toDomain(transaction) : null;
  }

  /**
   * Find transactions for a user with optional filters.
   */
  async findByUserId(
    userId: string,
    options: TransactionFilterOptions
  ): Promise<Transaction[]> {
    const { startDate, endDate, categoryId, type, limit, offset } = options;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        ...(startDate && { timestamp: { gte: startDate } }),
        ...(endDate && { timestamp: { lte: endDate } }),
        ...(categoryId && { categoryId }),
        ...(type && { type }),
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });

    return transactions.map(TransactionMapper.toDomain);
  }

  /**
   * Update an existing transaction.
   */
  async update(transaction: Transaction): Promise<Transaction> {
    const data = TransactionMapper.toPersistence(transaction);
    const updated = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        categoryId: data.categoryId,
        categoryConfidence: data.categoryConfidence,
        isManuallyEdited: data.isManuallyEdited,
        updatedAt: data.updatedAt,
      },
    });
    return TransactionMapper.toDomain(updated);
  }

  /**
   * Get spending summary grouped by category for a date range.
   */
  async getSpendingSummary(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SpendingSummaryItem[]> {
    const result = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'DEBIT',
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { amount: true },
      _count: true,
    });

    const categoryIds = result
      .map((r) => r.categoryId)
      .filter((id): id is string => id !== null);

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    return result
      .filter((r) => r.categoryId !== null)
      .map((r) => ({
        categoryId: r.categoryId!,
        categoryName: categoryMap.get(r.categoryId!) ?? 'Unknown',
        total: Number(r._sum.amount ?? 0),
        count: r._count,
      }))
      .sort((a, b) => b.total - a.total);
  }
}
