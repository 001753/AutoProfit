import type pg from "pg";
import type { TenantContext } from "./tenant.js";

declare module "fastify" {
  interface FastifyInstance {
    db: pg.Pool;
  }

  interface FastifyRequest {
    tenantContext?: TenantContext;
    user: {
      sub: string;
      email: string;
      name: string;
      org_id: string;
      role: string;
      permissions_override: Record<string, unknown>;
      session_id: string;
      token_type: "access";
    };
  }
}