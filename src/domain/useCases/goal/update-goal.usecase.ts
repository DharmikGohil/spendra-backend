import { Goal } from '../../entities/goal.entity.js';
import { GoalRepository } from '../../repositories/goal.repository.js';

export class UpdateGoalUseCase {
    constructor(private goalRepo: GoalRepository) { }

    async execute(id: string, amountToAdd: number): Promise<Goal> {
        const goal = await this.goalRepo.findById(id);
        if (!goal) {
            throw new Error('Goal not found');
        }

        const updatedGoal = goal.addAmount(amountToAdd);
        await this.goalRepo.save(updatedGoal);
        return updatedGoal;
    }
}
