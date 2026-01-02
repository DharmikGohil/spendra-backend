import { MerchantMapping } from '../../entities/merchant-mapping.entity.js';

/**
 * Merchant mapping repository interface - defines data access contract for categorization rules.
 */
export interface IMerchantMappingRepository {
  /**
   * Find all merchant mappings.
   */
  findAll(): Promise<MerchantMapping[]>;

  /**
   * Find a merchant mapping by its pattern.
   */
  findByPattern(pattern: string): Promise<MerchantMapping | null>;

  /**
   * Save a new merchant mapping.
   */
  save(mapping: MerchantMapping): Promise<MerchantMapping>;
}
