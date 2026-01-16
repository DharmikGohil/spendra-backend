import { FastifyInstance } from 'fastify';
import { PrismaBudgetRepository } from '../../infrastructure/repositories/budget.repository.impl.js';
import { CreateBudgetUseCase } from '../../domain/useCases/budget/create-budget.usecase.js';
import { GetBudgetsUseCase } from '../../domain/useCases/budget/get-budgets.usecase.js';
import { BudgetController } from '../controllers/budget.controller.js';
import { prisma } from '../../infrastructure/database/client.js';

// Initialize dependencies
const budgetRepository = new PrismaBudgetRepository(prisma);
const createBudgetUseCase = new CreateBudgetUseCase(budgetRepository);
const getBudgetsUseCase = new GetBudgetsUseCase(budgetRepository);
const budgetController = new BudgetController(createBudgetUseCase, getBudgetsUseCase);

export async function budgetRoutes(fastify: FastifyInstance): Promise<void> {
    fastify.post('/', (req, reply) => budgetController.create(req, reply));
    fastify.get('/', (req, reply) => budgetController.getAll(req, reply));
}
