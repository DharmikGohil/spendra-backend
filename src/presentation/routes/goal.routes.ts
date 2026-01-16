import { FastifyInstance } from 'fastify';
import { PrismaGoalRepository } from '../../infrastructure/repositories/goal.repository.impl.js';
import { CreateGoalUseCase } from '../../domain/useCases/goal/create-goal.usecase.js';
import { UpdateGoalUseCase } from '../../domain/useCases/goal/update-goal.usecase.js';
import { GetGoalsUseCase } from '../../domain/useCases/goal/get-goals.usecase.js';
import { GoalController } from '../controllers/goal.controller.js';
import { prisma } from '../../infrastructure/database/client.js';

// Initialize dependencies
const goalRepository = new PrismaGoalRepository(prisma);
const createGoalUseCase = new CreateGoalUseCase(goalRepository);
const updateGoalUseCase = new UpdateGoalUseCase(goalRepository);
const getGoalsUseCase = new GetGoalsUseCase(goalRepository);
const goalController = new GoalController(createGoalUseCase, updateGoalUseCase, getGoalsUseCase);

export async function goalRoutes(fastify: FastifyInstance): Promise<void> {
    fastify.post('/', (req, reply) => goalController.create(req, reply));
    fastify.patch('/:id', (req, reply) => goalController.update(req, reply));
    fastify.get('/', (req, reply) => goalController.getAll(req, reply));
}
