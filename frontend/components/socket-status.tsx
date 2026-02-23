'use client';

import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { WorkflowStatus } from '../services/workflows.service';

export interface WorkflowStatusEvent {
  executionId: string;
  workflowId: string;
  status: WorkflowStatus;
}

export function SocketStatus({
  organizationId,
  onStatusUpdate,
}: {
  organizationId: string | null;
  onStatusUpdate: (event: WorkflowStatusEvent) => void;
}) {
  const [messages, setMessages] = useState<string[]>([]);
  const wsUrl = useMemo(() => process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3003', []);

  useEffect(() => {
    if (!organizationId) {
      return;
    }

    const socket: Socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('joinOrganization', { organizationId });
    });

    socket.on('workflowExecutionStatus', (payload: WorkflowStatusEvent) => {
      onStatusUpdate(payload);
      setMessages((prev) => [
        `${payload.workflowId} => ${payload.status} (${payload.executionId})`,
        ...prev,
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [onStatusUpdate, organizationId, wsUrl]);

  return (
    <div className="card">
      <h2>Realtime Updates</h2>
      <ul>
        {messages.slice(0, 6).map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

