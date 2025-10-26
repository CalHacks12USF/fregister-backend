import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import {
  CreateMessageDto,
  UpdateMessageDto,
  MessageRole,
} from './dto/create-message.dto';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

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

      const { data, error } = await this.supabaseService
        .from('threads')
        .insert(threadData)
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating thread', error);
        throw new Error(`Failed to create thread: ${error.message}`);
      }

      this.logger.log(
        `Created thread with ID: ${data.id} and title: "${title}"`,
      );
      return {
        success: true,
        data: {
          thread: data,
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
      const { data, error } = await this.supabaseService
        .from('threads')
        .select('*')
        .eq('id', threadId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException(`Thread with ID ${threadId} not found`);
        }
        this.logger.error('Error fetching thread', error);
        throw new Error(`Failed to fetch thread: ${error.message}`);
      }

      return {
        success: true,
        data,
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
    const maxLength = 60;

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
      const { data: userMessage, error } = await this.supabaseService
        .from('messages')
        .insert(createMessageDto)
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating message', error);
        throw new Error(`Failed to create message: ${error.message}`);
      }

      this.logger.log(
        `Created message with ID: ${userMessage.id} in thread: ${createMessageDto.thread_id}`,
      );

      // Wait 10 seconds before generating AI response to simulate processing
      this.logger.log('Waiting 10 seconds before generating AI response...');
      await this.delay(10000);

      // Generate a mock AI response
      const mockAiResponse = this.generateMockAiResponse(
        createMessageDto.content,
      );

      // Create the AI response message
      const aiMessageDto: CreateMessageDto = {
        thread_id: createMessageDto.thread_id,
        role: MessageRole.ASSISTANT,
        content: mockAiResponse,
        metadata: { mock: true, timestamp: new Date().toISOString() },
      };

      const { data: aiMessage, error: aiError } = await this.supabaseService
        .from('messages')
        .insert(aiMessageDto)
        .select()
        .single();

      if (aiError) {
        this.logger.error('Error creating AI response message', aiError);
        // Still return the user message even if AI response fails
        return {
          success: true,
          data: {
            userMessage,
            aiMessage: null,
          },
          error: 'Failed to create AI response',
        };
      }

      this.logger.log(
        `Created AI response with ID: ${aiMessage.id} in thread: ${createMessageDto.thread_id}`,
      );

      return {
        success: true,
        data: {
          userMessage,
          aiMessage,
        },
      };
    } catch (error) {
      this.logger.error('Error in createMessage', error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateMockAiResponse(userMessage: string): string {
    // Generate a mock AI response based on the user message
    const responses = [
      `I received your message: "${userMessage}". This is a mock AI response. I can help you with that!`,
      `That's an interesting question about "${userMessage}". Here's what I think... (This is a mock response)`,
      `Based on your input "${userMessage}", here are some suggestions... (Mock AI response)`,
      `I understand you're asking about "${userMessage}". Let me provide some insights... (Mock response)`,
      `Great question! Regarding "${userMessage}", I'd recommend... (This is a simulated AI response)`,
    ];

    // Select a random response
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  async getMessage(messageId: string) {
    try {
      const { data, error } = await this.supabaseService
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException(`Message with ID ${messageId} not found`);
        }
        this.logger.error('Error fetching message', error);
        throw new Error(`Failed to fetch message: ${error.message}`);
      }

      return {
        success: true,
        data,
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
      const { data, error } = await this.supabaseService
        .from('messages')
        .update(updateMessageDto)
        .eq('id', messageId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException(`Message with ID ${messageId} not found`);
        }
        this.logger.error('Error updating message', error);
        throw new Error(`Failed to update message: ${error.message}`);
      }

      this.logger.log(`Updated message with ID: ${messageId}`);
      return {
        success: true,
        data,
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
