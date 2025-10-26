-- Create user_profiles table
-- This table tracks user profile information and first login status

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_profile_timestamp();

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'Stores user profile information';
COMMENT ON COLUMN user_profiles.id IS 'Unique identifier for the profile record';
COMMENT ON COLUMN user_profiles.user_id IS 'User ID from Supabase auth (unique)';
COMMENT ON COLUMN user_profiles.email IS 'User email address';
COMMENT ON COLUMN user_profiles.name IS 'User display name';
COMMENT ON COLUMN user_profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN user_profiles.created_at IS 'When the profile was first created (first login)';
COMMENT ON COLUMN user_profiles.updated_at IS 'When the profile was last updated';
