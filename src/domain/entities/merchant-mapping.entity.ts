import { v4 as uuidv4 } from 'uuid';

/**
 * Props for creating a new merchant mapping
 */
export interface CreateMerchantMappingProps {
  pattern: string;
  categoryId: string;
  confidence?: number;
}

/**
 * MerchantMapping entity - Immutable domain object representing a rule
 * for automatically categorizing transactions based on merchant name patterns.
 */
export class MerchantMapping {
  constructor(
    public readonly id: string,
    public readonly pattern: string,
    public readonly categoryId: string,
    public readonly confidence: number,
    public readonly createdAt: Date
  ) {
    Object.freeze(this);
  }

  /**
   * Factory method to create a new MerchantMapping entity.
   * Validates invariants before creation.
   */
  static create(props: CreateMerchantMappingProps): MerchantMapping {
    // Validate pattern
    if (!props.pattern || props.pattern.trim().length === 0) {
      throw new Error('Merchant mapping pattern cannot be empty');
    }

    // Validate categoryId
    if (!props.categoryId || props.categoryId.trim().length === 0) {
      throw new Error('Merchant mapping categoryId cannot be empty');
    }

    // Validate confidence
    const confidence = props.confidence ?? 1.0;
    if (confidence < 0 || confidence > 1) {
      throw new Error('Merchant mapping confidence must be between 0 and 1');
    }

    return new MerchantMapping(
      uuidv4(),
      props.pattern.toUpperCase().trim(),
      props.categoryId,
      confidence,
      new Date()
    );
  }

  /**
   * Reconstitute a MerchantMapping entity from persistence data.
   * Used by mappers when loading from database.
   */
  static reconstitute(props: {
    id: string;
    pattern: string;
    categoryId: string;
    confidence: number;
    createdAt: Date;
  }): MerchantMapping {
    return new MerchantMapping(
      props.id,
      props.pattern,
      props.categoryId,
      props.confidence,
      props.createdAt
    );
  }

  /**
   * Check if a merchant name matches this pattern.
   * Uses case-insensitive substring matching.
   */
  matches(merchantNormalized: string): boolean {
    return merchantNormalized.toUpperCase().includes(this.pattern);
  }
}
