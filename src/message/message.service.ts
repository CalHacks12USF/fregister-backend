import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreateMessageDto, UpdateMessageDto, CreateMessageWithThreadDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  // ==================== THREAD OPERATIONS ====================

  async createThread(createThreadDto: CreateThreadDto) {
    try {
      const { data, error } = await this.supabaseService
        .from('threads')
        .insert(createThreadDto)
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating thread', error);
        throw new Error(`Failed to create thread: ${error.message}`);
      }

      this.logger.log(`Created thread with ID: ${data.id}`);
      return {
        success: true,
        data,
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

  async createMessageWithThread(createMessageWithThreadDto: CreateMessageWithThreadDto) {
    try {
      // Auto-generate title from message content if not provided
      const autoTitle = createMessageWithThreadDto.thread_title || 
        this.generateTitleFromContent(createMessageWithThreadDto.content);

      // Step 1: Create a new thread
      const threadDto: CreateThreadDto = {
        title: autoTitle,
        user_id: createMessageWithThreadDto.user_id,
      };

      const { data: threadData, error: threadError } = await this.supabaseService
        .from('threads')
        .insert(threadDto)
        .select()
        .single();

      if (threadError) {
        this.logger.error('Error creating thread', threadError);
        throw new Error(`Failed to create thread: ${threadError.message}`);
      }

      this.logger.log(`Created thread with ID: ${threadData.id} and title: "${autoTitle}"`);

      // Step 2: Create the first message in the thread
      const messageDto: CreateMessageDto = {
        thread_id: threadData.id,
        role: createMessageWithThreadDto.role,
        content: createMessageWithThreadDto.content,
        user_id: createMessageWithThreadDto.user_id, // Pass user_id to message
        metadata: createMessageWithThreadDto.metadata,
      };

      const { data: messageData, error: messageError } = await this.supabaseService
        .from('messages')
        .insert(messageDto)
        .select()
        .single();

      if (messageError) {
        // If message creation fails, we should ideally rollback the thread
        // For now, log the error and throw
        this.logger.error('Error creating message after thread creation', messageError);
        throw new Error(`Failed to create message: ${messageError.message}`);
      }

      this.logger.log(`Created message with ID: ${messageData.id} in new thread: ${threadData.id}`);

      return {
        success: true,
        data: {
          thread: threadData,
          message: messageData,
        },
      };
    } catch (error) {
      this.logger.error('Error in createMessageWithThread', error);
      throw error;
    }
  }

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

      const { data, error } = await this.supabaseService
        .from('messages')
        .insert(createMessageDto)
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating message', error);
        throw new Error(`Failed to create message: ${error.message}`);
      }

      this.logger.log(`Created message with ID: ${data.id} in thread: ${createMessageDto.thread_id}`);
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error('Error in createMessage', error);
      throw error;
    }
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

  async getMessagesByThread(threadId: string, limit: number = 100, offset: number = 0) {
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
