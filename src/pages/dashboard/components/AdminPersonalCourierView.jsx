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
  Scale,
  Zap,
  Layers,
  ArrowRight
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
  { key: 'CONFIRMED', label: 'Booking Confirmed' },
  { key: 'AGENT_ASSIGNED', label: 'Rider Assigned' },
  { key: 'PICKUP_IN_PROGRESS', label: 'Pickup in Progress' },
  { key: 'PICKED_UP', label: 'Package Picked Up' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'REACHED_DESTINATION_CITY', label: 'Reached Destination Hub' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
]

export const COURIER_SPEED_OPTIONS = [
  { id: 'BIKE_PRIORITY', label: 'Bike Priority Delivery' },
  { id: 'SURFACE_EXPRESS', label: 'Surface Standard' },
  { id: 'SAME_DAY', label: 'Same Day Delivery' },
  { id: 'HYBRID_DRONE', label: 'Hybrid Drone Delivery' },
  { id: 'NEXT_DAY', label: 'Next Day Air' },
]

export const COURIER_PACKAGING_OPTIONS = [
  { id: 'STANDARD', label: 'Delivez Standard Packaging' },
  { id: 'EXTRA_SECURE', label: 'Extra Secure (+Bubble Wrap)' },
  { id: 'WOODEN_CRATE', label: 'Reinforced Wooden Crate' },
  { id: 'OWN_PACKAGING', label: 'Customer Own Packaging' },
]

export const COURIER_CATEGORIES = [
  'Clothing & Apparel',
  'Electronics',
  'Health & Medicine',
  'Commercial Goods',
  'Food & Edibles',
  'Documents & Letters',
  'Personal Items & Gifts',
  'Household Items & Kitchenware',
]

