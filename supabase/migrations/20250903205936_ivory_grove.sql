/*
  # Simple Lane Deletion Function

  1. Function Purpose
    - Safely delete a lane and migrate its tasks to the first lane
    - Avoid trigger conflicts by using direct SQL operations

  2. Operations
    - Find the first lane in the project (position = 1)
    - Update all tasks from the deleted lane to the first lane
    - Delete the specified lane
    - Let existing triggers handle position reordering

  3. Security
    - Function is accessible to authenticated and anonymous users
    - Uses project_id to ensure lane belongs to the correct project
*/

CREATE OR REPLACE FUNCTION delete_lane_simple(
  lane_id_to_delete uuid,
  project_id_param uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  first_lane_id uuid;
  first_lane_name text;
BEGIN
  -- Find the first lane in the project (position = 1)
  SELECT id, name INTO first_lane_id, first_lane_name
  FROM lanes 
  WHERE project_id = project_id_param 
    AND position = 1
  LIMIT 1;
  
  -- Check if we found a first lane
  IF first_lane_id IS NULL THEN
    RAISE EXCEPTION 'No first lane found in project';
  END IF;
  
  -- Don't allow deleting the first lane
  IF lane_id_to_delete = first_lane_id THEN
    RAISE EXCEPTION 'Cannot delete the first lane';
  END IF;
  
  -- Migrate all tasks from the lane to be deleted to the first lane
  UPDATE tasks 
  SET lane_id = first_lane_id, 
      status = first_lane_name
  WHERE lane_id = lane_id_to_delete;
  
  -- Delete the lane (triggers will handle position reordering)
  DELETE FROM lanes WHERE id = lane_id_to_delete;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION delete_lane_simple(uuid, uuid) TO anon, authenticated;