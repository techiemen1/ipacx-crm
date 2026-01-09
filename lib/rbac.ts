export type Role = "ADMIN" | "STAFF" | "SALES" | "ARCHITECT";
export type Resource = "CRM" | "ACCOUNTS" | "HR" | "SETTINGS" | "PROJECTS" | "INVENTORY" | "PROFILES";

export const ROLES: Record<string, Role> = {
    ADMIN: "ADMIN",
    STAFF: "STAFF",
    SALES: "SALES",
    ARCHITECT: "ARCHITECT"
};

const PERMISSIONS: Record<Role, Resource[]> = {
    ADMIN: ["CRM", "ACCOUNTS", "HR", "SETTINGS", "PROJECTS", "INVENTORY", "PROFILES"],
    STAFF: ["CRM", "ACCOUNTS", "PROJECTS", "INVENTORY", "PROFILES"], // Restricted: HR, SETTINGS
    SALES: ["CRM", "PROFILES"], // Restricted: ACCOUNTS, HR, SETTINGS, PROJECTS, INVENTORY
    ARCHITECT: ["PROJECTS"] // Restricted: Everything else
};

export const hasPermission = (role: string | undefined, resource: Resource): boolean => {
    if (!role) return false;
    const userRole = role.toUpperCase() as Role;
    const allowedResources = PERMISSIONS[userRole];
    return allowedResources ? allowedResources.includes(resource) : false;
};

export const getRedirectPath = (role: string | undefined): string => {
    if (!role) return "/login";
    switch (role.toUpperCase()) {
        case "SALES": return "/admin/crm";
        case "ARCHITECT": return "/admin/projects";
        default: return "/dashboard";
    }
};
