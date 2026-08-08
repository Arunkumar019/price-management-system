import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { componentService, configurationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiArrowLeft, FiSave, FiCheckCircle, FiCpu, FiSliders } from 'react-icons/fi';

const CATEGORIES = [
  'Processor',
  'RAM',
  'Storage',
  'Graphics Card',
  'Display',
  'Battery',
  'Keyboard',
  'Operating System'
];

const ConfigEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [components, setComponents] = useState([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedComponents, setSelectedComponents] = useState({}); // { category: componentId }

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [allComponents, existingConfig] = await Promise.all([
        componentService.getAll({ is_available: true }),
        configurationService.getById(id)
      ]);

      setComponents(allComponents);
      setTitle(existingConfig.title);
      setDescription(existingConfig.description || '');

      // Map existing items to selected state
      const initialMap = {};
      existingConfig.items.forEach((item) => {
        if (item.component_id) {
          initialMap[item.component_category] = item.component_id;
        }
      });

      // Default fallback for any unselected categories
      CATEGORIES.forEach((cat) => {
        if (!initialMap[cat]) {
          const firstInCat = allComponents.find((c) => c.category === cat);
          if (firstInCat) initialMap[cat] = firstInCat.id;
        }
      });

      setSelectedComponents(initialMap);
    } catch (err) {
      showToast('Failed to load configuration details', 'error');
      navigate('/configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectComponent = (category, componentId) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [category]: parseInt(componentId, 10),
    }));
  };

  const selectedList = Object.values(selectedComponents)
    .map((cid) => components.find((c) => c.id === cid))
    .filter(Boolean);

  const totalPrice = selectedList.reduce((sum, item) => sum + item.price, 0);

  const handleUpdate = async () => {
    if (!title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    const component_ids = Object.values(selectedComponents);

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        component_ids,
      };

      const updated = await configurationService.update(id, payload);
      showToast(`Updated configuration '{updated.title}'`, 'success');
      navigate(`/configurations/{id}`);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading configuration editor..." />;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={`/configurations/{id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
          <FiArrowLeft /> Cancel & Return to Details
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Configuration</h1>
          <p className="page-subtitle">Modify title, description, or component selections for configuration #{id}</p>
        </div>
        <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>
          <FiSave /> {saving ? 'Saving...' : 'Update & Re-Snapshot'}
        </button>
      </div>

      {/* Basic Meta Fields */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>General Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Configuration Title *</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ultra Portable Workstation Build"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Notes</label>
            <input
              type="text"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Customer notes, target budget..."
            />
          </div>
        </div>
      </div>

      {/* Component Options Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {CATEGORIES.map((category) => {
            const catComponents = components.filter((c) => c.category === category);
            const currentSelectedId = selectedComponents[category];
            const currentComponent = catComponents.find((c) => c.id === currentSelectedId);

            return (
              <div key={category} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiCpu style={{ color: 'var(--primary)' }} />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{category}</h3>
                  </div>
                  {currentComponent && (
                    <span className="font-mono" style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1rem' }}>
                      +{currentComponent.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {!catComponents.length ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active components in category.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                    {catComponents.map((comp) => {
                      const isSelected = currentSelectedId === comp.id;
                      return (
                        <div
                          key={comp.id}
                          onClick={() => handleSelectComponent(category, comp.id)}
                          style={{
                            padding: '0.85rem',
                            borderRadius: 'var(--border-radius-sm)',
                            background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.4)',
                            border: `1.5px solid {isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)'}`,
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                            position: 'relative'
                          }}
                        >
                          {isSelected && (
                            <FiCheckCircle
                              style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: 'var(--primary)' }}
                            />
                          )}
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#fff' : 'var(--text-main)', paddingRight: '1.5rem' }}>
                            {comp.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {comp.brand}
                          </div>
                          <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.4rem' }}>
                            {comp.price.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Total Cost Breakdown Sidebar */}
        <div style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 1.5rem)' }}>
          <div className="glass-card" style={{ border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '0.75rem' }}>
              <FiSliders style={{ color: 'var(--accent)', fontSize: '1.25rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Updated Cost Breakdown</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {selectedList.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px dashed rgba(255,255,255,0.06)' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', display: 'block' }}>{item.category}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</span>
                  </div>
                  <span className="font-mono" style={{ fontWeight: 700, color: 'var(--success)', alignSelf: 'center' }}>
                    {item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--bg-card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>New Total Price:</span>
                <span className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {totalPrice.toFixed(2)}
                </span>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem' }}
                onClick={handleUpdate}
                disabled={saving}
              >
                <FiSave /> {saving ? 'Saving...' : 'Update & Re-Snapshot'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigEditPage;
