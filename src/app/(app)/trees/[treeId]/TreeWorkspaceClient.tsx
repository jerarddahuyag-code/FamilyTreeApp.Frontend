'use client';

import React, { useState } from 'react';
import { ReactFlowProvider, useOnSelectionChange } from '@xyflow/react';
import { TreeCanvas } from '@/features/tree-workspace/components/Canvas/TreeCanvas';
import { WorkspaceSidebar } from '@/features/tree-workspace/components/Sidebar/WorkspaceSidebar';
import styles from './trees.module.css';

function WorkspaceContent({ treeId }: { treeId: string }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      const selected = nodes.filter(n => n.selected);
      if (selected.length === 1) {
        setSelectedNodeId(selected[0].id);
      } else {
        setSelectedNodeId(null);
      }
    },
  });

  return (
    <div className={styles.workspaceContainer}>
      <div className={styles.canvasArea}>
        <TreeCanvas treeId={treeId} />
      </div>
      <WorkspaceSidebar treeId={treeId} selectedNodeId={selectedNodeId} />
    </div>
  );
}

export function TreeWorkspaceClient({ treeId }: { treeId: string }) {
  return (
    <div className={styles.pageContainer}>
      <ReactFlowProvider>
        <WorkspaceContent treeId={treeId} />
      </ReactFlowProvider>
    </div>
  );
}
