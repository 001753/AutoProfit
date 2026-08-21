import { z } from "zod";
import type pg from "pg";
import { AppError } from "./errors.js";
import { withTransaction } from "./db.js";
import type { TenantContext } from "./tenant.js";

const uuid = z.string().uuid();
const name = z.string().trim().min(1).max(240);
const shortName = z.string().trim().min(1).max(120);
const description = z.string().trim().max(2000).nullable().optional();
const attributes = z.record(z.string(), z.unknown()).default({});

function alias<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).passthrough();
}

export const referenceCreateSchema = alias({
  name: shortName,
  description,
  code: z.string().trim().min(1).max(40).optional(),
  rate: z.coerce.number().min(0).max(100).optional(),
});

export const referencePatchSchema = referenceCreateSchema.partial();

const productInputShape = {
  name,
  description,
  category_id: uuid.nullable().optional(),
  categoryId: uuid.nullable().optional(),
  brand_id: uuid.nullable().optional(),
  brandId: uuid.nullable().optional(),
  tax_class_id: uuid.nullable().optional(),
  taxClassId: uuid.nullable().optional(),
};

function normalizeProductInput(input: {
  name?: string;
  description?: string | null;
  category_id?: string | null;
  categoryId?: string | null;
  brand_id?: string | null;
  brandId?: string | null;
  tax_class_id?: string | null;
  taxClassId?: string | null;
  [key: string]: unknown;
}) {
  const { category_id, categoryId, brand_id, brandId, tax_class_id, taxClassId, ...rest } = input;
  return {
    ...rest,
    category_id: category_id ?? categoryId ?? null,
    brand_id: brand_id ?? brandId ?? null,
    tax_class_id: tax_class_id ?? taxClassId ?? null,
  };
}

export const productCreateSchema = alias(productInputShape).transform(normalizeProductInput);

export const productPatchSchema = alias(productInputShape).partial().transform(normalizeProductInput);

const variantInputShape = {
  product_id: uuid.optional(),
  productId: uuid.optional(),
  sku: z.string().trim().min(1).max(100),
  barcode: z.string().trim().min(1).max(80).nullable().optional(),
  attributes,
  cost_method: z.enum(["FIFO", "AVERAGE", "STANDARD"]).optional(),
  costMethod: z.enum(["FIFO", "AVERAGE", "STANDARD"]).optional(),
  standard_cost: z.coerce.number().min(0).nullable().optional(),
  standardCost: z.coerce.number().min(0).nullable().optional(),
};

function normalizeVariantInput(input: {
  product_id?: string;
  productId?: string;
  sku?: string;
  barcode?: string | null;
  attributes?: Record<string, unknown>;
  cost_method?: "FIFO" | "AVERAGE" | "STANDARD";
  costMethod?: "FIFO" | "AVERAGE" | "STANDARD";
  standard_cost?: number | null;
  standardCost?: number | null;
  [key: string]: unknown;
}) {
  const { product_id, productId, cost_method, costMethod, standard_cost, standardCost, ...rest } = input;
  return {
    ...rest,
    product_id: product_id ?? productId,
    cost_method: cost_method ?? costMethod ?? "AVERAGE",
    standard_cost: standard_cost ?? standardCost ?? null,
  };
}

export const variantCreateSchema = alias(variantInputShape).transform(normalizeVariantInput);

export const variantPatchSchema = alias(variantInputShape)
  .omit({ product_id: true, productId: true, sku: true })
  .partial()
  .transform(normalizeVariantInput);

export const archiveSchema = z.object({ reason: z.string().trim().max(500).optional() });

export type CatalogReferenceType = "categories" | "brands" | "tax-classes";
type CatalogDb = pg.Pool | pg.PoolClient;

function conflict(code: string, field: string, message: string): AppError & { field: string } {
  const error = new AppError(code, 409, message) as AppError & { field: string };
  error.field = field;
  return error;
}

