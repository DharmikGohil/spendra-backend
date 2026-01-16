import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateGoalUseCase } from '../../domain/useCases/goal/create-goal.usecase.js';
import { UpdateGoalUseCase } from '../../domain/useCases/goal/update-goal.usecase.js';
import { GetGoalsUseCase } from '../../domain/useCases/goal/get-goals.usecase.js';

export class GoalController {
    constructor(
        private createGoalUseCase: CreateGoalUseCase,
        private updateGoalUseCase: UpdateGoalUseCase,
        private getGoalsUseCase: GetGoalsUseCase
    ) { }

    async create(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const { userId, name, targetAmount, deadline, icon } = req.body as {
                userId: string;
                name: string;
                targetAmount: number | string;
                deadline?: string;
                icon?: string;
            };

            if (!userId || !name || !targetAmount) {
                reply.status(400).send({ error: 'Missing required fields' });
                return;
            }

            const goal = await this.createGoalUseCase.execute({
                userId,
                name,
                targetAmount: Number(targetAmount),
                deadline: deadline ? new Date(deadline) : undefined,
                icon,
            });

            reply.status(201).send(goal);
        } catch (error) {
            console.error('Error creating goal:', error);
            reply.status(500).send({ error: 'Internal server error' });
        }
    }

    async update(req: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const { id } = req.params as { id: string };
            const { amountToAdd } = req.body as { amountToAdd: number };

            if (!id || amountToAdd === undefined) {
                reply.status(400).send({ error: 'Missing required fields' });
                return;
            }

            const goal = await this.updateGoalUseCase.execute(id, Number(amountToAdd));
            reply.send(goal);
        } catch (error) {
            console.error('Error updating goal:', error);
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

            const goals = await this.getGoalsUseCase.execute(userId);
            reply.send(goals);
        } catch (error) {
            console.error('Error fetching goals:', error);
            reply.status(500).send({ error: 'Internal server error' });
        }
    }
}
