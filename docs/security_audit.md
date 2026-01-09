# Security Audit & Risk Assessment: ipacx-crm

## 1. Current Security Posture (The "Good")

### 1.1 Authentication & Identity
- **Framework**: Uses `NextAuth.js` (Auth.js) v5.
- **Protocol**: Industry-standard Session Management (HTTP-only cookies).
- **Protection**: Immune to standard Cross-Site Scripting (XSS) session theft because cookies are not accessible via JavaScript.

### 1.2 Database Security
- **ORM**: Uses `Prisma ORM`.
- **SQL Injection**: **Invulnerable**. Prisma parameterizes all queries properly, meaning hackers cannot inject malicious SQL code via input fields.

### 1.3 Server-Side Execution
- **Architecture**: Uses Next.js Server Actions.
- **Benefit**: Database credentials (`DATABASE_URL`) are never exposed to the client-side browser.

## 2. Vulnerability Assessment (The "Risks")

### 2.1 Role-Based Access Control (RBAC)
- **Status**: Implemented manually in `lib/rbac.ts`.
- **Risk**: Moderate. If a developer forgets to add `hasPermission()` check on a new page, unauthorized users might access it.
- **Testing**: You must manually login as "Staff" and try to open "/admin/settings" to verify protection holding.

### 2.2 Input Validation
- **Status**: Uses `Zod` schemas for most forms.
- **Risk**: Low. Malformed data is rejected.
- **Malware Risk**: File uploads (Images/Documents) are currently stored as Strings or simple URLs. If you implement actual file uploading, you MUST verify file types to prevent uploading `.exe` or `.php` shells.

### 2.3 Rate Limiting (DDoS Protection)
- **Status**: **Missing**.
- **Risk**: High. A bot could brute-force the login page or spam the "Create Lead" API.
- **Mitigation**: Deploy on Vercel (Auto-DDOS protection) or use `upstash/ratelimit`.

## 3. Cyber Attack & Malware Protection

### 3.1 "Hackers"
- **Attack Vector**: Social Engineering (Phishing employees for passwords).
- **Defenses**: 
    - The code forces Hard Redirects on Logout.
    - Passwords are Hashed (bcrypt) in the database (assuming `seed.ts` logic is used). *Never store plain text passwords.*

### 3.2 "Malware / Viruses"
- **Web App Nature**: Users cannot "catch" a virus just by browsing the app unless you serve malicious ads (which you don't).
- **Server Risk**: If you host this on a cheap VPS (e.g., DigitalOcean) without a firewall, the *server* can be hacked.
- **Recommendation**: Use strict firewalls (UFW) or managed hosting (Vercel, AWS Amplify) which handles OS security for you.

## 4. Testing for Bugs

### 4.1 Automated Security Scans
- Use free tools like **OWASP ZAP** or **npm audit** to check for vulnerable dependencies.
- Run: `npm audit` in your terminal.

### 4.2 Manual "Penetration" Test
1.  **Privilege Escalation**: Login as Staff. Try to change the URL to `/admin/settings`. You should be kicked out.
2.  **IDOR (Insecure Direct Object Reference)**: Login as User A. Try to access `/invoices/[User B's Invoice ID]`. If you can see it, that's a security bug.
