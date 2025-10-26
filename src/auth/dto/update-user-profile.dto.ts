import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiProperty({
    description: 'User soft preferences (flexible dietary preferences)',
    example: 'I prefer organic vegetables and locally sourced meat',
    required: false,
  })
  @IsOptional()
  @IsString()
  softPreferences?: string;

  @ApiProperty({
    description: 'User hard preferences (strict dietary restrictions)',
    example: 'I am allergic to peanuts and shellfish. I am vegetarian.',
    required: false,
  })
  @IsOptional()
  @IsString()
  hardPreferences?: string;
}
