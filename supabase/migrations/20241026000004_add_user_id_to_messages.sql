-- Add user_id column to messages table
-- This allows tracking which user sent each message

ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Create index for faster user-based queries
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);

-- Add comment for documentation
COMMENT ON COLUMN messages.user_id IS 'ID of the user who created this message';
