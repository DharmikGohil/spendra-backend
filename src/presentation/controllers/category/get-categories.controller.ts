import { FastifyReply, FastifyRequest } from 'fastify';
import { GetCategoriesUseCase } from '../../../domain/useCases/category/get-categories.usecase.js';

export class GetCategoriesController {
  constructor(private readonly getCategoriesUseCase: GetCategoriesUseCase) {}

  /**
   * Handles GET /api/categories
   * List all categories (flat)
   */
  async getCategories(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.getCategoriesUseCase.execute();
    reply.send(result);
  }
}
