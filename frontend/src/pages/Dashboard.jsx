import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiCpu, FiSliders, FiDollarSign, FiPlusCircle, FiEye, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const summary = await dashboardService.getSummary();
      setData(summary);
    } catch (err) {
      setError('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching dashboard analytics..." />;

  if (error) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
        <button className="btn btn-primary" onClick={fetchDashboard}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time overview of system components, saved laptop configurations, and pricing totals</p>
        </div>
        <Link to="/builder" className="btn btn-primary">
          <FiPlusCircle /> Build New Laptop
        </Link>
      </div>

      {/* Summary Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        {/* Total Components */}
        <div className="glass-card glass-card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--border-radius-sm)',
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--primary)',
            fontSize: '1.75rem',
            display: 'flex'
          }}>
            <FiCpu />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Total Components</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
              {data.total_components}
            </h2>
          </div>
        </div>

        {/* Total Configurations */}
        <div className="glass-card glass-card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--border-radius-sm)',
            background: 'rgba(217, 70, 239, 0.15)',
            color: 'var(--accent)',
            fontSize: '1.75rem',
            display: 'flex'
          }}>
            <FiSliders />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Total Configurations</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
              {data.total_configurations}
            </h2>
          </div>
        </div>

        {/* Total Configuration Value */}
        <div className="glass-card glass-card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--border-radius-sm)',
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--success)',
            fontSize: '1.75rem',
            display: 'flex'
          }}>
            <FiDollarSign />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Total Saved Value</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
              {data.total_configuration_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
          </div>
        </div>
      </div>

      {/* Latest Configurations Section */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Latest Saved Configurations</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Recently built laptop configurations with locked historical prices</p>
          </div>
          <Link to="/configurations" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            View All <FiArrowRight />
          </Link>
        </div>

        {!data.latest_configurations.length ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <FiSliders size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No saved laptop configurations found.</p>
            <Link to="/builder" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Create First Configuration
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Configuration Title</th>
                  <th>Total Price</th>
                  <th>Component Count</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.latest_configurations.map((config) => (
                  <tr key={config.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{config.title}</div>
                        {config.description && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{config.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="font-mono" style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1.05rem' }}>
                      {config.total_price.toFixed(2)}
                    </td>
                    <td>
                      <span className="badge badge-category">{config.items?.length || 0} Parts</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(config.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/configurations/{config.id}`} className="btn btn-secondary btn-sm">
                        <FiEye /> Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
