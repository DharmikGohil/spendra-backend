# Design Document: Clean Architecture Restructure

## Overview

This design document outlines the restructuring of the finance-tracker application to follow clean architecture patterns. The restructure maintains the existing Fastify framework and Prisma ORM while introducing proper layering, dependency injection, and separation of concerns.

## Architecture

The application follows a layered architecture with clear boundaries:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (Controllers, Routes, Middleware, Schemas)                  │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│  (Entities, Use Cases, Interfaces, Errors, Services)         │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                       │
│  (Repository Impl, Database, External Services, Utils)       │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Flow

- Presentation → Domain → Infrastructure (via interfaces)
- Domain layer has NO dependencies on infrastructure
- Infrastructure implements domain interfaces

## Components and Interfaces

### Directory Structure

```
src/
├── bootstrap/
│   ├── app.ts              # Fastify app configuration
│   └── server.ts           # Server startup
├── domain/
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── transaction.entity.ts
│   │   ├── category.entity.ts
│   │   └── merchant-mapping.entity.ts
│   ├── errors/
│   │   ├── base.error.ts
│   │   ├── transaction.errors.ts
│   │   ├── category.errors.ts
│   │   └── user.errors.ts
│   ├── interfaces/
│   │   ├── dtos/
│   │   │   ├── transaction.dto.ts
│   │   │   ├── category.dto.ts
│   │   │   └── insights.dto.ts
│   │   ├── repos/
│   │   │   ├── user.repo.ts
│   │   │   ├── transaction.repo.ts
│   │   │   ├── category.repo.ts
│   │   │   └── merchant-mapping.repo.ts
│   │   └── services/
│   │       └── categorization.service.ts
│   └── useCases/
│       ├── transaction/
│       │   ├── sync-transactions.usecase.ts
│       │   ├── get-transactions.usecase.ts
│       │   └── update-transaction-category.usecase.ts
│       ├── category/
│       │   ├── get-categories.usecase.ts
│       │   └── get-category-tree.usecase.ts
│       └── insights/
│           └── get-spending-summary.usecase.ts
├── infrastructure/
│   ├── database/
│   │   └── client.ts
│   ├── repository/
│   │   ├── implementation/
│   │   │   ├── user.repo.impl.ts
│   │   │   ├── transaction.repo.impl.ts
│   │   │   ├── category.repo.impl.ts
│   │   │   ├── merchant-mapping.repo.impl.ts
│   │   │   └── index.ts
│   │   └── mappers/
│   │       ├── user.mapper.ts
│   │       ├── transaction.mapper.ts
│   │       └── category.mapper.ts
│   ├── services/
│   │   └── categorization.service.impl.ts
│   └── utils/
│       └── hash.util.ts
├── presentation/
│   ├── controllers/
│   │   ├── transaction/
│   │   │   ├── sync-transactions.controller.ts
│   │   │   ├── get-transactions.controller.ts
│   │   │   └── update-category.controller.ts
│   │   ├── category/
│   │   │   ├── get-categories.controller.ts
│   │   │   └── get-category-tree.controller.ts
│   │   └── insights/
│   │       └── get-spending-summary.controller.ts
│   ├── middleware/
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── device-auth.middleware.ts
│   ├── routes/
│   │   ├── transaction.routes.ts
│   │   ├── category.routes.ts
│   │   └── insights.routes.ts
│   └── schemas/
│       ├── transaction.schema.ts
│       ├── category.schema.ts
│       └── insights.schema.ts
└── index.ts                # Entry point
```

### Entity Designs

#### User Entity

```typescript
class User {
  constructor(
    public readonly id: string,
    public readonly deviceId: string,
    public readonly deviceFingerprint: string | undefined,
    public readonly settings: Record<string, unknown>,
    public readonly createdAt: Date,
    public readonly lastSyncAt: Date | undefined
  ) {
    Object.freeze(this);
  }

  static create(props: { deviceId: string; deviceFingerprint?: string }): User;
  updateLastSync(): User;
}
```

#### Transaction Entity

```typescript
class Transaction {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly merchant: string,
    public readonly merchantNormalized: string,
    public readonly source: TransactionSource,
    public readonly categoryId: string | undefined,
    public readonly categoryConfidence: number | undefined,
    public readonly timestamp: Date,
    public readonly rawTextHash: string,
    public readonly balance: number | undefined,
    public readonly metadata: Record<string, unknown>,
    public readonly isManuallyEdited: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    Object.freeze(this);
  }

  static create(props: CreateTransactionProps): Transaction;
  static normalizeMerchant(merchant: string): string;
  updateCategory(categoryId: string, confidence: number): Transaction;
}
```

#### Category Entity

