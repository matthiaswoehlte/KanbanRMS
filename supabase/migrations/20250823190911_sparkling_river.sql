/*
  # Create shifts table

  1. New Tables
    - `shifts`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null) - Shift name
      - `start_time` (time, not null) - Start time without date
      - `end_time` (time, not null) - End time without date
      - `is_full_day` (boolean, default false) - Whether this is a full day shift
      - `type` (text, not null) - Either 'presence' or 'absence'
      - `color` (text, not null) - Color for display purposes
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `shifts` table
    - Add policies for authenticated and anonymous users to manage shifts

  3. Constraints
    - Unique constraint on shift name
    - Check constraint to ensure type is either 'presence' or 'absence'
*/

CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  start_time time NOT NULL DEFAULT '09:00:00',
  end_time time NOT NULL DEFAULT '17:00:00',
  is_full_day boolean DEFAULT false,
  type text NOT NULL CHECK (type IN ('presence', 'absence')),
  color text NOT NULL DEFAULT '#10b981',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated and anonymous users
CREATE POLICY "Users can manage shifts"
  ON shifts
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Create index for better performance on name lookups
CREATE INDEX IF NOT EXISTS shifts_name_idx ON shifts (name);
CREATE INDEX IF NOT EXISTS shifts_type_idx ON shifts (type);