import { ICategoryRepository } from '../../interfaces/repos/category.repo.js';
import { GetCategoryTreeResponseDTO, CategoryTreeDTO } from '../../interfaces/dtos/category.dto.js';
import { Category } from '../../entities/category.entity.js';

/**
 * Use case for getting categories as a hierarchical tree.
 */
export class GetCategoryTreeUseCase {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  /**
   * Execute the get category tree use case.
   */
  async execute(): Promise<GetCategoryTreeResponseDTO> {
    const categories = await this.categoryRepo.findAll();
    const tree = Category.buildTree(categories);

    // Convert to DTOs
    const mapToDTO = (node: ReturnType<typeof Category.buildTree>[0]): CategoryTreeDTO => ({
      id: node.id,
      name: node.name,
      slug: node.slug,
      icon: node.icon ?? null,
      color: node.color ?? null,
      children: node.children.map(mapToDTO),
    });

    return {
      data: tree.map(mapToDTO),
    };
  }
}