```typescript
class Category {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly parentId: string | undefined,
    public readonly icon: string | undefined,
    public readonly color: string | undefined,
    public readonly isSystem: boolean
  ) {
    Object.freeze(this);
  }

  static create(props: CreateCategoryProps): Category;
  static buildTree(categories: Category[]): CategoryTree[];
}
```

### Repository Interfaces

#### IUserRepository

```typescript
interface IUserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByDeviceId(deviceId: string): Promise<User | null>;
  update(user: User): Promise<User>;
}
```

#### ITransactionRepository

```typescript
interface ITransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;
  saveMany(transactions: Transaction[]): Promise<{ created: number; skipped: number }>;
  findById(id: string): Promise<Transaction | null>;
  findByHash(hash: string): Promise<Transaction | null>;
  findByUserId(userId: string, options: TransactionFilterOptions): Promise<Transaction[]>;
  update(transaction: Transaction): Promise<Transaction>;
  getSpendingSummary(userId: string, startDate: Date, endDate: Date): Promise<SpendingSummaryItem[]>;
}
```

#### ICategoryRepository

```typescript
interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
}
```

#### IMerchantMappingRepository

```typescript
interface IMerchantMappingRepository {
  findAll(): Promise<MerchantMapping[]>;
  findByPattern(pattern: string): Promise<MerchantMapping | null>;
  save(mapping: MerchantMapping): Promise<MerchantMapping>;
}
```

### Use Case Designs

#### SyncTransactionsUseCase

```typescript
class SyncTransactionsUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly transactionRepo: ITransactionRepository,
    private readonly categorizationService: ICategorizationService
  ) {}

  async execute(request: SyncTransactionsRequestDTO): Promise<SyncTransactionsResponseDTO>;
}
```

#### GetTransactionsUseCase

```typescript
class GetTransactionsUseCase {
  constructor(private readonly transactionRepo: ITransactionRepository) {}

  async execute(request: GetTransactionsRequestDTO): Promise<GetTransactionsResponseDTO>;
}
```

#### UpdateTransactionCategoryUseCase

```typescript
class UpdateTransactionCategoryUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly categorizationService: ICategorizationService
  ) {}

  async execute(request: UpdateCategoryRequestDTO): Promise<void>;
}
```

### Service Interfaces

#### ICategorizationService

```typescript
interface ICategorizationService {
  initialize(): Promise<void>;
  categorize(merchant: string): Promise<CategorizationResult>;
  learnFromCorrection(merchant: string, categoryId: string, confidence: number): Promise<void>;
}
```

### Error Classes

```typescript
// Base error
class BaseError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
  }
}

// Domain errors
class TransactionNotFoundError extends BaseError {
  constructor(id: string) {
    super('TRANSACTION_NOT_FOUND', `Transaction ${id} not found`, 404);
  }
}

class InvalidCategoryError extends BaseError {
  constructor(categoryId: string) {
    super('INVALID_CATEGORY', `Category ${categoryId} does not exist`, 400);
  }
}

class UserNotFoundError extends BaseError {
  constructor(identifier: string) {
    super('USER_NOT_FOUND', `User ${identifier} not found`, 404);
  }
}
```

## Data Models

### DTOs

#### Transaction DTOs

```typescript
interface SyncTransactionsRequestDTO {
  deviceId: string;
  deviceFingerprint?: string;
  transactions: CreateTransactionInput[];
}

interface SyncTransactionsResponseDTO {
  success: boolean;
  created: number;
  skipped: number;
  errors: string[];
}

interface GetTransactionsRequestDTO {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  type?: TransactionType;
  limit: number;
  offset: number;
}

interface GetTransactionsResponseDTO {
  data: TransactionDTO[];
  pagination: PaginationDTO;
}

interface TransactionDTO {
  id: string;
  amount: number;
  type: TransactionType;
  merchant: string;
  source: TransactionSource;
  category: CategoryDTO | null;
  categoryConfidence: number | null;
  timestamp: string;
  balance: number | null;
  isManuallyEdited: boolean;
}
```

#### Category DTOs

```typescript
interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
}

interface CategoryTreeDTO extends CategoryDTO {
  children: CategoryTreeDTO[];
}

interface GetCategoriesResponseDTO {
  data: CategoryDTO[];
}

interface GetCategoryTreeResponseDTO {
  data: CategoryTreeDTO[];
}
```

#### Insights DTOs

