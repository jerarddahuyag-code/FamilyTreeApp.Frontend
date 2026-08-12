import { useState } from 'react';
import { Settings } from 'lucide-react';
import { TreeNodeDto } from '../../api/types';
import { DetailsPanel } from './DetailsPanel';
import { AddMemberModal } from '../Roster/AddMemberModal';
import { RosterListItem } from '../Roster/RosterListItem';
import { ViewMemberModal } from '../Roster/ViewMemberModal';
import { EditMemberModal } from '../Roster/EditMemberModal';
import { ConfirmDeleteModal } from '../Roster/ConfirmDeleteModal';
import { GetFamilyMembersResponseItem } from '../../api/types';
import { Button } from '@/components/ui/Button/Button';
import { useRosterMembers } from '../../api/roster-api';
import { useCanvas } from '../../api/canvas-api';
import { useTreeStore } from '@/stores/tree-store';
import styles from './WorkspaceSidebar.module.css';

interface WorkspaceSidebarProps {
  treeId: string;
  selectedNodeId?: string | null;
}

export function WorkspaceSidebar({ treeId, selectedNodeId }: WorkspaceSidebarProps) {
  const [activeTab, setActiveTab] = useState<'roster' | 'details'>('details');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<GetFamilyMembersResponseItem | null>(null);
  const [editingMember, setEditingMember] = useState<GetFamilyMembersResponseItem | null>(null);
  const [deletingMember, setDeletingMember] = useState<GetFamilyMembersResponseItem | null>(null);
  const { data: rosterData, isLoading } = useRosterMembers(treeId);
  const { data: canvasData } = useCanvas(treeId);
  const currentRole = useTreeStore(state => state.currentRole);
  const canEditTree = currentRole === 'Admin' || currentRole === 'Owner';

  const selectedNode = canvasData?.nodes.find(n => n.id === selectedNodeId);

  return (
    <div className={styles.sidebar}>
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'details' ? styles.active : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'roster' ? styles.active : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          Roster
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'details' && (
          selectedNode ? (
            <DetailsPanel treeId={treeId} selectedNode={selectedNode} />
          ) : (
            <div className={styles.emptyState}>Select a node on the canvas to view details.</div>
          )
        )}
        
        {activeTab === 'roster' && (
          <div className={styles.rosterPanel}>
            <p className={styles.rosterDesc}>Manage the members of this family tree.</p>
            {canEditTree && (
              <Button onClick={() => setIsAddModalOpen(true)}>Add New Member</Button>
            )}
            
            <div className={styles.rosterList}>
              {isLoading ? (
                <div className={styles.emptyState}>Loading roster...</div>
              ) : rosterData?.items?.length ? (
                rosterData.items.map(member => (
                  <RosterListItem
                    key={member.familyMemberId}
                    treeId={treeId}
                    member={member}
                    onView={setViewingMember}
                    onEdit={setEditingMember}
                    onDelete={setDeletingMember}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>No members found.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <AddMemberModal 
        treeId={treeId} 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      <ViewMemberModal
        member={viewingMember}
        isOpen={!!viewingMember}
        onClose={() => setViewingMember(null)}
      />
      <EditMemberModal
        treeId={treeId}
        member={editingMember}
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
      />
      <ConfirmDeleteModal
        treeId={treeId}
        member={deletingMember}
        isOpen={!!deletingMember}
        onClose={() => setDeletingMember(null)}
      />

      <div className={styles.sidebarFooter}>
        {currentRole === 'Owner' && (
          <a href={`/trees/${treeId}/settings`} className={styles.settingsLink}>
            <span className={styles.settingsText}>Tree Settings</span>
            <Settings size={20} className={styles.settingsIcon} />
          </a>
        )}
      </div>
    </div>
  );
}
