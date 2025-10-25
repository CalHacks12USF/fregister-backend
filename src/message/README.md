# Message Module

This module handles chat threads and messages, similar to a chat interface with AI. Messages are organized into conversation threads.

## Setup

### 1. Create the Database Tables

Run the SQL script in your Supabase SQL Editor:

```bash
# The SQL file is located at: supabase/create_threads_and_messages_tables.sql
```

Or run it directly in Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/create_threads_and_messages_tables.sql`
4. Click "Run"

### 2. Database Schema

#### `threads` table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| title | TEXT | Optional thread title |
| user_id | TEXT | ID of the user who owns this thread |
| created_at | TIMESTAMPTZ | When the thread was created |
| updated_at | TIMESTAMPTZ | Auto-updated when messages are added |

#### `messages` table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| thread_id | UUID | Foreign key to threads |
| role | TEXT | 'user', 'assistant', or 'system' |
| content | TEXT | The message content |
| metadata | JSONB | Optional metadata (e.g., model info, tokens) |
| created_at | TIMESTAMPTZ | When the message was created |
| updated_at | TIMESTAMPTZ | When the message was last updated |

## API Endpoints

### Thread Endpoints

#### POST `/message/threads`
Create a new conversation thread.

**Request Body:**
```json
{
  "title": "Recipe suggestions for dinner",
  "user_id": "user123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Recipe suggestions for dinner",
    "user_id": "user123",
    "created_at": "2025-10-25T10:00:00Z",
    "updated_at": "2025-10-25T10:00:00Z"
  }
}
```

#### GET `/message/threads`
Get all threads (optionally filter by user).

**Query Parameters:**
- `user_id` (optional): Filter by user ID
- `limit` (optional): Default 20, max 100
- `offset` (optional): Default 0

**Example:** `/message/threads?user_id=user123&limit=10`

#### GET `/message/threads/:threadId`
Get a specific thread by ID.

#### DELETE `/message/threads/:threadId`
Delete a thread and all its messages (CASCADE).

---

### Message Endpoints

#### POST `/message/messages`
Create a new message in a thread.

**Request Body:**
```json
{
  "thread_id": "123e4567-e89b-12d3-a456-426614174000",
  "role": "user",
  "content": "What recipes can I make with apples and yogurt?",
  "metadata": {}
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "987e6543-e21b-12d3-a456-426614174000",
    "thread_id": "123e4567-e89b-12d3-a456-426614174000",
    "role": "user",
    "content": "What recipes can I make with apples and yogurt?",
    "metadata": {},
    "created_at": "2025-10-25T10:00:00Z",
    "updated_at": "2025-10-25T10:00:00Z"
  }
}
```

**Message Roles:**
- `user`: Messages from the end user
- `assistant`: AI/bot responses
- `system`: System messages or instructions

#### GET `/message/threads/:threadId/messages`
Get all messages in a thread (ordered by creation time).

**Query Parameters:**
- `limit` (optional): Default 100, max 500
- `offset` (optional): Default 0

**Example:** `/message/threads/123e4567-e89b-12d3-a456-426614174000/messages?limit=50`

#### GET `/message/messages/:messageId`
Get a specific message by ID.

#### PUT `/message/messages/:messageId`
Update a message's content or metadata.

**Request Body:**
```json
{
  "content": "What recipes can I make with apples, yogurt, and bananas?",
  "metadata": { "edited": true, "edit_timestamp": "2025-10-25T10:05:00Z" }
}
```

#### DELETE `/message/messages/:messageId`
Delete a specific message.

---

## Typical Usage Flow

### 1. **Start a new chat conversation**
```bash
# Create a thread
curl -X POST http://localhost:3001/message/threads \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cooking Help",
    "user_id": "user123"
  }'
```

### 2. **User sends a message**
```bash
# Create user message
curl -X POST http://localhost:3001/message/messages \
  -H "Content-Type: application/json" \
  -d '{
    "thread_id": "YOUR_THREAD_ID",
    "role": "user",
    "content": "What can I make with apples?"
  }'
```

### 3. **AI responds (your backend calls this)**
```bash
# Create assistant message
curl -X POST http://localhost:3001/message/messages \
  -H "Content-Type: application/json" \
  -d '{
    "thread_id": "YOUR_THREAD_ID",
    "role": "assistant",
    "content": "You can make apple pie, apple sauce, or apple crisp!",
    "metadata": { "model": "gpt-4", "tokens": 150 }
  }'
```

### 4. **Retrieve conversation history**
```bash
# Get all messages in the thread
curl http://localhost:3001/message/threads/YOUR_THREAD_ID/messages
```

### 5. **List user's conversations**
```bash
# Get all threads for a user
curl "http://localhost:3001/message/threads?user_id=user123"
```

---

## Features

✅ **Thread Management**: Organize messages into conversation threads  
✅ **Role-based Messages**: Distinguish between user, assistant, and system messages  
✅ **Metadata Support**: Store additional info like model, tokens, etc.  
✅ **Auto-timestamps**: Threads auto-update when messages are added  
✅ **CASCADE Delete**: Deleting a thread removes all its messages  
✅ **Pagination**: Efficient loading of threads and messages  
✅ **Full CRUD**: Create, Read, Update, Delete for both threads and messages  

---

## Database Triggers

The schema includes automatic triggers:

1. **Auto-update timestamps**: `updated_at` fields update automatically
2. **Thread timestamp sync**: When a message is added, the thread's `updated_at` is updated
3. **Cascade delete**: Deleting a thread automatically deletes all its messages

---

## Swagger Documentation

Visit `http://localhost:3001/api` to see the full interactive API documentation with all endpoints, request/response schemas, and the ability to test them directly!
