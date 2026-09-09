import React, { useEffect, useState, useMemo } from 'react'
import {
  Sparkles,
  Laptop,
  Luggage,
  FileText,
  Gift,
  Key,
  Truck,
  ShoppingBag,
  RotateCcw,
  ShieldCheck,
  Plus,
  Upload,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Search,
  Image as ImageIcon,
  Check,
} from 'lucide-react'
import {
  fetchAdminPromptExamples,
  createAdminPromptExample,
  updateAdminPromptExample,
  uploadAdminPromptExampleImage,
  removeAdminPromptExampleImage,
  deleteAdminPromptExample,
} from '@/features/home-content/services/adminPromptExamplesService.js'
import styles from './AdminPromptExamplesView.module.css'

const ICON_PRESETS = [
  { id: 'laptop', label: 'Laptop (Office / Work)' },
  { id: 'luggage', label: 'Luggage (Airport / Travel)' },
  { id: 'file-text', label: 'Document (Legal / Confidential)' },
  { id: 'gift', label: 'Gift (Birthday / Surprise)' },
  { id: 'hanger', label: 'Hanger (Clothing / Zara Return)' },
  { id: 'key', label: 'Key (Car / Home Keys)' },
  { id: 'sparkles', label: 'Sparkles (General AI Prompt)' },
  { id: 'truck', label: 'Truck (Courier Transport)' },
  { id: 'shopping-bag', label: 'Shopping Bag (Retail / Forgotten)' },
]

const COLOR_PRESETS = [
  { hex: '#d97706', name: 'Amber Gold' },
  { hex: '#16a34a', name: 'Emerald Green' },
  { hex: '#9333ea', name: 'Royal Purple' },
  { hex: '#e11d48', name: 'Rose Pink' },
  { hex: '#0284c7', name: 'Logistics Blue' },
  { hex: '#ea580c', name: 'Warm Orange' },
]

const SERVICE_PRESETS = [
  { slug: 'courier-delivery', name: 'Personal Courier' },
  { slug: 'luggage-delivery', name: 'Airport Luggage Delivery' },
  { slug: 'confidential-delivery', name: 'Confidential / Delivez Vault' },
  { slug: 'gift-delivery', name: 'Gift & Surprise Delivery' },
  { slug: 'return-pickup', name: 'Return Pickup' },
  { slug: 'forgot-something', name: 'Forgot Something Retrieval' },
]

