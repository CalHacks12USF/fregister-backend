import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreateMessageDto, UpdateMessageDto, CreateMessageWithThreadDto } from './dto/create-message.dto';

@ApiTags('message')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // ==================== THREAD ENDPOINTS ====================

  @Post('threads')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new conversation thread' })
  @ApiBody({ type: CreateThreadDto })
  @ApiResponse({
    status: 201,
    description: 'Thread created successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Recipe suggestions for dinner',
          user_id: 'user123',
          created_at: '2025-10-25T10:00:00Z',
          updated_at: '2025-10-25T10:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createThread(@Body() createThreadDto: CreateThreadDto) {
    return this.messageService.createThread(createThreadDto);
  }

  @Get('threads')
  @ApiOperation({ summary: 'Get all threads (optionally filter by user)' })
  @ApiQuery({
    name: 'user_id',
    required: false,
    type: String,
    description: 'Filter threads by user ID',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of threads to return (default: 20, max: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of threads to skip (default: 0)',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Threads retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Recipe suggestions',
            user_id: 'user123',
            created_at: '2025-10-25T10:00:00Z',
            updated_at: '2025-10-25T10:05:00Z',
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getThreads(
    @Query('user_id') userId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const parsedLimit = Math.min(limit || 20, 100);
    const parsedOffset = offset || 0;
    return this.messageService.getThreads(userId, parsedLimit, parsedOffset);
  }

  @Get('threads/:threadId')
  @ApiOperation({ summary: 'Get a specific thread by ID' })
  @ApiParam({ name: 'threadId', description: 'Thread UUID' })
  @ApiResponse({
    status: 200,
    description: 'Thread retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Recipe suggestions',
          user_id: 'user123',
          created_at: '2025-10-25T10:00:00Z',
          updated_at: '2025-10-25T10:05:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getThread(@Param('threadId') threadId: string) {
    return this.messageService.getThread(threadId);
  }

  @Delete('threads/:threadId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete a thread and all its messages',
    description: 'Deletes the thread and all associated messages (CASCADE)',
  })
  @ApiParam({ name: 'threadId', description: 'Thread UUID' })
  @ApiResponse({
    status: 200,
    description: 'Thread deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Thread deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteThread(@Param('threadId') threadId: string) {
    return this.messageService.deleteThread(threadId);
  }

  // ==================== MESSAGE ENDPOINTS ====================

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Start a new conversation (creates thread + first message)',
    description: '🚀 Perfect for starting a new chat! Automatically creates a thread and adds the first message in one call. Thread title is auto-generated from message content if not provided.',
  })
  @ApiBody({ type: CreateMessageWithThreadDto })
  @ApiResponse({
    status: 201,
    description: 'Thread and message created successfully',
    schema: {
      example: {
        success: true,
        data: {
          thread: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'What recipes can I make with apples and yogurt?',
            user_id: 'user123',
            created_at: '2025-10-25T10:00:00Z',
            updated_at: '2025-10-25T10:00:00Z',
          },
          message: {
            id: '987e6543-e21b-12d3-a456-426614174000',
            thread_id: '123e4567-e89b-12d3-a456-426614174000',
            role: 'user',
            content: 'What recipes can I make with apples and yogurt?',
            user_id: 'user123',
            metadata: null,
            created_at: '2025-10-25T10:00:00Z',
            updated_at: '2025-10-25T10:00:00Z',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async startConversation(@Body() createMessageWithThreadDto: CreateMessageWithThreadDto) {
    return this.messageService.createMessageWithThread(createMessageWithThreadDto);
  }

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new message in a thread',
    description: 'Creates a message from user, assistant, or system',
  })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Message created successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '987e6543-e21b-12d3-a456-426614174000',
          thread_id: '123e4567-e89b-12d3-a456-426614174000',
          role: 'user',
          content: 'What recipes can I make with apples?',
          user_id: 'user123',
          metadata: null,
          created_at: '2025-10-25T10:00:00Z',
          updated_at: '2025-10-25T10:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.createMessage(createMessageDto);
  }

  @Get('threads/:threadId/messages')
  @ApiOperation({ summary: 'Get all messages in a thread' })
  @ApiParam({ name: 'threadId', description: 'Thread UUID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of messages to return (default: 100, max: 500)',
    example: 100,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of messages to skip (default: 0)',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '987e6543-e21b-12d3-a456-426614174000',
            thread_id: '123e4567-e89b-12d3-a456-426614174000',
            role: 'user',
            content: 'What recipes can I make with apples?',
            user_id: 'user123',
            metadata: null,
            created_at: '2025-10-25T10:00:00Z',
            updated_at: '2025-10-25T10:00:00Z',
          },
          {
            id: '987e6543-e21b-12d3-a456-426614174001',
            thread_id: '123e4567-e89b-12d3-a456-426614174000',
            role: 'assistant',
            content: 'You can make apple pie, apple sauce, or apple crisp!',
            user_id: null,
            metadata: { model: 'gpt-4', tokens: 150 },
            created_at: '2025-10-25T10:00:05Z',
            updated_at: '2025-10-25T10:00:05Z',
          },
        ],
        total: 2,
        limit: 100,
        offset: 0,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMessagesByThread(
    @Param('threadId') threadId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const parsedLimit = Math.min(limit || 100, 500);
    const parsedOffset = offset || 0;
    return this.messageService.getMessagesByThread(threadId, parsedLimit, parsedOffset);
  }

  @Get('messages/:messageId')
  @ApiOperation({ summary: 'Get a specific message by ID' })
  @ApiParam({ name: 'messageId', description: 'Message UUID' })
  @ApiResponse({
    status: 200,
    description: 'Message retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '987e6543-e21b-12d3-a456-426614174000',
          thread_id: '123e4567-e89b-12d3-a456-426614174000',
          role: 'user',
          content: 'What recipes can I make with apples?',
          user_id: 'user123',
          metadata: null,
          created_at: '2025-10-25T10:00:00Z',
          updated_at: '2025-10-25T10:00:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMessage(@Param('messageId') messageId: string) {
    return this.messageService.getMessage(messageId);
  }

  @Put('messages/:messageId')
  @ApiOperation({ summary: 'Update a message' })
  @ApiParam({ name: 'messageId', description: 'Message UUID' })
  @ApiBody({ type: UpdateMessageDto })
  @ApiResponse({
    status: 200,
    description: 'Message updated successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '987e6543-e21b-12d3-a456-426614174000',
          thread_id: '123e4567-e89b-12d3-a456-426614174000',
          role: 'user',
          content: 'What recipes can I make with apples and bananas?',
          user_id: 'user123',
          metadata: { edited: true },
          created_at: '2025-10-25T10:00:00Z',
          updated_at: '2025-10-25T10:05:00Z',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateMessage(
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messageService.updateMessage(messageId, updateMessageDto);
  }

  @Delete('messages/:messageId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a message' })
  @ApiParam({ name: 'messageId', description: 'Message UUID' })
  @ApiResponse({
    status: 200,
    description: 'Message deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Message deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteMessage(@Param('messageId') messageId: string) {
    return this.messageService.deleteMessage(messageId);
  }
}
