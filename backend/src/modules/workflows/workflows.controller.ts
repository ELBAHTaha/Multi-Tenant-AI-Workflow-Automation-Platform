import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { RunWorkflowDto } from './dto/run-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Permission, Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantAccessGuard } from '../../common/guards/tenant-access.guard';
import { TenantResource } from '../../common/decorators/tenant-resource.decorator';

@Controller('workflows')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, TenantAccessGuard)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @Permissions(Permission.WORKFLOW_CREATE)
  create(@Body() dto: CreateWorkflowDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request): ReturnType<WorkflowsService['create']> {
    const organizationId = (req as Request & { organizationId?: string }).organizationId ?? user.organizationId;
    return this.workflowsService.create(dto, user.userId, organizationId);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER', 'MEMBER')
  @Permissions(Permission.WORKFLOW_VIEW)
  getByOrganization(@CurrentUser() user: AuthenticatedUser, @Req() req: Request): ReturnType<WorkflowsService['getByOrganization']> {
    const organizationId = (req as Request & { organizationId?: string }).organizationId ?? user.organizationId;
    return this.workflowsService.getByOrganization(organizationId);
  }

  @Post(':workflowId/runs')
  @HttpCode(HttpStatus.ACCEPTED)
  @Roles('ADMIN', 'MANAGER', 'MEMBER')
  @Permissions(Permission.WORKFLOW_RUN)
  @TenantResource({ type: 'workflow', idParam: 'workflowId' })
  async runWorkflow(
    @Param('workflowId') workflowId: string,
    @Body() dto: RunWorkflowDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<{ status: 'accepted'; workflowId: string; jobId: string }> {
    const organizationId =
      (req as Request & { organizationId?: string }).organizationId ?? user.organizationId;
    const queued = await this.workflowsService.enqueueRun(
      workflowId,
      organizationId,
      user.userId,
      dto.input,
    );

    return {
      status: 'accepted',
      workflowId,
      jobId: queued.jobId,
    };
  }

  @Put(':workflowId')
  @Roles('ADMIN', 'MANAGER')
  @Permissions(Permission.WORKFLOW_UPDATE)
  @TenantResource({ type: 'workflow', idParam: 'workflowId' })
  updateWorkflow(
    @Param('workflowId') workflowId: string,
    @Body() dto: UpdateWorkflowDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): ReturnType<WorkflowsService['update']> {
    const organizationId =
      (req as Request & { organizationId?: string }).organizationId ?? user.organizationId;
    return this.workflowsService.update(workflowId, organizationId, user.userId, dto);
  }

  @Delete(':workflowId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  @Permissions(Permission.WORKFLOW_DELETE)
  @TenantResource({ type: 'workflow', idParam: 'workflowId' })
  async deleteWorkflow(
    @Param('workflowId') workflowId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<void> {
    const organizationId =
      (req as Request & { organizationId?: string }).organizationId ?? user.organizationId;
    await this.workflowsService.remove(workflowId, organizationId, user.userId);
  }
}
