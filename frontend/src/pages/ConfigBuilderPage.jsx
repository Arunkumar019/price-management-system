import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { componentService, configurationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { FiCheckCircle, FiSave, FiDollarSign, FiSliders, FiCpu, FiRotateCcw } from 'react-icons/fi';

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

const ConfigBuilderPage = () => {
  const { showToast } = useAuth();
  const navigate = useNavigate();

  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComponents, setSelectedComponents] = useState({}); // { category: componentId }
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const data = await componentService.getAll({ is_available: true });
      setComponents(data);

      // Auto-select first component in each category by default if available
      const initialSelections = {};
      CATEGORIES.forEach((cat) => {
        const catComponents = data.filter((c) => c.category === cat);
        if (catComponents.length > 0) {
          initialSelections[cat] = catComponents[0].id;
        }
      });
      setSelectedComponents(initialSelections);
    } catch (err) {
      showToast('Failed to load available components', 'error');
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
    .map((id) => components.find((c) => c.id === id))
    .filter(Boolean);

  const totalPrice = selectedList.reduce((sum, item) => sum + item.price, 0);

  const handleResetSelections = () => {
    const initialSelections = {};
    CATEGORIES.forEach((cat) => {
      const catComponents = components.filter((c) => c.category === cat);
      if (catComponents.length > 0) {
        initialSelections[cat] = catComponents[0].id;
      }
    });
    setSelectedComponents(initialSelections);
    showToast('Selections reset to defaults', 'info');
  };

  const handleSaveConfiguration = async () => {
    if (!title.trim()) {
      showToast('Please enter a configuration title', 'error');
      return;
    }

    const component_ids = Object.values(selectedComponents);
    if (!component_ids.length) {
      showToast('Please select at least one component', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        component_ids,
      };

      const res = await configurationService.create(payload);
      showToast(`Configuration '{res.title}' saved with price snapshot of {res.total_price.toFixed(2)}`, 'success');
      setIsSaveModalOpen(false);
      navigate(`/configurations/{res.id}`);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to save configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Building hardware configuration catalog..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Laptop Configuration Builder</h1>
          <p className="page-subtitle">Customize hardware options and calculate exact live pricing with breakdown</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleResetSelections}>
            <FiRotateCcw /> Reset
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setTitle(`Custom Laptop Build - {new Date().toLocaleDateString()}`);
              setIsSaveModalOpen(true);
            }}
          >
            <FiSave /> Save Configuration
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        {/* Component Selector Categories */}
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
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active components available in this category.</p>
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

        {/* Live Summary & Price Breakdown Sidebar */}
        <div style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 1.5rem)' }}>
          <div className="glass-card" style={{ border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '0.75rem' }}>
              <FiSliders style={{ color: 'var(--accent)', fontSize: '1.25rem' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Cost Breakdown</h3>
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
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Total Price:</span>
                <span className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {totalPrice.toFixed(2)}
                </span>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem' }}
                onClick={() => {
                  setTitle(`Custom Laptop Build - {new Date().toLocaleDateString()}`);
                  setIsSaveModalOpen(true);
                }}
              >
                <FiSave /> Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Configuration Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save Laptop Configuration"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsSaveModalOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveConfiguration} disabled={saving}>
              {saving ? 'Saving Snapshot...' : 'Confirm & Save'}
            </button>
          </>
        }
      >
        <div>
          <div className="form-group">
            <label className="form-label">Configuration Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Gaming Beast RTX 4080 Build"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes / Description</label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="Customer requirements, target usage, special notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)' }}>
              <span>Total Price to Snapshot:</span>
              <span className="font-mono">{totalPrice.toFixed(2)}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Snapshot Lock: Selected component prices will be frozen for this configuration record.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConfigBuilderPage;
