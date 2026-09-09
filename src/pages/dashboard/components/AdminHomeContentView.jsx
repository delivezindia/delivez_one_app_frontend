import React, { useEffect, useState } from 'react'
import {
  Zap,
  Tag,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Trash2,
  Edit,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Eye,
  Check,
  Package,
  SearchCheck,
  MapPin,
  Headphones,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Save,
  ArrowRight,
} from 'lucide-react'
import {
  fetchAdminQuickActions,
  createAdminQuickAction,
  updateAdminQuickAction,
  uploadAdminQuickActionImage,
  removeAdminQuickActionImage,
  deleteAdminQuickAction,
  fetchAdminBanner,
  updateAdminBanner,
  uploadAdminBannerImage,
  removeAdminBannerImage,
  fetchAdminChips,
  updateAdminChips,
  fetchAdminHero,
  updateAdminHero,
  uploadAdminHeroImage,
  removeAdminHeroImage,
} from '@/features/home-content/services/adminHomeContentService.js'
import styles from './AdminHomeContentView.module.css'

const ACTION_TRIGGER_OPTIONS = [
  { value: 'route', label: 'Internal Page Route (e.g. /courier)' },
  { value: 'modal_track', label: 'Trigger: Live Shipment Tracking Modal' },
  { value: 'modal_pincode', label: 'Trigger: Find Pincode Modal' },
  { value: 'modal_support', label: 'Trigger: 24/7 Support Assistance Modal' },
]

const ICON_OPTIONS = [
  { id: 'shopping-bag', label: 'Shopping Bag (Shop Now / Order)' },
  { id: 'search-check', label: 'Search Check (Track Shipment)' },
  { id: 'map-pin', label: 'Map Pin (Find Pincode)' },
  { id: 'headphones', label: 'Headphones (Help & Support)' },
  { id: 'package', label: 'Package / Parcel' },
  { id: 'truck', label: 'Delivery Truck' },
  { id: 'shield-check', label: 'Shield (Vault / Confidential)' },
  { id: 'rotate-ccw', label: 'Rotate Arrow (Return Pickup)' },
  { id: 'sparkles', label: 'Sparkles / AI' },
]

