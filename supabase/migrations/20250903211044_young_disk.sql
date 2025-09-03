/*
  # Remove all project and kanban triggers

  1. Remove Triggers
    - Remove all triggers from lanes table
    - Remove all triggers from tasks table
    - Remove all trigger functions
  2. Add Cascade Deletes
    - Add CASCADE to foreign key constraints
  3. Simplify Operations
    - All operations will use simple CRUD commands
    - No automatic position management
    - Manual position handling in application code
*/

-- Drop all triggers first
DROP TRIGGER IF EXISTS migrate_tasks_before_lane_deletion ON lanes;
DROP TRIGGER IF EXISTS reorder_lanes_after_deletion ON lanes;
DROP TRIGGER IF EXISTS reorder_tasks_after_deletion ON tasks;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;

-- Drop trigger functions
DROP FUNCTION IF EXISTS migrate_tasks_on_lane_deletion();
DROP FUNCTION IF EXISTS reorder_positions_after_deletion();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Remove existing foreign key constraints and add CASCADE
ALTER TABLE lanes DROP CONSTRAINT IF EXISTS lanes_project_id_fkey;
ALTER TABLE lanes ADD CONSTRAINT lanes_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_lane_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_lane_id_fkey 
  FOREIGN KEY (lane_id) REFERENCES lanes(id) ON DELETE CASCADE;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_resource_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_resource_id_fkey 
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE SET NULL;