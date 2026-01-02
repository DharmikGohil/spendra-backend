import { FastifyReply, FastifyRequest } from 'fastify';
import { GetCategoryTreeUseCase } from '../../../domain/useCases/category/get-category-tree.usecase.js';

export class GetCategoryTreeController {
  constructor(private readonly getCategoryTreeUseCase: GetCategoryTreeUseCase) {}

  /**
   * Handles GET /api/categories/tree
   * Get categories as hierarchical tree
   */
  async getCategoryTree(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.getCategoryTreeUseCase.execute();
    reply.send(result);
  }
}
