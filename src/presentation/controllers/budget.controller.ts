import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateBudgetUseCase } from '../../domain/useCases/budget/create-budget.usecase.js';
import { GetBudgetsUseCase } from '../../domain/useCases/budget/get-budgets.usecase.js';
import { BudgetPeriod } from '../../domain/entities/budget.entity.js';

export class BudgetController {
    constructor(
        private createBudgetUseCase: CreateBudgetUseCase,
        private getBudgetsUseCase: GetBudgetsUseCase
    ) { }

    async create(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const { userId, categoryId, amount, period } = req.body as {
                userId: string;
                categoryId: string;
                amount: number | string;
                period?: string;
            };

            // Basic validation
            if (!userId || !categoryId || !amount) {
                reply.status(400).send({ error: 'Missing required fields' });
                return;
            }

            const budget = await this.createBudgetUseCase.execute({
                userId,
                categoryId,
                amount: Number(amount),
                period: (period as BudgetPeriod) || 'MONTHLY',
            });

            reply.status(201).send(budget);
        } catch (error) {
            console.error('Error creating budget:', error);
            reply.status(500).send({ error: 'Internal server error' });
        }
    }

    async getAll(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const { userId } = req.query as { userId: string };

            if (!userId) {
                reply.status(400).send({ error: 'Missing userId' });
                return;
            }

            const budgets = await this.getBudgetsUseCase.execute(userId);
            reply.send(budgets);
        } catch (error) {
            console.error('Error fetching budgets:', error);
            reply.status(500).send({ error: 'Internal server error' });
        }
    }
}
