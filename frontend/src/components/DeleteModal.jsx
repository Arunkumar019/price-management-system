import React from 'react';
import Modal from './Modal';
import { FiAlertTriangle } from 'react-icons/fi';

const DeleteModal = ({ isOpen, onClose, onConfirm, title = 'Confirm Deletion', itemTitle, loading = false }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="480px"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ background: 'var(--danger-bg)', padding: '0.75rem', borderRadius: '50%', color: 'var(--danger)', display: 'flex' }}>
          <FiAlertTriangle size={24} />
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.4rem' }}>
            Are you sure you want to delete <span style={{ color: '#fff' }}>"{itemTitle}"</span>?
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            This action cannot be undone. All linked references and configuration items will be permanently removed.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;
