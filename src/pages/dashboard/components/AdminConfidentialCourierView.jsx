import React, { useCallback, useEffect, useState } from 'react'
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Eye,
  X,
  CheckCircle2,
  Lock,
  FileText,
  MapPin,
  Calendar,
  ExternalLink,
  Shield,
  Package,
  Printer,
  Copy,
  Check,
  Phone,
  ArrowRight,
  User,
  CreditCard,
  Clock,
  AlertTriangle,
  KeyRound,
  CheckSquare,
  Layers,
  Navigation,
  DollarSign,
  Zap,
  GitFork,
  Briefcase,
  RotateCcw,
  Repeat,
  ShieldAlert,
  Share2,
  Filter,
} from 'lucide-react'
import {
  fetchAdminConfidentialBookings,
  fetchAdminConfidentialBookingById,
  updateAdminConfidentialStatus,
} from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminServiceViews.module.css'

export const VAULT_SERVICES = [
  {
    key: 'VAULT_SECURE',
    title: 'Vault Secure',
    desc: 'Standard secure delivery with full verification and chain of custody.',
    time: '1-2 Days',
    icon: Shield,
    tag: 'Recommended',
    tagBg: '#FEF3C7',
    tagColor: '#B45309',
  },
  {
    key: 'VAULT_PRIORITY',
    title: 'Vault Priority',
    desc: 'Faster delivery with priority handling and dedicated partners.',
    time: 'Same / Next Day',
    icon: Zap,
    tag: 'Fastest',
    tagBg: '#FEE2E2',
    tagColor: '#DC2626',
  },
  {
    key: 'VAULT_DIRECT',
    title: 'Vault Direct',
    desc: 'Point-to-point delivery with no stops in between. Maximum confidentiality.',
    time: '1-2 Days',
    icon: GitFork,
  },
  {
    key: 'VAULT_PRECISE',
    title: 'Vault Precise',
    desc: 'Deliver at a specific date and time window of your choice.',
    time: 'Scheduled',
    icon: Calendar,
  },
  {
    key: 'VAULT_HAND_CARRY',
    title: 'Vault Hand Carry',
    desc: 'Dedicated hand carry by authorized executive for highest priority items.',
    time: '1-2 Days',
    icon: Briefcase,
  },
  {
    key: 'VAULT_RETURN',
    title: 'Vault Return',
    desc: 'Deliver and collect signed or processed documents and return to sender.',
    time: '1-3 Days',
    icon: RotateCcw,
  },
  {
    key: 'VAULT_EXCHANGE',
    title: 'Vault Exchange',
    desc: 'Two-way document or item exchange in a single trip.',
    time: '1-3 Days',
    icon: Repeat,
  },
  {
    key: 'VAULT_CRITICAL',
    title: 'Vault Critical',
    desc: 'Highest level of security with armed escort and real-time monitoring.',
    time: 'Same Day',
    icon: ShieldAlert,
    tag: 'Armed Escort',
    tagBg: '#FEE2E2',
    tagColor: '#991B1B',
  },
  {
    key: 'VAULT_MULTIPOINT',
    title: 'Vault MultiPoint',
    desc: 'Multiple secure stops in a single journey with optimized routing.',
    time: '1-3 Days',
    icon: Share2,
  },
]