```typescript
interface GetSpendingSummaryRequestDTO {
  userId: string;
  startDate: Date;
  endDate: Date;
}

interface SpendingSummaryItemDTO {
  categoryId: string;
  categoryName: string;
  total: number;
  count: number;
}

interface GetSpendingSummaryResponseDTO {
  data: SpendingSummaryItemDTO[];
  total: number;
  period: {
    start: string;
    end: string;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Entity Immutability

*For any* domain entity (User, Transaction, Category), after creation via factory method, all properties SHALL be frozen and any attempt to modify them SHALL have no effect.

**Validates: Requirements 2.1, 2.2, 2.3, 2.5**

### Property 2: Entity Invariant Validation

*For any* invalid input to an entity factory method (e.g., negative amount, empty merchant), the factory SHALL throw a validation error rather than creating an invalid entity.

**Validates: Requirements 2.4**

### Property 3: Mapper Round-Trip Consistency

*For any* valid domain entity, mapping to persistence format and back to domain SHALL produce an equivalent entity with all properties preserved.

**Validates: Requirements 5.3**

### Property 4: DTO Completeness

*For any* domain entity mapped to a response DTO, the DTO SHALL contain all required fields as defined in the DTO interface.

**Validates: Requirements 5.4**

### Property 5: Transaction Sync Deduplication

*For any* set of transactions synced multiple times with the same rawTextHash, the repository SHALL create only one record and skip duplicates.

**Validates: Requirements 4.1**

### Property 6: Transaction Filtering Correctness

*For any* filter criteria (date range, category, type), GetTransactionsUseCase SHALL return only transactions matching ALL specified criteria.

**Validates: Requirements 4.2**

### Property 7: Category Update Persistence

*For any* transaction category update, the transaction's categoryId and isManuallyEdited flag SHALL be correctly persisted and retrievable.

**Validates: Requirements 4.3**

### Property 8: Spending Summary Accuracy

*For any* date range, the spending summary totals SHALL equal the sum of all DEBIT transactions in that range, grouped by category.

**Validates: Requirements 4.4**

### Property 9: Category Tree Hierarchy

*For any* set of categories with parent-child relationships, buildTree SHALL produce a tree where each category appears exactly once and children are nested under their parents.

**Validates: Requirements 4.6**

### Property 10: Error Middleware HTTP Mapping

*For any* domain error thrown, the error middleware SHALL return the correct HTTP status code and error details as defined in the error class.

**Validates: Requirements 7.4, 7.5**

### Property 11: Validation Rejection

*For any* request that fails schema validation, the validation middleware SHALL return HTTP 400 with error details describing the validation failures.

**Validates: Requirements 8.2, 8.3**

### Property 12: Categorization Rule Application

*For any* merchant string, the categorization service SHALL return a category based on stored merchant mappings, or fallback category if no match exists.

**Validates: Requirements 9.4**

## Error Handling

### Error Code Constants

```typescript
// transaction.codes.ts
export const TRANSACTION_ERROR_CODES = {
  NOT_FOUND: 'TRANSACTION_NOT_FOUND',
  INVALID_AMOUNT: 'TRANSACTION_INVALID_AMOUNT',
  INVALID_TYPE: 'TRANSACTION_INVALID_TYPE',
  SYNC_FAILED: 'TRANSACTION_SYNC_FAILED',
} as const;

// category.codes.ts
export const CATEGORY_ERROR_CODES = {
  NOT_FOUND: 'CATEGORY_NOT_FOUND',
  INVALID_SLUG: 'CATEGORY_INVALID_SLUG',
} as const;

// user.codes.ts
export const USER_ERROR_CODES = {
  NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_DEVICE_ID: 'USER_INVALID_DEVICE_ID',
} as const;
```

### Error Middleware

```typescript
function errorMiddleware(error: Error, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof BaseError) {
    return reply.status(error.statusCode).send({
      error: error.code,
      message: error.message,
    });
  }

  // Zod validation errors
  if (error.name === 'ZodError') {
    return reply.status(400).send({
      error: 'VALIDATION_ERROR',
      details: error,
    });
  }

  // Unknown errors
  console.error(error);
  return reply.status(500).send({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
}
```

## Testing Strategy

### Unit Tests

Unit tests will cover:
- Entity factory methods and business logic
- Mapper transformations
- Use case logic with mocked repositories
- Error class instantiation

### Property-Based Tests

Property-based tests using a library like `fast-check` will verify:
- Entity immutability (Property 1)
- Entity invariant validation (Property 2)
- Mapper round-trip consistency (Property 3)
- DTO completeness (Property 4)
- Category tree hierarchy (Property 9)

### Integration Tests

Integration tests will cover:
- Repository implementations with test database
- Full request/response cycles through controllers
- Error middleware behavior
- Validation middleware behavior

### Test Configuration

- Use `vitest` as the test runner (already in project)
- Use `fast-check` for property-based testing
- Minimum 100 iterations per property test
- Tag format: **Feature: clean-architecture-restructure, Property {number}: {property_text}**
