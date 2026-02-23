import { api } from '../lib/api';
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from './auth.service';
import {
  CreateWorkflowPayload,
  RunWorkflowPayload,
  RunWorkflowResponse,
  UpdateWorkflowPayload,
  Workflow,
} from './workflows.service';

// API call examples:
// register(payload) -> POST /api/auth/register
// login(payload) -> POST /api/auth/login
// listWorkflows() -> GET /api/workflows
// createWorkflow(payload) -> POST /api/workflows
// updateWorkflow(id, payload) -> PUT /api/workflows/:workflowId
// deleteWorkflow(id) -> DELETE /api/workflows/:workflowId
// runWorkflow(id, payload) -> POST /api/workflows/:workflowId/runs

export const apiService = {
  register(payload: RegisterPayload): Promise<{ data: AuthResponse }> {
    return api.post('/auth/register', payload);
  },
  login(payload: LoginPayload): Promise<{ data: AuthResponse }> {
    return api.post('/auth/login', payload);
  },
  listWorkflows(): Promise<{ data: Workflow[] }> {
    return api.get('/workflows');
  },
  createWorkflow(payload: CreateWorkflowPayload): Promise<{ data: Workflow }> {
    return api.post('/workflows', payload);
  },
  updateWorkflow(
    workflowId: string,
    payload: UpdateWorkflowPayload,
  ): Promise<{ data: Workflow }> {
    return api.put(`/workflows/${workflowId}`, payload);
  },
  deleteWorkflow(workflowId: string): Promise<{ data: void }> {
    return api.delete(`/workflows/${workflowId}`);
  },
  runWorkflow(
    workflowId: string,
    payload: RunWorkflowPayload,
  ): Promise<{ data: RunWorkflowResponse }> {
    return api.post(`/workflows/${workflowId}/runs`, payload);
  },
};
