import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ExecutionStatus } from '@prisma/client';
import { ExecutionsService } from '../executions/executions.service';
import { WorkflowGateway } from '../websocket/workflow.gateway';
import { AuditService } from '../audit/audit.service';

interface ProcessWorkflowPayload {
  workflowId: string;
  organizationId: string;
  initiatedByUserId: string;
}

@Processor('workflow-queue', {
  // Queue concurrency is environment-driven to support different deployment sizes.
  concurrency: Number(process.env.QUEUE_WORKFLOW_CONCURRENCY ?? 5),
})
export class QueueProcessor extends WorkerHost {
  constructor(
    private readonly executionsService: ExecutionsService,
    private readonly workflowGateway: WorkflowGateway,
    private readonly auditService: AuditService,
  ) {
    super();
  }

  async process(job: Job<ProcessWorkflowPayload>): Promise<void> {
    if (job.name !== 'processWorkflow') return;

    const { workflowId, organizationId, initiatedByUserId } = job.data;
    const execution = await this.executionsService.createExecution(workflowId, organizationId);

    await this.executionsService.updateStatus(execution.id, ExecutionStatus.RUNNING);
    this.workflowGateway.emitExecutionUpdate(organizationId, { executionId: execution.id, workflowId, status: ExecutionStatus.RUNNING });

    try {
      await this.executionsService.addLog({ executionId: execution.id, stepName: 'start', message: 'Workflow processing started', status: ExecutionStatus.RUNNING });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.executionsService.addLog({
        executionId: execution.id,
        stepName: 'complete',
        message: 'Workflow processed successfully',
        status: ExecutionStatus.COMPLETED,
      });
      await this.executionsService.updateStatus(execution.id, ExecutionStatus.COMPLETED);
      this.workflowGateway.emitExecutionUpdate(organizationId, {
        executionId: execution.id,
        workflowId,
        status: ExecutionStatus.COMPLETED,
      });
      await this.auditService.log({
        organizationId,
        userId: initiatedByUserId,
        action: 'workflow.executed',
        metadata: { workflowId, executionId: execution.id, jobId: job.id ?? undefined },
      });
    } catch (error) {
      await this.executionsService.addLog({ executionId: execution.id, stepName: 'error', message: error instanceof Error ? error.message : 'Unknown processing error', status: ExecutionStatus.FAILED });
      await this.executionsService.updateStatus(execution.id, ExecutionStatus.FAILED);
      this.workflowGateway.emitExecutionUpdate(organizationId, { executionId: execution.id, workflowId, status: ExecutionStatus.FAILED });
      await this.auditService.log({
        organizationId,
        userId: initiatedByUserId,
        action: 'workflow.failed',
        metadata: {
          workflowId,
          executionId: execution.id,
          error: error instanceof Error ? error.message : 'Unknown processing error',
          jobId: job.id ?? undefined,
        },
      });
      throw error;
    }
  }
}
