export const ROLES = ["Owner", "Admin", "Finance", "Purchasing", "Operations", "Warehouse", "Sales", "Viewer"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "organization:read",
  "organization:manage",
  "members:read",
  "members:manage",
  "sessions:read",
  "sessions:revoke",
  "consent:read",
  "consent:manage",
  "purchase_orders:approve",
  "journal:post",
  "financial_data:export",
  "dashboard:read",
  "catalog:read",
  "catalog:manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const allPermissions = new Set<Permission>(PERMISSIONS);
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  Owner: PERMISSIONS,
  Admin: PERMISSIONS,
  Finance: ["organization:read", "members:read", "sessions:read", "sessions:revoke", "consent:read", "consent:manage", "journal:post", "financial_data:export", "dashboard:read", "catalog:read"],
  Purchasing: ["organization:read", "sessions:read", "consent:read", "purchase_orders:approve", "dashboard:read", "catalog:read", "catalog:manage"],
  Operations: ["organization:read", "sessions:read", "consent:read", "dashboard:read", "catalog:read", "catalog:manage"],
  Warehouse: ["organization:read", "sessions:read", "consent:read", "dashboard:read", "catalog:read", "catalog:manage"],
  Sales: ["organization:read", "sessions:read", "consent:read", "dashboard:read", "catalog:read"],
  Viewer: ["organization:read", "consent:read", "dashboard:read", "catalog:read"],
};

export function hasPermission(role: string, permission: string, overrides: unknown = {}): boolean {
  if (role === "Owner") return allPermissions.has(permission as Permission);
  const base = ROLE_PERMISSIONS[role as Role] ?? [];
  if (typeof overrides === "object" && overrides !== null) {
    const value = (overrides as Record<string, unknown>)[permission];
    if (typeof value === "boolean") return value;
  }
  return base.includes(permission as Permission);
}