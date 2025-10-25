import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateThreadDto {
  @ApiProperty({
    description: 'Title of the conversation thread',
    example: 'Recipe suggestions for dinner',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'User ID who owns this thread',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  user_id?: string;
}
