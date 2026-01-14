# Module Guide: Admin

## Overview
The Admin module is the command center of the application. It handles system configuration, user management, and high-level monitoring.

## Key Features

### 1. User Management
- **Description**: Add and manage system users and staff.
- **Actions**:
  - Create new User keys.
  - Reset passwords.
  - Assign Roles.
  - Link System User to Employee Record.

### 2. Global Settings
- **Company Profile**: Set default currency, timezone, and logo.
- **Tax Configuration**: Define GST rates, TDS sections, and HSN codes.
- **SMTP/Email**: Configure email server for notifications.

### 3. Audit & Logs
- **Activity Logs**: View a timeline of who did what (e.g., "User X deleted Invoice #123").
- **Error Logs**: System-level error capture for debugging.

## Common Workflows

### Onboarding a New System User
1.  Go to `Admin` > `Users`.
2.  Click **"New User"**.
3.  Enter Name, Email, and Initial Password.
4.  Select Role (e.g., `Sales`).
5.  (Optional) If they are an employee, link to their Employee Profile.

### Configuring Taxes
1.  Go to `Admin` > `Settings` > `Taxes`.
2.  Click **"Add Tax Rate"**.
3.  Name: "GST 18%", Rate: 18%.
4.  Split: CGST 9%, SGST 9%.
