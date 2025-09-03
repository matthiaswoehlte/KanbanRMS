/*
  # Create resource_types table

  1. New Tables
    - `resource_types`
      - `id` (uuid, primary key)
      - `type` (text, unique, not null)
      - `color` (text, not null)
      - `is_staff` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `resource_types` table
    - Add policies for authenticated and anon users to manage resource types
*/

CREATE TABLE IF NOT EXISTS resource_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text UNIQUE NOT NULL,
  color text NOT NULL,
  is_staff boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resource_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all resource types"
  ON resource_types
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert resource types"
  ON resource_types
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update resource types"
  ON resource_types
  FOR UPDATE
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can delete resource types"
  ON resource_types
  FOR DELETE
  TO authenticated, anon
  USING (true);