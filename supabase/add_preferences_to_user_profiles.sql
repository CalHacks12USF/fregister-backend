-- Add preference fields to user_profiles table

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS soft_preferences TEXT,
ADD COLUMN IF NOT EXISTS hard_preferences TEXT;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.soft_preferences IS 'User soft preferences (flexible dietary preferences)';
COMMENT ON COLUMN user_profiles.hard_preferences IS 'User hard preferences (strict dietary restrictions)';
