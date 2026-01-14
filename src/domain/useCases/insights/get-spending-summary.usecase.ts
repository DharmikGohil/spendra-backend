import { ITransactionRepository } from '../../interfaces/repos/transaction.repo.js';
import {
  GetSpendingSummaryRequestDTO,
  GetSpendingSummaryResponseDTO,
} from '../../interfaces/dtos/insights.dto.js';

/**
 * Use case for getting spending summary by category.
 */
export class GetSpendingSummaryUseCase {
  constructor(private readonly transactionRepo: ITransactionRepository) { }

  /**
   * Execute the get spending summary use case.
   */
  async execute(request: GetSpendingSummaryRequestDTO): Promise<GetSpendingSummaryResponseDTO> {
    // 1. Get spending summary from repository
    const summary = await this.transactionRepo.getSpendingSummary(
      request.userId,
      request.startDate,
      request.endDate
    );

    // 2. Calculate total
    const total = summary.reduce((acc, item) => acc + item.total, 0);

    // 3. Return response
    return {
      data: summary.map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        total: item.total,
        count: item.count,
      })),
      total,
      period: {
        start: request.startDate.toISOString(),
        end: request.endDate.toISOString(),
      },
    };
  }
}
