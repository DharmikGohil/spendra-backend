import { Category } from '../../entities/category.entity.js';

/**
 * Category repository interface - defines data access contract for categories.
 */
export interface ICategoryRepository {
  /**
   * Find all categories.
   */
  findAll(): Promise<Category[]>;

  /**
   * Find a category by its ID.
   */
  findById(id: string): Promise<Category | null>;

  /**
   * Find a category by its slug.
   */
  findBySlug(slug: string): Promise<Category | null>;
}
