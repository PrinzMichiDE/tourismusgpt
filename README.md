# LDB-DataGuard

Enterprise platform for automated quality assurance of tourist POI (Points of Interest) data. Synchronizes TLDB master data, validates against web reality (Website Deep Crawl + Google Maps), uses AI for semantic comparison, and automatically notifies responsible parties via email.

## Features

- 🗄️ **POI Management**: Handle 50,000+ Points of Interest with virtualized tables
- 🕷️ **Web Scraping**: Playwright-based deep crawling (depth 3) with robots.txt respect
- 🗺️ **Google Maps Integration**: Place details fetching with cost tracking
- 🤖 **AI-Powered Auditing**: OpenAI-compatible LLM for semantic data comparison
- 📊 **Analytics Dashboard**: Nivo charts with trend analysis
- 📧 **Email Notifications**: React Email templates with spam protection
- 🔐 **Authentication**: NextAuth.js with Credentials and OAuth support
- 🌍 **Internationalization**: German and English (next-intl)
- 🎨 **Modern UI**: shadcn/ui + Tailwind CSS with dark mode
- 📈 **Monitoring**: Prometheus metrics + Grafana dashboards

## Tech Stack

| Area | Technology |
|------|------------|
| Framework | Next.js 16 (App Router, Server Actions) |
| Language | TypeScript (Strict Mode) |
| UI | shadcn/ui + Tailwind CSS |
| Tables | TanStack Table (Virtualized) |
| Charts | Nivo |
| Forms | React Hook Form + Zod |
| Auth | NextAuth.js v5 |
| i18n | next-intl |
| Database | PostgreSQL 16 + Prisma ORM |
| Queue | Redis + BullMQ |
| Scraping | Playwright |
| LLM | OpenAI-compatible API |
| Email | Nodemailer + React Email |
| Logging | Pino |
| Monitoring | Prometheus + Grafana |

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL 16+
- Redis 7+
- Docker (optional, for containerized deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/ldb-dataguard.git
cd ldb-dataguard

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your configuration
```

### Environment Variables

See `.env.example` for all available configuration options. Required variables:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `OPENAI_API_KEY`: API key for LLM integration
- `GOOGLE_PLACES_API_KEY`: API key for Google Maps

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### Development

```bash
# Start development server
npm run dev

# Run workers (in separate terminal)
npm run worker
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### Default Login

- Email: `admin@ldb-dataguard.de`
- Password: `admin123`

## Docker Deployment

### Development

```bash
cd docker
docker-compose up -d
```

### Production

```bash
cd docker
docker-compose -f docker-compose.prod.yml up -d
```

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── [locale]/        # Localized routes (de, en)
│   │   └── api/             # API routes
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Layout components
│   │   └── dashboard/       # Dashboard components
│   ├── lib/                 # Business logic
│   │   ├── auth.ts          # Authentication
│   │   ├── db.ts            # Database client
│   │   ├── openai.ts        # LLM integration
│   │   ├── crawler.ts       # Web scraper
│   │   ├── auditor.ts       # AI auditor
│   │   └── queue.ts         # Job queues
│   └── middleware.ts        # Security middleware
├── worker/                  # BullMQ workers
│   ├── handlers/            # Job handlers
│   ├── auto-scaler.ts       # Dynamic scaling
│   └── scheduler.ts         # Cron scheduler
├── prisma/                  # Database schema
├── messages/                # i18n translations
├── docker/                  # Docker configuration
└── tests/                   # Test suites
```

## API Documentation

API documentation is available at `/api-docs` (Redoc) when running the application.

### Key Endpoints

- `GET /api/v1/pois` - List POIs with pagination
- `POST /api/v1/pois` - Create new POI
- `GET /api/v1/health` - Health check
- `GET /api/metrics` - Prometheus metrics

## Queue System

Four queues handle background processing:

1. **scraper-queue**: Website crawling (rate limited 1 req/sec)
2. **maps-queue**: Google Places API calls
3. **audit-queue**: AI-powered data comparison
4. **mail-queue**: Email sending with spam protection

## Monitoring

### Prometheus Metrics

Available at `/api/metrics`:

- `ldb_pois_total`: Total POI count
- `ldb_audit_score`: Average audit score
- `ldb_queue_waiting`: Jobs waiting in queues
- `ldb_api_cost_total`: API costs (OpenAI, Google Maps)

### Grafana Dashboards

Pre-configured dashboards in `docker/grafana/dashboards/`.

## Testing

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Security

- OWASP Top 10 addressed
- Rate limiting on all API endpoints
- CSP and security headers
- Input validation with Zod
- SQL injection prevention via Prisma
- bcrypt password hashing

## License

Proprietary - All rights reserved

## Support

For support, contact: support@ldb-dataguard.de
