import { CreateGoalProps, Goal } from '../../entities/goal.entity.js';
import { GoalRepository } from '../../repositories/goal.repository.js';

export class CreateGoalUseCase {
    constructor(private goalRepo: GoalRepository) { }

    async execute(props: CreateGoalProps): Promise<Goal> {
        const goal = Goal.create(props);
        await this.goalRepo.save(goal);
        return goal;
    }
}
