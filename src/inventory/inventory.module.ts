import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService], // Export for use in ml-connector
})
export class InventoryModule {}
