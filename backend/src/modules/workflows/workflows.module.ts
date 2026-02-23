import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { QueueModule } from '../queue/queue.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [JwtModule, QueueModule],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, JwtAuthGuard, RolesGuard],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
