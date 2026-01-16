import { BudgetRepository } from '../../domain/repositories/budget.repository.js';
import { Budget, BudgetPeriod } from '../../domain/entities/budget.entity.js';
import { PrismaClient } from '@prisma/client';

export class PrismaBudgetRepository implements BudgetRepository {
    constructor(private prisma: PrismaClient) { }

    async save(budget: Budget): Promise<void> {
        await this.prisma.budget.upsert({
            where: {
                id: budget.id,
            },
            update: {
                amount: budget.amount,
                period: budget.period,
                updatedAt: budget.updatedAt,
            },
            create: {
                id: budget.id,
                userId: budget.userId,
                categoryId: budget.categoryId,
                amount: budget.amount,
                period: budget.period,
                createdAt: budget.createdAt,
                updatedAt: budget.updatedAt,
            },
        });
    }

    async findByUser(userId: string): Promise<Budget[]> {
        const budgets = await this.prisma.budget.findMany({
            where: { userId },
        });
        return budgets.map(this.toDomain);
    }

    async findByUserAndCategory(userId: string, categoryId: string): Promise<Budget | null> {
        const budget = await this.prisma.budget.findUnique({
            where: {
                userId_categoryId_period: {
                    userId,
                    categoryId,
                    period: 'MONTHLY', // Defaulting to MONTHLY for now as per plan
                },
            },
        });
        return budget ? this.toDomain(budget) : null;
    }

    private toDomain(prismaBudget: any): Budget {
        return Budget.reconstitute({
            id: prismaBudget.id,
            userId: prismaBudget.userId,
            categoryId: prismaBudget.categoryId,
            amount: prismaBudget.amount.toNumber(),
            period: prismaBudget.period as BudgetPeriod,
            createdAt: prismaBudget.createdAt,
            updatedAt: prismaBudget.updatedAt,
        });
    }
}
