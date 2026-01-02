import { FastifyInstance } from 'fastify';
import { GetCategoriesController } from '../controllers/category/get-categories.controller.js';
import { GetCategoryTreeController } from '../controllers/category/get-category-tree.controller.js';

// Import use cases and repositories
import { GetCategoriesUseCase } from '../../domain/useCases/category/get-categories.usecase.js';
import { GetCategoryTreeUseCase } from '../../domain/useCases/category/get-category-tree.usecase.js';
import { categoryRepository } from '../../infrastructure/repository/implementation/instances.js';

// Initialize use cases
const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);
const getCategoryTreeUseCase = new GetCategoryTreeUseCase(categoryRepository);

// Initialize controllers
const getCategoriesController = new GetCategoriesController(getCategoriesUseCase);
const getCategoryTreeController = new GetCategoryTreeController(getCategoryTreeUseCase);

export async function categoryRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /api/categories
   * List all categories (flat)
   */
  fastify.get(
    '/',
    getCategoriesController.getCategories.bind(getCategoriesController)
  );

  /**
   * GET /api/categories/tree
   * Get categories as hierarchical tree
   */
  fastify.get(
    '/tree',
    getCategoryTreeController.getCategoryTree.bind(getCategoryTreeController)
  );
}
