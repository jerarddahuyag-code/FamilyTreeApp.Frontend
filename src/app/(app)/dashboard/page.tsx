'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Search, X, TreePine } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { Button } from '@/components/ui/Button/Button';
import { TreeCard } from '@/features/dashboard/components/TreeCard';
import { DashboardStats } from '@/features/dashboard/components/DashboardStats';
import { CreateTreeModal, EditTreeModal, DeleteTreeModal } from '@/features/dashboard/components/TreeModals';
import type { TreeInfo } from '@/features/dashboard/components/TreeCard';
import styles from '@/features/dashboard/components/Dashboard.module.css';

interface TreeListResponse {
  trees: TreeInfo[];
}

type FilterTab = 'all' | 'mine' | 'public';
type SortOption = 'updatedAt' | 'name' | 'createdAt';

export default function DashboardPage() {
  const [trees, setTrees] = useState<TreeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Search, filter, sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updatedAt');

  // Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTree, setEditTree] = useState<TreeInfo | null>(null);
  const [deleteTree, setDeleteTree] = useState<TreeInfo | null>(null);

  const fetchTrees = useCallback(async () => {
    try {
      const res = await apiClient<{ value: TreeListResponse; isSuccess: boolean }>('/trees?includePrivate=true');
      if (res && res.isSuccess && res.value?.trees) {
        setTrees(res.value.trees);
      } else {
        toast.error('Failed to load trees');
      }
    } catch {
      toast.error('Error fetching trees');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTrees();
  }, [fetchTrees]);

  // Filtered and sorted trees
  const displayedTrees = useMemo(() => {
    let filtered = [...trees];

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Apply filter tab
    if (activeFilter === 'mine') {
      filtered = filtered.filter((t) => t.role === 'Owner');
    } else if (activeFilter === 'public') {
      filtered = filtered.filter((t) => t.isPublic);
    }

    // Apply sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // Default: updatedAt descending
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return filtered;
  }, [trees, searchQuery, activeFilter, sortBy]);

  // CRUD handlers
  const handleCreateTree = async (data: { name: string; description: string; isPublic: boolean }) => {
    await apiClient('/trees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    toast.success('Tree created successfully');
    setIsLoading(true);
    await fetchTrees();
  };

  const handleEditTree = async (
    treeId: string,
    data: { name?: string; description?: string; isPublic?: boolean }
  ) => {
    await apiClient(`/trees/${treeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    toast.success('Tree updated successfully');
    setIsLoading(true);
    await fetchTrees();
  };

  const handleDeleteTree = async (treeId: string) => {
    await apiClient(`/trees/${treeId}`, {
      method: 'DELETE',
    });
    toast.success('Tree deleted successfully');
    setTrees((prev) => prev.filter((t) => t.treeId !== treeId));
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>Manage your family trees</p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsCreateOpen(true)}
          >
            New Tree
          </Button>
        </div>
      </div>

      {/* Stats */}
      {trees.length > 0 && <DashboardStats trees={trees} />}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search trees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className={styles.searchClear}
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className={styles.filterTabs}>
          {(['all', 'mine', 'public'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              className={`${styles.filterTab} ${activeFilter === tab ? styles.filterTabActive : ''}`}
              onClick={() => setActiveFilter(tab)}
            >
              {tab === 'all' ? 'All' : tab === 'mine' ? 'Mine' : 'Public'}
            </button>
          ))}
        </div>

        <select
          className={styles.sortSelect}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
        >
          <option value="updatedAt">Recently Updated</option>
          <option value="name">Name</option>
          <option value="createdAt">Date Created</option>
        </select>
      </div>

      {/* Tree Grid or Empty State */}
      {displayedTrees.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <TreePine size={28} />
          </div>
          <h2 className={styles.emptyTitle}>
            {trees.length === 0 ? 'No trees yet' : 'No matching trees'}
          </h2>
          <p className={styles.emptyDescription}>
            {trees.length === 0
              ? 'Create your first family tree to get started with mapping your lineage.'
              : 'Try adjusting your search or filters to find what you are looking for.'}
          </p>
          {trees.length === 0 && (
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={() => setIsCreateOpen(true)}
            >
              Create Your First Tree
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.treeGrid}>
          {displayedTrees.map((tree) => (
            <TreeCard
              key={tree.treeId}
              tree={tree}
              onEdit={(t) => setEditTree(t)}
              onDelete={(t) => setDeleteTree(t)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateTreeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTree}
      />
      <EditTreeModal
        isOpen={!!editTree}
        tree={editTree}
        onClose={() => setEditTree(null)}
        onSubmit={handleEditTree}
      />
      <DeleteTreeModal
        isOpen={!!deleteTree}
        tree={deleteTree}
        onClose={() => setDeleteTree(null)}
        onConfirm={handleDeleteTree}
      />
    </div>
  );
}
