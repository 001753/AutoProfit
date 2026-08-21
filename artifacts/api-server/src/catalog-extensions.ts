import { createHash } from "node:crypto";
import { z } from "zod";
import type pg from "pg";
import { AppError } from "./errors.js";
import { withTransaction } from "./db.js";
import type { TenantContext } from "./tenant.js";

const uuid = z.string().uuid();
const channelTypes = ["shopee", "tokopedia", "tiktokshop", "lazada", "blibli", "shopify", "woocommerce", "pos", "manual", "api"] as const;
const syncStatuses = ["pending", "synced", "conflict", "disabled", "error"] as const;
type CatalogDb = pg.Pool | pg.PoolClient;

export const channelCreateSchema = z.object({
  type: z.enum(channelTypes),
  name: z.string().trim().min(1).max(120),
});

export const channelListingCreateSchema = z.object({
  channel_id: uuid.optional(),
  channelId: uuid.optional(),
  external_product_id: z.string().trim().min(1).max(200).nullable().optional(),
  externalProductId: z.string().trim().min(1).max(200).nullable().optional(),
  external_sku: z.string().trim().min(1).max(200).nullable().optional(),
  externalSku: z.string().trim().min(1).max(200).nullable().optional(),
  price: z.coerce.number().min(0).nullable().optional(),
  sync_status: z.enum(syncStatuses).optional(),
  syncStatus: z.enum(syncStatuses).optional(),
  conflict_reason: z.string().trim().max(500).nullable().optional(),
  conflictReason: z.string().trim().max(500).nullable().optional(),
}).transform((input) => ({
  channel_id: input.channel_id ?? input.channelId,
  external_product_id: input.external_product_id ?? input.externalProductId ?? null,
  external_sku: input.external_sku ?? input.externalSku ?? null,
  price: input.price ?? null,
  sync_status: input.sync_status ?? input.syncStatus ?? "pending" as const,
  conflict_reason: input.conflict_reason ?? input.conflictReason ?? null,
})).superRefine((input, ctx) => {
  if (!input.channel_id) ctx.addIssue({ code: "custom", path: ["channel_id"], message: "channel_id wajib diisi" });
  if (!input.external_product_id && !input.external_sku) {
    ctx.addIssue({ code: "custom", path: ["external_sku"], message: "external_product_id atau external_sku wajib diisi" });
  }
  if (input.sync_status === "conflict" && !input.conflict_reason) {
    ctx.addIssue({ code: "custom", path: ["conflict_reason"], message: "conflict_reason wajib untuk status conflict" });
  }
});

const channelListingPatchRawSchema = z.object({
  external_product_id: z.string().trim().min(1).max(200).nullable().optional(),
  externalProductId: z.string().trim().min(1).max(200).nullable().optional(),
  external_sku: z.string().trim().min(1).max(200).nullable().optional(),
  externalSku: z.string().trim().min(1).max(200).nullable().optional(),
  price: z.coerce.number().min(0).nullable().optional(),
  sync_status: z.enum(syncStatuses).optional(),
  syncStatus: z.enum(syncStatuses).optional(),
  conflict_reason: z.string().trim().max(500).nullable().optional(),
  conflictReason: z.string().trim().max(500).nullable().optional(),
});

export const channelListingPatchSchema = channelListingPatchRawSchema.transform((input) => ({
  external_product_id: input.external_product_id ?? input.externalProductId,
  external_sku: input.external_sku ?? input.externalSku,
  price: input.price,
  sync_status: input.sync_status ?? input.syncStatus,
  conflict_reason: input.conflict_reason ?? input.conflictReason,
})).superRefine((input, ctx) => {
  if (input.sync_status === "conflict" && !input.conflict_reason) {
    ctx.addIssue({ code: "custom", path: ["conflict_reason"], message: "conflict_reason wajib untuk status conflict" });
  }
});

