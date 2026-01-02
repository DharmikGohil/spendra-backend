/**
 * Result of categorizing a merchant.
 */
export interface CategorizationResult {
  categoryId: string;
  confidence: number;
  method: 'rule' | 'ai' | 'fallback';
}

/**
 * Categorization service interface - defines contract for transaction categorization.
 */
export interface ICategorizationService {
  /**
   * Initialize the service (load mappings, etc.).
   */
  initialize(): Promise<void>;

  /**
   * Categorize a transaction based on merchant name.
   */
  categorize(merchant: string): Promise<CategorizationResult>;

  /**
   * Learn a new categorization rule from user correction.
   */
  learnFromCorrection(merchant: string, categoryId: string, confidence: number): Promise<void>;
}
