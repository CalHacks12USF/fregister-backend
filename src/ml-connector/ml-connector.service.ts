import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { InventoryService } from '../inventory/inventory.service';
import { InventoryPayloadDto } from './dto/inventory-payload.dto';

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
      const { data, error } = await this.supabaseService
        .from('inventory_snapshots')
        .insert({
          timestamp: payload.timestamp,
          inventory: payload.inventory,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error saving inventory data to Supabase', error);
        throw new Error(`Failed to save inventory data: ${error.message}`);
      }

      this.logger.log(`Successfully saved inventory snapshot with ID: ${data.id}`);
      
      // Update cache in the inventory service with the latest data
      this.inventoryService.updateCache(data);

      return {
        success: true,
        data,
        message: 'Inventory data saved successfully',
      };
    } catch (error) {
      this.logger.error('Error in saveInventoryData', error);
      throw error;
    }
  }
}
