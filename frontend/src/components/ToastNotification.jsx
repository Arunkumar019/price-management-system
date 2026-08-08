import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastNotification = () => {
  const { toasts, removeToast } = useAuth();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-{toast.type}`}>
          {toast.type === 'success' && <FiCheckCircle style={{ color: 'var(--success)', fontSize: '1.2rem' }} />}
          {toast.type === 'error' && <FiAlertCircle style={{ color: 'var(--danger)', fontSize: '1.2rem' }} />}
          {toast.type === 'info' && <FiInfo style={{ color: 'var(--primary)', fontSize: '1.2rem' }} />}
          
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
          
          <button
            onClick={() => removeToast(toast.id)}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', marginLeft: '0.5rem' }}
          >
            <FiX />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastNotification;
