import React, { useCallback, useEffect, useState } from 'react'
import { ShieldCheck, Search, RefreshCw, Eye, X, CheckCircle2, Lock, FileText } from 'lucide-react'
import { fetchAdminConfidentialBookings, updateAdminConfidentialStatus } from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminServiceViews.module.css'

export default function AdminConfidentialCourierView() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminConfidentialBookings({ search, status: statusFilter })
      setBookings(data?.bookings || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [search, statusFilter])

  useEffect(() => { loadData() }, [loadData])

  const handleStatus = async (id, st) => {
    try {
      await updateAdminConfidentialStatus(id, st)
      setToast(`Confidential status updated to ${st}`)
      setTimeout(() => setToast(''), 3500)
      loadData()
    } catch (e) { alert(e.message || 'Failed to update') }
  }

  return (
    <div className={styles.wrapper}>
      {toast && <div className={styles.toast}><CheckCircle2 size={16} color="#10B981" /> {toast}</div>}
      <div className={styles.header}>
        <div>
          <h2><ShieldCheck size={24} className={styles.iconGold} /> Confidential & Airport Luggage Control</h2>
          <p>Chain-of-custody tracking for biometric encrypted consignments, legal documents & airport baggage.</p>
        </div>
        <button type="button" className={styles.refreshBtn} onClick={loadData}>
          <RefreshCw size={14} className={loading ? styles.spin : ''} /> Refresh
        </button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.search}>
          <Search size={15} />
          <input placeholder="Search tracking ID, client name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={styles.select}>
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="IN_TRANSIT">IN TRANSIT</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Client</th>
              <th>Security Level</th>
              <th>Document / Cargo</th>
              <th>Handover</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={7} className={styles.empty}>No confidential deliveries found.</td></tr>
            ) : (
              bookings.map(b => (
                <tr key={b.id}>
                  <td><strong className={styles.link} onClick={() => setSelected(b)}>{b.bookingNumber}</strong></td>
                  <td><strong>{b.user?.fullName || 'Client'}</strong><small>{b.user?.mobileNumber}</small></td>
                  <td><span className={styles.badgeGold}>{b.securityLevel}</span></td>
                  <td><span>{b.documentType} ({b.envelopeSize})</span><small>{b.pageCount} Pages • {b.containsOriginals ? 'Originals' : 'Copies'}</small></td>
                  <td><span>{b.handoverMethod}</span><small>ID Req: {b.recipientIdRequired ? 'Yes' : 'No'}</small></td>
                  <td>
                    <select className={styles.statusSelect} value={b.status} onChange={e => handleStatus(b.id, e.target.value)}>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PICKUP_ASSIGNED">ASSIGNED</option>
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
              <h3>Security Consignment #{selected.bookingNumber}</h3>
              <button type="button" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className={styles.drawerBody}>
              <p><strong>Security Tier:</strong> {selected.securityLevel}</p>
              <p><strong>Compliance Accepted:</strong> {new Date(selected.complianceAcceptedAt).toLocaleString()}</p>
              <p><strong>Declared Value:</strong> ₹{selected.declaredValue || 0}</p>
              <p><strong>Total Fare:</strong> ₹{selected.totalAmount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
