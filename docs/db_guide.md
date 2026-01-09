# Database Documentation & Management Guide

## 1. Technology Stack
- **Database Engine**: SQLite (Development) / PostgreSQL (Recommended for Production)
- **ORM**: Prisma (Object-Relational Mapping)
- **Location**: `prisma/dev.db` (SQLite file)

## 2. Choosing Your Edition (Dual Mode)
This project supports two database modes. You can switch between them using our utility script.

### Lite Version (Default)
- **Engine**: SQLite
- **Best for**: Small setups, testing, single-server deployments.
- **Switch**: `node scripts/switch-db.js sqlite`

### Enterprise Version
- **Engine**: PostgreSQL
- **Best for**: Scalability, high concurrency, cloud deployments.
- **Prerequisite**: Docker installed.
- **Setup**:
  1. `docker-compose up -d` (Starts Postgres)
  2. `node scripts/switch-db.js postgres` (Configures App)
  3. `npx prisma db push` (Syncs Schema)

## 3. Schema Overview

### 2.1 Core Modules
- **User Management**: `User` (Auth), `UserProfile` (Details), `Role` (Permissions)
- **CRM**: `Customer` (Clients), `CRMDeal` (Opportunities), `CRMContact` (People)
- **Accounts**: `Invoice`, `Expense`, `TaxRate`, `CompanyProfile`
- **HR**: `Employee`, `HRDepartment`, `Attendance`, `LeaveApplication`, `Payroll`
- **Inventory**: `InventoryItem`, `Warehouse`, `StockMovement`
- **Audit**: `InternalLog` (System activity tracking)

### 2.2 Key Relationships
- **One-to-Many**: One `Customer` has many `CRMDeal`s.
- **One-to-Many**: One `User` has many `Task`s.
- **Foreign Keys**: `Invoice` links to `Customer` via `customerId`.

## 3. How-To: Database Management

### 3.1 Setup & Migration
To apply schema changes to the database:
```bash
# Push schema changes to DB (Development)
npx prisma db push

# Create a migration file (Production)
npx prisma migrate dev --name init
```

### 3.2 Seeding Data
To populate the database with initial test data (Admin user, Indian States, etc.):
```bash
# Run the seed script
node prisma/seed.ts
```

### 3.3 Viewing Data (GUI)
Prisma comes with a built-in admin panel:
```bash
npx prisma studio
```
This opens `http://localhost:5555` in your browser where you can view/edit data manually.

### 3.4 Backup & Restore (SQLite)
Since SQLite is just a file:
- **Backup**: Simply copy `prisma/dev.db` to a safe location.
- **Restore**: Overwrite `prisma/dev.db` with your backup file.

## 4. Resetting the Database
**WARNING**: This deletes ALL data.
```bash
# Delete the file
rm prisma/dev.db

# Recreate and seed
npx prisma db push
node prisma/seed.ts
```
