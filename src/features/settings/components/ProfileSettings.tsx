'use client';

import React, { useState, useEffect } from 'react';
import styles from './ProfileSettings.module.css';
import { useProfile, UserProfile } from '../hooks/useProfile';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { Save } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar/Avatar';

export function ProfileSettings() {
  const { data: profile, isLoading, error } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    avatarUrl: '',
    phoneNumber: '',
    gender: '',
    bio: '',
    isPublic: false,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        birthDate: profile.birthDate ? profile.birthDate.split('T')[0] : '',
        avatarUrl: profile.avatarUrl || '',
        phoneNumber: profile.phoneNumber || '',
        gender: profile.gender || '',
        bio: profile.bio || '',
        isPublic: profile.isPublic || false,
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthDate: formData.birthDate || null,
      avatarUrl: formData.avatarUrl,
      phoneNumber: formData.phoneNumber,
      gender: formData.gender || null,
      bio: formData.bio,
      isPublic: formData.isPublic,
    });
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (error) {
    return <div className={styles.container}>Error loading profile.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile Settings</h1>
        <p className={styles.subtitle}>Manage your personal information and privacy preferences.</p>
      </div>

      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSave}>
          
          <div className={styles.avatarSection}>
            <Avatar name={profile?.email || 'User'} src={formData.avatarUrl} size="lg" />
            <div className={styles.field} style={{ flexGrow: 1 }}>
              <label className={styles.label} htmlFor="avatarUrl">Avatar URL</label>
              <input
                id="avatarUrl"
                name="avatarUrl"
                type="text"
                className={styles.input}
                value={formData.avatarUrl}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className={styles.input}
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className={styles.input}
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              className={styles.textarea}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a little bit about yourself..."
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="birthDate">Birth Date</label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                className={styles.input}
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                className={styles.input}
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              className={styles.select}
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Unspecified</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="NonBinary">Non-Binary</option>
              <option value="PreferNotToSay">Prefer Not to Say</option>
            </select>
          </div>

          <div className={styles.switchField}>
            <div className={styles.switchInfo}>
              <span className={styles.switchTitle}>Public Profile</span>
              <span className={styles.switchDesc}>Allow others to view your basic profile information.</span>
            </div>
            <input
              type="checkbox"
              name="isPublic"
              className={styles.switchInput}
              checked={formData.isPublic}
              onChange={handleChange}
            />
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn} disabled={isPending}>
              {isPending ? (
                <div className={styles.spinner} style={{ width: 20, height: 20 }}></div>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
