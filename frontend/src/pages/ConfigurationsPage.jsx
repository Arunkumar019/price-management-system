import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { configurationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import DeleteModal from '../components/DeleteModal';
import { FiSearch, FiEye, FiEdit2, FiTrash2, FiSliders, FiPlus, FiClock } from 'react-icons/fi';

const ConfigurationsPage = () => {
  const { showToast } = useAuth();
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingConfig, setDeletingConfig] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchConfigurations();
  }, [search]);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const data = await configurationService.getAll(search);
      setConfigurations(data);
    } catch (err) {
      showToast('Failed to fetch saved configurations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingConfig) return;
    setDeleting(true);
    try {
      await configurationService.delete(deletingConfig.id);
      showToast(`Deleted configuration '${deletingConfig.title}'`, 'success');
      setIsDeleteOpen(false);
      setDeletingConfig(null);
      fetchConfigurations();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete configuration', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Saved Laptop Configurations</h1>
          <p className="page-subtitle">View, search, edit, or delete customer builds with historical price preservation</p>
        </div>
        <Link to="/builder" className="btn btn-primary">
          <FiPlus /> New Configuration
        </Link>
      </div>

      {/* Search Header */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="search-box" style={{ maxWidth: '500px' }}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search saved configurations by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Configurations List */}
      <div className="glass-card">
        {loading ? (
          <LoadingSpinner message="Loading saved laptop configurations..." />
        ) : configurations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
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
                  <th>Saved Snapshot Price</th>
                  <th>Hardware Components</th>
                  <th>Saved Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {configurations.map((config) => (
                  <tr key={config.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{config.title}</div>
                        {config.description ? (
                          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{config.description}</div>
                        ) : (
                          <div style={{ fontSize: '0.825rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No notes specified</div>
                        )}
                      </div>
                    </td>
                    <td className="font-mono" style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1.15rem' }}>
                      {config.total_price.toFixed(2)}
                    </td>
                    <td>
                      <span className="badge badge-category">{config.items?.length || 0} Components</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FiClock /> {new Date(config.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <Link to={`/configurations/{config.id}`} className="btn btn-secondary btn-sm" title="View Full Details">
                          <FiEye /> View
                        </Link>
                        <Link to={`/configurations/{config.id}/edit`} className="btn btn-secondary btn-sm" title="Edit Configuration">
                          <FiEdit2 /> Edit
                        </Link>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          onClick={() => {
                            setDeletingConfig(config);
                            setIsDeleteOpen(true);
                          }}
                          title="Delete Configuration"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemTitle={deletingConfig?.title}
        loading={deleting}
      />
    </div>
  );
};

export default ConfigurationsPage;
