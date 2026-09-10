import React, { useEffect, useState } from 'react';
import {
  Grid,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  Download,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
  Save,
  Check,
  Smartphone,
  ShieldAlert,
  HelpCircle,
  Loader2
} from 'lucide-react';
import {
  fetchAdminMoreServices,
  createMoreService,
  updateMoreService,
  deleteMoreService,
  reorderMoreServices,
  DEFAULT_MORE_SERVICES
} from '@/features/more-services/services/moreServicesService.js';
import styles from './AdminMoreServicesView.module.css';

export default function AdminMoreServicesView() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    appName: '',
    appSlug: '',
    tagline: '',
    description: '',
    badge: 'Fastest',
    primaryColor: '#EC4899',
    secondaryColor: '#D97706',
    iconUrl: '',
    bannerUrl: '',
    featuresText: '',
    playStoreUrl: '',
    appStoreUrl: '',
    deepLinkScheme: '',
    rating: 4.8,
    downloads: '100K+',
    order: 1,
    isActive: true
  });

  const loadServices = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminMoreServices();
      if (Array.isArray(data) && data.length > 0) {
        setServices(data);
      } else {
        setServices(DEFAULT_MORE_SERVICES);
      }
    } catch (err) {
      console.error('Failed to load more services:', err);
      setError(err?.message || 'Failed to load more services.');
      setServices(DEFAULT_MORE_SERVICES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      appName: '',
      appSlug: '',
      tagline: '',
      description: '',
      badge: 'New',
      primaryColor: '#E50914',
      secondaryColor: '#B91C1C',
      iconUrl: 'https://cdn.delivez.com/apps/new-service-icon.png',
      bannerUrl: 'https://cdn.delivez.com/apps/new-service-banner.png',
      featuresText: 'Fast Doorstep Pickup, Verified Professionals, Real-Time Tracking',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.delivez',
      appStoreUrl: 'https://apps.apple.com/in/app/delivez',
      deepLinkScheme: 'delivez://',
      rating: 4.8,
      downloads: '10K+',
      order: services.length + 1,
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      appName: item.appName || '',
      appSlug: item.appSlug || '',
      tagline: item.tagline || '',
      description: item.description || '',
      badge: item.badge || '',
      primaryColor: item.primaryColor || '#E50914',
      secondaryColor: item.secondaryColor || '#B91C1C',
      iconUrl: item.iconUrl || '',
      bannerUrl: item.bannerUrl || '',
      featuresText: Array.isArray(item.features) ? item.features.join(', ') : '',
      playStoreUrl: item.playStoreUrl || '',
      appStoreUrl: item.appStoreUrl || '',
      deepLinkScheme: item.deepLinkScheme || '',
      rating: item.rating || 4.8,
      downloads: item.downloads || '50K+',
      order: item.order || 1,
      isActive: item.isActive !== false
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.appName.trim()) {
      setError('App Name is required.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');

    const featuresArray = formData.featuresText
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      features: featuresArray,
      rating: Number(formData.rating) || 4.8,
      order: Number(formData.order) || 1
    };

    try {
      if (editingItem) {
        await updateMoreService(editingItem.id, payload);
        setSuccessMsg(`Service "${formData.appName}" updated successfully!`);
      } else {
        await createMoreService(payload);
        setSuccessMsg(`New Service "${formData.appName}" created successfully!`);
      }
      setModalOpen(false);
      await loadServices();
    } catch (err) {
      console.error('Error saving more service:', err);
      setError(err.message || 'Failed to save service app.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.appName}"? This cannot be undone.`)) {
      return;
    }
    setError('');
    try {
      await deleteMoreService(item.id);
      setSuccessMsg(`Service "${item.appName}" deleted.`);
      await loadServices();
    } catch (err) {
      setError(err.message || 'Failed to delete service.');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await updateMoreService(item.id, { isActive: !item.isActive });
      await loadServices();
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= services.length) return;

    const reordered = [...services];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);

    const ids = reordered.map((s) => s.id);
    try {
      setServices(reordered);
      await reorderMoreServices(ids);
    } catch (err) {
      console.error('Failed to reorder:', err);
      await loadServices();
    }
  };

  // Metrics
  const totalCount = services.length;
  const activeCount = services.filter((s) => s.isActive !== false).length;
  const avgRating = (
    services.reduce((acc, s) => acc + (Number(s.rating) || 0), 0) / (totalCount || 1)
  ).toFixed(1);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1>
            <Grid size={24} color="#e50914" /> More Services & Ecosystem Apps
          </h1>
          <p>Manage dynamic ecosystem apps, descriptions, features, store links, and branding colors.</p>
        </div>

        <div className={styles.headerActions}>
          <button type="button" className={styles.refreshBtn} onClick={loadServices} disabled={loading}>
            <RefreshCw size={15} className={loading ? styles.spin : ''} /> Refresh
          </button>
          <button type="button" className={styles.addBtn} onClick={openCreateModal}>
            <Plus size={16} /> Add New Service App
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIconWrap} style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Grid size={22} />
          </div>
          <div className={styles.metricInfo}>
            <small>Total Services</small>
            <strong>{totalCount}</strong>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconWrap} style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle size={22} />
          </div>
          <div className={styles.metricInfo}>
            <small>Active Apps</small>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconWrap} style={{ background: '#fffbeb', color: '#d97706' }}>
            <Star size={22} />
          </div>
          <div className={styles.metricInfo}>
            <small>Average Rating</small>
            <strong>{avgRating} ★</strong>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIconWrap} style={{ background: '#fdf4ff', color: '#c026d3' }}>
            <Smartphone size={22} />
          </div>
          <div className={styles.metricInfo}>
            <small>Ecosystem Status</small>
            <strong style={{ fontSize: '1rem', color: '#16a34a' }}>Production Active</strong>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className={styles.errorBox}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className={styles.successBox}>
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <Loader2 size={32} className={styles.spin} style={{ margin: '0 auto 12px' }} />
          <p>Loading More Services...</p>
        </div>
      ) : services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <Grid size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 700, color: '#334155' }}>No More Services Found</p>
          <button type="button" className={styles.addBtn} style={{ marginTop: 12 }} onClick={openCreateModal}>
            <Plus size={16} /> Create First Service App
          </button>
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {services.map((item, index) => {
            const primary = item.primaryColor || '#E50914';
            const secondary = item.secondaryColor || '#B91C1C';
            const isActive = item.isActive !== false;

            return (
              <div key={item.id} className={`${styles.serviceCard} ${!isActive ? styles.inactive : ''}`}>
                {/* Banner Header */}
                <div className={styles.cardBannerWrap}>
                  <img
                    src={item.bannerUrl || 'https://cdn.delivez.com/apps/default-banner.png'}
                    alt={item.appName}
                    className={styles.cardBannerImg}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800';
                    }}
                  />
                  <div className={styles.bannerBadgeOverlay}>
                    {item.badge && (
                      <span className={styles.badgePill} style={{ background: primary }}>
                        {item.badge}
                      </span>
                    )}
                    <span className={`${styles.statusPill} ${isActive ? styles.active : styles.inactive}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <span className={styles.orderBadge}>#{item.order || index + 1}</span>
                </div>

                {/* Card Body */}
                <div className={styles.cardBody}>
                  <div className={styles.appHeaderRow}>
                    <div className={styles.appIconWrap} style={{ borderColor: primary }}>
                      <img
                        src={item.iconUrl || 'https://cdn.delivez.com/apps/default-icon.png'}
                        alt={item.appName}
                        className={styles.appIconImg}
                        onError={(e) => {
                          e.target.src = 'https://cdn-icons-png.flaticon.com/512/679/679922.png';
                        }}
                      />
                    </div>
                    <div className={styles.appTitleInfo}>
                      <h3>{item.appName}</h3>
                      <p className={styles.tagline} style={{ color: secondary }}>
                        {item.tagline}
                      </p>
                      <div className={styles.slugRow}>
                        <span className={styles.slugPill}>/{item.appSlug}</span>
                      </div>
                    </div>
                  </div>

                  <p className={styles.description}>{item.description}</p>

                  {/* Features List */}
                  {Array.isArray(item.features) && item.features.length > 0 && (
                    <div className={styles.featuresList}>
                      {item.features.map((feat, fIdx) => (
                        <div key={fIdx} className={styles.featureItem}>
                          <span className={styles.featureDot} style={{ background: primary }} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rating & Downloads Stats */}
                  <div className={styles.statsRow}>
                    <span className={styles.statItem}>
                      <Star size={14} className={styles.ratingStar} fill="#f59e0b" />
                      <strong>{item.rating || 4.8}</strong> rating
                    </span>
                    <span className={styles.statItem}>
                      <Download size={14} />
                      <strong>{item.downloads || '100K+'}</strong> installs
                    </span>
                    <span className={styles.statItem} style={{ marginLeft: 'auto' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          borderRadius: 3,
                          background: primary,
                          marginRight: 4
                        }}
                      />
                      <span
                        style={{
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          borderRadius: 3,
                          background: secondary
                        }}
                      />
                    </span>
                  </div>

                  {/* Store & Deep Links */}
                  <div className={styles.storeLinksRow}>
                    {item.playStoreUrl && (
                      <a
                        href={item.playStoreUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.storeLinkBadge}
                        title="Google Play Store"
                      >
                        Play Store <ExternalLink size={10} />
                      </a>
                    )}
                    {item.appStoreUrl && (
                      <a
                        href={item.appStoreUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.storeLinkBadge}
                        title="Apple App Store"
                      >
                        App Store <ExternalLink size={10} />
                      </a>
                    )}
                    {item.deepLinkScheme && (
                      <span className={styles.deepLinkPill} title="Deep Link Scheme">
                        {item.deepLinkScheme}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className={styles.cardFooter}>
                  <div className={styles.reorderBtns}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      disabled={index === 0}
                      onClick={() => handleMove(index, -1)}
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      disabled={index === services.length - 1}
                      onClick={() => handleMove(index, 1)}
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <div className={styles.actionBtns}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => handleToggleActive(item)}
                      title={isActive ? 'Deactivate' : 'Activate'}
                    >
                      {isActive ? <CheckCircle size={15} color="#10b981" /> : <XCircle size={15} color="#94a3b8" />}
                    </button>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => openEditModal(item)}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(item)}
                      title="Delete Service"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2>{editingItem ? `Edit Service: ${editingItem.appName}` : 'Create New More Service App'}</h2>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.modalBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>App Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delivez Fresh"
                    value={formData.appName}
                    onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>App Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. delivez-fresh (auto-generated if blank)"
                    value={formData.appSlug}
                    onChange={(e) => setFormData({ ...formData, appSlug: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Farm Fresh Produce in 15 Mins"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Badge Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Fastest, New, Bestseller"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what this service app delivers and why customers should use it..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Primary Brand Color</label>
                  <div className={styles.colorPickerWrap}>
                    <input
                      type="color"
                      className={styles.colorInput}
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Secondary Brand Color</label>
                  <div className={styles.colorPickerWrap}>
                    <input
                      type="color"
                      className={styles.colorInput}
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Icon URL</label>
                  <input
                    type="url"
                    placeholder="https://cdn.delivez.com/apps/icon.png"
                    value={formData.iconUrl}
                    onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Banner URL</label>
                  <input
                    type="url"
                    placeholder="https://cdn.delivez.com/apps/banner.png"
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Features (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Few min delivery, Live rider tracking, Free delivery above ₹199"
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Google Play Store URL</label>
                  <input
                    type="url"
                    placeholder="https://play.google.com/store/apps/details?id=..."
                    value={formData.playStoreUrl}
                    onChange={(e) => setFormData({ ...formData, playStoreUrl: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Apple App Store URL</label>
                  <input
                    type="url"
                    placeholder="https://apps.apple.com/in/app/..."
                    value={formData.appStoreUrl}
                    onChange={(e) => setFormData({ ...formData, appStoreUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Deep Link Scheme</label>
                  <input
                    type="text"
                    placeholder="e.g. deliveznow://"
                    value={formData.deepLinkScheme}
                    onChange={(e) => setFormData({ ...formData, deepLinkScheme: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>App Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Downloads Text</label>
                  <input
                    type="text"
                    placeholder="e.g. 500K+"
                    value={formData.downloads}
                    onChange={(e) => setFormData({ ...formData, downloads: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active in mobile app and website ecosystem</span>
                </label>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 size={16} className={styles.spin} /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Service App
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
