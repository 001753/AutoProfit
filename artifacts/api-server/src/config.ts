import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(100).default(6),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must contain at least 32 characters"),
  JWT_ACCESS_TTL: z.string().regex(/^\d+[smhd]$/, "TTL must use a number followed by s, m, h, or d").default("15m"),
  JWT_REFRESH_TTL: z.string().regex(/^\d+[smhd]$/, "TTL must use a number followed by s, m, h, or d").default("30d"),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().min(5).max(1440).default(30),
  RATE_LIMIT_DEFAULT: z.coerce.number().int().positive().default(120),
  RATE_LIMIT_AUTH: z.coerce.number().int().positive().default(20),
  AUTH_MAX_FAILED_ATTEMPTS: z.coerce.number().int().min(1).max(20).default(5),
  AUTH_LOCKOUT_MINUTES: z.coerce.number().int().min(1).max(1440).default(15),
  TOS_VERSION: z.string().min(1).default("2026-08-11"),
  PRIVACY_VERSION: z.string().min(1).default("2026-08-11"),
  OPTIONAL_PROCESSING_VERSION: z.string().min(1).default("2026-08-11"),
  CORS_ORIGINS: z.string().default(""),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

export type Config = z.infer<typeof envSchema>;

export function parseDurationMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) throw new Error("invalid_duration");
  const amount = Number(match[1]);
  const unitMs = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2] as "s" | "m" | "h" | "d"];
  return amount * unitMs;
}

export function allowedCorsOrigins(config: Config): string[] {
  return config.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Invalid configuration: ${details}`);
  }
  return parsed.data;
}