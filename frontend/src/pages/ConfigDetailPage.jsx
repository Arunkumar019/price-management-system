import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { configurationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import DeleteModal from '../components/DeleteModal';
import { FiArrowLeft, FiEdit2, FiTrash2, FiShield, FiCpu, FiClock } from 'react-icons/fi';

const ConfigDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAuth();

  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [id]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await configurationService.getById(id);
      setConfig(data);
    } catch (err) {
      showToast('Configuration not found', 'error');
      navigate('/configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await configurationService.delete(id);
      showToast('Configuration deleted', 'success');
      navigate('/configurations');
    } catch (err) {
      showToast('Failed to delete configuration', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading configuration snapshot details..." />;
  if (!config) return null;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/configurations" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
          <FiArrowLeft /> Back to Configurations
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">{config.title}</h1>
          <p className="page-subtitle">
            Saved on {new Date(config.created_at).toLocaleString()} • {config.items?.length || 0} Snapshot Parts
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to={`/configurations/{id}/edit`} className="btn btn-secondary">
            <FiEdit2 /> Edit Build
          </Link>
          <button className="btn btn-danger" onClick={() => setIsDeleteOpen(true)}>
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>

      {/* Preservation Alert Banner */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 'var(--border-radius-sm)',
        padding: '1rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ color: 'var(--primary)', fontSize: '1.5rem', display: 'flex' }}>
          <FiShield />
        </div>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Historical Price Preservation Active</h4>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            The prices listed below reflect the exact locked component price snapshot saved on creation date. Subsequent price updates in the catalog do not affect this historical record.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        {/* Component Snapshot Items Breakdown */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Selected Components & Snapshot Prices</h3>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Selected Component</th>
                  <th>Brand</th>
                  <th style={{ textAlign: 'right' }}>Preserved Snapshot Price</th>
                </tr>
              </thead>
              <tbody>
                {config.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="badge badge-category">{item.component_category}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff' }}>
                        {item.component_name}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{item.brand}</td>
                    <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)', fontSize: '1.05rem' }}>
                      {item.price_at_addition.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Cost Summary Card */}
        <div className="glass-card" style={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '0.75rem' }}>
            Configuration Summary
          </h3>

          {config.description && (
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Description / Notes</span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{config.description}</p>
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Snapshot Created</span>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiClock /> {new Date(config.created_at).toLocaleString()}
            </div>
          </div>

          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--bg-card-border)', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Configuration Price:</span>
            <div className="font-mono" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.2rem' }}>
              {config.total_price.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        itemTitle={config.title}
        loading={deleting}
      />
    </div>
  );
};

export default ConfigDetailPage;