export default function AdminHomeContentView() {
  const [activeTab, setActiveTab] = useState('quick-actions')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  // 1. Quick Actions State
  const [quickActions, setQuickActions] = useState([])
  const [qaModalOpen, setQaModalOpen] = useState(false)
  const [qaIsCreating, setQaIsCreating] = useState(false)
  const [qaEditingItem, setQaEditingItem] = useState(null)
  const [qaFile, setQaFile] = useState(null)
  const [qaFilePreview, setQaFilePreview] = useState(null)
  const [qaFormSaving, setQaFormSaving] = useState(false)
  const [qaForm, setQaForm] = useState({
    title: '',
    subtitle: '',
    icon: 'package',
    actionType: 'route',
    actionTarget: '/courier',
    badge: '',
    displayOrder: 1,
    isActive: true,
  })

  // 2. Promo Banner State
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    backgroundColor: '#fffbeb',
    textColor: '#111827',
    isActive: true,
    imageUrl: '',
  })
  const [bannerImageFile, setBannerImageFile] = useState(null)
  const [bannerImagePreview, setBannerImagePreview] = useState(null)
  const [bannerSaving, setBannerSaving] = useState(false)

  // 3. Action Chips State
  const [chips, setChips] = useState([])
  const [newChipLabel, setNewChipLabel] = useState('')
  const [newChipRoute, setNewChipRoute] = useState('/courier')
  const [chipsSaving, setChipsSaving] = useState(false)

  // 4. Hero & Mascot State
  const [heroForm, setHeroForm] = useState({
    greetingPrefix: 'Hi',
    defaultName: 'Arjun',
    greetingEmoji: '👋',
    headline: 'What do you need delivered today?',
    highlightWord: 'delivered',
    subtitle: 'From urgent keys & office laptops to heavy luggage & surprise gifts.',
    searchTitle: 'Tell us in your own words...',
    searchPlaceholder: 'Example: Pick up my laptop from office and deliver home by 8 PM.',
    micEnabled: true,
    sideImageUrl: '',
  })
  const [heroMascotFile, setHeroMascotFile] = useState(null)
  const [heroMascotPreview, setHeroMascotPreview] = useState(null)
  const [heroSaving, setHeroSaving] = useState(false)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4500)
  }

  // Load All Data
  const loadAllData = async () => {
    setLoading(true)
    try {
      const [qaList, bannerData, chipsList, heroData] = await Promise.all([
        fetchAdminQuickActions().catch(() => []),
        fetchAdminBanner().catch(() => null),
        fetchAdminChips().catch(() => []),
        fetchAdminHero().catch(() => null),
      ])

      if (qaList) setQuickActions(qaList)
      if (bannerData) setBannerForm(bannerData)
      if (chipsList) setChips(chipsList)
      if (heroData) setHeroForm(heroData)
    } catch (err) {
      console.error(err)
      showToast('Error loading home content: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  // ========================================================
  // Quick Actions Handlers
  // ========================================================
  const handleOpenCreateQA = () => {
    setQaIsCreating(true)
    setQaEditingItem(null)
    setQaFile(null)
    setQaFilePreview(null)
    setQaForm({
      title: '',
      subtitle: '',
      icon: 'package',
      actionType: 'route',
      actionTarget: '/courier',
      badge: '',
      displayOrder: quickActions.length + 1,
      isActive: true,
    })
    setQaModalOpen(true)
  }

  const handleOpenEditQA = (item) => {
    setQaIsCreating(false)
    setQaEditingItem(item)
    setQaFile(null)
    setQaFilePreview(null)
    setQaForm({
      title: item.title || '',
      subtitle: item.subtitle || '',
      icon: item.icon || 'package',
      actionType: item.actionType || 'route',
      actionTarget: item.actionTarget || '/courier',
      badge: item.badge || '',
      displayOrder: item.displayOrder ?? 1,
      isActive: item.isActive ?? true,
    })
    setQaModalOpen(true)
  }

  const handleSaveQA = async (e) => {
    e.preventDefault()
    if (!qaForm.title.trim() || !qaForm.subtitle.trim()) {
      alert('Title and Subtitle are required.')
      return
    }

    setQaFormSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', qaForm.title.trim())
      formData.append('subtitle', qaForm.subtitle.trim())
      formData.append('icon', qaForm.icon)
      formData.append('actionType', qaForm.actionType)
      formData.append('actionTarget', qaForm.actionTarget)
      formData.append('badge', qaForm.badge.trim())
      formData.append('displayOrder', String(qaForm.displayOrder))
      formData.append('isActive', String(qaForm.isActive))

      if (qaFile) {
        formData.append('image', qaFile)
      }

      if (qaIsCreating) {
        await createAdminQuickAction(formData)
        showToast(`Created Quick Action '${qaForm.title}'!`)
      } else {
        await updateAdminQuickAction(qaEditingItem.id, formData)
        showToast(`Updated '${qaForm.title}'!`)
      }

      setQaModalOpen(false)
      loadAllData()
    } catch (err) {
      alert(err.message || 'Failed to save Quick Action.')
    } finally {
      setQaFormSaving(false)
    }
  }

  const handleInlineQAImageUpload = async (item, file) => {
    if (!file) return
    try {
      await uploadAdminQuickActionImage(item.id, file)
      showToast(`Custom image uploaded for '${item.title}'.`)
      loadAllData()
    } catch (err) {
      alert(err.message || 'Failed to upload image.')
    }
  }

  const handleRemoveQAImage = async (item) => {
    if (!window.confirm(`Remove custom image for '${item.title}' and revert to vector icon?`)) return
    try {
      await removeAdminQuickActionImage(item.id)
      showToast(`Custom image removed. Vector icon restored.`)
      loadAllData()
    } catch (err) {
      alert(err.message || 'Failed to remove image.')
    }
  }

  const handleToggleQAActive = async (item) => {
    try {
      await updateAdminQuickAction(item.id, { isActive: !item.isActive })
      showToast(`'${item.title}' is now ${!item.isActive ? 'Active' : 'Inactive'}.`)
      loadAllData()
    } catch (err) {
      alert(err.message || 'Failed to toggle status.')
    }
  }

  const handleDeleteQA = async (item) => {
    if (!window.confirm(`Are you sure you want to delete Quick Action '${item.title}'?`)) return
    try {
      await deleteAdminQuickAction(item.id)
      showToast(`Deleted '${item.title}'.`)
      loadAllData()
    } catch (err) {
      alert(err.message || 'Failed to delete Quick Action.')
    }
  }

  // ========================================================
  // Promo Banner Handler
  // ========================================================
  const handleBannerFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerImageFile(file)
    setBannerImagePreview(URL.createObjectURL(file))
  }

  const handleSaveBanner = async (e) => {
    e.preventDefault()
    setBannerSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', bannerForm.title || '')
      formData.append('subtitle', bannerForm.subtitle || '')
      formData.append('buttonText', bannerForm.buttonText || '')
      formData.append('buttonLink', bannerForm.buttonLink || '')
      formData.append('backgroundColor', bannerForm.backgroundColor || '#fffbeb')
      formData.append('textColor', bannerForm.textColor || '#111827')
      formData.append('isActive', String(bannerForm.isActive))

      if (bannerImageFile) {
        formData.append('image', bannerImageFile)
      }

      await updateAdminBanner(formData)
      showToast('Promo banner & image updated successfully!')
      setBannerImageFile(null)
      setBannerImagePreview(null)
      loadAllData()
    } catch (err) {
      alert(err.message || 'Failed to update banner.')
    } finally {
      setBannerSaving(false)
    }
  }

  const handleUploadBannerImageNow = async (file) => {
    if (!file) return
    try {
      await uploadAdminBannerImage(file)
      showToast('Custom banner image uploaded and active!')
      setBannerImageFile(null)
      setBannerImagePreview(null)
      loadAllData()
    } catch (err) {
      alert(err.message || 'Failed to upload banner image.')
    }
  }

  const handleRemoveBannerImage = async () => {
    if (!window.confirm('Remove custom banner image and revert to vector icon?')) return
    try {
      await removeAdminBannerImage()
      showToast('Custom banner image removed. Vector icon restored.')
      setBannerImageFile(null)
      setBannerImagePreview(null)
      loadAllData()
    } catch (err) {
      alert(err.message || 'Failed to remove banner image.')
    }
  }

  // ========================================================
  // Action Chips Handlers
  // ========================================================
  const handleAddChip = () => {
    if (!newChipLabel.trim()) return
    const id = newChipLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `chip-${Date.now()}`
    const updated = [
      ...chips,
      {
        id,
        label: newChipLabel.trim(),
        route: newChipRoute,
        icon: 'tag',
        displayOrder: chips.length + 1,
        isActive: true,
      },
    ]
    setChips(updated)
    setNewChipLabel('')
  }

  const handleRemoveChip = (index) => {
    const updated = chips.filter((_, i) => i !== index)
    setChips(updated)
  }

  const handleSaveChips = async () => {
    setChipsSaving(true)
    try {
      await updateAdminChips(chips)
      showToast('Action chips updated successfully!')
      loadAllData()
    } catch (err) {
      alert(err.message || 'Failed to update action chips.')
    } finally {
      setChipsSaving(false)
    }
  }

  // ========================================================
  // Hero & Mascot Handlers
  // ========================================================
  const handleHeroMascotFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setHeroMascotFile(file)
    setHeroMascotPreview(URL.createObjectURL(file))
  }

  const handleSaveHero = async (e) => {
    e.preventDefault()
    setHeroSaving(true)
    try {
      const formData = new FormData()
      formData.append('greetingPrefix', heroForm.greetingPrefix)
      formData.append('defaultName', heroForm.defaultName)
      formData.append('greetingEmoji', heroForm.greetingEmoji)
      formData.append('headline', heroForm.headline)
      formData.append('highlightWord', heroForm.highlightWord)
      formData.append('subtitle', heroForm.subtitle)
      formData.append('searchTitle', heroForm.searchTitle)
      formData.append('searchPlaceholder', heroForm.searchPlaceholder)
      formData.append('micEnabled', String(heroForm.micEnabled))

      if (heroMascotFile) {
        formData.append('image', heroMascotFile)
      }

      await updateAdminHero(formData)
      showToast('Hero section & Golden Mascot updated successfully!')
      setHeroMascotFile(null)
      setHeroMascotPreview(null)
      loadAllData()
    } catch (err) {
      alert(err.message || 'Failed to save Hero configuration.')
    } finally {
      setHeroSaving(false)
    }
  }

  const handleUploadHeroMascotNow = async (file) => {
    if (!file) return
    try {
      await uploadAdminHeroImage(file)
      showToast('Golden mascot image uploaded and active!')
      setHeroMascotFile(null)
      setHeroMascotPreview(null)
      loadAllData()
    } catch (err) {
      alert(err.message || 'Failed to upload mascot image.')
    }
  }

  const handleRemoveHeroMascot = async () => {
    if (!window.confirm('Revert Mascot to original default Golden Mascot?')) return
    try {
      await removeAdminHeroImage()
      showToast('Reverted to default Golden Mascot.')
      loadAllData()
    } catch (err) {
      alert(err.message || 'Failed to remove mascot image.')
    }
  }

  const renderQAIcon = (iconName, size = 26) => {
    switch (iconName?.toLowerCase()) {
      case 'shopping-bag':
        return <ShoppingBag size={size} color="#e5a100" />
      case 'search-check':
        return <SearchCheck size={size} color="#087fc1" />
      case 'map-pin':
        return <MapPin size={size} color="#15803d" />
      case 'headphones':
        return <Headphones size={size} color="#e00014" />
      case 'truck':
        return <Truck size={size} color="#087fc1" />
      case 'shield-check':
        return <ShieldCheck size={size} color="#e00014" />
      case 'rotate-ccw':
        return <RotateCcw size={size} color="#ee5a08" />
      default:
        return <Package size={size} color="#d97706" />
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* 1. Subtabs Navigation */}
      <div className={styles.tabNav}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'quick-actions' ? styles.active : ''}`}
          onClick={() => setActiveTab('quick-actions')}
        >
          <Zap size={16} />
          <span>Quick Action Cards</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'banner' ? styles.active : ''}`}
          onClick={() => setActiveTab('banner')}
        >
          <Tag size={16} />
          <span>Promo Banner</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'chips' ? styles.active : ''}`}
          onClick={() => setActiveTab('chips')}
        >
          <Sparkles size={16} />
          <span>Action Chips</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'hero' ? styles.active : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          <ImageIcon size={16} />
          <span>Hero & 3D Mascot</span>
        </button>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className={styles.toastMsg}>
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: QUICK ACTION CARDS (Shop Now, Track, Pincode, Help) */}
      {/* ======================================================== */}
      {activeTab === 'quick-actions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className={styles.sectionHeader}>
            <div className={styles.titleArea}>
              <h2>Quick Action Cards</h2>
              <p>Manage the 4 primary action cards on the home page (Shop Now, Track, Pincode, Support).</p>
            </div>
            <button type="button" className={styles.btnPrimary} onClick={handleOpenCreateQA}>
              <Plus size={16} />
              <span>Add Quick Action Card</span>
            </button>
          </div>

          <div className={styles.actionsGrid}>
            {quickActions.map((item) => (
              <div key={item.id} className={styles.actionCard}>
                <div className={styles.cardTop}>
                  <span className={styles.orderBadge}>Order #{item.displayOrder ?? 1}</span>
                  <button
                    type="button"
                    className={`${styles.statusBadge} ${item.isActive ? styles.statusActive : styles.statusInactive}`}
                    onClick={() => handleToggleQAActive(item)}
                    title="Toggle Active / Inactive"
                  >
                    {item.isActive ? <Check size={12} /> : <X size={12} />}
                    <span>{item.isActive ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>

                <div className={styles.cardBody}>
                  <div className={`${styles.mediaPreview} ${item.imageUrl ? styles.hasImage : ''}`}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className={styles.customImg} />
                    ) : (
                      renderQAIcon(item.icon, 30)
                    )}
                  </div>

                  <div className={styles.contentCol}>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    <p className={styles.subtitle}>{item.subtitle}</p>
                    <span className={styles.triggerPill}>
                      Trigger: {item.actionType} &rarr; {item.actionTarget}
                    </span>
                    {item.badge && (
                      <span style={{ marginLeft: 6, fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.footerLeft}>
                    <label className={styles.uploadLabelBtn} title="Upload custom image to database">
                      <Upload size={13} />
                      <span>{item.imageUrl ? 'Change Image' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => {
                          handleInlineQAImageUpload(item, e.target.files?.[0])
                          e.target.value = ''
                        }}
                      />
                    </label>

                    {item.imageUrl && (
                      <button
                        type="button"
                        className={styles.iconBtnDanger}
                        onClick={() => handleRemoveQAImage(item)}
                        title="Remove custom image"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div className={styles.footerRight}>
                    <button type="button" className={styles.btnEdit} onClick={() => handleOpenEditQA(item)}>
                      <Edit size={13} />
                      <span>Edit</span>
                    </button>
                    <button type="button" className={styles.btnDelete} onClick={() => handleDeleteQA(item)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PROMO BANNER                                      */}
      {/* ======================================================== */}
      {activeTab === 'banner' && (
        <form className={styles.bannerFormCard} onSubmit={handleSaveBanner}>
          <div className={styles.sectionHeader}>
            <div className={styles.titleArea}>
              <h2>Promotional Home Banner</h2>
              <p>Customize the announcement banner shown on the home page with live customer preview and custom banner image.</p>
            </div>
            <button type="submit" className={styles.btnSaveAll} disabled={bannerSaving}>
              <Save size={16} />
              <span>{bannerSaving ? 'Saving…' : 'Save Banner Changes'}</span>
            </button>
          </div>

          {/* Banner Custom Image Manager */}
          <div className={styles.heroMediaCard}>
            <div className={styles.mascotPreviewBox} style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>
              {bannerImagePreview || bannerForm.imageUrl ? (
                <img
                  src={bannerImagePreview || bannerForm.imageUrl}
                  alt="Promo Banner"
                  className={styles.mascotImg}
                  onError={(e) => {
                    e.currentTarget.src = 'http://localhost:4000/api/v1/home/banner/image'
                  }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#94a3b8' }}>
                  <Package size={48} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Default Vector Icon</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
                Promotional Banner Image
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                Upload a custom image/icon for the home promotional banner. Served dynamically at <code>/api/v1/home/banner/image</code>.
              </p>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <label className={styles.uploadLabelBtn}>
                  <Upload size={14} />
                  <span>Choose Banner Image</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleBannerFileChange}
                  />
                </label>

                {bannerImageFile && (
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() => handleUploadBannerImageNow(bannerImageFile)}
                    style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                  >
                    <Upload size={14} />
                    <span>Upload Image Now</span>
                  </button>
                )}

                {(bannerForm.imageUrl || bannerImagePreview) && (
                  <button
                    type="button"
                    className={styles.btnDelete}
                    onClick={handleRemoveBannerImage}
                    title="Remove custom banner image & restore default icon"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {bannerImageFile && (
                <small style={{ color: '#16a34a', fontWeight: 600 }}>
                  ✓ Selected file: {bannerImageFile.name} (click "Upload Image Now" or "Save Banner Changes")
                </small>
              )}
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Banner Headline *</label>
              <input
                type="text"
                required
                value={bannerForm.title}
                onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                placeholder="e.g. Send anything, anytime, anywhere"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Subtitle / Body *</label>
              <input
                type="text"
                required
                value={bannerForm.subtitle}
                onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                placeholder="e.g. From urgent office laptops to confidential contracts"
              />
            </div>

            <div className={styles.formGroup}>
              <label>CTA Button Label</label>
              <input
                type="text"
                value={bannerForm.buttonText}
                onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                placeholder="e.g. Book a Delivery Now"
              />
            </div>

            <div className={styles.formGroup}>
              <label>CTA Target Route</label>
              <input
                type="text"
                value={bannerForm.buttonLink}
                onChange={(e) => setBannerForm({ ...bannerForm, buttonLink: e.target.value })}
                placeholder="e.g. /courier"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Background Color / Gradient</label>
              <input
                type="text"
                value={bannerForm.backgroundColor}
                onChange={(e) => setBannerForm({ ...bannerForm, backgroundColor: e.target.value })}
                placeholder="e.g. #fef08a or linear-gradient(...)"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Text Color</label>
              <input
                type="text"
                value={bannerForm.textColor}
                onChange={(e) => setBannerForm({ ...bannerForm, textColor: e.target.value })}
                placeholder="e.g. #111827"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <input
              type="checkbox"
              id="bannerActive"
              checked={bannerForm.isActive}
              onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: '#d97706', cursor: 'pointer' }}
            />
            <label htmlFor="bannerActive" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', cursor: 'pointer' }}>
              Active (show banner on the customer home page)
            </label>
          </div>

          {/* Live Preview Box */}
          <div style={{ marginTop: 12 }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#64748b' }}>
              LIVE CUSTOMER BANNER PREVIEW:
            </h4>
            <div
              className={styles.liveBannerBox}
              style={{
                background: bannerForm.backgroundColor || '#fffbeb',
                color: bannerForm.textColor || '#111827',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {bannerImagePreview || bannerForm.imageUrl ? (
                    <img
                      src={bannerImagePreview || bannerForm.imageUrl}
                      alt="Banner"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Package size={28} color={bannerForm.textColor || '#111827'} />
                  )}
                </div>
                <div className={styles.liveBannerText}>
                  <h3>{bannerForm.title || 'Send anything, anytime, anywhere'}</h3>
                  <p>{bannerForm.subtitle || 'Fast, secure & guaranteed doorstep delivery.'}</p>
                </div>
              </div>
              <button
                type="button"
                className={styles.liveBannerBtn}
                style={{ background: '#ffffff', color: '#111827' }}
              >
                {bannerForm.buttonText || 'Book Delivery'} &rarr;
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ACTION CHIPS                                      */}
      {/* ======================================================== */}
      {activeTab === 'chips' && (
        <div className={styles.bannerFormCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.titleArea}>
              <h2>Home Action Chips</h2>
              <p>Quick navigation pills displayed horizontally under the promotional banner.</p>
            </div>
            <button
              type="button"
              className={styles.btnSaveAll}
              onClick={handleSaveChips}
              disabled={chipsSaving}
            >
              <Save size={16} />
              <span>{chipsSaving ? 'Saving…' : 'Save Chips'}</span>
            </button>
          </div>

          {/* Chips List */}
          <div className={styles.chipsContainer}>
            {chips.map((chip, idx) => (
              <div key={chip.id || idx} className={styles.chipItem}>
                <span>{chip.label}</span>
                <small style={{ color: '#94a3b8' }}>({chip.route})</small>
                <button
                  type="button"
                  className={styles.chipRemoveBtn}
                  onClick={() => handleRemoveChip(idx)}
                  title="Remove chip"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Chip */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginTop: 10, flexWrap: 'wrap' }}>
            <div className={styles.formGroup} style={{ flex: 1, minWidth: 200 }}>
              <label>Chip Label</label>
              <input
                type="text"
                placeholder="e.g. Airport Luggage"
                value={newChipLabel}
                onChange={(e) => setNewChipLabel(e.target.value)}
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1, minWidth: 200 }}>
              <label>Target Route</label>
              <input
                type="text"
                placeholder="e.g. /luggage-delivery"
                value={newChipRoute}
                onChange={(e) => setNewChipRoute(e.target.value)}
              />
            </div>
            <button type="button" className={styles.btnPrimary} onClick={handleAddChip}>
              <Plus size={16} />
              <span>Add Chip</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: HERO & 3D GOLDEN MASCOT IMAGE                     */}
      {/* ======================================================== */}
      {activeTab === 'hero' && (
        <form className={styles.bannerFormCard} onSubmit={handleSaveHero}>
          <div className={styles.sectionHeader}>
            <div className={styles.titleArea}>
              <h2>Hero Section & 3D Golden Mascot</h2>
              <p>Customize the headline greeting, search bar, and upload a custom 3D mascot image asset.</p>
            </div>
            <button type="submit" className={styles.btnSaveAll} disabled={heroSaving}>
              <Save size={16} />
              <span>{heroSaving ? 'Saving…' : 'Save Hero Changes'}</span>
            </button>
          </div>

          {/* Mascot Image Manager */}
          <div className={styles.heroMediaCard}>
            <div className={styles.mascotPreviewBox}>
              <img
                src={heroMascotPreview || heroForm.sideImageUrl || 'http://localhost:4000/api/v1/home/hero/image'}
                alt="Golden Mascot"
                className={styles.mascotImg}
                onError={(e) => {
                  e.currentTarget.src = 'http://localhost:4000/api/v1/home/hero/image'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
                Golden 3D Delivery Mascot Asset
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                Served dynamically at <code>/api/v1/home/hero/image</code>. Upload any PNG (with transparency), WebP, or JPG image.
              </p>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <label className={styles.uploadLabelBtn}>
                  <Upload size={14} />
                  <span>Select Mascot Image File</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleHeroMascotFileChange}
                  />
                </label>

                {heroMascotFile && (
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() => handleUploadHeroMascotNow(heroMascotFile)}
                    style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                  >
                    <Upload size={14} />
                    <span>Upload Mascot Now</span>
                  </button>
                )}

                <button
                  type="button"
                  className={styles.btnDelete}
                  onClick={handleRemoveHeroMascot}
                  title="Revert to original default mascot"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {heroMascotFile && (
                <small style={{ color: '#16a34a', fontWeight: 600 }}>
                  ✓ Selected file: {heroMascotFile.name} (click "Upload Mascot Now" or "Save Hero Changes")
                </small>
              )}
            </div>
          </div>

          {/* Hero Form Fields */}
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Greeting Prefix</label>
              <input
                type="text"
                value={heroForm.greetingPrefix}
                onChange={(e) => setHeroForm({ ...heroForm, greetingPrefix: e.target.value })}
                placeholder="Hi"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Default User Name</label>
              <input
                type="text"
                value={heroForm.defaultName}
                onChange={(e) => setHeroForm({ ...heroForm, defaultName: e.target.value })}
                placeholder="Arjun"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Greeting Emoji</label>
              <input
                type="text"
                value={heroForm.greetingEmoji}
                onChange={(e) => setHeroForm({ ...heroForm, greetingEmoji: e.target.value })}
                placeholder="👋"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Hero Headline *</label>
              <input
                type="text"
                required
                value={heroForm.headline}
                onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
                placeholder="What do you need delivered today?"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Highlighted Word in Headline</label>
              <input
                type="text"
                value={heroForm.highlightWord}
                onChange={(e) => setHeroForm({ ...heroForm, highlightWord: e.target.value })}
                placeholder="delivered"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Hero Subtitle</label>
              <input
                type="text"
                value={heroForm.subtitle}
                onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                placeholder="From urgent keys & office laptops..."
              />
            </div>

            <div className={styles.formGroup}>
              <label>Search Input Label</label>
              <input
                type="text"
                value={heroForm.searchTitle}
                onChange={(e) => setHeroForm({ ...heroForm, searchTitle: e.target.value })}
                placeholder="Tell us in your own words..."
              />
            </div>

            <div className={styles.formGroup}>
              <label>Search Input Placeholder</label>
              <input
                type="text"
                value={heroForm.searchPlaceholder}
                onChange={(e) => setHeroForm({ ...heroForm, searchPlaceholder: e.target.value })}
                placeholder="Example: Pick up my laptop..."
              />
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* QUICK ACTION CREATE / EDIT MODAL                         */}
      {/* ======================================================== */}
      {qaModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setQaModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{qaIsCreating ? 'Create Quick Action Card' : 'Edit Quick Action Card'}</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setQaModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form className={styles.modalForm} onSubmit={handleSaveQA}>
              <div className={styles.formGroup}>
                <label>Card Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shop Now"
                  value={qaForm.title}
                  onChange={(e) => setQaForm({ ...qaForm, title: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Subtitle / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Order delivery directly"
                  value={qaForm.subtitle}
                  onChange={(e) => setQaForm({ ...qaForm, subtitle: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className={styles.formGroup}>
                  <label>Action Trigger Type</label>
                  <select
                    value={qaForm.actionType}
                    onChange={(e) => setQaForm({ ...qaForm, actionType: e.target.value })}
                  >
                    {ACTION_TRIGGER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Action Target</label>
                  <input
                    type="text"
                    placeholder="e.g. /courier or modal_track"
                    value={qaForm.actionTarget}
                    onChange={(e) => setQaForm({ ...qaForm, actionTarget: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className={styles.formGroup}>
                  <label>Vector Icon</label>
                  <select
                    value={qaForm.icon}
                    onChange={(e) => setQaForm({ ...qaForm, icon: e.target.value })}
                  >
                    {ICON_OPTIONS.map((ico) => (
                      <option key={ico.id} value={ico.id}>
                        {ico.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Badge Text (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Instant, Live ETA"
                    value={qaForm.badge}
                    onChange={(e) => setQaForm({ ...qaForm, badge: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className={styles.formGroup}>
                  <label>Display Order</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={qaForm.displayOrder}
                    onChange={(e) => setQaForm({ ...qaForm, displayOrder: Number(e.target.value) })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Custom Image Asset (Optional)</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setQaFile(file)
                        setQaFilePreview(URL.createObjectURL(file))
                      }
                    }}
                  />
                </div>
              </div>

              {(qaFilePreview || qaEditingItem?.imageUrl) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, background: '#f8fafc', borderRadius: 8 }}>
                  <img
                    src={qaFilePreview || qaEditingItem?.imageUrl}
                    alt="Preview"
                    style={{ width: 44, height: 44, objectFit: 'contain', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6 }}
                  />
                  <small style={{ color: '#64748b' }}>
                    {qaFilePreview ? 'Selected image preview (saved on submit)' : 'Current saved database image'}
                  </small>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="qaActiveToggle"
                  checked={qaForm.isActive}
                  onChange={(e) => setQaForm({ ...qaForm, isActive: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#d97706', cursor: 'pointer' }}
                />
                <label htmlFor="qaActiveToggle" style={{ fontSize: '0.88rem', fontWeight: 650, color: '#1e293b', cursor: 'pointer' }}>
                  Active (show this quick action card on the home page)
                </label>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setQaModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnSave} disabled={qaFormSaving}>
                  {qaFormSaving ? 'Saving…' : qaIsCreating ? 'Create Card' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
