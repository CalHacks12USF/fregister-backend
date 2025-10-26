export interface InventorySnapshot {
  id: string;
  timestamp: string;
  inventory: Record<string, unknown>;
  created_at: string;
}
