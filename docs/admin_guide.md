# Admin Guide: Enterprise ERP System

## 1. System Overview
This ERP system integrates CRM, Accounting, HR, and Project Management. As an admin, you have full access to all modules and configurations.

## 2. Initial Setup
### 2.1 First Login
- Credentials: Provided by the deployment team.
- **Action**: Immediately change your password in **Settings > My Profile**.

### 2.2 Company Profile
- Go to **Settings > Organization**.
- **Action**: Fill in your Company Name, GSTIN, PAN, and Address. This information is critical as it appears on all Invoices and Reports.
- **Logo**: Upload your company logo here.

### 2.3 Communication Channels
- Go to **Settings > Communication**.
- **Email**: Configure SMTP settings (e.g., SendGrid, AWS SES) to enable system emails (Welcome emails, Invoice PDFs).
- **WhatsApp**: (Optional) Add Meta Business API credentials to enable "Click to Chat" features in CRM.

## 3. User Management & Roles
Access: **Settings > User Management** (Admin only).

### 3.1 Creating Users
1. Click **Add User**.
2. **Role**:
   - **ADMIN**: Full Access.
   - **STAFF**: Can view Projects, Tasks. Restricted HR/Settings.
   - **SALES**: Access to CRM, Leads, Calendar only.
   - **ARCHITECT**: Access to Projects, Drawings only.
   - **ACCOUNTANT**: Access to Invoices, Expenses, Ledger.

### 3.2 Permissions (RBAC)
- Permissions are hardcoded based on roles.
- To modify permissions, a developer must update `lib/rbac.ts`.

## 4. HR Configuration
Access: **Settings > HR & Payroll** (Moved from HR Dashboard).
- **Departments**: Add/Edit departments (e.g., Sales, Engineering).
- **Designations**: Add job titles.
- **Shifts**: Define 9-5 or split shifts.

## 5. Maintenance & Troubleshooting
### 5.1 "Refresh Required" Issue
- If users report seeing a blank dashboard, ask them to hard refresh (Ctrl+R). This usually happens after a new deployment.

### 5.2 Deletion Errors
- **Problem**: "Cannot delete Client".
- **Cause**: The client has Invoices or Won Deals.
- **Solution**: You must manually delete the Invoices or Archive the client instead of deleting. This is a safety feature to preserve financial records.

### 5.3 System Logs
- Currently, logs are available on the server console (`pm2 logs` or Docker logs).
