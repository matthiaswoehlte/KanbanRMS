/*
  # Add short_name column to shifts table

  1. Changes
    - Add `short_name` column to shifts table
    - Set as required field (NOT NULL)
    - Add performance index for queries
    - Set default empty string for existing records

  2. Notes
    - No unique constraint added (can be added later if needed)
    - Existing records will have empty short_name that needs to be populated
*/

-- Add short_name column to shifts table
ALTER TABLE public.shifts 
ADD COLUMN IF NOT EXISTS short_name text NOT NULL DEFAULT '';

-- Add index for performance (non-unique)
CREATE INDEX IF NOT EXISTS shifts_short_name_idx ON public.shifts USING btree (short_name);