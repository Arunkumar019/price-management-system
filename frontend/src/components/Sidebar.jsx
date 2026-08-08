import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiCpu, FiSliders, FiList } from 'react-icons/fi';

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
    { path: '/components', label: 'Component Catalog', icon: <FiCpu /> },
    { path: '/builder', label: 'Config Builder', icon: <FiSliders /> },
    { path: '/configurations', label: 'Saved Configurations', icon: <FiList /> },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--bg-card-border)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <div style={{ padding: '0 0.75rem 1rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.5rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
          Navigation
        </p>
      </div>

      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--border-radius-sm)',
            textDecoration: 'none',
            fontSize: '0.925rem',
            fontWeight: isActive ? '700' : '500',
            color: isActive ? '#fff' : 'var(--text-muted)',
            background: isActive ? 'var(--primary-gradient)' : 'transparent',
            boxShadow: isActive ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none',
            transition: 'var(--transition)'
          })}
        >
          <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(99, 102, 241, 0.06)', borderRadius: 'var(--border-radius)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>Historical Preservation</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prices saved inside custom configs remain locked even if component catalog prices update.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
