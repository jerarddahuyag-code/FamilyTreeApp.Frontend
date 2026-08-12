import React from 'react';
import { Eye, Edit2, Trash2, UserPlus, UserMinus, ShieldAlert } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { useAuthStore } from '@/stores/auth-store';
import { GetFamilyMembersResponseItem } from '../../api/types';
import { useClaimMember, useUnclaimMember } from '../../api/roster-api';
import { useTreeStore } from '@/stores/tree-store';
import styles from './RosterListItem.module.css';

interface RosterListItemProps {
  treeId: string;
  member: GetFamilyMembersResponseItem;
  onEdit: (member: GetFamilyMembersResponseItem) => void;
  onDelete: (member: GetFamilyMembersResponseItem) => void;
  onView: (member: GetFamilyMembersResponseItem) => void;
}

export function RosterListItem({ treeId, member, onEdit, onDelete, onView }: RosterListItemProps) {
  const { user } = useAuthStore();
  const claimMutation = useClaimMember();
  const unclaimMutation = useUnclaimMember();
  const currentRole = useTreeStore(state => state.currentRole);
  const canEdit = currentRole === 'Admin' || currentRole === 'Owner';

  const isClaimedByMe = member.claimedByUserId === user?.id;
  const isClaimedByOther = member.claimedByUserId && member.claimedByUserId !== user?.id;
  const isUnclaimed = !member.claimedByUserId;

  const handleClaimToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isClaimedByMe) {
      unclaimMutation.mutate({ treeId, memberId: member.familyMemberId });
    } else if (isUnclaimed) {
      claimMutation.mutate({ treeId, memberId: member.familyMemberId });
    }
  };

  return (
    <div className={styles.itemContainer}>
      <div className={styles.memberInfo} onClick={() => onView(member)}>
        <Avatar 
          src={member.profileInfo.avatarUrl || undefined} 
          name={`${member.profileInfo.firstName || ''} ${member.profileInfo.lastName || ''}`} 
          size="sm" 
        />
        <div className={styles.nameDetails}>
          <span className={styles.name}>
            {member.profileInfo.firstName} {member.profileInfo.lastName}
          </span>
          {member.visibilityStatus === 'Pending' && (
            <span className={styles.pendingBadge}>Pending</span>
          )}
        </div>
      </div>

      <div className={styles.actionGroup}>
        <button 
          className={`${styles.actionBtn} ${styles.viewBtn}`} 
          onClick={(e) => { e.stopPropagation(); onView(member); }}
          title="View Details"
        >
          <Eye size={16} />
        </button>
        {canEdit && (
          <>
            <button 
              className={`${styles.actionBtn} ${styles.editBtn}`} 
              onClick={(e) => { e.stopPropagation(); onEdit(member); }}
              title="Edit Member"
            >
              <Edit2 size={16} />
            </button>
            <button 
              className={`${styles.actionBtn} ${styles.deleteBtn}`} 
              onClick={(e) => { e.stopPropagation(); onDelete(member); }}
              title="Delete Member"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
        
        <div className={styles.divider} />

        <button 
          className={`${styles.actionBtn} ${isClaimedByMe ? styles.claimedBtn : isUnclaimed ? styles.unclaimedBtn : styles.claimedByOtherBtn}`} 
          onClick={handleClaimToggle}
          disabled={isClaimedByOther || claimMutation.isPending || unclaimMutation.isPending}
          title={isClaimedByMe ? "Unclaim this profile" : isUnclaimed ? "Claim this profile" : "Claimed by another user"}
        >
          {isClaimedByMe ? (
            <UserMinus size={16} />
          ) : isUnclaimed ? (
            <UserPlus size={16} />
          ) : (
            <ShieldAlert size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
