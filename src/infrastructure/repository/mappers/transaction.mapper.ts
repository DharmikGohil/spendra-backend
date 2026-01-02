import { Transaction as PrismaTransaction, TransactionType as PrismaTransactionType, TransactionSource as PrismaTransactionSource } from '@prisma/client';
import { Transaction, TransactionType, TransactionSource } from '../../../domain/entities/transaction.entity.js';
import { Prisma } from '@prisma/client';

/**
 * Mapper for converting between Transaction domain entity and Prisma model.
 */
export class TransactionMapper {
  /**
   * Convert Prisma model to domain entity.
   */
  static toDomain(prismaTransaction: PrismaTransaction): Transaction {
    return Transaction.reconstitute({
      id: prismaTransaction.id,
      userId: prismaTransaction.userId,
      amount: Number(prismaTransaction.amount),
      type: prismaTransaction.type as TransactionType,
      merchant: prismaTransaction.merchant,
      merchantNormalized: prismaTransaction.merchantNormalized ?? '',
      source: prismaTransaction.source as TransactionSource,
      categoryId: prismaTransaction.categoryId ?? undefined,
      categoryConfidence: prismaTransaction.categoryConfidence ?? undefined,
      timestamp: prismaTransaction.timestamp,
      rawTextHash: prismaTransaction.rawTextHash,
      balance: prismaTransaction.balance ? Number(prismaTransaction.balance) : undefined,
      metadata: prismaTransaction.metadata as Record<string, unknown>,
      isManuallyEdited: prismaTransaction.isManuallyEdited,
      createdAt: prismaTransaction.createdAt,
      updatedAt: prismaTransaction.updatedAt,
    });
  }

  /**
   * Convert domain entity to Prisma create data.
   */
  static toPersistence(transaction: Transaction): Prisma.TransactionUncheckedCreateInput {
    return {
      id: transaction.id,
      userId: transaction.userId,
      amount: new Prisma.Decimal(transaction.amount),
      type: transaction.type as PrismaTransactionType,
      merchant: transaction.merchant,
      merchantNormalized: transaction.merchantNormalized,
      source: transaction.source as PrismaTransactionSource,
      categoryId: transaction.categoryId ?? null,
      categoryConfidence: transaction.categoryConfidence ?? null,
      timestamp: transaction.timestamp,
      rawTextHash: transaction.rawTextHash,
      balance: transaction.balance ? new Prisma.Decimal(transaction.balance) : null,
      metadata: transaction.metadata as Prisma.InputJsonValue,
      isManuallyEdited: transaction.isManuallyEdited,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
