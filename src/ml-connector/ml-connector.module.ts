import { Module } from '@nestjs/common';
import { MlConnectorService } from './ml-connector.service';
import { MlConnectorController } from './ml-connector.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [SupabaseModule, InventoryModule],
  providers: [MlConnectorService],
  controllers: [MlConnectorController],
})
export class MlConnectorModule {}
