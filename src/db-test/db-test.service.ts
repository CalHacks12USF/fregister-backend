import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DbTestService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async testConnection(): Promise<{
    success: boolean;
    message: string;
    insertedRecords?: number;
    totalRecords?: number;
    data?: unknown;
    note?: string;
    error?: string;
  }> {
    const client = this.supabaseService.getClient();

    try {
      // Step 1: Create test table
      const { error: createTableError } = await client.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS test_users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `,
      });

      if (createTableError) {
        // If RPC doesn't exist, try direct SQL execution
        // This creates the table using the Supabase client
        const tableName = 'test_users';

        // Check if table exists by trying to query it
        const { error: checkError } = await client
          .from(tableName)
          .select('*')
          .limit(1);

        if (checkError && checkError.message.includes('does not exist')) {
          return {
            success: false,
            message:
              'Cannot create table via Supabase client. Please create the table manually using the Supabase dashboard or SQL editor.',
            note: 'You need to run this SQL in Supabase SQL Editor: CREATE TABLE IF NOT EXISTS test_users (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT NOW());',
            error: createTableError?.message || checkError?.message,
          };
        }
      }

      // Step 2: Insert dummy data
      const dummyData = [
        { name: 'John Doe', email: 'john@example.com' },
        { name: 'Jane Smith', email: 'jane@example.com' },
        { name: 'Bob Johnson', email: 'bob@example.com' },
      ];

      const { data: insertedData, error: insertError } = await client
        .from('test_users')
        .insert(dummyData)
        .select();

      if (insertError) {
        return {
          success: false,
          message: 'Failed to insert data',
          error: insertError.message,
        };
      }

      // Step 3: Query the data
      const { data: allData, error: queryError } = await client
        .from('test_users')
        .select('*');

      if (queryError) {
        return {
          success: false,
          message: 'Failed to query data',
          error: queryError.message,
        };
      }

      return {
        success: true,
        message: 'Database connection test successful!',
        insertedRecords: insertedData?.length || 0,
        totalRecords: allData?.length || 0,
        data: allData,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Database connection test failed',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async cleanupTestData(): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    const client = this.supabaseService.getClient();

    try {
      const { error } = await client
        .from('test_users')
        .delete()
        .not('id', 'is', null);

      if (error) {
        return {
          success: false,
          message: 'Failed to cleanup test data',
          error: error.message,
        };
      }

      return {
        success: true,
        message: 'Test data cleaned up successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Cleanup failed',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
