import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GoogleAuthDto, AuthResponseDto } from './dto/create-auth.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

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

      // Check if user profile exists in database
      const { data: existingProfile, error: profileError } =
        await this.supabaseService
          .from('user_profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .single();

      let isNewUser = false;

      if (profileError && profileError.code === 'PGRST116') {
        // User profile doesn't exist - this is a new user
        isNewUser = true;

        // Create user profile
        const { error: insertError } = await this.supabaseService
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name as string,
            avatar_url: data.user.user_metadata?.avatar_url as string,
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
        }
      } else if (profileError) {
        // Other database error occurred
        console.error('Error checking user profile:', profileError);
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
        isNewUser,
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
        isNewUser: false, // Always false for token refresh
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

  async updateUserProfile(
    accessToken: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ) {
    try {
      // Get the current user from the access token
      const { data: userData, error: userError } =
        await this.supabaseService.auth.getUser(accessToken);

      if (userError || !userData.user) {
        throw new UnauthorizedException('Invalid access token');
      }

      const userId = userData.user.id;

      // Update the user profile with preferences
      const updateData: any = {};
      if (updateUserProfileDto.softPreferences !== undefined) {
        updateData.soft_preferences = updateUserProfileDto.softPreferences;
      }
      if (updateUserProfileDto.hardPreferences !== undefined) {
        updateData.hard_preferences = updateUserProfileDto.hardPreferences;
      }

      const { data, error } = await this.supabaseService
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new UnauthorizedException(
          `Failed to update user profile: ${error.message}`,
        );
      }

      return {
        id: data.id,
        userId: data.user_id,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatar_url,
        softPreferences: data.soft_preferences,
        hardPreferences: data.hard_preferences,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to update user profile');
    }
  }

  async getUserProfileById(userId: string) {
    try {
      const { data, error } = await this.supabaseService
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException(
            `User profile not found for user ID: ${userId}`,
          );
        }
        throw new Error(`Failed to retrieve user profile: ${error.message}`);
      }

      return {
        id: data.id,
        userId: data.user_id,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatar_url,
        softPreferences: data.soft_preferences,
        hardPreferences: data.hard_preferences,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to retrieve user profile');
    }
  }
}
