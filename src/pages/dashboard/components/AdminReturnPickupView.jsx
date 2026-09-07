import React, { useCallback, useEffect, useState } from 'react'
import { RotateCcw, Search, RefreshCw, Eye, X, CheckCircle2, Store, FileCheck } from 'lucide-react'
import { fetchAdminReturnBookings, updateAdminReturnStatus } from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminServiceViews.module.css'

export default function AdminReturnPickupView() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminReturnBookings({ search, status: statusFilter })
      setBookings(data?.bookings || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [search, statusFilter])

  useEffect(() => { loadData() }, [loadData])

  const handleStatus = async (id, st) => {
    try {
      await updateAdminReturnStatus(id, st)
      setToast(`Return status updated to ${st}`)
      setTimeout(() => setToast(''), 3500)
      loadData()
    } catch (e) { alert(e.message || 'Failed to update') }
  }

  return (
    <div className={styles.wrapper}>
      {toast && <div className={styles.toast}><CheckCircle2 size={16} color="#10B981" /> {toast}</div>}
      <div className={styles.header}>
        <div>
          <h2><RotateCcw size={24} className={styles.iconGreen} /> Return & Exchange Pickup Hub</h2>
          <p>Management console for e-commerce returns, warranty pickups & retailer destination drops.</p>
        </div>
        <button type="button" className={styles.refreshBtn} onClick={loadData}>
          <RefreshCw size={14} className={loading ? styles.spin : ''} /> Refresh
        </button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.search}>
          <Search size={15} />
          <input placeholder="Search return ID, vendor, store..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={styles.select}>
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PICKUP_SCHEDULED">SCHEDULED</option>
          <option value="IN_TRANSIT">IN TRANSIT</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Return ID</th>
              <th>Return Type</th>
              <th>Destination Vendor</th>
              <th>Customer Address</th>
              <th>Item Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={7} className={styles.empty}>No return pickup bookings found.</td></tr>
            ) : (
              bookings.map(b => (
                <tr key={b.id}>
                  <td><strong className={styles.link} onClick={() => setSelected(b)}>{b.bookingNumber}</strong></td>
                  <td><span className={styles.badgeGreen}>{b.returnType}</span></td>
                  <td><strong>{b.destinationName || b.pickupStoreName || 'Retailer Hub'}</strong><small>{b.destinationType}</small></td>
                  <td><strong>{b.pickupContactName}</strong><small>{b.pickupCity}</small></td>
                  <td><span>{b.itemCategory}</span><small>{b.itemCondition}</small></td>
                  <td>
                    <select className={styles.statusSelect} value={b.status} onChange={e => handleStatus(b.id, e.target.value)}>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PICKUP_SCHEDULED">SCHEDULED</option>
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
              <h3>Return #{selected.bookingNumber}</h3>
              <button type="button" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className={styles.drawerBody}>
              <p><strong>Vendor Destination:</strong> {selected.destinationName || selected.pickupStoreName}</p>
              <p><strong>Customer Pickup:</strong> {selected.pickupAddress}, {selected.pickupCity}</p>
              <p><strong>Estimated Refund:</strong> ₹{selected.estimatedRefundAmount || 0}</p>
              <p><strong>Fare:</strong> ₹{selected.totalAmount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
