/*
  # Add price_string column to featured_services

  1. Changes
    - Add `price_string` column to `featured_services` table
    - This column stores the price display text (e.g., "2 280 Kč", "od 16 000 Kč")
    - Default empty string, nullable for backwards compat

  2. Notes
    - Existing rows will get empty string default
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'featured_services' AND column_name = 'price_string'
  ) THEN
    ALTER TABLE featured_services ADD COLUMN price_string text NOT NULL DEFAULT '';
  END IF;
END $$;
