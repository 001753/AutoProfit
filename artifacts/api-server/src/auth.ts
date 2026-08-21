import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type pg from "pg";
import { z } from "zod";
import { parseDurationMs, type Config } from "./config.js";
import { withTransaction } from "./db.js";
import { AppError, forbidden, invalidCredentials, unauthorized } from "./errors.js";
import { hasPermission, type Permission, type Role } from "./permissions.js";
import type { TenantContext } from "./tenant.js";

const PASSWORD_MIN_LENGTH = 12;
const emailSchema = z.string().trim().toLowerCase().email().max(320);
const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .max(128)
  .refine((value) => /[a-z]/.test(value), "password must contain a lowercase letter")
  .refine((value) => /[A-Z]/.test(value), "password must contain an uppercase letter")
  .refine((value) => /\d/.test(value), "password must contain a number");

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: emailSchema,
  password: passwordSchema,
  organizationName: z.string().trim().min(2).max(160),
  businessType: z.string().trim().max(120).optional(),
  termsAccepted: z.literal(true),
  privacyAccepted: z.literal(true),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
  deviceName: z.string().trim().min(1).max(120).optional(),
  organizationId: z.string().uuid().optional(),
});

export const resetRequestSchema = z.object({ email: emailSchema });
export const resetConfirmSchema = z.object({
  token: z.string().min(40).max(200),
  password: passwordSchema,
});

export const consentSchema = z.object({
  action: z.enum(["grant", "withdraw"]),
});
export const policyTypeSchema = z.enum(["terms_of_service", "privacy_policy", "optional_processing"]);

type AuthResult = {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  organizationId: string;
  role: Role;
};

type UserRecord = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  status: string;
  failed_login_attempts: number;
  locked_until: Date | null;
};

type MembershipRecord = {
  id: string;
  organization_id: string;
  role: Role;
  permissions_override: Record<string, unknown>;
};

function hashOpaqueToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createOpaqueToken(): string {
  return randomBytes(48).toString("base64url");
}

function isUniqueViolation(error: unknown, constraint: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "constraint" in error &&
    error.code === "23505" &&
    error.constraint === constraint
  );
}

function refreshExpiresAt(config: Config): Date {
  return new Date(Date.now() + parseDurationMs(config.JWT_REFRESH_TTL));
}

function accessTokenClaims(user: UserRecord, membership: MembershipRecord, sessionId: string) {
  return {
    sub: user.id,
    email: user.email,
    name: user.name,
    org_id: membership.organization_id,
    role: membership.role,
    permissions_override: membership.permissions_override,
    session_id: sessionId,
    token_type: "access" as const,
  };
}

async function findUserByEmail(client: pg.Pool | pg.PoolClient, email: string): Promise<UserRecord | undefined> {
  const result = await client.query<UserRecord>(
    `SELECT id, email, name, password_hash, status, failed_login_attempts, locked_until
     FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1`,
    [email],
  );
  return result.rows[0];
}

async function findMembership(client: pg.Pool | pg.PoolClient, userId: string, organizationId?: string): Promise<MembershipRecord | undefined> {
  const result = await client.query<MembershipRecord>(
    `SELECT id, organization_id, role, permissions_override
     FROM memberships
     WHERE user_id = $1 AND status = 'active' AND deleted_at IS NULL
       AND ($2::uuid IS NULL OR organization_id = $2::uuid)
     ORDER BY created_at ASC LIMIT 1`,
    [userId, organizationId ?? null],
  );
  return result.rows[0];
}

