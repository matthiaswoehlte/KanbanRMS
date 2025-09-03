/*
  # Add thumbnail field to resources table

  1. Changes
    - Add `thumbnail` column to `resources` table for storing 43x43px thumbnails
    - Column is optional (nullable) to support existing records

  2. Notes
    - Existing resources will have null thumbnails initially
    - Thumbnails will be generated when resources are updated via modals
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resources' AND column_name = 'thumbnail'
  ) THEN
    ALTER TABLE resources ADD COLUMN thumbnail text DEFAULT '';
  END IF;
END $$;