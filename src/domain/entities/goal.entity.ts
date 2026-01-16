import { v4 as uuidv4 } from 'uuid';

export interface CreateGoalProps {
    userId: string;
    name: string;
    targetAmount: number;
    currentAmount?: number;
    deadline?: Date;
    icon?: string;
}

export class Goal {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly name: string,
        public readonly targetAmount: number,
        public readonly currentAmount: number,
        public readonly deadline: Date | undefined,
        public readonly icon: string | undefined,
        public readonly isCompleted: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    static create(props: CreateGoalProps): Goal {
        const now = new Date();
        return new Goal(
            uuidv4(),
            props.userId,
            props.name,
            props.targetAmount,
            props.currentAmount || 0,
            props.deadline,
            props.icon,
            false,
            now,
            now
        );
    }

    static reconstitute(props: {
        id: string;
        userId: string;
        name: string;
        targetAmount: number;
        currentAmount: number;
        deadline?: Date;
        icon?: string;
        isCompleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }): Goal {
        return new Goal(
            props.id,
            props.userId,
            props.name,
            props.targetAmount,
            props.currentAmount,
            props.deadline,
            props.icon,
            props.isCompleted,
            props.createdAt,
            props.updatedAt
        );
    }

    addAmount(amount: number): Goal {
        const newAmount = this.currentAmount + amount;
        return new Goal(
            this.id,
            this.userId,
            this.name,
            this.targetAmount,
            newAmount,
            this.deadline,
            this.icon,
            newAmount >= this.targetAmount,
            this.createdAt,
            new Date()
        );
    }
}
