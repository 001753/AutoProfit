CREATE TABLE IF NOT EXISTS permissions (
  name TEXT PRIMARY KEY,
  description TEXT NOT NULL
);

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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'role_permissions_permission_fkey'
  ) THEN
    ALTER TABLE role_permissions
      ADD CONSTRAINT role_permissions_permission_fkey
      FOREIGN KEY (permission) REFERENCES permissions(name) ON DELETE CASCADE;
  END IF;
END $$;

INSERT INTO role_permissions (role_name, permission)
SELECT role_name, permission
FROM (VALUES
  ('Owner', 'organization:read'), ('Owner', 'organization:manage'), ('Owner', 'members:read'), ('Owner', 'members:manage'), ('Owner', 'sessions:read'), ('Owner', 'sessions:revoke'), ('Owner', 'consent:read'), ('Owner', 'consent:manage'), ('Owner', 'purchase_orders:approve'), ('Owner', 'journal:post'), ('Owner', 'financial_data:export'), ('Owner', 'dashboard:read'), ('Owner', 'catalog:read'), ('Owner', 'catalog:manage'),
  ('Admin', 'organization:read'), ('Admin', 'organization:manage'), ('Admin', 'members:read'), ('Admin', 'members:manage'), ('Admin', 'sessions:read'), ('Admin', 'sessions:revoke'), ('Admin', 'consent:read'), ('Admin', 'consent:manage'), ('Admin', 'purchase_orders:approve'), ('Admin', 'journal:post'), ('Admin', 'financial_data:export'), ('Admin', 'dashboard:read'), ('Admin', 'catalog:read'), ('Admin', 'catalog:manage'),
  ('Finance', 'organization:read'), ('Finance', 'members:read'), ('Finance', 'sessions:read'), ('Finance', 'sessions:revoke'), ('Finance', 'consent:read'), ('Finance', 'consent:manage'), ('Finance', 'journal:post'), ('Finance', 'financial_data:export'), ('Finance', 'dashboard:read'), ('Finance', 'catalog:read'),
  ('Purchasing', 'organization:read'), ('Purchasing', 'sessions:read'), ('Purchasing', 'consent:read'), ('Purchasing', 'purchase_orders:approve'), ('Purchasing', 'dashboard:read'), ('Purchasing', 'catalog:read'), ('Purchasing', 'catalog:manage'),
  ('Operations', 'organization:read'), ('Operations', 'sessions:read'), ('Operations', 'consent:read'), ('Operations', 'dashboard:read'), ('Operations', 'catalog:read'), ('Operations', 'catalog:manage'),
  ('Warehouse', 'organization:read'), ('Warehouse', 'sessions:read'), ('Warehouse', 'consent:read'), ('Warehouse', 'dashboard:read'), ('Warehouse', 'catalog:read'), ('Warehouse', 'catalog:manage'),
  ('Sales', 'organization:read'), ('Sales', 'sessions:read'), ('Sales', 'consent:read'), ('Sales', 'dashboard:read'), ('Sales', 'catalog:read'),
  ('Viewer', 'organization:read'), ('Viewer', 'consent:read'), ('Viewer', 'dashboard:read'), ('Viewer', 'catalog:read')
) AS seed(role_name, permission)
ON CONFLICT DO NOTHING;