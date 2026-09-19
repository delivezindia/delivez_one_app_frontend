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
  AlertCircle,
  Key,
  Copy,
  Check,
  Truck,
  CheckSquare,
  FileText,
  CreditCard,
  Layers,
} from 'lucide-react'
import {
  fetchAdminLuggageBookings,
  fetchAdminLuggageBookingById,
  updateAdminLuggageStatus,
} from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminServiceViews.module.css'

export const LUGGAGE_STATUSES = [
  { key: 'BOOKING_CONFIRMED', label: 'Booking Confirmed' },
  { key: 'AGENT_ASSIGNED', label: 'Agent Assigned' },
  { key: 'PICKUP_IN_PROGRESS', label: 'Pickup in Progress' },
  { key: 'LUGGAGE_PICKED', label: 'Luggage Picked Up' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
]

export const LUGGAGE_ROUTES = [
  { id: 'ALL', label: 'All Route Types' },
  { id: 'home_airport', label: 'Home to Airport' },
  { id: 'airport_home', label: 'Airport to Home' },
  { id: 'hotel_airport', label: 'Hotel to Airport' },
  { id: 'airport_hotel', label: 'Airport to Hotel' },
  { id: 'hotel_home', label: 'Hotel to Home' },
  { id: 'home_hotel', label: 'Home to Hotel' },
  { id: 'multi_stop', label: 'Multi-Stop Transit' },
]

export default function AdminLuggageDeliveryView({ onViewOrderDetail }) {
  const [bookings, setBookings] = useState([])
  const [statusCounts, setStatusCounts] = useState({})
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [routeFilter, setRouteFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [copiedKey, setCopiedKey] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const handleCopy = (text, key) => {
    if (!text) return
    navigator.clipboard.writeText(String(text))
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 2000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminLuggageBookings({
        search,
        status: statusFilter,
        routeType: routeFilter,
      })
      setBookings(data?.bookings || [])
      if (data?.statusCounts) {
        setStatusCounts(data.statusCounts)
      }
    } catch (e) {
      console.error('Error loading luggage bookings:', e)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, routeFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenDrawer = async (b) => {
    setSelected(b)
    setDrawerLoading(true)
    try {
      const full = await fetchAdminLuggageBookingById(b.id || b.bookingNumber)
      if (full) setSelected(full)
    } catch {
      // keep fallback
    } finally {
      setDrawerLoading(false)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      const nowIso = new Date().toISOString()
      const updated = await updateAdminLuggageStatus(id, newStatus, { timestamp: nowIso })
      showToast(`Luggage status updated to ${newStatus}`)
      loadData()
      if (selected && (selected.id === id || selected.bookingNumber === id)) {
        setSelected((prev) => ({ ...prev, ...(updated || {}), status: newStatus }))
      }
    } catch (e) {
      alert(e.message || 'Failed to update status')
    }
  }

  const inTransitCount = (statusCounts.IN_TRANSIT || 0) + (statusCounts.LUGGAGE_PICKED || 0) + (statusCounts.PICKUP_IN_PROGRESS || 0)
  const deliveredCount = statusCounts.DELIVERED || 0
  const activeCount = statusCounts.ALL || bookings.length

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
          <small style={{ color: '#64748B', fontWeight: 600 }}>Total Consignments</small>
          <strong style={{ display: 'block', fontSize: 20, color: '#0F172A', marginTop: 2 }}>{activeCount}</strong>
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
            placeholder="Search Luggage ID, PNR, flight no., passenger name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.select}
        >
          <option value="ALL">All Statuses ({statusCounts.ALL || bookings.length})</option>
          {LUGGAGE_STATUSES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label} {statusCounts[s.key] !== undefined ? `(${statusCounts[s.key]})` : ''}
            </option>
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
              <th>Airport & Flight Info</th>
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
                const flight = b.flightDetails || b.pickupDetails?.airport_specific || b.deliveryDetails?.airport_specific || {}
                const hotel = b.hotelDetails || b.pickupDetails?.hotel_specific || b.deliveryDetails?.hotel_specific || {}
                const passengerName = b.customerName || b.user?.fullName || b.pickupDetails?.contact?.full_name || 'Passenger'
                const passengerPhone = b.customerPhone || b.user?.mobileNumber || b.pickupDetails?.contact?.mobile || '—'
                const totalBags = b.totalBags || 1
                const totalWeight = b.totalWeightKg || 15

                return (
                  <tr key={b.id || b.bookingNumber}>
                    <td>
                      <strong
                        className={styles.link}
                        onClick={() => (onViewOrderDetail ? onViewOrderDetail(b, 'luggage-delivery') : handleOpenDrawer(b))}
                        title="Open Dedicated Order Page"
                      >
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
                      <strong>{passengerName}</strong>
                      <small style={{ display: 'block', color: '#64748B' }}>
                        {passengerPhone}
                      </small>
                    </td>
                    <td>
                      <span className={styles.badgeGold}>
                        {b.routeTitle || (b.serviceId || 'home_airport').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div>
                        {flight.terminal ? (
                          <span style={{ fontWeight: 700, color: '#0F172A', display: 'block' }}>
                            {flight.terminal}
                            {flight.belt_number ? ` • Belt ${flight.belt_number}` : ''}
                          </span>
                        ) : null}
                        {flight.flight_number ? (
                          <small style={{ color: '#2563EB', fontWeight: 600, display: 'block' }}>
                            {flight.airline_name ? `${flight.airline_name} ` : ''}Flight: {flight.flight_number}
                            {flight.pnr ? ` (PNR: ${flight.pnr})` : ''}
                          </small>
                        ) : hotel.hotelName || hotel.hotel_name ? (
                          <small style={{ color: '#059669', fontWeight: 600, display: 'block' }}>
                            Hotel: {hotel.hotelName || hotel.hotel_name} {hotel.roomNumber ? `(Rm ${hotel.roomNumber})` : ''}
                          </small>
                        ) : (
                          <small style={{ color: '#64748B' }}>Doorstep Transfer</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong>{totalBags} Bag{totalBags > 1 ? 's' : ''}</strong>
                      <small style={{ display: 'block', color: '#64748B' }}>
                        {totalWeight} kg
                      </small>
                    </td>
                    <td>
                      <strong style={{ color: '#0F172A' }}>₹{Number(b.totalAmount || 0).toFixed(2)}</strong>
                      <small style={{ display: 'block', color: b.paymentStatus === 'PAID' ? '#10B981' : '#D97706', fontWeight: 600 }}>
                        {b.paymentStatus || 'PENDING'} &bull; {b.paymentMethod || 'ONLINE'}
                      </small>
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
                          onClick={() => handleOpenDrawer(b)}
                          title="Open Luggage Details Drawer"
                        >
                          <Eye size={15} />
                        </button>
                        <a
                          href={`/track/${b.bookingNumber}`}
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
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className={styles.drawerHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Luggage size={20} color="#D97706" />
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Luggage Dossier #{selected.bookingNumber}</h3>
                  <small style={{ color: '#64748B' }}>
                    Created: {new Date(selected.createdAt || Date.now()).toLocaleString('en-IN')}
                  </small>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {onViewOrderDetail && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(null)
                      onViewOrderDetail(selected, 'luggage-delivery')
                    }}
                    className={styles.refreshBtn}
                    style={{ background: '#0F172A', color: '#FFFFFF', borderColor: '#0F172A', fontSize: 12, padding: '6px 12px', height: 32, gap: 6 }}
                    title="Open in Dedicated Single Order Page"
                  >
                    <Layers size={13} /> Full Order Page →
                  </button>
                )}
                <button type="button" onClick={() => setSelected(null)} className={styles.closeBtn}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className={styles.drawerBody}>
              {drawerLoading && (
                <div style={{ padding: '8px 12px', background: '#FEF3C7', color: '#92400E', borderRadius: 8, marginBottom: 14, fontSize: 12 }}>
                  Refreshing latest data from database...
                </div>
              )}

              {/* Status & Service Banner */}
              <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#92400E', fontSize: 15, display: 'block' }}>
                      {selected.routeTitle || (selected.serviceId || 'home_airport').replace(/_/g, ' ')}
                    </strong>
                    <span style={{ fontSize: 12, color: '#B45309' }}>
                      Total Amount: ₹{Number(selected.totalAmount || 0).toFixed(2)} &bull; {selected.paymentStatus || 'PENDING'} via {selected.paymentMethod || 'ONLINE'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      background: selected.status === 'DELIVERED' ? '#DCFCE7' : '#FEF3C7',
                      color: selected.status === 'DELIVERED' ? '#15803D' : '#B45309',
                    }}>
                      {selected.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* OTP Security Credentials */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small style={{ color: '#166534', fontWeight: 600 }}>Pickup OTP</small>
                    <button
                      type="button"
                      onClick={() => handleCopy(selected.pickupOtp, 'pickupOtp')}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#166534' }}
                    >
                      {copiedKey === 'pickupOtp' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <strong style={{ fontSize: 18, color: '#15803D', letterSpacing: 2 }}>
                    {selected.pickupOtp || '—'}
                  </strong>
                </div>

                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small style={{ color: '#1E40AF', fontWeight: 600 }}>Delivery OTP</small>
                    <button
                      type="button"
                      onClick={() => handleCopy(selected.deliveryOtp, 'deliveryOtp')}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#1E40AF' }}
                    >
                      {copiedKey === 'deliveryOtp' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <strong style={{ fontSize: 18, color: '#1D4ED8', letterSpacing: 2 }}>
                    {selected.deliveryOtp || '—'}
                  </strong>
                </div>
              </div>

              {/* Passenger Details */}
              <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#475569', fontWeight: 800, margin: '0 0 8px 0' }}>
                  Passenger / Customer
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: 13 }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: 11 }}>Full Name</span>
                    <strong>{selected.customerName || selected.user?.fullName || selected.pickupDetails?.contact?.full_name || 'Passenger'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: 11 }}>Mobile Number</span>
                    <strong>{selected.customerPhone || selected.user?.mobileNumber || selected.pickupDetails?.contact?.mobile || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: 11 }}>Email</span>
                    <strong>{selected.customerEmail || selected.user?.email || selected.pickupDetails?.contact?.email || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: 11 }}>Delivery Speed</span>
                    <strong>{(selected.schedule?.delivery_speed?.label) || (selected.schedule?.delivery_speed?.type) || 'Standard'}</strong>
                  </div>
                </div>
              </div>

              {/* Flight & Airport Markers */}
              {(selected.flightDetails || selected.flightNumber || selected.pickupDetails?.airport_specific || selected.deliveryDetails?.airport_specific) && (
                <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                  <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#475569', fontWeight: 800, margin: '0 0 8px 0' }}>
                    Flight & Terminal Markers
                  </h4>
                  {(() => {
                    const fl = selected.flightDetails || selected.pickupDetails?.airport_specific || selected.deliveryDetails?.airport_specific || {}
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: 12 }}>
                        <div>
                          <span style={{ color: '#64748B', display: 'block' }}>Airline</span>
                          <strong style={{ color: '#0F172A' }}>{fl.airline_name || fl.airline || selected.airline || '—'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748B', display: 'block' }}>Flight Number</span>
                          <strong style={{ color: '#2563EB' }}>{fl.flight_number || fl.flightNumber || selected.flightNumber || '—'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748B', display: 'block' }}>PNR</span>
                          <strong style={{ color: '#0F172A' }}>{fl.pnr || selected.pnr || '—'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748B', display: 'block' }}>Terminal / Belt</span>
                          <strong style={{ color: '#0F172A' }}>
                            {fl.terminal || selected.terminal || 'Terminal'} {fl.belt_number || selected.luggageBelt ? `• Belt ${fl.belt_number || selected.luggageBelt}` : ''}
                          </strong>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Hotel Markers */}
              {(selected.hotelDetails || selected.hotelName || selected.pickupDetails?.hotel_specific || selected.deliveryDetails?.hotel_specific) && (
                <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                  <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#475569', fontWeight: 800, margin: '0 0 8px 0' }}>
                    Hotel Transfer Details
                  </h4>
                  {(() => {
                    const ht = selected.hotelDetails || selected.pickupDetails?.hotel_specific || selected.deliveryDetails?.hotel_specific || {}
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: 12 }}>
                        <div>
                          <span style={{ color: '#64748B', display: 'block' }}>Hotel Name</span>
                          <strong style={{ color: '#059669' }}>{ht.hotel_name || ht.hotelName || selected.hotelName || '—'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748B', display: 'block' }}>Room Number</span>
                          <strong style={{ color: '#0F172A' }}>{ht.room_number || ht.roomNumber || selected.roomNumber || 'Front Desk Handover'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748B', display: 'block' }}>Guest Name</span>
                          <strong style={{ color: '#0F172A' }}>{ht.guest_name || ht.guestName || selected.customerName || '—'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748B', display: 'block' }}>Booking Reference</span>
                          <strong style={{ color: '#0F172A' }}>{ht.booking_reference || ht.bookingReference || '—'}</strong>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Luggage Items List */}
              <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#475569', fontWeight: 800, margin: '0 0 8px 0' }}>
                  Baggage Inventory ({Array.isArray(selected.luggageItems) ? selected.luggageItems.length : 1} items)
                </h4>
                {Array.isArray(selected.luggageItems) && selected.luggageItems.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selected.luggageItems.map((item, idx) => (
                      <div
                        key={item.item_id || idx}
                        style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: '#0F172A' }}>
                            {idx + 1}. {(item.bag_type || 'bag').toUpperCase()} BAG
                            {item.quantity > 1 ? ` (Qty: ${item.quantity})` : ''}
                          </strong>
                          <span style={{ fontWeight: 700, color: '#D97706' }}>
                            {item.declared_weight_kg || item.weight || 15} kg
                          </span>
                        </div>
                        {item.description && (
                          <div style={{ color: '#475569', marginTop: 4 }}>
                            {item.description}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                          {item.is_fragile && (
                            <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                              FRAGILE
                            </span>
                          )}
                          {item.is_valuable && (
                            <span style={{ background: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                              HIGH VALUE
                            </span>
                          )}
                          <span style={{ background: '#DCFCE7', color: '#15803D', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                            SEALED & VERIFIED
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>
                    1 Standard Bag &bull; Total weight: {selected.totalWeightKg || 15} kg
                  </p>
                )}
              </div>

              {/* Pickup & Delivery Addresses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, fontSize: 12 }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 12 }}>
                  <small style={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                    Pickup Location
                  </small>
                  <strong style={{ display: 'block', color: '#0F172A' }}>
                    {selected.pickupDetails?.contact?.full_name || selected.customerName || 'Sender'}
                  </strong>
                  <div style={{ color: '#475569', marginTop: 2 }}>
                    {selected.pickupDetails?.full_address || selected.pickupDetails?.address || selected.pickupAddress || 'Airport Departure'}
                  </div>
                  <div style={{ color: '#64748B', marginTop: 2 }}>
                    {selected.pickupDetails?.city}, {selected.pickupDetails?.state} {selected.pickupDetails?.pincode}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 12 }}>
                  <small style={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                    Delivery Destination
                  </small>
                  <strong style={{ display: 'block', color: '#0F172A' }}>
                    {selected.deliveryDetails?.contact?.full_name || 'Recipient'}
                  </strong>
                  <div style={{ color: '#475569', marginTop: 2 }}>
                    {selected.deliveryDetails?.full_address || selected.deliveryDetails?.address || selected.deliveryAddress || 'Destination Hotel/Residence'}
                  </div>
                  <div style={{ color: '#64748B', marginTop: 2 }}>
                    {selected.deliveryDetails?.city}, {selected.deliveryDetails?.state} {selected.deliveryDetails?.pincode}
                  </div>
                </div>
              </div>

              {/* Driver Details if Assigned */}
              {selected.driverDetails && (
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: 12, marginBottom: 16 }}>
                  <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#166534', fontWeight: 800, margin: '0 0 6px 0' }}>
                    Assigned Delivery Agent
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <div>
                      <strong>{selected.driverDetails.name}</strong>
                      <span style={{ display: 'block', color: '#15803D', fontSize: 12 }}>
                        Vehicle: {selected.driverDetails.vehicle_number || selected.driverDetails.vehicle_type || 'Luggage Transit Van'}
                      </span>
                    </div>
                    {selected.driverDetails.phone && (
                      <a
                        href={`tel:${selected.driverDetails.phone}`}
                        style={{ color: '#15803D', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Phone size={14} /> {selected.driverDetails.phone}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Status Update Dropdown */}
              <div style={{ background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Update Luggage Consignment Status:
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <select
                    className={styles.select}
                    value={selected.status}
                    onChange={(e) => handleStatusChange(selected.id, e.target.value)}
                    style={{ flex: 1 }}
                  >
                    {LUGGAGE_STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                  <a
                    href={`/track/${selected.bookingNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#D97706',
                      color: '#FFFFFF',
                      padding: '8px 14px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    Live Track <ExternalLink size={13} />
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
