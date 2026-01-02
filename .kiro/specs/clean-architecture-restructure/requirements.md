# Requirements Document

## Introduction

This document defines the requirements for restructuring the finance-tracker application to follow clean architecture patterns, modeled after the efficia-backend codebase. The restructure will transform the current simple Fastify application into a well-organized, maintainable, and testable codebase with clear separation of concerns.

## Glossary

- **Finance_Tracker**: The personal finance tracking application being restructured
- **Domain_Layer**: The core business logic layer containing entities, use cases, and interfaces
- **Infrastructure_Layer**: The layer containing external service implementations, database access, and utilities
- **Presentation_Layer**: The layer handling HTTP requests, controllers, routes, and middleware
- **Entity**: An immutable domain object with business logic and factory methods
- **Use_Case**: A single-purpose class that orchestrates business logic for one specific operation
- **Repository**: An interface defining data access contracts, with implementations in infrastructure
- **DTO**: Data Transfer Object used for request/response data transformation
- **Controller**: A thin class that maps HTTP requests to use cases
- **Mapper**: A utility that transforms between domain entities and persistence models

## Requirements

### Requirement 1: Project Structure Reorganization

**User Story:** As a developer, I want the codebase organized into clear layers, so that I can easily navigate and maintain the code.

#### Acceptance Criteria

1. THE Finance_Tracker SHALL have a `src/bootstrap/` directory containing application initialization files (app.ts, server.ts)
2. THE Finance_Tracker SHALL have a `src/domain/` directory containing entities, errors, interfaces, services, and use cases
3. THE Finance_Tracker SHALL have a `src/infrastructure/` directory containing repository implementations, database configuration, and utilities
4. THE Finance_Tracker SHALL have a `src/presentation/` directory containing controllers, routes, middleware, and schemas
5. THE Finance_Tracker SHALL maintain the existing Fastify framework and Prisma ORM

### Requirement 2: Domain Entities

**User Story:** As a developer, I want domain entities to be immutable classes with business logic, so that domain rules are enforced consistently.

#### Acceptance Criteria

1. THE Finance_Tracker SHALL have a User entity class with immutable properties and factory methods
2. THE Finance_Tracker SHALL have a Transaction entity class with immutable properties, factory methods, and business logic
3. THE Finance_Tracker SHALL have a Category entity class with immutable properties and tree-building capabilities
4. WHEN an entity is created, THE Entity SHALL validate its invariants
5. THE Entity SHALL use `Object.freeze()` to ensure immutability after construction

### Requirement 3: Repository Pattern Implementation

**User Story:** As a developer, I want data access abstracted through repository interfaces, so that business logic is decoupled from database implementation.

#### Acceptance Criteria

1. THE Finance_Tracker SHALL define repository interfaces in `src/domain/interfaces/repos/`
2. THE Finance_Tracker SHALL implement repository classes in `src/infrastructure/repository/implementation/`
3. THE Finance_Tracker SHALL have an IUserRepository interface with save, findById, findByDeviceId methods
4. THE Finance_Tracker SHALL have an ITransactionRepository interface with save, findById, findByUserId, updateCategory methods
5. THE Finance_Tracker SHALL have an ICategoryRepository interface with findAll, findById, findBySlug, buildTree methods
6. THE Finance_Tracker SHALL have an IMerchantMappingRepository interface for categorization rule storage
7. THE Finance_Tracker SHALL export all repository instances from a central index file

### Requirement 4: Use Case Implementation

**User Story:** As a developer, I want business operations encapsulated in single-purpose use cases, so that each operation is testable and maintainable.

#### Acceptance Criteria

