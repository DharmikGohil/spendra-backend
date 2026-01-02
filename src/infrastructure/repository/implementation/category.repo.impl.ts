import { Category } from '../../../domain/entities/category.entity.js';
import { ICategoryRepository } from '../../../domain/interfaces/repos/category.repo.js';
import { CategoryMapper } from '../mappers/category.mapper.js';
import { prisma } from '../../database/client.js';

/**
 * Category repository implementation using Prisma.
 */
export class CategoryRepository implements ICategoryRepository {
  /**
   * Find all categories.
   */
  async findAll(): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    });
    return categories.map(CategoryMapper.toDomain);
  }

  /**
   * Find a category by its ID.
   */
  async findById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({ where: { id } });
    return category ? CategoryMapper.toDomain(category) : null;
  }

  /**
   * Find a category by its slug.
   */
  async findBySlug(slug: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({ where: { slug } });
    return category ? CategoryMapper.toDomain(category) : null;
  }
}
