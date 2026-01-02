import { FastifyReply, FastifyRequest } from 'fastify';
import { UpdateTransactionCategoryUseCase } from '../../../domain/useCases/transaction/update-transaction-category.usecase.js';
import { UpdateCategoryBody, TransactionIdParams } from '../../schemas/transaction.schema.js';

export class UpdateCategoryController {
  constructor(
    private readonly updateTransactionCategoryUseCase: UpdateTransactionCategoryUseCase
  ) {}

  /**
   * Handles PATCH /api/transactions/:id/category
   * Update transaction category (user correction)
   */
  async updateCategory(
    request: FastifyRequest<{ Params: TransactionIdParams; Body: UpdateCategoryBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const { categoryId, learn } = request.body;

    await this.updateTransactionCategoryUseCase.execute({
      transactionId: id,
      categoryId,
      learn,
    });

    reply.send({ success: true });
  }
}
