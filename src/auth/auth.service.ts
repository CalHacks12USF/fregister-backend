import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GoogleAuthDto, AuthResponseDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async signInWithGoogle(
    googleAuthDto: GoogleAuthDto,
  ): Promise<AuthResponseDto> {
    try {
      const { data, error } = await this.supabaseService.auth.signInWithIdToken(
        {
          provider: 'google',
          token: googleAuthDto.idToken,
        },
      );

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      if (!data.user || !data.session) {
        throw new UnauthorizedException('Authentication failed');
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email ?? '',
          name: (data.user.user_metadata?.full_name as string) || undefined,
          avatar: (data.user.user_metadata?.avatar_url as string) || undefined,
        },
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabaseService.auth.signOut();

    if (error) {
      throw new UnauthorizedException('Failed to sign out');
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const { data, error } = await this.supabaseService.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      if (!data.user || !data.session) {
        throw new UnauthorizedException('Failed to refresh session');
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email ?? '',
          name: (data.user.user_metadata?.full_name as string) || undefined,
          avatar: (data.user.user_metadata?.avatar_url as string) || undefined,
        },
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to refresh token');
    }
  }

  async getCurrentUser(accessToken: string) {
    try {
      const { data, error } =
        await this.supabaseService.auth.getUser(accessToken);

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      if (!data.user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: data.user.id,
        email: data.user.email ?? '',
        name: (data.user.user_metadata?.full_name as string) || undefined,
        avatar: (data.user.user_metadata?.avatar_url as string) || undefined,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to get user');
    }
  }
}
