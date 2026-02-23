import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
  accessExpiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN ?? 900),
  refreshExpiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN ?? 604800),
}));
