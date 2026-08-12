import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useUpdateMemberProfile } from '../../api/roster-api';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { Gender, GetFamilyMembersResponseItem } from '../../api/types';
import styles from './EditMemberModal.module.css';

interface EditMemberModalProps {
  treeId: string;
  member: GetFamilyMembersResponseItem | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FormValues {
  firstName: string;
  lastName: string;
  gender: Gender | '';
  bio: string;
}

export function EditMemberModal({ treeId, member, isOpen, onClose }: EditMemberModalProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: '',
      bio: ''
    }
  });

  useEffect(() => {
    if (member && isOpen) {
      reset({
        firstName: member.profileInfo.firstName || '',
        lastName: member.profileInfo.lastName || '',
        gender: member.profileInfo.gender || '',
        bio: member.profileInfo.bio || ''
      });
    }
  }, [member, isOpen, reset]);

  const { mutateAsync: updateProfile } = useUpdateMemberProfile();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    if (!member) return;
    try {
      setError(null);
      await updateProfile({
        treeId,
        familyMemberId: member.familyMemberId,
        profileInfo: {
          ...member.profileInfo,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          gender: data.gender as Gender || null,
          bio: data.bio || null
        }
      });
      onClose();
    } catch (e: any) {
      setError(e.message || 'An error occurred while updating the member.');
    }
  };

  if (!isOpen || !member) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContent}>
        <h2>Edit Member Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.formGroup}>
            <label>First Name</label>
            <input className={styles.input} {...register('firstName', { required: 'First name is required' })} />
            {errors.firstName && <span className={styles.errorText}>{errors.firstName.message}</span>}
          </div>
          
          <div className={styles.formGroup}>
            <label>Last Name</label>
            <input className={styles.input} {...register('lastName')} />
          </div>

          <div className={styles.formGroup}>
            <label>Gender</label>
            <select className={styles.select} {...register('gender')}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="NonBinary">Non-binary</option>
              <option value="PreferNotToSay">Prefer not to say</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Bio</label>
            <textarea className={styles.textarea} {...register('bio')} rows={3}></textarea>
          </div>

          <div className={styles.actions}>
            <Button onClick={onClose} type="button" variant="secondary">Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
