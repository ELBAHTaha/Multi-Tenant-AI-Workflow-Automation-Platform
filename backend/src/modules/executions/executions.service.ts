import { Injectable } from '@nestjs/common';
import { ExecutionStatus, ExecutionLog, WorkflowExecution, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExecutionsService {
  constructor(private readonly prisma: PrismaService) {}

  createExecution(workflowId: string, organizationId: string): Promise<WorkflowExecution> {
    return this.prisma.workflowExecution.create({ data: { workflowId, organizationId, status: ExecutionStatus.PENDING } });
  }

  updateStatus(executionId: string, status: ExecutionStatus): Promise<WorkflowExecution> {
    const now = new Date();
    return this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status,
        startedAt: status === ExecutionStatus.RUNNING ? now : undefined,
        finishedAt: status === ExecutionStatus.SUCCESS || status === ExecutionStatus.FAILED ? now : undefined,
      },
    });
  }

  addLog(params: { executionId: string; stepName: string; message: string; status: ExecutionStatus; metadata?: Record<string, unknown> }): Promise<ExecutionLog> {
    return this.prisma.executionLog.create({
      data: {
        executionId: params.executionId,
        stepName: params.stepName,
        message: params.message,
        status: params.status,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }
}