function mapDbError(error: unknown): never {
  const constraint = typeof error === "object" && error !== null && "constraint" in error
    ? String(error.constraint)
    : "";
  if (constraint.includes("variants_sku_uq")) throw conflict("sku_already_exists", "sku", "SKU sudah digunakan pada varian lain");
  if (constraint.includes("variants_barcode_uq")) throw conflict("barcode_already_exists", "barcode", "Barcode sudah digunakan pada varian lain");
  if (constraint.includes("catalog_categories_name_uq")) throw conflict("category_already_exists", "name", "Kategori sudah digunakan");
  if (constraint.includes("catalog_brands_name_uq")) throw conflict("brand_already_exists", "name", "Brand sudah digunakan");
  if (constraint.includes("catalog_tax_classes_code_uq")) throw conflict("tax_class_already_exists", "code", "Kode tax class sudah digunakan");
  throw error;
}

async function audit(
  client: CatalogDb,
  context: TenantContext,
  entityType: string,
  entityId: string,
  action: string,
  after: unknown,
  requestId: string,
  ip: string,
) {
  await client.query(
    `INSERT INTO audit_logs
      (organization_id, user_id, entity_type, entity_id, action, after, request_id, ip)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)`,
    [context.organizationId, context.userId, entityType, entityId, action, JSON.stringify(after), requestId, ip],
  );
}

function cursorFor(createdAt: Date | string, id: string): string {
  return Buffer.from(JSON.stringify({ created_at: new Date(createdAt).toISOString(), id }), "utf8").toString("base64url");
}

function decodeCursor(cursor: string | undefined): { createdAt: string; id: string } | undefined {
  if (!cursor) return undefined;
  try {
    const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as { created_at?: string; id?: string };
    if (!decoded.created_at || !decoded.id || !uuid.safeParse(decoded.id).success || Number.isNaN(Date.parse(decoded.created_at))) {
      throw new Error("invalid");
    }
    return { createdAt: decoded.created_at, id: decoded.id };
  } catch {
    throw new AppError("invalid_cursor", 400, "Cursor tidak valid");
  }
}

function statusFilter(includeArchived: boolean) {
  return includeArchived ? "TRUE" : "p.deleted_at IS NULL AND p.status = 'active'";
}

export async function listProducts(
  pool: pg.Pool,
  context: TenantContext,
  options: { limit: number; cursor?: string; includeArchived: boolean },
) {
  const cursor = decodeCursor(options.cursor);
  const values: unknown[] = [context.organizationId, options.limit + 1];
  let cursorSql = "";
  if (cursor) {
    values.push(cursor.createdAt, cursor.id);
    cursorSql = `AND (p.created_at, p.id) < ($3::timestamptz, $4::uuid)`;
  }
  const result = await pool.query(
    `SELECT p.id, p.organization_id, p.name, p.description, p.category_id, c.name AS category_name,
            p.brand_id, b.name AS brand_name, p.tax_class_id, tc.name AS tax_class_name,
            p.status, p.created_at, p.updated_at,
            COUNT(v.id)::int AS variant_count
     FROM products p
     LEFT JOIN catalog_categories c ON c.id = p.category_id AND c.organization_id = p.organization_id
     LEFT JOIN catalog_brands b ON b.id = p.brand_id AND b.organization_id = p.organization_id
     LEFT JOIN catalog_tax_classes tc ON tc.id = p.tax_class_id AND tc.organization_id = p.organization_id
     LEFT JOIN variants v ON v.product_id = p.id AND v.organization_id = p.organization_id AND v.deleted_at IS NULL
     WHERE p.organization_id = $1 AND ${statusFilter(options.includeArchived)} ${cursorSql}
     GROUP BY p.id, c.name, b.name, tc.name
     ORDER BY p.created_at DESC, p.id DESC
     LIMIT $2`,
    values,
  );
  const hasMore = result.rows.length > options.limit;
  const rows = hasMore ? result.rows.slice(0, options.limit) : result.rows;
  return { rows, nextCursor: hasMore ? cursorFor(rows[rows.length - 1].created_at, rows[rows.length - 1].id) : null };
}