export function getVaultServiceMeta(b) {
  if (!b) return VAULT_SERVICES[0]
  const srvKey = b.vaultServiceKey || ''
  const srvType = b.serviceType || ''
  const desc = b.documentDescription || ''

  if (srvKey === 'VAULT_MULTIPOINT' || srvType.includes('MultiPoint') || desc.includes('MultiPoint') || desc.includes('Multi-Office')) {
    return VAULT_SERVICES.find((s) => s.key === 'VAULT_MULTIPOINT') || VAULT_SERVICES[8]
  }
  if (srvKey === 'VAULT_CRITICAL' || srvType.includes('Critical') || desc.includes('Critical') || desc.includes('Armed')) {
    return VAULT_SERVICES.find((s) => s.key === 'VAULT_CRITICAL') || VAULT_SERVICES[7]
  }
  if (srvKey === 'VAULT_EXCHANGE' || srvType.includes('Exchange') || desc.includes('Exchange')) {
    return VAULT_SERVICES.find((s) => s.key === 'VAULT_EXCHANGE') || VAULT_SERVICES[6]
  }
  if (srvKey === 'VAULT_RETURN' || srvType.includes('Return') || desc.includes('Return') || b.requiresReturn) {
    return VAULT_SERVICES.find((s) => s.key === 'VAULT_RETURN') || VAULT_SERVICES[5]
  }
  if (srvKey === 'VAULT_HAND_CARRY' || srvType.includes('Hand Carry') || desc.includes('Hand Carry') || desc.includes('Luggage')) {
    return VAULT_SERVICES.find((s) => s.key === 'VAULT_HAND_CARRY') || VAULT_SERVICES[4]
  }
  if (srvKey === 'VAULT_PRECISE' || srvType.includes('Precise') || desc.includes('Precise') || b.scheduleType === 'SCHEDULED' || b.deliverySpeed === 'EXACT_TIME') {
    return VAULT_SERVICES.find((s) => s.key === 'VAULT_PRECISE') || VAULT_SERVICES[3]
  }
  if (srvKey === 'VAULT_DIRECT' || srvType.includes('Direct') || desc.includes('Direct') || b.deliverySpeed === 'EXPRESS') {
    return VAULT_SERVICES.find((s) => s.key === 'VAULT_DIRECT') || VAULT_SERVICES[2]
  }
  if (srvKey === 'VAULT_PRIORITY' || srvType.includes('Priority') || desc.includes('Priority') || b.deliverySpeed === 'PRIORITY') {
    return VAULT_SERVICES.find((s) => s.key === 'VAULT_PRIORITY') || VAULT_SERVICES[1]
  }
  return VAULT_SERVICES[0]
}

