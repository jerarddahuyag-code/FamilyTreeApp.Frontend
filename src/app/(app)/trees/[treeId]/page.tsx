import { TreeWorkspaceClient } from './TreeWorkspaceClient';

interface TreeWorkspaceProps {
  params: Promise<{ treeId: string }>;
}

export default async function TreeWorkspacePage({ params }: TreeWorkspaceProps) {
  const { treeId } = await params;

  return <TreeWorkspaceClient treeId={treeId} />;
}
