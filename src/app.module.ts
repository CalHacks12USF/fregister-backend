import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { DbTestModule } from './db-test/db-test.module';
import { MlConnectorModule } from './ml-connector/ml-connector.module';
import { InventoryModule } from './inventory/inventory.module';
import { MessageModule } from './message/message.module';
import { AiAgentModule } from './ai-agent/ai-agent.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
    AuthModule,
    DbTestModule,
    MlConnectorModule,
    InventoryModule,
    MessageModule,
    AiAgentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
