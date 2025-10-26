-- Create inventory_snapshots table
-- This table stores inventory data received from the ML service

CREATE TABLE IF NOT EXISTS inventory_snapshots (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  inventory JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_timestamp 
ON inventory_snapshots(timestamp DESC);

-- Create an index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_created_at 
ON inventory_snapshots(created_at DESC);

-- Add a trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_snapshots_updated_at
BEFORE UPDATE ON inventory_snapshots
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE inventory_snapshots IS 'Stores inventory snapshots received from ML service';
COMMENT ON COLUMN inventory_snapshots.id IS 'Primary key, auto-incrementing';
COMMENT ON COLUMN inventory_snapshots.timestamp IS 'Timestamp when the inventory was recorded by ML service';
COMMENT ON COLUMN inventory_snapshots.inventory IS 'JSON array of inventory items with name and quantity';
COMMENT ON COLUMN inventory_snapshots.created_at IS 'When this record was created in the database';
COMMENT ON COLUMN inventory_snapshots.updated_at IS 'When this record was last updated';
