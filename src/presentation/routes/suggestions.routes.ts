import { FastifyInstance } from 'fastify';
import { SuggestionsController } from '../controllers/suggestions.controller.js';
import { GetSuggestionsUseCase } from '../../domain/useCases/suggestions/get-suggestions.usecase.js';
import { PrismaBudgetRepository } from '../../infrastructure/repositories/budget.repository.impl.js';
import { PrismaGoalRepository } from '../../infrastructure/repositories/goal.repository.impl.js';
import { TransactionRepository } from '../../infrastructure/repository/implementation/transaction.repo.impl.js';
import { CategoryRepository } from '../../infrastructure/repository/implementation/category.repo.impl.js';
import { UserRepository } from '../../infrastructure/repository/implementation/user.repo.impl.js';
import { prisma } from '../../infrastructure/database/client.js';

// Initialize dependencies
const budgetRepo = new PrismaBudgetRepository(prisma);
const goalRepo = new PrismaGoalRepository(prisma);
const transactionRepo = new TransactionRepository();
const categoryRepo = new CategoryRepository();
const userRepo = new UserRepository();

const getSuggestionsUseCase = new GetSuggestionsUseCase(
    transactionRepo,
    budgetRepo,
    goalRepo,
    categoryRepo
);

const suggestionsController = new SuggestionsController(getSuggestionsUseCase, userRepo);

export async function suggestionsRoutes(fastify: FastifyInstance) {
    fastify.get('/', (req, reply) => suggestionsController.getSuggestions(req, reply));
}
