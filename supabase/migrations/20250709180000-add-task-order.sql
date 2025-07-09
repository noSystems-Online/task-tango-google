-- Migration: Add order field to tasks for drag-and-drop sorting
ALTER TABLE tasks ADD COLUMN "order" integer NOT NULL DEFAULT 0;

-- Optional: If you want to initialize the order based on current position within each column
-- (Assumes tasks have a column_id field)
-- This will set the order field to the row_number within each column
UPDATE tasks SET "order" = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY column_id ORDER BY created_at) - 1 as rn
  FROM tasks
) sub
WHERE tasks.id = sub.id;

-- Add index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_tasks_column_order ON tasks (column_id, "order");
