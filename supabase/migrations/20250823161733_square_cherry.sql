/*
  # Create departments table

  1. New Tables
    - `departments`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `supervisor` (text, not null)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `departments` table
    - Add policy for authenticated users to perform all operations
    - Add policy for anon users to perform all operations (for development)
*/

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  supervisor text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users
CREATE POLICY "Users can manage departments"
  ON departments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy for anon users (for development)
CREATE POLICY "Anon users can manage departments"
  ON departments
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);