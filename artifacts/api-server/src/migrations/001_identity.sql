CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 160),
  business_type TEXT,
  default_currency CHAR(3) NOT NULL DEFAULT 'IDR',
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  coa_template TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 160),
  phone TEXT,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_failed_login_attempts_nonnegative'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_failed_login_attempts_nonnegative
      CHECK (failed_login_attempts >= 0);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS users_lockout_idx ON users (locked_until)
  WHERE locked_until IS NOT NULL;

CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  role TEXT NOT NULL CHECK (role IN ('Owner', 'Admin', 'Finance', 'Purchasing', 'Operations', 'Warehouse', 'Sales', 'Viewer')),
  permissions_override JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (user_id, organization_id)
);
CREATE INDEX IF NOT EXISTS memberships_org_idx ON memberships (organization_id, status);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  refresh_token_hash TEXT NOT NULL,
  device_name TEXT NOT NULL DEFAULT 'unknown',
  user_agent TEXT,
  ip INET,
  expires_at TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id, revoked_at, expires_at);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS password_reset_lookup_idx ON password_reset_tokens (token_hash, expires_at, used_at);

CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  policy_type TEXT NOT NULL CHECK (policy_type IN ('terms_of_service', 'privacy_policy', 'optional_processing')),
  policy_version TEXT NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  withdrawn_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'web',
  UNIQUE (user_id, organization_id, policy_type, policy_version)
);
CREATE INDEX IF NOT EXISTS consent_current_idx ON consents (user_id, organization_id, policy_type, withdrawn_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  before JSONB,
  after JSONB,
  ip INET,
  source TEXT NOT NULL DEFAULT 'api',
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_org_idx ON audit_logs (organization_id, created_at DESC);

CREATE TABLE IF NOT EXISTS roles (
  name TEXT PRIMARY KEY,
  description TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS role_permissions (
  role_name TEXT NOT NULL REFERENCES roles(name) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  PRIMARY KEY (role_name, permission)
);

INSERT INTO roles (name, description) VALUES
  ('Owner', 'Pemilik organisasi dan seluruh akses'),
  ('Admin', 'Administrator operasional'),
  ('Finance', 'Keuangan dan laporan finansial'),
  ('Purchasing', 'Pembelian dan persetujuan PO'),
  ('Operations', 'Operasional bisnis'),
  ('Warehouse', 'Gudang dan stok'),
  ('Sales', 'Penjualan'),
  ('Viewer', 'Akses baca')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO role_permissions (role_name, permission)
SELECT role_name, permission
FROM (VALUES
  ('Owner', 'organization:read'), ('Owner', 'organization:manage'), ('Owner', 'members:read'), ('Owner', 'members:manage'), ('Owner', 'sessions:read'), ('Owner', 'sessions:revoke'), ('Owner', 'consent:read'), ('Owner', 'consent:manage'), ('Owner', 'purchase_orders:approve'), ('Owner', 'journal:post'), ('Owner', 'financial_data:export'), ('Owner', 'dashboard:read'),
  ('Admin', 'organization:read'), ('Admin', 'organization:manage'), ('Admin', 'members:read'), ('Admin', 'members:manage'), ('Admin', 'sessions:read'), ('Admin', 'sessions:revoke'), ('Admin', 'consent:read'), ('Admin', 'consent:manage'), ('Admin', 'purchase_orders:approve'), ('Admin', 'journal:post'), ('Admin', 'financial_data:export'), ('Admin', 'dashboard:read'),
  ('Finance', 'organization:read'), ('Finance', 'members:read'), ('Finance', 'sessions:read'), ('Finance', 'sessions:revoke'), ('Finance', 'consent:read'), ('Finance', 'consent:manage'), ('Finance', 'journal:post'), ('Finance', 'financial_data:export'), ('Finance', 'dashboard:read'),
  ('Purchasing', 'organization:read'), ('Purchasing', 'sessions:read'), ('Purchasing', 'consent:read'), ('Purchasing', 'purchase_orders:approve'), ('Purchasing', 'dashboard:read'),
  ('Operations', 'organization:read'), ('Operations', 'sessions:read'), ('Operations', 'consent:read'), ('Operations', 'dashboard:read'),
  ('Warehouse', 'organization:read'), ('Warehouse', 'sessions:read'), ('Warehouse', 'consent:read'), ('Warehouse', 'dashboard:read'),
  ('Sales', 'organization:read'), ('Sales', 'sessions:read'), ('Sales', 'consent:read'), ('Sales', 'dashboard:read'),
  ('Viewer', 'organization:read'), ('Viewer', 'consent:read'), ('Viewer', 'dashboard:read')
) AS seed(role_name, permission)
ON CONFLICT DO NOTHING;