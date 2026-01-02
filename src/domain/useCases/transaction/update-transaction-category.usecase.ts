import { ITransactionRepository } from '../../interfaces/repos/transaction.repo.js';
import { ICategorizationService } from '../../interfaces/services/categorization.service.js';
import { UpdateCategoryRequestDTO } from '../../interfaces/dtos/transaction.dto.js';
import { TransactionNotFoundError } from '../../errors/transaction.errors.js';

/**
 * Use case for updating a transaction's category (user correction).
 */
export class UpdateTransactionCategoryUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly categorizationService: ICategorizationService
  ) {}

  /**
   * Execute the update category use case.
   */
  async execute(request: UpdateCategoryRequestDTO): Promise<void> {
    // 1. Find the transaction
    const transaction = await this.transactionRepo.findById(request.transactionId);
    if (!transaction) {
      throw new TransactionNotFoundError(request.transactionId);
    }

    // 2. Update the category
    const updatedTransaction = transaction.updateCategory(request.categoryId, 1.0);
    await this.transactionRepo.update(updatedTransaction);

    // 3. Learn from correction if requested
    if (request.learn) {
      await this.categorizationService.learnFromCorrection(
        transaction.merchant,
        request.categoryId,
        0.9
      );
    }
  }
}
