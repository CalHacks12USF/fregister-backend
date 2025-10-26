import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { AiAgentModule } from '../ai-agent/ai-agent.module';

@Module({
  imports: [SupabaseModule, AiAgentModule],
  providers: [MessageService],
  controllers: [MessageController],
})
export class MessageModule {}
