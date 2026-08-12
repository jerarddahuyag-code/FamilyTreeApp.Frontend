import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionMode,
  addEdge,
  Connection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvas, useAddTreeNode, useAddTreeEdge, useRemoveTreeEdge } from '../../api/canvas-api';
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
  onSelectionChange?: (params: { nodes: Node[]; edges: Edge[] }) => void;
}

export function TreeCanvas({ treeId, onSelectionChange }: TreeCanvasProps) {
  const { data, isLoading } = useCanvas(treeId);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { markUnsaved, saveLayout, isSaving, hasUnsavedChanges } = useAutoSave(treeId);
  const { mutateAsync: addTreeNode, isPending: isAddingNode } = useAddTreeNode();
  const { mutateAsync: addTreeEdge } = useAddTreeEdge();
  const { mutateAsync: removeTreeEdge } = useRemoveTreeEdge();
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

  const handleConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      addTreeEdge({
        treeId,
        sourceNodeId: connection.source,
        targetNodeId: connection.target,
      });
      setEdges((eds) => addEdge({ ...connection, type: 'familyEdge' }, eds));
    }
  }, [addTreeEdge, treeId, setEdges]);

  const handleEdgesDelete = useCallback((deletedEdges: Edge[]) => {
    deletedEdges.forEach((edge) => {
      removeTreeEdge({ treeId, edgeId: edge.id });
    });
  }, [removeTreeEdge, treeId]);

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
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={canEditCanvas ? handleEdgesDelete : undefined}
        onConnect={canEditCanvas ? handleConnect : undefined}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={canEditCanvas}
        nodesConnectable={canEditCanvas}
        elementsSelectable={true}
        deleteKeyCode={canEditCanvas ? ['Backspace', 'Delete'] : null}
        snapToGrid={true}
        snapGrid={[16, 16]}
        fitView
      >
        <Background color="var(--color-bg-elevated)" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
