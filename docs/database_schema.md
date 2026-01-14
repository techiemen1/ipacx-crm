# Database Schema Deep Dive

This document provides a detailed breakdown of the application's data model, defined in `prisma/schema.prisma`.

## 1. User Management & Authentication

### `User`
The central entity for all system access.
- **Roles**: `ADMIN`, `STAFF`, `ARCHITECT`, `SALES`.
- **Relations**: Links to `Employee` (if the user is staff), `UserProfile` (extended details), and various logs/tasks.

### `UserProfile`
Stores non-essential user details like `phone`, `address`, and `avatar`. Separating this keeps the `User` table lightweight for auth checks.

### `Role` & `UserRole`
Standard Many-to-Many RBAC implementation.
- `Role`: Defines a set of permissions (JSON blob).
- `UserRole`: Assigns roles to users.

## 2. Customer Relationship Management (CRM)

### `Customer`
Represents both potential leads and active clients.
- **Status**: Tracks lifecycle (`Lead` -> `Prospect` -> `Customer`).
- **Data**: Stores Billing Address, GSTIN, PAN for invoicing.

### `CRMDeal` (Opportunities)
Tracks sales opportunities.
- **Pipeline**: Linked to `CRMStage` to visualize progress (e.g., "New" -> "Qualified" -> "Won").
- **Value**: Expected revenue from the deal.

### `Activity`
Logs interactions (Calls, Emails, Meetings) with Customers or regarding Deals.

## 3. Financial & Accounting

### `Invoice`
The core document for revenue.
- **Structure**: Header (Customer, Date, Totals) + Lines (`InvoiceItem`).
- **Taxation**: Supports GST logic (CGST/SGST vs IGST) based on `placeOfSupply`.
- **Status**: Tracks Payment (`Unpaid`/`Paid`) and Document Status (`Draft`/`Sent`).

### `Voucher` (Double-Entry Ledger)
The source of truth for all accounting. **Every financial transaction** (Invoice, Payment, Expense) creates a `Voucher`.
- **Types**: `SALES`, `PURCHASE`, `RECEIPT`, `PAYMENT`, `JOURNAL`.
- **Entries**: Usage of `VoucherEntry` to balance Debits and Credits.

### `AccountHead`
Represents granular ledger accounts (e.g., "HDFC Bank", "Sales Account", "Rent Expense").
- **Hierarchy**: Organized under `AccountGroup`.

## 4. HR & Payroll

### `Employee`
Comprehensive record of a staff member.
- **links**: `Department`, `Designation`, `Shift`.
- **Payroll**: Linked to `EmployeePayHead` for salary structuring.

### `Attendance`
Daily logs of presence/absence.
- **Status**: `Present`, `Absent`, `Leave`, `Half-Day`.

### `Payslip`
Generated monthly salary record.
- **Compontents**: Calculates Earnings (Basic, HRA) - Deductions (PF, PT) = Net Pay.
- **Link**: Generates a `Voucher` in accounting upon finalization.

## 5. Inventory & Manufacturing

### `InventoryItem`
A product or raw material.
- **Tracking**: Supports Batch (`InventoryBatch`) and Serial tracking.
- **Stock**: `InventoryStock` tracks quantity per `Warehouse` and `Batch`.

### `StockJournal` & `StockMovement`
The "General Ledger" for inventory.
- **History**: Every change in stock (Purchase, Sale, Production) is recorded as a `StockMovement`.
- **Audit**: Allows reconstructing stock levels at any past date.

### `BillOfMaterial` (BOM)
Recipe for manufacturing.
- **Defined**: 1 Finished Good = X qty of Raw Materials.

### `ProductionOrder`
Execution of a BOM.
- **Logic**: Consumes Raw Materials (Source Warehouse) -> Produces Finished Goods (Target Warehouse).
