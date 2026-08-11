'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import styles from './TreeModals.module.css';
import type { TreeInfo } from './TreeCard';

/* ---------- Create Tree Modal ---------- */

interface CreateTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; isPublic: boolean }) => Promise<void>;
}

export const CreateTreeModal: React.FC<CreateTreeModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setIsPublic(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), isPublic });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Tree" size="sm">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="create-tree-name">Name</label>
          <input
            id="create-tree-name"
            className={styles.input}
            type="text"
            placeholder="Family tree name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="create-tree-desc">Description</label>
          <textarea
            id="create-tree-desc"
            className={styles.textarea}
            placeholder="Optional description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className={styles.toggleGroup}>
          <label className={styles.label}>Public</label>
          <button
            type="button"
            className={`${styles.toggle} ${isPublic ? styles.toggleChecked : ''}`}
            onClick={() => setIsPublic(!isPublic)}
            role="switch"
            aria-checked={isPublic}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
        <div className={styles.formActions}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!name.trim()}>Create Tree</Button>
        </div>
      </form>
    </Modal>
  );
};

/* ---------- Edit Tree Modal ---------- */

interface EditTreeModalProps {
  isOpen: boolean;
  tree: TreeInfo | null;
  onClose: () => void;
  onSubmit: (treeId: string, data: { name?: string; description?: string; isPublic?: boolean }) => Promise<void>;
}

export const EditTreeModal: React.FC<EditTreeModalProps> = ({ isOpen, tree, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tree && isOpen) {
      setName(tree.name);
      setDescription(tree.description || '');
      setIsPublic(tree.isPublic);
    }
  }, [tree, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tree || !name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(tree.treeId, {
        name: name.trim(),
        description: description.trim(),
        isPublic,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Tree" size="sm">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="edit-tree-name">Name</label>
          <input
            id="edit-tree-name"
            className={styles.input}
            type="text"
            placeholder="Family tree name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="edit-tree-desc">Description</label>
          <textarea
            id="edit-tree-desc"
            className={styles.textarea}
            placeholder="Optional description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className={styles.toggleGroup}>
          <label className={styles.label}>Public</label>
          <button
            type="button"
            className={`${styles.toggle} ${isPublic ? styles.toggleChecked : ''}`}
            onClick={() => setIsPublic(!isPublic)}
            role="switch"
            aria-checked={isPublic}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
        <div className={styles.formActions}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!name.trim()}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
};

/* ---------- Delete Tree Modal ---------- */

interface DeleteTreeModalProps {
  isOpen: boolean;
  tree: TreeInfo | null;
  onClose: () => void;
  onConfirm: (treeId: string) => Promise<void>;
}

export const DeleteTreeModal: React.FC<DeleteTreeModalProps> = ({ isOpen, tree, onClose, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!tree) return;
    setIsDeleting(true);
    try {
      await onConfirm(tree.treeId);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Tree" size="sm">
      <div className={styles.deleteWarning}>
        <div className={styles.deleteWarningIcon}>
          <AlertTriangle size={40} />
        </div>
        <p className={styles.deleteWarningText}>
          Are you sure you want to delete <span className={styles.deleteTreeName}>{tree?.name}</span>?
          This action cannot be undone.
        </p>
        <div className={styles.formActions}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="danger" isLoading={isDeleting} onClick={handleDelete}>Delete Tree</Button>
        </div>
      </div>
    </Modal>
  );
};
