import { createHash } from "node:crypto";
import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { z, ZodError } from "zod";
import { allowedCorsOrigins, loadConfig, type Config } from "./config.js";
import { createPool, checkDatabase, withTransaction } from "./db.js";
import { AppError } from "./errors.js";
import {
  confirmPasswordReset,
  changePassword,
  consentSchema,
  login,
  loginSchema,
  policyTypeSchema,
  refreshCookieOptions,
  requireCurrentMandatoryConsent,
  passwordChangeSchema,
  requestPasswordReset,
  resetConfirmSchema,
  resetRequestSchema,
  rotateRefreshToken,
  signup,
  signupSchema,
  verifyAccess,
  requirePermission,
} from "./auth.js";
import { logEvent } from "./logger.js";
import {
  listOrganizationMembers,
  listUserOrganizations,
  memberPatchSchema,
  organizationPatchSchema,
  updateOrganizationMember,
} from "./tenant-repository.js";
import {
  archiveProduct,
  archiveReference,
  archiveVariant,
  createProduct,
  createReference,
  createVariant,
  getProduct,
  listProducts,
  listReferences,
  listVariants,
  productCreateSchema,
  productPatchSchema,
  referenceCreateSchema,
  referencePatchSchema,
  updateProduct,
  updateReference,
  updateVariant,
  variantCreateSchema,
  variantPatchSchema,
} from "./catalog.js";
import {
  archiveListing,
  bulkPreviewSchema,
  catalogSearchQuerySchema,
  channelCreateSchema,
  channelListingCreateSchema,
  channelListingPatchSchema,
  createChannel,
  createListing,
  createSavedQuery,
  deleteSavedQuery,
  listChannels,
  listSavedQueries,
  listVariantListings,
  previewBulk,
  searchCatalog,
  savedQueryCreateSchema,
  updateListing,
} from "./catalog-extensions.js";
import { registerDesignSystemRoutes } from "./ui.js";

