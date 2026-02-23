'use client';

import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { workflowsService } from '../../services/workflows.service';
import { useAuthStore } from '../../store/auth.store';
import { useUserStore } from '../../store/user.store';
import { useOrgStore } from '../../store/org.store';
import { WorkflowBuilderPlaceholder } from '../../components/workflow-builder-placeholder';
import { SocketStatus } from '../../components/socket-status';

const analyticsData = [
  { day: 'Mon', executions: 6 }, { day: 'Tue', executions: 8 }, { day: 'Wed', executions: 7 },
  { day: 'Thu', executions: 12 }, { day: 'Fri', executions: 10 }, { day: 'Sat', executions: 4 }, { day: 'Sun', executions: 5 },
];

export default function DashboardPage(): JSX.Element {
  const accessToken = useAuthStore((s) => s.accessToken);
  const clear = useAuthStore((s) => s.clear);
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const organizationId = useOrgStore((s) => s.organizationId);
  const setOrganizationId = useOrgStore((s) => s.setOrganizationId);
  const [workflows, setWorkflows] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!accessToken) return;
    const payload = parseJwt(accessToken);
    if (payload) {
      setUser({ id: payload.userId, email: payload.email, role: payload.role });
      setOrganizationId(payload.organizationId);
    }
  }, [accessToken, setOrganizationId, setUser]);

  useEffect(() => {
    if (!accessToken) return;
    void workflowsService.list().then((items) => setWorkflows(items.map((i) => ({ id: i.id, name: i.name }))));
  }, [accessToken]);

  const title = useMemo(() => `Welcome ${user?.email ?? 'User'}`, [user?.email]);

  if (!accessToken) {
    return <main><div className="card"><h2>Unauthorized</h2><p>Please login first.</p></div></main>;
  }

  return (
    <main className="grid">
      <div className="card"><h1>{title}</h1><p>Role: {user?.role}</p><p>Organization: {organizationId}</p><button onClick={clear}>Logout</button></div>
      <SocketStatus organizationId={organizationId} />
      <div className="card"><h2>Workflows</h2><ul>{workflows.map((w)=><li key={w.id}>{w.name}</li>)}</ul></div>
      <div className="card" style={{ height: 280 }}><h2>Analytics (Placeholder)</h2>
        <ResponsiveContainer width="100%" height="85%"><LineChart data={analyticsData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Line type="monotone" dataKey="executions" stroke="#334155" strokeWidth={2} /></LineChart></ResponsiveContainer>
      </div>
      <WorkflowBuilderPlaceholder />
    </main>
  );
}

function parseJwt(token: string): { userId: string; email: string; role: 'ADMIN' | 'MEMBER'; organizationId: string } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as { userId: string; email: string; role: 'ADMIN' | 'MEMBER'; organizationId: string };
  } catch {
    return null;
  }
}
