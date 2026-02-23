import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { QueueProcessor } from './queue.processor';
import { ExecutionsModule } from '../executions/executions.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueueAsync({
      name: 'workflow-queue',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        defaultJobOptions: {
          attempts: configService.get<number>('queue.workflowAttempts', 3),
          backoff: {
            type: 'exponential',
            delay: configService.get<number>('queue.workflowBackoffMs', 3000),
          },
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      }),
    }),
    ExecutionsModule,
    AuditModule,
    WebsocketModule,
  ],
  providers: [QueueService, QueueProcessor],
  exports: [QueueService],
})
export class QueueModule {}
