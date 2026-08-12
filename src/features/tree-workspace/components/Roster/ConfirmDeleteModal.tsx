import { useState } from 'react';
import { useDeleteMember } from '../../api/roster-api';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { GetFamilyMembersResponseItem } from '../../api/types';
import { AlertTriangle } from 'lucide-react';
import styles from './ConfirmDeleteModal.module.css';

interface ConfirmDeleteModalProps {
  treeId: string;
  member: GetFamilyMembersResponseItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ConfirmDeleteModal({ treeId, member, isOpen, onClose }: ConfirmDeleteModalProps) {
  const { mutateAsync: deleteMember } = useDeleteMember();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !member) return null;

  const handleDelete = async () => {
    try {
      setError(null);
      setIsDeleting(true);
      await deleteMember({ treeId, memberId: member.familyMemberId });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to delete member.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContent}>
        <div className={styles.iconWrapper}>
          <AlertTriangle size={32} className={styles.warningIcon} />
        </div>
        <h2>Delete Family Member</h2>
        <p className={styles.message}>
          Are you sure you want to permanently delete <strong>{member.profileInfo.firstName} {member.profileInfo.lastName}</strong>? 
          This action cannot be undone and will remove them from all nodes in the canvas.
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <Button onClick={onClose} variant="secondary" disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="primary" isLoading={isDeleting} className={styles.deleteBtn}>
            Yes, Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
