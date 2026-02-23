import { WorkflowStatus } from '../services/workflows.service';

const STATUS_COLORS: Record<WorkflowStatus, string> = {
  PENDING: '#334155',
  RUNNING: '#1d4ed8',
  FAILED: '#b91c1c',
  COMPLETED: '#15803d',
};

export function StatusBadge({
  status,
}: {
  status: WorkflowStatus;
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: 999,
        color: '#fff',
        fontSize: 12,
        background: STATUS_COLORS[status],
      }}
    >
      {status}
    </span>
  );
}

