import React, { useCallback, useEffect, useState } from 'react'
import {
  Tag,
  Plus,
  CheckCircle2,
  Copy,
  Percent,
  TrendingUp,
  Coins,
  Calendar,
  Trash2,
  Power,
  X,
  Sparkles
} from 'lucide-react'
import {
  fetchPromos,
  createPromoCode,
  togglePromoCodeStatus,
  deletePromoCode
} from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminPromosView.module.css'

export default function AdminPromosView() {
  const [promos, setPromos] = useState([])
  const [stats, setStats] = useState({ totalPromos: 0, activePromos: 0, totalRedemptions: 0, totalSavingsDisbursed: 0 })
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState('')

  const [form, setForm] = useState({
    code: '',
    title: '',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    maxDiscount: 150,
    minOrderValue: 299,
    applicableService: 'ALL',
    usageLimit: 500,
    validUntil: '',
  })

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  const loadPromos = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPromos()
      if (data) {
        setPromos(data.promos || [])
        setStats(data.stats || { totalPromos: 0, activePromos: 0, totalRedemptions: 0, totalSavingsDisbursed: 0 })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPromos()
  }, [loadPromos])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const promo = await createPromoCode(form)
      setModalOpen(false)
      showToast(`Promo code ${promo?.code} created!`)
      setForm({
        code: '',
        title: '',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        maxDiscount: 150,
        minOrderValue: 299,
        applicableService: 'ALL',
        usageLimit: 500,
        validUntil: '',
      })
      loadPromos()
    } catch (err) {
      alert(err.message || 'Failed to create promo code')
    }
  }

  const handleToggle = async (id) => {
    try {
      const updated = await togglePromoCodeStatus(id)
      showToast(`Promo ${updated?.code} status toggled!`)
      loadPromos()
    } catch (err) {
      alert(err.message || 'Failed to update promo status')
    }
  }

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete promo code ${code}?`)) return
    try {
      await deletePromoCode(id)
      showToast(`Promo ${code} deleted.`)
      loadPromos()
    } catch (err) {
      alert(err.message || 'Failed to delete promo code')
    }
  }

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code)
    showToast(`Copied ${code} to clipboard!`)
  }

  return (
    <div className={styles.wrapper}>
      {toast && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: '#0F172A',
          color: '#fff',
          padding: '12px 18px',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          fontWeight: 600,
          zIndex: 1000,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
        }}>
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2><Tag size={22} style={{ color: '#059669' }} /> Promotions & Coupon Discount Engine</h2>
          <p>Create targeted discount vouchers, festival promo campaigns, and track customer savings.</p>
        </div>
        <button type="button" className={styles.createBtn} onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Create Promo Code
        </button>
      </div>

      {/* KPI Strip */}
      <div className={styles.kpiStrip}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#ECFDF5', color: '#059669' }}>
            <Tag size={20} />
          </div>
          <div>
            <small>Active Promo Codes</small>
            <strong>{stats.activePromos} Campaigns</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <small>Total Redemptions</small>
            <strong>{stats.totalRedemptions.toLocaleString('en-IN')} Used</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#FEF3C7', color: '#D97706' }}>
            <Coins size={20} />
          </div>
          <div>
            <small>Savings Disbursed</small>
            <strong>₹{stats.totalSavingsDisbursed.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#F5F3FF', color: '#7C3AED' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <small>Avg Discount</small>
            <strong>
              ₹{stats.totalRedemptions ? Math.round(stats.totalSavingsDisbursed / stats.totalRedemptions) : 0} / trip
            </strong>
          </div>
        </div>
      </div>

      {/* Promos Grid */}
      <div className={styles.grid}>
        {promos.map(p => {
          const percentUsed = Math.min(100, Math.round((p.timesUsed / p.usageLimit) * 100))
          return (
            <div key={p.id} className={`${styles.promoCard} ${!p.isActive ? styles.promoCardInactive : ''}`}>
              <div className={styles.cardHead}>
                <span className={styles.codeBadge} onClick={() => copyCode(p.code)} style={{ cursor: 'pointer' }} title="Click to copy">
                  {p.code} <Copy size={12} color="#64748B" />
                </span>
                <span className={styles.serviceBadge}>
                  {p.applicableService === 'ALL' ? 'All Services' : p.applicableService}
                </span>
              </div>

              <h4 className={styles.cardTitle}>{p.title}</h4>

              <div className={styles.discountValue}>
                {p.discountType === 'PERCENTAGE'
                  ? `${p.discountValue}% OFF`
                  : `₹${p.discountValue} FLAT OFF`}
                {p.maxDiscount && (
                  <small style={{ fontSize: 11, color: '#64748B', fontWeight: 600, marginLeft: 6 }}>
                    (Up to ₹{p.maxDiscount})
                  </small>
                )}
              </div>

              <div className={styles.cardMeta}>
                <span>Min Order: <strong>₹{p.minOrderValue}</strong></span>
                <span>Valid till: <strong>{new Date(p.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</strong></span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginBottom: 4 }}>
                  <span>Usage: {p.timesUsed} / {p.usageLimit}</span>
                  <span>{percentUsed}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${percentUsed}%` }} />
                </div>
              </div>

              <div className={styles.cardFooter}>
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => handleToggle(p.id)}
                >
                  <Power size={11} style={{ marginRight: 4 }} />
                  {p.isActive ? 'Active (Click to Pause)' : 'Paused (Click to Enable)'}
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(p.id, p.code)}
                  title="Delete Coupon"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>Create Promotional Voucher</h3>
              <button type="button" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreate} className={styles.modalForm}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className={styles.formGroup}>
                  <label>Coupon Code *</label>
                  <input
                    required
                    placeholder="e.g. FLASH30"
                    value={form.code}
                    onChange={e => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={e => setForm(prev => ({ ...prev, discountType: e.target.value }))}
                  >
                    <option value="PERCENTAGE">Percentage (%) Off</option>
                    <option value="FLAT">Flat Amount (₹) Off</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Campaign Title *</label>
                <input
                  required
                  placeholder="e.g. Weekend Express Luggage Special"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className={styles.formGroup}>
                  <label>Discount Value ({form.discountType === 'PERCENTAGE' ? '%' : '₹'}) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.discountValue}
                    onChange={e => setForm(prev => ({ ...prev, discountValue: e.target.value }))}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 200"
                    value={form.maxDiscount || ''}
                    onChange={e => setForm(prev => ({ ...prev, maxDiscount: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className={styles.formGroup}>
                  <label>Minimum Order Value (₹)</label>
                  <input
                    type="number"
                    value={form.minOrderValue}
                    onChange={e => setForm(prev => ({ ...prev, minOrderValue: e.target.value }))}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Usage Limit (Claims)</label>
                  <input
                    type="number"
                    value={form.usageLimit}
                    onChange={e => setForm(prev => ({ ...prev, usageLimit: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className={styles.formGroup}>
                  <label>Applicable Service</label>
                  <select
                    value={form.applicableService}
                    onChange={e => setForm(prev => ({ ...prev, applicableService: e.target.value }))}
                  >
                    <option value="ALL">All Services</option>
                    <option value="gift-delivery">Gift Delivery</option>
                    <option value="personal-courier">Personal Courier</option>
                    <option value="confidential-courier">Confidential Cargo</option>
                    <option value="forgot-something">Forgot Something</option>
                    <option value="return-pickup">Return Pickup</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Valid Until Date</label>
                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={e => setForm(prev => ({ ...prev, validUntil: e.target.value }))}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.createBtn}>Publish Promo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
