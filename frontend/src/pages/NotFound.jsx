import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiHome } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <div className="glass-card" style={{ maxWidth: '460px', width: '100%', padding: '3rem 2rem' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--danger-bg)',
          color: 'var(--danger)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          marginBottom: '1.25rem'
        }}>
          <FiAlertCircle />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>404</h1>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          The requested system route does not exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          <FiHome /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
