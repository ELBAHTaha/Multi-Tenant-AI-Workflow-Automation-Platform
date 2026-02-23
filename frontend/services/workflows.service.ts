import { api } from '../lib/api';

interface Workflow { id: string; name: string; }
interface CreateWorkflowPayload { name: string; definition: { nodes: Array<Record<string, unknown>>; edges: Array<Record<string, unknown>> }; }

export const workflowsService = {
  async list(): Promise<Workflow[]> {
    const response = await api.get<Workflow[]>('/workflows');
    return response.data;
  },
  async create(payload: CreateWorkflowPayload): Promise<Workflow> {
    const response = await api.post<Workflow>('/workflows', payload);
    return response.data;
  },
};
