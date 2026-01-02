import {
  ICategorizationService,
  CategorizationResult,
} from '../../domain/interfaces/services/categorization.service.js';
import { IMerchantMappingRepository } from '../../domain/interfaces/repos/merchant-mapping.repo.js';
import { ICategoryRepository } from '../../domain/interfaces/repos/category.repo.js';
import { IAiService } from '../../domain/interfaces/services/ai.service.js';
import { MerchantMapping } from '../../domain/entities/merchant-mapping.entity.js';
import { Transaction } from '../../domain/entities/transaction.entity.js';

/**
 * Categorization service implementation.
 * Uses a hybrid approach:
 * 1. Rule-based matching against known merchant patterns (fast)
 * 2. AI-based categorization for unknown merchants (Gemini)
 * 3. Fallback to "uncategorized" if nothing matches
 */
export class CategorizationService implements ICategorizationService {
  private merchantMappings: Map<string, { categoryId: string; confidence: number }> = new Map();
  private categoryMap: Map<string, string> = new Map(); // Name -> ID
  private categoryNames: string[] = [];
  private fallbackCategoryId: string | null = null;
  private initialized = false;

  constructor(
    private readonly merchantMappingRepo: IMerchantMappingRepository,
    private readonly categoryRepo: ICategoryRepository,
    private readonly aiService?: IAiService
  ) { }

  /**
   * Initialize the service by loading merchant mappings into memory.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load merchant mappings
    const mappings = await this.merchantMappingRepo.findAll();
    for (const m of mappings) {
      this.merchantMappings.set(m.pattern, {
        categoryId: m.categoryId,
        confidence: m.confidence,
      });
    }

    // Load categories for AI context
    const categories = await this.categoryRepo.findAll();
    for (const c of categories) {
      this.categoryMap.set(c.name, c.id);
      this.categoryNames.push(c.name);
      if (c.slug === 'other-uncategorized') {
        this.fallbackCategoryId = c.id;
      }
    }

    this.initialized = true;
    console.log(`✅ Categorization service loaded ${this.merchantMappings.size} merchant mappings`);
  }

  /**
   * Categorize a transaction based on merchant name.
   */
  async categorize(merchant: string): Promise<CategorizationResult> {
    await this.initialize();

    const normalized = Transaction.normalizeMerchant(merchant);

    // 1. Try pattern matching (Rule-based)
    for (const [pattern, data] of this.merchantMappings) {
      if (normalized.includes(pattern)) {
        return {
          categoryId: data.categoryId,
          confidence: data.confidence,
          method: 'rule',
        };
      }
    }

    // 2. AI-based categorization
    if (this.aiService) {
      console.log(`🤖 Asking AI to categorize: ${merchant}`);
      const aiResult = await this.aiService.predictCategory(merchant, this.categoryNames);

      if (aiResult.confidence > 0.6) {
        const categoryId = this.categoryMap.get(aiResult.category);
        if (categoryId) {
          // Learn this new mapping automatically if confidence is very high
          if (aiResult.confidence > 0.9) {
            await this.learnFromCorrection(merchant, categoryId, aiResult.confidence);
          }

          return {
            categoryId,
            confidence: aiResult.confidence,
            method: 'ai',
          };
        }
      }
    }

    // 3. Fallback
    if (this.fallbackCategoryId) {
      return {
        categoryId: this.fallbackCategoryId,
        confidence: 0.1,
        method: 'fallback',
      };
    }

    throw new Error('No fallback category found - run database seed first');
  }

  /**
   * Learn a new categorization rule from user correction.
   */
  async learnFromCorrection(
    merchant: string,
    categoryId: string,
    confidence: number = 0.9
  ): Promise<void> {
    const normalized = Transaction.normalizeMerchant(merchant);

    // Only learn if it's a reasonably clean merchant name
    if (normalized.length < 3 || normalized.length > 50) return;

    // Check if mapping already exists
    const existing = await this.merchantMappingRepo.findByPattern(normalized);
    if (existing) return;

    // Create new mapping
    const mapping = MerchantMapping.create({
      pattern: normalized,
      categoryId,
      confidence,
    });

    await this.merchantMappingRepo.save(mapping);

    // Update in-memory cache
    this.merchantMappings.set(normalized, { categoryId, confidence });
    console.log(`📚 Learned new mapping: ${normalized} → ${categoryId}`);
  }
}
