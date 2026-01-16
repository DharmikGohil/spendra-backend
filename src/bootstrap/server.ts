import { buildApp } from './app.js';
import { connectDatabase, disconnectDatabase } from '../infrastructure/database/client.js';
import { categorizationService } from '../infrastructure/services/categorization.service.instance.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

/**
 * Start the server with all required initialization
 */
export async function startServer(): Promise<void> {
  console.log('🚀 Starting Finance Tracker API...');

  try {
    // Connect to database
    await connectDatabase();

    // Initialize categorization service (loads merchant mappings)
    await categorizationService.initialize();

    // Build and start server
    const server = await buildApp();
    await server.listen({ port: PORT, host: HOST });

    console.log(`\n✅ Server running at http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`\n📌 Available endpoints:`);
    console.log(`   POST /api/transactions/sync   - Sync transactions from device`);
    console.log(`   GET  /api/transactions        - List transactions`);
    console.log(`   PATCH /api/transactions/:id/category - Update category`);
    console.log(`   GET  /api/categories          - List categories`);
    console.log(`   GET  /api/categories/tree     - Category tree`);
    console.log(`   GET  /api/insights/spending   - Spending breakdown`);
    console.log(`   GET  /api/insights/daily      - Daily AI summary`);
    console.log(`   GET  /api/budgets             - List budgets`);
    console.log(`   GET  /api/goals               - List goals\n`);

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\n🛑 Shutting down...');
      await server.close();
      await disconnectDatabase();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err: unknown) {
    console.error('❌ Failed to start server:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
