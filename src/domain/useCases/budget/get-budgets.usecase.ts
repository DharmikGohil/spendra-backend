import { Budget } from '../../entities/budget.entity.js';
import { BudgetRepository } from '../../repositories/budget.repository.js';

export class GetBudgetsUseCase {
    constructor(private budgetRepo: BudgetRepository) { }

    async execute(userId: string): Promise<Budget[]> {
        return this.budgetRepo.findByUser(userId);
    }
}
