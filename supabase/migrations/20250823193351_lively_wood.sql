/*
  # Create shift planning system

  1. New Tables
    - `shift_calendars`
      - `id` (uuid, primary key)
      - `year` (integer)
      - `month` (integer) 
      - `created_at` (timestamp)
    - `shift_assignments`
      - `id` (uuid, primary key)
      - `calendar_id` (uuid, foreign key to shift_calendars)
      - `resource_id` (uuid, foreign key to resources)
      - `day` (integer, 1-31)
      - `shift_id` (uuid, foreign key to shifts, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage data

  3. Constraints
    - Unique constraint on year/month combination
    - Unique constraint on calendar_id/resource_id/day combination
*/

-- Create shift_calendars table
CREATE TABLE IF NOT EXISTS shift_calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  created_at timestamptz DEFAULT now(),
  UNIQUE(year, month)
);

-- Create shift_assignments table
CREATE TABLE IF NOT EXISTS shift_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id uuid NOT NULL REFERENCES shift_calendars(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  day integer NOT NULL CHECK (day >= 1 AND day <= 31),
  shift_id uuid REFERENCES shifts(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(calendar_id, resource_id, day)
);

-- Enable RLS
ALTER TABLE shift_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for shift_calendars
CREATE POLICY "Users can manage shift calendars"
  ON shift_calendars
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Create policies for shift_assignments
CREATE POLICY "Users can manage shift assignments"
  ON shift_assignments
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS shift_calendars_year_month_idx ON shift_calendars (year, month);
CREATE INDEX IF NOT EXISTS shift_assignments_calendar_id_idx ON shift_assignments (calendar_id);
CREATE INDEX IF NOT EXISTS shift_assignments_resource_id_idx ON shift_assignments (resource_id);
CREATE INDEX IF NOT EXISTS shift_assignments_day_idx ON shift_assignments (day);