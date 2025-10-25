import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsUUID, IsOptional, IsObject } from 'class-validator';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export class CreateMessageDto {
  @ApiProperty({
    description: 'ID of the thread this message belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  thread_id: string;

  @ApiProperty({
    description: 'Role of the message sender',
    enum: MessageRole,
    example: MessageRole.USER,
  })
  @IsEnum(MessageRole)
  role: MessageRole;

  @ApiProperty({
    description: 'Content of the message',
    example: 'What recipes can I make with apples and yogurt?',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'ID of the user who created this message',
    example: 'user123',
    required: false,
  })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({
    description: 'Optional metadata for the message (e.g., tokens used, model info)',
    example: { model: 'gpt-4', tokens: 150 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateMessageWithThreadDto {
  @ApiProperty({
    description: 'Role of the message sender',
    enum: MessageRole,
    example: MessageRole.USER,
  })
  @IsEnum(MessageRole)
  role: MessageRole;

  @ApiProperty({
    description: 'Content of the message',
    example: 'What recipes can I make with apples and yogurt?',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Optional title for the new thread',
    example: 'Recipe suggestions',
    required: false,
  })
  @IsOptional()
  @IsString()
  thread_title?: string;

  @ApiProperty({
    description: 'Optional user ID for the new thread',
    example: 'user123',
    required: false,
  })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({
    description: 'Optional metadata for the message (e.g., tokens used, model info)',
    example: { model: 'gpt-4', tokens: 150 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateMessageDto {
  @ApiProperty({
    description: 'Updated content of the message',
    example: 'What recipes can I make with apples, yogurt, and bananas?',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Updated metadata for the message',
    example: { edited: true, edit_timestamp: '2025-10-25T10:00:00Z' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
