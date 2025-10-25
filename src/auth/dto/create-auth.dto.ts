export class GoogleAuthDto {
  idToken: string;
}

export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}
