import React, { useCallback, useEffect, useState } from 'react'
import {
  Truck,
  Search,
  RefreshCw,
  Eye,
  Edit2,
  X,
  CheckCircle2,
  MapPin,
  Package,
  Clock,
  FileCheck,
  Phone,
  User,
  ShieldCheck,
  Box,
  Check,
  AlertCircle,
  Lock,
  Plane,
  Building,
  Home
} from 'lucide-react'
import {
  fetchAdminCourierBookings,
  fetchAdminCourierBooking,
  updateAdminCourierBooking,
  updateAdminCourierStatus,
  recordAdminCourierPOD,
} from '@/features/admin-management/services/adminManagementService.js'
import CourierPodModal from '@/pages/personal-courier/components/CourierPodModal.jsx'
import styles from './AdminServiceViews.module.css'

export const COURIER_ALL_STATUSES = [
  { key: 'BOOKING_CONFIRMED', label: 'Booking Confirmed' },
  { key: 'AGENT_ASSIGNED', label: 'Agent Assigned' },
  { key: 'PICKUP_IN_PROGRESS', label: 'Pickup in Progress' },
  { key: 'LUGGAGE_PICKED', label: 'Luggage Picked Up' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'REACHED_DESTINATION_CITY', label: 'Reached Destination Hub' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Luggage Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
]

export const COURIER_ROUTE_OPTIONS = [
  { id: 'HOME_TO_AIRPORT', label: 'Home to Airport' },
  { id: 'AIRPORT_TO_HOME', label: 'Airport to Home' },
  { id: 'HOTEL_TO_AIRPORT', label: 'Hotel to Airport' },
  { id: 'AIRPORT_TO_HOTEL', label: 'Airport to Hotel' },
  { id: 'HOTEL_TO_HOME', label: 'Hotel to Home' },
  { id: 'HOME_TO_HOTEL', label: 'Home to Hotel' },
  { id: 'MULTI_STOP', label: 'Multi-Stop Route' },
]

export default function AdminPersonalCourierView() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')

  // Edit Modal State
  const [editingBooking, setEditingBooking] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)

  // POD Modal State
  const [podBooking, setPodBooking] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminCourierBookings({ search, status: statusFilter })
      setBookings(data?.bookings || [])
    } catch (e) {
      console.error('Error loading courier bookings:', e)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAdminCourierStatus(id, newStatus)
      showToast(`Status updated to ${newStatus}`)
      loadData()
      if (selected && (selected.id === id || selected.bookingNumber === id)) {
        setSelected((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (e) {
      alert(e.message || 'Failed to update status')
    }
  }

  // Open Edit Modal with populated fields
  const handleStartEdit = (b) => {
    const pickupAddr = b.addresses?.find((a) => a.kind === 'PICKUP') || {}
    const dropoffAddr = b.addresses?.find((a) => a.kind === 'DROPOFF') || {}
    const pkg = b.package || {}
    const agent = b.agent || {}
    const pDetails = b.pickupDetails || {}
    const dDetails = b.deliveryDetails || {}

    setEditingBooking(b)
    setEditForm({
      // Route Service & Status
      serviceType: b.serviceType || 'AIRPORT_TO_HOTEL',
      status: b.status || 'IN_TRANSIT',
      totalAmount: b.totalAmount ?? 2395.8,
      sealNumber: b.sealNumber || 'DLV-SEAL-88492',

      // Pickup Details
      pickupContactName: pDetails.name || pickupAddr.contactName || '',
      pickupPhone: pDetails.phone || pickupAddr.phoneNumber || '',
      pickupAddress: pDetails.address || pickupAddr.addressLine1 || '',
      pickupCity: pDetails.city || pickupAddr.city || 'New Delhi',
      pickupState: pDetails.state || pickupAddr.state || 'Delhi',
      pickupPostalCode: pDetails.pincode || pickupAddr.postalCode || '110037',
      terminal: pDetails.terminal || 'Terminal 3',
      flightNumber: pDetails.flightNumber || 'AI 102',
      pnr: pDetails.pnr || 'AB12CD',
      luggageBelt: pDetails.luggageBelt || '04',

      // Delivery Details
      dropoffContactName: dDetails.name || dropoffAddr.contactName || '',
      dropoffPhone: dDetails.phone || dropoffAddr.phoneNumber || '',
      dropoffAddress: dDetails.address || dropoffAddr.addressLine1 || '',
      dropoffCity: dDetails.city || dropoffAddr.city || 'Gurugram',
      dropoffState: dDetails.state || dropoffAddr.state || 'Haryana',
      dropoffPostalCode: dDetails.pincode || dropoffAddr.postalCode || '122004',
      hotelName: dDetails.hotelName || 'Taj City Centre',
      roomNumber: dDetails.roomNumber || '402',

      // Package & Luggage
      totalBags: b.totalBags || (Array.isArray(b.luggage) ? b.luggage.length : 2),
      actualWeightKg: b.totalWeightKg || pkg.actualWeightKg || 28,

      // Agent Details
      agentName: agent.name || 'Ravi Kumar',
      agentId: agent.id || 'DLZAGT45521',
      agentPhone: agent.phone || '+91 98765 43210',
      agentVehicle: agent.vehicle || 'DL 1Z 4589',
    })
  }

  // Save Edit Changes to Backend
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    setSavingEdit(true)
    try {
      const payload = {
        serviceType: editForm.serviceType,
        status: editForm.status,
        totalAmount: Number(editForm.totalAmount),
        sealNumber: editForm.sealNumber,
        pickup: {
          contactName: editForm.pickupContactName,
          phoneNumber: editForm.pickupPhone,
          addressLine1: editForm.pickupAddress,
          city: editForm.pickupCity,
          state: editForm.pickupState,
          postalCode: editForm.pickupPostalCode,
        },
        dropoff: {
          contactName: editForm.dropoffContactName,
          phoneNumber: editForm.dropoffPhone,
          addressLine1: editForm.dropoffAddress,
          city: editForm.dropoffCity,
          state: editForm.dropoffState,
          postalCode: editForm.dropoffPostalCode,
        },
        pickupDetails: {
          name: editForm.pickupContactName,
          phone: editForm.pickupPhone,
          address: editForm.pickupAddress,
          city: editForm.pickupCity,
          state: editForm.pickupState,
          pincode: editForm.pickupPostalCode,
          terminal: editForm.terminal,
          flightNumber: editForm.flightNumber,
          pnr: editForm.pnr,
          luggageBelt: editForm.luggageBelt,
        },
        deliveryDetails: {
          name: editForm.dropoffContactName,
          phone: editForm.dropoffPhone,
          address: editForm.dropoffAddress,
          city: editForm.dropoffCity,
          state: editForm.dropoffState,
          pincode: editForm.dropoffPostalCode,
          hotelName: editForm.hotelName,
          roomNumber: editForm.roomNumber,
        },
        package: {
          actualWeightKg: Number(editForm.actualWeightKg),
          chargeableWeightKg: Number(editForm.actualWeightKg),
        },
        totalBags: Number(editForm.totalBags),
        totalWeightKg: Number(editForm.actualWeightKg),
        agent: {
          name: editForm.agentName,
          id: editForm.agentId,
          phone: editForm.agentPhone,
          vehicle: editForm.agentVehicle,
        },
      }

      const updated = await updateAdminCourierBooking(editingBooking.id, payload)
      showToast(`Consignment #${editingBooking.bookingNumber} updated successfully in PostgreSQL database.`)
      setEditingBooking(null)
      loadData()
      if (selected && (selected.id === editingBooking.id || selected.bookingNumber === editingBooking.bookingNumber)) {
        setSelected(updated || { ...selected, ...payload })
      }
    } catch (err) {
      alert(err.message || 'Failed to update consignment')
    } finally {
      setSavingEdit(false)
    }
  }

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
          <h2><Truck size={24} className={styles.iconBlue} /> Personal Courier Management</h2>
          <p>Real-time consignment control, 8-status tracking sync, tamper-evident seals, and proof of delivery verification.</p>
        </div>
        <button type="button" className={styles.refreshBtn} onClick={loadData}>
          <RefreshCw size={14} className={loading ? styles.spin : ''} /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.search}>
          <Search size={15} />
          <input
            placeholder="Search consignment ID, customer name, hotel, flight..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.select}
        >
          <option value="ALL">All Statuses (8 Stages)</option>
          {COURIER_ALL_STATUSES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Customer / Guest</th>
              <th>Route Service</th>
              <th>Consignment & Seal</th>
              <th>Fare</th>
              <th>Live Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  {loading ? 'Loading personal courier shipments…' : 'No courier bookings found.'}
                </td>
              </tr>
            ) : (
              bookings.map((b) => {
                const pkg = b.package || {}
                const pickupAddr = b.addresses?.find((a) => a.kind === 'PICKUP') || {}
                const dropoffAddr = b.addresses?.find((a) => a.kind === 'DROPOFF') || {}
                const pDetails = b.pickupDetails || {}
                const dDetails = b.deliveryDetails || {}

                return (
                  <tr key={b.id}>
                    <td>
                      <strong className={styles.link} onClick={() => setSelected(b)}>
                        {b.bookingNumber}
                      </strong>
                      <small>
                        {pDetails.city || pickupAddr.city || 'New Delhi'} → {dDetails.city || dropoffAddr.city || 'Gurugram'}
                      </small>
                    </td>
                    <td>
                      <strong>{b.user?.fullName || pDetails.name || dropoffAddr.contactName || 'Customer'}</strong>
                      <small>{b.user?.mobileNumber || pDetails.phone || dropoffAddr.phoneNumber}</small>
                    </td>
                    <td>
                      <span className={styles.badgeBlue}>
                        {b.serviceType?.replace(/_/g, ' ') || 'AIRPORT TO HOTEL'}
                      </span>
                      {dDetails.hotelName && <small>{dDetails.hotelName} (Room {dDetails.roomNumber || '402'})</small>}
                    </td>
                    <td>
                      <span>{b.totalBags || 2} Bags ({b.totalWeightKg || pkg.actualWeightKg || 28} Kg)</span>
                      <small>
                        Seal: <strong>{b.sealNumber || 'DLV-SEAL-88492'}</strong>
                      </small>
                    </td>
                    <td>
                      <strong>₹{Number(b.totalAmount || 2395.8).toFixed(2)}</strong>
                      <small>{b.paymentMethod?.replace(/_/g, ' ')} ({b.paymentStatus || 'PAID'})</small>
                    </td>
                    <td>
                      <select
                        className={styles.statusSelect}
                        value={b.status || 'IN_TRANSIT'}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      >
                        {COURIER_ALL_STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => setSelected(b)}
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => handleStartEdit(b)}
                          title="Edit Consignment"
                        >
                          <Edit2 size={15} color="#2563EB" />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => setPodBooking(b)}
                          title="View Proof of Delivery (POD)"
                        >
                          <FileCheck size={15} color="#059669" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Comprehensive Detail Drawer */}
      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.drawerWide} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <div>
                <h3>Consignment #{selected.bookingNumber}</h3>
                <span className={styles.badgeBlue}>{selected.serviceType?.replace(/_/g, ' ')}</span>
              </div>
              <div className={styles.drawerHeadActions}>
                <button
                  type="button"
                  className={styles.primaryBtnSmall}
                  onClick={() => {
                    handleStartEdit(selected)
                  }}
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setSelected(null)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className={styles.drawerBody}>
              {/* Status and Seal Box */}
              <div className={styles.detailGrid2}>
                <div className={styles.infoCard}>
                  <h4>Current Status & Seal</h4>
                  <div className={styles.metaLine}>
                    <span>Tracking Status:</span>
                    <strong style={{ color: '#2563EB' }}>{selected.status?.replace(/_/g, ' ')}</strong>
                  </div>
                  <div className={styles.metaLine}>
                    <span>Tamper Barcode Seal:</span>
                    <strong>{selected.sealNumber || 'DLV-SEAL-88492'}</strong>
                  </div>
                  <div className={styles.metaLine}>
                    <span>Expected Delivery:</span>
                    <span>{selected.schedule?.estimatedDelivery || '12 May 2025 by 06:00 PM'}</span>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <h4>Fare & Payment</h4>
                  <div className={styles.metaLine}>
                    <span>Total Amount:</span>
                    <strong style={{ fontSize: '1.2rem', color: '#0f172a' }}>
                      ₹{Number(selected.totalAmount || 2395.8).toFixed(2)}
                    </strong>
                  </div>
                  <div className={styles.metaLine}>
                    <span>Payment Method:</span>
                    <span>{selected.paymentMethod}</span>
                  </div>
                  <div className={styles.metaLine}>
                    <span>Payment Status:</span>
                    <span className={styles.badgeGreen}>{selected.paymentStatus || 'PAID'}</span>
                  </div>
                </div>
              </div>

              {/* Pickup & Delivery Cards */}
              <div className={styles.detailGrid2} style={{ marginTop: '1rem' }}>
                <div className={styles.infoCard}>
                  <h4>Pickup (Origin)</h4>
                  <p><strong>{selected.pickupDetails?.terminal || 'Terminal 3'}</strong> • Belt {selected.pickupDetails?.luggageBelt || '04'}</p>
                  <p>Flight: {selected.pickupDetails?.flightNumber || 'AI 102'} (PNR: {selected.pickupDetails?.pnr || 'AB12CD'})</p>
                  <p>Contact: {selected.pickupDetails?.name || 'Rahul Sharma'} ({selected.pickupDetails?.phone || '+91 98765 43210'})</p>
                  <p className={styles.textMuted}>{selected.pickupDetails?.address}</p>
                </div>

                <div className={styles.infoCard}>
                  <h4>Delivery (Destination)</h4>
                  <p><strong>{selected.deliveryDetails?.hotelName || 'Taj City Centre'}</strong> • Room {selected.deliveryDetails?.roomNumber || '402'}</p>
                  <p>Guest: {selected.deliveryDetails?.name || 'Rahul Sharma'} ({selected.deliveryDetails?.phone || '+91 98765 43210'})</p>
                  <p className={styles.textMuted}>{selected.deliveryDetails?.address}, {selected.deliveryDetails?.city}</p>
                </div>
              </div>

              {/* Luggage & Agent */}
              <div className={styles.detailGrid2} style={{ marginTop: '1rem' }}>
                <div className={styles.infoCard}>
                  <h4>Baggage Details</h4>
                  <p><strong>{selected.totalBags || 2} Bags</strong> (Total Verified: {selected.totalWeightKg || 28} Kg)</p>
                  <p className={styles.textMuted}>
                    {Array.isArray(selected.luggage)
                      ? selected.luggage.map((b, i) => `Bag ${i+1}: ${b.type} (${b.weight}kg)`).join(', ')
                      : 'Check-in Bag (15kg), Cabin Bag (13kg)'}
                  </p>
                </div>

                <div className={styles.infoCard}>
                  <h4>Assigned Driver Executive</h4>
                  <p><strong>{selected.agent?.name || 'Ravi Kumar'}</strong> ({selected.agent?.id || 'DLZAGT45521'})</p>
                  <p>Phone: {selected.agent?.phone || '+91 98765 43210'}</p>
                  <p>Vehicle: {selected.agent?.vehicle || 'DL 1Z 4589'}</p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setPodBooking(selected)}
                >
                  <FileCheck size={16} /> View Proof of Delivery (POD)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Edit Consignment Modal */}
      {editingBooking && editForm && (
        <div className={styles.modalOverlay} onClick={() => setEditingBooking(null)}>
          <div className={styles.modalContentWide} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <div>
                <h3>Edit Consignment #{editingBooking.bookingNumber}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Update live consignment attributes directly in PostgreSQL database.
                </p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setEditingBooking(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className={styles.editFormGrid}>
              {/* Route & Status */}
              <div className={styles.formSectionHeader}>Route & Consignment Status</div>
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Service Route</label>
                  <select
                    value={editForm.serviceType}
                    onChange={(e) => setEditForm({ ...editForm, serviceType: e.target.value })}
                  >
                    {COURIER_ROUTE_OPTIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Status (8 Stages)</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    {COURIER_ALL_STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Tamper-Evident Seal #</label>
                  <input
                    type="text"
                    value={editForm.sealNumber}
                    onChange={(e) => setEditForm({ ...editForm, sealNumber: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Total Fare (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.totalAmount}
                    onChange={(e) => setEditForm({ ...editForm, totalAmount: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Pickup & Terminal */}
              <div className={styles.formSectionHeader}>Pickup & Airport Info</div>
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Airport Terminal</label>
                  <input
                    type="text"
                    value={editForm.terminal}
                    onChange={(e) => setEditForm({ ...editForm, terminal: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Luggage Belt #</label>
                  <input
                    type="text"
                    value={editForm.luggageBelt}
                    onChange={(e) => setEditForm({ ...editForm, luggageBelt: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Flight Number</label>
                  <input
                    type="text"
                    value={editForm.flightNumber}
                    onChange={(e) => setEditForm({ ...editForm, flightNumber: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>PNR Reference</label>
                  <input
                    type="text"
                    value={editForm.pnr}
                    onChange={(e) => setEditForm({ ...editForm, pnr: e.target.value })}
                  />
                </div>
              </div>

              {/* Destination Hotel */}
              <div className={styles.formSectionHeader}>Delivery Destination & Hotel</div>
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Hotel Name</label>
                  <input
                    type="text"
                    value={editForm.hotelName}
                    onChange={(e) => setEditForm({ ...editForm, hotelName: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Room Number</label>
                  <input
                    type="text"
                    value={editForm.roomNumber}
                    onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Guest / Recipient Name</label>
                  <input
                    type="text"
                    value={editForm.dropoffContactName}
                    onChange={(e) => setEditForm({ ...editForm, dropoffContactName: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Recipient Phone</label>
                  <input
                    type="text"
                    value={editForm.dropoffPhone}
                    onChange={(e) => setEditForm({ ...editForm, dropoffPhone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Luggage Details */}
              <div className={styles.formSectionHeader}>Baggage & Driver Executive</div>
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Total Bags</label>
                  <input
                    type="number"
                    value={editForm.totalBags}
                    onChange={(e) => setEditForm({ ...editForm, totalBags: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Total Weight (Kg)</label>
                  <input
                    type="number"
                    value={editForm.actualWeightKg}
                    onChange={(e) => setEditForm({ ...editForm, actualWeightKg: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Driver Executive Name</label>
                  <input
                    type="text"
                    value={editForm.agentName}
                    onChange={(e) => setEditForm({ ...editForm, agentName: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Driver Vehicle #</label>
                  <input
                    type="text"
                    value={editForm.agentVehicle}
                    onChange={(e) => setEditForm({ ...editForm, agentVehicle: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setEditingBooking(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={savingEdit}
                >
                  {savingEdit ? 'Persisting to Database...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof of Delivery (POD) Modal */}
      {podBooking && (
        <CourierPodModal
          isOpen={Boolean(podBooking)}
          onClose={() => setPodBooking(null)}
          pod={podBooking.pod}
          agent={podBooking.agent}
          bookingNumber={podBooking.bookingNumber}
        />
      )}
    </div>
  )
}