export async function getProduct(pool: CatalogDb, context: TenantContext, productId: string, includeArchived = true) {
  const result = await pool.query(
    `SELECT p.id, p.organization_id, p.name, p.description, p.category_id, c.name AS category_name,
            p.brand_id, b.name AS brand_name, p.tax_class_id, tc.name AS tax_class_name,
            p.status, p.created_at, p.updated_at
     FROM products p
     LEFT JOIN catalog_categories c ON c.id = p.category_id AND c.organization_id = p.organization_id
     LEFT JOIN catalog_brands b ON b.id = p.brand_id AND b.organization_id = p.organization_id
     LEFT JOIN catalog_tax_classes tc ON tc.id = p.tax_class_id AND tc.organization_id = p.organization_id
     WHERE p.id = $1 AND p.organization_id = $2
       ${includeArchived ? "" : "AND p.deleted_at IS NULL AND p.status = 'active'"}`,
    [productId, context.organizationId],
  );
  if (!result.rows[0]) throw new AppError("product_not_found", 404);
  return result.rows[0];
}

async function validateProductReferences(client: CatalogDb, context: TenantContext, input: { category_id: string | null; brand_id: string | null; tax_class_id: string | null }) {
  const checks = [
    ["category_id", input.category_id, "catalog_categories"],
    ["brand_id", input.brand_id, "catalog_brands"],
    ["tax_class_id", input.tax_class_id, "catalog_tax_classes"],
  ] as const;
  for (const [field, id, table] of checks) {
    if (!id) continue;
    const result = await client.query(`SELECT id FROM ${table} WHERE id = $1 AND organization_id = $2 AND status = 'active' AND deleted_at IS NULL`, [id, context.organizationId]);
    if (!result.rows[0]) throw new AppError(`${field.replace("_id", "")}_not_found`, 404);
  }
}

export async function createProduct(pool: pg.Pool, context: TenantContext, input: z.infer<typeof productCreateSchema>, requestId: string, ip: string) {
  try {
    return await withTransaction(pool, async (client) => {
      await validateProductReferences(client, context, input);
      const result = await client.query(
        `INSERT INTO products (organization_id, name, description, category_id, brand_id, tax_class_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, organization_id, name, description, category_id, brand_id, tax_class_id, status, created_at, updated_at`,
        [context.organizationId, input.name, input.description ?? null, input.category_id, input.brand_id, input.tax_class_id, context.userId],
      );
      const product = result.rows[0];
      await audit(client, context, "product", product.id, "product.created", product, requestId, ip);
      return product;
    });
  } catch (error) {
    mapDbError(error);
  }
}

export async function updateProduct(pool: pg.Pool, context: TenantContext, productId: string, input: z.infer<typeof productPatchSchema>, requestId: string, ip: string) {
  const current = await getProduct(pool, context, productId, false);
  const next = {
    name: input.name ?? current.name,
    description: input.description === undefined ? current.description : input.description,
    category_id: input.category_id === undefined ? current.category_id : input.category_id,
    brand_id: input.brand_id === undefined ? current.brand_id : input.brand_id,
    tax_class_id: input.tax_class_id === undefined ? current.tax_class_id : input.tax_class_id,
  };
  try {
    return await withTransaction(pool, async (client) => {
      await validateProductReferences(client, context, next);
      const result = await client.query(
        `UPDATE products
         SET name = $1, description = $2, category_id = $3, brand_id = $4, tax_class_id = $5, updated_at = now()
         WHERE id = $6 AND organization_id = $7 AND deleted_at IS NULL
         RETURNING id, organization_id, name, description, category_id, brand_id, tax_class_id, status, created_at, updated_at`,
        [next.name, next.description ?? null, next.category_id, next.brand_id, next.tax_class_id, productId, context.organizationId],
      );
      const product = result.rows[0];
      await audit(client, context, "product", productId, "product.updated", product, requestId, ip);
      return product;
    });
  } catch (error) {
    mapDbError(error);
  }
}

export async function archiveProduct(pool: pg.Pool, context: TenantContext, productId: string, requestId: string, ip: string) {
  try {
    return await withTransaction(pool, async (client) => {
      const result = await client.query(
        `UPDATE products SET status = 'archived', deleted_at = COALESCE(deleted_at, now()), updated_at = now()
         WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL
         RETURNING id, status, deleted_at`,
        [productId, context.organizationId],
      );
      const product = result.rows[0];
      if (!product) throw new AppError("product_not_found", 404);
      await client.query(
        `UPDATE variants SET status = 'archived', deleted_at = COALESCE(deleted_at, now()), updated_at = now()
         WHERE product_id = $1 AND organization_id = $2 AND deleted_at IS NULL`,
        [productId, context.organizationId],
      );
      await audit(client, context, "product", productId, "product.archived", product, requestId, ip);
      return product;
    });
  } catch (error) {
    mapDbError(error);
  }
}

