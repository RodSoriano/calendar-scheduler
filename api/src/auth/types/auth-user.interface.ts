export interface AuthUser {
  userId: string;
  email: string;
}

export interface RefreshUser extends AuthUser {
  refreshToken: string;
}
