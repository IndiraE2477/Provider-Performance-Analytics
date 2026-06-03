# Provider Performance Analytics Dashboard (POC)

An enterprise-level full-stack application for monitoring provider performance using KPI metrics, score tracking, analytics dashboards, risk identification, authentication, authorization, logging, and automated testing.

## Technology Stack

| Layer           | Technology                     |
|-----------------|-------------------------------|
| Frontend        | React 19 + TypeScript + Vite  |
| Backend         | .NET 10 Web API               |
| Database        | SQL Server                    |
| ORM             | Entity Framework Core         |
| Authentication  | JWT Bearer Tokens             |
| Authorization   | Role-Based Access Control     |
| Logging         | Serilog (Console + File)      |
| Validation      | FluentValidation              |
| Mapping         | AutoMapper                    |
| API Docs        | Swagger / OpenAPI             |
| Testing         | Playwright + TypeScript       |
| State Mgmt      | React Query (TanStack)        |

## Architecture

```
React Frontend → React Query/Axios → .NET Web API → Middleware → Service Layer → Repository Layer → EF Core → SQL Server
```

### Backend Layers
- **Controllers** — API endpoints with versioning (`/api/v1/`)
- **Services** — Business logic layer
- **Repositories** — Data access with Generic Repository pattern
- **Entities** — EF Core entity models
- **DTOs** — Data Transfer Objects with AutoMapper profiles
- **Validators** — FluentValidation request validators
- **Middleware** — Global exception handling

### Frontend Structure
- **Pages** — Dashboard, Providers, Provider Detail, Analytics, Login
- **Components** — Layout, Sidebar, ProtectedRoute
- **Services** — API client with Axios interceptors
- **Context** — Authentication context with JWT management
- **Types** — Full TypeScript type definitions

## Features

### Authentication & Authorization
- JWT token-based authentication
- Three roles: **Admin**, **Manager**, **Viewer**
- Protected frontend routes
- Secured API endpoints with `[Authorize]` attributes
- Role-based CRUD permissions

### Dashboard
- **KPI Cards**: Average Score, Total Providers, At-Risk Providers, Monthly Improvement
- **Charts**: Monthly Score Trends (Line), Risk Distribution (Pie), Top/Bottom Providers (Bar)
- React Query caching for performance

### Provider Management
- Full CRUD operations with role-based access
- Server-side search, filter, sort, and pagination
- Soft delete functionality
- Duplicate name prevention
- Provider detail view with score history and trend charts

### Score Tracking
- Score range validation (0-5)
- Category-based evaluation (Quality of Care, Patient Satisfaction, etc.)
- Score history with trend visualization

### Validation
- **API**: FluentValidation on all request DTOs
- **UI**: Client-side form validation with error messages
- Mandatory field validation
- Score range validation (0-5)
- Duplicate provider name check

### Logging & Monitoring
- Serilog structured logging (Console + Rolling File)
- Error logging to database (ErrorLogs table)
- Audit logging for Create, Update, Delete operations

### Advanced Technical Features
- Global Exception Handling Middleware
- Repository Pattern with Generic Repository
- Service Layer Architecture
- DTO Pattern with AutoMapper
- API Versioning (v1)
- Soft Delete with EF Core Global Query Filters
- React Lazy Loading and Memoization
- React Query caching
- CORS configuration
- Responsive UI design

## Database Schema

| Table          | Description                        |
|----------------|------------------------------------|
| Users          | Application users with roles       |
| Roles          | Admin, Manager, Viewer             |
| Providers      | Healthcare providers               |
| ProviderScores | Performance evaluation scores      |
| AuditLogs      | CUD operation audit trail          |
| ErrorLogs      | Application error records          |

## Getting Started

### Prerequisites
- .NET 10 SDK
- Node.js 18+
- SQL Server (LocalDB or full instance)

### Backend Setup

```bash
cd backend/ProviderAnalytics.API

# Update connection string in appsettings.json if needed
# Default: Server=localhost;Database=ProviderAnalyticsDb;Trusted_Connection=true

# Create database and apply migrations
dotnet ef migrations add InitialCreate
dotnet ef database update

# Run the API
dotnet run
```

The API will start at `https://localhost:5001` with Swagger at `/swagger`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will start at `http://localhost:5173`.

### Running Playwright Tests

```bash
cd tests

# Install dependencies and browsers
npm install
npm run install:browsers

# Run tests
npm test

# Run tests with browser visible
npm run test:headed

# View test report
npm run test:report
```

## Demo Credentials

| Role    | Username | Password   |
|---------|----------|-----------|
| Admin   | admin    | Admin@123 |
| Manager | manager  | Admin@123 |
| Viewer  | viewer   | Admin@123 |

### Role Permissions

| Action            | Admin | Manager | Viewer |
|-------------------|-------|---------|--------|
| View Dashboard    | ✅    | ✅      | ✅     |
| View Providers    | ✅    | ✅      | ✅     |
| Create Provider   | ✅    | ✅      | ❌     |
| Update Provider   | ✅    | ✅      | ❌     |
| Delete Provider   | ✅    | ❌      | ❌     |
| Add Scores        | ✅    | ✅      | ❌     |
| Delete Scores     | ✅    | ❌      | ❌     |

## API Endpoints

| Method | Endpoint                              | Auth   | Description                    |
|--------|---------------------------------------|--------|-------------------------------|
| POST   | `/api/v1/auth/login`                  | None   | Authenticate user              |
| GET    | `/api/v1/dashboard`                   | Bearer | Dashboard analytics            |
| GET    | `/api/v1/dashboard/kpis`              | Bearer | KPI summary                    |
| GET    | `/api/v1/providers`                   | Bearer | List providers (paginated)     |
| GET    | `/api/v1/providers/{id}`              | Bearer | Provider details               |
| POST   | `/api/v1/providers`                   | Admin/Manager | Create provider          |
| PUT    | `/api/v1/providers/{id}`              | Admin/Manager | Update provider          |
| DELETE | `/api/v1/providers/{id}`              | Admin  | Soft-delete provider           |
| GET    | `/api/v1/providers/specialties`       | Bearer | List specialties               |
| GET    | `/api/v1/providerscores/provider/{id}`| Bearer | Scores by provider             |
| POST   | `/api/v1/providerscores`              | Admin/Manager | Create score             |
| DELETE | `/api/v1/providerscores/{id}`         | Admin  | Delete score                   |

## Project Structure

```
ProviderAnalyticsPOC/
├── backend/
│   └── ProviderAnalytics.API/
│       ├── Controllers/          # API Controllers
│       ├── Data/                 # DbContext
│       ├── DTOs/                 # Data Transfer Objects
│       ├── Entities/             # EF Core Entities
│       ├── Mappings/             # AutoMapper Profiles
│       ├── Middleware/           # Global Exception Handler
│       ├── Repositories/         # Repository Pattern
│       ├── Services/             # Business Logic
│       ├── Validators/           # FluentValidation
│       ├── Program.cs            # App Configuration
│       └── appsettings.json      # Config
├── frontend/
│   ├── src/
│   │   ├── components/           # React Components
│   │   ├── context/              # Auth Context
│   │   ├── pages/                # Page Components
│   │   ├── services/             # API Services
│   │   ├── types/                # TypeScript Types
│   │   ├── App.tsx               # Route Configuration
│   │   ├── main.tsx              # Entry Point
│   │   └── index.css             # Global Styles
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── tests/
│   ├── e2e/
│   │   └── app.spec.ts           # Playwright Tests
│   ├── playwright.config.ts
│   └── package.json
└── README.md
```