1. THE Finance_Tracker SHALL have a SyncTransactionsUseCase for bulk transaction synchronization
2. THE Finance_Tracker SHALL have a GetTransactionsUseCase for retrieving filtered transactions
3. THE Finance_Tracker SHALL have a UpdateTransactionCategoryUseCase for user category corrections
4. THE Finance_Tracker SHALL have a GetSpendingSummaryUseCase for spending insights
5. THE Finance_Tracker SHALL have a GetCategoriesUseCase for listing categories
6. THE Finance_Tracker SHALL have a GetCategoryTreeUseCase for hierarchical category retrieval
7. WHEN a use case is instantiated, THE Use_Case SHALL receive dependencies through constructor injection
8. WHEN a use case executes, THE Use_Case SHALL return a typed DTO response

### Requirement 5: DTOs and Mappers

**User Story:** As a developer, I want clear data contracts between layers, so that data transformation is explicit and type-safe.

#### Acceptance Criteria

1. THE Finance_Tracker SHALL define request DTOs for each use case input
2. THE Finance_Tracker SHALL define response DTOs for each use case output
3. THE Finance_Tracker SHALL have entity mappers that convert between domain entities and Prisma models
4. THE Finance_Tracker SHALL have DTO mappers that convert between entities and response DTOs
5. WHEN data crosses layer boundaries, THE Mapper SHALL transform it to the appropriate type

### Requirement 6: Controller Layer

**User Story:** As a developer, I want thin controllers that delegate to use cases, so that HTTP handling is separated from business logic.

#### Acceptance Criteria

1. THE Finance_Tracker SHALL have a TransactionController with methods for sync, list, and updateCategory
2. THE Finance_Tracker SHALL have a CategoryController with methods for list and tree
3. THE Finance_Tracker SHALL have an InsightsController with methods for spending summary
4. WHEN a controller receives a request, THE Controller SHALL validate input, call the use case, and return the response
5. WHEN an error occurs, THE Controller SHALL pass it to the error handling middleware

### Requirement 7: Error Handling

**User Story:** As a developer, I want domain-specific errors with codes, so that error handling is consistent and informative.

#### Acceptance Criteria

1. THE Finance_Tracker SHALL have a BaseError class with code, message, and statusCode properties
2. THE Finance_Tracker SHALL have domain-specific error classes (TransactionNotFoundError, InvalidCategoryError, etc.)
3. THE Finance_Tracker SHALL have error code constants for each error type
4. THE Finance_Tracker SHALL have error handling middleware that maps errors to HTTP responses
5. WHEN an error is thrown, THE Error_Middleware SHALL return appropriate HTTP status and error details

### Requirement 8: Validation Middleware

**User Story:** As a developer, I want request validation centralized in middleware, so that validation logic is reusable and consistent.

#### Acceptance Criteria

1. THE Finance_Tracker SHALL have validation schemas using Zod in `src/presentation/schemas/`
2. THE Finance_Tracker SHALL have validation middleware that validates requests against schemas
3. WHEN validation fails, THE Validation_Middleware SHALL return a 400 response with error details
4. THE Finance_Tracker SHALL maintain existing schema definitions while organizing them by domain

### Requirement 9: Categorization Service Refactoring

**User Story:** As a developer, I want the categorization service properly integrated into the clean architecture, so that it follows the same patterns as other components.

#### Acceptance Criteria

1. THE Finance_Tracker SHALL have an ICategorizationService interface in domain interfaces
2. THE Finance_Tracker SHALL have a CategorizationService implementation in infrastructure services
3. THE Finance_Tracker SHALL inject the categorization service into use cases that need it
4. WHEN categorizing a transaction, THE CategorizationService SHALL use the merchant mapping repository

### Requirement 10: Bootstrap and Server Configuration

**User Story:** As a developer, I want application startup properly organized, so that initialization is clear and configurable.

#### Acceptance Criteria

1. THE Finance_Tracker SHALL have a `bootstrap/app.ts` that configures the Fastify instance
2. THE Finance_Tracker SHALL have a `bootstrap/server.ts` that starts the server
3. THE Finance_Tracker SHALL register all routes through the bootstrap process
4. THE Finance_Tracker SHALL initialize services (database, categorization) during bootstrap
5. WHEN the server starts, THE Bootstrap SHALL log available endpoints and status
