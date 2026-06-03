import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { TokenPayload } from '@/modules/auth/auth.types';

const BCRYPT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateAccessToken = (payload: TokenPayload): string => {
  const isPem = env.JWT_PRIVATE_KEY.includes('-----BEGIN');
  const secretOrKey = isPem ? env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n') : env.JWT_PRIVATE_KEY;
  const algorithm = (isPem ? 'RS256' : 'HS256') as jwt.Algorithm;

  return jwt.sign(payload, secretOrKey, {
    algorithm,
    expiresIn: env.JWT_EXPIRY as any,
  });
};