const searchFilterSchema = z.object({
  q: z.string().trim().max(200).optional(),
  sku: z.string().trim().max(100).optional(),
  barcode: z.string().trim().max(80).optional(),
  category_id: uuid.optional(),
  brand_id: uuid.optional(),
  tax_class_id: uuid.optional(),
  channel_id: uuid.optional(),
  status: z.enum(["active", "archived"]).optional(),
  include_archived: z.coerce.boolean().default(false),
});

export const catalogSearchQuerySchema = searchFilterSchema.extend({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().max(500).optional(),
});

export const savedQueryCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  filters: searchFilterSchema.partial().default({}),
});

export const bulkPreviewSchema = z.object({
  entity: z.enum(["products", "variants"]),
  rows: z.array(z.record(z.string(), z.unknown())).min(1).max(1000),
});

function conflict(code: string, field: string, message: string): AppError & { field: string } {
  const error = new AppError(code, 409, message) as AppError & { field: string };
  error.field = field;
  return error;
}

function mapDbError(error: unknown): never {
  const constraint = typeof error === "object" && error !== null && "constraint" in error ? String(error.constraint) : "";
  if (constraint.includes("channels_name_uq")) throw conflict("channel_already_exists", "name", "Channel sudah digunakan");
  if (constraint.includes("channel_listings_external_sku_uq") || constraint.includes("channel_listings_external_product_uq") || constraint.includes("channel_listings_external_product_sku_uq")) {
    throw conflict("listing_external_identity_conflict", "external_sku", "External identity sudah dipetakan ke varian lain pada channel ini");
  }
  if (constraint.includes("channel_listings_variant_channel_uq")) throw conflict("listing_already_exists", "channel_id", "Varian sudah memiliki listing pada channel ini");
  if (constraint.includes("catalog_saved_queries_name_uq")) throw conflict("saved_query_already_exists", "name", "Nama saved query sudah digunakan");
  throw error;
}

async function audit(client: CatalogDb, context: TenantContext, entityType: string, entityId: string | null, action: string, after: unknown, requestId: string, ip: string) {
  await client.query(
    `INSERT INTO audit_logs (organization_id, user_id, entity_type, entity_id, action, after, request_id, ip)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)`,
    [context.organizationId, context.userId, entityType, entityId, action, JSON.stringify(after), requestId, ip],
  );
}

export async function listChannels(pool: CatalogDb, context: TenantContext, includeArchived = false) {
  const result = await pool.query(
    `SELECT id, organization_id, type, name, status, created_at, updated_at
     FROM channels WHERE organization_id = $1 ${includeArchived ? "" : "AND deleted_at IS NULL AND status = 'active'"}
     ORDER BY name ASC, id ASC`,
    [context.organizationId],
  );
  return result.rows;
}

export async function createChannel(pool: pg.Pool, context: TenantContext, input: z.infer<typeof channelCreateSchema>, requestId: string, ip: string) {
  try {
    return await withTransaction(pool, async (client) => {
      const result = await client.query(
        `INSERT INTO channels (organization_id, type, name, created_by)
         VALUES ($1, $2, $3, $4)
         RETURNING id, organization_id, type, name, status, created_at, updated_at`,
        [context.organizationId, input.type, input.name, context.userId],
      );
      const channel = result.rows[0];
      await audit(client, context, "channel", channel.id, "channel.created", channel, requestId, ip);
      return channel;
    });
  } catch (error) {
    mapDbError(error);
  }
}

async function ensureActiveChannel(client: CatalogDb, context: TenantContext, channelId: string) {
  const result = await client.query(
    "SELECT id, type, name FROM channels WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL AND status = 'active'",
    [channelId, context.organizationId],
  );
  if (!result.rows[0]) throw new AppError("channel_not_found", 404);
  return result.rows[0];
}

async function ensureActiveVariant(client: CatalogDb, context: TenantContext, variantId: string) {
  const result = await client.query(
    `SELECT id, product_id, sku FROM variants
     WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL AND status = 'active'`,
    [variantId, context.organizationId],
  );
  if (!result.rows[0]) throw new AppError("variant_not_found", 404);
  return result.rows[0];
}