function formatDateTime(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return String(isoString)
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

function formatEnumLabel(val) {
  if (!val) return '—'
  return String(val)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function AdminConfidentialCourierView({ onViewOrderDetail }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedService, setSelectedService] = useState('ALL')
  const [serviceCounts, setServiceCounts] = useState({})
  const [selected, setSelected] = useState(null)
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [copiedField, setCopiedField] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        search,
        status: statusFilter,
        ...(selectedService !== 'ALL' ? { serviceType: selectedService } : {}),
      }
      const data = await fetchAdminConfidentialBookings(params)
      setBookings(data?.bookings || [])
      if (data?.serviceCounts) {
        setServiceCounts(data.serviceCounts)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, selectedService])

  useEffect(() => {
    loadData()
  }, [loadData])

  // When opening a booking, fetch its complete populated details
  const handleSelectBooking = async (b) => {
    setSelected(b)
    setDrawerLoading(true)
    try {
      const full = await fetchAdminConfidentialBookingById(b.id || b.bookingNumber || b.vaultId)
      if (full) {
        setSelected((prev) => ({ ...(prev || {}), ...full }))
      }
    } catch (err) {
      console.warn('Could not fetch deep booking details:', err)
    } finally {
      setDrawerLoading(false)
    }
  }

  const handleCopy = (text, fieldName) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(''), 2000)
  }

  const handleStatus = async (id, st) => {
    try {
      const nowIso = new Date().toISOString()
      await updateAdminConfidentialStatus(id, st, { timestamp: nowIso })
      try {
        const stored = JSON.parse(localStorage.getItem(`dlvz_status_timings_${id}`) || '{}')
        const updatedTimestamps = { ...(stored.timestamps || stored || {}), [st]: nowIso }
        const updatedHistory = [
          { status: st, timestamp: nowIso, actor: 'Vault Dispatcher', note: `Vault consignment marked as ${st}` },
          ...(Array.isArray(stored.history) ? stored.history : []),
        ]
        localStorage.setItem(`dlvz_status_timings_${id}`, JSON.stringify({ ...updatedTimestamps, history: updatedHistory }))
      } catch (_) {}

      setToast(`Vault delivery status updated to ${st}`)
      setTimeout(() => setToast(''), 3500)

      if (selected && (selected.id === id || selected.bookingNumber === id)) {
        setSelected((prev) => ({ ...prev, status: st }))
      }
      loadData()
    } catch (e) {
      alert(e.message || 'Failed to update status')
    }
  }

  // Address extractors for selected booking
  const selectedPickup =
    selected?.pickup ||
    (Array.isArray(selected?.addresses)
      ? selected.addresses.find((a) => a.kind === 'PICKUP' || a.type === 'PICKUP')
      : null) ||
    selected?.addresses?.[0] ||
    {}

  const selectedDropoff =
    selected?.dropoff ||
    (Array.isArray(selected?.addresses)
      ? selected.addresses.find((a) => a.kind === 'DROPOFF' || a.type === 'DROPOFF')
      : null) ||
    selected?.addresses?.[1] ||
    {}

  const vaultNum = selected?.vaultId || selected?.bookingNumber || '—'

  return (
    <div className={styles.wrapper}>
      {toast && (
        <div className={styles.toast}>
          <CheckCircle2 size={16} color="#10B981" /> {toast}
        </div>
      )}

      <div className={styles.header}>
        <div>
          <h2>
            <ShieldCheck size={24} className={styles.iconGold} /> Delivez Vault — Confidential Delivery Control
          </h2>
          <p>
            Real-time chain-of-custody tracking for bank-grade encrypted consignments, legal documents & secure packages.
          </p>
        </div>
        <button type="button" className={styles.refreshBtn} onClick={loadData}>
          <RefreshCw size={14} className={loading ? styles.spin : ''} /> Refresh
        </button>
      </div>

      {/* ================================================================= */}
      {/* VAULT SERVICE TIERS (9 SPECIALIZED PROTOCOLS) INTERACTIVE GRID    */}
      {/* ================================================================= */}
      <div className={styles.vaultServicesSection}>
        <div className={styles.vaultServicesHeader}>
          <div>
            <h3>
              <Layers size={16} color="#D97706" /> Vault Service Protocols (9 Specialized Tiers)
            </h3>
            <p>
              Select any service tier to filter active consignments, review handling protocols, and verify turn-around SLAs.
            </p>
          </div>
          {selectedService !== 'ALL' && (
            <button
              type="button"
              className={styles.refreshBtn}
              onClick={() => setSelectedService('ALL')}
              style={{ fontSize: '11.5px', padding: '5px 12px', background: '#FEF3C7', borderColor: '#FCD34D', color: '#92400E' }}
            >
              Reset to All Services ({serviceCounts.ALL || bookings.length})
            </button>
          )}
        </div>

        <div className={styles.vaultServicesGrid}>
          {VAULT_SERVICES.map((svc) => {
            const Icon = svc.icon
            const isSelected = selectedService === svc.key
            const count = serviceCounts[svc.key] !== undefined ? serviceCounts[svc.key] : 0

            return (
              <div
                key={svc.key}
                className={`${styles.vaultServiceCard} ${isSelected ? styles.vaultServiceCardActive : ''}`}
                onClick={() => setSelectedService(isSelected ? 'ALL' : svc.key)}
                title={`Filter consignments by ${svc.title}`}
              >
                <div>
                  <div className={styles.vaultServiceCardHeader}>
                    <div className={styles.vaultServiceIconBox}>
                      <Icon size={24} strokeWidth={2} color="#FAB800" />
                    </div>
                    {svc.tag && (
                      <span
                        className={styles.vaultServiceTagBadge}
                        style={{ background: svc.tagBg || '#FEF3C7', color: svc.tagColor || '#B45309' }}
                      >
                        {svc.tag}
                      </span>
                    )}
                  </div>

                  <h4 className={styles.vaultServiceTitle}>{svc.title}</h4>
                  <p className={styles.vaultServiceDesc}>{svc.desc}</p>
                </div>

                <div className={styles.vaultServiceFooter}>
                  <div className={styles.vaultServiceTime}>
                    <Clock size={13} color="#FAB800" strokeWidth={2.2} />
                    <span>{svc.time}</span>
                  </div>
                  <span
                    className={`${styles.vaultServiceOrderCount} ${isSelected ? styles.vaultServiceOrderCountActive : ''}`}
                  >
                    {count} {count === 1 ? 'Order' : 'Orders'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.search}>
          <Search size={15} />
          <input
            placeholder="Search Vault ID, client name, phone or document type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} color="#64748B" />
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className={styles.select}
            title="Filter by Vault Service Type"
          >
            <option value="ALL">All Service Types ({serviceCounts.ALL || 9})</option>
            {VAULT_SERVICES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.title} ({s.time})
              </option>
            ))}
          </select>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.select}
        >
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PICKUP_ASSIGNED">PICKUP ASSIGNED</option>
          <option value="PICKED_UP">PICKED UP</option>
          <option value="IN_TRANSIT">IN TRANSIT</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        {(selectedService !== 'ALL' || statusFilter !== 'ALL' || search) && (
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => {
              setSelectedService('ALL')
              setStatusFilter('ALL')
              setSearch('')
            }}
            style={{ fontSize: '11px', padding: '6px 10px' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Vault ID</th>
              <th>Client / Sender</th>
              <th>Designated Recipient</th>
              <th>Vault Service Type</th>
              <th>Security Protocol</th>
              <th>Document & Cargo</th>
              <th>Declared Value</th>
              <th>Total Fare</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={10} className={styles.empty}>
                  {loading ? 'Retrieving secure vault consignments...' : 'No confidential Vault deliveries found.'}
                </td>
              </tr>
            ) : (
              bookings.map((b) => {
                const pickupAddr =
                  b.pickup ||
                  (Array.isArray(b.addresses)
                    ? b.addresses.find((a) => a.kind === 'PICKUP' || a.type === 'PICKUP')
                    : null) ||
                  b.addresses?.[0]
                const dropoffAddr =
                  b.dropoff ||
                  (Array.isArray(b.addresses)
                    ? b.addresses.find((a) => a.kind === 'DROPOFF' || a.type === 'DROPOFF')
                    : null) ||
                  b.addresses?.[1]

                return (
                  <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => handleSelectBooking(b)}>
                    <td>
                      <strong
                        className={styles.link}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onViewOrderDetail) {
                            onViewOrderDetail(b, 'confidential-courier')
                          } else {
                            handleSelectBooking(b)
                          }
                        }}
                        title="Open Dedicated Order Details Page"
                      >
                        {b.vaultId || b.bookingNumber}
                      </strong>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>
                        {formatDateTime(b.createdAt)}
                      </span>
                    </td>
                    <td>
                      <strong>{pickupAddr?.contactName || b.user?.fullName || 'Authorized Sender'}</strong>
                      <small>{pickupAddr?.phoneNumber || b.user?.mobileNumber || '—'}</small>
                      {pickupAddr?.city && <small style={{ color: '#475569' }}>📍 {pickupAddr.city}</small>}
                    </td>
                    <td>
                      <strong>{dropoffAddr?.contactName || 'Designated Recipient'}</strong>
                      <small>{dropoffAddr?.phoneNumber || '—'}</small>
                      {dropoffAddr?.city && <small style={{ color: '#475569' }}>📍 {dropoffAddr.city}</small>}
                    </td>
                    <td>
                      {(() => {
                        const sMeta = getVaultServiceMeta(b)
                        const SvcIcon = sMeta.icon
                        return (
                          <div>
                            <div className={styles.servicePill}>
                              <SvcIcon size={14} color="#FAB800" strokeWidth={2.2} />
                              <strong style={{ color: '#0F172A', fontSize: '12px' }}>
                                {b.serviceType || sMeta.title}
                              </strong>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: '11px', color: '#64748B' }}>
                              <Clock size={11} color="#FAB800" />
                              <span>{b.vaultServiceTime || sMeta.time}</span>
                            </div>
                          </div>
                        )
                      })()}
                    </td>
                    <td>
                      <span className={styles.vaultPillGold}>
                        <Shield size={12} /> {formatEnumLabel(b.securityLevel || 'Enhanced Security')}
                      </span>
                      <span style={{ display: 'block', fontSize: '10px', color: '#64748b', marginTop: 2 }}>
                        {formatEnumLabel(b.handoverMethod || 'OTP Verification')}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#0F172A', display: 'block' }}>
                        {formatEnumLabel(b.documentType || 'Confidential Item')}
                      </strong>
                      <small style={{ color: '#64748B' }}>
                        {formatEnumLabel(b.envelopeSize || 'A4 Envelope')} • {b.pageCount || 1} pgs
                      </small>
                    </td>
                    <td>
                      <strong style={{ color: '#059669' }}>₹{Number(b.declaredValue || 0).toLocaleString('en-IN')}</strong>
                      {b.containsOriginals && (
                        <span style={{ display: 'block', fontSize: '10px', color: '#DC2626', fontWeight: 700 }}>
                          ★ Originals
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: '#0F172A', fontSize: '14px' }}>₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}</strong>
                      <small style={{ color: b.paymentStatus === 'PAID' ? '#059669' : '#D97706', fontWeight: 600 }}>
                        {b.paymentStatus || 'PAID'}
                      </small>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        className={styles.statusSelect}
                        value={b.status}
                        onChange={(e) => handleStatus(b.id, e.target.value)}
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PICKUP_ASSIGNED">PICKUP ASSIGNED</option>
                        <option value="PICKED_UP">PICKED UP</option>
                        <option value="IN_TRANSIT">IN TRANSIT</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => handleSelectBooking(b)}
                          title="View Full Consignment Dossier"
                        >
                          <Eye size={15} />
                        </button>
                        <a
                          href={`/vault/track/${b.vaultId || b.bookingNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.iconBtn}
                          title="Open Customer Live Tracking"
                        >
                          <ExternalLink size={15} />
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================================================================= */}
      {/* COMPREHENSIVE DELIVEZ VAULT DOSSIER DRAWER (EVERY SINGLE FIELD)   */}
      {/* ================================================================= */}
      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.vaultDrawer} onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className={styles.drawerHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#FEF3C7', color: '#D97706', padding: 8, borderRadius: 10 }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Delivez Vault #{vaultNum}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(vaultNum, 'vaultId')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#64748B' }}
                      title="Copy Vault ID"
                    >
                      {copiedField === 'vaultId' ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                    </button>
                  </h3>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>
                    Created: {formatDateTime(selected.createdAt)} • Speed: <strong>{formatEnumLabel(selected.deliverySpeed || 'Priority')}</strong>
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            {drawerLoading && (
              <div style={{ padding: '8px 12px', background: '#EFF6FF', borderRadius: 8, fontSize: '12px', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={14} className={styles.spin} /> Loading verified consignment telemetry...
              </div>
            )}

            {/* Quick Actions & Live Status Bar */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  UPDATE OPERATIONAL STATUS
                </label>
                <select
                  className={styles.statusSelect}
                  style={{ width: '100%', height: '36px', fontWeight: 700 }}
                  value={selected.status}
                  onChange={(e) => handleStatus(selected.id, e.target.value)}
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PICKUP_ASSIGNED">PICKUP ASSIGNED</option>
                  <option value="PICKED_UP">PICKED UP</option>
                  <option value="IN_TRANSIT">IN TRANSIT</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {onViewOrderDetail && (
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null)
                    onViewOrderDetail(selected, 'confidential-courier')
                  }}
                  className={styles.refreshBtn}
                  style={{ flex: 1, minWidth: '180px', justifyContent: 'center', background: '#0F172A', color: '#FFFFFF', borderColor: '#0F172A' }}
                  title="Open in Full Page Order Manager"
                >
                  <Layers size={14} /> Full Order Manager →
                </button>
              )}

              <a
                href={`/vault/track/${vaultNum}`}
                target="_blank"
                rel="noreferrer"
                className={styles.refreshBtn}
                style={{ flex: 1, minWidth: '160px', justifyContent: 'center', textDecoration: 'none' }}
                title="Open Public Customer Tracking View"
              >
                <ExternalLink size={14} /> Customer Tracking
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                className={styles.refreshBtn}
                style={{ justifyContent: 'center' }}
                title="Print Airway Bill (AWB)"
              >
                <Printer size={14} /> Print AWB
              </button>
            </div>

            {/* Dedicated Vault Service Type Showcase Banner */}
            {(() => {
              const selMeta = getVaultServiceMeta(selected)
              const SelIcon = selMeta.icon
              return (
                <div className={styles.serviceShowcase}>
                  <div className={styles.vaultServiceIconBox} style={{ background: '#FFFFFF', borderColor: '#FCD34D', minWidth: '48px', height: '48px' }}>
                    <SelIcon size={26} strokeWidth={2} color="#FAB800" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '15.5px', color: '#92400E' }}>{selected.serviceType || selMeta.title}</strong>
                      <span className={styles.vaultPillGold} style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} color="#B45309" /> Turnaround SLA: {selected.vaultServiceTime || selMeta.time}
                      </span>
                      {selMeta.tag && (
                        <span className={styles.vaultServiceTagBadge} style={{ background: selMeta.tagBg || '#FEF3C7', color: selMeta.tagColor || '#B45309' }}>
                          {selMeta.tag}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#78350F', lineHeight: 1.45 }}>
                      {selMeta.desc}
                    </p>
                  </div>
                </div>
              )
            })()}

            {/* Security Highlights Banner */}
            <div className={styles.vaultHeaderCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#92400E', fontWeight: 800, fontSize: '13px' }}>
                  <Shield size={16} /> Security Protocol: {formatEnumLabel(selected.securityLevel || 'Tamper Evident Seal')}
                </div>
                <span className={styles.vaultPillGold} style={{ fontSize: '10px' }}>
                  AES-256 VAULT ENCRYPTED
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#78350F', lineHeight: 1.4 }}>
                Barcoded Tamper-Proof Security Seal • Armored Custody Chain • Real-Time Dual-Verification
              </p>
              <div className={styles.vaultBadgeRow}>
                <span className={styles.vaultPillGold}>
                  <KeyRound size={11} /> Handover: {formatEnumLabel(selected.handoverMethod || 'OTP And Signature')}
                </span>
                {selected.recipientIdRequired !== false && (
                  <span className={styles.vaultPillBlue}>
                    <CheckSquare size={11} /> Recipient Govt ID Check Mandatory
                  </span>
                )}
                {selected.pickupProofRequired !== false && (
                  <span className={styles.vaultPillGreen}>
                    <CheckSquare size={11} /> Pickup Proof & Photo Recorded
                  </span>
                )}
                <span className={styles.vaultPillGold}>
                  Declared: ₹{Number(selected.declaredValue || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* SECTION 1: CONSIGNMENT & CARGO SPECIFICATIONS */}
            <div className={styles.vaultSectionCard}>
              <h4 className={styles.vaultSectionTitle}>
                <Package size={14} color="#D97706" /> 1. Consignment & Document Specifications
              </h4>
              <div className={styles.vaultDataGrid}>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Document Classification</span>
                  <span className={styles.vaultDataValue}>{formatEnumLabel(selected.documentType || 'Confidential Item')}</span>
                </div>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Packaging / Envelope Container</span>
                  <span className={styles.vaultDataValue}>{formatEnumLabel(selected.envelopeSize || 'A4 Document Envelope')}</span>
                </div>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Volume / Page Count</span>
                  <span className={styles.vaultDataValue}>{selected.pageCount || 1} Document Pages / Sheets</span>
                </div>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Declared Consignment Valuation</span>
                  <span className={styles.vaultDataValue} style={{ color: '#059669' }}>
                    ₹{Number(selected.declaredValue || 0).toLocaleString('en-IN')} (Full Loss Cover)
                  </span>
                </div>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Original Legal Documents</span>
                  <span className={styles.vaultDataValue} style={{ color: selected.containsOriginals ? '#DC2626' : '#475569' }}>
                    {selected.containsOriginals ? 'YES — Contains Original Documents' : 'NO — Certified Copies'}
                  </span>
                </div>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Return Consignment Required</span>
                  <span className={styles.vaultDataValue} style={{ color: selected.requiresReturn ? '#D97706' : '#475569' }}>
                    {selected.requiresReturn ? 'YES — Requires Reverse Return Leg' : 'NO — One-Way Delivery'}
                  </span>
                </div>
                <div className={styles.vaultDataItem} style={{ gridColumn: 'span 2' }}>
                  <span className={styles.vaultDataLabel}>Consignment Cargo Description</span>
                  <span className={styles.vaultDataValue} style={{ fontWeight: 500, color: '#334155' }}>
                    {selected.documentDescription || 'Official Confidential Cargo for Secure Vault Transit'}
                  </span>
                </div>
                <div className={styles.vaultDataItem} style={{ gridColumn: 'span 2' }}>
                  <span className={styles.vaultDataLabel}>Digital Compliance & NDA Signed At</span>
                  <span className={styles.vaultDataValue} style={{ fontSize: '12px', color: '#64748B' }}>
                    {formatDateTime(selected.complianceAcceptedAt || selected.createdAt)} • E-Signed by Sender
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 2: COMPLETE ROUTE & ADDRESS TELEMETRY */}
            <div className={styles.vaultSectionCard}>
              <h4 className={styles.vaultSectionTitle}>
                <MapPin size={14} color="#2563EB" /> 2. Complete Route & Telemetry Addresses
              </h4>

              {/* Pickup Address */}
              <div className={styles.vaultAddressCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>
                    📍 Pickup Origin (Sender)
                  </span>
                  {selectedPickup?.label && (
                    <span className={styles.vaultPillBlue} style={{ fontSize: '10px' }}>
                      {selectedPickup.label}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                  {selectedPickup?.contactName || selected.user?.fullName || 'Authorized Sender'}
                </div>
                {selectedPickup?.phoneNumber && (
                  <a
                    href={`tel:${selectedPickup.countryCode || '+91'}${selectedPickup.phoneNumber}`}
                    style={{ fontSize: '12px', color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Phone size={12} /> {selectedPickup.countryCode || '+91'} {selectedPickup.phoneNumber}
                  </a>
                )}
                <div style={{ fontSize: '12px', color: '#475569', marginTop: 4, lineHeight: 1.4 }}>
                  {[
                    selectedPickup?.addressLine1,
                    selectedPickup?.addressLine2,
                    selectedPickup?.landmark ? `Landmark: ${selectedPickup.landmark}` : null,
                    selectedPickup?.city,
                    selectedPickup?.state,
                    selectedPickup?.postalCode ? `PIN: ${selectedPickup.postalCode}` : null,
                    selectedPickup?.country || 'India',
                  ]
                    .filter(Boolean)
                    .join(', ') || 'Origin address on file'}
                </div>
                {selectedPickup?.latitude && selectedPickup?.longitude && (
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: 4 }}>
                    GPS Coordinates: <code>{selectedPickup.latitude}, {selectedPickup.longitude}</code>
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              <div className={styles.vaultAddressCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                    🎯 Delivery Destination (Recipient)
                  </span>
                  {selectedDropoff?.label && (
                    <span className={styles.vaultPillGreen} style={{ fontSize: '10px' }}>
                      {selectedDropoff.label}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                  {selectedDropoff?.contactName || 'Designated Recipient'}
                </div>
                {selectedDropoff?.phoneNumber && (
                  <a
                    href={`tel:${selectedDropoff.countryCode || '+91'}${selectedDropoff.phoneNumber}`}
                    style={{ fontSize: '12px', color: '#059669', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Phone size={12} /> {selectedDropoff.countryCode || '+91'} {selectedDropoff.phoneNumber}
                  </a>
                )}
                <div style={{ fontSize: '12px', color: '#475569', marginTop: 4, lineHeight: 1.4 }}>
                  {[
                    selectedDropoff?.addressLine1,
                    selectedDropoff?.addressLine2,
                    selectedDropoff?.landmark ? `Landmark: ${selectedDropoff.landmark}` : null,
                    selectedDropoff?.city,
                    selectedDropoff?.state,
                    selectedDropoff?.postalCode ? `PIN: ${selectedDropoff.postalCode}` : null,
                    selectedDropoff?.country || 'India',
                  ]
                    .filter(Boolean)
                    .join(', ') || 'Destination address on file'}
                </div>
                {selectedDropoff?.latitude && selectedDropoff?.longitude && (
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: 4 }}>
                    GPS Coordinates: <code>{selectedDropoff.latitude}, {selectedDropoff.longitude}</code>
                  </div>
                )}
              </div>

              {/* Route Logistics Grid */}
              <div className={styles.vaultDataGrid} style={{ marginTop: 4 }}>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Transit Distance</span>
                  <span className={styles.vaultDataValue}>{selected.distanceKm ? `${selected.distanceKm} km` : 'Calculated In-Flight'}</span>
                </div>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Dispatch Mode & Speed</span>
                  <span className={styles.vaultDataValue}>
                    {formatEnumLabel(selected.deliverySpeed || 'Direct Bullet Transit')}
                  </span>
                </div>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Schedule Type</span>
                  <span className={styles.vaultDataValue}>
                    {selected.scheduleType === 'ASAP' ? '⚡ ASAP Dispatch (Immediate Collection)' : '📅 Scheduled Pickup'}
                  </span>
                </div>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Scheduled Collection Window</span>
                  <span className={styles.vaultDataValue}>
                    {selected.scheduledPickupAt ? formatDateTime(selected.scheduledPickupAt) : 'Immediate Collection Window'}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 3: COMPREHENSIVE FINANCIAL BREAKDOWN */}
            <div className={styles.vaultSectionCard}>
              <h4 className={styles.vaultSectionTitle}>
                <CreditCard size={14} color="#059669" /> 3. Financial Breakdown & Fare Ledger
              </h4>
              <table className={styles.vaultPriceTable}>
                <tbody>
                  <tr>
                    <td>Base Vault Inception Charge</td>
                    <td>₹{Number(selected.baseCharge || 49).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Distance Transit Tariff ({selected.distanceKm || 0} km)</td>
                    <td>₹{Number(selected.distanceCharge || 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Security Protocol & Tamper-Evident Seal Fee</td>
                    <td>₹{Number(selected.securityCharge || 60).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Handover Verification Fee ({formatEnumLabel(selected.handoverMethod || 'OTP/Sig')})</td>
                    <td>₹{Number(selected.handoverCharge || 90).toFixed(2)}</td>
                  </tr>
                  {Number(selected.originalsCharge || 0) > 0 && (
                    <tr>
                      <td>Original Legal Document Handling Surcharge</td>
                      <td>₹{Number(selected.originalsCharge).toFixed(2)}</td>
                    </tr>
                  )}
                  {Number(selected.returnCharge || 0) > 0 && (
                    <tr>
                      <td>Return Trip Reverse Custody Surcharge</td>
                      <td>₹{Number(selected.returnCharge).toFixed(2)}</td>
                    </tr>
                  )}
                  <tr>
                    <td>GST / Integrated Service Tax (18%)</td>
                    <td>₹{Number(selected.taxAmount || 35.82).toFixed(2)}</td>
                  </tr>
                  <tr className={styles.totalRow}>
                    <td>Total Consignment Fare</td>
                    <td>₹{Number(selected.totalAmount || 199).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', justifyContent: 'space-between', paddingTop: 6 }}>
                <span>Pricing Model: <strong>{selected.pricingVersion || 'v2-vault'}</strong></span>
                <span>Currency: <strong>{selected.currency || 'INR'}</strong></span>
              </div>
            </div>

            {/* SECTION 4: PAYMENT DETAILS */}
            <div className={styles.vaultSectionCard}>
              <h4 className={styles.vaultSectionTitle}>
                <DollarSign size={14} color="#7C3AED" /> 4. Payment Gateway & Transaction Status
              </h4>
              <div className={styles.vaultDataGrid}>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Payment Method</span>
                  <span className={styles.vaultDataValue}>{formatEnumLabel(selected.paymentMethod || 'Online')}</span>
                </div>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Payment Status</span>
                  <span
                    className={styles.vaultDataValue}
                    style={{
                      color: selected.paymentStatus === 'PAID' ? '#059669' : selected.paymentStatus === 'REFUNDED' ? '#475569' : '#D97706',
                    }}
                  >
                    ● {selected.paymentStatus || 'PAID'}
                  </span>
                </div>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Payment Gateway Provider</span>
                  <span className={styles.vaultDataValue}>{selected.paymentProvider || 'DELIVEZ_SANDBOX'}</span>
                </div>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Payment Reference / Gateway Txn ID</span>
                  <span className={styles.vaultDataValue} style={{ fontSize: '12px', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>{selected.paymentReference || 'N/A'}</span>
                    {selected.paymentReference && (
                      <button
                        type="button"
                        onClick={() => handleCopy(selected.paymentReference, 'txnId')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#64748B' }}
                        title="Copy Txn ID"
                      >
                        {copiedField === 'txnId' ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                      </button>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 5: CUSTOMER ACCOUNT & LIFECYCLE AUDIT */}
            <div className={styles.vaultSectionCard}>
              <h4 className={styles.vaultSectionTitle}>
                <User size={14} color="#475569" /> 5. Account Ownership & Audit Trail
              </h4>
              <div className={styles.vaultDataGrid}>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Account Holder Name</span>
                  <span className={styles.vaultDataValue}>{selected.user?.fullName || 'Customer'}</span>
                </div>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Registered Mobile</span>
                  <span className={styles.vaultDataValue}>
                    {selected.user?.countryCode || '+91'} {selected.user?.mobileNumber || '—'}
                  </span>
                </div>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Registered Email</span>
                  <span className={styles.vaultDataValue}>{selected.user?.email || '—'}</span>
                </div>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>User Account UID</span>
                  <span className={styles.vaultDataValue} style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B' }}>
                    {selected.userId || selected.user?.id || '—'}
                  </span>
                </div>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Booking Inception Time</span>
                  <span className={styles.vaultDataValue} style={{ fontSize: '12px' }}>{formatDateTime(selected.createdAt)}</span>
                </div>
                <div className={styles.vaultDataItem}>
                  <span className={styles.vaultDataLabel}>Booking Confirmation Time</span>
                  <span className={styles.vaultDataValue} style={{ fontSize: '12px' }}>{formatDateTime(selected.confirmedAt || selected.createdAt)}</span>
                </div>
                {selected.cancelledAt && (
                  <div className={styles.vaultDataItem} style={{ gridColumn: 'span 2', background: '#FEF2F2', padding: 8, borderRadius: 6 }}>
                    <span className={styles.vaultDataLabel} style={{ color: '#DC2626' }}>Cancellation Record</span>
                    <span className={styles.vaultDataValue} style={{ color: '#991B1B' }}>
                      Cancelled at {formatDateTime(selected.cancelledAt)} • Reason: {selected.cancellationReason || 'Unspecified'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Button */}
            <div style={{ marginTop: 8 }}>
              <a
                href={`/vault/track/${vaultNum}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-sm flex items-center justify-center gap-2"
                style={{ textDecoration: 'none' }}
              >
                <ExternalLink size={16} /> Open Customer Live Tracking Screen
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
