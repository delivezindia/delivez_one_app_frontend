import React, { useState, useEffect, useRef } from 'react'
import {
  Sliders,
  Truck,
  Luggage,
  ShieldCheck,
  ShoppingBag,
  RotateCcw,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Save,
  CheckCircle2,
  XCircle,
  Upload,
  Image as ImageIcon,
  X,
  Eye,
  Check,
} from 'lucide-react'
import {
  fetchAdminServiceSliders,
  updateAdminServiceSlider,
  uploadAdminServiceSliderImage,
} from '@/features/service-sliders/services/serviceSlidersService.js'
import styles from './AdminServiceSlidersView.module.css'

const SERVICE_META = {
  'courier-delivery': { label: 'Courier Delivery', icon: Truck, color: '#087fc1', tint: '#e9f6ff' },
  'luggage-delivery': { label: 'Luggage Delivery', icon: Luggage, color: '#d97706', tint: '#fef3c7' },
  'confidential-delivery': { label: 'Confidential Delivery', icon: ShieldCheck, color: '#dc2626', tint: '#fee2e2' },
  'forgot-something': { label: 'Forgot Something', icon: ShoppingBag, color: '#16a34a', tint: '#dcfce7' },
  'return-pickup': { label: 'Return Pickup', icon: RotateCcw, color: '#ea580c', tint: '#ffedd5' },
}

