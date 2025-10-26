import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiAgentService {
  private readonly logger = new Logger(AiAgentService.name);
  private readonly aiAgentBaseUrl: string | undefined;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aiAgentBaseUrl = this.configService.get<string>('AI_AGENT_BASE_URL');
    if (!this.aiAgentBaseUrl) {
      this.logger.warn('AI_AGENT_BASE_URL is not configured');
    }
  }

  async startAgent(userId: string): Promise<void> {
    if (!this.aiAgentBaseUrl) {
      throw new Error('AI_AGENT_BASE_URL is not configured');
    }

    const url = `${this.aiAgentBaseUrl}/startagent`;
    this.logger.log(`Calling AI agent at ${url} for user ${userId}`);

    const response = await firstValueFrom(
      this.httpService.post<{ status: string }>(url, { user_id: userId }),
    );

    if (response.data.status !== 'ok') {
      throw new Error(
        `AI agent returned unexpected status: ${response.data.status}`,
      );
    }

    this.logger.log(
      `AI agent started successfully for user ${userId}. Response: ${JSON.stringify(response.data)}`,
    );
  }

  async askAgent(
    userId: string,
    threadId: string,
    message: string,
  ): Promise<string> {
    if (!this.aiAgentBaseUrl) {
      throw new Error('AI_AGENT_BASE_URL is not configured');
    }

    const url = `${this.aiAgentBaseUrl}/ask`;
    this.logger.log(
      `Calling AI agent at ${url} for user ${userId}, thread ${threadId}`,
    );

    const response = await firstValueFrom(
      this.httpService.post<{ aimessage: string }>(url, {
        user_id: userId,
        thread_id: threadId,
        message,
      }),
    );

    if (!response.data.aimessage) {
      throw new Error('AI agent did not return an aimessage');
    }

    this.logger.log(
      `AI agent responded for thread ${threadId}. Message length: ${response.data.aimessage.length}`,
    );

    return response.data.aimessage;
  }
}
