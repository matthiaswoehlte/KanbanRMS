/*
  # Add department field to resources table

  1. Changes
    - Add `department_id` column to `resources` table
    - Add foreign key constraint to `departments` table
    - Allow NULL values since only staff resources need departments

  2. Security
    - No changes to RLS policies needed
*/

ALTER TABLE resources 
ADD COLUMN department_id uuid REFERENCES departments(id) ON DELETE SET NULL;