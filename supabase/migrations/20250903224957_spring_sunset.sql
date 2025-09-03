/*
  # Remove tasks position unique constraint

  1. Changes
    - Drop unique constraint `tasks_lane_id_position_key` from `tasks` table
    - This constraint was causing issues with task drag & drop functionality
    - Position ordering will still work but without strict uniqueness enforcement

  2. Impact
    - Tasks can now be moved freely without constraint violations
    - Application logic handles position management
*/

-- Drop the unique constraint on (lane_id, position)
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_lane_id_position_key;

-- Also drop the associated index if it exists
DROP INDEX IF EXISTS tasks_lane_id_position_key;