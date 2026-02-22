import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min, validateSync } from 'class-validator';

enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV!: NodeEnv;

  @IsString() @IsNotEmpty() DATABASE_URL!: string;
  @IsString() @IsNotEmpty() JWT_ACCESS_SECRET!: string;
  @IsString() @IsNotEmpty() JWT_REFRESH_SECRET!: string;

  @IsNumber() @Min(60) JWT_ACCESS_EXPIRES_IN!: number;
  @IsNumber() @Min(3600) JWT_REFRESH_EXPIRES_IN!: number;
  @IsNumber() @Min(1) BACKEND_PORT!: number;
  @IsString() @IsNotEmpty() REDIS_HOST!: string;
  @IsNumber() @Min(1) REDIS_PORT!: number;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) throw new Error(errors.toString());
  return validated;
}
