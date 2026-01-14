import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SyncTransactionsController } from '../controllers/transaction/sync-transactions.controller.js';
import { GetTransactionsController } from '../controllers/transaction/get-transactions.controller.js';
import { UpdateCategoryController } from '../controllers/transaction/update-category.controller.js';
import { validateSchema } from '../middleware/validation.middleware.js';
import { deviceAuthMiddleware } from '../middleware/device-auth.middleware.js';
import {
  SyncTransactionsBodySchema,
  GetTransactionsQuerySchema,
  UpdateCategoryBodySchema,
  TransactionIdParamsSchema,
  SyncTransactionsBody,
  GetTransactionsQuery,
  UpdateCategoryBody,
  TransactionIdParams,
} from '../schemas/transaction.schema.js';

// Import use cases and repositories
import { SyncTransactionsUseCase } from '../../domain/useCases/transaction/sync-transactions.usecase.js';
import { GetTransactionsUseCase } from '../../domain/useCases/transaction/get-transactions.usecase.js';
import { UpdateTransactionCategoryUseCase } from '../../domain/useCases/transaction/update-transaction-category.usecase.js';
import { userRepository, transactionRepository, categoryRepository } from '../../infrastructure/repository/implementation/instances.js';
import { categorizationService } from '../../infrastructure/services/categorization.service.instance.js';

// Initialize use cases
const syncTransactionsUseCase = new SyncTransactionsUseCase(
  userRepository,
  transactionRepository,
  categorizationService,
  categoryRepository
);

const getTransactionsUseCase = new GetTransactionsUseCase(
  transactionRepository,
  categoryRepository
);

const updateTransactionCategoryUseCase = new UpdateTransactionCategoryUseCase(
  transactionRepository,
  categorizationService
);

// Initialize controllers
const syncTransactionsController = new SyncTransactionsController(syncTransactionsUseCase);
const getTransactionsController = new GetTransactionsController(
  getTransactionsUseCase,
  userRepository
);
const updateCategoryController = new UpdateCategoryController(updateTransactionCategoryUseCase);

export async function transactionRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /api/transactions/sync
   * Bulk sync transactions from mobile device
   */
  fastify.post(
    '/sync',
    {
      preHandler: [validateSchema({ body: SyncTransactionsBodySchema })],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return syncTransactionsController.syncTransactions(
        request as FastifyRequest<{ Body: SyncTransactionsBody }>,
        reply
      );
    }
  );

  /**
   * GET /api/transactions
   * List transactions with filters
   */
  fastify.get(
    '/',
    {
      preHandler: [
        deviceAuthMiddleware,
        validateSchema({ query: GetTransactionsQuerySchema }),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return getTransactionsController.getTransactions(
        request as FastifyRequest<{ Querystring: GetTransactionsQuery }>,
        reply
      );
    }
  );

  /**
   * PATCH /api/transactions/:id/category
   * Update transaction category (user correction)
   */
  fastify.patch(
    '/:id/category',
    {
      preHandler: [
        validateSchema({
          params: TransactionIdParamsSchema,
          body: UpdateCategoryBodySchema,
        }),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return updateCategoryController.updateCategory(
        request as FastifyRequest<{ Params: TransactionIdParams; Body: UpdateCategoryBody }>,
        reply
      );
    }
  );
}
