import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  private latestInventoryCache: any = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL_MS = 60000; // Cache for 60 seconds

  constructor(private readonly supabaseService: SupabaseService) {}

  async getLatest() {
    try {
      // Check if cache is valid
      const now = Date.now();
      if (this.latestInventoryCache && (now - this.cacheTimestamp) < this.CACHE_TTL_MS) {
        this.logger.log('Returning cached latest inventory');
        return {
          success: true,
          data: this.latestInventoryCache,
          cached: true,
        };
      }

      // Cache miss or expired - fetch from database
      this.logger.log('Cache miss - fetching latest inventory from database');
      const { data, error } = await this.supabaseService
        .from('inventory_snapshots')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          throw new NotFoundException('No inventory data found');
        }
        this.logger.error('Error fetching latest inventory from Supabase', error);
        throw new Error(`Failed to fetch latest inventory: ${error.message}`);
      }

      // Update cache
      this.latestInventoryCache = data;
      this.cacheTimestamp = now;

      return {
        success: true,
        data,
        cached: false,
      };
    } catch (error) {
      this.logger.error('Error in getLatest', error);
      throw error;
    }
  }

  async getHistory(limit: number = 10, offset: number = 0) {
    try {
      const { data, error, count } = await this.supabaseService
        .from('inventory_snapshots')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        this.logger.error('Error fetching inventory history from Supabase', error);
        throw new Error(`Failed to fetch inventory history: ${error.message}`);
      }

      return {
        success: true,
        data,
        total: count,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error('Error in getHistory', error);
      throw error;
    }
  }

  // Method to invalidate cache (called when new data is saved)
  invalidateCache() {
    this.logger.log('Cache invalidated');
    this.latestInventoryCache = null;
    this.cacheTimestamp = 0;
  }

  // Method to update cache with new data
  updateCache(data: any) {
    this.logger.log('Cache updated with new data');
    this.latestInventoryCache = data;
    this.cacheTimestamp = Date.now();
  }
}
