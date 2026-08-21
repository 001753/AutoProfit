CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  type TEXT NOT NULL CHECK (type IN ('shopee', 'tokopedia', 'tiktokshop', 'lazada', 'blibli', 'shopify', 'woocommerce', 'pos', 'manual', 'api')),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (organization_id, id),
  CONSTRAINT channels_org_created_by_fk
    FOREIGN KEY (organization_id, created_by) REFERENCES memberships(organization_id, user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS channels_name_uq
  ON channels (organization_id, lower(name)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS channels_org_status_idx
  ON channels (organization_id, status, created_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS channel_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  variant_id UUID NOT NULL,
  channel_id UUID NOT NULL,
  external_product_id TEXT,
  external_sku TEXT,
  price NUMERIC(19, 4) CHECK (price IS NULL OR price >= 0),
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'conflict', 'disabled', 'error')),
  conflict_reason TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (organization_id, id),
  CONSTRAINT channel_listings_identity_required CHECK (
    COALESCE(NULLIF(trim(external_product_id), ''), NULLIF(trim(external_sku), '')) IS NOT NULL
  ),
  CONSTRAINT channel_listings_variant_fk
    FOREIGN KEY (organization_id, variant_id) REFERENCES variants(organization_id, id),
  CONSTRAINT channel_listings_channel_fk
    FOREIGN KEY (organization_id, channel_id) REFERENCES channels(organization_id, id),
  CONSTRAINT channel_listings_org_created_by_fk
    FOREIGN KEY (organization_id, created_by) REFERENCES memberships(organization_id, user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS channel_listings_external_sku_uq
  ON channel_listings (organization_id, channel_id, lower(external_sku))
  WHERE deleted_at IS NULL AND external_sku IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS channel_listings_external_product_uq
  ON channel_listings (organization_id, channel_id, lower(external_product_id))
  WHERE deleted_at IS NULL AND external_product_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS channel_listings_external_product_sku_uq
  ON channel_listings (organization_id, channel_id, lower(external_product_id), lower(external_sku))
  WHERE deleted_at IS NULL AND external_product_id IS NOT NULL AND external_sku IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS channel_listings_variant_channel_uq
  ON channel_listings (organization_id, variant_id, channel_id)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS channel_listings_variant_idx
  ON channel_listings (organization_id, variant_id, channel_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS channel_listings_channel_status_idx
  ON channel_listings (organization_id, channel_id, sync_status) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS catalog_saved_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
  filters JSONB NOT NULL CHECK (jsonb_typeof(filters) = 'object'),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, id),
  CONSTRAINT catalog_saved_queries_org_created_by_fk
    FOREIGN KEY (organization_id, created_by) REFERENCES memberships(organization_id, user_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS catalog_saved_queries_name_uq
  ON catalog_saved_queries (organization_id, lower(name));

CREATE TABLE IF NOT EXISTS catalog_bulk_previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  idempotency_key TEXT NOT NULL CHECK (length(trim(idempotency_key)) BETWEEN 1 AND 200),
  payload_hash TEXT NOT NULL,
  result JSONB,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, idempotency_key),
  CONSTRAINT catalog_bulk_previews_org_created_by_fk
    FOREIGN KEY (organization_id, created_by) REFERENCES memberships(organization_id, user_id)
);
CREATE INDEX IF NOT EXISTS catalog_bulk_previews_created_idx
  ON catalog_bulk_previews (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS products_search_name_idx
  ON products (organization_id, lower(name)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS variants_search_sku_idx
  ON variants (organization_id, lower(sku)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS variants_search_barcode_idx
  ON variants (organization_id, barcode) WHERE deleted_at IS NULL AND barcode IS NOT NULL;