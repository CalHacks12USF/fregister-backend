import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google ID token from OAuth',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NTU4MTk2...',
  })
  idToken: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'User information',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      name: 'John Doe',
      avatar: 'https://example.com/avatar.jpg',
    },
  })
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  };

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  accessToken?: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refreshToken?: string;

  @ApiProperty({
    description: "Indicates if this is the user's first login",
    example: true,
  })
  isNewUser: boolean;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token for obtaining a new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}
