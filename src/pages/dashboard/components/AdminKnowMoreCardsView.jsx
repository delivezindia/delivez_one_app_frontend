import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  BookOpen,
  Truck,
  Luggage,
  ShieldCheck,
  ShoppingBag,
  RotateCcw,
  Layers,
  Plus,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  Image as ImageIcon,
  X,
  ArrowRight,
  Eye,
} from 'lucide-react'
import {
  fetchAdminKnowMoreCards,
  createAdminKnowMoreCard,
  updateAdminKnowMoreCard,
  deleteAdminKnowMoreCard,
  toggleAdminKnowMoreCardActive,
  uploadAdminKnowMoreImage,
} from '@/features/know-more/services/knowMoreService.js'
import styles from './AdminKnowMoreCardsView.module.css'

const CATEGORIES = [
  { id: 'all', label: 'All Services', icon: Layers, color: '#0f172a' },
  { id: 'courier-delivery', label: 'Courier Delivery', icon: Truck, color: '#087fc1' },
  { id: 'luggage-delivery', label: 'Luggage Delivery', icon: Luggage, color: '#d97706' },
  { id: 'confidential-delivery', label: 'Confidential Delivery', icon: ShieldCheck, color: '#dc2626' },
  { id: 'forgot-something', label: 'Forgot Something', icon: ShoppingBag, color: '#16a34a' },
  { id: 'return-pickup', label: 'Return Pickup', icon: RotateCcw, color: '#ea580c' },
]

