'use client';

import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function SocketStatus({ organizationId }: { organizationId: string | null }): JSX.Element {
  const [messages, setMessages] = useState<string[]>([]);
  const wsUrl = useMemo(() => process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost', []);

  useEffect(() => {
    if (!organizationId) return;
    const socket: Socket = io(wsUrl, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => socket.emit('joinOrganization', { organizationId }));
    socket.on('workflowExecutionStatus', (payload: { executionId: string; workflowId: string; status: string }) => {
      setMessages((prev) => [`Execution ${payload.executionId} for workflow ${payload.workflowId}: ${payload.status}`, ...prev]);
    });

    return () => socket.disconnect();
  }, [organizationId, wsUrl]);

  return <div className="card"><h2>Realtime Execution Updates</h2><ul>{messages.slice(0,5).map((m)=><li key={m}>{m}</li>)}</ul></div>;
}
