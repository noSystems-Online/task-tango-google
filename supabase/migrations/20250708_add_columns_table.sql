-- Migration: Add columns table and column_id to tasks for Kanban normalization

-- 1. Create columns table
CREATE TABLE public.columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Add column_id to tasks table
ALTER TABLE public.tasks
ADD COLUMN column_id UUID REFERENCES public.columns(id) ON DELETE CASCADE;

-- 3. (Optional) You may want to migrate existing tasks to assign them to columns, and create default columns for existing projects.
-- Example: Insert default columns for each project and update tasks accordingly.
