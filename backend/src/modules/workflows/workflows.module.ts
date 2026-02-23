import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { QueueModule } from '../queue/queue.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantAccessGuard } from '../../common/guards/tenant-access.guard';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [JwtModule, QueueModule, AuditModule],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, JwtAuthGuard, RolesGuard, PermissionsGuard, TenantAccessGuard],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
