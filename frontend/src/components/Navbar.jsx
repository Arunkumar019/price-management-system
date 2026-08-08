import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiPlusCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header style={{
      height: 'var(--navbar-height)',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--bg-card-border)',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 900
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TechConfig Pro
        </h2>
        <span className="badge badge-category" style={{ fontSize: '0.7rem' }}>V1.0</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <Link to="/builder" className="btn btn-primary btn-sm">
          <FiPlusCircle /> New Laptop Config
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <FiUser />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user?.full_name || 'Admin User'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user?.email || 'admin@gmail.com'}
            </span>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 0.6rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}
            title="Logout"
          >
            <FiLogOut />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
