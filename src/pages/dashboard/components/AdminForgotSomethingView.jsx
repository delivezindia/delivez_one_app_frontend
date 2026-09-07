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
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <h3>Retrieval #{selected.bookingNumber}</h3>
              <button type="button" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className={styles.drawerBody}>
              <p><strong>Item:</strong> {selected.itemCategory} - {selected.itemDescription}</p>
              <p><strong>Pickup Address:</strong> {selected.pickupFlatBuilding}, {selected.pickupStreet}, {selected.pickupCity}</p>
              <p><strong>Dropoff Address:</strong> {selected.dropoffAddressLine1}, {selected.dropoffCity}</p>
              <p><strong>Fare:</strong> ₹{selected.totalAmount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
