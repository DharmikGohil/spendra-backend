import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { GetSpendingSummaryController } from '../controllers/insights/get-spending-summary.controller.js';
import { GetDailySummaryController } from '../controllers/insights/get-daily-summary.controller.js';
import { validateSchema } from '../middleware/validation.middleware.js';
import { deviceAuthMiddleware } from '../middleware/device-auth.middleware.js';
import { DateRangeQuerySchema, DateRangeQuery } from '../schemas/insights.schema.js';

import { GetSpendingSummaryUseCase } from '../../domain/useCases/insights/get-spending-summary.usecase.js';
import { GetDailySummaryUseCase } from '../../domain/useCases/insights/get-daily-summary.usecase.js';
import { PrismaBudgetRepository } from '../../infrastructure/repositories/budget.repository.impl.js';
import { PrismaGoalRepository } from '../../infrastructure/repositories/goal.repository.impl.js';
import { TransactionRepository } from '../../infrastructure/repository/implementation/transaction.repo.impl.js';
import { UserRepository } from '../../infrastructure/repository/implementation/user.repo.impl.js';
import { prisma } from '../../infrastructure/database/client.js';

// Initialize additional dependencies
const budgetRepo = new PrismaBudgetRepository(prisma);
const goalRepo = new PrismaGoalRepository(prisma);
const transactionRepository = new TransactionRepository();
const userRepository = new UserRepository();

// Initialize use cases
const getSpendingSummaryUseCase = new GetSpendingSummaryUseCase(transactionRepository);
const getDailySummaryUseCase = new GetDailySummaryUseCase(transactionRepository, budgetRepo, goalRepo);

// Initialize controllers
const getSpendingSummaryController = new GetSpendingSummaryController(
  getSpendingSummaryUseCase,
  userRepository
);
const getDailySummaryController = new GetDailySummaryController(
  getDailySummaryUseCase,
  userRepository
);

export async function insightsRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /api/insights/spending
   * Get spending breakdown by category
   */
  fastify.get(
    '/spending',
    {
      preHandler: [
        deviceAuthMiddleware,
        validateSchema({ query: DateRangeQuerySchema }),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return getSpendingSummaryController.getSpendingSummary(
        request as FastifyRequest<{ Querystring: DateRangeQuery }>,
        reply
      );
    }
  );

  /**
   * GET /api/insights/daily
   * Get daily AI summary and Safe to Spend
   */
  fastify.get('/daily', { preHandler: [deviceAuthMiddleware] }, async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    return getDailySummaryController.getDailySummary(request, reply);
  });
}
