export type Role = "ADMIN" | "ARCHITECT" | "SALES" | "SITE_ENGINEER" | "CUSTOMER"

export interface User {
    id: string
    name: string
    email: string
    role: Role
    avatar?: string
}

export const MOCK_USERS: User[] = [
    {
        id: "admin-1",
        name: "Admin User",
        email: "admin@bhunethri.in",
        role: "ADMIN",
    },
    {
        id: "arch-1",
        name: "Lead Architect",
        email: "architect@bhunethri.in",
        role: "ARCHITECT",
    },
    {
        id: "sales-1",
        name: "Sales Manager",
        email: "sales@bhunethri.in",
        role: "SALES",
    },
    {
        id: "cust-1",
        name: "John Doe",
        email: "john@example.com",
        role: "CUSTOMER"
    }
]
