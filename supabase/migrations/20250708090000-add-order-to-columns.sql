-- Add 'order' field to columns table for column ordering
ALTER TABLE columns ADD COLUMN "order" integer NOT NULL DEFAULT 0;
