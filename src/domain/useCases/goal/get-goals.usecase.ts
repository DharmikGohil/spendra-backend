import { Goal } from '../../entities/goal.entity.js';
import { GoalRepository } from '../../repositories/goal.repository.js';

export class GetGoalsUseCase {
    constructor(private goalRepo: GoalRepository) { }

    async execute(userId: string): Promise<Goal[]> {
        return this.goalRepo.findByUser(userId);
    }
}
