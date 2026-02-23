import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  appConfig,
  authConfig,
  databaseConfig,
  queueConfig,
  redisConfig,
} from './config';
import { validateEnv } from './config/validation';
import { OrganizationContextMiddleware } from './common/middleware/organization-context.middleware';
import { HealthController } from './health.controller';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { ExecutionsModule } from './modules/executions/executions.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { QueueModule } from './modules/queue/queue.module';
import { UsersModule } from './modules/users/users.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      load: [appConfig, authConfig, databaseConfig, redisConfig, queueConfig],
      validate: validateEnv,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host', '127.0.0.1'),
          port: configService.get<number>('redis.port', 6379),
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    WorkflowsModule,
    ExecutionsModule,
    QueueModule,
    AuditModule,
    WebsocketModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(OrganizationContextMiddleware).forRoutes('*');
  }
}
