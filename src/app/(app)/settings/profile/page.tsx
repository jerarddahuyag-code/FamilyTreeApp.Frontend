import React from 'react';
import { ProfileSettings } from '@/features/settings/components/ProfileSettings';

export const metadata = {
  title: 'Profile Settings - FamilyTreeApp',
  description: 'Manage your personal information and privacy preferences.',
};

export default function ProfileSettingsPage() {
  return (
    <div style={{ padding: 'var(--space-6)', width: '100%' }}>
      <ProfileSettings />
    </div>
  );
}
