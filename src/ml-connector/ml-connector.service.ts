import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { InventoryService } from '../inventory/inventory.service';
import { InventoryPayloadDto } from './dto/inventory-payload.dto';
import { InventorySnapshot } from './types/inventory-snapshot.type';

@Injectable()
export class MlConnectorService {
  private readonly logger = new Logger(MlConnectorService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly inventoryService: InventoryService,
  ) {}

  async saveInventoryData(payload: InventoryPayloadDto) {
    try {
      // Insert the inventory snapshot
      const result = await this.supabaseService
        .from('inventory_snapshots')
        .insert({
          timestamp: payload.timestamp,
          inventory: payload.inventory,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (result.error) {
        this.logger.error(
          'Error saving inventory data to Supabase',
          result.error,
        );
        throw new Error(
          `Failed to save inventory data: ${result.error.message}`,
        );
      }

      if (!result.data) {
        throw new Error('Failed to save inventory data: No data returned');
      }

      const snapshot = result.data as InventorySnapshot;

      this.logger.log(
        `Successfully saved inventory snapshot with ID: ${snapshot.id}`,
      );

      // Update cache in the inventory service with the latest data
      this.inventoryService.updateCache(snapshot);

      return {
        success: true,
        data: snapshot,
        message: 'Inventory data saved successfully',
      };
    } catch (error) {
      this.logger.error('Error in saveInventoryData', error);
      throw error;
    }
  }
}
