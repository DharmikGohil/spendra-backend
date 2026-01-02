# Implementation Plan: Clean Architecture Restructure

## Overview

This plan restructures the finance-tracker application to follow clean architecture patterns. Tasks are organized to build foundational layers first, then progressively add features while maintaining a working application.

## Tasks

- [x] 1. Set up project structure and base classes
  - [x] 1.1 Create directory structure for bootstrap, domain, infrastructure, and presentation layers
    - Create all required directories
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 1.2 Create base error class and error codes
    - Implement BaseError class with code, message, statusCode
    - Create error code constants files
    - _Requirements: 7.1, 7.3_
  - [x] 1.3 Create domain-specific error classes
    - TransactionNotFoundError, InvalidCategoryError, UserNotFoundError, etc.
    - _Requirements: 7.2_

- [x] 2. Implement domain entities
  - [x] 2.1 Create User entity class
    - Immutable class with factory method and Object.freeze()
    - _Requirements: 2.1, 2.5_
  - [x] 2.2 Create Transaction entity class
    - Immutable class with factory method, normalizeMerchant, updateCategory methods
    - _Requirements: 2.2, 2.4, 2.5_
  - [x] 2.3 Create Category entity class
    - Immutable class with factory method and static buildTree method
    - _Requirements: 2.3, 2.5_
  - [x] 2.4 Create MerchantMapping entity class
    - Immutable class for categorization rules
    - _Requirements: 2.5_
  - [x] 2.5 Write property tests for entity immutability
    - **Property 1: Entity Immutability**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.5**
  - [x] 2.6 Write property tests for entity invariant validation
    - **Property 2: Entity Invariant Validation**
    - **Validates: Requirements 2.4**

- [x] 3. Checkpoint - Verify entities
  - Ensure all entity tests pass, ask the user if questions arise.

- [x] 4. Implement repository interfaces and DTOs
  - [x] 4.1 Create repository interfaces
    - IUserRepository, ITransactionRepository, ICategoryRepository, IMerchantMappingRepository
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6_
  - [x] 4.2 Create transaction DTOs
    - SyncTransactionsRequestDTO, SyncTransactionsResponseDTO, GetTransactionsRequestDTO, etc.
    - _Requirements: 5.1, 5.2_
  - [x] 4.3 Create category DTOs
    - CategoryDTO, CategoryTreeDTO, GetCategoriesResponseDTO, GetCategoryTreeResponseDTO
    - _Requirements: 5.1, 5.2_
  - [x] 4.4 Create insights DTOs
    - GetSpendingSummaryRequestDTO, SpendingSummaryItemDTO, GetSpendingSummaryResponseDTO
    - _Requirements: 5.1, 5.2_
  - [x] 4.5 Create ICategorizationService interface
    - Define initialize, categorize, learnFromCorrection methods
    - _Requirements: 9.1_

- [x] 5. Implement repository mappers and implementations
  - [x] 5.1 Create entity mappers
    - UserMapper, TransactionMapper, CategoryMapper with toDomain and toPersistence methods
    - _Requirements: 5.3_
  - [x] 5.2 Implement UserRepository
    - Implement IUserRepository using Prisma
    - _Requirements: 3.2, 3.3_
  - [x] 5.3 Implement TransactionRepository
    - Implement ITransactionRepository using Prisma
    - _Requirements: 3.2, 3.4_
  - [x] 5.4 Implement CategoryRepository
    - Implement ICategoryRepository using Prisma
    - _Requirements: 3.2, 3.5_
  - [x] 5.5 Implement MerchantMappingRepository
    - Implement IMerchantMappingRepository using Prisma
    - _Requirements: 3.2, 3.6_
  - [x] 5.6 Create repository index file
    - Export all repository instances from central index
    - _Requirements: 3.7_
  - [x] 5.7 Write property tests for mapper round-trip consistency
    - **Property 3: Mapper Round-Trip Consistency**
    - **Validates: Requirements 5.3**

- [x] 6. Checkpoint - Verify repositories
  - Ensure all repository tests pass, ask the user if questions arise.

