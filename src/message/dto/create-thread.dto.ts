import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateThreadDto {
  @ApiProperty({
    description: 'User ID who owns this thread',
    example: 'user123',
    required: false,
  })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({
    description: 'Content to be used as the thread title',
    example: 'What recipes can I make with apples and yogurt?',
  })
  @IsString()
  content: string;
}
