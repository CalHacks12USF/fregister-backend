import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AiAgentService } from '../ai-agent/ai-agent.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import {
  CreateMessageDto,
  UpdateMessageDto,
  MessageRole,
} from './dto/create-message.dto';

export interface Thread {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly aiAgentService: AiAgentService,
  ) {}

  // ==================== THREAD OPERATIONS ====================

  async createThread(createThreadDto: CreateThreadDto) {
    try {
      // Generate title from content
      const title = this.generateTitleFromContent(createThreadDto.content);

      // Prepare thread data with generated title
      const threadData = {
        title,
        user_id: createThreadDto.user_id,
      };

      const result = await this.supabaseService
        .from('threads')
        .insert(threadData)
        .select()
        .single();

      if (result.error) {
        this.logger.error('Error creating thread', result.error);
        throw new Error(`Failed to create thread: ${result.error.message}`);
      }

      if (!result.data) {
        throw new Error('Failed to create thread: No data returned');
      }

      const thread = result.data as Thread;

      this.logger.log(
        `Created thread with ID: ${thread.id} and title: "${title}"`,
      );

      // Call AI agent to start processing and wait for response if user_id is provided
      if (createThreadDto.user_id) {
        await this.aiAgentService.startAgent(createThreadDto.user_id);
      }

      return {
        success: true,
        data: {
          thread,
          content: createThreadDto.content,
        },
      };
    } catch (error) {
      this.logger.error('Error in createThread', error);
      throw error;
    }
  }

  async getThread(threadId: string) {
    try {
      const result = await this.supabaseService
        .from('threads')
        .select('*')
        .eq('id', threadId)
        .single();

      if (result.error) {
        if (result.error.code === 'PGRST116') {
          throw new NotFoundException(`Thread with ID ${threadId} not found`);
        }
        this.logger.error('Error fetching thread', result.error);
        throw new Error(`Failed to fetch thread: ${result.error.message}`);
      }

      if (!result.data) {
        throw new NotFoundException(`Thread with ID ${threadId} not found`);
      }

      return {
        success: true,
        data: result.data as Thread,
      };
    } catch (error) {
      this.logger.error('Error in getThread', error);
      throw error;
    }
  }

  async getThreads(userId?: string, limit: number = 20, offset: number = 0) {
    try {
      let query = this.supabaseService
        .from('threads')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error, count } = await query;

      if (error) {
        this.logger.error('Error fetching threads', error);
        throw new Error(`Failed to fetch threads: ${error.message}`);
      }

      return {
        success: true,
        data,
        total: count,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error('Error in getThreads', error);
      throw error;
    }
  }

  async deleteThread(threadId: string) {
    try {
      const { error } = await this.supabaseService
        .from('threads')
        .delete()
        .eq('id', threadId);

      if (error) {
        this.logger.error('Error deleting thread', error);
        throw new Error(`Failed to delete thread: ${error.message}`);
      }

      this.logger.log(`Deleted thread with ID: ${threadId}`);
      return {
        success: true,
        message: 'Thread deleted successfully',
      };
    } catch (error) {
      this.logger.error('Error in deleteThread', error);
      throw error;
    }
  }

  // ==================== MESSAGE OPERATIONS ====================

  private generateTitleFromContent(content: string): string {
    // Generate a smart title from the message content
    const maxLength = 30;

    // Remove extra whitespace and newlines
    const cleaned = content.trim().replace(/\s+/g, ' ');

    // If content is short enough, use it as is
    if (cleaned.length <= maxLength) {
      return cleaned;
    }

    // Otherwise, truncate at word boundary
    const truncated = cleaned.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    // If there's a space, cut at the last complete word
    if (lastSpaceIndex > maxLength * 0.7) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }

    // Otherwise just truncate with ellipsis
    return truncated + '...';
  }

  async createMessage(createMessageDto: CreateMessageDto) {
    try {
      // Verify thread exists
      await this.getThread(createMessageDto.thread_id);

      // Create the user message
      const result = await this.supabaseService
        .from('messages')
        .insert(createMessageDto)
        .select()
        .single();

      if (result.error) {
        this.logger.error('Error creating message', result.error);
        throw new Error(`Failed to create message: ${result.error.message}`);
      }

      if (!result.data) {
        throw new Error('Failed to create message: No data returned');
      }

      const userMessageTyped = result.data as Message;

      this.logger.log(
        `Created message with ID: ${userMessageTyped.id} in thread: ${createMessageDto.thread_id}`,
      );

      // Get AI response from AI agent
      if (!createMessageDto.user_id) {
        throw new Error('user_id is required to get AI response');
      }

      const aiResponseContent = await this.aiAgentService.askAgent(
        createMessageDto.user_id,
        createMessageDto.thread_id,
        createMessageDto.content,
      );

      // Create the AI response message
      const aiMessageDto: CreateMessageDto = {
        thread_id: createMessageDto.thread_id,
        role: MessageRole.ASSISTANT,
        content: aiResponseContent,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      const aiResult = await this.supabaseService
        .from('messages')
        .insert(aiMessageDto)
        .select()
        .single();

      if (aiResult.error) {
        this.logger.error('Error creating AI response message', aiResult.error);
        // Still return the user message even if AI response fails
        return {
          success: true,
          data: {
            userMessage: userMessageTyped,
            aiMessage: null,
          },
          error: 'Failed to create AI response',
        };
      }

      if (!aiResult.data) {
        return {
          success: true,
          data: {
            userMessage: userMessageTyped,
            aiMessage: null,
          },
          error: 'Failed to create AI response: No data returned',
        };
      }

      const aiMessageTyped = aiResult.data as Message;

      this.logger.log(
        `Created AI response with ID: ${aiMessageTyped.id} in thread: ${createMessageDto.thread_id}`,
      );

      return {
        success: true,
        data: {
          userMessage: userMessageTyped,
          aiMessage: aiMessageTyped,
        },
      };
    } catch (error) {
      this.logger.error('Error in createMessage', error);
      throw error;
    }
  }

  async getMessage(messageId: string) {
    try {
      const result = await this.supabaseService
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (result.error) {
        if (result.error.code === 'PGRST116') {
          throw new NotFoundException(`Message with ID ${messageId} not found`);
        }
        this.logger.error('Error fetching message', result.error);
        throw new Error(`Failed to fetch message: ${result.error.message}`);
      }

      if (!result.data) {
        throw new NotFoundException(`Message with ID ${messageId} not found`);
      }

      return {
        success: true,
        data: result.data as Message,
      };
    } catch (error) {
      this.logger.error('Error in getMessage', error);
      throw error;
    }
  }

  async getMessagesByThread(
    threadId: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    try {
      // Verify thread exists
      await this.getThread(threadId);

      const { data, error, count } = await this.supabaseService
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        this.logger.error('Error fetching messages', error);
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }

      return {
        success: true,
        data,
        total: count,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error('Error in getMessagesByThread', error);
      throw error;
    }
  }

  async updateMessage(messageId: string, updateMessageDto: UpdateMessageDto) {
    try {
      const result = await this.supabaseService
        .from('messages')
        .update(updateMessageDto)
        .eq('id', messageId)
        .select()
        .single();

      if (result.error) {
        if (result.error.code === 'PGRST116') {
          throw new NotFoundException(`Message with ID ${messageId} not found`);
        }
        this.logger.error('Error updating message', result.error);
        throw new Error(`Failed to update message: ${result.error.message}`);
      }

      if (!result.data) {
        throw new NotFoundException(`Message with ID ${messageId} not found`);
      }

      this.logger.log(`Updated message with ID: ${messageId}`);
      return {
        success: true,
        data: result.data as Message,
      };
    } catch (error) {
      this.logger.error('Error in updateMessage', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string) {
    try {
      const { error } = await this.supabaseService
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        this.logger.error('Error deleting message', error);
        throw new Error(`Failed to delete message: ${error.message}`);
      }

      this.logger.log(`Deleted message with ID: ${messageId}`);
      return {
        success: true,
        message: 'Message deleted successfully',
      };
    } catch (error) {
      this.logger.error('Error in deleteMessage', error);
      throw error;
    }
  }
}
