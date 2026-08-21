import { z } from "zod";

export const tenantIdSchema = z.string().uuid();

export type TenantContext = {
  userId: string;
  organizationId: string;
  sessionId: string;
};

const tenantContextSchema = z.object({
  userId: tenantIdSchema,
  organizationId: tenantIdSchema,
  sessionId: tenantIdSchema,
});

export function requireTenantContext(context: TenantContext | undefined): TenantContext {
  if (!context || !tenantContextSchema.safeParse(context).success) {
    throw new Error("tenant_context_required");
  }
  return context;
}

export function tenantScopedKey(organizationId: string, namespace: string, key: string): string {
  if (!tenantIdSchema.safeParse(organizationId).success) throw new Error("invalid_tenant_id");
  if (!/^[a-z][a-z0-9:_-]{0,99}$/i.test(namespace) || !/^[a-zA-Z0-9:_-]{1,200}$/.test(key)) {
    throw new Error("invalid_scoped_key");
  }
  return `tenant:${organizationId}:${namespace}:${key}`;
}

export function tenantJobPayload<T extends Record<string, unknown>>(
  context: TenantContext,
  payload: Omit<T, "tenant_id">,
): Omit<T, "tenant_id"> & { tenant_id: string } {
  requireTenantContext(context);
  return { ...payload, tenant_id: context.organizationId };
}

export function assertTenantMatch(context: TenantContext, organizationId: string): void {
  requireTenantContext(context);
  if (!tenantIdSchema.safeParse(organizationId).success || context.organizationId !== organizationId) {
    throw new Error("tenant_access_denied");
  }
}