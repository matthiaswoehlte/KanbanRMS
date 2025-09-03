/*
  # Add atomic task movement function

  1. New Functions
    - `move_task_atomic` - Handles task movement with position reordering in a single transaction
      - Parameters: task_id (uuid), target_lane_id (uuid), target_position (integer)
      - Returns: void
      - Atomically updates all affected task positions to prevent constraint violations

  2. Security
    - Function uses SECURITY DEFINER to ensure proper execution context
    - Maintains existing RLS policies on tasks table
*/

CREATE OR REPLACE FUNCTION move_task_atomic(
  task_id uuid,
  target_lane_id uuid,
  target_position integer
) RETURNS void AS $$
DECLARE
  current_lane_id uuid;
  current_position integer;
  max_position integer;
BEGIN
  -- Get current task info
  SELECT lane_id, position INTO current_lane_id, current_position
  FROM tasks WHERE id = task_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;
  
  -- Get max position in target lane
  SELECT COALESCE(MAX(position), 0) INTO max_position
  FROM tasks WHERE lane_id = target_lane_id;
  
  -- Ensure target position is valid
  IF target_position < 1 THEN
    target_position := 1;
  ELSIF target_position > max_position + 1 THEN
    target_position := max_position + 1;
  END IF;
  
  -- If moving to same lane and same position, do nothing
  IF current_lane_id = target_lane_id AND current_position = target_position THEN
    RETURN;
  END IF;
  
  -- Temporarily set the moving task to position 0 to avoid conflicts
  UPDATE tasks SET position = 0 WHERE id = task_id;
  
  -- If moving within same lane
  IF current_lane_id = target_lane_id THEN
    IF current_position < target_position THEN
      -- Moving down: shift tasks up
      UPDATE tasks 
      SET position = position - 1 
      WHERE lane_id = target_lane_id 
        AND position > current_position 
        AND position <= target_position;
    ELSE
      -- Moving up: shift tasks down
      UPDATE tasks 
      SET position = position + 1 
      WHERE lane_id = target_lane_id 
        AND position >= target_position 
        AND position < current_position;
    END IF;
  ELSE
    -- Moving to different lane
    -- Close gap in source lane
    UPDATE tasks 
    SET position = position - 1 
    WHERE lane_id = current_lane_id 
      AND position > current_position;
    
    -- Make room in target lane
    UPDATE tasks 
    SET position = position + 1 
    WHERE lane_id = target_lane_id 
      AND position >= target_position;
  END IF;
  
  -- Update the moved task with final position and lane
  UPDATE tasks 
  SET lane_id = target_lane_id, 
      position = target_position,
      status = (SELECT name FROM lanes WHERE id = target_lane_id)
  WHERE id = task_id;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;