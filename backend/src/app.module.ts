import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { appConfig, authConfig, databaseConfig, redisConfig } from './config';
import { validateEnv } from './config/validation';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { ExecutionsModule } from './modules/executions/executions.module';
import { QueueModule } from './modules/queue/queue.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { OrganizationContextMiddleware } from './common/middleware/organization-context.middleware';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
      load: [appConfig, authConfig, databaseConfig, redisConfig],
      validate: validateEnv,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'redis',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    WorkflowsModule,
    ExecutionsModule,
    QueueModule,
    WebsocketModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(OrganizationContextMiddleware).forRoutes('*');
  }
}