export default function AdminKnowMoreCardsView() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState(null)

  // Carousel tracking
  const [activeImageIndexes, setActiveImageIndexes] = useState({})

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    serviceSlug: 'courier-delivery',
    heading: '',
    description: '',
    images: [],
    ctaText: 'Learn More',
    ctaLink: '/services/courier-delivery',
    badge: 'Guide',
    order: 1,
    isActive: true,
  })
  const [newImageUrl, setNewImageUrl] = useState('')
  const fileInputRef = useRef(null)

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [cardToDelete, setCardToDelete] = useState(null)

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const loadCards = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminKnowMoreCards('all')
      setCards(data || [])
    } catch (err) {
      showToast('error', err?.message || 'Failed to load Know More cards.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCards()
  }, [])

  const filteredCards = useMemo(() => {
    return cards.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.serviceSlug === selectedCategory
      const q = searchQuery.trim().toLowerCase()
      const matchQuery =
        !q ||
        item.heading?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.badge?.toLowerCase().includes(q)
      return matchCat && matchQuery
    })
  }, [cards, selectedCategory, searchQuery])

  const categoryCounts = useMemo(() => {
    const counts = { all: cards.length }
    CATEGORIES.forEach((c) => {
      if (c.id !== 'all') {
        counts[c.id] = cards.filter((card) => card.serviceSlug === c.id).length
      }
    })
    return counts
  }, [cards])

  const handleNextImage = (cardId, count) => {
    setActiveImageIndexes((prev) => ({
      ...prev,
      [cardId]: ((prev[cardId] || 0) + 1) % count,
    }))
  }

  const handlePrevImage = (cardId, count) => {
    setActiveImageIndexes((prev) => ({
      ...prev,
      [cardId]: ((prev[cardId] || 0) - 1 + count) % count,
    }))
  }

  const handleToggleActive = async (card) => {
    try {
      const updated = await toggleAdminKnowMoreCardActive(card.id)
      setCards((prev) => prev.map((c) => (c.id === card.id ? updated : c)))
      showToast('success', `"${card.heading}" is now ${updated.isActive ? 'Active' : 'Inactive'}.`)
    } catch (err) {
      showToast('error', err?.message || 'Failed to toggle status.')
    }
  }

  const openCreateModal = () => {
    const slug = selectedCategory !== 'all' ? selectedCategory : 'courier-delivery'
    setEditingCard(null)
    setFormData({
      serviceSlug: slug,
      heading: '',
      description: '',
      images: [
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      ],
      ctaText: 'Learn More',
      ctaLink: `/services/${slug}`,
      badge: 'Guide',
      order: cards.filter((c) => c.serviceSlug === slug).length + 1,
      isActive: true,
    })
    setNewImageUrl('')
    setModalOpen(true)
  }

  const openEditModal = (card) => {
    setEditingCard(card)
    setFormData({
      serviceSlug: card.serviceSlug || 'courier-delivery',
      heading: card.heading || '',
      description: card.description || '',
      images: Array.isArray(card.images) ? [...card.images] : [],
      ctaText: card.ctaText || 'Learn More',
      ctaLink: card.ctaLink || `/services/${card.serviceSlug}`,
      badge: card.badge || '',
      order: card.order || 1,
      isActive: card.isActive !== false,
    })
    setNewImageUrl('')
    setModalOpen(true)
  }

  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim()
    if (!trimmed) return
    setFormData((prev) => ({ ...prev, images: [...prev.images, trimmed] }))
    setNewImageUrl('')
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const url = await uploadAdminKnowMoreImage(file)
      if (url) {
        setFormData((prev) => ({ ...prev, images: [...prev.images, url] }))
        showToast('success', 'Image uploaded!')
      }
    } catch (err) {
      showToast('error', err?.message || 'Failed to upload image.')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (idxToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== idxToRemove),
    }))
  }

  const handleSaveCard = async (e) => {
    e.preventDefault()
    if (!formData.heading.trim()) {
      showToast('error', 'Please enter a heading.')
      return
    }
    if (!formData.description.trim()) {
      showToast('error', 'Please enter a description.')
      return
    }

    setSaving(true)
    try {
      if (editingCard) {
        const updated = await updateAdminKnowMoreCard(editingCard.id, formData)
        setCards((prev) => prev.map((c) => (c.id === editingCard.id ? updated : c)))
        showToast('success', 'Know More card updated successfully!')
      } else {
        const created = await createAdminKnowMoreCard(formData)
        setCards((prev) => [...prev, created])
        showToast('success', 'New Know More card created successfully!')
      }
      setModalOpen(false)
    } catch (err) {
      showToast('error', err?.message || 'Failed to save card.')
    } finally {
      setSaving(false)
    }
  }

  const openDeleteModal = (card) => {
    setCardToDelete(card)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!cardToDelete) return
    try {
      await deleteAdminKnowMoreCard(cardToDelete.id)
      setCards((prev) => prev.filter((c) => c.id !== cardToDelete.id))
      showToast('success', `Card "${cardToDelete.heading}" deleted.`)
      setDeleteModalOpen(false)
      setCardToDelete(null)
    } catch (err) {
      showToast('error', err?.message || 'Failed to delete card.')
    }
  }

  const getMeta = (slug) => CATEGORIES.find((c) => c.id === slug) || CATEGORIES[1]

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
          <h1>Know More Cards Studio</h1>
          <p>
            Create and manage informative cards for the "Know More" sections across services. Each card supports multiple images, rich headings, detailed descriptions, and CTA deep links.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.refreshBtn} onClick={loadCards} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button type="button" className={styles.addBtn} onClick={openCreateModal}>
            <Plus size={16} />
            <span>Add Know More Card</span>
          </button>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: '#e9f6ff', color: '#087fc1' }}>
            <BookOpen size={24} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Total Know More Cards</span>
            <span className={styles.metricValue}>{cards.length}</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Active on Apps</span>
            <span className={styles.metricValue}>{cards.filter((c) => c.isActive).length}</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <ImageIcon size={24} />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Total Card Images</span>
            <span className={styles.metricValue}>
              {cards.reduce((acc, c) => acc + (c.images?.length || 0), 0)}
            </span>
          </div>
        </div>
      </section>

      {/* Controls Bar */}
      <section className={styles.controlsBar}>
        <div className={styles.filterTabs}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                className={`${styles.filterTab} ${isSelected ? styles.activeFilterTab : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <Icon size={15} />
                <span>{cat.label}</span>
                <span className={styles.tabBadge}>{categoryCounts[cat.id] || 0}</span>
              </button>
            )
          })}
        </div>

        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by heading, description, badge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className={styles.emptyState}>
          <BookOpen size={48} color="#cbd5e1" />
          <h3>No Know More Cards</h3>
          <p>
            {searchQuery
              ? `No cards match your search "${searchQuery}".`
              : 'No cards found for this category.'}
          </p>
          <button type="button" className={styles.addBtn} onClick={openCreateModal}>
            <Plus size={16} /> Create First Card
          </button>
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {filteredCards.map((card) => {
            const meta = getMeta(card.serviceSlug)
            const images = card.images || []
            const currentIdx = (activeImageIndexes[card.id] || 0) % (images.length || 1)

            return (
              <div
                key={card.id}
                className={`${styles.sliderCard} ${!card.isActive ? styles.inactiveCard : ''}`}
              >
                {/* Media Gallery */}
                <div className={styles.mediaViewer}>
                  {images.length > 0 ? (
                    <img
                      src={images[currentIdx]}
                      alt={card.heading}
                      className={styles.carouselImg}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.mediaPlaceholder}>
                      <ImageIcon size={32} />
                      <span>No images</span>
                    </div>
                  )}

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        className={`${styles.carouselNavBtn} ${styles.prevBtn}`}
                        onClick={() => handlePrevImage(card.id, images.length)}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.carouselNavBtn} ${styles.nextBtn}`}
                        onClick={() => handleNextImage(card.id, images.length)}
                      >
                        <ChevronRight size={18} />
                      </button>
                      <div className={styles.mediaCounter}>
                        {currentIdx + 1} / {images.length}
                      </div>
                    </>
                  )}

                  <div className={styles.floatingBadges}>
                    <span
                      className={styles.serviceBadge}
                      style={{ background: meta.color, color: '#ffffff' }}
                    >
                      {meta.label}
                    </span>
                    {card.badge && <span className={styles.customBadge}>{card.badge}</span>}
                  </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className={styles.thumbnailStrip}>
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`${styles.thumbBtn} ${idx === currentIdx ? styles.activeThumb : ''}`}
                        onClick={() =>
                          setActiveImageIndexes((prev) => ({ ...prev, [card.id]: idx }))
                        }
                      >
                        <img src={img} alt="" className={styles.thumbImg} />
                      </button>
                    ))}
                  </div>
                )}

                {/* Body */}
                <div className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{card.heading}</h3>
                    <span className={styles.orderTag}>Order #{card.order || 1}</span>
                  </div>
                  <p className={styles.cardDesc}>{card.description}</p>

                  <div className={styles.ctaPreview}>
                    <span>{card.ctaText || 'Learn More'}</span>
                    <ArrowRight size={13} />
                    <span className={styles.ctaLinkText}>({card.ctaLink || '/'})</span>
                  </div>
                </div>

                {/* Footer */}
                <div className={styles.cardFooter}>
                  <button
                    type="button"
                    className={`${styles.toggleActiveBtn} ${card.isActive ? styles.activeChip : styles.inactiveChip}`}
                    onClick={() => handleToggleActive(card)}
                  >
                    {card.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>{card.isActive ? 'Active' : 'Inactive'}</span>
                  </button>

                  <div className={styles.cardActionBtns}>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => openEditModal(card)}
                      title="Edit Card"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => openDeleteModal(card)}
                      title="Delete Card"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingCard ? 'Edit Know More Card' : 'Create Know More Card'}</h2>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCard}>
              <div className={styles.modalBody}>
                <div className={styles.formCol}>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>Service Category</label>
                      <select
                        className={styles.inputField}
                        value={formData.serviceSlug}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, serviceSlug: e.target.value }))
                        }
                      >
                        {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Display Order</label>
                      <input
                        type="number"
                        min="1"
                        className={styles.inputField}
                        value={formData.order}
                        onChange={(e) => setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Card Heading *</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder="e.g. Personal Courier & Parcel Express Guide"
                      value={formData.heading}
                      onChange={(e) => setFormData((prev) => ({ ...prev, heading: e.target.value }))}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Card Description *</label>
                    <textarea
                      className={styles.textareaField}
                      placeholder="Describe what users should know more about this service..."
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>Badge Tag</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        placeholder="e.g. Express Guide, Zero Tamper"
                        value={formData.badge}
                        onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Status</label>
                      <select
                        className={styles.inputField}
                        value={formData.isActive ? 'true' : 'false'}
                        onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.value === 'true' }))}
                      >
                        <option value="true">Active (Visible)</option>
                        <option value="false">Inactive (Hidden)</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>CTA Button Label</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={formData.ctaText}
                        onChange={(e) => setFormData((prev) => ({ ...prev, ctaText: e.target.value }))}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>CTA Navigation Link</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={formData.ctaLink}
                        onChange={(e) => setFormData((prev) => ({ ...prev, ctaLink: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Multi-Image Manager */}
                  <div className={styles.imageManager}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      Card Images ({formData.images.length} added)
                    </label>

                    <div className={styles.addImageUrlRow}>
                      <input
                        type="url"
                        className={styles.inputField}
                        placeholder="Paste image URL (https://...)"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
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
                        disabled={!newImageUrl.trim()}
                      >
                        <Plus size={14} /> Add URL
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                        disabled={uploadingImage}
                      >
                        <Upload size={14} />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                      </button>
                    </div>

                    {formData.images.length > 0 && (
                      <div className={styles.imageList}>
                        {formData.images.map((img, idx) => (
                          <div key={idx} className={styles.imageThumbWrap}>
                            <img src={img} alt="" />
                            {idx === 0 && <span className={styles.primaryBadge}>Primary</span>}
                            <button
                              type="button"
                              className={styles.removeThumbBtn}
                              onClick={() => handleRemoveImage(idx)}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Preview */}
                <div className={styles.previewCol}>
                  <span className={styles.previewLabel}>Live App Preview</span>
                  <div className={styles.sliderCard} style={{ margin: 0, boxShadow: 'none' }}>
                    <div className={styles.mediaViewer} style={{ height: 180 }}>
                      {formData.images.length > 0 ? (
                        <img
                          src={formData.images[0]}
                          alt="Preview"
                          className={styles.carouselImg}
                        />
                      ) : (
                        <div className={styles.mediaPlaceholder}>
                          <ImageIcon size={28} />
                          <span>Preview Image</span>
                        </div>
                      )}
                      <div className={styles.floatingBadges}>
                        <span
                          className={styles.serviceBadge}
                          style={{
                            background: getMeta(formData.serviceSlug).color,
                            color: '#ffffff',
                          }}
                        >
                          {getMeta(formData.serviceSlug).label}
                        </span>
                        {formData.badge && (
                          <span className={styles.customBadge}>{formData.badge}</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.cardBody} style={{ padding: '14px 16px' }}>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                        {formData.heading || 'Know More Card Heading'}
                      </h4>
                      <p style={{ margin: 0, fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
                        {formData.description || 'Description of key service features and guide details.'}
                      </p>

                      <div className={styles.ctaPreview} style={{ marginTop: 8 }}>
                        <span>{formData.ctaText || 'Learn More'}</span>
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? 'Saving...' : editingCard ? 'Update Card' : 'Create Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && cardToDelete && (
        <div className={styles.modalBackdrop} onClick={() => setDeleteModalOpen(false)}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 style={{ color: '#ef4444' }}>Delete Know More Card</h2>
              <button
                type="button"
                className={styles.closeModalBtn}
                onClick={() => setDeleteModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '20px 24px', fontSize: 14, color: '#475569', lineHeight: 1.5 }}>
              Are you sure you want to delete the Know More card{' '}
              <strong style={{ color: '#0f172a' }}>"{cardToDelete.heading}"</strong>?
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.saveBtn}
                style={{ background: '#ef4444' }}
                onClick={confirmDelete}
              >
                Yes, Delete Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
