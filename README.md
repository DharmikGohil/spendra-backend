# Spendra - AI-First Personal Finance Tracker

> **"Money should explain itself, not be tracked."**

An intelligent personal finance tracker that automatically categorizes transactions using a hybrid rule-based + AI approach, eliminating the need for manual data entry.

## Philosophy

Traditional finance apps make you "track" every penny. **Spendra is different:**
- **Zero Manual Entry** - Transactions are automatically captured from SMS/emails
- **AI-Powered** - Unknown merchants are intelligently categorized using Gemini AI
- **Story-Focused** - Explains the "why" behind your spending, not just the "what"
- **Privacy-First** - Your data never leaves your control

---

## Features

### Implemented (MVP)
- **Smart Categorization Engine**
  - 55 pre-configured merchant mappings for Indian apps/services
  - AI fallback for unknown merchants using Google Gemini
  - Self-learning from user corrections
  - 47 hierarchical categories (Food, Transport, Shopping, etc.)

- **Transaction Management**
  - Bulk sync API for mobile apps
  - Automatic deduplication using SHA-256 hashing
  - Transaction history with filters
  - User category corrections with learning

- **Insights & Analytics**
  - Spending breakdown by category
  - Date-range filtering
  - Confidence scoring for categorizations

- **Clean Architecture**
  - Domain-driven design
  - Dependency injection
  - Repository pattern
  - Use case-based business logic

### Planned
- Android SMS parser app
- Daily AI summaries ("You spent ₹500 more on food today")
- Predictive warnings
- Budget tracking
- Subscription detection
- "Ask Your Money" chatbot

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 22+ |
| **Language** | TypeScript (ES2022) |
| **Framework** | Fastify |
| **Database** | PostgreSQL 17 |
| **ORM** | Prisma 7 |
| **AI** | Google Gemini 1.5 Flash |
| **Validation** | Zod |
| **Dev Tools** | tsx, ESLint, Prettier |

---

## Architecture

```
src/
├── bootstrap/          # Application startup
│   ├── app.ts         # Fastify app configuration
│   └── server.ts      # Server initialization
├── domain/            # Business logic (framework-agnostic)
│   ├── entities/      # Domain models
│   ├── useCases/      # Business use cases
│   ├── interfaces/    # Repository & service contracts
│   └── errors/        # Custom error types
├── infrastructure/    # External concerns
│   ├── database/      # Prisma client
│   ├── repository/    # Database implementations
│   └── services/      # AI & categorization services
└── presentation/      # HTTP layer
    ├── controllers/   # Request handlers
    ├── routes/        # API routes
    ├── middleware/    # Auth, validation, errors
    └── schemas/       # Zod validation schemas
```

### Key Design Decisions
- **Clean Architecture**: Domain logic is isolated from frameworks
- **PostgreSQL**: Robust transactions, JSON support, future-ready
- **Prisma 7**: Type-safe ORM with adapter-based architecture
- **Hybrid Categorization**: Fast rule-based matching + AI fallback

---

## Getting Started

