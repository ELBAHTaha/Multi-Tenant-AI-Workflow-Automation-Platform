import { BadRequestException, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma, Workflow } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { QueueService } from '../queue/queue.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class WorkflowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateWorkflowDto, createdById: string, organizationId: string): Promise<Workflow> {
    if (!Array.isArray(dto.definition.nodes) || dto.definition.nodes.length === 0) {
      throw new BadRequestException('Workflow definition must include at least one node');
    }
    if (!Array.isArray(dto.definition.edges)) {
      throw new BadRequestException('Workflow definition edges must be an array');
    }

    const definition = dto.definition as unknown as Prisma.InputJsonValue;
    const workflow = await this.prisma.workflow.create({
      data: {
        name: dto.name,
        definition,
        createdById,
        organizationId,
      },
    });

    await this.auditService.log({
      organizationId,
      userId: createdById,
      action: 'workflow.created',
      metadata: { workflowId: workflow.id, workflowName: workflow.name },
    });

    return workflow;
  }

  getByOrganization(organizationId: string): Promise<Workflow[]> {
    return this.prisma.workflow.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } });
  }

  async update(
    workflowId: string,
    organizationId: string,
    updatedByUserId: string,
    dto: UpdateWorkflowDto,
  ): Promise<Workflow> {
    const existing = await this.prisma.workflow.findFirst({
      where: { id: workflowId, organizationId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Workflow not found for tenant');
    }

    const data: Prisma.WorkflowUpdateInput = {};
    if (dto.name) {
      data.name = dto.name;
    }
    if (dto.definition) {
      data.definition = dto.definition as unknown as Prisma.InputJsonValue;
    }

    const workflow = await this.prisma.workflow.update({
      where: { id: workflowId },
      data,
    });

    await this.auditService.log({
      organizationId,
      userId: updatedByUserId,
      action: 'workflow.updated',
      metadata: { workflowId },
    });

    return workflow;
  }

  async remove(workflowId: string, organizationId: string, removedByUserId: string): Promise<void> {
    const existing = await this.prisma.workflow.findFirst({
      where: { id: workflowId, organizationId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Workflow not found for tenant');
    }

    await this.prisma.workflow.delete({ where: { id: workflowId } });
    await this.auditService.log({
      organizationId,
      userId: removedByUserId,
      action: 'workflow.deleted',
      metadata: { workflowId },
    });
  }

  async enqueueRun(
    workflowId: string,
    organizationId: string,
    initiatedByUserId: string,
    input?: Record<string, unknown>,
  ): Promise<{ jobId: string }> {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id: workflowId, organizationId },
      select: { id: true },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found for tenant');
    }

    const job = await this.queueService.enqueueProcessWorkflow(
      workflowId,
      organizationId,
      initiatedByUserId,
    );

    await this.auditService.log({
      organizationId,
      userId: initiatedByUserId,
      action: 'workflow.execution.queued',
      metadata: { workflowId, jobId: job.id, input: input ?? null },
    });

    return { jobId: String(job.id) };
  }
}
