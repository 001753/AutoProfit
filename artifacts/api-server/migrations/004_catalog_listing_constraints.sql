DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'channel_listings_identity_required'
  ) THEN
    ALTER TABLE channel_listings DROP CONSTRAINT channel_listings_identity_required;
  END IF;
END $$;

ALTER TABLE channel_listings
  ADD CONSTRAINT channel_listings_identity_required CHECK (
    COALESCE(NULLIF(trim(external_product_id), ''), NULLIF(trim(external_sku), '')) IS NOT NULL
  );