import { ICategoryRepository } from '../../interfaces/repos/category.repo.js';
import { GetCategoriesResponseDTO } from '../../interfaces/dtos/category.dto.js';

/**
 * Use case for getting all categories (flat list).
 */
export class GetCategoriesUseCase {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  /**
   * Execute the get categories use case.
   */
  async execute(): Promise<GetCategoriesResponseDTO> {
    const categories = await this.categoryRepo.findAll();

    return {
      data: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon ?? null,
        color: c.color ?? null,
      })),
    };
  }
}