export function buildApp(configOverrides: Partial<Config> = {}) {
  const config = { ...loadConfig(), ...configOverrides };
  const basePath = process.env.BASE_PATH?.replace(/\/$/, "") || "/api";
  const app = Fastify({
    logger: { level: config.LOG_LEVEL, redact: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.token"] },
    requestIdHeader: "x-request-id",
    genReqId: () => `req_${crypto.randomUUID()}`,
  });
  const pool = createPool(config);
  app.decorate("db", pool);

  const corsOrigins = allowedCorsOrigins(config);
  app.register(cors, { origin: corsOrigins.length > 0 ? corsOrigins : false, credentials: corsOrigins.length > 0 });
  app.register(cookie);
  app.register(jwt, { secret: config.SESSION_SECRET });
  app.register(rateLimit, {
    global: true,
    max: config.RATE_LIMIT_DEFAULT,
    timeWindow: "1 minute",
    keyGenerator: (request) => {
      const authorization = request.headers.authorization;
      if (authorization?.startsWith("Bearer ")) {
        return `token:${createHash("sha256").update(authorization.slice(7)).digest("hex")}`;
      }
      return `ip:${request.ip}`;
    },
  });

  app.addHook("onRequest", async (request) => {
    request.tenantContext = undefined;
  });

  registerDesignSystemRoutes(app, basePath);

  app.get("/favicon.ico", async (_request, reply) => {
    return reply.status(204).send();
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: { code: "validation_error", message: "Request validation failed", details: error.issues },
        meta: { request_id: request.id },
      });
    }
    if (error instanceof AppError) {
      const details = "field" in error && typeof error.field === "string" ? { field: error.field } : undefined;
      return reply.status(error.statusCode).send({ error: { code: error.code, message: error.message, ...(details ?? {}) }, meta: { request_id: request.id } });
    }
    if (typeof error === "object" && error !== null && "statusCode" in error && error.statusCode === 429) {
      reply.header("retry-after", "60");
      return reply.status(429).send({
        error: { code: "rate_limit_exceeded", message: "Too many requests" },
        meta: { request_id: request.id },
      });
    }
    request.log.error({ err: error, request_id: request.id }, "unhandled_error");
    return reply.status(500).send({ error: { code: "internal_error", message: "Internal server error" }, meta: { request_id: request.id } });
  });

  app.get(`${basePath}/health`, async (_request, reply) => {
    const database = await checkDatabase(pool);
    const status = database.ok ? "ok" : "degraded";
    return reply.status(database.ok ? 200 : 503).send({ status, service: "autoprofit-api", database });
  });

  app.get(`${basePath}/v1/health`, async (_request, reply) => reply.redirect(`${basePath}/health`));

  app.register(async (auth) => {
    const authRateLimit = { rateLimit: { max: config.RATE_LIMIT_AUTH, timeWindow: "1 minute" } };

    auth.post("/v1/auth/signup", { config: authRateLimit }, async (request, reply) => {
      const input = signupSchema.parse(request.body);
      const result = await signup(app, request, input, config);
      reply.setCookie("refresh_token", result.refreshToken, refreshCookieOptions(config));
      logEvent(request.log, "info", "auth.signup", { requestId: request.id, organizationId: result.organizationId, userId: result.user.id });
      return reply.status(201).send({
        data: { user: result.user, organization_id: result.organizationId, access_token: result.accessToken, session_id: result.sessionId },
        meta: { request_id: request.id },
      });
    });

    auth.post("/v1/auth/login", { config: authRateLimit }, async (request, reply) => {
      const input = loginSchema.parse(request.body);
      const result = await login(app, request, input, config);
      reply.setCookie("refresh_token", result.refreshToken, refreshCookieOptions(config));
      logEvent(request.log, "info", "auth.login", { requestId: request.id, organizationId: result.organizationId });
      return reply.send({ data: { access_token: result.accessToken, organization_id: result.organizationId, role: result.role, session_id: result.sessionId }, meta: { request_id: request.id } });
    });

    auth.post("/v1/auth/refresh", { config: authRateLimit }, async (request, reply) => {
      const body = z.object({ refresh_token: z.string().optional() }).parse(request.body ?? {});
      const token = body.refresh_token ?? request.cookies.refresh_token;
      if (!token) throw new AppError("refresh_token_required", 401);
      if (!body.refresh_token && request.headers.origin && !corsOrigins.includes(request.headers.origin)) {
        throw new AppError("csrf_origin_invalid", 403);
      }
      const result = await rotateRefreshToken(app, request, token, config);
      reply.setCookie("refresh_token", result.refreshToken, refreshCookieOptions(config));
      return reply.send({ data: { access_token: result.accessToken, organization_id: result.organizationId, role: result.role, session_id: result.sessionId }, meta: { request_id: request.id } });
    });

    auth.post("/v1/auth/logout", { config: authRateLimit }, async (request, reply) => {
      const context = await verifyAccess(request);
      await withTransaction(pool, async (client) => {
        const before = await client.query<{ revoked_at: Date | null }>(
          "SELECT revoked_at FROM sessions WHERE id = $1 AND user_id = $2 AND organization_id = $3 FOR UPDATE",
          [context.sessionId, context.userId, context.organizationId],
        );
        if (!before.rowCount) throw new AppError("session_not_found", 404);
        await client.query("UPDATE sessions SET revoked_at = now() WHERE id = $1", [context.sessionId]);
        await client.query(
          `INSERT INTO audit_logs
             (organization_id, user_id, entity_type, entity_id, action, before, after, source, request_id, ip)
           VALUES ($1, $2, 'session', $3, 'auth.logout', $4::jsonb, $5::jsonb, 'api', $6, $7)`,
          [
            context.organizationId,
            context.userId,
            context.sessionId,
            JSON.stringify({ revoked_at: before.rows[0]?.revoked_at }),
            JSON.stringify({ logged_out: true }),
            request.id,
            request.ip,
          ],
        );
      });
      reply.clearCookie("refresh_token", refreshCookieOptions(config));
      return reply.send({ data: { logged_out: true }, meta: { request_id: request.id } });
    });

    auth.post("/v1/auth/password-reset/request", { config: authRateLimit }, async (request, reply) => {
      const input = resetRequestSchema.parse(request.body);
      await requestPasswordReset(app, input.email, config);
      return reply.send({ data: { accepted: true }, meta: { request_id: request.id } });
    });

    auth.post("/v1/auth/password-reset/confirm", { config: authRateLimit }, async (request, reply) => {
      const input = resetConfirmSchema.parse(request.body);
      await confirmPasswordReset(app, input.token, input.password, request);
      return reply.send({ data: { reset: true }, meta: { request_id: request.id } });
    });
  }, { prefix: basePath });

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("onRequest", async (request) => {
      request.tenantContext = await verifyAccess(request);
      const pathname = request.url.split("?")[0] ?? "";
      if (pathname !== "/v1/me" && !pathname.startsWith("/v1/consents")) {
        await requireCurrentMandatoryConsent(app, request.tenantContext, config);
      }
    });

    protectedRoutes.get("/v1/me", async (request, reply) => {
      const context = request.tenantContext!;
      const result = await pool.query(
        `SELECT u.id, u.email, u.name, m.organization_id, m.role, o.name AS organization_name,
                EXISTS (
                  SELECT 1 FROM consents c
                  WHERE c.user_id = u.id AND c.organization_id = m.organization_id
                    AND c.policy_type = 'terms_of_service' AND c.policy_version = $3 AND c.withdrawn_at IS NULL
                ) AS terms_current,
                EXISTS (
                  SELECT 1 FROM consents c
                  WHERE c.user_id = u.id AND c.organization_id = m.organization_id
                    AND c.policy_type = 'privacy_policy' AND c.policy_version = $4 AND c.withdrawn_at IS NULL
                ) AS privacy_current
         FROM users u JOIN memberships m ON m.user_id = u.id JOIN organizations o ON o.id = m.organization_id
         WHERE u.id = $1 AND u.status = 'active' AND u.deleted_at IS NULL
           AND m.organization_id = $2 AND m.status = 'active' AND m.deleted_at IS NULL
           AND o.status = 'active' AND o.deleted_at IS NULL`,
        [context.userId, context.organizationId, config.TOS_VERSION, config.PRIVACY_VERSION],
      );
      return reply.send({ data: result.rows[0], meta: { request_id: request.id } });
    });

    protectedRoutes.get("/v1/organizations/members", async (request, reply) => {
      requirePermission(request, "members:read");
      const members = await listOrganizationMembers(pool, request.tenantContext!);
      return reply.send({ data: members, meta: { request_id: request.id } });
    });

    protectedRoutes.get("/v1/organizations", async (request, reply) => {
      requirePermission(request, "organization:read");
      const organizations = await listUserOrganizations(pool, request.tenantContext!);
      return reply.send({ data: organizations, meta: { request_id: request.id } });
    });

    protectedRoutes.patch("/v1/organizations/current", async (request, reply) => {
      requirePermission(request, "organization:manage");
      const input = organizationPatchSchema.parse(request.body);
      const context = request.tenantContext!;
      const data = await withTransaction(pool, async (client) => {
        const before = await client.query(
          `SELECT id, name, business_type, default_currency, timezone, coa_template, status
           FROM organizations WHERE id = $1 AND status = 'active' AND deleted_at IS NULL FOR UPDATE`,
          [context.organizationId],
        );
        const organization = before.rows[0];
        if (!organization) throw new AppError("organization_not_found", 404);
        const updated = await client.query(
          `UPDATE organizations
           SET name = $1, business_type = $2, default_currency = $3,
               timezone = $4, coa_template = $5, updated_at = now()
           WHERE id = $6
           RETURNING id, name, business_type, default_currency, timezone, coa_template, status, updated_at`,
          [
            input.name ?? organization.name,
            input.business_type === undefined ? organization.business_type : input.business_type,
            input.default_currency ?? organization.default_currency,
            input.timezone ?? organization.timezone,
            input.coa_template ?? organization.coa_template,
            context.organizationId,
          ],
        );
        await client.query(
          `INSERT INTO audit_logs
             (organization_id, user_id, entity_type, entity_id, action, before, after, ip, source, request_id)
           VALUES ($1, $2, 'organization', $1, 'organization.updated', $3::jsonb, $4::jsonb, $5, 'api', $6)`,
          [context.organizationId, context.userId, JSON.stringify(organization), JSON.stringify(updated.rows[0]), request.ip, request.id],
        );
        return updated.rows[0];
      });
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.patch("/v1/organizations/members/:userId", async (request, reply) => {
      requirePermission(request, "members:manage");
      const params = z.object({ userId: z.string().uuid() }).parse(request.params);
      const input = memberPatchSchema.parse(request.body);
      const data = await updateOrganizationMember(
        pool,
        request.tenantContext!,
        request.user.role,
        params.userId,
        input,
        request.id,
        request.ip,
      );
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.get("/v1/sessions", async (request, reply) => {
      requirePermission(request, "sessions:read");
      const context = request.tenantContext!;
      const result = await pool.query(
        `SELECT id, device_name, user_agent, ip, expires_at, last_used_at, created_at, revoked_at,
                (id = $1) AS current
         FROM sessions WHERE user_id = $2 AND organization_id = $3 ORDER BY created_at DESC`,
        [context.sessionId, context.userId, context.organizationId],
      );
      return reply.send({ data: result.rows, meta: { request_id: request.id } });
    });

    protectedRoutes.post("/v1/sessions/:sessionId/revoke", async (request, reply) => {
      requirePermission(request, "sessions:revoke");
      const params = z.object({ sessionId: z.string().uuid() }).parse(request.params);
      const context = request.tenantContext!;
      await withTransaction(pool, async (client) => {
        const before = await client.query<{ id: string; revoked_at: Date | null }>(
          "SELECT id, revoked_at FROM sessions WHERE id = $1 AND user_id = $2 AND organization_id = $3 FOR UPDATE",
          [params.sessionId, context.userId, context.organizationId],
        );
        if (!before.rowCount) throw new AppError("session_not_found", 404);
        await client.query("UPDATE sessions SET revoked_at = COALESCE(revoked_at, now()) WHERE id = $1", [params.sessionId]);
        await client.query(
          `INSERT INTO audit_logs
             (organization_id, user_id, entity_type, entity_id, action, before, after, request_id, ip, source)
           VALUES ($1, $2, 'session', $3, 'session.revoked', $4::jsonb, $5::jsonb, $6, $7, 'api')`,
          [
            context.organizationId,
            context.userId,
            params.sessionId,
            JSON.stringify({ revoked_at: before.rows[0]?.revoked_at }),
            JSON.stringify({ revoked: true }),
            request.id,
            request.ip,
          ],
        );
      });
      return reply.send({ data: { revoked: true }, meta: { request_id: request.id } });
    });

    protectedRoutes.post("/v1/auth/password/change", async (request, reply) => {
      const input = passwordChangeSchema.parse(request.body);
      await changePassword(app, request, request.tenantContext!, input);
      reply.clearCookie("refresh_token", refreshCookieOptions(config));
      return reply.send({ data: { changed: true, sessions_invalidated: true }, meta: { request_id: request.id } });
    });

    protectedRoutes.get("/v1/consents", async (request, reply) => {
      requirePermission(request, "consent:read");
      const context = request.tenantContext!;
      const result = await pool.query(
        "SELECT policy_type, policy_version, consented_at, withdrawn_at, source FROM consents WHERE user_id = $1 AND organization_id = $2 ORDER BY consented_at DESC",
        [context.userId, context.organizationId],
      );
      return reply.send({ data: result.rows, meta: { request_id: request.id } });
    });

    protectedRoutes.post("/v1/consents/:policyType", async (request, reply) => {
      requirePermission(request, "consent:manage");
      const params = z.object({ policyType: policyTypeSchema }).parse(request.params);
      const input = consentSchema.parse(request.body);
      const context = request.tenantContext!;
      let version = params.policyType === "terms_of_service" ? config.TOS_VERSION : config.PRIVACY_VERSION;
      if (params.policyType === "optional_processing") {
        version = config.OPTIONAL_PROCESSING_VERSION;
      }
      await withTransaction(pool, async (client) => {
        const before = await client.query(
          `SELECT policy_type, policy_version, consented_at, withdrawn_at
           FROM consents
           WHERE user_id = $1 AND organization_id = $2 AND policy_type = $3
           ORDER BY consented_at DESC LIMIT 1 FOR UPDATE`,
          [context.userId, context.organizationId, params.policyType],
        );
        if (input.action === "grant") {
          await client.query(
            `INSERT INTO consents (user_id, organization_id, policy_type, policy_version, source)
             VALUES ($1, $2, $3, $4, 'web') ON CONFLICT (user_id, organization_id, policy_type, policy_version)
             DO UPDATE SET withdrawn_at = NULL, consented_at = now()`,
            [context.userId, context.organizationId, params.policyType, version],
          );
        } else {
          if (params.policyType !== "optional_processing") throw new AppError("mandatory_consent_cannot_be_withdrawn", 409);
          await client.query(
            `UPDATE consents SET withdrawn_at = now()
             WHERE user_id = $1 AND organization_id = $2 AND policy_type = $3 AND withdrawn_at IS NULL`,
            [context.userId, context.organizationId, params.policyType],
          );
        }
        await client.query(
          `INSERT INTO audit_logs
             (organization_id, user_id, entity_type, action, before, after, request_id, ip, source)
           VALUES ($1, $2, 'consent', $3, $4::jsonb, $5::jsonb, $6, $7, 'api')`,
          [
            context.organizationId,
            context.userId,
            "consent." + input.action,
            JSON.stringify(before.rows[0] ?? null),
            JSON.stringify({ policy_type: params.policyType, policy_version: version, action: input.action }),
            request.id,
            request.ip,
          ],
        );
      });
      return reply.send({ data: { policy_type: params.policyType, policy_version: version, action: input.action }, meta: { request_id: request.id } });
    });

    protectedRoutes.get("/v1/catalog/references/:type", async (request, reply) => {
      requirePermission(request, "catalog:read");
      const params = z.object({ type: z.enum(["categories", "brands", "tax-classes"]) }).parse(request.params);
      const query = z.object({ include_archived: z.coerce.boolean().default(false) }).parse(request.query);
      const data = await listReferences(pool, request.tenantContext!, params.type, query.include_archived);
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.post("/v1/catalog/references/:type", async (request, reply) => {
      requirePermission(request, "catalog:manage");
      const params = z.object({ type: z.enum(["categories", "brands", "tax-classes"]) }).parse(request.params);
      const input = referenceCreateSchema.parse(request.body);
      const data = await createReference(pool, request.tenantContext!, params.type, input, request.id, request.ip);
      return reply.status(201).send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.patch("/v1/catalog/references/:type/:id", async (request, reply) => {
      requirePermission(request, "catalog:manage");
      const params = z.object({ type: z.enum(["categories", "brands", "tax-classes"]), id: z.string().uuid() }).parse(request.params);
      const input = referencePatchSchema.parse(request.body);
      const data = await updateReference(pool, request.tenantContext!, params.type, params.id, input, request.id, request.ip);
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.post("/v1/catalog/references/:type/:id/archive", async (request, reply) => {
      requirePermission(request, "catalog:manage");
      const params = z.object({ type: z.enum(["categories", "brands", "tax-classes"]), id: z.string().uuid() }).parse(request.params);
      const data = await archiveReference(pool, request.tenantContext!, params.type, params.id, request.id, request.ip);
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.get("/v1/products", async (request, reply) => {
      requirePermission(request, "catalog:read");
      const query = z.object({
        limit: z.coerce.number().int().min(1).max(100).default(50),
        cursor: z.string().max(500).optional(),
        include_archived: z.coerce.boolean().default(false),
      }).parse(request.query);
      const result = await listProducts(pool, request.tenantContext!, {
        limit: query.limit,
        cursor: query.cursor,
        includeArchived: query.include_archived,
      });
      return reply.send({ data: result.rows, meta: { request_id: request.id, next_cursor: result.nextCursor } });
    });

    protectedRoutes.post("/v1/products", async (request, reply) => {
      requirePermission(request, "catalog:manage");
      const input = productCreateSchema.parse(request.body);
      const data = await createProduct(pool, request.tenantContext!, input, request.id, request.ip);
      return reply.status(201).send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.get("/v1/products/:productId", async (request, reply) => {
      requirePermission(request, "catalog:read");
      const params = z.object({ productId: z.string().uuid() }).parse(request.params);
      const data = await getProduct(pool, request.tenantContext!, params.productId);
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.patch("/v1/products/:productId", async (request, reply) => {
      requirePermission(request, "catalog:manage");
      const params = z.object({ productId: z.string().uuid() }).parse(request.params);
      const input = productPatchSchema.parse(request.body);
      const data = await updateProduct(pool, request.tenantContext!, params.productId, input, request.id, request.ip);
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.post("/v1/products/:productId/archive", async (request, reply) => {
      requirePermission(request, "catalog:manage");
      const params = z.object({ productId: z.string().uuid() }).parse(request.params);
      const data = await archiveProduct(pool, request.tenantContext!, params.productId, request.id, request.ip);
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.get("/v1/products/:productId/variants", async (request, reply) => {
      requirePermission(request, "catalog:read");
      const params = z.object({ productId: z.string().uuid() }).parse(request.params);
      const query = z.object({ include_archived: z.coerce.boolean().default(false) }).parse(request.query);
      const data = await listVariants(pool, request.tenantContext!, params.productId, query.include_archived);
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.post("/v1/products/:productId/variants", async (request, reply) => {
      requirePermission(request, "catalog:manage");
      const params = z.object({ productId: z.string().uuid() }).parse(request.params);
      const input = variantCreateSchema.parse({ ...(request.body as object), product_id: params.productId });
      const data = await createVariant(pool, request.tenantContext!, params.productId, input, request.id, request.ip);
      return reply.status(201).send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.patch("/v1/variants/:variantId", async (request, reply) => {
      requirePermission(request, "catalog:manage");
      const params = z.object({ variantId: z.string().uuid() }).parse(request.params);
      const input = variantPatchSchema.parse(request.body);
      const data = await updateVariant(pool, request.tenantContext!, params.variantId, input, request.id, request.ip);
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.post("/v1/variants/:variantId/archive", async (request, reply) => {
      requirePermission(request, "catalog:manage");
      const params = z.object({ variantId: z.string().uuid() }).parse(request.params);
      const data = await archiveVariant(pool, request.tenantContext!, params.variantId, request.id, request.ip);
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.get("/v1/channels", async (request, reply) => {
      requirePermission(request, "catalog:read");
      const query = z.object({ include_archived: z.coerce.boolean().default(false) }).parse(request.query);
      const data = await listChannels(pool, request.tenantContext!, query.include_archived);
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.post("/v1/channels", async (request, reply) => {
      requirePermission(request, "catalog:manage");
      const input = channelCreateSchema.parse(request.body);
      const data = await createChannel(pool, request.tenantContext!, input, request.id, request.ip);
      return reply.status(201).send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.get("/v1/variants/:variantId/listings", async (request, reply) => {
      requirePermission(request, "catalog:read");
      const params = z.object({ variantId: z.string().uuid() }).parse(request.params);
      const query = z.object({ include_archived: z.coerce.boolean().default(false) }).parse(request.query);
      const data = await listVariantListings(pool, request.tenantContext!, params.variantId, query.include_archived);
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.post("/v1/variants/:variantId/listings", async (request, reply) => {
      requirePermission(request, "catalog:manage");
      const params = z.object({ variantId: z.string().uuid() }).parse(request.params);
      const input = channelListingCreateSchema.parse(request.body);
      const data = await createListing(pool, request.tenantContext!, params.variantId, input, request.id, request.ip);
      return reply.status(201).send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.patch("/v1/listings/:listingId", async (request, reply) => {
      requirePermission(request, "catalog:manage");
      const params = z.object({ listingId: z.string().uuid() }).parse(request.params);
      const input = channelListingPatchSchema.parse(request.body);
      const data = await updateListing(pool, request.tenantContext!, params.listingId, input, request.id, request.ip);
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.post("/v1/listings/:listingId/archive", async (request, reply) => {
      requirePermission(request, "catalog:manage");
      const params = z.object({ listingId: z.string().uuid() }).parse(request.params);
      const data = await archiveListing(pool, request.tenantContext!, params.listingId, request.id, request.ip);
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.get("/v1/catalog/search", async (request, reply) => {
      requirePermission(request, "catalog:read");
      const query = catalogSearchQuerySchema.parse(request.query);
      const result = await searchCatalog(pool, request.tenantContext!, query);
      return reply.send({ data: result.rows, meta: { request_id: request.id, next_cursor: result.nextCursor } });
    });

    protectedRoutes.get("/v1/catalog/saved-queries", async (request, reply) => {
      requirePermission(request, "catalog:read");
      const data = await listSavedQueries(pool, request.tenantContext!);
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.post("/v1/catalog/saved-queries", async (request, reply) => {
      requirePermission(request, "catalog:manage");
      const input = savedQueryCreateSchema.parse(request.body);
      const data = await createSavedQuery(pool, request.tenantContext!, input, request.id, request.ip);
      return reply.status(201).send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.delete("/v1/catalog/saved-queries/:queryId", async (request, reply) => {
      requirePermission(request, "catalog:manage");
      const params = z.object({ queryId: z.string().uuid() }).parse(request.params);
      const data = await deleteSavedQuery(pool, request.tenantContext!, params.queryId, request.id, request.ip);
      return reply.send({ data, meta: { request_id: request.id } });
    });

    protectedRoutes.post("/v1/catalog/bulk/preview", async (request, reply) => {
      requirePermission(request, "catalog:manage");
      const idempotencyKey = request.headers["idempotency-key"];
      if (typeof idempotencyKey !== "string" || idempotencyKey.trim().length === 0) {
        throw new AppError("idempotency_key_required", 400, "Header Idempotency-Key wajib diisi");
      }
      const input = bulkPreviewSchema.parse(request.body);
      const data = await previewBulk(pool, request.tenantContext!, input, idempotencyKey);
      return reply.send({ data, meta: { request_id: request.id } });
    });
  }, { prefix: basePath });

  app.addHook("onClose", async () => pool.end());
  return app;
}

const app = buildApp();
const config = loadConfig();
if (process.env.NODE_ENV !== "test") {
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  app.log.info({ event: "server_started", port: config.PORT }, "server_started");
}

export default app;