### Prerequisites
- Node.js 22+
- PostgreSQL 17
- Gemini API Key ([Get one here](https://aistudio.google.com/))

### 1. Clone & Install
```bash
git clone https://github.com/DharmikGohil/Spendra.git
cd Spendra
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
# PostgreSQL Connection
DATABASE_URL="postgresql://user:password@localhost:5432/spendra?schema=public"

# Gemini AI (Required for AI categorization)
GEMINI_API_KEY="your_gemini_api_key_here"

# Server Configuration
PORT=3006
NODE_ENV=development
```

### 3. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Create database schema
npx prisma db push

# Seed categories and merchant mappings
npm run db:seed
```

### 4. Start Server
```bash
# Development mode (auto-reload)
npm run dev

# Production build
npm run build
npm start
```

Server will start at `http://localhost:3006`

---

## API Documentation

### Health Check
```http
GET /health
```
Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-02T10:00:00.000Z",
  "version": "1.0.0"
}
```

### Sync Transactions
```http
POST /api/transactions/sync
Content-Type: application/json

{
  "deviceId": "android-device-123",
  "transactions": [
    {
      "amount": 420.50,
      "type": "DEBIT",
      "merchant": "SWIGGY ORDER",
      "source": "UPI",
      "timestamp": "2026-01-02T18:30:00.000Z"
    }
  ]
}
```
Response:
```json
{
  "success": true,
  "created": 1,
  "skipped": 0,
  "errors": []
}
```

### List Transactions
```http
GET /api/transactions
Headers:
  x-device-id: android-device-123
Query Params:
  ?startDate=2026-01-01
  &endDate=2026-01-31
  &categoryId=food-delivery
  &limit=50
```

### Get Categories
```http
GET /api/categories          # Flat list
GET /api/categories/tree     # Hierarchical tree
```

### Update Category (User Correction)
```http
PATCH /api/transactions/:id/category
Content-Type: application/json

{
  "categoryId": "food-delivery",
  "learnFromCorrection": true
}
```

### Spending Summary
```http
GET /api/insights/spending
Headers:
  x-device-id: android-device-123
Query Params:
  ?startDate=2026-01-01&endDate=2026-01-31
```

---

## Database Schema

### Core Models

**User**
- `id`, `deviceId` (unique), `deviceFingerprint`
- `settings` (JSON), `createdAt`, `lastSyncAt`

**Transaction**
- `id`, `userId`, `amount`, `type`, `merchant`, `merchantNormalized`
- `source`, `categoryId`, `categoryConfidence`, `timestamp`
- `rawTextHash` (unique - for deduplication)
- `balance`, `metadata` (JSON), `isManuallyEdited`

**Category**
- `id`, `name`, `slug` (unique), `parentId` (self-referencing)
- `icon`, `color`, `isSystem`

**MerchantMapping**
- `id`, `pattern` (unique), `categoryId`, `confidence`

**DailySummary** (Placeholder)
- `id`, `userId`, `date`, `summary`, `insights` (JSON)

### Indexes
- `(userId, timestamp)` on transactions
- `merchantNormalized` on transactions
- `categoryId` on transactions

---

## Categorization Logic

### 1. Rule-Based Matching (Fast)
```
Merchant: "SWIGGY ORDER"
Normalized: "SWIGGY ORDER"
Matches Pattern: "SWIGGY"
→ Category: "Food Delivery" (95% confidence)
```

### 2. AI Categorization (Fallback)
```
Merchant: "Netflix.com"
No rule match found
→ Ask Gemini AI: "Categorize Netflix.com"
→ Category: "Entertainment" (90% confidence)
→ Auto-learn if confidence > 90%
```

### 3. Fallback
```
Merchant: "Unknown Store"
No rule, AI disabled/failed
→ Category: "Uncategorized" (10% confidence)
```

---

## Pre-Configured Merchants (55)

### Food & Dining
Swiggy, Zomato, Dominos, McDonald's, KFC, Starbucks, Cafe Coffee Day

### Transport
Uber, Ola, Rapido, IRCTC, Indian Railways, HP Petrol, BPCL, Shell

### Shopping
Amazon, Flipkart, Myntra, Ajio, BigBasket, Blinkit, Zepto, DMart

### Entertainment
Netflix, Amazon Prime, Disney+ Hotstar, Spotify, YouTube Premium, BookMyShow

### Bills & Utilities
Electricity, Water, Gas, Broadband, Airtel, Jio, Vodafone

### Subscriptions
Gym, OTT platforms, Cloud storage

### Health
Apollo, Fortis, 1mg, PharmEasy

---

## Development

### Scripts
```bash
npm run dev          # Start dev server with auto-reload
npm run build        # Build for production
npm start            # Run production server
npm run lint         # Lint code
npm run typecheck    # TypeScript type checking

# Prisma
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

### Project Structure Conventions
- **Entities**: Immutable domain models
- **Use Cases**: Single-responsibility business logic
- **Repositories**: Data access abstraction
- **Controllers**: HTTP request/response handling
- **Middleware**: Cross-cutting concerns (auth, validation, errors)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `GEMINI_API_KEY` | Recommended | Gemini AI for categorization |
| `PORT` | No | Server port (default: 3000) |
| `HOST` | No | Server host (default: 0.0.0.0) |
| `NODE_ENV` | No | Environment (development/production) |
| `JWT_SECRET` | Future | For user authentication |

---

## Roadmap

### Phase 1: Data Ingestion
- [x] PostgreSQL setup
- [x] Prisma schema
- [x] Transaction sync API
- [x] Deduplication

### Phase 2: Categorization
- [x] Rule-based engine
- [x] AI integration (Gemini)
- [x] Self-learning from corrections
- [x] 47 hierarchical categories

### Phase 3: Android App
- [ ] SMS permission handling
- [ ] Transaction parser
- [ ] Sync to backend
- [ ] Local caching

### Phase 4: AI Insights
- [ ] Daily summaries
- [ ] Spending anomalies
- [ ] Predictive warnings
- [ ] "Ask Your Money" chat

### Phase 5: Advanced Features
- [ ] Budget tracking
- [ ] Subscription detection
- [ ] Goal-based saving
- [ ] Multi-currency support
- [ ] Expense splitting

---

## Testing

Currently, manual testing is used. Future plans include:
- Unit tests for use cases
- Integration tests for API
- E2E tests with test database

---

## Contributing

This is a personal learning project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## License

MIT License - See LICENSE file for details

---

## Acknowledgments

- **Prisma** for the excellent ORM
- **Fastify** for the fast web framework
- **Google Gemini** for AI categorization
- **Indian FinTech Community** for inspiration

---

## Contact

**Developer**: Dharmik Gohil  
**GitHub**: [@DharmikGohil](https://github.com/DharmikGohil)  
**Project**: [Spendra](https://github.com/DharmikGohil/Spendra)

---

**Built with care for Indians who hate manual expense tracking**
