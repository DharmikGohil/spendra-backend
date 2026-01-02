import { MerchantMapping } from '../../../domain/entities/merchant-mapping.entity.js';
import { IMerchantMappingRepository } from '../../../domain/interfaces/repos/merchant-mapping.repo.js';
import { MerchantMappingMapper } from '../mappers/merchant-mapping.mapper.js';
import { prisma } from '../../database/client.js';

/**
 * Merchant mapping repository implementation using Prisma.
 */
export class MerchantMappingRepository implements IMerchantMappingRepository {
  /**
   * Find all merchant mappings.
   */
  async findAll(): Promise<MerchantMapping[]> {
    const mappings = await prisma.merchantMapping.findMany();
    return mappings.map(MerchantMappingMapper.toDomain);
  }

  /**
   * Find a merchant mapping by its pattern.
   */
  async findByPattern(pattern: string): Promise<MerchantMapping | null> {
    const mapping = await prisma.merchantMapping.findUnique({
      where: { pattern: pattern.toUpperCase() },
    });
    return mapping ? MerchantMappingMapper.toDomain(mapping) : null;
  }

  /**
   * Save a new merchant mapping.
   */
  async save(mapping: MerchantMapping): Promise<MerchantMapping> {
    const data = MerchantMappingMapper.toPersistence(mapping);
    const created = await prisma.merchantMapping.create({ data });
    return MerchantMappingMapper.toDomain(created);
  }
}
