import { Budget, BudgetPeriod, CreateBudgetProps } from '../../entities/budget.entity.js';
import { BudgetRepository } from '../../repositories/budget.repository.js';

export class CreateBudgetUseCase {
    constructor(private budgetRepo: BudgetRepository) { }

    async execute(props: CreateBudgetProps): Promise<Budget> {
        // Check if budget already exists for this category and period
        // Ideally we should handle this, but for now upsert in repo handles it or we can check here.
        // The repo implementation uses upsert based on ID, but we want uniqueness on userId+categoryId+period.
        // The repo implementation also has findByUserAndCategory.

        let budget = await this.budgetRepo.findByUserAndCategory(props.userId, props.categoryId);

        if (budget) {
            // Update existing budget amount
            budget = budget.updateAmount(props.amount);
        } else {
            // Create new budget
            budget = Budget.create(props);
        }

        await this.budgetRepo.save(budget);
        return budget;
    }
}
