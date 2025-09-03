/*
  # Create Kanban Project Management System

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `owner_id` (uuid, references resources)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `lanes`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `name` (text, not null)
      - `position` (integer, not null)
      - `is_deletable` (boolean, default true)
      - `created_at` (timestamptz)
    
    - `tasks`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `lane_id` (uuid, references lanes)
      - `title` (text, not null)
      - `description` (text)
      - `status` (text, not null)
      - `resource_id` (uuid, references resources, nullable)
      - `position` (integer, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (text, not null)
      - `last_project_id` (uuid, references projects, nullable)
      - `preferences` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage data

  3. Constraints and Indexes
    - Unique constraints for lane positions within projects
    - Unique constraints for task positions within lanes
    - Indexes for performance optimization
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  owner_id uuid REFERENCES resources(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lanes table
CREATE TABLE IF NOT EXISTS lanes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  position integer NOT NULL,
  is_deletable boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, position),
  UNIQUE(project_id, name)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  lane_id uuid NOT NULL REFERENCES lanes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL,
  resource_id uuid REFERENCES resources(id) ON DELETE SET NULL,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(lane_id, position)
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  last_project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lanes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can manage projects"
  ON projects
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Create policies for lanes
CREATE POLICY "Users can manage lanes"
  ON lanes
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Create policies for tasks
CREATE POLICY "Users can manage tasks"
  ON tasks
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Create policies for user_preferences
CREATE POLICY "Users can manage their preferences"
  ON user_preferences
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS projects_owner_id_idx ON projects (owner_id);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects (created_at DESC);

CREATE INDEX IF NOT EXISTS lanes_project_id_idx ON lanes (project_id);
CREATE INDEX IF NOT EXISTS lanes_position_idx ON lanes (project_id, position);

CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks (project_id);
CREATE INDEX IF NOT EXISTS tasks_lane_id_idx ON tasks (lane_id);
CREATE INDEX IF NOT EXISTS tasks_resource_id_idx ON tasks (resource_id);
CREATE INDEX IF NOT EXISTS tasks_position_idx ON tasks (lane_id, position);

CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences (user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize default lanes for a project
CREATE OR REPLACE FUNCTION initialize_default_lanes(project_id_param uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO lanes (project_id, name, position, is_deletable) VALUES
    (project_id_param, 'todo', 1, false),
    (project_id_param, 'doing', 2, true),
    (project_id_param, 'review', 3, true),
    (project_id_param, 'done', 4, true);
END;
$$ LANGUAGE plpgsql;

-- Function to reorder positions after deletion
CREATE OR REPLACE FUNCTION reorder_positions_after_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Reorder lane positions
  IF TG_TABLE_NAME = 'lanes' THEN
    UPDATE lanes 
    SET position = position - 1 
    WHERE project_id = OLD.project_id AND position > OLD.position;
  END IF;
  
  -- Reorder task positions
  IF TG_TABLE_NAME = 'tasks' THEN
    UPDATE tasks 
    SET position = position - 1 
    WHERE lane_id = OLD.lane_id AND position > OLD.position;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for position reordering
CREATE TRIGGER reorder_lanes_after_deletion
  AFTER DELETE ON lanes
  FOR EACH ROW EXECUTE FUNCTION reorder_positions_after_deletion();

CREATE TRIGGER reorder_tasks_after_deletion
  AFTER DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION reorder_positions_after_deletion();

-- Function to migrate tasks when lane is deleted
CREATE OR REPLACE FUNCTION migrate_tasks_on_lane_deletion()
RETURNS TRIGGER AS $$
DECLARE
  first_lane_id uuid;
  max_position integer;
BEGIN
  -- Find the first lane in the project (position = 1)
  SELECT id INTO first_lane_id
  FROM lanes 
  WHERE project_id = OLD.project_id AND position = 1
  LIMIT 1;
  
  IF first_lane_id IS NOT NULL AND first_lane_id != OLD.id THEN
    -- Get the current max position in the first lane
    SELECT COALESCE(MAX(position), 0) INTO max_position
    FROM tasks 
    WHERE lane_id = first_lane_id;
    
    -- Move all tasks from deleted lane to first lane
    UPDATE tasks 
    SET lane_id = first_lane_id,
        position = max_position + ROW_NUMBER() OVER (ORDER BY position),
        status = (SELECT name FROM lanes WHERE id = first_lane_id)
    WHERE lane_id = OLD.id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for task migration
CREATE TRIGGER migrate_tasks_before_lane_deletion
  BEFORE DELETE ON lanes
  FOR EACH ROW EXECUTE FUNCTION migrate_tasks_on_lane_deletion();