export default function AdminPromptExamplesView() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formSaving, setFormSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)

  // Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false)

  // Quick Action busy states
  const [busyItemId, setBusyItemId] = useState(null)

  // Form fields
  const [formState, setFormState] = useState({
    title: '',
    shortText: '',
    promptText: '',
    serviceSlug: 'courier-delivery',
    icon: 'sparkles',
    iconColor: '#d97706',
    displayOrder: 1,
    isActive: true,
  })

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4500)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const list = await fetchAdminPromptExamples()
      setItems(list || [])
    } catch (err) {
      console.error(err)
      showToast('Failed to load prompt examples: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items
    const q = searchQuery.toLowerCase()
    return items.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.shortText?.toLowerCase().includes(q) ||
        item.promptText?.toLowerCase().includes(q) ||
        item.serviceSlug?.toLowerCase().includes(q)
    )
  }, [items, searchQuery])

  const stats = useMemo(() => {
    const total = items.length
    const active = items.filter((i) => i.isActive).length
    const withCustomImages = items.filter((i) => i.hasCustomImage || i.imageUrl).length
    return { total, active, withCustomImages }
  }, [items])

  const handleOpenCreate = () => {
    setIsCreating(true)
    setEditingItem(null)
    setSelectedFile(null)
    setFilePreview(null)
    setFormState({
      title: '',
      shortText: '',
      promptText: '',
      serviceSlug: 'courier-delivery',
      icon: 'sparkles',
      iconColor: '#d97706',
      displayOrder: items.length + 1,
      isActive: true,
    })
    setEditModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setIsCreating(false)
    setEditingItem(item)
    setSelectedFile(null)
    setFilePreview(null)
    setFormState({
      title: item.title || '',
      shortText: item.shortText || '',
      promptText: item.promptText || '',
      serviceSlug: item.serviceSlug || 'courier-delivery',
      icon: item.icon || 'sparkles',
      iconColor: item.iconColor || '#d97706',
      displayOrder: item.displayOrder ?? 1,
      isActive: item.isActive ?? true,
    })
    setEditModalOpen(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setFilePreview(URL.createObjectURL(file))
  }

  const handleSaveForm = async (e) => {
    e.preventDefault()
    if (!formState.title.trim() || !formState.promptText.trim()) {
      alert('Title and Prompt instruction are required.')
      return
    }

    setFormSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', formState.title.trim())
      formData.append(
        'shortText',
        formState.shortText.trim() ||
          (formState.title.length > 38 ? formState.title.slice(0, 35) + '...' : formState.title)
      )
      formData.append('promptText', formState.promptText.trim())
      formData.append('serviceSlug', formState.serviceSlug)
      formData.append('icon', formState.icon)
      formData.append('iconColor', formState.iconColor)
      formData.append('displayOrder', String(formState.displayOrder))
      formData.append('isActive', String(formState.isActive))

      if (selectedFile) {
        formData.append('image', selectedFile)
      }

      if (isCreating) {
        await createAdminPromptExample(formData)
        showToast('Created prompt example card successfully!')
      } else {
        await updateAdminPromptExample(editingItem.id, formData)
        showToast(`Updated '${formState.title}' successfully!`)
      }

      setEditModalOpen(false)
      loadData()
    } catch (err) {
      alert(err.message || 'Failed to save prompt example.')
    } finally {
      setFormSaving(false)
    }
  }

  const handleInlineImageUpload = async (item, file) => {
    if (!file) return
    setBusyItemId(item.id)
    try {
      await uploadAdminPromptExampleImage(item.id, file)
      showToast(`Custom image uploaded for '${item.title}'.`)
      loadData()
    } catch (err) {
      alert(err.message || 'Image upload failed.')
    } finally {
      setBusyItemId(null)
    }
  }

  const handleRemoveImage = async (item) => {
    if (!window.confirm(`Remove custom image for '${item.title}' and restore default vector icon?`)) {
      return
    }
    setBusyItemId(item.id)
    try {
      await removeAdminPromptExampleImage(item.id)
      showToast(`Custom image removed. Vector icon restored.`)
      loadData()
    } catch (err) {
      alert(err.message || 'Failed to remove image.')
    } finally {
      setBusyItemId(null)
    }
  }

  const handleToggleActive = async (item) => {
    try {
      await updateAdminPromptExample(item.id, { isActive: !item.isActive })
      showToast(`Item '${item.title}' is now ${!item.isActive ? 'Active' : 'Inactive'}.`)
      loadData()
    } catch (err) {
      alert(err.message || 'Failed to toggle status.')
    }
  }

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to permanently delete '${item.title}'?`)) {
      return
    }
    try {
      await deleteAdminPromptExample(item.id)
      showToast(`Deleted '${item.title}'.`)
      loadData()
    } catch (err) {
      alert(err.message || 'Failed to delete prompt example.')
    }
  }

  const renderVectorIcon = (iconName, color = '#d97706', size = 24) => {
    switch (iconName?.toLowerCase()) {
      case 'laptop':
        return <Laptop size={size} style={{ color }} />
      case 'luggage':
        return <Luggage size={size} style={{ color }} />
      case 'file-text':
      case 'document':
        return <FileText size={size} style={{ color }} />
      case 'gift':
        return <Gift size={size} style={{ color }} />
      case 'hanger':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3c0 1.3.8 2.4 2 2.8V9L3.5 16A2 2 0 0 0 5 19h14a2 2 0 0 0 1.5-3L13 9V7.8A3 3 0 0 0 12 2z" />
          </svg>
        )
      case 'key':
        return <Key size={size} style={{ color }} />
      case 'truck':
        return <Truck size={size} style={{ color }} />
      case 'shopping-bag':
        return <ShoppingBag size={size} style={{ color }} />
      default:
        return <Sparkles size={size} style={{ color }} />
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* 1. Statistics Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <small>Total Prompts</small>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <small>Active in Modal</small>
            <strong>{stats.active}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#e0e7ff', color: '#4338ca' }}>
            <ImageIcon size={22} />
          </div>
          <div>
            <small>Custom Database Images</small>
            <strong>{stats.withCustomImages}</strong>
          </div>
        </div>
      </div>

      {/* 2. Header Bar & Controls */}
      <div className={styles.headerBar}>
        <div className={styles.titleArea}>
          <h2>Try These Examples — Prompt Cards</h2>
          <p>Manage the 6 dynamic cards shown in the mobile/desktop AI natural language modal.</p>
        </div>

        <div className={styles.actionsArea}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search prompt cards…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => setPreviewModalOpen(true)}
            title="Preview how this looks to customers"
          >
            <Eye size={16} />
            <span>Preview Modal</span>
          </button>

          <button type="button" className={styles.btnPrimary} onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Add Example Card</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={styles.toastMsg}>
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* 3. Cards Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
          <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 10px' }} />
          <p>Loading prompt examples from database…</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ padding: 50, textAlign: 'center', background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0' }}>
          <Sparkles size={36} color="#d97706" style={{ margin: '0 auto 12px' }} />
          <h3>No prompt examples found</h3>
          <p style={{ color: '#64748b' }}>Click "Add Example Card" to create your first prompt card.</p>
        </div>
      ) : (
        <div className={styles.examplesGrid}>
          {filteredItems.map((item) => {
            const isBusy = busyItemId === item.id

            return (
              <div key={item.id} className={styles.card}>
                {/* Top: Order & Status */}
                <div className={styles.cardTop}>
                  <span className={styles.orderBadge}>Order #{item.displayOrder ?? 1}</span>
                  <button
                    type="button"
                    className={`${styles.statusBadge} ${item.isActive ? styles.statusActive : styles.statusInactive}`}
                    onClick={() => handleToggleActive(item)}
                    title="Click to toggle Active / Inactive"
                  >
                    {item.isActive ? <Check size={12} /> : <X size={12} />}
                    <span>{item.isActive ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>

                {/* Body: Media + Text Content */}
                <div className={styles.cardBody}>
                  <div className={`${styles.mediaPreview} ${item.imageUrl ? styles.hasImage : ''}`}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className={styles.customImg} />
                    ) : (
                      renderVectorIcon(item.icon, item.iconColor, 28)
                    )}
                  </div>

                  <div className={styles.contentCol}>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    <p className={styles.shortText}>
                      <strong>Card Preview:</strong> {item.shortText || item.title}
                    </p>
                    <div className={styles.promptPreview}>
                      <strong>Prompt:</strong> &ldquo;{item.promptText}&rdquo;
                    </div>
                    <span className={styles.servicePill}>{item.serviceSlug}</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className={styles.cardFooter}>
                  <div className={styles.footerLeft}>
                    {/* Inline Image Upload */}
                    <label className={styles.uploadLabelBtn} title="Upload/Replace Image in Database">
                      <Upload size={13} />
                      <span>{item.imageUrl ? 'Change Image' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={isBusy}
                        onChange={(e) => {
                          handleInlineImageUpload(item, e.target.files?.[0])
                          e.target.value = ''
                        }}
                      />
                    </label>

                    {item.imageUrl && (
                      <button
                        type="button"
                        className={styles.iconBtnDanger}
                        onClick={() => handleRemoveImage(item)}
                        disabled={isBusy}
                        title="Remove custom image and revert to vector icon"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div className={styles.footerRight}>
                    <button
                      type="button"
                      className={styles.btnEdit}
                      onClick={() => handleOpenEdit(item)}
                    >
                      <Edit size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className={styles.btnDelete}
                      onClick={() => handleDeleteItem(item)}
                      title="Delete prompt card"
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

      {/* 4. Edit / Create Modal */}
      {editModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setEditModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{isCreating ? 'Create Prompt Example Card' : 'Edit Prompt Example'}</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setEditModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form className={styles.modalForm} onSubmit={handleSaveForm}>
              {/* Title / Name */}
              <div className={styles.formGroup}>
                <label>
                  <span>Title / Name *</span>
                  <small style={{ color: '#64748b' }}>Full headline name</small>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pick up my laptop from office and deliver home by 8 PM"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                />
              </div>

              {/* Short Text */}
              <div className={styles.formGroup}>
                <label>
                  <span>Short Card Text</span>
                  <small style={{ color: '#64748b' }}>Shown on 2x3 grid card (truncated)</small>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pick up my laptop from office and deliv..."
                  value={formState.shortText}
                  onChange={(e) => setFormState({ ...formState, shortText: e.target.value })}
                />
              </div>

              {/* Full Prompt Instruction */}
              <div className={styles.formGroup}>
                <label>
                  <span>AI Prompt Instruction *</span>
                  <small style={{ color: '#64748b' }}>Injected into AI search bar</small>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Pick up my laptop from office and deliver home by 8 PM"
                  value={formState.promptText}
                  onChange={(e) => setFormState({ ...formState, promptText: e.target.value })}
                />
              </div>

              {/* Service & Order */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Linked Service</label>
                  <select
                    value={formState.serviceSlug}
                    onChange={(e) => setFormState({ ...formState, serviceSlug: e.target.value })}
                  >
                    {SERVICE_PRESETS.map((svc) => (
                      <option key={svc.slug} value={svc.slug}>
                        {svc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Display Order</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={formState.displayOrder}
                    onChange={(e) => setFormState({ ...formState, displayOrder: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Icon & Color */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Vector Icon</label>
                  <select
                    value={formState.icon}
                    onChange={(e) => setFormState({ ...formState, icon: e.target.value })}
                  >
                    {ICON_PRESETS.map((ic) => (
                      <option key={ic.id} value={ic.id}>
                        {ic.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <span>Icon Color</span>
                    <span style={{ color: formState.iconColor }}>{formState.iconColor}</span>
                  </label>
                  <input
                    type="color"
                    value={formState.iconColor}
                    onChange={(e) => setFormState({ ...formState, iconColor: e.target.value })}
                    style={{ height: 38, padding: 2, cursor: 'pointer' }}
                  />
                  <div className={styles.colorPresetsRow}>
                    {COLOR_PRESETS.map((cp) => (
                      <button
                        key={cp.hex}
                        type="button"
                        className={`${styles.colorSwatch} ${formState.iconColor === cp.hex ? styles.active : ''}`}
                        style={{ background: cp.hex }}
                        onClick={() => setFormState({ ...formState, iconColor: cp.hex })}
                        title={cp.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Image Upload */}
              <div className={styles.formGroup}>
                <label>
                  <span>Custom Image (Optional)</span>
                  <small style={{ color: '#64748b' }}>PNG, JPG, or WEBP stored in database</small>
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                />
                {(filePreview || editingItem?.imageUrl) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, padding: 8, background: '#f8fafc', borderRadius: 8 }}>
                    <img
                      src={filePreview || editingItem?.imageUrl}
                      alt="Preview"
                      style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 6, background: '#fff', border: '1px solid #e2e8f0' }}
                    />
                    <small style={{ color: '#64748b' }}>
                      {filePreview ? 'Selected image preview (will be saved on submit)' : 'Current saved database image'}
                    </small>
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={formState.isActive}
                  onChange={(e) => setFormState({ ...formState, isActive: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#d97706', cursor: 'pointer' }}
                />
                <label htmlFor="activeToggle" style={{ fontSize: '0.88rem', fontWeight: 650, color: '#1e293b', cursor: 'pointer' }}>
                  Active (show this card in the customer "Try these examples" modal)
                </label>
              </div>

              {/* Modal Footer */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnSave} disabled={formSaving}>
                  {formSaving ? 'Saving…' : isCreating ? 'Create Card' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Live Customer Preview Modal */}
      {previewModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setPreviewModalOpen(false)}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: 28,
              width: 'min(100%, 460px)',
              padding: '24px 22px 20px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Sparkles size={22} color="#f59e0b" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 750, color: '#1e293b' }}>
                Try these examples (Live Customer View)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 18 }}>
              {items
                .filter((i) => i.isActive)
                .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                .map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: '#ffffff',
                      border: '1.5px solid #fde047',
                      borderRadius: 18,
                      padding: '14px 14px',
                      minHeight: 84,
                    }}
                  >
                    <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} style={{ width: 30, height: 30, objectFit: 'contain' }} />
                      ) : (
                        renderVectorIcon(item.icon, item.iconColor, 22)
                      )}
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 550, color: '#334155', lineHeight: 1.35 }}>
                      {item.shortText || item.title}
                    </span>
                  </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 6 }}>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#d97706',
                  fontSize: '1rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  padding: '6px 14px',
                }}
                onClick={() => setPreviewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
