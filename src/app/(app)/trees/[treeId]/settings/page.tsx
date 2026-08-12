import React from 'react';
import { TreeSettingsPage } from '@/features/tree-workspace/components/Settings/TreeSettingsPage';

export default async function Page({ params }: { params: Promise<{ treeId: string }> }) {
  const resolvedParams = await params;
  return <TreeSettingsPage treeId={resolvedParams.treeId} />;
}
