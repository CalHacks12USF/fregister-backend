import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async signInWithGoogle(@Headers('authorization') authorization: string) {
    const idToken = this.extractToken(authorization);
    return this.authService.signInWithGoogle({ idToken });
  }

  @Post('signout')
  async signOut() {
    return this.authService.signOut();
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    if (!refreshTokenDto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('me')
  async getCurrentUser(@Headers('authorization') authorization: string) {
    const token = this.extractToken(authorization);
    return this.authService.getCurrentUser(token);
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
