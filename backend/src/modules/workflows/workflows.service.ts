import { BadRequestException, Injectable } from '@nestjs/common';
import { Workflow } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService, private readonly queueService: QueueService) {}

  async create(dto: CreateWorkflowDto, createdById: string, organizationId: string): Promise<Workflow> {
    if (!Array.isArray(dto.definition.nodes) || dto.definition.nodes.length === 0) throw new BadRequestException('Workflow definition must include at least one node');
    if (!Array.isArray(dto.definition.edges)) throw new BadRequestException('Workflow definition edges must be an array');

    const workflow = await this.prisma.workflow.create({ data: { name: dto.name, definition: dto.definition, createdById, organizationId } });
    await this.queueService.enqueueProcessWorkflow(workflow.id, organizationId);
    return workflow;
  }

  getByOrganization(organizationId: string): Promise<Workflow[]> {
    return this.prisma.workflow.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } });
  }
}
