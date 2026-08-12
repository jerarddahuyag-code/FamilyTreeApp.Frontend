import React from 'react';
import Link from 'next/link';
import { Globe, Lock, Pencil, Trash2, ArrowRight, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge/Badge';
import styles from './TreeCard.module.css';

export interface TreeInfo {
  treeId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface TreeCardProps {
  tree: TreeInfo;
  onEdit: (tree: TreeInfo) => void;
  onDelete: (tree: TreeInfo) => void;
}

export const TreeCard: React.FC<TreeCardProps> = ({ tree, onEdit, onDelete }) => {
  const canManage = tree.role === 'Owner' || tree.role === 'Admin';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleArea}>
          <h3 className={styles.name} title={tree.name}>{tree.name}</h3>
          <div className={styles.badges}>
            <Badge variant={tree.role.toLowerCase() as 'owner' | 'admin' | 'member'}>
              {tree.role}
            </Badge>
            <Badge variant={tree.isPublic ? 'public' : 'private'}>
              {tree.isPublic ? <><Globe size={10} /> Public</> : <><Lock size={10} /> Private</>}
            </Badge>
          </div>
        </div>
        {canManage && (
          <div className={styles.actions}>
            <Link
              href={`/trees/${tree.treeId}/settings`}
              className={styles.actionButton}
              title="Tree Settings"
              aria-label="Tree Settings"
              onClick={(e) => e.stopPropagation()}
            >
              <Users size={15} />
            </Link>
            <button
              className={styles.actionButton}
              onClick={(e) => { e.stopPropagation(); onEdit(tree); }}
              title="Edit tree"
              aria-label="Edit tree"
            >
              <Pencil size={15} />
            </button>
            <button
              className={`${styles.actionButton} ${styles.actionButtonDanger}`}
              onClick={(e) => { e.stopPropagation(); onDelete(tree); }}
              title="Delete tree"
              aria-label="Delete tree"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {tree.description && (
        <p className={styles.description}>{tree.description}</p>
      )}

      <div className={styles.cardFooter}>
        <span className={styles.timestamp}>Updated {formatDate(tree.updatedAt)}</span>
        <Link href={`/trees/${tree.treeId}`} className={styles.openButton}>
          Open <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