export default function AdminPersonalCourierView({ onViewOrderDetail }) {
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
      const nowIso = new Date().toISOString()
      await updateAdminCourierStatus(id, newStatus, { timestamp: nowIso })
      try {
        const stored = JSON.parse(localStorage.getItem(`dlvz_status_timings_${id}`) || '{}')
        const updatedTimestamps = { ...(stored.timestamps || stored || {}), [newStatus]: nowIso }
        const updatedHistory = [
          { status: newStatus, timestamp: nowIso, actor: 'Admin Dispatcher', note: `Status updated to ${newStatus}` },
          ...(Array.isArray(stored.history) ? stored.history : []),
        ]
        localStorage.setItem(`dlvz_status_timings_${id}`, JSON.stringify({ ...updatedTimestamps, history: updatedHistory }))
      } catch (_) {}

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
      serviceType: b.serviceType || 'BIKE_PRIORITY',
      status: b.status || 'CONFIRMED',
      totalAmount: b.totalAmount ?? 450,
      sealNumber: b.sealNumber || 'DLV-SEAL-88492',

      // Package Real Content
      category: b.category || pkg.category || 'Clothing & Apparel',
      contentDescription: b.contentDescription || pkg.contentDescription || '',
      actualWeightKg: b.actualWeightKg ?? pkg.actualWeightKg ?? 2.5,
      chargeableWeightKg: b.chargeableWeightKg ?? pkg.chargeableWeightKg ?? 2.5,
      lengthCm: b.dimensions?.lengthCm ?? pkg.lengthCm ?? 30,
      widthCm: b.dimensions?.widthCm ?? pkg.widthCm ?? 20,
      heightCm: b.dimensions?.heightCm ?? pkg.heightCm ?? 15,
      packagingType: b.packagingType || pkg.packagingType || 'STANDARD',
      boxSize: b.boxSize || 'Small Box (10 Kg)',
      declaredValue: b.declaredValue ?? pkg.declaredValue ?? 5000,
      fragile: Boolean(b.fragile ?? pkg.fragile),
      secureHandling: Boolean(b.secureHandling ?? pkg.secureHandling),

      // Pickup Details
      pickupContactName: pDetails.name || pickupAddr.contactName || '',
      pickupPhone: pDetails.phone || pickupAddr.phoneNumber || '',
      pickupAddress: pDetails.address || pickupAddr.addressLine1 || '',
      pickupCity: pDetails.city || pickupAddr.city || 'Mumbai',
      pickupState: pDetails.state || pickupAddr.state || 'Maharashtra',
      pickupPostalCode: pDetails.pincode || pickupAddr.postalCode || '400001',
      pickupInstructions: pDetails.instructions || pickupAddr.instructions || '',

      // Delivery Details
      dropoffContactName: dDetails.name || dropoffAddr.contactName || '',
      dropoffPhone: dDetails.phone || dropoffAddr.phoneNumber || '',
      dropoffAddress: dDetails.address || dropoffAddr.addressLine1 || '',
      dropoffCity: dDetails.city || dropoffAddr.city || 'Gurugram',
      dropoffState: dDetails.state || dropoffAddr.state || 'Haryana',
      dropoffPostalCode: dDetails.pincode || dropoffAddr.postalCode || '122002',
      dropoffInstructions: dDetails.instructions || dropoffAddr.instructions || '',

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
        category: editForm.category,
        contentDescription: editForm.contentDescription,
        pickup: {
          contactName: editForm.pickupContactName,
          phoneNumber: editForm.pickupPhone,
          addressLine1: editForm.pickupAddress,
          city: editForm.pickupCity,
          state: editForm.pickupState,
          postalCode: editForm.pickupPostalCode,
          instructions: editForm.pickupInstructions,
        },
        dropoff: {
          contactName: editForm.dropoffContactName,
          phoneNumber: editForm.dropoffPhone,
          addressLine1: editForm.dropoffAddress,
          city: editForm.dropoffCity,
          state: editForm.dropoffState,
          postalCode: editForm.dropoffPostalCode,
          instructions: editForm.dropoffInstructions,
        },
        package: {
          category: editForm.category,
          actualWeightKg: Number(editForm.actualWeightKg),
          chargeableWeightKg: Number(editForm.chargeableWeightKg),
          lengthCm: Number(editForm.lengthCm),
          widthCm: Number(editForm.widthCm),
          heightCm: Number(editForm.heightCm),
          packagingType: editForm.packagingType,
          boxSize: editForm.boxSize,
          declaredValue: Number(editForm.declaredValue),
          fragile: Boolean(editForm.fragile),
          secureHandling: Boolean(editForm.secureHandling),
          contentDescription: editForm.contentDescription,
        },
        agent: {
          name: editForm.agentName,
          id: editForm.agentId,
          phone: editForm.agentPhone,
          vehicle: editForm.agentVehicle,
        },
      }

      const updated = await updateAdminCourierBooking(editingBooking.id, payload)
      showToast(`Consignment #${editingBooking.bookingNumber} updated successfully.`)
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
          <p>Real-time consignment control with verified item categories, package dimensions, packaging types, and live tracking.</p>
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
            placeholder="Search tracking ID, item category, customer name, destination city..."
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
              <th>Tracking ID & Route</th>
              <th>Sender</th>
              <th>Recipient & Destination</th>
              <th>Package Content & Specs</th>
              <th>Service & Speed</th>
              <th>Fare</th>
              <th>Live Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.empty}>
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

                const dims = b.dimensions || pkg.dimensions || { lengthCm: pkg.lengthCm || 30, widthCm: pkg.widthCm || 20, heightCm: pkg.heightCm || 15 }
                const actualWeight = b.actualWeightKg ?? pkg.actualWeightKg ?? 2.5
                const category = b.category || b.itemCategory || pkg.category || 'Personal Goods'
                const packagingName = b.packagingName || (b.packagingType ? b.packagingType.replace(/_/g, ' ') : 'Standard Packaging')

                return (
                  <tr key={b.id}>
                    {/* Tracking ID & Route */}
                    <td>
                      <strong
                        className={styles.link}
                        onClick={() => (onViewOrderDetail ? onViewOrderDetail(b, 'personal-courier') : setSelected(b))}
                        title="Open Dedicated Order Page"
                      >
                        {b.bookingNumber}
                      </strong>
                      <small style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <span>{pDetails.city || pickupAddr.city || 'Origin'}</span>
                        <ArrowRight size={10} color="#94a3b8" />
                        <span>{dDetails.city || dropoffAddr.city || 'Destination'}</span>
                      </small>
                    </td>

                    {/* Sender */}
                    <td>
                      <strong>{pDetails.name || pickupAddr.contactName || b.user?.fullName || 'Sender'}</strong>
                      <small>{pDetails.phone || pickupAddr.phoneNumber || b.user?.mobileNumber || '—'}</small>
                    </td>

                    {/* Recipient */}
                    <td>
                      <strong>{dDetails.name || dropoffAddr.contactName || 'Recipient'}</strong>
                      <small style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {dDetails.address || dropoffAddr.addressLine1 || 'Destination on file'}
                      </small>
                    </td>

                    {/* Package Content & Specs */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span className={styles.badgeBlue} style={{ alignSelf: 'flex-start' }}>
                          <Package size={11} style={{ display: 'inline', marginRight: 3 }} />
                          {category}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}>
                          {actualWeight} kg • {dims.lengthCm}×{dims.widthCm}×{dims.heightCm} cm
                        </span>
                        <small style={{ color: '#059669', fontWeight: 600 }}>
                          {packagingName}
                        </small>
                      </div>
                    </td>

                    {/* Service & Speed */}
                    <td>
                      <span className={styles.badgeGold} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Zap size={10} />
                        {b.serviceName || b.serviceType?.replace(/_/g, ' ') || 'BIKE PRIORITY'}
                      </span>
                      {b.selfServiceOption && b.selfServiceOption !== 'NONE' && (
                        <small style={{ color: '#7c3aed', fontWeight: 700, marginTop: 2 }}>
                          {b.selfServiceOption === 'SELF_PICKUP' ? 'Hub Pickup (-₹50)' : b.selfServiceOption === 'SELF_DROPOFF' ? 'Hub Drop (-₹50)' : 'Self-Service (-₹100)'}
                        </small>
                      )}
                    </td>

                    {/* Fare */}
                    <td>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                        ₹{Number(b.totalAmount || 0).toFixed(2)}
                      </strong>
                      <small>{b.paymentMethod?.replace(/_/g, ' ') || 'ONLINE'} ({b.paymentStatus || 'PAID'})</small>
                    </td>

                    {/* Live Status */}
                    <td>
                      <select
                        className={styles.statusSelect}
                        value={b.status || 'CONFIRMED'}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      >
                        {COURIER_ALL_STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className={styles.actionGroup}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => (onViewOrderDetail ? onViewOrderDetail(b, 'personal-courier') : setSelected(b))}
                          title="Open Dedicated Order Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => handleStartEdit(b)}
                          title="Edit Consignment Content"
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
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Package size={18} color="#2563eb" />
                  Consignment #{selected.bookingNumber}
                </h3>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <span className={styles.badgeBlue}>{selected.category || 'Courier Consignment'}</span>
                  <span className={styles.badgeGold}>{selected.serviceName || selected.serviceType?.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <div className={styles.drawerHeadActions}>
                <button
                  type="button"
                  className={styles.primaryBtnSmall}
                  onClick={() => handleStartEdit(selected)}
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

            <div className={styles.drawerBody} style={{ padding: '20px', overflowY: 'auto' }}>
              {/* Status and Fare Row */}
              <div className={styles.detailGrid2}>
                <div className={styles.infoCard}>
                  <h4>Current Status & Seal</h4>
                  <div className={styles.metaLine}>
                    <span>Tracking Status:</span>
                    <strong style={{ color: '#2563EB' }}>{selected.status?.replace(/_/g, ' ')}</strong>
                  </div>
                  <div className={styles.metaLine}>
                    <span>Tamper Barcode Seal:</span>
                    <strong style={{ fontFamily: 'monospace' }}>{selected.sealNumber || 'DLV-SEAL-88492'}</strong>
                  </div>
                  <div className={styles.metaLine}>
                    <span>Service Speed:</span>
                    <span>{selected.serviceName || selected.serviceType?.replace(/_/g, ' ')}</span>
                  </div>
                  {selected.selfServiceLabel && (
                    <div className={styles.metaLine}>
                      <span>Self-Service Tier:</span>
                      <span style={{ color: '#7c3aed', fontWeight: 600 }}>{selected.selfServiceLabel}</span>
                    </div>
                  )}
                </div>

                <div className={styles.infoCard}>
                  <h4>Fare & Commercials</h4>
                  <div className={styles.metaLine}>
                    <span>Total Amount:</span>
                    <strong style={{ fontSize: '1.2rem', color: '#0f172a' }}>
                      ₹{Number(selected.totalAmount || 0).toFixed(2)}
                    </strong>
                  </div>
                  <div className={styles.metaLine}>
                    <span>Payment Method:</span>
                    <span>{selected.paymentMethod?.replace(/_/g, ' ') || 'ONLINE'}</span>
                  </div>
                  <div className={styles.metaLine}>
                    <span>Payment Status:</span>
                    <span className={styles.badgeGreen}>{selected.paymentStatus || 'PAID'}</span>
                  </div>
                </div>
              </div>

              {/* Package Real Content & Specifications */}
              <div className={styles.infoCard} style={{ marginTop: '1rem', border: '1.5px solid #bfdbfe', background: '#f8faff' }}>
                <h4 style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Box size={16} /> Declared Package Content & Specifications
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 8 }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>ITEM CATEGORY</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                      {selected.category || selected.package?.category || 'General Cargo'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>PACKAGING TYPE</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 700, fontSize: '14px', color: '#059669' }}>
                      {selected.packagingName || selected.package?.packagingName || 'Standard Packaging'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>WEIGHT SPECS</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 600, fontSize: '13px' }}>
                      {selected.actualWeightKg ?? selected.package?.actualWeightKg ?? 2.5} kg (Actual) • {selected.chargeableWeightKg ?? selected.package?.chargeableWeightKg ?? 2.5} kg (Chargeable)
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>DIMENSIONS & VOLUME</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: 600, fontSize: '13px' }}>
                      {selected.dimensions?.lengthCm || selected.package?.lengthCm || 30} × {selected.dimensions?.widthCm || selected.package?.widthCm || 20} × {selected.dimensions?.heightCm || selected.package?.heightCm || 15} cm
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>BOX SIZE / CAPACITY</span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#334155' }}>
                      {selected.boxSize || selected.package?.boxSize || 'Small Box (10 Kg)'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>SPECIAL SAFEGUARDS</span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#d97706', fontWeight: 600 }}>
                      {selected.fragile || selected.package?.fragile ? '✓ Fragile Handling ' : ''}
                      {selected.secureHandling || selected.package?.secureHandling ? '✓ High Security Seal' : ''}
                      {!selected.fragile && !selected.package?.fragile && !selected.secureHandling && !selected.package?.secureHandling ? 'Standard Courier Handling' : ''}
                    </p>
                  </div>
                </div>

                {(selected.contentDescription || selected.package?.contentDescription) && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #cbd5e1' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>CONTENT DESCRIPTION / MANIFEST:</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#334155', fontStyle: 'italic' }}>
                      "{selected.contentDescription || selected.package?.contentDescription}"
                    </p>
                  </div>
                )}
              </div>

              {/* Pickup & Delivery Addresses */}
              <div className={styles.detailGrid2} style={{ marginTop: '1rem' }}>
                <div className={styles.infoCard}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={15} color="#2563eb" /> Pickup Origin (Sender)
                  </h4>
                  <p><strong>{selected.pickupDetails?.name || 'Sender'}</strong></p>
                  <p style={{ color: '#2563eb', fontWeight: 600 }}>{selected.pickupDetails?.phone || '—'}</p>
                  <p className={styles.textMuted}>{selected.pickupDetails?.address}</p>
                  {selected.pickupDetails?.instructions && (
                    <p style={{ fontSize: '11px', background: '#f1f5f9', padding: '4px 8px', borderRadius: 4, marginTop: 6 }}>
                      <strong>Note:</strong> {selected.pickupDetails.instructions}
                    </p>
                  )}
                </div>

                <div className={styles.infoCard}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={15} color="#059669" /> Delivery Destination (Recipient)
                  </h4>
                  <p><strong>{selected.deliveryDetails?.name || 'Recipient'}</strong></p>
                  <p style={{ color: '#059669', fontWeight: 600 }}>{selected.deliveryDetails?.phone || '—'}</p>
                  <p className={styles.textMuted}>{selected.deliveryDetails?.address}</p>
                  {selected.deliveryDetails?.instructions && (
                    <p style={{ fontSize: '11px', background: '#f1f5f9', padding: '4px 8px', borderRadius: 4, marginTop: 6 }}>
                      <strong>Note:</strong> {selected.deliveryDetails.instructions}
                    </p>
                  )}
                </div>
              </div>

              {/* Assigned Driver Executive */}
              <div className={styles.infoCard} style={{ marginTop: '1rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Truck size={15} color="#475569" /> Assigned Fleet Executive
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Executive Name</span>
                    <p style={{ margin: 0, fontWeight: 700 }}>{selected.agent?.name || 'Ravi Kumar'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Contact</span>
                    <p style={{ margin: 0, fontWeight: 600 }}>{selected.agent?.phone || '+91 98765 43210'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Vehicle</span>
                    <p style={{ margin: 0, fontWeight: 600 }}>{selected.agent?.vehicle || 'DL 1Z 4589'}</p>
                  </div>
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
                  Update live consignment content, dimensions, packaging, and addresses.
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
              {/* Service & Status */}
              <div className={styles.formSectionHeader}>Service Speed & Lifecycle Status</div>
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Service Speed</label>
                  <select
                    value={editForm.serviceType}
                    onChange={(e) => setEditForm({ ...editForm, serviceType: e.target.value })}
                  >
                    {COURIER_SPEED_OPTIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Status</label>
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

              {/* Package Content & Dimensions */}
              <div className={styles.formSectionHeader}>Package Real Content & Dimensions</div>
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Declared Item Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    {COURIER_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Packaging Type</label>
                  <select
                    value={editForm.packagingType}
                    onChange={(e) => setEditForm({ ...editForm, packagingType: e.target.value })}
                  >
                    {COURIER_PACKAGING_OPTIONS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow3} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div className={styles.formGroup}>
                  <label>Length (cm)</label>
                  <input
                    type="number"
                    value={editForm.lengthCm}
                    onChange={(e) => setEditForm({ ...editForm, lengthCm: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Width (cm)</label>
                  <input
                    type="number"
                    value={editForm.widthCm}
                    onChange={(e) => setEditForm({ ...editForm, widthCm: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    value={editForm.heightCm}
                    onChange={(e) => setEditForm({ ...editForm, heightCm: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Actual Weight (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.actualWeightKg}
                    onChange={(e) => setEditForm({ ...editForm, actualWeightKg: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Chargeable Weight (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.chargeableWeightKg}
                    onChange={(e) => setEditForm({ ...editForm, chargeableWeightKg: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Content Description / Declared Items</label>
                <input
                  type="text"
                  value={editForm.contentDescription}
                  onChange={(e) => setEditForm({ ...editForm, contentDescription: e.target.value })}
                  placeholder="e.g. Designer suits, electronic gadgets, medical samples"
                />
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

              {/* Pickup Address */}
              <div className={styles.formSectionHeader}>Pickup Origin Address</div>
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Sender Contact Name</label>
                  <input
                    type="text"
                    value={editForm.pickupContactName}
                    onChange={(e) => setEditForm({ ...editForm, pickupContactName: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Sender Phone</label>
                  <input
                    type="text"
                    value={editForm.pickupPhone}
                    onChange={(e) => setEditForm({ ...editForm, pickupPhone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Pickup Street Address</label>
                <input
                  type="text"
                  value={editForm.pickupAddress}
                  onChange={(e) => setEditForm({ ...editForm, pickupAddress: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formRow3} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div className={styles.formGroup}>
                  <label>City</label>
                  <input
                    type="text"
                    value={editForm.pickupCity}
                    onChange={(e) => setEditForm({ ...editForm, pickupCity: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>State</label>
                  <input
                    type="text"
                    value={editForm.pickupState}
                    onChange={(e) => setEditForm({ ...editForm, pickupState: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Pincode</label>
                  <input
                    type="text"
                    value={editForm.pickupPostalCode}
                    onChange={(e) => setEditForm({ ...editForm, pickupPostalCode: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className={styles.formSectionHeader}>Delivery Destination Address</div>
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Recipient Name</label>
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

              <div className={styles.formGroup}>
                <label>Delivery Street Address</label>
                <input
                  type="text"
                  value={editForm.dropoffAddress}
                  onChange={(e) => setEditForm({ ...editForm, dropoffAddress: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formRow3} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div className={styles.formGroup}>
                  <label>City</label>
                  <input
                    type="text"
                    value={editForm.dropoffCity}
                    onChange={(e) => setEditForm({ ...editForm, dropoffCity: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>State</label>
                  <input
                    type="text"
                    value={editForm.dropoffState}
                    onChange={(e) => setEditForm({ ...editForm, dropoffState: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Pincode</label>
                  <input
                    type="text"
                    value={editForm.dropoffPostalCode}
                    onChange={(e) => setEditForm({ ...editForm, dropoffPostalCode: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Driver Executive */}
              <div className={styles.formSectionHeader}>Assigned Driver Executive</div>
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
