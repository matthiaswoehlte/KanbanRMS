/*
  # Create resource_status table

  1. New Tables
    - `resource_status`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `description` (text)
      - `color` (text, not null)
      - `is_active` (boolean, default true)
      - `usage_count` (integer, default 0)
      - `created_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `resource_status` table
    - Add policy for authenticated users to read all data
    - Add policy for authenticated users to insert/update/delete data

  3. Initial Data
    - Insert default resource status entries
*/

CREATE TABLE IF NOT EXISTS resource_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  color text NOT NULL,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resource_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all resource status"
  ON resource_status
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert resource status"
  ON resource_status
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update resource status"
  ON resource_status
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete resource status"
  ON resource_status
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert initial data
INSERT INTO resource_status (name, description, color, is_active, usage_count, created_at) VALUES
  ('Available', 'Resource is ready for assignment', '#10b981', true, 156, '2024-01-15T00:00:00Z'),
  ('Busy', 'Resource is currently assigned to a task', '#f59e0b', true, 89, '2024-01-15T00:00:00Z'),
  ('Maintenance', 'Resource is under maintenance or repair', '#ef4444', true, 23, '2024-01-15T00:00:00Z'),
  ('Unavailable', 'Resource is temporarily unavailable', '#6b7280', true, 12, '2024-01-15T00:00:00Z'),
  ('Reserved', 'Resource is reserved for future assignment', '#8b5cf6', false, 5, '2024-02-10T00:00:00Z')
ON CONFLICT (name) DO NOTHING;