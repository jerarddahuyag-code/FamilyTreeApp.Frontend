import { useState, useEffect } from 'react';
import { TreeNodeDto, CanvasMemberDto, NodeType } from '../../api/types';
import { useRosterMembers } from '../../api/roster-api';
import { useUpdateTreeNode, useRemoveTreeNode } from '../../api/canvas-api';
import { Button } from '@/components/ui/Button/Button';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { X } from 'lucide-react';
import styles from './WorkspaceSidebar.module.css';

interface DetailsPanelProps {
  treeId: string;
  selectedNode: TreeNodeDto;
}

export function DetailsPanel({ treeId, selectedNode }: DetailsPanelProps) {
  const { data: rosterData } = useRosterMembers(treeId);
  const { mutateAsync: updateTreeNode, isPending: isUpdatingNode } = useUpdateTreeNode();
  const { mutateAsync: removeTreeNode, isPending: isRemovingNode } = useRemoveTreeNode();
  const toast = useToast();

  const [currentNodeId, setCurrentNodeId] = useState(selectedNode.id);
  const [originalNodeType, setOriginalNodeType] = useState<NodeType>(selectedNode.type);
  const [originalMembers, setOriginalMembers] = useState<CanvasMemberDto[]>(selectedNode.members);

  const [pendingNodeType, setPendingNodeType] = useState<NodeType>(selectedNode.type);
  const [pendingMembers, setPendingMembers] = useState<CanvasMemberDto[]>(selectedNode.members);
  const [selectedNewMember, setSelectedNewMember] = useState<string>('');

  const isDirty = 
    pendingNodeType !== originalNodeType || 
    JSON.stringify(pendingMembers.map(m => m.id).sort()) !== JSON.stringify(originalMembers.map(m => m.id).sort());

  useEffect(() => {
    if (selectedNode.id !== currentNodeId) {
      if (isDirty) {
        if (window.confirm('You have unsaved changes. Discard them?')) {
          setCurrentNodeId(selectedNode.id);
          setOriginalNodeType(selectedNode.type);
          setOriginalMembers(selectedNode.members);
          setPendingNodeType(selectedNode.type);
          setPendingMembers(selectedNode.members);
          setSelectedNewMember('');
        }
      } else {
        setCurrentNodeId(selectedNode.id);
        setOriginalNodeType(selectedNode.type);
        setOriginalMembers(selectedNode.members);
        setPendingNodeType(selectedNode.type);
        setPendingMembers(selectedNode.members);
        setSelectedNewMember('');
      }
    } else {
      if (!isDirty) {
        setOriginalNodeType(selectedNode.type);
        setOriginalMembers(selectedNode.members);
        setPendingNodeType(selectedNode.type);
        setPendingMembers(selectedNode.members);
      }
    }
  }, [selectedNode, currentNodeId, isDirty]);

  const getMaxMembers = (type: NodeType) => {
    if (type === 'Single') return 1;
    if (type === 'Partner') return 2;
    return Infinity;
  };

  const handleAddMember = () => {
    if (!selectedNewMember) return;
    
    const memberToAdd = rosterData?.items?.find(m => m.familyMemberId === selectedNewMember);
    if (!memberToAdd) return;

    if (pendingMembers.some(m => m.id === selectedNewMember)) return;

    const maxMembers = getMaxMembers(pendingNodeType);
    if (pendingMembers.length >= maxMembers) {
      toast.error(`Cannot add member. ${pendingNodeType} nodes can only contain up to ${maxMembers} members.`);
      return;
    }

    setPendingMembers([...pendingMembers, {
      id: memberToAdd.familyMemberId,
      profileInfo: memberToAdd.profileInfo,
      isMasked: false,
      visibilityStatus: memberToAdd.visibilityStatus
    }]);
    setSelectedNewMember('');
  };

  const handleChangeNodeType = (newType: NodeType) => {
    const maxMembers = getMaxMembers(newType);
    if (pendingMembers.length > maxMembers) {
      toast.error(`Cannot change to ${newType}. You currently have ${pendingMembers.length} members. Please remove members first.`);
      return;
    }
    setPendingNodeType(newType);
  };

  const handleRemoveMember = (memberIdToRemove: string) => {
    setPendingMembers(pendingMembers.filter(m => m.id !== memberIdToRemove));
  };

  const handleSaveChanges = async () => {
    try {
      await updateTreeNode({
        treeId,
        nodeId: currentNodeId,
        nodeType: pendingNodeType,
        familyMemberIds: pendingMembers.map(m => m.id)
      });
      toast.success('Node updated successfully');
    } catch (error: any) {
      if (error?.response?.data?.error?.code === 'Canvas.NodeTypeLimitExceeded') {
        toast.error('Cannot save. The node type limit has been exceeded.');
      } else {
        toast.error('Failed to save changes.');
      }
    }
  };

  const handleDiscardChanges = () => {
    setPendingNodeType(selectedNode.type);
    setPendingMembers(selectedNode.members);
    setSelectedNewMember('');
  };

  const handleDeleteNode = async () => {
    if (window.confirm('Are you sure you want to delete this node from the canvas? This will not delete the biological members.')) {
      await removeTreeNode({ treeId, nodeId: currentNodeId });
    }
  };

  const availableMembers = rosterData?.items?.filter(
    (rosterMember) => !pendingMembers.some((nodeMember) => nodeMember.id === rosterMember.familyMemberId)
  ) || [];

  return (
    <div className={styles.detailsPanel}>
      <div className={styles.detailsContent}>
        
        <div className={styles.panelCard}>
          <h3 className={styles.cardTitle}>Properties</h3>
          
          <div className={styles.formGroup}>
            <label>Node Type</label>
            <select 
              className={styles.select} 
              value={pendingNodeType}
              onChange={(e) => handleChangeNodeType(e.target.value as NodeType)}
            >
              <option value="Single">Single (1 Member)</option>
              <option value="Partner">Partner (2 Members)</option>
              <option value="MultiPerson">Multi-Person (Unlimited)</option>
            </select>
          </div>
        </div>

        <div className={styles.panelCard}>
          <h3 className={styles.cardTitle}>Members</h3>
          
          <div className={styles.formGroup}>
            <div style={{ display: 'flex', gap: '8px' }}>
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
                disabled={!selectedNewMember || pendingMembers.length >= getMaxMembers(pendingNodeType)}
              >
                Add
              </Button>
            </div>
          </div>

          {pendingMembers.length === 0 ? (
            <div className={styles.emptyState} style={{ marginTop: '16px' }}>No members in this node</div>
          ) : (
            <div className={styles.memberList}>
              {pendingMembers.map(member => (
                <div key={member.id} className={styles.memberCard}>
                  {member.isMasked ? (
                    <>
                      <Avatar size="sm" />
                      <div className={styles.memberInfo}>
                        <span className={styles.memberName}>Anonymous</span>
                        <span className={styles.memberGender}>Hidden</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Avatar src={member.profileInfo.avatarUrl || undefined} name={`${member.profileInfo.firstName} ${member.profileInfo.lastName}`} size="sm" />
                      <div className={styles.memberInfo}>
                        <span className={styles.memberName}>{member.profileInfo.firstName} {member.profileInfo.lastName}</span>
                        <span className={styles.memberGender}>{member.profileInfo.gender || 'Not specified'}</span>
                      </div>
                    </>
                  )}
                  
                  <button 
                    className={styles.removeBtn} 
                    onClick={() => handleRemoveMember(member.id)}
                    title="Remove member"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.dangerSection}>
          <Button 
            variant="danger" 
            onClick={handleDeleteNode}
            disabled={isRemovingNode}
            style={{ width: '100%' }}
          >
            {isRemovingNode ? 'Deleting Node...' : 'Delete Node'}
          </Button>
        </div>
      </div>

      {isDirty && (
        <div className={styles.detailsFooter}>
          <Button 
            variant="secondary" 
            className={styles.cancelBtn}
            onClick={handleDiscardChanges}
            disabled={isUpdatingNode}
          >
            Cancel
          </Button>
          <Button 
            className={styles.saveBtn}
            onClick={handleSaveChanges}
            disabled={isUpdatingNode}
          >
            {isUpdatingNode ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}
