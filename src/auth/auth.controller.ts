import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RefreshTokenDto, AuthResponseDto } from './dto/create-auth.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Sign in with Google' })
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer token with Google ID token',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async signInWithGoogle(@Headers('authorization') authorization: string) {
    const idToken = this.extractToken(authorization);
    return this.authService.signInWithGoogle({ idToken });
  }

  @Post('signout')
  @ApiOperation({ summary: 'Sign out the current user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully signed out',
  })
  async signOut() {
    return this.authService.signOut();
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Successfully refreshed token',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing refresh token',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    if (!refreshTokenDto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer token with access token',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user information',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getCurrentUser(@Headers('authorization') authorization: string) {
    const token = this.extractToken(authorization);
    return this.authService.getCurrentUser(token);
  }

  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile preferences' })
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer token with access token',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated user profile',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async updateUserProfile(
    @Headers('authorization') authorization: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const token = this.extractToken(authorization);
    return this.authService.updateUserProfile(token, updateUserProfileDto);
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    return parts[1];
  }
}
