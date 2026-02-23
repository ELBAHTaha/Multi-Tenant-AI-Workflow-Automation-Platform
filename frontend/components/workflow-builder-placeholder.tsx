'use client';

import { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

const nodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Trigger' }, position: { x: 50, y: 50 } },
  { id: '2', data: { label: 'Action' }, position: { x: 250, y: 150 } },
];
const edges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

export function WorkflowBuilderPlaceholder() {
  const preparedNodes = useMemo(() => nodes, []);
  const preparedEdges = useMemo(() => edges, []);
  return (
    <div className="card" style={{ height: 400 }}>
      <h2>Workflow Builder (Prepared)</h2>
      <div style={{ height: 320 }}>
        <ReactFlow nodes={preparedNodes} edges={preparedEdges} fitView>
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}

