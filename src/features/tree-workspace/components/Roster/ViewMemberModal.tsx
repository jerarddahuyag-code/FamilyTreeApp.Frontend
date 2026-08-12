import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { GetFamilyMembersResponseItem } from '../../api/types';
import styles from './ViewMemberModal.module.css';

interface ViewMemberModalProps {
  member: GetFamilyMembersResponseItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewMemberModal({ member, isOpen, onClose }: ViewMemberModalProps) {
  if (!isOpen || !member) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <div className={styles.avatarWrapper}>
            <Avatar 
              src={member.profileInfo.avatarUrl || undefined} 
              name={`${member.profileInfo.firstName || ''} ${member.profileInfo.lastName || ''}`} 
              size="lg" 
            />
          </div>
          <div className={styles.headerInfo}>
            <h2>{member.profileInfo.firstName} {member.profileInfo.lastName}</h2>
            <div className={styles.badges}>
              {member.visibilityStatus === 'Pending' && (
                <span className={`${styles.badge} ${styles.pendingBadge}`}>Pending</span>
              )}
              {member.claimedByUserId ? (
                <span className={`${styles.badge} ${styles.claimedBadge}`}>Claimed</span>
              ) : (
                <span className={`${styles.badge} ${styles.unclaimedBadge}`}>Unclaimed</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <label>Gender</label>
            <span>{member.profileInfo.gender || 'Not specified'}</span>
          </div>
          <div className={styles.detailItem}>
            <label>Birth Date</label>
            <span>{member.profileInfo.birthDate || 'Not specified'}</span>
          </div>
          <div className={styles.detailItem}>
            <label>Phone Number</label>
            <span>{member.profileInfo.phoneNumber || 'Not specified'}</span>
          </div>
        </div>

        <div className={styles.bioSection}>
          <label>Bio</label>
          <p>{member.profileInfo.bio || 'No biography available.'}</p>
        </div>

        <div className={styles.actions}>
          <Button onClick={onClose} variant="primary">Close</Button>
        </div>
      </div>
    </Modal>
  );
}
