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
} from 'lucide-react'
import {
  fetchAdminConfidentialBookings,
  updateAdminConfidentialStatus,
} from '@/features/admin-management/services/adminManagementService.js'
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
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleStatus = async (id, st) => {
    try {
      await updateAdminConfidentialStatus(id, st)
      setToast(`Vault delivery status updated to ${st}`)
      setTimeout(() => setToast(''), 3500)
      loadData()
    } catch (e) {
      alert(e.message || 'Failed to update status')
    }
  }

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

      <div className={styles.filterBar}>
        <div className={styles.search}>
          <Search size={15} />
          <input
            placeholder="Search Vault ID, client name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Vault ID</th>
              <th>Client / Sender</th>
              <th>Recipient</th>
              <th>Security Level</th>
              <th>Item / Cargo</th>
              <th>Total Fare</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.empty}>
                  No confidential Vault deliveries found.
                </td>
              </tr>
            ) : (
              bookings.map((b) => {
                const pickupAddr = b.addresses?.find((a) => a.kind === 'PICKUP') || b.addresses?.pickup
                const dropoffAddr = b.addresses?.find((a) => a.kind === 'DROPOFF') || b.addresses?.dropoff || b.addresses?.delivery

                return (
                  <tr key={b.id}>
                    <td>
                      <strong className={styles.link} onClick={() => setSelected(b)}>
                        {b.vaultId || b.bookingNumber}
                      </strong>
                    </td>
                    <td>
                      <strong>{pickupAddr?.contactName || b.user?.fullName || 'Authorized Sender'}</strong>
                      <small>{pickupAddr?.phoneNumber || b.user?.mobileNumber}</small>
                    </td>
                    <td>
                      <strong>{dropoffAddr?.contactName || 'Designated Recipient'}</strong>
                      <small>{dropoffAddr?.city || 'India'}</small>
                    </td>
                    <td>
                      <span className={styles.badgeGold}>
                        {b.securityLevel || 'Enhanced Security'}
                      </span>
                    </td>
                    <td>
                      <span>{b.documentDescription || b.documentType || 'Confidential Item'}</span>
                      <small>Declared: ₹{b.declaredValue || 0}</small>
                    </td>
                    <td>
                      <strong>₹{b.totalAmount}</strong>
                    </td>
                    <td>
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
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => setSelected(b)}
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <a
                          href={`/confidential-delivery/track/${b.vaultId || b.bookingNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.iconBtn}
                          title="Open Live Tracking"
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

      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <h3>Delivez Vault #{selected.vaultId || selected.bookingNumber}</h3>
              <button type="button" onClick={() => setSelected(null)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.drawerBody}>
              <div className="p-3 mb-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-800 font-bold flex items-center gap-1.5 mb-1">
                  <Shield size={14} /> Security Protocol: {selected.securityLevel || 'Enhanced Security'}
                </p>
                <p className="text-xs text-amber-700">AES-256 End-to-End Encrypted & Tamper-Evident Seal</p>
              </div>

              <p>
                <strong>Status:</strong>{' '}
                <span className={styles.badgeGold}>{selected.status}</span>
              </p>
              <p>
                <strong>Declared Value:</strong> ₹{selected.declaredValue || 0}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹{selected.totalAmount} ({selected.paymentMethod || 'PAY_ON_DELIVERY'})
              </p>

              <div className="mt-4 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Pickup Details
                </h4>
                {(() => {
                  const p = selected.addresses?.find?.((a) => a.kind === 'PICKUP') || selected.addresses?.pickup
                  return p ? (
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <p><strong>Contact:</strong> {p.contactName} ({p.phoneNumber})</p>
                      <p><strong>Address:</strong> {p.addressLine1}, {p.city}, {p.state} - {p.postalCode}</p>
                    </div>
                  ) : <p className="text-xs text-slate-400">No pickup address logged</p>
                })()}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Delivery Details
                </h4>
                {(() => {
                  const d = selected.addresses?.find?.((a) => a.kind === 'DROPOFF') || selected.addresses?.dropoff || selected.addresses?.delivery
                  return d ? (
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <p><strong>Recipient:</strong> {d.contactName} ({d.phoneNumber})</p>
                      <p><strong>Address:</strong> {d.addressLine1}, {d.city}, {d.state} - {d.postalCode}</p>
                    </div>
                  ) : <p className="text-xs text-slate-400">No delivery address logged</p>
                })()}
              </div>

              <div className="mt-6">
                <a
                  href={`/confidential-delivery/track/${selected.vaultId || selected.bookingNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-sm flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} /> Open Customer Live Tracking Screen
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
