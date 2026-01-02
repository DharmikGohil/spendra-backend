import { FastifyReply, FastifyRequest } from 'fastify';
import { SyncTransactionsUseCase } from '../../../domain/useCases/transaction/sync-transactions.usecase.js';
import { SyncTransactionsBody } from '../../schemas/transaction.schema.js';

export class SyncTransactionsController {
  constructor(private readonly syncTransactionsUseCase: SyncTransactionsUseCase) {}

  /**
   * Handles POST /api/transactions/sync
   * Bulk sync transactions from mobile device
   */
  async syncTransactions(
    request: FastifyRequest<{ Body: SyncTransactionsBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const { deviceId, deviceFingerprint, transactions } = request.body;

    const result = await this.syncTransactionsUseCase.execute({
      deviceId,
      deviceFingerprint,
      transactions: transactions.map((t) => ({
        amount: t.amount,
        type: t.type,
        merchant: t.merchant,
        source: t.source,
        timestamp: t.timestamp,
        rawTextHash: t.rawTextHash,
        balance: t.balance,
        metadata: t.metadata,
      })),
    });

    reply.send({
      success: result.success,
      created: result.created,
      skipped: result.skipped,
      errors: result.errors,
    });
  }
}
