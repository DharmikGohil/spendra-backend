import { v4 as uuidv4 } from 'uuid';

export type BudgetPeriod = 'MONTHLY' | 'WEEKLY' | 'YEARLY';

export interface CreateBudgetProps {
    userId: string;
    categoryId: string;
    amount: number;
    period: BudgetPeriod;
}

export class Budget {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly categoryId: string,
        public readonly amount: number,
        public readonly period: BudgetPeriod,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    static create(props: CreateBudgetProps): Budget {
        const now = new Date();
        return new Budget(
            uuidv4(),
            props.userId,
            props.categoryId,
            props.amount,
            props.period,
            now,
            now
        );
    }

    static reconstitute(props: {
        id: string;
        userId: string;
        categoryId: string;
        amount: number;
        period: BudgetPeriod;
        createdAt: Date;
        updatedAt: Date;
    }): Budget {
        return new Budget(
            props.id,
            props.userId,
            props.categoryId,
            props.amount,
            props.period,
            props.createdAt,
            props.updatedAt
        );
    }

    updateAmount(amount: number): Budget {
        return new Budget(
            this.id,
            this.userId,
            this.categoryId,
            amount,
            this.period,
            this.createdAt,
            new Date()
        );
    }
}
