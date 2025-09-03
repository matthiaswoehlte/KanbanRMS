/*
  # Create resources table

  1. New Tables
    - `resources`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `picture` (text, optional - URL to image)
      - `resource_type_id` (uuid, foreign key to resource_types)
      - `resource_status_id` (uuid, foreign key to resource_status)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `resources` table
    - Add policies for all CRUD operations for authenticated and anon users

  3. Foreign Keys
    - Links to resource_types and resource_status tables
*/

CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  picture text DEFAULT '',
  resource_type_id uuid REFERENCES resource_types(id) ON DELETE SET NULL,
  resource_status_id uuid REFERENCES resource_status(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can read all resources"
  ON resources
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert resources"
  ON resources
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update resources"
  ON resources
  FOR UPDATE
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can delete resources"
  ON resources
  FOR DELETE
  TO authenticated, anon
  USING (true);