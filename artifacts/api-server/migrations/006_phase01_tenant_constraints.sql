DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'organizations_created_by_fkey'
  ) THEN
    ALTER TABLE organizations
      ADD CONSTRAINT organizations_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES users(id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sessions_user_organization_fkey'
  ) THEN
    ALTER TABLE sessions
      ADD CONSTRAINT sessions_user_organization_fkey
      FOREIGN KEY (user_id, organization_id)
      REFERENCES memberships(user_id, organization_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'consents_user_organization_fkey'
  ) THEN
    ALTER TABLE consents
      ADD CONSTRAINT consents_user_organization_fkey
      FOREIGN KEY (user_id, organization_id)
      REFERENCES memberships(user_id, organization_id);
  END IF;
END $$;