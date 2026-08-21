import type pg from "pg";
import { z } from "zod";
import { withTransaction } from "./db.js";
import { AppError } from "./errors.js";
import { hasPermission, PERMISSIONS, ROLES, type Permission, type Role } from "./permissions.js";
import { assertTenantMatch, requireTenantContext, tenantJobPayload, tenantScopedKey, type TenantContext } from "./tenant.js";

export const memberPatchSchema = z.object({
  role: z.enum(ROLES).optional(),
  status: z.enum(["active", "suspended", "removed"]).optional(),
  permissions_override: z.record(z.enum(PERMISSIONS), z.boolean()).optional(),
}).refine((value) => Object.keys(value).length > 0, "at least one membership field is required");

export const organizationPatchSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  business_type: z.string().trim().max(120).nullable().optional(),
  default_currency: z.string().trim().length(3).toUpperCase().optional(),
  timezone: z.string().trim().min(1).max(80).optional(),
  coa_template: z.string().trim().min(1).max(80).optional(),
}).refine((value) => Object.keys(value).length > 0, "at least one organization field is required");

export type TenantRecord = {
  id: string;
  organizationId: string;
  name: string;
  email?: string;
  role?: Role;
  status?: string;
};

export async function listOrganizationMembers(client: pg.Pool | pg.PoolClient, context: TenantContext): Promise<TenantRecord[]> {
  requireTenantContext(context);
  const result = await client.query<TenantRecord>(
    `SELECT u.id, m.organization_id AS "organizationId", u.name, u.email, m.role, m.status
     FROM users u
     JOIN memberships m ON m.user_id = u.id
     JOIN organizations o ON o.id = m.organization_id
     WHERE m.organization_id = $1
       AND m.status <> 'removed' AND m.deleted_at IS NULL
       AND u.status <> 'deleted' AND u.deleted_at IS NULL
       AND o.status = 'active' AND o.deleted_at IS NULL
     ORDER BY u.name ASC`,
    [context.organizationId],
  );
  return result.rows;
}

export async function listUserOrganizations(client: pg.Pool | pg.PoolClient, context: TenantContext) {
  requireTenantContext(context);
  const result = await client.query(
    `SELECT o.id, o.name, o.business_type, o.default_currency, o.timezone, o.coa_template,
            o.status, m.role, m.status AS membership_status
     FROM organizations o
     JOIN memberships m ON m.organization_id = o.id
     WHERE m.user_id = $1 AND m.status = 'active' AND m.deleted_at IS NULL
       AND o.status = 'active' AND o.deleted_at IS NULL
     ORDER BY o.created_at ASC`,
    [context.userId],
  );
  return result.rows;
}

function validatePermissionOverrides(
  actorRole: string,
  overrides: Record<string, boolean> | undefined,
): Record<string, boolean> | undefined {
  if (!overrides) return undefined;
  for (const [permission, enabled] of Object.entries(overrides)) {
    if (enabled && !hasPermission(actorRole, permission)) {
      throw new AppError("permission_override_exceeds_actor_access", 403);
    }
  }
  return overrides;
}

export async function updateOrganizationMember(
  pool: pg.Pool,
  context: TenantContext,
  actorRole: string,
  userId: string,
  input: z.infer<typeof memberPatchSchema>,
  requestId: string,
  ip: string,
) {
  requireTenantContext(context);
  const overrides = validatePermissionOverrides(actorRole, input.permissions_override);
  if (actorRole !== "Owner" && input.role === "Owner") {
    throw new AppError("only_owner_can_grant_owner", 403);
  }
  if (userId === context.userId && input.status && input.status !== "active") {
    throw new AppError("cannot_disable_current_membership", 409);
  }
  return withTransaction(pool, async (client) => {
    const before = await client.query<{
      user_id: string;
      organization_id: string;
      role: Role;
      status: string;
      permissions_override: Record<string, unknown>;
    }>(
      `SELECT user_id, organization_id, role, status, permissions_override
       FROM memberships
       WHERE user_id = $1 AND organization_id = $2 AND deleted_at IS NULL
       FOR UPDATE`,
      [userId, context.organizationId],
    );
    const membership = before.rows[0];
    if (!membership) throw new AppError("member_not_found", 404);
    if (actorRole !== "Owner" && membership.role === "Owner") {
      throw new AppError("admin_cannot_change_owner", 403);
    }
    const nextRole = input.role ?? membership.role;
    const nextStatus = input.status ?? membership.status;
    if (nextRole === "Owner" && actorRole !== "Owner") {
      throw new AppError("only_owner_can_grant_owner", 403);
    }
    if (membership.role === "Owner" && (nextRole !== "Owner" || nextStatus !== "active")) {
      const owners = await client.query<{ count: string }>(
        "SELECT COUNT(*)::text AS count FROM memberships WHERE organization_id = $1 AND role = 'Owner' AND status = 'active' AND deleted_at IS NULL",
        [context.organizationId],
      );
      if (Number(owners.rows[0]?.count ?? 0) <= 1) {
        throw new AppError("last_owner_cannot_be_removed", 409);
      }
    }
    const updated = await client.query(
      `UPDATE memberships
       SET role = $1,
           status = $2,
           permissions_override = $3::jsonb,
           deleted_at = CASE WHEN $2 = 'removed' THEN now() ELSE NULL END,
           updated_at = now()
       WHERE user_id = $4 AND organization_id = $5
       RETURNING user_id, organization_id, role, status, permissions_override, updated_at`,
      [nextRole, nextStatus, JSON.stringify(overrides ?? membership.permissions_override), userId, context.organizationId],
    );
    await client.query(
      `INSERT INTO audit_logs
         (organization_id, user_id, entity_type, entity_id, action, before, after, ip, source, request_id)
       VALUES ($1, $2, 'membership', $3, 'membership.updated', $4::jsonb, $5::jsonb, $6, 'api', $7)`,
      [
        context.organizationId,
        context.userId,
        userId,
        JSON.stringify(membership),
        JSON.stringify(updated.rows[0]),
        ip,
        requestId,
      ],
    );
    return updated.rows[0];
  });
}


export function scopedSearchKey(context: TenantContext, query: string): string {
  return tenantScopedKey(context.organizationId, "search", query);
}

export function scopedExportPayload(context: TenantContext, filters: Record<string, unknown>) {
  return tenantJobPayload(context, { kind: "tenant_export", filters });
}

export function assertExportTenant(context: TenantContext, requestedOrganizationId: string): void {
  assertTenantMatch(context, requestedOrganizationId);
}