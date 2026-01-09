# Testing Strategy & Go-Live Checklist

## 1. Manual User Acceptance Testing (UAT)
Before deployment, perform these scenarios:

### 1.1 Core Workflows
- [ ] **Lead to Deal**: Create a Lead -> Convert to Deal -> Move to "Won".
- [ ] **Invoice Generation**: Create Invoice for that "Won" customer -> Verify Tax (IGST/CGST) -> Record Payment.
- [ ] **HR**: Add Employee -> Mark Attendance -> Check Reports.

### 1.2 Access Control (RBAC)
- [ ] Login as **Staff**: Attempt to access Settings/Admin pages. Should redirect/fail.
- [ ] Login as **Sales**: Attempt to view Accounts/Invoices. Should fail.

### 1.3 Data Integrity
- [ ] **Delete Protection**: Attempt to delete a Client with Invoices. Must fail with error.
- [ ] **Bulk Delete**: Delete 5 test leads. Verify they are gone.

## 2. Browser & Device Testing
- [ ] **Chrome/Edge**: Primary targets.
- [ ] **Mobile (iOS/Android)**: Verify responsive layout, especially Tables and Kanban board.

## 3. Performance & Load
- **Current State**: The application handles ~100 concurrent users reasonably.
- **Bottleneck Risks**: Large lists (Customers > 10,000) will slow down because Pagination is not yet implemented.
- **Action**: Test with ~1,000 dummy records to verify UI responsiveness.

## 4. Security Audit
- [ ] **SSL**: Ensure your production domain has HTTPS.
- [ ] **Environment Variables**: `DATABASE_URL`, `AUTH_SECRET` must be secure.
- [ ] **Backups**: Set up cron job for `sqlite3 .dump` or pg_dump.

## 5. Go-Live Decision
**Go-Live Recommended?**
- **Yes**, for < 50 Users and < 5,000 Records.
- **No**, for Enterprise Scale (> 50 Users, Heavy Data) until Pagination is implemented.
