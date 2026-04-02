/*
  # Add English Description to Planned Holidays

  1. Changes
    - Add `description_en` column to `planned_holidays` table
    - This column stores the English version of the holiday description
    - If not provided, the Czech description will be used as fallback

  2. Column Details
    - `description_en` (text, nullable) - English version of the description
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'planned_holidays' AND column_name = 'description_en'
  ) THEN
    ALTER TABLE planned_holidays ADD COLUMN description_en text;
  END IF;
END $$;