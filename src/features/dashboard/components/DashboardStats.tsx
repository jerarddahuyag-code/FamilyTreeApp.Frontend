import React from 'react';
import { Trees, Crown, Globe } from 'lucide-react';
import styles from './DashboardStats.module.css';
import type { TreeInfo } from './TreeCard';

interface DashboardStatsProps {
  trees: TreeInfo[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ trees }) => {
  const totalTrees = trees.length;
  const ownedTrees = trees.filter(t => t.role === 'Owner').length;
  const publicTrees = trees.filter(t => t.isPublic).length;

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={`${styles.statIcon} ${styles.green}`}>
          <Trees size={18} />
        </div>
        <span className={styles.statLabel}>Total Trees</span>
        <span className={styles.statValue}>{totalTrees}</span>
      </div>
      <div className={styles.statCard}>
        <div className={`${styles.statIcon} ${styles.amber}`}>
          <Crown size={18} />
        </div>
        <span className={styles.statLabel}>Owned</span>
        <span className={styles.statValue}>{ownedTrees}</span>
      </div>
      <div className={styles.statCard}>
        <div className={`${styles.statIcon} ${styles.blue}`}>
          <Globe size={18} />
        </div>
        <span className={styles.statLabel}>Public</span>
        <span className={styles.statValue}>{publicTrees}</span>
      </div>
    </div>
  );
};
