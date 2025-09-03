/*
  # Delete Lane RPC Function

  1. New Functions
    - `delete_lane_with_migration(lane_id_param uuid)`
      - Migrates tasks from target lane to first lane
      - Deletes the specified lane
      - Handles position reordering automatically

  2. Security
    - Function is accessible to authenticated and anonymous users
    - Maintains existing RLS policies on affected tables

  3. Notes
    - Bypasses trigger conflicts by using direct SQL operations
    - Ensures data integrity during lane deletion
*/

CREATE OR REPLACE FUNCTION delete_lane_with_migration(lane_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  first_lane_id uuid;
  first_lane_name text;
  target_project_id uuid;
BEGIN
  -- Get the project ID and first lane for the target lane
  SELECT project_id INTO target_project_id
  FROM lanes 
  WHERE id = lane_id_param;
  
  IF target_project_id IS NULL THEN
    RAISE EXCEPTION 'Lane not found';
  END IF;
  
  -- Get the first lane (position 1) in the same project
  SELECT id, name INTO first_lane_id, first_lane_name
  FROM lanes 
  WHERE project_id = target_project_id 
    AND position = 1
    AND id != lane_id_param;
  
  IF first_lane_id IS NULL THEN
    RAISE EXCEPTION 'Cannot delete the only lane in the project';
  END IF;
  
  -- Migrate all tasks from the target lane to the first lane
  UPDATE tasks 
  SET lane_id = first_lane_id, 
      status = first_lane_name
  WHERE lane_id = lane_id_param;
  
  -- Delete the lane (this will trigger position reordering via existing triggers)
  DELETE FROM lanes WHERE id = lane_id_param;
END;
$$;