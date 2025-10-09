-- Migration: Add class_code column to profiles table
-- This is required for tracking which students belong to which admin's class
-- Run this in your Supabase SQL Editor

-- Add the class_code column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS class_code text;

-- Create an index on class_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_class_code ON public.profiles(class_code);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name = 'class_code';

