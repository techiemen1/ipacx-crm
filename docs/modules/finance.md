# Module Guide: Finance & Accounting

## Overview
A complete Double-Entry accounting system integrated directly with Invoicing and expenses.

## Core Concepts

### 1. Invoicing (Receivables)
- **Create Invoice**: Select Customer -> Add Items -> Save.
- **Tax Auto-Calc**: System checks Customer State vs Company State.
  - Same State -> CGST + SGST.
  - Different State -> IGST.
- **E-Invoicing**: (Planned) Fields are available for IRN and QR Code integration.

### 2. Expenses (Payables)
- **Record Expense**: Vendor -> Category (e.g., Travel) -> Amount.
- **Impact**: Debits the Expense Account, Credits the Vendor or Bank/Cash.

### 3. Banking
- **Bank Accounts**: Track real-world bank balances.
- **Reconciliation**: Match Statement Lines with System Vouchers.
- **Cheque Management**: Issue and track cheque leaves.

## The Ledger
The heart of the module.
- **View**: `Accounts` > `Ledger`.
- **Drill-down**: Click on any group -> Head -> Month -> Voucher.

## Reports
1.  **Trial Balance**: Summary of all account balances.
2.  **Profit & Loss**: Income vs Expenses.
3.  **Balance Sheet**: Assets vs Liabilities & Equity.
