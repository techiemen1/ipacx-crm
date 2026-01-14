# Module Guide: HR & Payroll

## Overview
Manages the entire employee lifecycle from onboarding to exit, including attendance tracking and payroll processing.

## 1. Organization Structure
- **Departments**: Define hierarchy (e.g., Engineering -> Frontend Team).
- **Designations**: Standardize job titles (e.g., Senior Developer).
- **Shifts**: Define working hours (e.g., 9-5 General).

## 2. Employee Management
- **Profiles**: Store personal info, bank details, and statutory numbers (PAN, UAN).
- **Documents**: Upload contracts, ID proofs (Future Scope).

## 3. Payroll Processing

### Structure
Salary is defined via **Pay Heads**:
- **Earnings**: Basic, HRA, Special Allowance.
- **Deductions**: PF, PT, TDS.

### Monthly Workflow
1.  **Attendance Finalization**: Ensure all days are marked (Present/Leave).
2.  **Run Payroll**: System calculates gross and net pay based on active days.
3.  **Generate Payslips**: Creates PDF-ready records.
4.  **Post to Accounts**: Creates a Voucher Entry (Debit Salary Exp, Credit Salary Payable).

## 4. Leave Management
- **Types**: CL (Casual), SL (Sick), PL (Privilege).
- **Process**: Employee applies -> Manager Approves -> Balance Deducted.
