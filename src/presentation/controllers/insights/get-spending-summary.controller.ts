import { FastifyReply, FastifyRequest } from 'fastify';
import { GetSpendingSummaryUseCase } from '../../../domain/useCases/insights/get-spending-summary.usecase.js';
import { IUserRepository } from '../../../domain/interfaces/repos/user.repo.js';
import { DateRangeQuery } from '../../schemas/insights.schema.js';
import { User } from '../../../domain/entities/user.entity.js';

export class GetSpendingSummaryController {
  constructor(
    private readonly getSpendingSummaryUseCase: GetSpendingSummaryUseCase,
    private readonly userRepo: IUserRepository
  ) {}

  /**
   * Handles GET /api/insights/spending
   * Get spending breakdown by category
   */
  async getSpendingSummary(
    request: FastifyRequest<{ Querystring: DateRangeQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    const { startDate, endDate } = request.query;
    const deviceId = request.deviceId!;

    // Get or create user
    let user = await this.userRepo.findByDeviceId(deviceId);
    if (!user) {
      user = User.create({ deviceId });
      user = await this.userRepo.save(user);
    }

    const result = await this.getSpendingSummaryUseCase.execute({
      userId: user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    reply.send(result);
  }
}
