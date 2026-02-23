import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ExecutionStatus } from '@prisma/client';
import { ExecutionsService } from '../executions/executions.service';
import { WorkflowGateway } from '../websocket/workflow.gateway';

interface ProcessWorkflowPayload { workflowId: string; organizationId: string; }

@Processor('workflow-queue')
export class QueueProcessor extends WorkerHost {
  constructor(private readonly executionsService: ExecutionsService, private readonly workflowGateway: WorkflowGateway) { super(); }

  async process(job: Job<ProcessWorkflowPayload>): Promise<void> {
    if (job.name !== 'processWorkflow') return;

    const { workflowId, organizationId } = job.data;
    const execution = await this.executionsService.createExecution(workflowId, organizationId);

    await this.executionsService.updateStatus(execution.id, ExecutionStatus.RUNNING);
    this.workflowGateway.emitExecutionUpdate(organizationId, { executionId: execution.id, workflowId, status: ExecutionStatus.RUNNING });

    try {
      await this.executionsService.addLog({ executionId: execution.id, stepName: 'start', message: 'Workflow processing started', status: ExecutionStatus.RUNNING });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.executionsService.addLog({ executionId: execution.id, stepName: 'complete', message: 'Workflow processed successfully', status: ExecutionStatus.SUCCESS });
      await this.executionsService.updateStatus(execution.id, ExecutionStatus.SUCCESS);
      this.workflowGateway.emitExecutionUpdate(organizationId, { executionId: execution.id, workflowId, status: ExecutionStatus.SUCCESS });
    } catch (error) {
      await this.executionsService.addLog({ executionId: execution.id, stepName: 'error', message: error instanceof Error ? error.message : 'Unknown processing error', status: ExecutionStatus.FAILED });
      await this.executionsService.updateStatus(execution.id, ExecutionStatus.FAILED);
      this.workflowGateway.emitExecutionUpdate(organizationId, { executionId: execution.id, workflowId, status: ExecutionStatus.FAILED });
      throw error;
    }
  }
}
