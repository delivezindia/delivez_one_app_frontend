import React, { useCallback, useEffect, useState } from 'react'
import { ShoppingBag, Search, RefreshCw, Eye, X, CheckCircle2, MapPin, Zap } from 'lucide-react'
import { fetchAdminForgotBookings, updateAdminForgotStatus } from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminServiceViews.module.css'

export default function AdminForgotSomethingView() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminForgotBookings({ search, status: statusFilter })
      setBookings(data?.bookings || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [search, statusFilter])

  useEffect(() => { loadData() }, [loadData])

  const handleStatus = async (id, st) => {
    try {
      await updateAdminForgotStatus(id, st)
      setToast(`Retrieval status updated to ${st}`)
      setTimeout(() => setToast(''), 3500)
      loadData()
    } catch (e) { alert(e.message || 'Failed to update') }
  }

  return (
    <div className={styles.wrapper}>
      {toast && <div className={styles.toast}><CheckCircle2 size={16} color="#10B981" /> {toast}</div>}
      <div className={styles.header}>
        <div>
          <h2><ShoppingBag size={24} className={styles.iconPurple} /> Forgot Something Retrieval Dispatch</h2>
          <p>Instant item rescue & express courier from homes, offices, hotels, restaurants & venues.</p>
        </div>
        <button type="button" className={styles.refreshBtn} onClick={loadData}>
          <RefreshCw size={14} className={loading ? styles.spin : ''} /> Refresh
        </button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.search}>
          <Search size={15} />
          <input placeholder="Search item, contact, order ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={styles.select}>
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PICKED_UP">PICKED UP</option>
          <option value="IN_TRANSIT">IN TRANSIT</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Item Category</th>
              <th>Pickup Location</th>
              <th>Dropoff Contact</th>
              <th>Speed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={7} className={styles.empty}>No item retrieval orders found.</td></tr>
            ) : (
              bookings.map(b => (
                <tr key={b.id}>
                  <td><strong className={styles.link} onClick={() => setSelected(b)}>{b.bookingNumber}</strong></td>
                  <td><span className={styles.badgePurple}>{b.itemCategory}</span><small>{b.itemDescription}</small></td>
                  <td><strong>{b.pickupContactName}</strong><small>{b.pickupCity} ({b.locationType})</small></td>
                  <td><strong>{b.dropoffRecipientName}</strong><small>{b.dropoffCity}</small></td>
                  <td><span className={styles.badgeBlue}>{b.speed}</span></td>
                  <td>
                    <select className={styles.statusSelect} value={b.status} onChange={e => handleStatus(b.id, e.target.value)}>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PARTNER_ASSIGNED">ASSIGNED</option>
                      <option value="PICKED_UP">PICKED UP</option>
                      <option value="IN_TRANSIT">IN TRANSIT</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td><button type="button" className={styles.iconBtn} onClick={() => setSelected(b)}><Eye size={15} /></button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className={styles.drawerHead}>
              <div>
                <h3>Retrieval #{selected.bookingNumber}</h3>
                <span className={styles.badgePurple}>{selected.itemCategory}</span>
              </div>
              <button type="button" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className={styles.drawerBody} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <strong style={{ fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '4px' }}>ITEM SPECIFICATION</strong>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{selected.itemName || selected.itemDescription || selected.itemCategory}</div>
                {selected.itemDescription && <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>{selected.itemDescription}</div>}
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span>Qty: <strong>{selected.itemQuantity || 1}</strong></span>
                  <span>Declared Value: <strong>₹{selected.declaredValue || 0}</strong></span>
                  {selected.itemBrandColor && <span>Brand/Color: <strong>{selected.itemBrandColor}</strong></span>}
                  <span>Speed: <strong>{selected.speed}</strong></span>
                </div>
                {selected.itemTags && selected.itemTags.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {selected.itemTags.map((tag) => (
                      <span key={tag} style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* OTPs Display for Admin Support */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#FEF2F2', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FECACA' }}>
                  <small style={{ color: '#991B1B', fontWeight: 800, fontSize: '11px' }}>PICKUP OTP</small>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#DC2626', letterSpacing: '2px' }}>
                    {selected.pickupOtp || '—'}
                  </div>
                </div>
                <div style={{ background: '#ECFDF5', padding: '10px 14px', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                  <small style={{ color: '#065F46', fontWeight: 800, fontSize: '11px' }}>DELIVERY OTP</small>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#059669', letterSpacing: '2px' }}>
                    {selected.deliveryOtp || '—'}
                  </div>
                </div>
              </div>

              {/* Pickup & Dropoff Blocks */}
              <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 800, color: '#DC2626', fontSize: '12px', marginBottom: '4px' }}>📍 PICKUP POINT ({selected.locationType})</div>
                <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 700 }}>{selected.pickupContactName} • {selected.pickupPhoneNumber}</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {selected.pickupFlatBuilding}, {selected.pickupStreet}, {selected.pickupCity} - {selected.pickupPostalCode}
                </div>
                {selected.handoverCustomName && (
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>
                    Handover contact: {selected.handoverCustomName} ({selected.handoverCustomPhone})
                  </div>
                )}
              </div>

              <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 800, color: '#16A34A', fontSize: '12px', marginBottom: '4px' }}>🎯 DROPOFF POINT ({selected.dropoffAddressType || 'Home'})</div>
                <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 700 }}>{selected.dropoffRecipientName} • {selected.dropoffPhoneNumber}</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {selected.dropoffAddressLine1}, {selected.dropoffCity} - {selected.dropoffPostalCode}
                </div>
              </div>

              {/* Assigned Partner */}
              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 800, color: '#2563EB', fontSize: '12px', marginBottom: '4px' }}>⚡ ASSIGNED RIDER</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {selected.partnerName || 'Express Retrieval Rider'} ({selected.partnerPhone || '+91 98765 43210'})
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>{selected.partnerVehicle || 'TVS Apache - KA 01 AB 1234'} • Rating: {selected.partnerRating || 4.9} ★</div>
              </div>

              {/* Payment & Action */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                <div>
                  <small style={{ color: '#64748B', display: 'block' }}>Total Amount</small>
                  <strong style={{ fontSize: '18px', color: '#0F172A' }}>₹{Number(selected.totalAmount || 0).toFixed(2)}</strong>
                  <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '6px' }}>({selected.paymentMethod})</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`/track/forgot-something/${selected.bookingNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: '#7C3AED',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Open Live Track ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
