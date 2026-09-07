import React, { useCallback, useEffect, useState } from 'react'
import {
  UserCog,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Bike,
  Star,
  CheckCircle2,
  X,
  RefreshCw,
  Edit2,
  Trash2,
  PackageCheck,
  AlertCircle,
  ShieldCheck,
  Award,
  Zap,
  Check
} from 'lucide-react'
import {
  fetchAdminPartners,
  createAdminPartner,
  updateAdminPartnerStatus,
  updateAdminPartnerProfile,
  deleteAdminPartner,
  fetchAdminPartnerDeliveries,
  fetchPartnerScorecard
} from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminPartnersView.module.css'

export default function AdminPartnersView() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, online: 0, busy: 0, offline: 0 })
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ fullName: '', mobileNumber: '', email: '', zone: 'South Delhi', vehicle: 'Electric Scooter (EV-01)' })

  // Edit partner state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({ id: '', fullName: '', mobileNumber: '', email: '', zone: '', vehicle: '' })

  // Trips state
  const [tripsModalOpen, setTripsModalOpen] = useState(false)
  const [tripsLoading, setTripsLoading] = useState(false)
  const [partnerTrips, setPartnerTrips] = useState([])
  const [selectedPartnerName, setSelectedPartnerName] = useState('')

  // Scorecard state
  const [scorecardModalOpen, setScorecardModalOpen] = useState(false)
  const [scorecardLoading, setScorecardLoading] = useState(false)
  const [scorecardData, setScorecardData] = useState(null)

  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  const handleOpenScorecard = async (partner) => {
    setScorecardModalOpen(true)
    setScorecardLoading(true)
    setScorecardData(null)
    try {
      const data = await fetchPartnerScorecard(partner.id)
      setScorecardData(data)
    } catch (err) {
      showToast(err.message || 'Failed to load driver scorecard.')
      setScorecardModalOpen(false)
    } finally {
      setScorecardLoading(false)
    }
  }

  const loadPartners = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminPartners({ search })
      if (data) {
        setPartners(data.partners || [])
        setStats({
          total: data.total || 0,
          online: data.onlineCount || 0,
          busy: data.busyCount || 0,
          offline: data.offlineCount || 0,
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    loadPartners()
  }, [loadPartners])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await createAdminPartner(form)
      setModalOpen(false)
      setForm({ fullName: '', mobileNumber: '', email: '', zone: 'South Delhi', vehicle: 'Electric Scooter (EV-01)' })
      showToast('New delivery partner registered successfully!')
      loadPartners()
    } catch (err) {
      alert(err.message || 'Failed to onboard partner.')
    }
  }

  // Quick Status Toggle: ONLINE -> BUSY -> OFFLINE -> ONLINE
  const handleStatusToggle = async (partner) => {
    const nextStatus = partner.status === 'ONLINE' ? 'BUSY' : partner.status === 'BUSY' ? 'OFFLINE' : 'ONLINE'
    try {
      await updateAdminPartnerStatus(partner.id, nextStatus)
      setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, status: nextStatus } : p))
      showToast(`Partner ${partner.name} status switched to ${nextStatus}`)
      loadPartners()
    } catch (err) {
      alert(err.message || 'Failed to toggle status.')
    }
  }

  // Open Edit Modal
  const handleOpenEdit = (partner) => {
    setEditForm({
      id: partner.id,
      fullName: partner.name,
      mobileNumber: partner.phone,
      email: partner.email || '',
      zone: partner.zone || '',
      vehicle: partner.vehicle || '',
    })
    setEditModalOpen(true)
  }

  // Save Edit
  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await updateAdminPartnerProfile(editForm.id, editForm)
      setEditModalOpen(false)
      showToast(`Profile updated for ${editForm.fullName}`)
      loadPartners()
    } catch (err) {
      alert(err.message || 'Failed to update partner.')
    }
  }

  // Delete / Deactivate Partner
  const handleDelete = async (partner) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove ${partner.name}?`)) return
    try {
      await deleteAdminPartner(partner.id)
      showToast(`Partner ${partner.name} removed.`)
      loadPartners()
    } catch (err) {
      alert(err.message || 'Failed to remove partner.')
    }
  }

  // View Assigned Deliveries
  const handleViewDeliveries = async (partner) => {
    setSelectedPartnerName(partner.name)
    setTripsModalOpen(true)
    setTripsLoading(true)
    try {
      const data = await fetchAdminPartnerDeliveries(partner.id)
      setPartnerTrips(data?.trips || [])
    } catch (err) {
      console.error(err)
      setPartnerTrips([])
    } finally {
      setTripsLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      {toast && (
        <div className={styles.toast}>
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toast}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}><UserCog size={22} /></div>
          <div><small>Total Fleet</small><strong>{stats.total} Riders</strong></div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#ECFDF5', color: '#059669' }}><CheckCircle2 size={22} /></div>
          <div><small>Online & Available</small><strong>{stats.online} Active</strong></div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#FFFBEB', color: '#D97706' }}><Bike size={22} /></div>
          <div><small>On Live Trips</small><strong>{stats.busy} Dispatched</strong></div>
        </div>
      </div>

      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search riders by name, vehicle, phone, hub zone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button type="button" className={styles.primaryBtn} onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Onboard New Rider
        </button>
      </div>

      {/* Partners Grid */}
      <div className={styles.grid}>
        {partners.map(p => (
          <div key={p.id} className={styles.partnerCard}>
            <div className={styles.cardHeader}>
              <div className={styles.avatar}>
                {p.name.slice(0, 1).toUpperCase()}
              </div>
              <div className={styles.nameZone}>
                <strong>{p.name}</strong>
                <span><MapPin size={12} /> {p.zone}</span>
              </div>
              <button
                type="button"
                className={`${styles.statusToggleBtn} ${styles['status_' + p.status]}`}
                onClick={() => handleStatusToggle(p)}
                title="Click to toggle status: ONLINE / BUSY / OFFLINE"
              >
                {p.status} ↻
              </button>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.infoRow}><Phone size={13} /> {p.phone}</div>
              <div className={styles.infoRow}><Bike size={13} /> {p.vehicle}</div>
              <div className={styles.statsRow}>
                <span><Star size={13} fill="#F59E0B" color="#F59E0B" /> <strong>{p.rating}</strong></span>
                <span><strong>{p.completedDeliveries}</strong> deliveries</span>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className={styles.cardActions}>
              <button
                type="button"
                className={styles.actionBtn}
                style={{ color: '#0284c7', background: '#f0f9ff', borderColor: '#bae6fd', fontWeight: 700 }}
                onClick={() => handleOpenScorecard(p)}
                title="View Performance & Safety Scorecard"
              >
                <Award size={13} /> Scorecard
              </button>
              <button type="button" className={styles.actionBtn} onClick={() => handleViewDeliveries(p)} title="View Assigned Deliveries">
                <PackageCheck size={13} /> Trips
              </button>
              <button type="button" className={styles.actionBtn} onClick={() => handleOpenEdit(p)} title="Edit Partner Details">
                <Edit2 size={13} /> Edit
              </button>
              <button type="button" className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => handleDelete(p)} title="Deactivate Rider">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Onboard Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>Onboard Delivery Rider</h3>
              <button type="button" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input required value={form.fullName} onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label>Mobile Number (10 digits) *</label>
                <input required value={form.mobileNumber} onChange={e => setForm(prev => ({ ...prev, mobileNumber: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label>Assigned Hub Zone</label>
                <input value={form.zone} onChange={e => setForm(prev => ({ ...prev, zone: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label>Vehicle Model & Registration</label>
                <input value={form.vehicle} onChange={e => setForm(prev => ({ ...prev, vehicle: e.target.value }))} />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Register Partner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {editModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setEditModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>Edit Partner Profile</h3>
              <button type="button" onClick={() => setEditModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdate} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input required value={editForm.fullName} onChange={e => setEditForm(prev => ({ ...prev, fullName: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label>Mobile Number</label>
                <input required value={editForm.mobileNumber} onChange={e => setEditForm(prev => ({ ...prev, mobileNumber: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label>Hub Zone</label>
                <input value={editForm.zone} onChange={e => setEditForm(prev => ({ ...prev, zone: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label>Vehicle Model & Number</label>
                <input value={editForm.vehicle} onChange={e => setEditForm(prev => ({ ...prev, vehicle: e.target.value }))} />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partner Deliveries Modal */}
      {tripsModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setTripsModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className={styles.modalHead}>
              <div>
                <h3>Assigned Trips - {selectedPartnerName}</h3>
                <small style={{ color: '#64748B' }}>Deliveries handled across all service verticals</small>
              </div>
              <button type="button" onClick={() => setTripsModalOpen(false)}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto' }}>
              {tripsLoading ? (
                <p style={{ textAlign: 'center', color: '#64748B', padding: 20 }}>Loading partner assignments...</p>
              ) : partnerTrips.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 30, color: '#94A3B8' }}>
                  <AlertCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p>No current or past deliveries recorded for this rider.</p>
                </div>
              ) : (
                partnerTrips.map((trip, idx) => (
                  <div key={trip.bookingNumber || idx} className={styles.tripItem}>
                    <div className={styles.tripHead}>
                      <strong>#{trip.bookingNumber}</strong>
                      <span className={`${styles.statusBadge} ${styles['status_' + trip.status]}`}>
                        {trip.status}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#2563EB', fontWeight: 600 }}>{trip.service}</span> • {trip.destination}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: 11, marginTop: 4 }}>
                      <span>Recipient: {trip.recipient}</span>
                      <strong>₹{trip.amount}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Driver Scorecard Modal */}
      {scorecardModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setScorecardModalOpen(false)}>
          <div className={styles.modal} style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead} style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={20} color="#0284C7" />
                <h3 style={{ margin: 0 }}>Driver Fleet & Safety Scorecard</h3>
              </div>
              <button type="button" onClick={() => setScorecardModalOpen(false)}><X size={18} /></button>
            </div>

            {scorecardLoading || !scorecardData ? (
              <p style={{ textAlign: 'center', padding: 30, color: '#64748B' }}>Fetching live driver telemetry...</p>
            ) : (
              <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Rider Header Summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: 16 }}>{scorecardData.fullName}</h4>
                    <span style={{ fontSize: 12, color: '#64748B' }}>{scorecardData.mobileNumber} • Zone: {scorecardData.zone}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${styles['status_' + scorecardData.status]}`} style={{ fontSize: 12, padding: '4px 10px' }}>
                    {scorecardData.status}
                  </span>
                </div>

                {/* Core KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, color: '#1E40AF', fontWeight: 700 }}>ON-TIME RATE</span>
                    <strong style={{ display: 'block', fontSize: 18, color: '#1E3A8A', marginTop: 2 }}>{scorecardData.metrics.onTimeDeliveryRate}%</strong>
                  </div>
                  <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, color: '#065F46', fontWeight: 700 }}>SAFETY INDEX</span>
                    <strong style={{ display: 'block', fontSize: 18, color: '#064E3B', marginTop: 2 }}>{scorecardData.metrics.safetyScore} / 100</strong>
                  </div>
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, color: '#92400E', fontWeight: 700 }}>RATING</span>
                    <strong style={{ display: 'block', fontSize: 18, color: '#78350F', marginTop: 2 }}>★ {scorecardData.metrics.rating}</strong>
                  </div>
                </div>

                {/* Verification & Compliance */}
                <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 12 }}>
                  <h5 style={{ margin: '0 0 8px', fontSize: 12, color: '#475569', textTransform: 'uppercase' }}>Fleet Safety Verification</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
                    <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={14} /> Driving License Verified</span>
                    <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={14} /> Police Background Clear</span>
                    <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={14} /> Commercial Insurance Active</span>
                    <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={14} /> Vehicle Registration Valid</span>
                  </div>
                </div>

                {/* Driver Achievements */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {scorecardData.achievements?.map((ach, i) => (
                    <div key={i} style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: '#6B21A8', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Zap size={12} color="#9333EA" />
                      <strong>{ach.title}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