export default function AdminServiceSlidersView() {
  const [sliders, setSliders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImageIndexes, setActiveImageIndexes] = useState({})
  const [toast, setToast] = useState(null)

  // Edit Modal State
  const [editingSlider, setEditingSlider] = useState(null)
  const [modalImages, setModalImages] = useState([])
  const [modalActive, setModalActive] = useState(true)
  const [newUrl, setNewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const loadSliders = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminServiceSliders()
      setSliders(data || [])
    } catch (err) {
      showToast('error', err?.message || 'Failed to load service image sliders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSliders()
  }, [])

  const handleNextImage = (slug, count) => {
    setActiveImageIndexes((prev) => ({
      ...prev,
      [slug]: ((prev[slug] || 0) + 1) % count,
    }))
  }

  const handlePrevImage = (slug, count) => {
    setActiveImageIndexes((prev) => ({
      ...prev,
      [slug]: ((prev[slug] || 0) - 1 + count) % count,
    }))
  }

  const handleToggleActive = async (slider) => {
    try {
      const updated = await updateAdminServiceSlider(slider.serviceSlug, {
        isActive: !slider.isActive,
      })
      setSliders((prev) => prev.map((s) => (s.serviceSlug === slider.serviceSlug ? updated : s)))
      showToast('success', `${slider.serviceName} slider is now ${updated.isActive ? 'Active' : 'Inactive'}.`)
    } catch (err) {
      showToast('error', err?.message || 'Failed to toggle status.')
    }
  }

  const openEditModal = (slider) => {
    setEditingSlider(slider)
    setModalImages(Array.isArray(slider.images) ? [...slider.images] : [])
    setModalActive(slider.isActive !== false)
    setNewUrl('')
  }

  const handleAddImageUrl = () => {
    const trimmed = newUrl.trim()
    if (!trimmed) return
    setModalImages((prev) => [...prev, trimmed])
    setNewUrl('')
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadedUrl = await uploadAdminServiceSliderImage(file)
      if (uploadedUrl) {
        setModalImages((prev) => [...prev, uploadedUrl])
        showToast('success', 'Image uploaded successfully!')
      }
    } catch (err) {
      showToast('error', err?.message || 'Failed to upload image.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (idxToRemove) => {
    setModalImages((prev) => prev.filter((_, idx) => idx !== idxToRemove))
  }

  const handleSaveSlider = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!editingSlider) return

    setSaving(true)
    try {
      const updated = await updateAdminServiceSlider(editingSlider.serviceSlug, {
        images: modalImages,
        isActive: modalActive,
      })
      setSliders((prev) => prev.map((s) => (s.serviceSlug === editingSlider.serviceSlug ? updated : s)))
      showToast('success', `${editingSlider.serviceName} image slider updated successfully!`)
      setEditingSlider(null)
    } catch (err) {
      showToast('error', err?.message || 'Failed to update slider.')
    } finally {
      setSaving(false)
    }
  }

  const totalImages = sliders.reduce((acc, s) => acc + (s.images?.length || 0), 0)

  return (
    <div className={styles.container}>
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <section className={styles.headerBanner}>
        <div className={styles.titleArea}>
          <h1>Service Image Sliders</h1>
          <p>
            Configure 1 image slider per delivery category. Each service has its own dedicated carousel banner with multiple images displayed in customer web and mobile applications.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.refreshBtn} onClick={loadSliders} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Sliders</span>
          </button>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: '#e9f6ff', color: '#087fc1' }}>
            <Sliders size={24} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Total Services Configured</span>
            <span className={styles.metricValue}>{sliders.length} Categories</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Active on Apps</span>
            <span className={styles.metricValue}>
              {sliders.filter((s) => s.isActive).length} / {sliders.length}
            </span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <ImageIcon size={24} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Total Banner Images</span>
            <span className={styles.metricValue}>{totalImages} Images</span>
          </div>
        </div>
      </section>

      {/* Sliders Grid: Exactly 1 Slider per Service */}
      <div className={styles.cardsGrid}>
        {sliders.map((slider) => {
          const meta = SERVICE_META[slider.serviceSlug] || {
            label: slider.serviceName,
            icon: Sliders,
            color: '#0f172a',
            tint: '#f1f5f9',
          }
          const ServiceIcon = meta.icon
          const images = slider.images || []
          const currentIdx = (activeImageIndexes[slider.serviceSlug] || 0) % (images.length || 1)

          return (
            <div
              key={slider.serviceSlug}
              className={`${styles.sliderCard} ${!slider.isActive ? styles.inactiveCard : ''}`}
            >
              {/* Media Carousel */}
              <div className={styles.mediaViewer} style={{ height: 230 }}>
                {images.length > 0 ? (
                  <img
                    src={images[currentIdx]}
                    alt={slider.serviceName}
                    className={styles.carouselImg}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.mediaPlaceholder}>
                    <ImageIcon size={32} />
                    <span>No slider images configured</span>
                  </div>
                )}

                {/* Next / Prev buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className={`${styles.carouselNavBtn} ${styles.prevBtn}`}
                      onClick={() => handlePrevImage(slider.serviceSlug, images.length)}
                      title="Previous image"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.carouselNavBtn} ${styles.nextBtn}`}
                      onClick={() => handleNextImage(slider.serviceSlug, images.length)}
                      title="Next image"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className={styles.mediaCounter}>
                      {currentIdx + 1} / {images.length}
                    </div>
                  </>
                )}

                {/* Floating Service Badge */}
                <div className={styles.floatingBadges}>
                  <span
                    className={styles.serviceBadge}
                    style={{ background: meta.color, color: '#ffffff' }}
                  >
                    <ServiceIcon size={13} style={{ display: 'inline', marginRight: 5 }} />
                    {slider.serviceName}
                  </span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className={styles.thumbnailStrip}>
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`${styles.thumbBtn} ${idx === currentIdx ? styles.activeThumb : ''}`}
                      onClick={() =>
                        setActiveImageIndexes((prev) => ({ ...prev, [slider.serviceSlug]: idx }))
                      }
                    >
                      <img src={img} alt="" className={styles.thumbImg} />
                    </button>
                  ))}
                </div>
              )}

              {/* Slider Info */}
              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{slider.serviceName} Slider</h3>
                  <span className={styles.orderTag}>{images.length} Banner Images</span>
                </div>
                <p className={styles.cardDesc}>
                  Live multi-image header banner for the {slider.serviceName} screen.
                </p>
              </div>

              {/* Footer Actions */}
              <div className={styles.cardFooter}>
                <button
                  type="button"
                  className={`${styles.toggleActiveBtn} ${slider.isActive ? styles.activeChip : styles.inactiveChip}`}
                  onClick={() => handleToggleActive(slider)}
                  title="Toggle live visibility"
                >
                  {slider.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  <span>{slider.isActive ? 'Active on App' : 'Inactive'}</span>
                </button>

                <button
                  type="button"
                  className={styles.addBtn}
                  style={{ padding: '7px 14px', fontSize: 12 }}
                  onClick={() => openEditModal(slider)}
                >
                  Manage Images ({images.length})
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Manage Images Modal */}
      {editingSlider && (
        <div className={styles.modalBackdrop} onClick={() => setEditingSlider(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Manage {editingSlider.serviceName} Slider Images</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  className={styles.topSaveBtn}
                  onClick={handleSaveSlider}
                  disabled={saving}
                  title="Save Slider Changes"
                >
                  <Save size={15} />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  className={styles.closeModalBtn}
                  onClick={() => setEditingSlider(null)}
                  title="Close Modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form className={styles.modalForm} onSubmit={handleSaveSlider}>
              <div className={styles.modalBody} style={{ gridTemplateColumns: '1fr 300px' }}>
                <div className={styles.formCol}>
                  <div className={styles.imageManager}>
                    <label style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                      Slider Images ({modalImages.length} configured)
                    </label>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px 0' }}>
                      Add, reorder, or remove images in the carousel for this service.
                    </p>

                    <div className={styles.addImageUrlRow}>
                      <input
                        type="url"
                        className={styles.inputField}
                        placeholder="Paste image URL (https://...)"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddImageUrl()
                          }
                        }}
                      />
                      <button
                        type="button"
                        className={styles.addImgBtn}
                        onClick={handleAddImageUrl}
                        disabled={!newUrl.trim()}
                      >
                        <Plus size={14} /> Add URL
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                      <button
                        type="button"
                        className={styles.uploadFileBtn}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Upload size={14} />
                        <span>{uploading ? 'Uploading...' : 'Upload Image File'}</span>
                      </button>
                    </div>

                    {/* Image thumbnails list */}
                    {modalImages.length > 0 ? (
                      <div className={styles.imageList} style={{ marginTop: 10 }}>
                        {modalImages.map((img, idx) => (
                          <div key={idx} className={styles.imageThumbWrap}>
                            <img src={img} alt="" />
                            {idx === 0 && <span className={styles.primaryBadge}>1st Slide</span>}
                            <button
                              type="button"
                              className={styles.removeThumbBtn}
                              onClick={() => handleRemoveImage(idx)}
                              title="Remove image"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#ef4444', fontSize: 12, margin: '10px 0 0 0' }}>
                        No images configured. Please add at least 1 image.
                      </p>
                    )}
                  </div>

                  <div className={styles.inputGroup} style={{ marginTop: 8 }}>
                    <label>Slider Active Status</label>
                    <select
                      className={styles.inputField}
                      value={modalActive ? 'true' : 'false'}
                      onChange={(e) => setModalActive(e.target.value === 'true')}
                    >
                      <option value="true">Active (Visible in App)</option>
                      <option value="false">Inactive (Hidden)</option>
                    </select>
                  </div>
                </div>

                {/* Preview Column */}
                <div className={styles.previewCol}>
                  <span className={styles.previewLabel}>Carousel Preview</span>
                  <div className={styles.sliderCard} style={{ margin: 0, boxShadow: 'none' }}>
                    <div className={styles.mediaViewer} style={{ height: 180 }}>
                      {modalImages.length > 0 ? (
                        <img
                          src={modalImages[0]}
                          alt="Preview"
                          className={styles.carouselImg}
                        />
                      ) : (
                        <div className={styles.mediaPlaceholder}>
                          <ImageIcon size={28} />
                          <span>Preview Image</span>
                        </div>
                      )}
                      <div className={styles.mediaCounter}>1 / {modalImages.length || 1}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setEditingSlider(null)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Slider Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
