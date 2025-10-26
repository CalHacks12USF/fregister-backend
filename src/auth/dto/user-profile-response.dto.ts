import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the profile record',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID from Supabase auth (Google ID)',
    example: 'google-oauth2|123456789012345678901',
  })
  userId: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'URL to user avatar image',
    example: 'https://lh3.googleusercontent.com/a/example',
    required: false,
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'User soft preferences (flexible dietary preferences)',
    example: 'I prefer organic vegetables and locally sourced meat',
    required: false,
  })
  softPreferences?: string;

  @ApiProperty({
    description: 'User hard preferences (strict dietary restrictions)',
    example: 'I am allergic to peanuts and shellfish. I am vegetarian.',
    required: false,
  })
  hardPreferences?: string;

  @ApiProperty({
    description: 'When the profile was first created (first login)',
    example: '2025-10-25T10:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'When the profile was last updated',
    example: '2025-10-25T15:45:00Z',
  })
  updatedAt: string;
}
