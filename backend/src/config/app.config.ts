import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: Number(process.env.BACKEND_PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
}));
