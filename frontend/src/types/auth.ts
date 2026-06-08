export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}
