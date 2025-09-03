/*
  # Create position management functions

  1. New Functions
    - `increment_positions` - Updates task positions by incrementing them
    - `shift_positions_range` - Updates task positions within a range
  
  2. Purpose
    - These functions help manage task positions during drag and drop operations
    - They ensure atomic updates to prevent position conflicts
*/

-- Function to increment positions for tasks >= min_position
CREATE OR REPLACE FUNCTION increment_positions(
  lane_id_param uuid,
  min_position integer,
  increment integer
) RETURNS void AS $$
BEGIN
  UPDATE tasks 
  SET position = position + increment
  WHERE lane_id = lane_id_param 
    AND position >= min_position;
END;
$$ LANGUAGE plpgsql;

-- Function to shift positions within a range
CREATE OR REPLACE FUNCTION shift_positions_range(
  lane_id_param uuid,
  min_position integer,
  max_position integer,
  increment integer
) RETURNS void AS $$
BEGIN
  UPDATE tasks 
  SET position = position + increment
  WHERE lane_id = lane_id_param 
    AND position >= min_position 
    AND position <= max_position;
END;
$$ LANGUAGE plpgsql;