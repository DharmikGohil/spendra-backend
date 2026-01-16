import { FastifyReply, FastifyRequest } from 'fastify';
import { GetSuggestionsUseCase } from '../../domain/useCases/suggestions/get-suggestions.usecase.js';
import { User } from '../../domain/entities/user.entity.js';
import { IUserRepository } from '../../domain/interfaces/repos/user.repo.js';

export class SuggestionsController {
    constructor(
        private getSuggestionsUseCase: GetSuggestionsUseCase,
        private userRepo: IUserRepository
    ) { }

    async getSuggestions(req: FastifyRequest, reply: FastifyReply) {
        const deviceId = req.deviceId;
        if (!deviceId) {
            return reply.status(400).send({ error: 'Device ID required' });
        }

        let user = await this.userRepo.findByDeviceId(deviceId);
        if (!user) {
            // If user doesn't exist, create one (lazy creation pattern used in other controllers)
            user = User.create({ deviceId });
            user = await this.userRepo.save(user);
        }

        const suggestions = await this.getSuggestionsUseCase.execute(user.id);
        return reply.send(suggestions);
    }
}
