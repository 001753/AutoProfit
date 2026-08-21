DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'organizations_currency_format'
  ) THEN
    ALTER TABLE organizations
      ADD CONSTRAINT organizations_currency_format
      CHECK (btrim(default_currency) ~ '^[A-Z]{3}$');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'memberships_permissions_override_object'
  ) THEN
    ALTER TABLE memberships
      ADD CONSTRAINT memberships_permissions_override_object
      CHECK (jsonb_typeof(permissions_override) = 'object');
  END IF;
END $$;

INSERT INTO permissions (name, description) VALUES
  ('organization:read', 'View the active organization'),
  ('organization:manage', 'Manage organization settings'),
  ('members:read', 'View organization members'),
  ('members:manage', 'Manage organization memberships'),
  ('sessions:read', 'View own active sessions'),
  ('sessions:revoke', 'Revoke own sessions'),
  ('consent:read', 'View own consent history'),
  ('consent:manage', 'Grant or withdraw consent'),
  ('purchase_orders:approve', 'Approve purchase orders'),
  ('journal:post', 'Post journal entries'),
  ('financial_data:export', 'Export financial data'),
  ('dashboard:read', 'View dashboards'),
  ('catalog:read', 'View catalog data'),
  ('catalog:manage', 'Manage catalog data')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;