export async function listVariantListings(pool: CatalogDb, context: TenantContext, variantId: string, includeArchived = false) {
  const result = await pool.query(
    `SELECT cl.id, cl.organization_id, cl.variant_id, cl.channel_id, c.type AS channel_type, c.name AS channel_name,
            cl.external_product_id, cl.external_sku, cl.price, cl.sync_status, cl.conflict_reason,
            cl.created_at, cl.updated_at
     FROM channel_listings cl JOIN channels c ON c.id = cl.channel_id AND c.organization_id = cl.organization_id
     WHERE cl.organization_id = $1 AND cl.variant_id = $2
       ${includeArchived ? "" : "AND cl.deleted_at IS NULL"}
     ORDER BY cl.created_at ASC, cl.id ASC`,
    [context.organizationId, variantId],
  );
  return result.rows;
}

export async function createListing(pool: pg.Pool, context: TenantContext, variantId: string, input: z.infer<typeof channelListingCreateSchema>, requestId: string, ip: string) {
  try {
    return await withTransaction(pool, async (client) => {
      await ensureActiveVariant(client, context, variantId);
      await ensureActiveChannel(client, context, input.channel_id!);
      const result = await client.query(
        `INSERT INTO channel_listings
           (organization_id, variant_id, channel_id, external_product_id, external_sku, price, sync_status, conflict_reason, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, organization_id, variant_id, channel_id, external_product_id, external_sku, price, sync_status, conflict_reason, created_at, updated_at`,
        [context.organizationId, variantId, input.channel_id, input.external_product_id, input.external_sku, input.price, input.sync_status, input.conflict_reason, context.userId],
      );
      const listing = result.rows[0];
      await audit(client, context, "channel_listing", listing.id, "channel_listing.created", listing, requestId, ip);
      return listing;
    });
  } catch (error) {
    mapDbError(error);
  }
}

export async function updateListing(pool: pg.Pool, context: TenantContext, listingId: string, input: z.infer<typeof channelListingPatchSchema>, requestId: string, ip: string) {
  try {
    return await withTransaction(pool, async (client) => {
      const currentResult = await client.query(
        `SELECT id, variant_id, channel_id, external_product_id, external_sku, price, sync_status, conflict_reason
         FROM channel_listings WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL FOR UPDATE`,
        [listingId, context.organizationId],
      );
      const current = currentResult.rows[0];
      if (!current) throw new AppError("listing_not_found", 404);
      const next = {
        external_product_id: input.external_product_id === undefined ? current.external_product_id : input.external_product_id,
        external_sku: input.external_sku === undefined ? current.external_sku : input.external_sku,
        price: input.price === undefined ? current.price : input.price,
        sync_status: input.sync_status === undefined ? current.sync_status : input.sync_status,
        conflict_reason: input.conflict_reason === undefined ? current.conflict_reason : input.conflict_reason,
      };
      if (!next.external_product_id && !next.external_sku) throw new AppError("validation_error", 400, "external_product_id atau external_sku wajib diisi");
      if (next.sync_status === "conflict" && !next.conflict_reason) throw new AppError("validation_error", 400, "conflict_reason wajib untuk status conflict");
      const result = await client.query(
        `UPDATE channel_listings
         SET external_product_id = $1, external_sku = $2, price = $3, sync_status = $4, conflict_reason = $5, updated_at = now()
         WHERE id = $6 AND organization_id = $7
         RETURNING id, organization_id, variant_id, channel_id, external_product_id, external_sku, price, sync_status, conflict_reason, created_at, updated_at`,
        [next.external_product_id, next.external_sku, next.price, next.sync_status, next.conflict_reason, listingId, context.organizationId],
      );
      const listing = result.rows[0];
      await audit(client, context, "channel_listing", listingId, "channel_listing.updated", listing, requestId, ip);
      return listing;
    });
  } catch (error) {
    mapDbError(error);
  }
}

