import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { errorHandler } from '../presentation/middleware/error.middleware.js';
import { transactionRoutes } from '../presentation/routes/transaction.routes.js';
import { categoryRoutes } from '../presentation/routes/category.routes.js';
import { insightsRoutes } from '../presentation/routes/insights.routes.js';

export interface AppConfig {
  logger?: boolean | object;
}

/**
 * Build and configure the Fastify application
 */
export async function buildApp(config: AppConfig = {}): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: config.logger ?? {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: { colorize: true },
            }
          : undefined,
    },
  });

  // Register plugins
  await fastify.register(cors, {
    origin: true, // Allow all origins in dev
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Health check
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  });

  // Register routes
  await fastify.register(transactionRoutes, { prefix: '/api/transactions' });
  await fastify.register(categoryRoutes, { prefix: '/api/categories' });
  await fastify.register(insightsRoutes, { prefix: '/api/insights' });

  // Global error handler
  fastify.setErrorHandler(errorHandler);

  return fastify;
}
