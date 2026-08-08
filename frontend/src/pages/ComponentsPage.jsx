import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { componentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import DeleteModal from '../components/DeleteModal';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiCpu, FiFilter } from 'react-icons/fi';

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

const ComponentsPage = () => {
  const { showToast } = useAuth();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingComponent, setDeletingComponent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchComponents();
  }, [search, selectedCategory]);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;

      const data = await componentService.getAll(params);
      setComponents(data);
    } catch (err) {
      showToast('Failed to fetch components', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingComponent(null);
    reset({
      name: '',
      category: selectedCategory || 'Processor',
      brand: '',
      price: 0,
      description: '',
      is_available: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (comp) => {
    setEditingComponent(comp);
    setValue('name', comp.name);
    setValue('category', comp.category);
    setValue('brand', comp.brand);
    setValue('price', comp.price);
    setValue('description', comp.description || '');
    setValue('is_available', comp.is_available);
    setIsModalOpen(true);
  };

  const onSubmitModal = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
      };

      if (editingComponent) {
        await componentService.update(editingComponent.id, payload);
        showToast(`Component {data.name}' updated successfully`, 'success');
      } else {
        await componentService.create(payload);
        showToast(`Component '{data.name}' created successfully`, 'success');
      }

      setIsModalOpen(false);
      fetchComponents();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error saving component', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingComponent) return;
    setSubmitting(true);
    try {
      await componentService.delete(deletingComponent.id);
      showToast(`Deleted component '{deletingComponent.name}'`, 'success');
      setIsDeleteOpen(false);
      setDeletingComponent(null);
      fetchComponents();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete component', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hardware Component Catalog</h1>
          <p className="page-subtitle">Manage individual laptop hardware parts, prices, and availability</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <FiPlus /> Add Component
        </button>
      </div>

      {/* Filters & Search Header */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search components by name, brand, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FiFilter style={{ color: 'var(--text-dim)' }} />
            <select
              className="form-select"
              style={{ width: '220px' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories ({CATEGORIES.length})</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Components List Table */}
      <div className="glass-card">
        {loading ? (
          <LoadingSpinner message="Loading component catalog..." />
        ) : components.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <FiCpu size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No components found matching your search criteria.</p>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }} onClick={() => { setSearch(''); setSelectedCategory(''); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Component Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Unit Price</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {components.map((comp) => (
                  <tr key={comp.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{comp.name}</div>
                        {comp.description && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{comp.description}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-category">{comp.category}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{comp.brand}</td>
                    <td className="font-mono" style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1.05rem' }}>
                      {comp.price.toFixed(2)*87}
                    </td>
                    <td>
                      {comp.is_available ? (
                        <span className="badge badge-success">Available</span>
                      ) : (
                        <span className="badge badge-warning">Unavailable</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEditModal(comp)}
                          title="Edit Component"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          onClick={() => {
                            setDeletingComponent(comp);
                            setIsDeleteOpen(true);
                          }}
                          title="Delete Component"
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

      {/* Create / Edit Component Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingComponent ? 'Edit Hardware Component' : 'Add New Hardware Component'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit(onSubmitModal)} disabled={submitting}>
              {submitting ? 'Saving...' : editingComponent ? 'Update Component' : 'Create Component'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmitModal)}>
          <div className="form-group">
            <label className="form-label">Component Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Intel Core i7-13700H"
              {...register('name', { required: 'Component name is required' })}
            />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                {...register('category', { required: 'Category is required' })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="form-error">{errors.category.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Brand / Manufacturer *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Intel, NVIDIA, Corsair"
                {...register('brand', { required: 'Brand is required' })}
              />
              {errors.brand && <span className="form-error">{errors.brand.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Price (rupees) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control font-mono"
              placeholder="0.00"
              {...register('price', {
                required: 'Price is required',
                min: { value: 0, message: 'Price cannot be negative' }
              })}
            />
            {errors.price && <span className="form-error">{errors.price.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Description / Technical Specs</label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="Brief details about clock speed, cores, VRAM, capacity..."
              {...register('description')}
            ></textarea>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="is_available"
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              {...register('is_available')}
            />
            <label htmlFor="is_available" className="form-label" style={{ marginBottom: 0, cursor: 'pointer', color: '#fff' }}>
              Available for Laptop Configurations
            </label>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemTitle={deletingComponent?.name}
        loading={submitting}
      />
    </div>
  );
};

export default ComponentsPage;