export async function archiveListing(pool: pg.Pool, context: TenantContext, listingId: string, requestId: string, ip: string) {
  return withTransaction(pool, async (client) => {
    const result = await client.query(
      `UPDATE channel_listings SET deleted_at = COALESCE(deleted_at, now()), updated_at = now(), sync_status = 'disabled'
       WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL
       RETURNING id, sync_status, deleted_at`,
      [listingId, context.organizationId],
    );
    const listing = result.rows[0];
    if (!listing) throw new AppError("listing_not_found", 404);
    await audit(client, context, "channel_listing", listingId, "channel_listing.archived", listing, requestId, ip);
    return listing;
  });
}

function cursorFor(createdAt: Date | string, productId: string, rowId: string) {
  return Buffer.from(JSON.stringify({ created_at: new Date(createdAt).toISOString(), product_id: productId, row_id: rowId }), "utf8").toString("base64url");
}

function decodeCursor(cursor: string | undefined): { createdAt: string; productId: string; rowId: string } | undefined {
  if (!cursor) return undefined;
  try {
    const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as { created_at?: string; product_id?: string; row_id?: string };
    if (!decoded.created_at || !decoded.product_id || !decoded.row_id || !uuid.safeParse(decoded.product_id).success || !uuid.safeParse(decoded.row_id).success || Number.isNaN(Date.parse(decoded.created_at))) throw new Error("invalid");
    return { createdAt: decoded.created_at, productId: decoded.product_id, rowId: decoded.row_id };
  } catch {
    throw new AppError("invalid_cursor", 400, "Cursor tidak valid");
  }
}

export async function searchCatalog(pool: pg.Pool, context: TenantContext, options: z.infer<typeof catalogSearchQuerySchema>) {
  const cursor = decodeCursor(options.cursor);
  const values: unknown[] = [context.organizationId];
  const filters: string[] = [];
  if (options.q) {
    values.push(`%${options.q}%`);
    filters.push(`(p.name ILIKE $${values.length} OR COALESCE(p.description, '') ILIKE $${values.length} OR v.sku ILIKE $${values.length} OR COALESCE(v.barcode, '') ILIKE $${values.length})`);
  }
  if (options.sku) {
    values.push(options.sku);
    filters.push(`lower(v.sku) = lower($${values.length})`);
  }
  if (options.barcode) {
    values.push(options.barcode);
    filters.push(`v.barcode = $${values.length}`);
  }
  for (const [field, column] of [["category_id", "p.category_id"], ["brand_id", "p.brand_id"], ["tax_class_id", "p.tax_class_id"]] as const) {
    const value = options[field];
    if (value) {
      values.push(value);
      filters.push(`${column} = $${values.length}::uuid`);
    }
  }
  if (options.channel_id) {
    values.push(options.channel_id);
    filters.push(`EXISTS (SELECT 1 FROM channel_listings cl_filter WHERE cl_filter.organization_id = p.organization_id AND cl_filter.variant_id = v.id AND cl_filter.channel_id = $${values.length}::uuid AND cl_filter.deleted_at IS NULL)`);
  }
  const activeOnly = !options.include_archived && options.status !== "archived";
  if (activeOnly) filters.push("p.deleted_at IS NULL AND p.status = 'active' AND (v.id IS NULL OR (v.deleted_at IS NULL AND v.status = 'active'))");
  if (options.status === "archived") filters.push("(p.status = 'archived' OR v.status = 'archived')");
  if (cursor) {
    values.push(cursor.createdAt, cursor.productId, cursor.rowId);
    filters.push(`(p.created_at, p.id, COALESCE(v.id, p.id)) < ($${values.length - 2}::timestamptz, $${values.length - 1}::uuid, $${values.length}::uuid)`);
  }
  values.push(options.limit + 1);
  const result = await pool.query(
    `SELECT p.id AS product_id, p.name AS product_name, p.description AS product_description,
            p.category_id, p.brand_id, p.tax_class_id, p.status AS product_status,
            v.id AS variant_id, v.sku, v.barcode, v.attributes, v.cost_method, v.standard_cost,
            COALESCE(v.status, p.status) AS status, p.created_at, p.updated_at,
            COALESCE(v.id, p.id) AS row_id
     FROM products p
     LEFT JOIN variants v ON v.product_id = p.id AND v.organization_id = p.organization_id
     WHERE p.organization_id = $1 ${filters.length ? `AND ${filters.join(" AND ")}` : ""}
     ORDER BY p.created_at DESC, p.id DESC, v.id DESC NULLS LAST
     LIMIT $${values.length}`,
    values,
  );
  const hasMore = result.rows.length > options.limit;
  const rows = hasMore ? result.rows.slice(0, options.limit) : result.rows;
  const last = rows[rows.length - 1];
  return { rows, nextCursor: hasMore && last ? cursorFor(last.created_at, last.product_id, last.row_id) : null };
}

