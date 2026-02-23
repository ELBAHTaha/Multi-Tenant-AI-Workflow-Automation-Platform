import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('workflow-queue') private readonly workflowQueue: Queue) {}

  async enqueueProcessWorkflow(
    workflowId: string,
    organizationId: string,
    initiatedByUserId: string,
  ): Promise<Job<{ workflowId: string; organizationId: string; initiatedByUserId: string }>> {
    return this.workflowQueue.add(
      'processWorkflow',
      { workflowId, organizationId, initiatedByUserId },
      { jobId: `${organizationId}:${workflowId}:${Date.now()}` },
    );
  }
}
