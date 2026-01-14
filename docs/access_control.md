# Access Control & Security

## Overview
Security in this application is enforced at multiple layers:
1.  **Authentication**: Verifying who the user is.
2.  **Authorization (RBAC)**: Verifying what the user can do.
3.  **Data Protection**: Ensuring users only see data they are allowed to see.

## Roles

| Role | Description | Access Scope |
| :--- | :--- | :--- |
| **ADMIN** | Superuser | Full access to all modules, settings, and logs. |
| **STAFF** | General Employee | Basic access (Self-service HR, allocated tasks). |
| **HR_MANAGER** | HR Specialist | Full access to HR module (Employees, Payroll, Departments). |
| **SALES_HEAD** | Sales Leader | Full CRM access, view-only Inventory. |
| **ACCOUNTANT** | Finance | Full Finance access, view-only Inventory/Sales. |
| **INVENTORY_MGR** | Warehouse Lead | Full Inventory, Production, and Vendor access. |

## Permissions Matrix

### Admin Module
| Feature | Admin | HR | Accountant | Staff |
| :--- | :---: | :---: | :---: | :---: |
| User Mgmt | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |
| Audit Logs | ✅ | ❌ | ❌ | ❌ |

### HR Module
| Feature | Admin | HR | Accountant | Staff |
| :--- | :---: | :---: | :---: | :---: |
| Full Employee List | ✅ | ✅ | ❌ | ❌ |
| Salary Details | ✅ | ✅ | ✅ | ❌ |
| Leave Approval | ✅ | ✅ | ❌ | ❌ |
| My Profile | ✅ | ✅ | ✅ | ✅ |

### Finance Module
| Feature | Admin | Sales | Accountant | Inv. Mgr |
| :--- | :---: | :---: | :---: | :---: |
| Create Invoice | ✅ | ✅ | ✅ | ❌ |
| Record Expense | ✅ | ❌ | ✅ | ✅ |
| View Ledger | ✅ | ❌ | ✅ | ❌ |

## Security Implementation

### Middleware Protection
The `middleware.ts` file acts as the first line of defense.
1.  **Session Check**: Redircts unauthenticated users to `/login`.
2.  **Route Guarding**: Checks `req.nextUrl.pathname`.
    - `/admin/settings/*` -> Requires `ADMIN` role.
    - `/admin/hr/*` -> Requires `ADMIN` or `HR_MANAGER`.

### Server-Side Data Fetching
In Server Actions and Components, we verify the user's ID and Role before fetching sensitive data.
```typescript
// Example Pattern
const session = await auth();
if (!session || session.user.role !== 'ADMIN') {
  throw new Error("Unauthorized");
}
```