export async function listVariants(pool: CatalogDb, context: TenantContext, productId: string, includeArchived = false) {
  await getProduct(pool, context, productId, true);
  const result = await pool.query(
    `SELECT id, organization_id, product_id, sku, barcode, attributes, cost_method, standard_cost,
            status, created_at, updated_at
     FROM variants
     WHERE organization_id = $1 AND product_id = $2
       ${includeArchived ? "" : "AND deleted_at IS NULL AND status = 'active'"}
     ORDER BY created_at ASC, id ASC`,
    [context.organizationId, productId],
  );
  return result.rows;
}

export async function createVariant(pool: pg.Pool, context: TenantContext, productId: string, input: z.infer<typeof variantCreateSchema>, requestId: string, ip: string) {
  await getProduct(pool, context, productId, false);
  try {
    return await withTransaction(pool, async (client) => {
      const result = await client.query(
        `INSERT INTO variants
           (organization_id, product_id, sku, barcode, attributes, cost_method, standard_cost, created_by)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)
         RETURNING id, organization_id, product_id, sku, barcode, attributes, cost_method, standard_cost, status, created_at, updated_at`,
        [context.organizationId, productId, input.sku, input.barcode ?? null, JSON.stringify(input.attributes), input.cost_method, input.standard_cost, context.userId],
      );
      const variant = result.rows[0];
      await audit(client, context, "variant", variant.id, "variant.created", variant, requestId, ip);
      return variant;
    });
  } catch (error) {
    mapDbError(error);
  }
}

export async function updateVariant(pool: pg.Pool, context: TenantContext, variantId: string, input: z.infer<typeof variantPatchSchema>, requestId: string, ip: string) {
  const current = await pool.query(
    `SELECT id, product_id, sku, barcode, attributes, cost_method, standard_cost
     FROM variants WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL`,
    [variantId, context.organizationId],
  );
  const row = current.rows[0];
  if (!row) throw new AppError("variant_not_found", 404);
  const next = {
    sku: input.sku ?? row.sku,
    barcode: input.barcode === undefined ? row.barcode : input.barcode,
    attributes: input.attributes ?? row.attributes,
    cost_method: input.cost_method ?? row.cost_method,
    standard_cost: input.standard_cost === undefined ? row.standard_cost : input.standard_cost,
  };
  try {
    return await withTransaction(pool, async (client) => {
      const result = await client.query(
        `UPDATE variants
         SET sku = $1, barcode = $2, attributes = $3::jsonb, cost_method = $4, standard_cost = $5, updated_at = now()
         WHERE id = $6 AND organization_id = $7 AND deleted_at IS NULL
         RETURNING id, organization_id, product_id, sku, barcode, attributes, cost_method, standard_cost, status, created_at, updated_at`,
        [next.sku, next.barcode, JSON.stringify(next.attributes), next.cost_method, next.standard_cost, variantId, context.organizationId],
      );
      const variant = result.rows[0];
      await audit(client, context, "variant", variantId, "variant.updated", variant, requestId, ip);
      return variant;
    });
  } catch (error) {
    mapDbError(error);
  }
}

export async function archiveVariant(pool: pg.Pool, context: TenantContext, variantId: string, requestId: string, ip: string) {
  try {
    return await withTransaction(pool, async (client) => {
      const result = await client.query(
        `UPDATE variants SET status = 'archived', deleted_at = COALESCE(deleted_at, now()), updated_at = now()
         WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL
         RETURNING id, status, deleted_at`,
        [variantId, context.organizationId],
      );
      const variant = result.rows[0];
      if (!variant) throw new AppError("variant_not_found", 404);
      await audit(client, context, "variant", variantId, "variant.archived", variant, requestId, ip);
      return variant;
    });
  } catch (error) {
    mapDbError(error);
  }
}

const referenceConfig = {
  categories: { table: "catalog_categories", entity: "category", code: false },
  brands: { table: "catalog_brands", entity: "brand", code: false },
  "tax-classes": { table: "catalog_tax_classes", entity: "tax_class", code: true },
} as const;

