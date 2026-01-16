import { Goal } from '../entities/goal.entity.js';

export interface GoalRepository {
    save(goal: Goal): Promise<void>;
    findById(id: string): Promise<Goal | null>;
    findByUser(userId: string): Promise<Goal[]>;
}
