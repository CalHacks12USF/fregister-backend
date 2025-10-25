# ML Connector Module

This module handles receiving inventory data from the ML service and storing it in Supabase.

## Setup

### 1. Create the Database Table

Run the SQL script in your Supabase SQL Editor:

```bash
# The SQL file is located at: supabase/create_inventory_snapshots_table.sql
```

Or run it directly in Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/create_inventory_snapshots_table.sql`
4. Click "Run"

### 2. Database Schema

The `inventory_snapshots` table has the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key, auto-incrementing |
| timestamp | TIMESTAMPTZ | When the inventory was recorded |
| inventory | JSONB | Array of inventory items (name, quantity) |
| created_at | TIMESTAMPTZ | When the record was created |
| updated_at | TIMESTAMPTZ | When the record was last updated |

## API Endpoints

### POST `/ml-connector/inventory`

Receives inventory data from the ML service and stores it in Supabase.

**Request Body:**

```json
{
  "timestamp": "2025-10-24T20:55:02Z",
  "inventory": [
    { "name": "apple", "quantity": 3 },
    { "name": "banana", "quantity": 1 },
    { "name": "yogurt", "quantity": 2 }
  ]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "timestamp": "2025-10-24T20:55:02Z",
    "inventory": [
      { "name": "apple", "quantity": 3 },
      { "name": "banana", "quantity": 1 },
      { "name": "yogurt", "quantity": 2 }
    ],
    "created_at": "2025-10-24T20:55:05Z"
  },
  "message": "Inventory data saved successfully"
}
```

### GET `/ml-connector/inventory/latest`

**⚡ Optimized for frequent reads** - Returns the most recent inventory snapshot with in-memory caching (60s TTL).

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "timestamp": "2025-10-24T20:55:02Z",
    "inventory": [
      { "name": "apple", "quantity": 3 },
      { "name": "banana", "quantity": 1 },
      { "name": "yogurt", "quantity": 2 }
    ],
    "created_at": "2025-10-24T20:55:05Z",
    "updated_at": "2025-10-24T20:55:05Z"
  },
  "cached": true
}
```

**Performance**: First request fetches from database, subsequent requests (within 60s) return from cache.

### GET `/ml-connector/inventory/history`

Returns paginated historical inventory data for analytics.

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 10, max: 100)
- `offset` (optional): Number of records to skip (default: 0)

**Example:** `/ml-connector/inventory/history?limit=20&offset=0`

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "timestamp": "2025-10-24T21:00:00Z",
      "inventory": [
        { "name": "apple", "quantity": 2 },
        { "name": "banana", "quantity": 1 }
      ],
      "created_at": "2025-10-24T21:00:05Z",
      "updated_at": "2025-10-24T21:00:05Z"
    },
    {
      "id": 1,
      "timestamp": "2025-10-24T20:55:02Z",
      "inventory": [
        { "name": "apple", "quantity": 3 },
        { "name": "banana", "quantity": 1 }
      ],
      "created_at": "2025-10-24T20:55:05Z",
      "updated_at": "2025-10-24T20:55:05Z"
    }
  ],
  "total": 2,
  "limit": 20,
  "offset": 0
}
```

**Error Responses:**

- `400 Bad Request`: Invalid payload format
- `404 Not Found`: No inventory data found
- `500 Internal Server Error`: Failed to save/retrieve data

## Performance Optimizations

### 1. **In-Memory Caching**
The latest inventory is cached for 60 seconds to minimize database queries for the most common use case.

- **Cache Hit**: Returns immediately from memory (~0.1ms)
- **Cache Miss**: Fetches from Supabase (~50-200ms) and updates cache
- **Auto-Update**: Cache automatically refreshes when new data is saved

### 2. **Database Indexing**
- Index on `created_at DESC` for fast latest record retrieval
- Index on `timestamp DESC` for time-based queries

### 3. **Efficient Queries**
- Latest endpoint uses `.limit(1)` with ordered index
- History endpoint uses pagination to prevent large data transfers

## Testing

You can test the endpoints using the Swagger UI at `http://localhost:3001/api` or with curl:

**Save new inventory:**
```bash
curl -X POST http://localhost:3001/ml-connector/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-10-24T20:55:02Z",
    "inventory": [
      { "name": "apple", "quantity": 3 },
      { "name": "banana", "quantity": 1 },
      { "name": "yogurt", "quantity": 2 }
    ]
  }'
```

**Get latest inventory (fast!):**
```bash
curl http://localhost:3001/ml-connector/inventory/latest
```

**Get history:**
```bash
curl "http://localhost:3001/ml-connector/inventory/history?limit=10&offset=0"
```

## Validation

The endpoint validates:
- `timestamp`: Must be a valid ISO 8601 date string
- `inventory`: Must be an array of objects
- Each inventory item must have:
  - `name`: String
  - `quantity`: Number
