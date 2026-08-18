-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Adds onboarding tracking fields to the profiles table

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills_background TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_submitted_at TIMESTAMPTZ;

-- Mark existing seed youth as having completed onboarding (so they don't see it)
UPDATE profiles SET onboarding_completed = true WHERE role = 'youth' AND email IN ('diane@youth.rw', 'eric@youth.rw');
