import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { GetSpendingSummaryController } from '../controllers/insights/get-spending-summary.controller.js';
import { validateSchema } from '../middleware/validation.middleware.js';
import { deviceAuthMiddleware } from '../middleware/device-auth.middleware.js';
import { DateRangeQuerySchema, DateRangeQuery } from '../schemas/insights.schema.js';

// Import use cases and repositories
import { GetSpendingSummaryUseCase } from '../../domain/useCases/insights/get-spending-summary.usecase.js';
import { userRepository, transactionRepository } from '../../infrastructure/repository/implementation/instances.js';

// Initialize use cases
const getSpendingSummaryUseCase = new GetSpendingSummaryUseCase(transactionRepository);

// Initialize controllers
const getSpendingSummaryController = new GetSpendingSummaryController(
  getSpendingSummaryUseCase,
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
   * Get daily AI summary (placeholder for now)
   */
  fastify.get('/daily', { preHandler: [deviceAuthMiddleware] }, async (
    _request: FastifyRequest,
    reply: FastifyReply
  ) => {
    // TODO: Implement AI summary generation
    // For now, return a structured placeholder
    reply.send({
      summary: 'AI daily summary will be generated here based on your transactions.',
      insights: [
        { type: 'info', message: 'Connect your bank SMS to start tracking' },
      ],
      generatedAt: new Date().toISOString(),
    });
  });
}
