import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvas, useAddTreeNode } from '../../api/canvas-api';
import { useTreeStore } from '@/stores/tree-store';
import { FamilyMemberNode } from './FamilyMemberNode';
import { FamilyEdge } from './FamilyEdge';
import { useAutoSave } from '../../hooks/useAutoSave';
import styles from './TreeCanvas.module.css';
import { TreeNodeDto, TreeEdgeDto } from '../../api/types';

const nodeTypes = {
  familyMember: FamilyMemberNode,
};

const edgeTypes = {
  familyEdge: FamilyEdge,
};

interface TreeCanvasProps {
  treeId: string;
}

export function TreeCanvas({ treeId }: TreeCanvasProps) {
  const { data, isLoading } = useCanvas(treeId);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { markUnsaved, saveLayout, isSaving, hasUnsavedChanges } = useAutoSave(treeId);
  const { mutateAsync: addTreeNode, isPending: isAddingNode } = useAddTreeNode();
  const currentRole = useTreeStore(state => state.currentRole);
  const canEditCanvas = currentRole === 'Admin' || currentRole === 'Owner';

  useEffect(() => {
    if (data) {
      const initialNodes: Node[] = data.nodes.map((node: TreeNodeDto) => ({
        id: node.id,
        type: 'familyMember',
        position: node.position,
        data: node as any,
      }));
      const initialEdges: Edge[] = data.edges.map((edge: TreeEdgeDto) => ({
        id: edge.id,
        type: 'familyEdge',
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
      }));

      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [data, setNodes, setEdges]);

  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
    const hasPositionChange = changes.some((c: any) => c.type === 'position' && c.dragging);
    if (hasPositionChange) {
      markUnsaved();
    }
  }, [onNodesChange, markUnsaved]);

  if (isLoading) {
    return <div className={styles.loading}>Loading canvas...</div>;
  }

  return (
    <div className={styles.canvasContainer}>
      {canEditCanvas && (
        <div className={styles.toolbar}>
          <button
            onClick={() => {
              addTreeNode({
                treeId,
                nodeType: 'Single',
                x: 0,
                y: 0,
                familyMemberIds: []
              });
            }}
            disabled={isAddingNode}
            className={styles.saveBtn}
            style={{ marginRight: '8px' }}
          >
            {isAddingNode ? 'Adding...' : 'Add Node'}
          </button>
          <button 
            onClick={saveLayout} 
            disabled={!hasUnsavedChanges || isSaving}
            className={styles.saveBtn}
          >
            {isSaving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={canEditCanvas ? handleNodesChange : undefined}
        onEdgesChange={canEditCanvas ? onEdgesChange : undefined}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={canEditCanvas}
        nodesConnectable={canEditCanvas}
        elementsSelectable={true}
        fitView
      >
        <Background color="var(--color-bg-elevated)" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
