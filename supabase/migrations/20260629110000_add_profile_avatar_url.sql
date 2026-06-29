-- Add optional custom profile photo URL for seekers
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
