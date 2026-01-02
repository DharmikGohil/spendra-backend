import { MerchantMapping as PrismaMerchantMapping } from '@prisma/client';
import { MerchantMapping } from '../../../domain/entities/merchant-mapping.entity.js';

/**
 * Mapper for converting between MerchantMapping domain entity and Prisma model.
 */
export class MerchantMappingMapper {
  /**
   * Convert Prisma model to domain entity.
   */
  static toDomain(prismaMapping: PrismaMerchantMapping): MerchantMapping {
    return MerchantMapping.reconstitute({
      id: prismaMapping.id,
      pattern: prismaMapping.pattern,
      categoryId: prismaMapping.categoryId,
      confidence: prismaMapping.confidence,
      createdAt: prismaMapping.createdAt,
    });
  }

  /**
   * Convert domain entity to Prisma create data.
   */
  static toPersistence(mapping: MerchantMapping): {
    id: string;
    pattern: string;
    categoryId: string;
    confidence: number;
    createdAt: Date;
  } {
    return {
      id: mapping.id,
      pattern: mapping.pattern,
      categoryId: mapping.categoryId,
      confidence: mapping.confidence,
      createdAt: mapping.createdAt,
    };
  }
}