async function createSession(
  client: pg.PoolClient,
  user: UserRecord,
  membership: MembershipRecord,
  request: Pick<FastifyRequest, "ip" | "headers">,
  deviceName: string,
  config: Config,
): Promise<{ sessionId: string; refreshToken: string }> {
  const refreshToken = createOpaqueToken();
  const result = await client.query<{ id: string }>(
    `INSERT INTO sessions (user_id, organization_id, refresh_token_hash, device_name, user_agent, ip, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      user.id,
      membership.organization_id,
      hashOpaqueToken(refreshToken),
      deviceName,
      request.headers["user-agent"] ?? null,
      request.ip,
      refreshExpiresAt(config),
    ],
  );
  const sessionId = result.rows[0]?.id;
  if (!sessionId) throw new Error("session_creation_failed");
  return { sessionId, refreshToken };
}

async function issueTokens(
  app: FastifyInstance,
  client: pg.PoolClient,
  user: UserRecord,
  membership: MembershipRecord,
  request: Pick<FastifyRequest, "ip" | "headers">,
  deviceName: string,
  config: Config,
): Promise<AuthResult> {
  const session = await createSession(client, user, membership, request, deviceName, config);
  const accessToken = app.jwt.sign(accessTokenClaims(user, membership, session.sessionId), { expiresIn: config.JWT_ACCESS_TTL });
  return {
    accessToken,
    refreshToken: session.refreshToken,
    sessionId: session.sessionId,
    organizationId: membership.organization_id,
    role: membership.role,
  };
}

export async function signup(
  app: FastifyInstance,
  request: Pick<FastifyRequest, "id" | "ip" | "headers">,
  input: z.infer<typeof signupSchema>,
  config: Config,
): Promise<AuthResult & { user: { id: string; email: string; name: string } }> {
  return withTransaction(app.db, async (client) => {
    const existing = await findUserByEmail(client, input.email);
    if (existing) throw new AppError("email_already_registered", 409);
    const passwordHash = await bcrypt.hash(input.password, 12);
    let userResult: pg.QueryResult<{ id: string }>;
    try {
      userResult = await client.query<{ id: string }>(
        "INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id",
        [input.email, input.name, passwordHash],
      );
    } catch (error) {
      if (isUniqueViolation(error, "users_email_key")) {
        throw new AppError("email_already_registered", 409);
      }
      throw error;
    }
    const userId = userResult.rows[0]?.id;
    if (!userId) throw new Error("user_creation_failed");
    const orgResult = await client.query<{ id: string }>(
      "INSERT INTO organizations (name, business_type, created_by) VALUES ($1, $2, $3) RETURNING id",
      [input.organizationName, input.businessType ?? null, userId],
    );
    const organizationId = orgResult.rows[0]?.id;
    if (!organizationId) throw new Error("organization_creation_failed");
    await client.query(
      "INSERT INTO memberships (user_id, organization_id, role) VALUES ($1, $2, 'Owner')",
      [userId, organizationId],
    );
    await client.query(
      `INSERT INTO consents (user_id, organization_id, policy_type, policy_version, source)
       VALUES ($1, $2, 'terms_of_service', $3, 'signup'), ($1, $2, 'privacy_policy', $4, 'signup')`,
      [userId, organizationId, config.TOS_VERSION, config.PRIVACY_VERSION],
    );
    await client.query(
      `INSERT INTO audit_logs
         (organization_id, user_id, entity_type, entity_id, action, after, ip, source, request_id)
       VALUES ($1, $2, 'user', $2, 'user.created', $3::jsonb, $4, 'api', $5)`,
      [organizationId, userId, JSON.stringify({ email: input.email, organization_id: organizationId }), request.ip, request.id],
    );
    const user: UserRecord = {
      id: userId,
      email: input.email,
      name: input.name,
      password_hash: passwordHash,
      status: "active",
      failed_login_attempts: 0,
      locked_until: null,
    };
    const membership: MembershipRecord = { id: "", organization_id: organizationId, role: "Owner", permissions_override: {} };
    const tokens = await issueTokens(app, client, user, membership, request, "signup", config);
    return { ...tokens, user: { id: userId, email: input.email, name: input.name } };
  });
}

export async function login(
  app: FastifyInstance,
  request: Pick<FastifyRequest, "id" | "ip" | "headers">,
  input: z.infer<typeof loginSchema>,
  config: Config,
): Promise<AuthResult> {
  const user = await findUserByEmail(app.db, input.email);
  if (!user || user.status !== "active") {
    throw invalidCredentials();
  }
  if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
    throw invalidCredentials();
  }
  if (!(await bcrypt.compare(input.password, user.password_hash))) {
    await app.db.query(
      `UPDATE users
       SET failed_login_attempts = failed_login_attempts + 1,
           locked_until = CASE
             WHEN failed_login_attempts + 1 >= $2
             THEN now() + ($3 * interval '1 minute')
             ELSE locked_until
           END,
           updated_at = now()
       WHERE id = $1`,
      [user.id, config.AUTH_MAX_FAILED_ATTEMPTS, config.AUTH_LOCKOUT_MINUTES],
    );
    throw invalidCredentials();
  }

  return withTransaction(app.db, async (client) => {
    const membership = await findMembership(client, user.id, input.organizationId);
    if (!membership) throw invalidCredentials();
    await client.query(
      "UPDATE users SET last_login_at = now(), failed_login_attempts = 0, locked_until = NULL, updated_at = now() WHERE id = $1",
      [user.id],
    );
    const tokens = await issueTokens(app, client, user, membership, request, input.deviceName ?? "web", config);
    await client.query(
      `INSERT INTO audit_logs
         (organization_id, user_id, entity_type, entity_id, action, after, ip, source, request_id)
       VALUES ($1, $2, 'session', $3, 'auth.login', $4::jsonb, $5, 'api', $6)`,
      [membership.organization_id, user.id, tokens.sessionId, JSON.stringify({ device_name: input.deviceName ?? "web" }), request.ip, request.id],
    );
    return tokens;
  });
}

export async function rotateRefreshToken(
  app: FastifyInstance,
  request: Pick<FastifyRequest, "id" | "ip" | "headers">,
  refreshToken: string,
  config: Config,
): Promise<AuthResult> {
  const tokenHash = hashOpaqueToken(refreshToken);
  return withTransaction(app.db, async (client) => {
    const result = await client.query<{
      session_id: string;
      user_id: string;
      organization_id: string;
      device_name: string;
      expires_at: Date;
      revoked_at: Date | null;
    }>(
      `SELECT id AS session_id, user_id, organization_id, device_name, expires_at, revoked_at
       FROM sessions WHERE refresh_token_hash = $1 FOR UPDATE`,
      [tokenHash],
    );
    const session = result.rows[0];
    if (!session) throw unauthorized();
    if (session.revoked_at || new Date(session.expires_at).getTime() <= Date.now()) {
      await client.query("UPDATE sessions SET revoked_at = COALESCE(revoked_at, now()) WHERE user_id = $1 AND revoked_at IS NULL", [session.user_id]);
      throw new AppError("refresh_token_reuse_detected", 401);
    }
    const userResult = await client.query<UserRecord>(
      `SELECT id, email, name, password_hash, status, failed_login_attempts, locked_until
       FROM users WHERE id = $1 AND status = 'active' AND deleted_at IS NULL`,
      [session.user_id],
    );
    const user = userResult.rows[0];
    const membership = user ? await findMembership(client, user.id, session.organization_id) : undefined;
    if (!user || !membership) throw unauthorized();
    await client.query("UPDATE sessions SET revoked_at = now(), last_used_at = now() WHERE id = $1", [session.session_id]);
    const tokens = await issueTokens(app, client, user, membership, request, session.device_name, config);
    await client.query(
      `INSERT INTO audit_logs
         (organization_id, user_id, entity_type, entity_id, action, after, ip, source, request_id)
       VALUES ($1, $2, 'session', $3, 'auth.refresh_rotated', $4::jsonb, $5, 'api', $6)`,
      [membership.organization_id, user.id, tokens.sessionId, JSON.stringify({ replaced_session_id: session.session_id }), request.ip, request.id],
    );
    return tokens;
  });
}

export async function requestPasswordReset(
  app: FastifyInstance,
  email: string,
  config: Config,
  deliver: (email: string, token: string) => Promise<void> = async () => undefined,
): Promise<void> {
  const user = await findUserByEmail(app.db, email);
  if (!user || user.status !== "active") return;
  const token = createOpaqueToken();
  await app.db.query(
    "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, now() + ($3 * interval '1 minute'))",
    [user.id, hashOpaqueToken(token), config.PASSWORD_RESET_TTL_MINUTES],
  );
  await deliver(email, token);
}

export function hashResetTokenForTest(token: string): string {
  return hashOpaqueToken(token);
}

export async function confirmPasswordReset(
  app: FastifyInstance,
  token: string,
  password: string,
  request: Pick<FastifyRequest, "id" | "ip">,
): Promise<void> {
  const passwordHash = await bcrypt.hash(password, 12);
  await withTransaction(app.db, async (client) => {
    const result = await client.query<{ id: string; user_id: string }>(
      `SELECT prt.id, prt.user_id
       FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token_hash = $1
         AND prt.used_at IS NULL
         AND prt.expires_at > now()
         AND u.status = 'active'
         AND u.deleted_at IS NULL
       FOR UPDATE OF prt`,
      [hashOpaqueToken(token)],
    );
    const reset = result.rows[0];
    if (!reset) throw new AppError("reset_token_invalid_or_expired", 400);
    await client.query("UPDATE password_reset_tokens SET used_at = now() WHERE id = $1", [reset.id]);
    await client.query(
      "UPDATE users SET password_hash = $1, failed_login_attempts = 0, locked_until = NULL, updated_at = now() WHERE id = $2",
      [passwordHash, reset.user_id],
    );
    await client.query("UPDATE sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [reset.user_id]);
    await client.query(
      `INSERT INTO audit_logs
         (user_id, entity_type, entity_id, action, after, source, request_id, ip)
       VALUES ($1, 'user', $1, 'auth.password_reset', $2::jsonb, 'api', $3, $4)`,
      [reset.user_id, JSON.stringify({ sessions_invalidated: true }), request.id, request.ip],
    );
  });
}

export const passwordChangeSchema = z.object({
  current_password: z.string().min(1).max(128),
  new_password: passwordSchema,
});

export async function changePassword(
  app: FastifyInstance,
  request: Pick<FastifyRequest, "id" | "ip">,
  context: TenantContext,
  input: z.infer<typeof passwordChangeSchema>,
): Promise<void> {
  await withTransaction(app.db, async (client) => {
    const result = await client.query<UserRecord>(
      `SELECT id, email, name, password_hash, status, failed_login_attempts, locked_until
       FROM users WHERE id = $1 AND status = 'active' AND deleted_at IS NULL FOR UPDATE`,
      [context.userId],
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(input.current_password, user.password_hash))) {
      throw invalidCredentials();
    }
    const passwordHash = await bcrypt.hash(input.new_password, 12);
    const sessions = await client.query<{ id: string }>(
      "UPDATE sessions SET revoked_at = COALESCE(revoked_at, now()) WHERE user_id = $1 AND revoked_at IS NULL RETURNING id",
      [context.userId],
    );
    await client.query(
      "UPDATE users SET password_hash = $1, failed_login_attempts = 0, locked_until = NULL, updated_at = now() WHERE id = $2",
      [passwordHash, context.userId],
    );
    await client.query(
      `INSERT INTO audit_logs
         (organization_id, user_id, entity_type, entity_id, action, before, after, ip, source, request_id)
       VALUES ($1, $2, 'user', $2, 'auth.password_changed', $3::jsonb, $4::jsonb, $5, 'api', $6)`,
      [
        context.organizationId,
        context.userId,
        JSON.stringify({ active_sessions: sessions.rowCount }),
        JSON.stringify({ sessions_invalidated: true }),
        request.ip,
        request.id,
      ],
    );
  });
}

export async function verifyAccess(request: FastifyRequest): Promise<TenantContext> {
  try {
    await request.jwtVerify();
  } catch {
    throw unauthorized();
  }
  const claims = request.user;
  if (claims.token_type !== "access" || !claims.sub || !claims.org_id || !claims.session_id) throw unauthorized();
  const session = await request.server.db.query<{
    id: string;
    role: Role;
    permissions_override: Record<string, unknown>;
  }>(
    `SELECT s.id, m.role, m.permissions_override
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     JOIN memberships m ON m.user_id = s.user_id AND m.organization_id = s.organization_id
     JOIN organizations o ON o.id = s.organization_id
     WHERE s.id = $1
       AND s.user_id = $2
       AND s.organization_id = $3
       AND s.revoked_at IS NULL
       AND s.expires_at > now()
       AND u.status = 'active' AND u.deleted_at IS NULL
       AND m.status = 'active' AND m.deleted_at IS NULL
       AND o.status = 'active' AND o.deleted_at IS NULL`,
    [claims.session_id, claims.sub, claims.org_id],
  );
  const activeSession = session.rows[0];
  if (!activeSession) throw unauthorized();
  request.user.role = activeSession.role;
  request.user.permissions_override = activeSession.permissions_override;
  return { userId: claims.sub, organizationId: claims.org_id, sessionId: claims.session_id };
}

export function requirePermission(request: FastifyRequest, permission: Permission): void {
  const claims = request.user;
  if (!hasPermission(claims.role, permission, claims.permissions_override)) throw forbidden();
}

export function refreshCookieOptions(config: Config) {
  return {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/v1/auth",
    maxAge: Math.floor(parseDurationMs(config.JWT_REFRESH_TTL) / 1_000),
  };
}

export async function requireCurrentMandatoryConsent(
  app: FastifyInstance,
  context: TenantContext,
  config: Config,
): Promise<void> {
  const result = await app.db.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM consents
     WHERE user_id = $1 AND organization_id = $2 AND withdrawn_at IS NULL
       AND (
         (policy_type = 'terms_of_service' AND policy_version = $3)
         OR (policy_type = 'privacy_policy' AND policy_version = $4)
       )`,
    [context.userId, context.organizationId, config.TOS_VERSION, config.PRIVACY_VERSION],
  );
  if (Number(result.rows[0]?.count ?? 0) < 2) {
    throw new AppError("consent_required", 403);
  }
}