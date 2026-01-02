import { IUserRepository } from '../../interfaces/repos/user.repo.js';
import { ITransactionRepository } from '../../interfaces/repos/transaction.repo.js';
import { ICategorizationService } from '../../interfaces/services/categorization.service.js';
import {
  SyncTransactionsRequestDTO,
  SyncTransactionsResponseDTO,
} from '../../interfaces/dtos/transaction.dto.js';
import { User } from '../../entities/user.entity.js';
import { Transaction } from '../../entities/transaction.entity.js';

/**
 * Use case for syncing transactions from a mobile device.
 * Handles user creation/lookup, transaction deduplication, and categorization.
 */
export class SyncTransactionsUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly transactionRepo: ITransactionRepository,
    private readonly categorizationService: ICategorizationService
  ) {}

  /**
   * Execute the sync transactions use case.
   */
  async execute(request: SyncTransactionsRequestDTO): Promise<SyncTransactionsResponseDTO> {
    const errors: string[] = [];

    // 1. Get or create user
    let user = await this.userRepo.findByDeviceId(request.deviceId);
    if (!user) {
      user = User.create({
        deviceId: request.deviceId,
        deviceFingerprint: request.deviceFingerprint,
      });
      user = await this.userRepo.save(user);
      console.log(`👤 Created new user for device: ${request.deviceId.substring(0, 8)}...`);
    }

    // 2. Process transactions
    const transactionsToSave: Transaction[] = [];

    for (const txInput of request.transactions) {
      try {
        // Categorize the transaction
        const categorization = await this.categorizationService.categorize(txInput.merchant);

        // Create transaction entity
        const transaction = Transaction.create({
          userId: user.id,
          amount: txInput.amount,
          type: txInput.type,
          merchant: txInput.merchant,
          source: txInput.source,
          timestamp: txInput.timestamp,
          rawTextHash: txInput.rawTextHash,
          balance: txInput.balance,
          metadata: txInput.metadata,
          categoryId: categorization.categoryId,
          categoryConfidence: categorization.confidence,
        });

        transactionsToSave.push(transaction);
      } catch (error) {
        errors.push(
          `Failed to process transaction: ${txInput.merchant} - ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // 3. Save transactions (with deduplication)
    const { created, skipped } = await this.transactionRepo.saveMany(transactionsToSave);

    // 4. Update user's last sync time
    const updatedUser = user.updateLastSync();
    await this.userRepo.update(updatedUser);

    return {
      success: true,
      created,
      skipped,
      errors,
    };
  }
}
