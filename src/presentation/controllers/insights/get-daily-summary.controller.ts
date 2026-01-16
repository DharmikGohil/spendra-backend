import { FastifyReply, FastifyRequest } from 'fastify';
import { GetDailySummaryUseCase } from '../../../domain/useCases/insights/get-daily-summary.usecase.js';
import { IUserRepository } from '../../../domain/interfaces/repos/user.repo.js';
import { User } from '../../../domain/entities/user.entity.js';

export class GetDailySummaryController {
    constructor(
        private getDailySummaryUseCase: GetDailySummaryUseCase,
        private userRepo: IUserRepository
    ) { }

    async getDailySummary(req: FastifyRequest, reply: FastifyReply) {
        const deviceId = req.deviceId;
        if (!deviceId) {
            return reply.status(400).send({ error: 'Device ID required' });
        }

        let user = await this.userRepo.findByDeviceId(deviceId);
        if (!user) {
            user = User.create({ deviceId });
            user = await this.userRepo.save(user);
        }

        const summary = await this.getDailySummaryUseCase.execute(user.id);
        return reply.send(summary);
    }
}
