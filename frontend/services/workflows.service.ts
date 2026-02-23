import { api } from '../lib/api';

export type WorkflowStatus = 'PENDING' | 'RUNNING' | 'FAILED' | 'COMPLETED';

export interface Workflow {
  id: string;
  name: string;
  definition: {
    nodes: Array<Record<string, unknown>>;
    edges: Array<Record<string, unknown>>;
  };
  createdAt?: string;
}

export interface CreateWorkflowPayload {
  name: string;
  definition: {
    nodes: Array<Record<string, unknown>>;
    edges: Array<Record<string, unknown>>;
  };
}

export interface UpdateWorkflowPayload {
  name?: string;
  definition?: {
    nodes: Array<Record<string, unknown>>;
    edges: Array<Record<string, unknown>>;
  };
}

export interface RunWorkflowPayload {
  input?: Record<string, unknown>;
}

export interface RunWorkflowResponse {
  status: 'accepted';
  workflowId: string;
  jobId: string;
}

export const workflowsService = {
  async list(): Promise<Workflow[]> {
    const response = await api.get<Workflow[]>('/workflows');
    return response.data;
  },

  async create(payload: CreateWorkflowPayload): Promise<Workflow> {
    const response = await api.post<Workflow>('/workflows', payload);
    return response.data;
  },

  async update(workflowId: string, payload: UpdateWorkflowPayload): Promise<Workflow> {
    const response = await api.put<Workflow>(`/workflows/${workflowId}`, payload);
    return response.data;
  },

  async remove(workflowId: string): Promise<void> {
    await api.delete(`/workflows/${workflowId}`);
  },

  async run(workflowId: string, payload: RunWorkflowPayload): Promise<RunWorkflowResponse> {
    const response = await api.post<RunWorkflowResponse>(
      `/workflows/${workflowId}/runs`,
      payload,
    );
    return response.data;
  },
};
