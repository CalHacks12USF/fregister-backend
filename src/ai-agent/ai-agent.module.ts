import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiAgentService } from './ai-agent.service';

@Module({
  imports: [HttpModule],
  providers: [AiAgentService],
  exports: [AiAgentService],
})
export class AiAgentModule {}
