import { Category as PrismaCategory } from '@prisma/client';
import { Category } from '../../../domain/entities/category.entity.js';

/**
 * Mapper for converting between Category domain entity and Prisma model.
 */
export class CategoryMapper {
  /**
   * Convert Prisma model to domain entity.
   */
  static toDomain(prismaCategory: PrismaCategory): Category {
    return Category.reconstitute({
      id: prismaCategory.id,
      name: prismaCategory.name,
      slug: prismaCategory.slug,
      parentId: prismaCategory.parentId ?? undefined,
      icon: prismaCategory.icon ?? undefined,
      color: prismaCategory.color ?? undefined,
      isSystem: prismaCategory.isSystem,
    });
  }

  /**
   * Convert domain entity to Prisma create/update data.
   */
  static toPersistence(category: Category): {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    icon: string | null;
    color: string | null;
    isSystem: boolean;
  } {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parentId ?? null,
      icon: category.icon ?? null,
      color: category.color ?? null,
      isSystem: category.isSystem,
    };
  }
}
