'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import styles from './TreeSettingsPage.module.css';

interface TreeAccessDto {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: string;
}

interface UserSearchDto {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export function TreeSettingsPage({ treeId }: { treeId: string }) {
  const queryClient = useQueryClient();
  const [searchEmail, setSearchEmail] = useState('');
  const [debouncedSearchEmail, setDebouncedSearchEmail] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchEmail(searchEmail);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchEmail]);

  const { data: accessList, isLoading } = useQuery<TreeAccessDto[]>({
    queryKey: ['trees', treeId, 'access'],
    queryFn: () => apiClient(`/trees/${treeId}/access`)
  });

  const { data: searchResults, isLoading: isSearching } = useQuery<{ value: { userList: UserSearchDto[] } }>({
    queryKey: ['users', 'search', debouncedSearchEmail],
    queryFn: () => apiClient(`/Users?IncludePrivate=false&SearchEmail=${encodeURIComponent(debouncedSearchEmail)}`),
    enabled: debouncedSearchEmail.length > 2
  });

  const addAccessMutation = useMutation({
    mutationFn: (userId: string) => 
      apiClient(`/trees/${treeId}/access/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ accessLevel: 'Member' })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees', treeId, 'access'] });
      setSearchEmail('');
    }
  });

  const removeAccessMutation = useMutation({
    mutationFn: (userId: string) => 
      apiClient(`/trees/${treeId}/access/${userId}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees', treeId, 'access'] });
    }
  });

  const handleAddAccess = (userId: string) => {
    if (accessList?.some(a => a.userId === userId)) {
      alert('User already has access');
      return;
    }
    addAccessMutation.mutate(userId);
  };

  const { data: treeData } = useQuery<{ value: { name: string } }>({
    queryKey: ['trees', treeId],
    queryFn: () => apiClient(`/Trees/${treeId}`)
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href={`/trees/${treeId}`} className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Workspace
        </Link>
        <h1 className={styles.title}>{treeData?.value?.name ? `${treeData.value.name} Settings` : 'Tree Settings'}</h1>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Manage Access</h2>
          <p className={styles.sectionDesc}>Control who can view and edit this family tree.</p>

          <div className={styles.searchBox}>
            <h3 className={styles.subTitle}>Add People</h3>
            <input 
              type="email" 
              placeholder="Search by email address..." 
              className={styles.input}
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
            
            {debouncedSearchEmail.length > 2 && (
              <div className={styles.searchResults}>
                {isSearching ? (
                  <div className={styles.searchItem}>Searching...</div>
                ) : searchResults?.value?.userList?.length ? (
                  searchResults.value.userList
                    .filter(user => !accessList?.some(a => a.userId === user.userId))
                    .length > 0 ? (
                    searchResults.value.userList
                      .filter(user => !accessList?.some(a => a.userId === user.userId))
                      .map(user => (
                        <div key={user.userId} className={styles.searchItem}>
                          <div className={styles.userInfo}>
                            <Avatar name={user.email} size="sm" />
                            <div className={styles.userDetails}>
                              <div className={styles.userName}>{user.firstName} {user.lastName}</div>
                              <div className={styles.userEmail}>{user.email}</div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            isLoading={addAccessMutation.isPending}
                            onClick={() => handleAddAccess(user.userId)}
                          >
                            <UserPlus size={14} className={styles.btnIcon} /> Add
                          </Button>
                        </div>
                      ))
                  ) : (
                    <div className={styles.searchItem}>All matching users already have access.</div>
                  )
                ) : (
                  <div className={styles.searchItem}>No users found.</div>
                )}
              </div>
            )}
          </div>

          <div className={styles.accessList}>
            <h3 className={styles.subTitle}>People with access</h3>
            {isLoading ? (
              <div>Loading access list...</div>
            ) : accessList?.map(access => (
              <div key={access.userId} className={styles.accessItem}>
                <div className={styles.userInfo}>
                  <Avatar name={access.email} src={access.avatarUrl || undefined} size="sm" />
                  <div className={styles.userDetails}>
                    <div className={styles.userName}>
                      {access.firstName ? `${access.firstName} ${access.lastName}` : access.email}
                    </div>
                    <div className={styles.userEmail}>{access.email}</div>
                  </div>
                </div>
                <div className={styles.accessActions}>
                  {access.role === 'Owner' ? (
                    <Badge variant="owner">Owner</Badge>
                  ) : (
                    <div className={styles.roleSelectWrapper}>
                      <select 
                        className={styles.roleSelect} 
                        defaultValue={access.role}
                        onChange={(e) => {
                          // Handle role change here in future
                          console.log('Role changed to', e.target.value);
                        }}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Member">Member</option>
                      </select>
                    </div>
                  )}
                  
                  {access.role !== 'Owner' && (
                    <button 
                      className={styles.removeBtn}
                      onClick={() => {
                        if (confirm(`Remove access for ${access.email}?`)) {
                          removeAccessMutation.mutate(access.userId);
                        }
                      }}
                      title="Remove access"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
