import { FastifyReply, FastifyRequest } from 'fastify';
import { GetTransactionsUseCase } from '../../../domain/useCases/transaction/get-transactions.usecase.js';
import { IUserRepository } from '../../../domain/interfaces/repos/user.repo.js';
import { GetTransactionsQuery } from '../../schemas/transaction.schema.js';
import { User } from '../../../domain/entities/user.entity.js';

export class GetTransactionsController {
  constructor(
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
    private readonly userRepo: IUserRepository
  ) {}

  /**
   * Handles GET /api/transactions
   * List transactions with filters
   */
  async getTransactions(
    request: FastifyRequest<{ Querystring: GetTransactionsQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    const { startDate, endDate, categoryId, type, limit, offset } = request.query;
    const deviceId = request.deviceId!;

    // Get or create user
    let user = await this.userRepo.findByDeviceId(deviceId);
    if (!user) {
      user = User.create({ deviceId });
      user = await this.userRepo.save(user);
    }

    const result = await this.getTransactionsUseCase.execute({
      userId: user.id,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      categoryId,
      type,
      limit,
      offset,
    });

    reply.send(result);
  }
}
