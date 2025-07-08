-- Migration: Add soft delete support to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS deleted boolean NOT NULL DEFAULT false;

-- Optional: Backfill existing rows (should already be false by default)
UPDATE public.projects SET deleted = false WHERE deleted IS NULL;
