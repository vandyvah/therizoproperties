-- Add is_featured column to properties table
ALTER TABLE public.properties ADD COLUMN is_featured boolean NOT NULL DEFAULT false;