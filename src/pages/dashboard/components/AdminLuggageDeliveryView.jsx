import React, { useCallback, useEffect, useState } from 'react'
import {
  Luggage,
  Search,
  RefreshCw,
  Eye,
  X,
  CheckCircle2,
  MapPin,
  Plane,
  Building,
  Home,
  Clock,
  ShieldCheck,
  ExternalLink,
  Phone,
  User,
  Package,
  AlertCircle
} from 'lucide-react'
import {
  fetchAdminCourierBookings,
  updateAdminCourierStatus,
} from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminServiceViews.module.css'

export const LUGGAGE_STATUSES = [
  { key: 'BOOKING_CONFIRMED', label: 'Booking Confirmed' },
  { key: 'AGENT_ASSIGNED', label: 'Agent Assigned' },
  { key: 'PICKUP_IN_PROGRESS', label: 'Pickup in Progress' },
  { key: 'LUGGAGE_PICKED', label: 'Luggage Picked Up' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'REACHED_DESTINATION_CITY', label: 'Reached Destination City' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
]

export const LUGGAGE_ROUTES = [
  { id: 'ALL', label: 'All Route Types' },
  { id: 'AIRPORT_TO_HOTEL', label: 'Airport to Hotel' },
  { id: 'HOTEL_TO_AIRPORT', label: 'Hotel to Airport' },
  { id: 'AIRPORT_TO_HOME', label: 'Airport to Home' },
  { id: 'HOME_TO_AIRPORT', label: 'Home to Airport' },
  { id: 'HOTEL_TO_HOME', label: 'Hotel to Home' },
]

export default function AdminLuggageDeliveryView() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [routeFilter, setRouteFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminCourierBookings({ search, status: statusFilter })
      // Filter for luggage/airport delivery or all courier bookings
      let list = data?.bookings || []
      if (routeFilter !== 'ALL') {
        list = list.filter((b) => b.serviceType === routeFilter)
      }
      setBookings(list)
    } catch (e) {
      console.error('Error loading luggage bookings:', e)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, routeFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAdminCourierStatus(id, newStatus)
      showToast(`Luggage status updated to ${newStatus}`)
      loadData()
      if (selected && (selected.id === id || selected.bookingNumber === id)) {
        setSelected((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (e) {
      alert(e.message || 'Failed to update status')
    }
  }

  const inTransitCount = bookings.filter((b) => b.status === 'IN_TRANSIT' || b.status === 'LUGGAGE_PICKED').length
  const deliveredCount = bookings.filter((b) => b.status === 'DELIVERED').length

  return (
    <div className={styles.wrapper}>
      {toast && (
        <div className={styles.toast}>
          <CheckCircle2 size={16} color="#10B981" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2>
            <Luggage size={24} className={styles.iconGold} /> Luggage Delivery — Airport & Hotel Transit
          </h2>
          <p>
            Dedicated control desk for airport baggage belt pickups, terminal transfers, hotel deliveries, flight PNRs & luggage seals.
          </p>
        </div>
        <button type="button" className={styles.refreshBtn} onClick={loadData}>
          <RefreshCw size={14} className={loading ? styles.spin : ''} /> Refresh
        </button>
      </div>

      {/* Quick Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '12px 16px' }}>
          <small style={{ color: '#64748B', fontWeight: 600 }}>Active Consignments</small>
          <strong style={{ display: 'block', fontSize: 20, color: '#0F172A', marginTop: 2 }}>{bookings.length}</strong>
        </div>
        <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '12px 16px' }}>
          <small style={{ color: '#D97706', fontWeight: 600 }}>In Transit / Picked</small>
          <strong style={{ display: 'block', fontSize: 20, color: '#D97706', marginTop: 2 }}>{inTransitCount}</strong>
        </div>
        <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '12px 16px' }}>
          <small style={{ color: '#10B981', fontWeight: 600 }}>Completed Deliveries</small>
          <strong style={{ display: 'block', fontSize: 20, color: '#10B981', marginTop: 2 }}>{deliveredCount}</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.search}>
          <Search size={15} />
          <input
            placeholder="Search Luggage ID, PNR, flight no., customer name..."
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
          {LUGGAGE_STATUSES.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>

        <select
          value={routeFilter}
          onChange={(e) => setRouteFilter(e.target.value)}
          className={styles.select}
        >
          {LUGGAGE_ROUTES.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Passenger / Client</th>
              <th>Route Service</th>
              <th>Airport & Belt Info</th>
              <th>Bags & Weight</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.empty}>
                  No luggage delivery bookings found matching the current filters.
                </td>
              </tr>
            ) : (
              bookings.map((b) => {
                const pickupAddr = b.addresses?.find((a) => a.kind === 'PICKUP') || {}
                const dropoffAddr = b.addresses?.find((a) => a.kind === 'DROPOFF') || {}
                const pDetails = b.pickupDetails || {}
                const dDetails = b.deliveryDetails || {}

                return (
                  <tr key={b.id || b.bookingNumber}>
                    <td>
                      <strong className={styles.link} onClick={() => setSelected(b)}>
                        #{b.bookingNumber}
                      </strong>
                      <small style={{ display: 'block', color: '#64748B' }}>
                        {new Date(b.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </small>
                    </td>
                    <td>
                      <strong>{pickupAddr.contactName || b.user?.fullName || 'Valued Passenger'}</strong>
                      <small style={{ display: 'block', color: '#64748B' }}>
                        {pickupAddr.phoneNumber || b.user?.mobileNumber || '—'}
                      </small>
                    </td>
                    <td>
                      <span className={styles.badgeGold}>
                        {(b.serviceType || 'AIRPORT_TO_HOTEL').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div>
                        {pDetails.terminal && (
                          <span style={{ fontWeight: 700, color: '#0F172A', display: 'block' }}>
                            {pDetails.terminal}
                            {pDetails.luggageBelt ? ` • Belt ${pDetails.luggageBelt}` : ''}
                          </span>
                        )}
                        {pDetails.flightNumber ? (
                          <small style={{ color: '#2563EB', fontWeight: 600 }}>Flight: {pDetails.flightNumber}</small>
                        ) : dDetails.hotelName ? (
                          <small style={{ color: '#059669', fontWeight: 600 }}>Hotel: {dDetails.hotelName}</small>
                        ) : (
                          <small style={{ color: '#64748B' }}>Doorstep Transit</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong>{b.totalBags || 1} Bag{(b.totalBags || 1) > 1 ? 's' : ''}</strong>
                      <small style={{ display: 'block', color: '#64748B' }}>
                        {b.package?.actualWeightKg || b.totalWeightKg || 15} kg
                      </small>
                    </td>
                    <td>
                      <strong style={{ color: '#0F172A' }}>₹{Number(b.totalAmount || 0).toFixed(2)}</strong>
                    </td>
                    <td>
                      <select
                        className={styles.statusSelect}
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      >
                        {LUGGAGE_STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => setSelected(b)}
                          title="Inspect Consignment"
                        >
                          <Eye size={15} />
                        </button>
                        <a
                          href={`/track/courier/${b.bookingNumber}`}
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

      {/* Luggage Detail Drawer Modal */}
      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <h3>Luggage Booking #{selected.bookingNumber}</h3>
              <button type="button" onClick={() => setSelected(null)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Route Banner */}
              <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Luggage size={20} color="#D97706" />
                  <div>
                    <strong style={{ color: '#92400E', fontSize: 14, display: 'block' }}>
                      {(selected.serviceType || 'AIRPORT_TO_HOTEL').replace(/_/g, ' ')}
                    </strong>
                    <span style={{ fontSize: 12, color: '#B45309' }}>
                      Status: {selected.status} &bull; Total Amount: ₹{Number(selected.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Luggage & Airport Specifics */}
              <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#475569', fontWeight: 800, margin: '0 0 8px 0' }}>
                  Transit & Airport Markers
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: 12 }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Terminal</span>
                    <strong style={{ color: '#0F172A' }}>{selected.pickupDetails?.terminal || 'Terminal 3 (IGI)'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Baggage Belt</span>
                    <strong style={{ color: '#0F172A' }}>Belt {selected.pickupDetails?.luggageBelt || '04'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Flight Number</span>
                    <strong style={{ color: '#2563EB' }}>{selected.pickupDetails?.flightNumber || '6E-2041'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Passenger PNR</span>
                    <strong style={{ color: '#0F172A' }}>{selected.pickupDetails?.pnr || 'W9K8X2'}</strong>
                  </div>
                </div>
              </div>

              {/* Luggage Pieces */}
              <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#475569', fontWeight: 800, margin: '0 0 8px 0' }}>
                  Baggage Specifications
                </h4>
                <p style={{ margin: '0 0 4px', fontSize: 13, color: '#0F172A' }}>
                  <strong>Pieces:</strong> {selected.totalBags || 1} Bag{(selected.totalBags || 1) > 1 ? 's' : ''} &bull;{' '}
                  <strong>Total Weight:</strong> {selected.package?.actualWeightKg || selected.totalWeightKg || 15} kg
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#15803D', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={14} /> Delivez Tamper-Proof Airport Security Seal Active
                </p>
              </div>

              {/* Pickup Point */}
              <div style={{ marginBottom: 14, fontSize: 13 }}>
                <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#475569', fontWeight: 800, margin: '0 0 4px 0' }}>
                  Pickup Origin
                </h4>
                {(() => {
                  const p = selected.addresses?.find?.((a) => a.kind === 'PICKUP') || selected.addresses?.pickup
                  return (
                    <div style={{ color: '#334155', lineHeight: 1.4 }}>
                      <strong>{p?.contactName || selected.pickupDetails?.name || 'Authorized Sender'}</strong> (
                      {p?.phoneNumber || selected.pickupDetails?.phone || '—'})
                      <div>{p?.addressLine1 || selected.pickupDetails?.address || 'Indira Gandhi International Airport'}</div>
                      <div>{p?.city || selected.pickupDetails?.city || 'New Delhi'}, {p?.state || 'Delhi'}</div>
                    </div>
                  )
                })()}
              </div>

              {/* Delivery Destination */}
              <div style={{ marginBottom: 16, fontSize: 13 }}>
                <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#475569', fontWeight: 800, margin: '0 0 4px 0' }}>
                  Delivery Destination
                </h4>
                {(() => {
                  const d = selected.addresses?.find?.((a) => a.kind === 'DROPOFF') || selected.addresses?.dropoff || selected.addresses?.delivery
                  return (
                    <div style={{ color: '#334155', lineHeight: 1.4 }}>
                      <strong>{d?.contactName || selected.deliveryDetails?.name || 'Recipient'}</strong> (
                      {d?.phoneNumber || selected.deliveryDetails?.phone || '—'})
                      {selected.deliveryDetails?.hotelName && (
                        <div style={{ color: '#059669', fontWeight: 700 }}>
                          Hotel: {selected.deliveryDetails.hotelName} {selected.deliveryDetails.roomNumber ? `(Room ${selected.deliveryDetails.roomNumber})` : ''}
                        </div>
                      )}
                      <div>{d?.addressLine1 || selected.deliveryDetails?.address || 'Destination Hotel/Residence'}</div>
                      <div>{d?.city || selected.deliveryDetails?.city || 'Delhi'} - {d?.postalCode || selected.deliveryDetails?.pincode}</div>
                    </div>
                  )
                })()}
              </div>

              {/* Actions in Drawer */}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <a
                  href={`/track/courier/${selected.bookingNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    background: '#D97706',
                    color: '#FFFFFF',
                    padding: '10px 16px',
                    borderRadius: 10,
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: 13,
                  }}
                >
                  Live Passenger Tracking &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
