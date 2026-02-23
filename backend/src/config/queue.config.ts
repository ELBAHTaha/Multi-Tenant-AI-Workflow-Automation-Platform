import { registerAs } from '@nestjs/config';

export const queueConfig = registerAs('queue', () => ({
  workflowConcurrency: Number(process.env.QUEUE_WORKFLOW_CONCURRENCY ?? 5),
  workflowAttempts: Number(process.env.QUEUE_WORKFLOW_ATTEMPTS ?? 3),
  workflowBackoffMs: Number(process.env.QUEUE_WORKFLOW_BACKOFF_MS ?? 3000),
}));