export async function listSavedQueries(pool: CatalogDb, context: TenantContext) {
  const result = await pool.query(
    `SELECT id, organization_id, name, filters, created_at, updated_at
     FROM catalog_saved_queries WHERE organization_id = $1 ORDER BY name ASC, id ASC`,
    [context.organizationId],
  );
  return result.rows;
}

export async function createSavedQuery(pool: pg.Pool, context: TenantContext, input: z.infer<typeof savedQueryCreateSchema>, requestId: string, ip: string) {
  try {
    return await withTransaction(pool, async (client) => {
      const result = await client.query(
        `INSERT INTO catalog_saved_queries (organization_id, name, filters, created_by)
         VALUES ($1, $2, $3::jsonb, $4)
         RETURNING id, organization_id, name, filters, created_at, updated_at`,
        [context.organizationId, input.name, JSON.stringify(input.filters), context.userId],
      );
      const saved = result.rows[0];
      await audit(client, context, "catalog_saved_query", saved.id, "catalog_saved_query.created", saved, requestId, ip);
      return saved;
    });
  } catch (error) {
    mapDbError(error);
  }
}

export async function deleteSavedQuery(pool: pg.Pool, context: TenantContext, queryId: string, requestId: string, ip: string) {
  return withTransaction(pool, async (client) => {
    const result = await client.query(
      "DELETE FROM catalog_saved_queries WHERE id = $1 AND organization_id = $2 RETURNING id",
      [queryId, context.organizationId],
    );
    if (!result.rows[0]) throw new AppError("saved_query_not_found", 404);
    await audit(client, context, "catalog_saved_query", queryId, "catalog_saved_query.deleted", result.rows[0], requestId, ip);
    return { deleted: true };
  });
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

function payloadHash(payload: unknown) {
  return createHash("sha256").update(JSON.stringify(canonicalize(payload))).digest("hex");
}

type RowError = { field: string; code: string; message: string };

function zodRowErrors(error: z.ZodError): RowError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "row",
    code: issue.code,
    message: issue.message,
  }));
}

