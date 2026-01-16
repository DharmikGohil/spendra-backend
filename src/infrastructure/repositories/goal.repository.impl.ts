import { PrismaClient } from '@prisma/client';
import { GoalRepository } from '../../domain/repositories/goal.repository.js';
import { Goal } from '../../domain/entities/goal.entity.js';

export class PrismaGoalRepository implements GoalRepository {
    constructor(private prisma: PrismaClient) { }

    async save(goal: Goal): Promise<void> {
        await this.prisma.goal.upsert({
            where: { id: goal.id },
            update: {
                name: goal.name,
                targetAmount: goal.targetAmount,
                currentAmount: goal.currentAmount,
                deadline: goal.deadline,
                icon: goal.icon,
                isCompleted: goal.isCompleted,
                updatedAt: goal.updatedAt,
            },
            create: {
                id: goal.id,
                userId: goal.userId,
                name: goal.name,
                targetAmount: goal.targetAmount,
                currentAmount: goal.currentAmount,
                deadline: goal.deadline,
                icon: goal.icon,
                isCompleted: goal.isCompleted,
                createdAt: goal.createdAt,
                updatedAt: goal.updatedAt,
            },
        });
    }

    async findById(id: string): Promise<Goal | null> {
        const goal = await this.prisma.goal.findUnique({
            where: { id },
        });
        return goal ? this.toDomain(goal) : null;
    }

    async findByUser(userId: string): Promise<Goal[]> {
        const goals = await this.prisma.goal.findMany({
            where: { userId },
        });
        return goals.map(this.toDomain);
    }

    private toDomain(prismaGoal: any): Goal {
        return Goal.reconstitute({
            id: prismaGoal.id,
            userId: prismaGoal.userId,
            name: prismaGoal.name,
            targetAmount: prismaGoal.targetAmount.toNumber(),
            currentAmount: prismaGoal.currentAmount.toNumber(),
            deadline: prismaGoal.deadline,
            icon: prismaGoal.icon,
            isCompleted: prismaGoal.isCompleted,
            createdAt: prismaGoal.createdAt,
            updatedAt: prismaGoal.updatedAt,
        });
    }
}
