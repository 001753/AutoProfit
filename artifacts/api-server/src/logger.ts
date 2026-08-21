import type { FastifyBaseLogger } from "fastify";

export type LogContext = {
  requestId?: string;
  userId?: string;
  organizationId?: string;
  action?: string;
};

export function redactLogValue(value: unknown): unknown {
  if (typeof value !== "object" || value === null) return value;
  if (Array.isArray(value)) return value.map(redactLogValue);
  const sensitive = /password|token|secret|authorization|cookie|credential/i;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, sensitive.test(key) ? "[REDACTED]" : redactLogValue(item)]),
  );
}

export function logEvent(logger: FastifyBaseLogger, level: "info" | "warn" | "error", event: string, context: LogContext = {}, data?: unknown): void {
  logger[level]({ event, ...context, data: redactLogValue(data) }, event);
}