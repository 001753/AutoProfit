DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'memberships_org_user_uq'
  ) THEN
    ALTER TABLE memberships ADD CONSTRAINT memberships_org_user_uq UNIQUE (organization_id, user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS catalog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (organization_id, id),
  CONSTRAINT catalog_categories_org_created_by_fk
    FOREIGN KEY (organization_id, created_by) REFERENCES memberships(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS catalog_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (organization_id, id),
  CONSTRAINT catalog_brands_org_created_by_fk
    FOREIGN KEY (organization_id, created_by) REFERENCES memberships(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS catalog_tax_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
  code TEXT NOT NULL CHECK (length(trim(code)) BETWEEN 1 AND 40),
  rate NUMERIC(7, 4) NOT NULL DEFAULT 0 CHECK (rate >= 0 AND rate <= 100),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (organization_id, id),
  CONSTRAINT catalog_tax_classes_org_created_by_fk
    FOREIGN KEY (organization_id, created_by) REFERENCES memberships(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 240),
  description TEXT,
  category_id UUID,
  brand_id UUID,
  tax_class_id UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (organization_id, id),
  CONSTRAINT products_category_fk FOREIGN KEY (organization_id, category_id)
    REFERENCES catalog_categories(organization_id, id),
  CONSTRAINT products_brand_fk FOREIGN KEY (organization_id, brand_id)
    REFERENCES catalog_brands(organization_id, id),
  CONSTRAINT products_tax_class_fk FOREIGN KEY (organization_id, tax_class_id)
    REFERENCES catalog_tax_classes(organization_id, id),
  CONSTRAINT products_org_created_by_fk FOREIGN KEY (organization_id, created_by)
    REFERENCES memberships(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  product_id UUID NOT NULL,
  sku TEXT NOT NULL CHECK (length(trim(sku)) BETWEEN 1 AND 100),
  barcode TEXT CHECK (barcode IS NULL OR length(trim(barcode)) BETWEEN 1 AND 80),
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(attributes) = 'object'),
  cost_method TEXT NOT NULL DEFAULT 'AVERAGE' CHECK (cost_method IN ('FIFO', 'AVERAGE', 'STANDARD')),
  standard_cost NUMERIC(19, 4) CHECK (standard_cost IS NULL OR standard_cost >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (organization_id, id),
  CONSTRAINT variants_product_fk FOREIGN KEY (organization_id, product_id)
    REFERENCES products(organization_id, id)
    ON DELETE RESTRICT,
  CONSTRAINT variants_org_created_by_fk FOREIGN KEY (organization_id, created_by)
    REFERENCES memberships(organization_id, user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS catalog_categories_name_uq
  ON catalog_categories (organization_id, lower(name)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS catalog_brands_name_uq
  ON catalog_brands (organization_id, lower(name)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS catalog_tax_classes_code_uq
  ON catalog_tax_classes (organization_id, lower(code)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS products_name_uq
  ON products (organization_id, lower(name)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS variants_sku_uq
  ON variants (organization_id, lower(sku)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS variants_barcode_uq
  ON variants (organization_id, barcode) WHERE barcode IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS products_org_created_idx
  ON products (organization_id, created_at DESC, id DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS variants_product_created_idx
  ON variants (organization_id, product_id, created_at ASC, id ASC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS variants_org_sku_idx
  ON variants (organization_id, lower(sku)) WHERE deleted_at IS NULL;

INSERT INTO role_permissions (role_name, permission)
SELECT role_name, permission
FROM (VALUES
  ('Owner', 'catalog:read'), ('Owner', 'catalog:manage'),
  ('Admin', 'catalog:read'), ('Admin', 'catalog:manage'),
  ('Finance', 'catalog:read'),
  ('Purchasing', 'catalog:read'), ('Purchasing', 'catalog:manage'),
  ('Operations', 'catalog:read'), ('Operations', 'catalog:manage'),
  ('Warehouse', 'catalog:read'), ('Warehouse', 'catalog:manage'),
  ('Sales', 'catalog:read'),
  ('Viewer', 'catalog:read')
) AS permissions(role_name, permission)
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions rp
  WHERE rp.role_name = permissions.role_name AND rp.permission = permissions.permission
);