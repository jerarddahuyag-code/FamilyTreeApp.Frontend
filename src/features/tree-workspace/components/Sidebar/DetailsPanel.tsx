import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { TreeNodeDto, CanvasMemberDto, Gender } from '../../api/types';
import { useUpdateMemberProfile, useRosterMembers } from '../../api/roster-api';
import { useUpdateTreeNode, useRemoveTreeNode } from '../../api/canvas-api';
import { Button } from '@/components/ui/Button/Button';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import styles from './WorkspaceSidebar.module.css';

interface DetailsPanelProps {
  treeId: string;
  selectedNode: TreeNodeDto;
}

export function DetailsPanel({ treeId, selectedNode }: DetailsPanelProps) {
  const { data: rosterData } = useRosterMembers(treeId);
  const { mutateAsync: updateTreeNode, isPending: isUpdatingNode } = useUpdateTreeNode();
  const { mutateAsync: removeTreeNode, isPending: isRemovingNode } = useRemoveTreeNode();
  const [selectedNewMember, setSelectedNewMember] = useState<string>('');

  const handleAddMember = async () => {
    if (!selectedNewMember) return;
    const currentMemberIds = selectedNode.members.map(m => m.id);
    if (currentMemberIds.includes(selectedNewMember)) return;

    await updateTreeNode({
      treeId,
      nodeId: selectedNode.id,
      familyMemberIds: [...currentMemberIds, selectedNewMember]
    });
    setSelectedNewMember('');
  };

  const handleRemoveMember = async (memberIdToRemove: string) => {
    const newMemberIds = selectedNode.members.map(m => m.id).filter(id => id !== memberIdToRemove);
    await updateTreeNode({
      treeId,
      nodeId: selectedNode.id,
      familyMemberIds: newMemberIds
    });
  };

  const handleDeleteNode = async () => {
    if (window.confirm('Are you sure you want to delete this node from the canvas? This will not delete the biological members.')) {
      await removeTreeNode({ treeId, nodeId: selectedNode.id });
    }
  };

  // Find roster members that are not already in this node
  const availableMembers = rosterData?.items?.filter(
    (rosterMember) => !selectedNode.members.some((nodeMember) => nodeMember.id === rosterMember.familyMemberId)
  ) || [];

  return (
    <div className={styles.detailsPanel}>
      <div className={styles.nodeManagementSection} style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
        <h3 style={{ marginBottom: '12px' }}>Node Management</h3>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <select 
            className={styles.select} 
            value={selectedNewMember}
            onChange={(e) => setSelectedNewMember(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">Select a member to add...</option>
            {availableMembers.map(m => (
              <option key={m.familyMemberId} value={m.familyMemberId}>
                {m.profileInfo.firstName} {m.profileInfo.lastName}
              </option>
            ))}
          </select>
          <Button 
            onClick={handleAddMember} 
            disabled={!selectedNewMember || isUpdatingNode}
          >
            Add
          </Button>
        </div>

        <Button 
          variant="danger" 
          onClick={handleDeleteNode}
          disabled={isRemovingNode}
        >
          {isRemovingNode ? 'Deleting Node...' : 'Delete Node'}
        </Button>
      </div>

      {selectedNode.members.length === 0 ? (
        <div className={styles.emptyState}>No members in this node</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {selectedNode.members.map(member => (
            <div key={member.id} style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '0', right: '0', zIndex: 10 }}>
                <Button 
                  variant="secondary" 
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={isUpdatingNode}
                >
                  Remove
                </Button>
              </div>
              <MemberEditor treeId={treeId} member={member} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MemberEditor({ treeId, member }: { treeId: string; member: CanvasMemberDto }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      firstName: member.profileInfo.firstName || '',
      lastName: member.profileInfo.lastName || '',
      gender: member.profileInfo.gender || '',
    }
  });

  const { mutateAsync: updateProfile } = useUpdateMemberProfile();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    reset({
      firstName: member.profileInfo.firstName || '',
      lastName: member.profileInfo.lastName || '',
      gender: member.profileInfo.gender || '',
    });
    setIsEditing(false);
  }, [member, reset]);

  const onSubmit = async (data: any) => {
    await updateProfile({
      treeId,
      familyMemberId: member.id,
      profileInfo: {
        ...member.profileInfo,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender as Gender || null,
      }
    });
    setIsEditing(false);
  };

  if (member.isMasked) {
    return (
      <div className={styles.maskedDetails}>
        <Avatar size="lg" />
        <h3 className={styles.maskedName}>Anonymous Member</h3>
        <p>You do not have permission to view or edit this member.</p>
      </div>
    );
  }

  return (
    <div className={styles.memberEditor}>
      <div className={styles.avatarSection}>
        <Avatar src={member.profileInfo.avatarUrl || undefined} name={`${member.profileInfo.firstName} ${member.profileInfo.lastName}`} size="lg" />
      </div>

      {!isEditing ? (
        <div className={styles.viewMode}>
          <div className={styles.field}>
            <span className={styles.label}>Name</span>
            <span className={styles.value}>{member.profileInfo.firstName} {member.profileInfo.lastName}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Gender</span>
            <span className={styles.value}>{member.profileInfo.gender || 'Not specified'}</span>
          </div>
          <div className={styles.actions}>
            <Button onClick={() => setIsEditing(true)}>Edit Details</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.editMode}>
          <div className={styles.formGroup}>
            <label>First Name</label>
            <input {...register('firstName')} className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label>Last Name</label>
            <input {...register('lastName')} className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label>Gender</label>
            <select {...register('gender')} className={styles.select}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="NonBinary">Non-binary</option>
              <option value="PreferNotToSay">Prefer not to say</option>
            </select>
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => setIsEditing(false)} type="button">Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>Save</Button>
          </div>
        </form>
      )}
    </div>
  );
}
