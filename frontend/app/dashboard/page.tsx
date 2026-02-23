'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { parseApiError } from '../../lib/api-error';
import { SocketStatus, WorkflowStatusEvent } from '../../components/socket-status';
import { StatusBadge } from '../../components/status-badge';
import {
  CreateWorkflowPayload,
  Workflow,
  WorkflowStatus,
  workflowsService,
} from '../../services/workflows.service';
import { useAuthStore } from '../../store/auth.store';
import { useOrgStore } from '../../store/org.store';
import { useUserStore } from '../../store/user.store';

const analyticsData = [
  { day: 'Mon', executions: 6 },
  { day: 'Tue', executions: 8 },
  { day: 'Wed', executions: 7 },
  { day: 'Thu', executions: 12 },
  { day: 'Fri', executions: 10 },
  { day: 'Sat', executions: 4 },
  { day: 'Sun', executions: 5 },
];

interface ViewError {
  message: string;
  details?: unknown;
}

export default function DashboardPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.clear);
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const organizationId = useOrgStore((state) => state.organizationId);
  const clearOrganization = useOrgStore((state) => state.clearOrganization);

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [statusByWorkflowId, setStatusByWorkflowId] = useState<
    Record<string, WorkflowStatus>
  >({});
  const [error, setError] = useState<ViewError | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const [newName, setNewName] = useState('Lead Qualification Flow');
  const [newDefinition, setNewDefinition] = useState(
    JSON.stringify(
      {
        nodes: [{ id: 'start', type: 'trigger', data: { label: 'Start' } }],
        edges: [],
      },
      null,
      2,
    ),
  );

  const [runInputByWorkflowId, setRunInputByWorkflowId] = useState<Record<string, string>>({});
  const [renameByWorkflowId, setRenameByWorkflowId] = useState<Record<string, string>>({});

  const role = user?.role;
  const canCreate = role === 'ADMIN' || role === 'MANAGER';
  const canUpdate = role === 'ADMIN' || role === 'MANAGER';
  const canDelete = role === 'ADMIN';
  const canRun = role === 'ADMIN' || role === 'MANAGER' || role === 'MEMBER';

  const refreshWorkflows = useCallback(async (): Promise<void> => {
    if (!accessToken) {
      return;
    }

    try {
      const items = await workflowsService.list();
      setWorkflows(items);
      setRenameByWorkflowId((previous) => {
        const next = { ...previous };
        for (const workflow of items) {
          if (!next[workflow.id]) {
            next[workflow.id] = workflow.name;
          }
        }
        return next;
      });
    } catch (requestError) {
      setError(parseApiError(requestError));
    }
  }, [accessToken]);

  useEffect(() => {
    void refreshWorkflows();
  }, [refreshWorkflows]);

  const onStatusUpdate = useCallback((event: WorkflowStatusEvent): void => {
    setStatusByWorkflowId((previous) => ({
      ...previous,
      [event.workflowId]: event.status,
    }));
  }, []);

  const logout = (): void => {
    clearAuth();
    clearUser();
    clearOrganization();
    router.push('/login');
  };

  const createWorkflow = async (): Promise<void> => {
    if (!canCreate) {
      return;
    }

    let parsedDefinition: CreateWorkflowPayload['definition'];
    try {
      parsedDefinition = JSON.parse(newDefinition) as CreateWorkflowPayload['definition'];
    } catch {
      setError({ message: 'Workflow definition must be valid JSON.' });
      return;
    }

    if (!newName.trim()) {
      setError({ message: 'Workflow name is required.' });
      return;
    }

    setBusyAction('create');
    setError(null);
    try {
      await workflowsService.create({
        name: newName.trim(),
        definition: parsedDefinition,
      });
      setNewName('');
      await refreshWorkflows();
    } catch (requestError) {
      setError(parseApiError(requestError));
    } finally {
      setBusyAction(null);
    }
  };

  const updateWorkflow = async (workflowId: string): Promise<void> => {
    if (!canUpdate) {
      return;
    }

    const nextName = renameByWorkflowId[workflowId]?.trim();
    if (!nextName) {
      setError({ message: 'Updated workflow name is required.' });
      return;
    }

    setBusyAction(`update:${workflowId}`);
    setError(null);
    try {
      await workflowsService.update(workflowId, { name: nextName });
      await refreshWorkflows();
    } catch (requestError) {
      setError(parseApiError(requestError));
    } finally {
      setBusyAction(null);
    }
  };

  const deleteWorkflow = async (workflowId: string): Promise<void> => {
    if (!canDelete) {
      return;
    }

    setBusyAction(`delete:${workflowId}`);
    setError(null);
    try {
      await workflowsService.remove(workflowId);
      setWorkflows((previous) => previous.filter((workflow) => workflow.id !== workflowId));
    } catch (requestError) {
      setError(parseApiError(requestError));
    } finally {
      setBusyAction(null);
    }
  };

  const runWorkflow = async (workflowId: string): Promise<void> => {
    if (!canRun) {
      return;
    }

    let parsedInput: Record<string, unknown> | undefined;
    const rawInput = runInputByWorkflowId[workflowId];
    if (rawInput && rawInput.trim().length > 0) {
      try {
        parsedInput = JSON.parse(rawInput) as Record<string, unknown>;
      } catch {
        setError({ message: `Run input for workflow ${workflowId} must be valid JSON.` });
        return;
      }
    }

    setBusyAction(`run:${workflowId}`);
    setError(null);
    try {
      await workflowsService.run(workflowId, { input: parsedInput });
      setStatusByWorkflowId((previous) => ({ ...previous, [workflowId]: 'PENDING' }));
    } catch (requestError) {
      setError(parseApiError(requestError));
    } finally {
      setBusyAction(null);
    }
  };

  const title = useMemo(() => `Welcome ${user?.email ?? 'User'}`, [user?.email]);

  if (!accessToken || !user) {
    return (
      <main>
        <div className="card">
          <h2>Unauthorized</h2>
          <p>Please login first.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="grid">
      <section className="card">
        <h1>{title}</h1>
        <p>Role: {user.role}</p>
        <p>Organization: {organizationId}</p>
        <button onClick={logout}>Logout</button>
      </section>

      {canCreate ? (
        <section className="card grid">
          <h2>Create Workflow</h2>
          <label>
            Name
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              required
            />
          </label>
          <label>
            Definition JSON
            <textarea
              value={newDefinition}
              onChange={(event) => setNewDefinition(event.target.value)}
              rows={8}
              style={{ width: '100%' }}
            />
          </label>
          <button disabled={busyAction === 'create'} onClick={() => void createWorkflow()}>
            {busyAction === 'create' ? 'Creating...' : 'Create Workflow'}
          </button>
        </section>
      ) : null}

      <SocketStatus organizationId={organizationId} onStatusUpdate={onStatusUpdate} />

      {error ? (
        <section className="card" style={{ borderColor: '#dc2626' }}>
          <h2 style={{ color: '#b91c1c' }}>Request Error</h2>
          <p>{error.message}</p>
          {error.details ? (
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(error.details, null, 2)}
            </pre>
          ) : null}
        </section>
      ) : null}

      <section className="card">
        <h2>Tenant Workflows</h2>
        <div className="workflow-grid">
          {workflows.map((workflow) => {
            const status = statusByWorkflowId[workflow.id] ?? 'PENDING';
            return (
              <article className="workflow-card" key={workflow.id}>
                <div className="workflow-head">
                  <h3>{workflow.name}</h3>
                  <StatusBadge status={status} />
                </div>
                <p>
                  <strong>ID:</strong> {workflow.id}
                </p>

                {canUpdate ? (
                  <div className="grid">
                    <label>
                      Update Name
                      <input
                        value={renameByWorkflowId[workflow.id] ?? workflow.name}
                        onChange={(event) =>
                          setRenameByWorkflowId((previous) => ({
                            ...previous,
                            [workflow.id]: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <button
                      disabled={busyAction === `update:${workflow.id}`}
                      onClick={() => void updateWorkflow(workflow.id)}
                    >
                      {busyAction === `update:${workflow.id}` ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                ) : null}

                <div className="grid">
                  <label>
                    Run Input JSON
                    <textarea
                      value={runInputByWorkflowId[workflow.id] ?? ''}
                      onChange={(event) =>
                        setRunInputByWorkflowId((previous) => ({
                          ...previous,
                          [workflow.id]: event.target.value,
                        }))
                      }
                      rows={4}
                      style={{ width: '100%' }}
                    />
                  </label>
                  <button
                    disabled={!canRun || busyAction === `run:${workflow.id}`}
                    onClick={() => void runWorkflow(workflow.id)}
                  >
                    {busyAction === `run:${workflow.id}` ? 'Submitting Run...' : 'Run Workflow'}
                  </button>
                </div>

                <button
                  disabled={!canDelete || busyAction === `delete:${workflow.id}`}
                  onClick={() => void deleteWorkflow(workflow.id)}
                >
                  {busyAction === `delete:${workflow.id}` ? 'Deleting...' : 'Delete'}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="card" style={{ height: 280 }}>
        <h2>Execution Trend</h2>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="executions" stroke="#334155" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </main>
  );
}

