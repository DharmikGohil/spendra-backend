/**
 * Category DTO for API responses.
 */
export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
}

/**
 * Category tree DTO with nested children.
 */
export interface CategoryTreeDTO extends CategoryDTO {
  children: CategoryTreeDTO[];
}

/**
 * Response DTO for getting categories (flat list).
 */
export interface GetCategoriesResponseDTO {
  data: CategoryDTO[];
}

/**
 * Response DTO for getting category tree.
 */
export interface GetCategoryTreeResponseDTO {
  data: CategoryTreeDTO[];
}
