import { ITransactionRepository } from '../../interfaces/repos/transaction.repo.js';
import { BudgetRepository } from '../../repositories/budget.repository.js';
import { GoalRepository } from '../../repositories/goal.repository.js';
import { ICategoryRepository } from '../../interfaces/repos/category.repo.js';

export interface Suggestion {
    type: 'BUDGET' | 'GOAL';
    title: string;
    description: string;
    data: any;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class GetSuggestionsUseCase {
    constructor(
        private transactionRepo: ITransactionRepository,
        private budgetRepo: BudgetRepository,
        private goalRepo: GoalRepository,
        private categoryRepo: ICategoryRepository
    ) { }

    async execute(userId: string): Promise<Suggestion[]> {
        const suggestions: Suggestion[] = [];
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);

        // 1. Fetch transactions for last 90 days
        const transactions = await this.transactionRepo.findByUserId(userId, {
            startDate: threeMonthsAgo,
            endDate: now,
            limit: 10000,
            offset: 0
        });

        // 2. Analyze Income & Expenses
        let totalIncome = 0;
        let totalExpense = 0;
        const expenseByCategory = new Map<string, number>();

        for (const t of transactions) {
            if (t.type === 'CREDIT') {
                totalIncome += t.amount;
            } else if (t.type === 'DEBIT') {
                totalExpense += t.amount;
                if (t.categoryId) {
                    const current = expenseByCategory.get(t.categoryId) || 0;
                    expenseByCategory.set(t.categoryId, current + t.amount);
                }
            }
        }

        const avgMonthlyIncome = totalIncome / 3;
        const avgMonthlyExpense = totalExpense / 3;

        // 3. Generate Budget Suggestions
        // Fetch existing budgets to avoid duplicates
        const budgets = await this.budgetRepo.findByUser(userId);
        const existingBudgetCategoryIds = new Set(budgets.map((b: { categoryId: string }) => b.categoryId));

        // Let's iterate categories with spend
        for (const [categoryId, totalSpend] of expenseByCategory) {
            if (existingBudgetCategoryIds.has(categoryId)) continue;

            const avgSpend = totalSpend / 3;
            if (avgSpend > 0) {
                const category = await this.categoryRepo.findById(categoryId);
                if (category) {
                    const suggestedAmount = Math.ceil(avgSpend * 1.1); // +10% buffer

                    suggestions.push({
                        type: 'BUDGET',
                        title: `Set a budget for ${category.name}`,
                        description: `You usually spend ₹${Math.round(avgSpend)}/mo. We recommend a limit of ₹${suggestedAmount}.`,
                        data: {
                            categoryId,
                            categoryName: category.name,
                            suggestedAmount,
                            averageSpend: avgSpend
                        },
                        priority: avgSpend > (avgMonthlyIncome * 0.1) ? 'HIGH' : 'MEDIUM' // High priority if > 10% of income
                    });
                }
            }
        }

        // 4. Generate Goal Suggestions (Savings Capacity)
        const safeToSave = avgMonthlyIncome - avgMonthlyExpense;
        if (safeToSave > 500) { // Only suggest if meaningful capacity
            const suggestedSaveAmount = Math.floor(safeToSave * 0.8); // Suggest saving 80% of surplus

            suggestions.push({
                type: 'GOAL',
                title: "Start a Savings Goal",
                description: `You have a surplus of ₹${Math.round(safeToSave)}/mo. You could safely save ₹${suggestedSaveAmount}.`,
                data: {
                    suggestedAmount: suggestedSaveAmount,
                    suggestedName: "Rainy Day Fund"
                },
                priority: 'HIGH'
            });
        }

        return suggestions;
    }
}