export async function listReferences(pool: CatalogDb, context: TenantContext, type: CatalogReferenceType, includeArchived = false) {
  const config = referenceConfig[type];
  const result = await pool.query(
    `SELECT id, organization_id, name, description${config.code ? ", code, rate" : ""}, status, created_at, updated_at
     FROM ${config.table}
     WHERE organization_id = $1 ${includeArchived ? "" : "AND deleted_at IS NULL AND status = 'active'"}
     ORDER BY name ASC, id ASC`,
    [context.organizationId],
  );
  return result.rows;
}

export async function createReference(pool: pg.Pool, context: TenantContext, type: CatalogReferenceType, input: z.infer<typeof referenceCreateSchema>, requestId: string, ip: string) {
  const config = referenceConfig[type];
  if (config.code && !input.code) throw new AppError("validation_error", 400, "Tax class membutuhkan code");
  try {
    return await withTransaction(pool, async (client) => {
      const result = await client.query(
        `INSERT INTO ${config.table} (organization_id, name, description, ${config.code ? "code, rate," : ""} created_by)
         VALUES ($1, $2, $3, ${config.code ? "$4, $5," : ""} $${config.code ? 6 : 4})
         RETURNING id, organization_id, name, description${config.code ? ", code, rate" : ""}, status, created_at, updated_at`,
        config.code
          ? [context.organizationId, input.name, input.description ?? null, input.code, input.rate ?? 0, context.userId]
          : [context.organizationId, input.name, input.description ?? null, context.userId],
      );
      const record = result.rows[0];
      await audit(client, context, config.entity, record.id, `${config.entity}.created`, record, requestId, ip);
      return record;
    });
  } catch (error) {
    mapDbError(error);
  }
}

export async function updateReference(
  pool: pg.Pool,
  context: TenantContext,
  type: CatalogReferenceType,
  id: string,
  input: z.infer<typeof referencePatchSchema>,
  requestId: string,
  ip: string,
) {
  const config = referenceConfig[type];
  const current = await pool.query(
    `SELECT id, name, description${config.code ? ", code, rate" : ""}
     FROM ${config.table}
     WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL`,
    [id, context.organizationId],
  );
  const row = current.rows[0];
  if (!row) throw new AppError(`${config.entity}_not_found`, 404);
  const nextName = input.name ?? row.name;
  const nextDescription = input.description === undefined ? row.description : input.description;
  const nextCode = config.code ? input.code ?? row.code : undefined;
  const nextRate = config.code ? input.rate ?? row.rate : undefined;
  if (config.code && !nextCode) throw new AppError("validation_error", 400, "Tax class membutuhkan code");
  try {
    return await withTransaction(pool, async (client) => {
      const result = await client.query(
        `UPDATE ${config.table}
         SET name = $1, description = $2${config.code ? ", code = $3, rate = $4" : ""}, updated_at = now()
         WHERE id = $${config.code ? 5 : 3} AND organization_id = $${config.code ? 6 : 4} AND deleted_at IS NULL
         RETURNING id, organization_id, name, description${config.code ? ", code, rate" : ""}, status, created_at, updated_at`,
        config.code
          ? [nextName, nextDescription ?? null, nextCode, nextRate, id, context.organizationId]
          : [nextName, nextDescription ?? null, id, context.organizationId],
      );
      const record = result.rows[0];
      await audit(client, context, config.entity, id, `${config.entity}.updated`, record, requestId, ip);
      return record;
    });
  } catch (error) {
    mapDbError(error);
  }
}

export async function archiveReference(pool: pg.Pool, context: TenantContext, type: CatalogReferenceType, id: string, requestId: string, ip: string) {
  const config = referenceConfig[type];
  try {
    return await withTransaction(pool, async (client) => {
      const result = await client.query(
        `UPDATE ${config.table} SET status = 'archived', deleted_at = COALESCE(deleted_at, now()), updated_at = now()
         WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL
         RETURNING id, status, deleted_at`,
        [id, context.organizationId],
      );
      const record = result.rows[0];
      if (!record) throw new AppError(`${config.entity}_not_found`, 404);
      await audit(client, context, config.entity, id, `${config.entity}.archived`, record, requestId, ip);
      return record;
    });
  } catch (error) {
    mapDbError(error);
  }
}