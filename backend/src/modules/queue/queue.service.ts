import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('workflow-queue') private readonly workflowQueue: Queue) {}

  async enqueueProcessWorkflow(workflowId: string, organizationId: string): Promise<void> {
    await this.workflowQueue.add('processWorkflow', { workflowId, organizationId }, { attempts: 3, backoff: { type: 'exponential', delay: 3000 } });
  }
}
