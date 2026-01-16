import { ITransactionRepository } from '../../interfaces/repos/transaction.repo.js';
import { BudgetRepository } from '../../repositories/budget.repository.js';
import { GoalRepository } from '../../repositories/goal.repository.js';

export interface DailySummary {
    safeToSpend: number;
    totalSpentToday: number;
    daysRemaining: number;
    monthlyIncome: number;
    totalBudgeted: number;
    totalGoalSavings: number;
    message: string;
}

export class GetDailySummaryUseCase {
    constructor(
        private transactionRepo: ITransactionRepository,
        private budgetRepo: BudgetRepository,
        private goalRepo: GoalRepository
    ) { }

    async execute(userId: string): Promise<DailySummary> {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysInMonth = endOfMonth.getDate();
        const daysRemaining = daysInMonth - now.getDate() + 1; // Include today

        // 1. Calculate Monthly Income (Avg of last 3 months)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        const transactions = await this.transactionRepo.findByUserId(userId, {
            startDate: threeMonthsAgo,
            endDate: now,
            limit: 10000,
            offset: 0
        });

        let totalIncome = 0;
        let totalSpentToday = 0;
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        for (const t of transactions) {
            if (t.type === 'CREDIT') {
                totalIncome += t.amount;
            }
            if (t.type === 'DEBIT' && t.timestamp >= todayStart) {
                totalSpentToday += t.amount;
            }
        }
        const monthlyIncome = totalIncome / 3;

        // 2. Get Active Budgets
        const budgets = await this.budgetRepo.findByUser(userId);
        const totalBudgeted = budgets.reduce((sum: number, b: any) => sum + b.amount, 0);

        // 3. Get Active Goals (Monthly Contribution)
        // Assuming goals have a target amount and maybe a deadline.
        // For now, let's assume we want to save towards all incomplete goals.
        // Or better, if we have a "monthly savings" field.
        // Since we don't, let's assume 20% of income if no specific goals, or sum of goal targets / months to deadline.
        // For MVP, let's use a simple heuristic: Sum of goal target amounts / 12 (1 year horizon) or just 0 if no deadline.
        // Actually, let's just use the "Safe to Save" suggestion logic or 0 if not set.
        // Let's fetch goals.
        const goals = await this.goalRepo.findByUser(userId);
        const activeGoals = goals.filter((g: any) => !g.isCompleted);
        // Simple heuristic: Allocate 10% of target per month for active goals
        const totalGoalSavings = activeGoals.reduce((sum: number, g: any) => sum + (g.targetAmount * 0.1), 0);

        // 4. Calculate Safe to Spend
        // Formula: (Income - Budgets - Savings) / Days Remaining
        // But wait, "Budgets" usually INCLUDES expenses.
        // If I have a budget for Food, that's part of my spending.
        // Safe to Spend usually means "Discretionary" safe to spend.
        // Or it means "Daily Budget" to stay within limits.

        // Let's refine the formula:
        // Total Available = Income - Savings - Fixed Bills (if we knew them).
        // Since we use Budgets to track spending, maybe:
        // Remaining Budget = Total Budgeted - Total Spent this Month.
        // Safe to Spend Today = Remaining Budget / Days Remaining.

        // Let's go with the "Remaining Budget" approach as it's more standard for "Safe to Spend".
        // We need total spent this month.
        let totalSpentMonth = 0;
        for (const t of transactions) {
            if (t.type === 'DEBIT' && t.timestamp >= startOfMonth) {
                totalSpentMonth += t.amount;
            }
        }

        // If no budgets set, use Income as the limit.
        const limit = totalBudgeted > 0 ? totalBudgeted : monthlyIncome;
        const remaining = limit - totalSpentMonth - totalGoalSavings;
        const safeToSpend = Math.max(0, remaining / daysRemaining);

        return {
            safeToSpend,
            totalSpentToday,
            daysRemaining,
            monthlyIncome,
            totalBudgeted,
            totalGoalSavings,
            message: safeToSpend > 0 ? "You are on track!" : "You've exceeded your daily limit."
        };
    }
}
