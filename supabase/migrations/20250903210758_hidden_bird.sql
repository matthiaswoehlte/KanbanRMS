/*
  # Disable lane triggers that cause window function errors

  1. Changes
    - Drop triggers on lanes table that use window functions
    - This allows simple DELETE operations without complex trigger logic

  2. Security
    - RLS policies remain unchanged
    - Only trigger functions are removed
*/

-- Drop the triggers that cause window function errors
DROP TRIGGER IF EXISTS migrate_tasks_before_lane_deletion ON lanes;
DROP TRIGGER IF EXISTS reorder_lanes_after_deletion ON lanes;

-- Drop the trigger functions if they exist
DROP FUNCTION IF EXISTS migrate_tasks_on_lane_deletion();
DROP FUNCTION IF EXISTS reorder_positions_after_deletion();