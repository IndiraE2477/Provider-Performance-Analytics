# Provider Performance Analytics Dashboard (POC)

An enterprise-level full-stack Proof of Concept application designed for healthcare organizations to monitor, evaluate, and improve provider performance. The platform aggregates KPI metrics, tracks performance scores across multiple evaluation categories, visualizes trends through interactive dashboards, identifies at-risk providers, and leverages AI-powered insights for proactive decision-making — all secured behind a robust authentication and role-based authorization system with comprehensive logging and automated end-to-end testing.

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Demo Credentials](#demo-credentials)
- [API Endpoints](#api-endpoints)
- [AI Integration](#ai-integration)
- [Testing](#testing)
- [Project Structure](#project-structure)

---

## Overview

The **Provider Performance Analytics Dashboard** addresses the need for healthcare organizations to consolidate provider evaluation data into a single, actionable platform. Instead of relying on spreadsheets or disconnected systems, this application provides:

- **Centralized Performance Tracking** — Store and manage all provider evaluations with category-based scoring (Quality of Care, Patient Satisfaction, etc.) on a standardized 0–5 scale.
- **Real-Time Analytics** — Interactive dashboards with KPI cards, trend charts, risk distribution visualizations, and comparative provider rankings.
- **AI-Powered Insights** — Integrated with Google Gemini (Vertex AI) to generate risk predictions, performance summaries, actionable recommendations, error log analysis, and a conversational AI assistant.
- **Role-Based Workflows** — Three distinct roles (Admin, Manager, Viewer) with granular permissions controlling who can view, create, update, or delete data.
- **Audit & Compliance** — Every create, update, and delete operation is captured in an audit trail with before/after values (stored as JSON), and all application errors are logged to both file and database for traceability.
- **Provider-Linked User Accounts** — Users can optionally be linked to a specific provider, enabling provider-specific dashboards and personalized views.

---

## Technology Stack

| Layer              | Technology                                | Details                                                        |
| ------------------ | ----------------------------------------- | -------------------------------------------------------------- |
| **Frontend**       | React 19 + TypeScript 6 + Vite 6          | SPA with lazy-loaded routes and Suspense fallbacks             |
| **UI Styling**     | Tailwind CSS 4                            | Utility-first CSS framework                                    |
| **Charts**         | Recharts 3                                | Line, Bar, and Pie chart components for data visualization     |
| **State Mgmt**     | Redux Toolkit + React Query (TanStack v5) | Redux for app state, React Query for server state with caching |
| **Forms**          | Formik + Yup                              | Declarative form handling with schema-based validation         |
| **HTTP Client**    | Axios                                     | API calls with JWT interceptors for automatic token injection  |
| **Notifications**  | React Toastify                            | Toast notifications for user feedback                          |
| **Icons**          | React Icons                               | Icon library for UI elements                                   |
| **Routing**        | React Router DOM v7                       | Client-side routing with protected route guards                |
| **Backend**        | .NET 10 Web API                           | RESTful API with controller-based architecture                 |
| **ORM**            | Entity Framework Core                     | Code-first with migrations, global query filters               |
| **Database**       | SQL Server                                | Relational database with seed data on startup                  |
| **Authentication** | JWT Bearer Tokens (BCrypt hashing)        | 8-hour token expiration with issuer/audience validation        |
| **Authorization**  | Role-Based Access Control (RBAC)          | Policy-based authorization with three role tiers               |
| **Validation**     | FluentValidation                          | Strongly-typed request DTO validation rules                    |
| **Mapping**        | AutoMapper                                | Entity ↔ DTO mapping profiles                                  |
| **Logging**        | Serilog                                   | Console + daily rolling file sinks                             |
| **API Docs**       | Swagger / OpenAPI                         | Interactive API documentation with JWT auth support            |
| **API Versioning** | Asp.Versioning                            | URL-segment versioning (`/api/v1/`)                            |
| **AI**             | Google Gemini (gemini-2.0-flash)          | Risk predictions, insights, recommendations, chat assistant    |
| **Testing**        | Playwright + TypeScript                   | Cross-browser end-to-end test automation                       |

---

## Architecture

### High-Level Data Flow

```
┌─────────────────┐     HTTP/JSON      ┌─────────────────────────────────────────────────────┐
│  React Frontend │ ◄──────────────►   │                  .NET 10 Web API                    │
│  (Vite + TS)    │   Axios + JWT      │                                                     │
│                 │                     │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  - React Query  │                     │  │ Controllers│→│ Services │→│  Repositories    │   │
│  - Redux Toolkit│                     │  └──────────┘  └──────────┘  └──────────────────┘   │
│  - React Router │                     │       ↑              ↑              ↓               │
│  - Recharts     │                     │  Middleware     Validators     EF Core + SQL       │
│  - Formik/Yup   │                     │  (Exception)   (Fluent)       Server               │
└─────────────────┘                     └─────────────────────────────────────────────────────┘
                                                                              ↓
                                                                    ┌─────────────────┐
                                                                    │   SQL Server DB  │
                                                                    │  (6 tables)      │
                                                                    └─────────────────┘
                                              ↕
                                     ┌─────────────────┐
                                     │  Google Gemini   │
                                     │  (Vertex AI)     │
                                     └─────────────────┘
```

### Backend Layers

| Layer            | Responsibility                                                                                                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Controllers**  | API endpoints organized by domain (Auth, Dashboard, Providers, Scores, AI, Users, Profile, Errors). All routes versioned under `/api/v1/`.                                                                                                           |
| **Services**     | Business logic layer containing 8 services: `AuthService`, `DashboardService`, `ProviderService`, `ProviderScoreService`, `AiService`, `AuditService`, `ErrorLogService`, `UserManagementService`.                                                   |
| **Repositories** | Data access layer implementing the Generic Repository pattern. Includes `GenericRepository<T>` base class with entity-specific repositories (`ProviderRepository`, `UserRepository`, etc.) and interface contracts.                                  |
| **Entities**     | EF Core entity models with navigation properties, soft delete support (`IsDeleted` flag), and timestamp tracking (`CreatedAt`, `UpdatedAt`).                                                                                                         |
| **DTOs**         | Request and response Data Transfer Objects separated by domain. Includes `PagedResult<T>` for standardized pagination and `ApiResponse<T>` / `ApiErrorResponse` wrappers.                                                                            |
| **Validators**   | FluentValidation rule sets applied to all incoming request DTOs — enforcing mandatory fields, score ranges, format constraints, and business rules.                                                                                                  |
| **Mappings**     | AutoMapper profiles for bidirectional Entity ↔ DTO mapping.                                                                                                                                                                                          |
| **Middleware**   | `GlobalExceptionMiddleware` catches all unhandled exceptions, classifies them by type (400 for `InvalidOperationException`, 401 for `UnauthorizedAccessException`, 500 for others), logs to database, and returns standardized JSON error responses. |

### Frontend Structure

| Layer          | Responsibility                                                                                                                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pages (11)** | `LoginPage`, `RegisterPage`, `DashboardPage`, `ProvidersPage`, `ProviderDetailPage`, `AnalyticsPage`, `AiInsightsPage`, `AuditLogsPage`, `ErrorLogsPage`, `UsersPage`, `ProfilePage` — all lazy-loaded with React Suspense. |
| **Components** | `Layout` (main app shell), `Sidebar` (navigation menu), `ProtectedRoute` (route guard that checks authentication and role-based access).                                                                                    |
| **Services**   | Centralized Axios API client with request/response interceptors that automatically attach JWT tokens and handle 401 redirects.                                                                                              |
| **Context**    | `AuthContext` manages JWT token storage, user session state, login/logout flows, and exposes the current user's role for UI conditional rendering.                                                                          |
| **Store**      | Redux Toolkit store for global application state management.                                                                                                                                                                |
| **Types**      | Comprehensive TypeScript type definitions mirroring backend DTOs for end-to-end type safety.                                                                                                                                |

---

## Features

### Authentication & Authorization

The application implements a complete authentication and authorization system:

- **JWT Token Authentication** — Users log in with username/password, receive a JWT token (8-hour expiration) with claims including user ID, username, role, and optional provider ID. All subsequent API requests include the token as a Bearer header.
- **BCrypt Password Hashing** — Passwords are securely hashed using BCrypt before storage. The system includes an auto-reset mechanism for development convenience.
- **User Registration** — New users can self-register with username, email, full name, and password. Optionally link to an existing provider.
- **Three Roles with Granular Permissions**:
  - **Admin** — Full access to all features including user management, audit logs, error logs, provider deletion, score deletion, and AI error analysis.
  - **Manager** — Can create/update providers and scores, access AI insights, but cannot delete records or manage users.
  - **Viewer** — Read-only access to dashboards, provider listings, and analytics.
- **Protected Frontend Routes** — `ProtectedRoute` component checks authentication status and user role before rendering pages. Unauthorized users are redirected to login.
- **Secured API Endpoints** — All controllers (except login/register) require JWT Bearer authentication. Destructive operations enforce role-based `[Authorize]` policies.

### Dashboard & Analytics

The dashboard provides a comprehensive, at-a-glance view of organizational provider performance:

- **KPI Cards** (4 metrics):
  - **Average Score** — Organization-wide average across all provider evaluations
  - **Total Providers** — Count of active (non-deleted) providers
  - **At-Risk Providers** — Providers with average scores below threshold
  - **Monthly Improvement** — Score trend compared to previous month
- **Interactive Charts** (powered by Recharts):
  - **Monthly Score Trends** — Line chart showing average score progression over time
  - **Risk Distribution** — Pie chart categorizing providers by performance status
  - **Top Providers** — Bar chart highlighting highest-performing providers
  - **Bottom Providers** — Bar chart highlighting providers needing attention
- **Admin Summary** — Admin-only view with total users, active users, audit log counts, and recent activity feed
- **Provider-Specific Dashboard** — Drill into individual provider performance with category breakdowns, score history, trend direction, and evaluation counts
- **React Query Caching** — Dashboard data is cached on the client side, reducing redundant API calls and improving perceived performance

### Provider Management

Full lifecycle management for healthcare providers:

- **CRUD Operations** — Create, read, update, and soft-delete providers with role-based access enforcement
- **Provider Data Model** — Each provider record includes: Name, Specialty, Email, Phone, Location, Status (Active/Inactive), creation/update timestamps, and the user who performed the action
- **Server-Side Operations** — Search (by name), filter (by specialty, status), sort (by any column with ascending/descending), and paginate (configurable page size) — all processed server-side for scalability
- **Soft Delete** — Providers are never physically removed from the database. A `IsDeleted` flag is set, and EF Core global query filters automatically exclude soft-deleted records from all standard queries
- **Duplicate Prevention** — Business rule validation prevents creating providers with duplicate names
- **Provider Detail View** — Dedicated page showing provider information, complete score history with trend charts, and category-based performance breakdown

### Score Tracking & Evaluation

- **Standardized Scoring** — All scores are on a 0–5 decimal scale for consistent benchmarking
- **Category-Based Evaluation** — Scores are tagged with evaluation categories (e.g., Quality of Care, Patient Satisfaction, Compliance, Communication)
- **Evaluation Metadata** — Each score records the evaluation date, evaluator identity, and optional notes
- **Score History** — Complete historical record per provider with trend visualization
- **Score Deletion** — Admin-only capability to remove erroneous or outdated scores

### User Management (Admin)

- **User CRUD** — Admins can create, view, and update user accounts
- **Role Assignment** — Assign Admin, Manager, or Viewer roles to users
- **Provider Linking** — Optionally associate a user with a specific provider for personalized views
- **Active/Inactive Status** — Control user access by toggling active status

### Profile Management

- **Self-Service Profile** — All authenticated users can view and update their own profile (full name, email)
- **Password Change** — Users can change their own password with current password verification

### Validation (Dual-Layer)

Validation is enforced at both the frontend and backend:

- **Backend (FluentValidation)** — Strongly-typed validation rules on all request DTOs. Covers mandatory fields, string length constraints, score range (0–5), email format, and business rules like duplicate provider name detection. Validation errors return structured `ApiErrorResponse` with field-level error messages.
- **Frontend (Formik + Yup)** — Schema-based form validation providing instant client-side feedback. Error messages displayed inline next to form fields before submission.

### Logging, Auditing & Monitoring

The application maintains three layers of observability:

- **Structured Logging (Serilog)** — All application events are logged to console and daily rolling log files (`Logs/log-YYYYMMDD.txt`). Log levels are configurable per namespace (e.g., Microsoft.AspNetCore set to Warning to reduce noise).
- **Database Error Logging** — The `GlobalExceptionMiddleware` persists every unhandled exception to the `ErrorLogs` table with: error message, stack trace, source, HTTP request path, HTTP method, and HTTP status code. Admins can view these through the Error Logs page.
- **Audit Trail** — Every Create, Update, and Delete operation on business entities is recorded in the `AuditLogs` table with: entity name, action type, entity ID, old values (JSON), new values (JSON), modified by (username), and timestamp. Admins can review audit history through the Audit Logs page.

### AI-Powered Insights (Google Gemini)

The application integrates with Google Gemini (gemini-2.0-flash) via the `AiService` to provide intelligent analytics:

- **Risk Predictions** — AI analyzes provider performance data and predicts risk levels with probability scores, risk factors, and recommendations
- **Performance Summaries** — Natural language summaries of provider performance highlighting strengths, areas for improvement, and trend direction
- **Dashboard Insights** — AI-generated insights across the organization categorized by type and severity
- **Provider Recommendations** — Actionable recommendations for specific providers with priority levels
- **Error Log Analysis** — AI pattern recognition on application error logs identifying root causes, occurrence patterns, and remediation suggestions (Admin only)
- **AI Assistant** — Conversational interface where users can ask questions about provider data and receive AI-generated answers with contextual data

### Advanced Technical Features

- **Global Exception Handling** — Centralized middleware catches all unhandled exceptions, classifies them (400/401/500), logs to database, and returns standardized JSON responses
- **Generic Repository Pattern** — Base `GenericRepository<T>` provides common CRUD operations; entity-specific repositories extend it with custom queries
- **Service Layer Architecture** — 8 dedicated services encapsulating all business logic, keeping controllers thin
- **DTO Pattern with AutoMapper** — Clean separation between API contracts and database entities with automatic mapping
- **API Versioning** — URL-segment versioning (`/api/v1/`) via Asp.Versioning, enabling future API evolution without breaking clients
- **Soft Delete with Global Query Filters** — EF Core automatically applies `WHERE IsDeleted = false` to all Provider queries
- **Standardized API Responses** — All endpoints return `ApiResponse<T>` (success) or `ApiErrorResponse` (failure) for consistent client handling
- **Paginated Results** — `PagedResult<T>` wrapper includes items, total count, page info, and computed `HasPrevious`/`HasNext` flags
- **React Lazy Loading** — All page components are lazy-loaded with Suspense boundaries for optimized bundle splitting
- **Axios Interceptors** — Automatic JWT token injection on requests and 401-based redirect to login on expired tokens
- **CORS Configuration** — Configured to allow React dev server origins (ports 3000, 5173–5176)
- **Auto-Migration** — Database migrations are automatically applied on application startup
- **Responsive UI Design** — Tailwind CSS-based layout adapts to different screen sizes

---

## Database Schema

### Entity Relationship

```
┌──────────┐       ┌──────────────┐       ┌───────────────┐
│  Roles   │──1:N──│    Users     │──N:1──│   Providers   │
└──────────┘       └──────────────┘       └───────────────┘
                                                 │
                                                1:N
                                                 │
                                          ┌───────────────┐
                                          │ ProviderScores│
                                          └───────────────┘

┌──────────────┐       ┌──────────────┐
│  AuditLogs   │       │  ErrorLogs   │
└──────────────┘       └──────────────┘
```

### Tables

| Table              | Key Columns                                                                                                         | Description                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Roles**          | Id, Name                                                                                                            | Three predefined roles: Admin, Manager, Viewer                       |
| **Users**          | Id, Username, Email, PasswordHash, FullName, RoleId (FK), ProviderId (FK, nullable), IsActive, CreatedAt, LastLogin | Application users with role assignment and optional provider linkage |
| **Providers**      | Id, Name, Specialty, Email, Phone, Location, Status, IsDeleted, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy          | Healthcare provider records with soft delete support                 |
| **ProviderScores** | Id, ProviderId (FK), Score (0–5), Category, Notes, EvaluationDate, EvaluatedBy, CreatedAt                           | Individual performance evaluation scores                             |
| **AuditLogs**      | Id, EntityName, ActionType, EntityId, OldValues (JSON), NewValues (JSON), ModifiedBy, Timestamp                     | CUD operation audit trail with before/after state                    |
| **ErrorLogs**      | Id, Message, StackTrace, Source, Path, Method, StatusCode, Timestamp                                                | Application error records captured by middleware                     |

---

## Getting Started

### Prerequisites

- **.NET 10 SDK** — [Download](https://dotnet.microsoft.com/download)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **SQL Server** — LocalDB, SQL Server Express, or full instance
- **Google Gemini API Key** (optional) — Required only for AI features

### Backend Setup

```bash
cd backend/ProviderAnalytics.API

# Update connection string in appsettings.json if needed
# Default: Server=localhost;Database=ProviderAnalyticsDb;Trusted_Connection=true

# Install EF Core tools (if not already installed)
dotnet tool install --global dotnet-ef

# Create database and apply migrations
dotnet ef migrations add InitialCreate
dotnet ef database update

# Run the API
dotnet run
```

The API will start at `https://localhost:5001` with Swagger UI at `/swagger`.

> **Note:** On first startup, the application automatically applies pending migrations and seeds default users (admin, manager, viewer) with pre-configured roles.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will start at `http://localhost:5173`.

### AI Features Setup (Optional)

To enable AI-powered insights, update `appsettings.json` with your Google Gemini credentials:

```json
{
  "VertexAI": {
    "ApiKey": "your-api-key",
    "ProjectId": "your-project-id",
    "Model": "gemini-2.0-flash",
    "Location": "us-central1"
  }
}
```

### Running Playwright Tests

```bash
cd tests

# Install dependencies and browsers
npm install
npm run install:browsers

# Run tests (headless)
npm test

# Run tests with browser visible
npm run test:headed

# View test report
npm run test:report
```

> **Note:** Ensure both the backend API and frontend dev server are running before executing tests.

---

## Demo Credentials

Login supports both **username** and **email**.

| Role    | Username | Email                          | Password  |
| ------- | -------- | ------------------------------ | --------- |
| Admin   | admin    | admin@provideranalytics.com    | Admin@123 |
| Manager | manager  | manager@provideranalytics.com  | Admin@123 |
| Viewer  | viewer   | viewer@provideranalytics.com   | Admin@123 |

### Role Permissions Matrix

| Action            | Admin | Manager | Viewer |
| ----------------- | ----- | ------- | ------ |
| View Dashboard    | ✅    | ✅      | ✅     |
| View Providers    | ✅    | ✅      | ✅     |
| View Analytics    | ✅    | ✅      | ✅     |
| View Own Profile  | ✅    | ✅      | ✅     |
| Create Provider   | ✅    | ✅      | ❌     |
| Update Provider   | ✅    | ✅      | ❌     |
| Delete Provider   | ✅    | ❌      | ❌     |
| Add Scores        | ✅    | ✅      | ❌     |
| Delete Scores     | ✅    | ❌      | ❌     |
| AI Insights       | ✅    | ✅      | ❌     |
| AI Error Analysis | ✅    | ❌      | ❌     |
| Manage Users      | ✅    | ❌      | ❌     |
| View Audit Logs   | ✅    | ❌      | ❌     |
| View Error Logs   | ✅    | ❌      | ❌     |

---

## API Endpoints

### Authentication

| Method | Endpoint                 | Auth | Description                                   |
| ------ | ------------------------ | ---- | --------------------------------------------- |
| POST   | `/api/v1/auth/login`     | None | Authenticate user, returns JWT token          |
| POST   | `/api/v1/auth/register`  | None | Register a new user account                   |
| GET    | `/api/v1/auth/providers` | None | List active providers (for registration form) |

### Dashboard

| Method | Endpoint                          | Auth   | Description                                          |
| ------ | --------------------------------- | ------ | ---------------------------------------------------- |
| GET    | `/api/v1/dashboard`               | Bearer | Full dashboard analytics (KPIs, trends, charts)      |
| GET    | `/api/v1/dashboard/kpis`          | Bearer | KPI summary metrics only                             |
| GET    | `/api/v1/dashboard/admin-summary` | Admin  | Admin summary with user counts and recent audit logs |
| GET    | `/api/v1/dashboard/provider/{id}` | Bearer | Provider-specific dashboard with category breakdown  |

### Providers

| Method | Endpoint                        | Auth          | Description                                        |
| ------ | ------------------------------- | ------------- | -------------------------------------------------- |
| GET    | `/api/v1/providers`             | Bearer        | List providers (paginated, searchable, filterable) |
| GET    | `/api/v1/providers/{id}`        | Bearer        | Get provider details                               |
| POST   | `/api/v1/providers`             | Admin/Manager | Create a new provider                              |
| PUT    | `/api/v1/providers/{id}`        | Admin/Manager | Update an existing provider                        |
| DELETE | `/api/v1/providers/{id}`        | Admin         | Soft-delete a provider                             |
| GET    | `/api/v1/providers/specialties` | Bearer        | List all unique specialties                        |

### Provider Scores

| Method | Endpoint                               | Auth          | Description                   |
| ------ | -------------------------------------- | ------------- | ----------------------------- |
| GET    | `/api/v1/providerscores/provider/{id}` | Bearer        | Get all scores for a provider |
| POST   | `/api/v1/providerscores`               | Admin/Manager | Add a new evaluation score    |
| DELETE | `/api/v1/providerscores/{id}`          | Admin         | Delete a score record         |

### AI Insights

| Method | Endpoint                                      | Auth          | Description                                 |
| ------ | --------------------------------------------- | ------------- | ------------------------------------------- |
| GET    | `/api/v1/ai/risk-predictions`                 | Admin/Manager | Get risk predictions for all providers      |
| GET    | `/api/v1/ai/risk-predictions/{providerId}`    | Admin/Manager | Get risk prediction for a specific provider |
| GET    | `/api/v1/ai/performance-summary/{providerId}` | Admin/Manager | Get AI-generated performance summary        |
| GET    | `/api/v1/ai/dashboard-insights`               | Admin/Manager | Get AI-generated organizational insights    |
| GET    | `/api/v1/ai/recommendations/{providerId}`     | Admin/Manager | Get AI recommendations for a provider       |
| GET    | `/api/v1/ai/error-analysis`                   | Admin         | AI analysis of application error patterns   |
| POST   | `/api/v1/ai/assistant`                        | Admin/Manager | Ask the AI assistant a question             |

### User Management

| Method | Endpoint             | Auth  | Description         |
| ------ | -------------------- | ----- | ------------------- |
| GET    | `/api/v1/users`      | Admin | List all users      |
| GET    | `/api/v1/users/{id}` | Admin | Get user by ID      |
| POST   | `/api/v1/users`      | Admin | Create a new user   |
| PUT    | `/api/v1/users/{id}` | Admin | Update user details |

### Profile

| Method | Endpoint                          | Auth   | Description                    |
| ------ | --------------------------------- | ------ | ------------------------------ |
| GET    | `/api/v1/profile`                 | Bearer | Get current user's profile     |
| PUT    | `/api/v1/profile`                 | Bearer | Update current user's profile  |
| PUT    | `/api/v1/profile/change-password` | Bearer | Change current user's password |

### Error Logs

| Method | Endpoint            | Auth  | Description                    |
| ------ | ------------------- | ----- | ------------------------------ |
| GET    | `/api/v1/errorlogs` | Admin | Get all application error logs |

---

## AI Integration

The application integrates with **Google Gemini (gemini-2.0-flash)** through the `AiService`, which communicates via HTTP client to the Vertex AI API. AI features are accessible to Admin and Manager roles through the dedicated **AI Insights** page.

### Capabilities

| Feature                 | Description                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Risk Predictions**    | Analyzes provider score history and trends to predict risk level (Low/Medium/High) with probability scores and contributing risk factors    |
| **Performance Summary** | Generates natural language summaries identifying strengths, areas for improvement, and overall trend direction (Improving/Declining/Stable) |
| **Dashboard Insights**  | Organization-wide insights categorized by type (Performance, Risk, Trend) with severity levels                                              |
| **Recommendations**     | Actionable recommendations for specific providers with priority ranking and reasoning                                                       |
| **Error Analysis**      | Identifies patterns in application error logs, groups by root cause, and suggests remediation steps                                         |
| **AI Assistant**        | Conversational interface for asking questions about provider data with contextual responses                                                 |

---

## Testing

### E2E Test Coverage (Playwright)

The test suite covers the critical user workflows with 16+ test cases across 3 test suites:

**Login Tests (6 tests)**

- Verifies login page renders correctly
- Validates empty field error messages
- Validates short password rejection
- Verifies invalid credentials handling
- Confirms successful login with valid credentials
- Tests login across different roles (viewer)

**Dashboard Tests (4 tests)**

- Validates 4 KPI cards are displayed
- Validates 4 chart components render
- Verifies KPI values are within expected 0–5 range
- Tests navigation from dashboard to providers page

**Provider CRUD Tests (6+ tests)**

- Verifies providers table display
- Tests new provider creation flow
- Validates form validation (empty name error)
- Tests provider detail view navigation
- Tests provider edit functionality
- Verifies CRUD permission enforcement

### Running Tests

```bash
cd tests
npm test                 # Headless execution
npm run test:headed      # With browser UI visible
npm run test:report      # Open HTML test report
```

---

## Project Structure

```
ProviderAnalyticsPOC/
├── backend/
│   ├── ProviderAnalytics.slnx              # Solution file
│   └── ProviderAnalytics.API/
│       ├── Controllers/                     # API Controllers (8 controllers)
│       │   ├── AiController.cs              #   AI-powered insights & assistant
│       │   ├── AuthController.cs            #   Login, register, provider list
│       │   ├── DashboardController.cs       #   Dashboard analytics & KPIs
│       │   ├── ErrorLogsController.cs       #   Error log retrieval (Admin)
│       │   ├── ProfileController.cs         #   User profile management
│       │   ├── ProvidersController.cs       #   Provider CRUD operations
│       │   ├── ProviderScoresController.cs  #   Score management
│       │   └── UsersController.cs           #   User management (Admin)
│       ├── DTOs/                            # Data Transfer Objects (8 files)
│       ├── Entities/                        # EF Core Entities (6 entities)
│       ├── Mappings/                        # AutoMapper Profiles
│       ├── Middleware/                      # Global Exception Handler
│       ├── Migrations/                      # EF Core Migrations
│       │   └── Data/                        #   Seed data
│       ├── Repositories/                    # Repository Pattern (Generic + 5 specific)
│       │   └── Interfaces/                  #   Repository contracts
│       ├── Services/                        # Business Logic (8 services)
│       │   └── Interfaces/                  #   Service contracts
│       ├── Validators/                      # FluentValidation Rules
│       ├── Logs/                            # Serilog rolling log files
│       ├── Program.cs                       # Application bootstrap & DI configuration
│       ├── appsettings.json                 # Configuration (DB, JWT, AI, Logging)
│       └── ProviderAnalytics.API.csproj     # Project file
├── frontend/
│   ├── src/
│   │   ├── components/                      # Shared UI Components
│   │   │   ├── Layout.tsx                   #   Main app shell with sidebar
│   │   │   ├── ProtectedRoute.tsx           #   Auth & role-based route guard
│   │   │   └── Sidebar.tsx                  #   Navigation sidebar
│   │   ├── context/                         # React Context
│   │   │   └── AuthContext.tsx              #   JWT auth state management
│   │   ├── pages/                           # Page Components (11 pages)
│   │   │   ├── LoginPage.tsx                #   User login
│   │   │   ├── RegisterPage.tsx             #   User registration
│   │   │   ├── DashboardPage.tsx            #   KPIs & analytics charts
│   │   │   ├── ProvidersPage.tsx            #   Provider listing & CRUD
│   │   │   ├── ProviderDetailPage.tsx       #   Provider detail & scores
│   │   │   ├── AnalyticsPage.tsx            #   Advanced analytics
│   │   │   ├── AiInsightsPage.tsx           #   AI-powered insights
│   │   │   ├── AuditLogsPage.tsx            #   Audit trail viewer (Admin)
│   │   │   ├── ErrorLogsPage.tsx            #   Error log viewer (Admin)
│   │   │   ├── UsersPage.tsx                #   User management (Admin)
│   │   │   └── ProfilePage.tsx              #   User profile
│   │   ├── services/                        # API Client Services
│   │   ├── store/                           # Redux Toolkit Store
│   │   ├── types/                           # TypeScript Type Definitions
│   │   ├── App.tsx                          # Route configuration
│   │   ├── main.tsx                         # Application entry point
│   │   └── index.css                        # Global styles (Tailwind)
│   ├── index.html                           # HTML entry point
│   ├── vite.config.ts                       # Vite build configuration
│   ├── tsconfig.json                        # TypeScript configuration
│   └── package.json                         # Dependencies & scripts
├── tests/
│   ├── e2e/
│   │   └── app.spec.ts                      # Playwright E2E test suites
│   ├── playwright.config.ts                 # Playwright configuration
│   └── package.json                         # Test dependencies & scripts
├── requirements.txt                         # Python dependencies (if any)
└── README.md                                # This file
```
