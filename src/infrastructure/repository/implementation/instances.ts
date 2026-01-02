import { UserRepository } from './user.repo.impl.js';
import { TransactionRepository } from './transaction.repo.impl.js';
import { CategoryRepository } from './category.repo.impl.js';
import { MerchantMappingRepository } from './merchant-mapping.repo.impl.js';

// Create singleton instances
export const userRepository = new UserRepository();
export const transactionRepository = new TransactionRepository();
export const categoryRepository = new CategoryRepository();
export const merchantMappingRepository = new MerchantMappingRepository();
