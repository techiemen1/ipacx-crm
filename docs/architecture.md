# System Architecture

## Overview
This application is a comprehensive ERP and CRM solution designed for enterprise management. It integrates multiple business functions into a single unified platform, providing real-time insights and operational control.

## Technology Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with `shadcn/ui` components
- **State Management**: Server Components & Server Actions (minimizing client-side state)

### Backend
- **Runtime**: Node.js (via Next.js API Routes & Server Actions)
- **Database**: 
  - **Development**: SQLite (`prisma/dev.db`)
  - **Production**: PostgreSQL (Recommended)
- **ORM**: Prisma
- **Authentication**: Custom implementation using `next-auth` (v5 beta) or similar patterns tailored for role-based access.

## Directory Structure

### `/app`
Contains the application routes and views.
- `(admin)`: Protected routes for internal staff (Admin, HR, Sales, etc.).
- `(public)`: Public-facing pages (Landing page, Contact, Login).
- `api`: Backend API endpoints (mostly replaced by Server Actions).

### `/components`
Reusable UI building blocks.
- `ui`: Primitive components (Buttons, Inputs) from `shadcn/ui`.
- `admin`: Business-specific components (e.g., `EmployeeForm`, `InvoiceTable`).
- `layout`: Structural components (Sidebar, Header).

### `/lib`
Utility functions and business logic.
- `actions.ts`: Core server actions for data mutation.
- `hr-actions.ts`: HR-specific server logic.
- `prisma.ts`: Database client instance.
- `utils.ts`: Helper functions (formatting, validation).

### `/prisma`
Database configuration.
- `schema.prisma`: The single source of truth for the data model.
- `seed.ts`: Script to populate initial data.

## Key Architectural Patterns

### Server Actions
We utilize Next.js Server Actions for form submissions and data mutations. This allows for:
- **Type Safety**: End-to-end type safety from database to frontend.
- **Progressive Enhancement**: Forms work even if JS is slow to load.
- **Security**: Logic executes on the server, closer to the data.

### Dual-Database Support
The system is designed to run on SQLite for ease of development and testing, but switch seamlessly to PostgreSQL for production workloads using the `scripts/switch-db.js` utility.

### Role-Based Access Control (RBAC)
Middleware intercepts requests to protected routes (`/admin/*`) and verifies the user's session and role permissions before rendering the page.
