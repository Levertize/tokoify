import { UserRole } from '@prisma/client';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar: string | null;
  };
  accessToken: string;
}