export async function previewBulk(pool: pg.Pool, context: TenantContext, input: z.infer<typeof bulkPreviewSchema>, idempotencyKey: string) {
  const hash = payloadHash(input);
  return withTransaction(pool, async (client) => {
    await client.query(
      `INSERT INTO catalog_bulk_previews (organization_id, idempotency_key, payload_hash, created_by)
       VALUES ($1, $2, $3, $4) ON CONFLICT (organization_id, idempotency_key) DO NOTHING`,
      [context.organizationId, idempotencyKey, hash, context.userId],
    );
    const existingResult = await client.query(
      `SELECT id, payload_hash, result FROM catalog_bulk_previews
       WHERE organization_id = $1 AND idempotency_key = $2 FOR UPDATE`,
      [context.organizationId, idempotencyKey],
    );
    const existing = existingResult.rows[0];
    if (!existing) throw new Error("bulk_preview_idempotency_record_missing");
    if (existing.payload_hash !== hash) throw new AppError("idempotency_key_reused", 409, "Idempotency-Key sudah digunakan untuk payload lain");
    if (existing.result) return { ...(existing.result as object), replayed: true };

    const rowResults: Array<Record<string, unknown>> = [];
    const seenNames = new Set<string>();
    const seenSkus = new Set<string>();
    const seenBarcodes = new Set<string>();
    let existingNames = new Set<string>();
    let existingSkus = new Set<string>();
    let existingBarcodes = new Set<string>();
    if (input.entity === "products") {
      const names = await client.query<{ key: string }>("SELECT lower(name) AS key FROM products WHERE organization_id = $1 AND deleted_at IS NULL", [context.organizationId]);
      existingNames = new Set(names.rows.map((row) => row.key));
    } else {
      const variants = await client.query<{ sku: string; barcode: string | null }>(
        "SELECT lower(sku) AS sku, barcode FROM variants WHERE organization_id = $1 AND deleted_at IS NULL",
        [context.organizationId],
      );
      existingSkus = new Set(variants.rows.map((row) => row.sku));
      existingBarcodes = new Set(variants.rows.filter((row) => row.barcode).map((row) => row.barcode!));
    }
    const productIds = input.entity === "variants" ? input.rows.map((row) => row.product_id ?? row.productId).filter((id): id is string => typeof id === "string" && uuid.safeParse(id).success) : [];
    const validProductIds = new Set<string>();
    if (productIds.length) {
      const products = await client.query<{ id: string }>(
        "SELECT id FROM products WHERE organization_id = $1 AND id = ANY($2::uuid[]) AND deleted_at IS NULL AND status = 'active'",
        [context.organizationId, productIds],
      );
      for (const row of products.rows) validProductIds.add(row.id);
    }
    for (const [index, row] of input.rows.entries()) {
      const errors: RowError[] = [];
      let data: unknown = row;
      if (input.entity === "products") {
        const parsed = z.object({
          name: z.string().trim().min(1).max(240),
          description: z.string().trim().max(2000).nullable().optional(),
          category_id: uuid.nullable().optional(),
          brand_id: uuid.nullable().optional(),
          tax_class_id: uuid.nullable().optional(),
        }).safeParse(row);
        if (!parsed.success) {
          errors.push(...zodRowErrors(parsed.error));
        } else {
          data = parsed.data;
          const key = parsed.data.name.toLowerCase();
          if (existingNames.has(key) || seenNames.has(key)) errors.push({ field: "name", code: "duplicate", message: "Nama product sudah digunakan" });
          seenNames.add(key);
        }
      } else {
        const parsed = z.object({
          product_id: uuid,
          sku: z.string().trim().min(1).max(100),
          barcode: z.string().trim().min(1).max(80).nullable().optional(),
          attributes: z.record(z.string(), z.unknown()).default({}),
          cost_method: z.enum(["FIFO", "AVERAGE", "STANDARD"]).default("AVERAGE"),
          standard_cost: z.coerce.number().min(0).nullable().optional(),
        }).safeParse(row);
        if (!parsed.success) {
          errors.push(...zodRowErrors(parsed.error));
        } else {
          data = parsed.data;
          const variant = parsed.data;
          if (!validProductIds.has(variant.product_id)) errors.push({ field: "product_id", code: "not_found", message: "Product tidak ditemukan pada tenant aktif" });
          const skuKey = variant.sku.toLowerCase();
          if (existingSkus.has(skuKey) || seenSkus.has(skuKey)) errors.push({ field: "sku", code: "duplicate", message: "SKU sudah digunakan" });
          seenSkus.add(skuKey);
          if (variant.barcode && (existingBarcodes.has(variant.barcode) || seenBarcodes.has(variant.barcode))) errors.push({ field: "barcode", code: "duplicate", message: "Barcode sudah digunakan" });
          if (variant.barcode) seenBarcodes.add(variant.barcode);
        }
      }
      rowResults.push({ row: index + 1, status: errors.length ? "invalid" : "valid", data, errors });
    }
    const result = {
      entity: input.entity,
      total_rows: rowResults.length,
      valid_count: rowResults.filter((row) => row.status === "valid").length,
      invalid_count: rowResults.filter((row) => row.status === "invalid").length,
      partial: rowResults.some((row) => row.status === "valid") && rowResults.some((row) => row.status === "invalid"),
      row_results: rowResults,
      replayed: false,
    };
    await client.query("UPDATE catalog_bulk_previews SET result = $1::jsonb WHERE id = $2", [JSON.stringify(result), existing.id]);
    return result;
  });
}