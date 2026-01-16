import { Budget } from '../entities/budget.entity.js';

export interface BudgetRepository {
    save(budget: Budget): Promise<void>;
    findByUser(userId: string): Promise<Budget[]>;
    findByUserAndCategory(userId: string, categoryId: string): Promise<Budget | null>;
}
