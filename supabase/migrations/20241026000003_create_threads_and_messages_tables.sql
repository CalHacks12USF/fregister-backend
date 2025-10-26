-- Create threads table
-- This table stores conversation threads (chat sessions)

CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
-- This table stores individual messages within threads

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_created_at ON threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_updated_at ON threads(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);

-- Create trigger to update updated_at timestamp for threads
CREATE OR REPLACE FUNCTION update_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_threads_updated_at
BEFORE UPDATE ON threads
FOR EACH ROW
EXECUTE FUNCTION update_thread_timestamp();

-- Create trigger to update updated_at timestamp for messages
CREATE OR REPLACE FUNCTION update_message_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_message_timestamp();

-- Create trigger to update thread's updated_at when a message is added
CREATE OR REPLACE FUNCTION update_thread_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE threads SET updated_at = NOW() WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_on_new_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_thread_on_message();

-- Add comments for documentation
COMMENT ON TABLE threads IS 'Stores conversation threads (chat sessions)';
COMMENT ON COLUMN threads.id IS 'Unique identifier for the thread';
COMMENT ON COLUMN threads.title IS 'Optional title for the thread';
COMMENT ON COLUMN threads.user_id IS 'ID of the user who owns this thread';
COMMENT ON COLUMN threads.created_at IS 'When the thread was created';
COMMENT ON COLUMN threads.updated_at IS 'When the thread was last updated (auto-updated on message insert)';

COMMENT ON TABLE messages IS 'Stores individual messages within threads';
COMMENT ON COLUMN messages.id IS 'Unique identifier for the message';
COMMENT ON COLUMN messages.thread_id IS 'ID of the thread this message belongs to';
COMMENT ON COLUMN messages.role IS 'Role of the message sender: user, assistant, or system';
COMMENT ON COLUMN messages.content IS 'The actual message content';
COMMENT ON COLUMN messages.metadata IS 'Optional JSON metadata (e.g., model info, tokens)';
COMMENT ON COLUMN messages.created_at IS 'When the message was created';
COMMENT ON COLUMN messages.updated_at IS 'When the message was last updated';