- [x] 7. Implement categorization service
  - [x] 7.1 Implement CategorizationService
    - Implement ICategorizationService in infrastructure/services
    - Use MerchantMappingRepository for rule storage
    - _Requirements: 9.2, 9.4_
  - [x] 7.2 Write property tests for categorization
    - **Property 12: Categorization Rule Application**
    - **Validates: Requirements 9.4**

- [x] 8. Implement use cases
  - [x] 8.1 Implement SyncTransactionsUseCase
    - Handle bulk transaction sync with deduplication
    - _Requirements: 4.1_
  - [x] 8.2 Implement GetTransactionsUseCase
    - Handle filtered transaction retrieval
    - _Requirements: 4.2_
  - [x] 8.3 Implement UpdateTransactionCategoryUseCase
    - Handle category updates with learning
    - _Requirements: 4.3_
  - [x] 8.4 Implement GetSpendingSummaryUseCase
    - Handle spending breakdown calculation
    - _Requirements: 4.4_
  - [x] 8.5 Implement GetCategoriesUseCase
    - Handle flat category listing
    - _Requirements: 4.5_
  - [x] 8.6 Implement GetCategoryTreeUseCase
    - Handle hierarchical category retrieval
    - _Requirements: 4.6_
  - [x] 8.7 Write property tests for transaction sync deduplication
    - **Property 5: Transaction Sync Deduplication**
    - **Validates: Requirements 4.1**
  - [x] 8.8 Write property tests for transaction filtering
    - **Property 6: Transaction Filtering Correctness**
    - **Validates: Requirements 4.2**
  - [x] 8.9 Write property tests for category tree hierarchy
    - **Property 9: Category Tree Hierarchy**
    - **Validates: Requirements 4.6**

- [x] 9. Checkpoint - Verify use cases
  - Ensure all use case tests pass, ask the user if questions arise.

- [x] 10. Implement presentation layer
  - [x] 10.1 Create validation schemas
    - Transaction, category, and insights schemas using Zod
    - _Requirements: 8.1, 8.4_
  - [x] 10.2 Create validation middleware
    - Middleware that validates requests against schemas
    - _Requirements: 8.2_
  - [x] 10.3 Create error handling middleware
    - Map domain errors to HTTP responses
    - _Requirements: 7.4, 7.5_
  - [x] 10.4 Create device auth middleware
    - Extract and validate device ID from headers
    - _Requirements: 6.4_
  - [x] 10.5 Implement transaction controllers
    - SyncTransactionsController, GetTransactionsController, UpdateCategoryController
    - _Requirements: 6.1_
  - [x] 10.6 Implement category controllers
    - GetCategoriesController, GetCategoryTreeController
    - _Requirements: 6.2_
  - [x] 10.7 Implement insights controller
    - GetSpendingSummaryController
    - _Requirements: 6.3_
  - [x] 10.8 Create route files
    - Wire controllers to routes with middleware
    - _Requirements: 10.3_
  - [x] 10.9 Write property tests for error middleware
    - **Property 10: Error Middleware HTTP Mapping**
    - **Validates: Requirements 7.4, 7.5**
  - [x] 10.10 Write property tests for validation middleware
    - **Property 11: Validation Rejection**
    - **Validates: Requirements 8.2, 8.3**

- [x] 11. Implement bootstrap layer
  - [x] 11.1 Create app.ts bootstrap file
    - Configure Fastify instance with plugins and middleware
    - _Requirements: 10.1_
  - [x] 11.2 Create server.ts bootstrap file
    - Server startup with initialization
    - _Requirements: 10.2_
  - [x] 11.3 Update index.ts entry point
    - Import and start from bootstrap
    - _Requirements: 10.4, 10.5_

- [x] 12. Final integration and cleanup
  - [x] 12.1 Remove old application code
    - Delete old src/api, src/application directories
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 12.2 Update imports throughout codebase
    - Ensure all imports use new paths
    - _Requirements: 1.5_
  - [x] 12.3 Write integration tests for full request cycles
    - Test complete flows through all layers
    - _Requirements: 4.8, 6.4, 6.5_

- [x] 13. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
