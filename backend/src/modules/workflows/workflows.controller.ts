import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Controller('workflows')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @Roles('ADMIN', 'MEMBER')
  create(@Body() dto: CreateWorkflowDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request): ReturnType<WorkflowsService['create']> {
    const organizationId = (req as Request & { organizationId?: string }).organizationId ?? user.organizationId;
    return this.workflowsService.create(dto, user.userId, organizationId);
  }

  @Get()
  @Roles('ADMIN', 'MEMBER')
  getByOrganization(@CurrentUser() user: AuthenticatedUser, @Req() req: Request): ReturnType<WorkflowsService['getByOrganization']> {
    const organizationId = (req as Request & { organizationId?: string }).organizationId ?? user.organizationId;
    return this.workflowsService.getByOrganization(organizationId);
  }
}
