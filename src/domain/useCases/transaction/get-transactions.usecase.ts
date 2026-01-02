import { ITransactionRepository } from '../../interfaces/repos/transaction.repo.js';
import { ICategoryRepository } from '../../interfaces/repos/category.repo.js';
import {
  GetTransactionsRequestDTO,
  GetTransactionsResponseDTO,
  TransactionDTO,
} from '../../interfaces/dtos/transaction.dto.js';

/**
 * Use case for retrieving transactions with filters.
 */
export class GetTransactionsUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly categoryRepo: ICategoryRepository
  ) {}

  /**
   * Execute the get transactions use case.
   */
  async execute(request: GetTransactionsRequestDTO): Promise<GetTransactionsResponseDTO> {
    // 1. Get transactions with filters
    const transactions = await this.transactionRepo.findByUserId(request.userId, {
      startDate: request.startDate,
      endDate: request.endDate,
      categoryId: request.categoryId,
      type: request.type,
      limit: request.limit,
      offset: request.offset,
    });

    // 2. Get categories for the transactions
    const categoryIds = [...new Set(
      transactions
        .map((t) => t.categoryId)
        .filter((id): id is string => id !== undefined)
    )];

    const categoriesMap = new Map<string, { id: string; name: string; slug: string; icon?: string; color?: string }>();
    for (const categoryId of categoryIds) {
      const category = await this.categoryRepo.findById(categoryId);
      if (category) {
        categoriesMap.set(category.id, {
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: category.icon,
          color: category.color,
        });
      }
    }

    // 3. Map to DTOs
    const data: TransactionDTO[] = transactions.map((t) => {
      const category = t.categoryId ? categoriesMap.get(t.categoryId) : null;
      return {
        id: t.id,
        amount: t.amount,
        type: t.type,
        merchant: t.merchant,
        source: t.source,
        category: category ? {
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: category.icon ?? null,
          color: category.color ?? null,
        } : null,
        categoryConfidence: t.categoryConfidence ?? null,
        timestamp: t.timestamp.toISOString(),
        balance: t.balance ?? null,
        isManuallyEdited: t.isManuallyEdited,
      };
    });

    return {
      data,
      pagination: {
        limit: request.limit,
        offset: request.offset,
        count: data.length,
      },
    };
  }
}
