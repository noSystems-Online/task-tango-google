-- Migration: Add soft delete support to tasks table
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS deleted boolean NOT NULL DEFAULT false;

-- Optional: Backfill existing rows (should already be false by default)
UPDATE public.tasks SET deleted = false WHERE deleted IS NULL;

-- (If you want to support deleted_at timestamp, add this too:)
-- ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
