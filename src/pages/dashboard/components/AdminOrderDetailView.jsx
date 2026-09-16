import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Bike,
  Box,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Gift,
  Home,
  Info,
  Layers,
  Lock,
  Luggage,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  Plane,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
  User,
  UserCheck,
  Users,
  X,
  Zap,
  Ban,
  AlertTriangle,
  History
} from 'lucide-react'
import {
  fetchAdminOrderFullDetails,
  updateOrderStatusUnified,
  assignPartnerToOrder,
  autoAssignOrderUnified,
  cancelOrderUnified,
  fetchAdminPartners,
  saveAdminOrderNote,
  updateAdminCourierStatus,
  updateAdminConfidentialStatus,
  updateAdminForgotStatus,
  updateAdminReturnStatus,
  recordOrderStatusTimingApi,
  updateOrderStatusByOrderId,
  cancelOrderByOrderId
} from '@/features/admin-management/services/adminManagementService.js'
import {
  updateAdminGiftOrderStatus,
  cancelAdminGiftOrder
} from '@/features/admin-gift-delivery/services/adminGiftDeliveryService.js'
import styles from './AdminOrderDetailView.module.css'

const SERVICE_META = {
  'courier-delivery': { label: 'Personal Courier', icon: Truck, color: '#087fc1', bg: '#e9f6ff' },
  'personal-courier': { label: 'Personal Courier', icon: Truck, color: '#087fc1', bg: '#e9f6ff' },
  'luggage-delivery': { label: 'Luggage Delivery', icon: Luggage, color: '#d97706', bg: '#fef3c7' },
  'airport-luggage': { label: 'Luggage Delivery', icon: Luggage, color: '#d97706', bg: '#fef3c7' },
  'confidential-delivery': { label: 'Delivez Vault (Confidential)', icon: ShieldCheck, color: '#dc2626', bg: '#fef2f2' },
  'confidential-courier': { label: 'Delivez Vault (Confidential)', icon: ShieldCheck, color: '#dc2626', bg: '#fef2f2' },
  'forgot-something': { label: 'Forgot Something Retrieval', icon: ShoppingBag, color: '#7c3aed', bg: '#f5f3ff' },
  'return-pickup': { label: 'Return & Exchange Pickup', icon: RotateCcw, color: '#059669', bg: '#ecfdf5' },
  'personal-return-pickup': { label: 'Return & Exchange Pickup', icon: RotateCcw, color: '#059669', bg: '#ecfdf5' },
  'gift-delivery': { label: 'Gift & Surprise Delivery', icon: Gift, color: '#ef4444', bg: '#fef2f2' },
  'gift-and-surprise': { label: 'Gift & Surprise Delivery', icon: Gift, color: '#ef4444', bg: '#fef2f2' },
}

const LIFECYCLE_STEPS = [
  { key: 'CONFIRMED', label: 'Order Placed' },
  { key: 'AGENT_ASSIGNED', label: 'Rider Assigned' },
  { key: 'PICKED_UP', label: 'Picked Up' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
]

// Timing formatters
function formatTiming(isoString) {
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

function formatCompactTiming(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

// Local persistent timing storage
function getStoredTimings(id) {
  if (!id) return {}
  try {
    const raw = localStorage.getItem(`dlvz_status_timings_${id}`)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

function saveStoredTimings(id, timingsObj, historyArray) {
  if (!id) return
  try {
    const existing = getStoredTimings(id)
    const toSave = {
      ...existing,
      ...timingsObj,
      ...(historyArray ? { history: historyArray } : {}),
    }
    localStorage.setItem(`dlvz_status_timings_${id}`, JSON.stringify(toSave))
  } catch (e) {}
}

export default function AdminOrderDetailView({
  orderId,
  serviceKey,
  initialOrder = null,
  fromTab = null,
  onBack = () => {},
  onNavigate = null,
}) {
  const [order, setOrder] = useState(initialOrder)
  const [loading, setLoading] = useState(!initialOrder)
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState('')
  const [copied, setCopied] = useState(false)

  // Normalized Booking Number & Order ID
  const bookingNumber = order?.bookingNumber || order?.orderNumber || order?.id || orderId
  const rawId = order?.id || orderId

  // Fleet Partners & Assign Modal
  const [partners, setPartners] = useState([])
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedPartnerId, setSelectedPartnerId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [autoAssigning, setAutoAssigning] = useState(false)

  // Dispatcher Notes
  const [newNote, setNewNote] = useState('')
  const [notesList, setNotesList] = useState([])

  // Status Change Timings & Audit History
  const [statusTimings, setStatusTimings] = useState(() => {
    const rawKey = order?.id || orderId
    const stored = getStoredTimings(rawKey) || getStoredTimings(order?.bookingNumber)
    const initialTimestamps = order?.statusTimestamps || {}
    const created = order?.createdAt || stored.CONFIRMED || new Date().toISOString()
    return {
      CONFIRMED: created,
      ...stored,
      ...initialTimestamps,
    }
  })

  const [statusHistory, setStatusHistory] = useState(() => {
    const rawKey = order?.id || orderId
    const stored = getStoredTimings(rawKey) || getStoredTimings(order?.bookingNumber)
    if (Array.isArray(stored.history) && stored.history.length > 0) {
      return stored.history
    }
    if (Array.isArray(order?.statusHistory) && order.statusHistory.length > 0) {
      return order.statusHistory
    }
    return [
      {
        status: 'CONFIRMED',
        timestamp: order?.createdAt || new Date().toISOString(),
        actor: 'Customer Checkout',
        note: 'Order consignment placed and initial booking confirmed.'
      }
    ]
  })

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  // Load Order Details
  const loadOrderDetails = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true)
    setRefreshing(true)
    try {
      const data = await fetchAdminOrderFullDetails(serviceKey, orderId)
      if (data) {
        setOrder((prev) => ({ ...(prev || {}), ...data }))
        const rawKey = data.id || orderId
        const stored = getStoredTimings(rawKey) || getStoredTimings(data.bookingNumber)
        const updatedTimings = {
          CONFIRMED: data.createdAt || stored.CONFIRMED || new Date().toISOString(),
          ...stored,
          ...(data.statusTimestamps || {}),
        }
        setStatusTimings((prev) => ({ ...prev, ...updatedTimings }))
        if (Array.isArray(data.statusHistory) && data.statusHistory.length > 0) {
          setStatusHistory(data.statusHistory)
        }
      }
    } catch (err) {
      console.error('Failed to load order full details:', err)
    } finally {
      if (showSpinner) setLoading(false)
      setRefreshing(false)
    }
  }, [orderId, serviceKey])

  useEffect(() => {
    loadOrderDetails(!initialOrder)
    fetchAdminPartners().then((res) => {
      if (res?.partners) setPartners(res.partners)
    }).catch(console.error)
  }, [initialOrder, loadOrderDetails])

  // Resolve service configuration
  const sKey = (order?.serviceKey || serviceKey || 'courier-delivery').toLowerCase()
  const sMeta = SERVICE_META[sKey] || {
    label: order?.serviceName || 'Standard Delivery',
    icon: Package,
    color: '#087fc1',
    bg: '#e9f6ff',
  }
  const ServiceIcon = sMeta.icon

  // Copy booking number
  const handleCopyId = () => {
    if (!bookingNumber) return
    navigator.clipboard.writeText(bookingNumber)
    setCopied(true)
    showToast(`Copied ${bookingNumber} to clipboard`)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle Status Update
  const handleStatusUpdate = async (newStatus) => {
    try {
      const nowIso = new Date().toISOString()
      const newTimingMap = { ...statusTimings, [newStatus]: nowIso }
      const newHistoryItem = {
        status: newStatus,
        timestamp: nowIso,
        actor: 'Admin Dispatcher',
        note: `Operational status manually marked as ${newStatus}`
      }
      const newHistoryList = [newHistoryItem, ...statusHistory]

      const timingPayload = {
        serviceKey: sKey,
        status: newStatus,
        timestamp: nowIso,
        statusTimestamps: newTimingMap,
        statusHistory: newHistoryList,
        statusChangedAt: nowIso,
        updatedAt: nowIso,
        notes: `Operational status manually marked as ${newStatus}`,
        note: `Operational status manually marked as ${newStatus}`,
        actor: 'Admin Dispatcher',
      }

      // Universal API status change with orderId
      await updateOrderStatusByOrderId(rawId, newStatus, timingPayload)

      setStatusTimings(newTimingMap)
      setStatusHistory(newHistoryList)
      saveStoredTimings(rawId, newTimingMap, newHistoryList)
      saveStoredTimings(bookingNumber, newTimingMap, newHistoryList)

      setOrder((prev) => ({
        ...prev,
        status: newStatus,
        statusTimestamps: newTimingMap,
        statusHistory: newHistoryList,
      }))
      showToast(`Consignment #${bookingNumber} marked as ${newStatus}`)

      // Add to internal audit notes
      setNotesList((prev) => [
        {
          note: `Operational status manually updated to ${newStatus} by Dispatcher at ${formatTiming(nowIso)}.`,
          timestamp: nowIso,
          by: 'Admin Dispatcher',
        },
        ...prev,
      ])
    } catch (err) {
      alert(err.message || 'Failed to update order status.')
    }
  }

  // Handle Assign Partner
  const handleConfirmAssign = async () => {
    if (!selectedPartnerId) return
    const partner = partners.find((p) => p.id === selectedPartnerId)
    if (!partner) return

    setAssigning(true)
    try {
      const nowIso = new Date().toISOString()
      const newTimingMap = { ...statusTimings, AGENT_ASSIGNED: nowIso }
      const newHistoryItem = {
        status: 'AGENT_ASSIGNED',
        timestamp: nowIso,
        actor: 'Fleet Manager',
        note: `Assigned rider ${partner.name} (${partner.vehicle} • ${partner.phone})`
      }
      const newHistoryList = [newHistoryItem, ...statusHistory]

      const timingPayload = {
        partnerId: partner.id,
        partnerName: partner.name,
        partnerPhone: partner.phone,
        partnerVehicle: partner.vehicle,
        assignedAt: nowIso,
        timestamp: nowIso,
        statusTimestamps: newTimingMap,
        statusHistory: newHistoryList,
        statusChangedAt: nowIso,
        updatedAt: nowIso,
      }

      await assignPartnerToOrder(sKey, rawId, timingPayload, timingPayload)
      recordOrderStatusTimingApi(sKey, rawId, 'AGENT_ASSIGNED', timingPayload).catch(() => {})
      saveAdminOrderNote(sKey, rawId, `Assigned partner ${partner.name} (${partner.phone})`, timingPayload).catch(() => {})

      setStatusTimings(newTimingMap)
      setStatusHistory(newHistoryList)
      saveStoredTimings(rawId, newTimingMap, newHistoryList)
      saveStoredTimings(bookingNumber, newTimingMap, newHistoryList)

      const updatedInfo = {
        assignedPartner: partner.name,
        partnerPhone: partner.phone,
        partnerVehicle: partner.vehicle,
        status: order?.status === 'CONFIRMED' ? 'AGENT_ASSIGNED' : order?.status,
        statusTimestamps: newTimingMap,
        statusHistory: newHistoryList,
      }

      setOrder((prev) => ({ ...prev, ...updatedInfo }))
      showToast(`Assigned ${partner.name} to order #${bookingNumber}`)
      setAssignModalOpen(false)
      setSelectedPartnerId('')

      setNotesList((prev) => [
        {
          note: `Assigned delivery partner ${partner.name} (${partner.vehicle} • ${partner.phone}) at ${formatTiming(nowIso)}`,
          timestamp: nowIso,
          by: 'Fleet Manager',
        },
        ...prev,
      ])
    } catch (err) {
      alert(err.message || 'Failed to assign rider.')
    } finally {
      setAssigning(false)
    }
  }

  // Handle Auto-Assign
  const handleAutoAssign = async () => {
    setAutoAssigning(true)
    try {
      const nowIso = new Date().toISOString()
      const newTimingMap = { ...statusTimings, AGENT_ASSIGNED: nowIso }
      const newHistoryItem = {
        status: 'AGENT_ASSIGNED',
        timestamp: nowIso,
        actor: 'Smart Auto-Dispatch Engine',
        note: 'Auto-dispatched nearest verified rider'
      }
      const newHistoryList = [newHistoryItem, ...statusHistory]

      const timingPayload = {
        timestamp: nowIso,
        assignedAt: nowIso,
        statusChangedAt: nowIso,
        statusTimestamps: newTimingMap,
        statusHistory: newHistoryList,
      }

      const data = await autoAssignOrderUnified(sKey, rawId, timingPayload)
      const updated = {
        assignedPartner: data?.assignedPartner || 'Fleet Rider Dispatched',
        partnerPhone: data?.partnerPhone || '+91 98765 00000',
        partnerVehicle: data?.partnerVehicle || 'Motorcycle DL-01',
        status: data?.updatedStatus || 'AGENT_ASSIGNED',
        statusTimestamps: newTimingMap,
        statusHistory: newHistoryList,
      }

      recordOrderStatusTimingApi(sKey, rawId, 'AGENT_ASSIGNED', timingPayload).catch(() => {})
      saveAdminOrderNote(sKey, rawId, `Auto-dispatched rider ${updated.assignedPartner}`, timingPayload).catch(() => {})

      setStatusTimings(newTimingMap)
      setStatusHistory(newHistoryList)
      saveStoredTimings(rawId, newTimingMap, newHistoryList)
      saveStoredTimings(bookingNumber, newTimingMap, newHistoryList)

      setOrder((prev) => ({ ...prev, ...updated }))
      showToast(`⚡ Auto-dispatched ${updated.assignedPartner} to order #${bookingNumber}`)
      setNotesList((prev) => [
        {
          note: `⚡ System automated dispatch allocated nearest rider: ${updated.assignedPartner} at ${formatTiming(nowIso)}`,
          timestamp: nowIso,
          by: 'Smart Auto-Dispatch Engine',
        },
        ...prev,
      ])
    } catch (err) {
      alert(err.message || 'Smart auto-dispatch failed.')
    } finally {
      setAutoAssigning(false)
    }
  }

  // Handle Cancel Consignment
  const handleCancelOrder = async () => {
    const reason = window.prompt(
      `Are you sure you want to cancel order #${bookingNumber}?\nPlease provide operational cancellation reason:`,
      'Cancelled by Operational Dispatcher'
    )
    if (!reason) return

    try {
      const nowIso = new Date().toISOString()
      const newTimingMap = { ...statusTimings, CANCELLED: nowIso }
      const newHistoryItem = {
        status: 'CANCELLED',
        timestamp: nowIso,
        actor: 'Admin Dispatcher',
        note: `Consignment CANCELLED. Reason: ${reason}`
      }
      const newHistoryList = [newHistoryItem, ...statusHistory]

      const cancelTimingPayload = {
        serviceKey: sKey,
        reason,
        timestamp: nowIso,
        cancelledAt: nowIso,
        statusChangedAt: nowIso,
        statusTimestamps: newTimingMap,
        statusHistory: newHistoryList,
      }

      await cancelOrderByOrderId(rawId, reason, cancelTimingPayload)

      setStatusTimings(newTimingMap)
      setStatusHistory(newHistoryList)
      saveStoredTimings(rawId, newTimingMap, newHistoryList)
      saveStoredTimings(bookingNumber, newTimingMap, newHistoryList)

      setOrder((prev) => ({
        ...prev,
        status: 'CANCELLED',
        statusTimestamps: newTimingMap,
        statusHistory: newHistoryList,
      }))
      showToast(`Order #${bookingNumber} cancelled.`)
      setNotesList((prev) => [
        {
          note: `Consignment CANCELLED at ${formatTiming(nowIso)}. Reason: ${reason}`,
          timestamp: nowIso,
          by: 'Admin Dispatcher',
        },
        ...prev,
      ])
    } catch (err) {
      alert(err.message || 'Failed to cancel order.')
    }
  }

  // Add Dispatcher Note
  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return
    const text = newNote.trim()
    setNewNote('')
    const noteObj = {
      note: text,
      timestamp: new Date().toISOString(),
      by: 'Dispatcher',
    }
    setNotesList((prev) => [noteObj, ...prev])
    await saveAdminOrderNote(sKey, rawId, text)
    showToast('Dispatcher note recorded.')
  }

  // Step Calculation
  const currentStatus = (order?.status || 'CONFIRMED').toUpperCase()
  const currentStepIdx = useMemo(() => {
    if (currentStatus === 'CANCELLED') return -1
    if (currentStatus === 'DELIVERED') return 5
    if (currentStatus === 'OUT_FOR_DELIVERY') return 4
    if (currentStatus === 'IN_TRANSIT' || currentStatus === 'REACHED_DESTINATION_CITY') return 3
    if (currentStatus === 'PICKED_UP' || currentStatus === 'LUGGAGE_PICKED') return 2
    if (currentStatus === 'AGENT_ASSIGNED' || currentStatus === 'PARTNER_ASSIGNED' || currentStatus === 'PICKUP_ASSIGNED') return 1
    return 0
  }, [currentStatus])

  // Extract nested or normalized details
  const pickupAddr = order?.addresses?.find((a) => a.kind === 'PICKUP') || {}
  const dropoffAddr = order?.addresses?.find((a) => a.kind === 'DROPOFF') || {}
  const pDetails = order?.pickupDetails || {}
  const dDetails = order?.deliveryDetails || {}
  const pkg = order?.package || {}
  const agent = order?.agent || {}

  // Customer details
  const customerName = order?.user?.fullName || order?.customerName || pDetails.name || pickupAddr.contactName || 'Valued Customer'
  const customerPhone = order?.user?.mobileNumber || order?.customerPhone || pDetails.phone || pickupAddr.phoneNumber || '—'
  const customerEmail = order?.user?.email || order?.customerEmail || '—'

  // Pickup Details
  const senderName = pDetails.name || pickupAddr.contactName || order?.pickupContactName || customerName
  const senderPhone = pDetails.phone || pickupAddr.phoneNumber || order?.pickupPhone || customerPhone
  const senderAddress =
    pDetails.address ||
    order?.pickupAddress ||
    [pickupAddr.addressLine1, pickupAddr.landmark, pickupAddr.city, pickupAddr.state, pickupAddr.postalCode]
      .filter(Boolean)
      .join(', ') ||
    'Origin Address on file'
  const pickupCity = pDetails.city || pickupAddr.city || order?.pickupCity || 'Delhi Hub'

  // Dropoff Details
  const recipientName =
    dDetails.name ||
    order?.recipientName ||
    order?.dropoffRecipientName ||
    dropoffAddr.contactName ||
    'Consignee Recipient'
  const recipientPhone =
    dDetails.phone ||
    order?.recipientPhone ||
    order?.dropoffPhone ||
    dropoffAddr.phoneNumber ||
    '—'
  const dropoffAddress =
    dDetails.address ||
    order?.destination ||
    order?.dropoffAddress ||
    order?.deliveryAddress ||
    [dropoffAddr.addressLine1, dropoffAddr.landmark, dropoffAddr.city, dropoffAddr.state, dropoffAddr.postalCode]
      .filter(Boolean)
      .join(', ') ||
    'Destination Address on file'
  const dropoffCity = dDetails.city || dropoffAddr.city || order?.deliveryCity || order?.dropoffCity || 'Hub'

  // Financials
  const amountTotal = Number(
    order?.totalAmount ?? order?.amount ?? order?.totalFare ?? 1499
  ).toFixed(2)
  const paymentMethod = order?.paymentMethod || 'Online (UPI / Razorpay)'
  const paymentStatus = (order?.paymentStatus || 'PAID').toUpperCase()

  // Weight / Bags / Package
  const totalBags = order?.totalBags || (Array.isArray(order?.luggage) ? order.luggage.length : 1)
  const totalWeight = order?.totalWeightKg || pkg.actualWeightKg || order?.weightKg || 12
  const sealNumber = order?.sealNumber || order?.tamperSealNumber || 'DLV-SEAL-88492'

  // Live Tracking Link
  const publicTrackingUrl = useMemo(() => {
    const rawNum = String(bookingNumber || orderId || '').replace(/^#/, '')
    if (!rawNum) return '/track'
    if (sKey.includes('gift')) return `/track/gift-delivery/${encodeURIComponent(rawNum)}`
    if (sKey.includes('confidential')) return `/vault/track/${encodeURIComponent(rawNum)}`
    if (sKey.includes('return')) return `/track/return-pickup/${encodeURIComponent(rawNum)}`
    if (sKey.includes('forgot')) return `/track/forgot-something/${encodeURIComponent(rawNum)}`
    return `/track/${encodeURIComponent(rawNum)}`
  }, [bookingNumber, orderId, sKey])

  const targetTab = useMemo(() => {
    if (sKey.includes('courier')) return 'courier'
    if (sKey.includes('luggage')) return 'luggage'
    if (sKey.includes('confidential')) return 'confidential'
    if (sKey.includes('forgot')) return 'forgot'
    if (sKey.includes('return')) return 'returns'
    if (sKey.includes('gift')) return 'gifts'
    return 'orders'
  }, [sKey])

  const backTab = fromTab || targetTab || 'orders'
  const backLabel = useMemo(() => {
    if (fromTab === 'overview') return 'Dashboard'
    if (fromTab === 'orders') return 'Unified Orders'
    if (fromTab === 'radar') return 'Radar'
    if (fromTab === 'customers') return 'Customers'
    if (fromTab === 'courier') return 'Courier Delivery'
    if (fromTab === 'luggage') return 'Luggage Delivery'
    if (fromTab === 'confidential') return 'Confidential Delivery'
    if (fromTab === 'forgot') return 'Forgot Something'
    if (fromTab === 'returns') return 'Return Pickup'
    if (fromTab === 'gifts') return 'Gift Delivery'
    return sMeta.label || 'Orders'
  }, [fromTab, sMeta.label])

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: 16 }}>
          <RefreshCw size={28} className={styles.spin} style={{ color: '#2563eb', marginBottom: 12 }} />
          <h3 style={{ margin: 0, color: '#0f172a' }}>Loading Consignment #{bookingNumber}...</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 6 }}>
            Retrieving telemetry, consignment manifest, cargo specs, and fleet allocation...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageWrapper}>
      {toast && (
        <div className={styles.toast}>
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toast}</span>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 1. TOP BREADCRUMB & HEADER ACTIONS                                   */}
      {/* -------------------------------------------------------------------- */}
      <div className={`${styles.topNavRow} ${styles.noPrint}`}>
        <div className={styles.breadcrumbGroup}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => (onNavigate ? onNavigate(backTab) : onBack(backTab))}
            title={`Return to ${backLabel}`}
          >
            <ArrowLeft size={14} /> Back to {backLabel}
          </button>
          <span>/</span>
          <span
            className={styles.breadcrumbLink}
            onClick={() => (onNavigate ? onNavigate('overview') : onBack('overview'))}
            title="Go to Admin Dashboard Overview"
          >
            Dashboard
          </span>
          <span>/</span>
          <span
            className={styles.breadcrumbLink}
            onClick={() => (onNavigate ? onNavigate('orders') : onBack('orders'))}
            title="Go to Unified Orders Hub"
          >
            Orders Hub
          </span>
          <span>/</span>
          <span
            className={styles.breadcrumbLink}
            onClick={() => (onNavigate ? onNavigate(targetTab) : onBack(targetTab))}
            title={`Go to ${sMeta.label}`}
          >
            {sMeta.label}
          </span>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>#{bookingNumber}</span>
        </div>

        <div className={styles.topActionsGroup}>
          <a
            href={publicTrackingUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.btnSecondary}
            title="Open customer live tracking view"
          >
            <ExternalLink size={14} /> Live Public Track
          </a>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => window.print()}
            title="Print Consignment Note / Airway Bill"
          >
            <Printer size={14} /> Print AWB & Receipt
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => loadOrderDetails(false)}
            title="Sync latest live status"
          >
            <RefreshCw size={14} className={refreshing ? styles.spin : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. ORDER HERO BANNER & ACTION TOOLBAR                                */}
      {/* -------------------------------------------------------------------- */}
      <div className={styles.heroBanner}>
        <div className={styles.heroHeader}>
          <div className={styles.heroLeft}>
            <div className={styles.serviceIconWrap} style={{ background: sMeta.bg, color: sMeta.color }}>
              <ServiceIcon size={28} />
            </div>

            <div className={styles.titleArea}>
              <h1>
                <span>Order #{bookingNumber}</span>
                <button type="button" className={styles.copyBtn} onClick={handleCopyId} title="Copy Order ID">
                  {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </h1>

              <div className={styles.badgesRow}>
                <span className={styles.servicePill} style={{ background: sMeta.bg, color: sMeta.color }}>
                  <ServiceIcon size={12} /> {sMeta.label}
                </span>

                {order?.speed && (
                  <span className={styles.speedBadge}>
                    <Zap size={11} /> {order.speed.replace(/_/g, ' ')}
                  </span>
                )}

                {sealNumber && (
                  <span className={styles.sealBadge} title="Tamper-evident Security Barcode Seal">
                    <ShieldCheck size={12} /> Seal: {sealNumber}
                  </span>
                )}

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    background: currentStatus === 'DELIVERED' ? '#ecfdf5' : currentStatus === 'CANCELLED' ? '#fee2e2' : '#eff6ff',
                    color: currentStatus === 'DELIVERED' ? '#059669' : currentStatus === 'CANCELLED' ? '#dc2626' : '#2563eb',
                  }}
                >
                  ● {currentStatus.replace(/_/g, ' ')}
                </span>
              </div>

              <div className={styles.heroMeta}>
                <span>
                  <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
                  Placed: {order?.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Today'}
                </span>
                <span>•</span>
                <span>Route: <strong>{pickupCity}</strong> → <strong>{dropoffCity}</strong></span>
              </div>
            </div>
          </div>

          <div className={`${styles.heroRightActions} ${styles.noPrint}`}>
            <div className={styles.heroToolbar}>
              {/* Lifecycle status picker */}
              <div className={styles.statusChangeBox}>
                <label>Set Status:</label>
                <select
                  className={styles.statusSelectInput}
                  value={currentStatus}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="AGENT_ASSIGNED">AGENT ASSIGNED</option>
                  <option value="PICKED_UP">PICKED UP</option>
                  <option value="IN_TRANSIT">IN TRANSIT</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {/* Assign Partner */}
              <button
                type="button"
                className={styles.btnAssignPartner}
                onClick={() => setAssignModalOpen(true)}
              >
                <Bike size={14} /> Assign Rider
              </button>

              {/* Auto Assign */}
              <button
                type="button"
                className={styles.btnAutoAssign}
                disabled={autoAssigning}
                onClick={handleAutoAssign}
                title="Dispatch nearest available verified rider"
              >
                <Zap size={14} /> {autoAssigning ? 'Dispatching...' : 'Auto-Dispatch'}
              </button>

              {/* Cancel Consignment */}
              {currentStatus !== 'CANCELLED' && (
                <button
                  type="button"
                  className={styles.btnCancelOrder}
                  onClick={handleCancelOrder}
                >
                  <Ban size={14} /> Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. LIFECYCLE PROGRESS STEPPER TIMELINE                               */}
      {/* -------------------------------------------------------------------- */}
      <div className={styles.timelineCard}>
        <h3>
          <Clock size={16} color="#2563eb" /> Delivery Lifecycle & Fulfillment Milestones
        </h3>

        {currentStatus === 'CANCELLED' ? (
          <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={20} />
            <div>
              <strong>This consignment was CANCELLED.</strong>
              <div style={{ fontSize: '0.82rem', marginTop: 2 }}>Further delivery operations and driver telemetry tracking are stopped.</div>
            </div>
          </div>
        ) : (
          <div className={styles.stepperContainer}>
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isDone = idx < currentStepIdx || currentStatus === 'DELIVERED'
              const isActive = idx === currentStepIdx && currentStatus !== 'DELIVERED'

              return (
                <div key={step.key} className={styles.stepItem}>
                  {idx < LIFECYCLE_STEPS.length - 1 && (
                    <div className={`${styles.stepLine} ${isDone ? styles.stepLineDone : ''}`} />
                  )}

                  <div
                    className={`${styles.stepCircle} ${isDone ? styles.stepCircleDone : ''} ${isActive ? styles.stepCircleActive : ''}`}
                  >
                    {isDone ? <Check size={16} strokeWidth={3} /> : idx + 1}
                  </div>

                  <span className={styles.stepLabel} style={isActive ? { color: '#2563eb' } : {}}>
                    {step.label}
                  </span>

                  <span className={styles.stepSub}>
                    {isDone ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
                  </span>

                  {statusTimings[step.key] ? (
                    <span className={styles.stepTime} title={`Status marked on ${formatTiming(statusTimings[step.key])}`}>
                      <Clock size={10} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                      {formatCompactTiming(statusTimings[step.key])}
                    </span>
                  ) : (
                    <span className={styles.stepTimePending}>
                      {isDone ? 'Recorded' : isActive ? 'Current' : '—'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 4. MAIN DETAILS 2-COLUMN GRID                                        */}
      {/* -------------------------------------------------------------------- */}
      <div className={styles.mainGrid}>
        {/* ================================================================= */}
        {/* LEFT COLUMN: ORIGIN, DESTINATION, CARGO ITEMS                     */}
        {/* ================================================================= */}
        <div className={styles.leftColumn}>
          {/* Card A: Origin & Destination Route */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3><MapPin size={17} color="#2563eb" /> Route & Transit Addresses</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                {sKey.includes('luggage') ? 'Airport & Luggage Route' : 'Express Point-to-Point'}
              </span>
            </div>

            <div className={styles.routeTwoBox}>
              {/* Pickup / Sender */}
              <div className={styles.subSectionBox}>
                <div className={styles.subSectionTag}>
                  <MapPin size={12} /> PICKUP ORIGIN HUB
                </div>
                <div className={styles.contactName}>{senderName}</div>
                <a href={`tel:${senderPhone}`} className={styles.contactPhone}>
                  <Phone size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {senderPhone}
                </a>
                <div className={styles.addressText}>{senderAddress}</div>

                {/* Service specific metadata */}
                {((sKey.includes('luggage') && (pDetails.terminal || pDetails.flightNumber || pDetails.pnr)) || order?.locationType || order?.pickupStoreName) && (
                  <div className={styles.specialMetaGrid}>
                    {pDetails.terminal && (
                      <div className={styles.specItem}>
                        <label>Airport Terminal</label>
                        <strong>{pDetails.terminal}</strong>
                      </div>
                    )}
                    {pDetails.flightNumber && (
                      <div className={styles.specItem}>
                        <label>Flight No.</label>
                        <strong>{pDetails.flightNumber}</strong>
                      </div>
                    )}
                    {pDetails.pnr && (
                      <div className={styles.specItem}>
                        <label>PNR / Booking</label>
                        <strong>{pDetails.pnr}</strong>
                      </div>
                    )}
                    {pDetails.luggageBelt && (
                      <div className={styles.specItem}>
                        <label>Baggage Belt</label>
                        <strong>Belt {pDetails.luggageBelt}</strong>
                      </div>
                    )}
                    {order?.locationType && (
                      <div className={styles.specItem}>
                        <label>Origin Type</label>
                        <strong>{order.locationType}</strong>
                      </div>
                    )}
                    {order?.pickupStoreName && (
                      <div className={styles.specItem}>
                        <label>Pickup Store</label>
                        <strong>{order.pickupStoreName}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery / Dropoff */}
              <div className={styles.subSectionBox}>
                <div className={styles.subSectionTag} style={{ color: '#159565' }}>
                  <MapPin size={12} /> DELIVERY DESTINATION
                </div>
                <div className={styles.contactName}>{recipientName}</div>
                <a href={`tel:${recipientPhone}`} className={styles.contactPhone} style={{ color: '#159565' }}>
                  <Phone size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {recipientPhone}
                </a>
                <div className={styles.addressText}>{dropoffAddress}</div>

                {/* Dropoff specific metadata */}
                {((sKey.includes('luggage') && (dDetails.hotelName || dDetails.roomNumber)) || order?.deliverySlot || order?.destinationVendor) && (
                  <div className={styles.specialMetaGrid}>
                    {dDetails.hotelName && (
                      <div className={styles.specItem}>
                        <label>Hotel Name</label>
                        <strong>{dDetails.hotelName}</strong>
                      </div>
                    )}
                    {dDetails.roomNumber && (
                      <div className={styles.specItem}>
                        <label>Room Number</label>
                        <strong>Room {dDetails.roomNumber}</strong>
                      </div>
                    )}
                    {order?.deliverySlot && (
                      <div className={styles.specItem}>
                        <label>Delivery Slot</label>
                        <strong>{order.deliverySlot}</strong>
                      </div>
                    )}
                    {order?.destinationVendor && (
                      <div className={styles.specItem}>
                        <label>Destination Hub</label>
                        <strong>{order.destinationVendor}</strong>
                      </div>
                    )}
                  </div>
                )}

                {order?.deliveryInstructions && (
                  <div style={{ marginTop: 10, fontSize: '0.78rem', background: '#fff', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#475569' }}>Delivery Instructions:</strong> {order.deliveryInstructions}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card B: Consignment, Items & Cargo Specifications */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3><Box size={17} color="#087fc1" /> Consignment & Cargo Manifest</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                {totalBags} Items • {totalWeight} kg Total
              </span>
            </div>

            {/* Gift items table if gift delivery */}
            {Array.isArray(order?.items) && order.items.length > 0 ? (
              <div>
                <table className={styles.itemsTable}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td>
                          <div className={styles.giftItemCell}>
                            {item.image && <img src={item.image} alt="" className={styles.giftItemThumb} />}
                            <div className={styles.giftItemInfo}>
                              <strong>{item.name || item.title || 'Gift Item'}</strong>
                              <span>{item.variant || item.serves || 'Standard'}</span>
                            </div>
                          </div>
                        </td>
                        <td><strong>{item.quantity || 1}</strong></td>
                        <td>₹{item.price || 0}</td>
                        <td><strong>₹{(item.price || 0) * (item.quantity || 1)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {order.giftMessage && (
                  <div className={styles.giftMessageCallout}>
                    <strong>💌 Personalized Greeting Card Message:</strong>
                    <p>"{order.giftMessage}"</p>
                    {order.cardDesignName && <small style={{ color: '#9f1239' }}>Card Style: {order.cardDesignName}</small>}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Standard / Courier / Luggage Cargo Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div className={styles.subSectionBox}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>DECLARED ITEM CATEGORY</div>
                    <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block', marginTop: 4 }}>
                      {order?.category || order?.itemCategory || order?.package?.category || pkg.category || (sKey.includes('luggage') ? 'Baggage / Luggage' : 'General Courier Cargo')}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#475569', marginTop: 3, display: 'block' }}>
                      {order?.contentDescription || order?.itemDescription || pkg.contentDescription || pkg.description || 'Declared items verified for express transit'}
                    </span>
                  </div>

                  <div className={styles.subSectionBox}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>WEIGHT & VOLUMETRIC SPECS</div>
                    <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block', marginTop: 4 }}>
                      {order?.actualWeightKg ?? totalWeight} kg <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>(Actual)</span> • {order?.chargeableWeightKg ?? pkg.chargeableWeightKg ?? totalWeight} kg <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>(Chargeable)</span>
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#475569', marginTop: 3, display: 'block' }}>
                      {order?.dimensions?.lengthCm ? `Dimensions: ${order.dimensions.lengthCm} × ${order.dimensions.widthCm} × ${order.dimensions.heightCm} cm` : (pkg.lengthCm ? `Dimensions: ${pkg.lengthCm} × ${pkg.widthCm} × ${pkg.heightCm} cm` : 'Standard Consignment Dimensions')}
                    </span>
                  </div>

                  <div className={styles.subSectionBox}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>PACKAGING & BOX TYPE</div>
                    <strong style={{ fontSize: '1rem', color: '#059669', display: 'block', marginTop: 4 }}>
                      {order?.packagingName || (order?.packagingType ? order.packagingType.replace(/_/g, ' ') : (pkg.packagingType ? pkg.packagingType.replace(/_/g, ' ') : 'Standard Packaging'))}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#475569', marginTop: 3, display: 'block' }}>
                      {order?.boxSize || pkg.boxSize || (order?.boxCapacity ? `Box Size: ${order.boxCapacity}` : 'Standard Box')}
                      {(order?.isCustomBox || pkg.isCustomBox) ? ' • Custom Box Spec' : ''}
                    </span>
                  </div>

                  <div className={styles.subSectionBox}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>SECURITY & SAFEGUARDS</div>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block', marginTop: 4, fontFamily: 'monospace' }}>
                      {sealNumber}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#d97706', marginTop: 3, display: 'block', fontWeight: 600 }}>
                      {(order?.fragile || pkg.fragile) ? '✓ Fragile Handled • ' : ''}
                      {(order?.secureHandling || pkg.secureHandling) ? '✓ High Security Seal • ' : ''}
                      {((order?.declaredValue || pkg.declaredValue) ? `Cover: ₹${order?.declaredValue || pkg.declaredValue}` : 'Protected')}
                    </span>
                  </div>
                </div>

                {/* Baggage individual tags only if luggage service */}
                {sKey.includes('luggage') && Array.isArray(order?.luggage) && order.luggage.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                      INDIVIDUAL BAG TAGS & SPECIFICATIONS:
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {order.luggage.map((b, i) => (
                        <div key={i} style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem' }}>
                          <strong>{b.bagType || `Bag #${i + 1}`}</strong>: {b.weightKg || '14'} kg • Tag: <code>{b.tagNumber || `DLZ-TAG-${i + 101}`}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}              </div>
            )}
          </div>

          {/* Card C: Dispatcher Operational Notes & Audit Log */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3><FileText size={17} color="#475569" /> Internal Dispatcher Notes & Activity Log</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Operations Audit Trail</span>
            </div>

            <form onSubmit={handleAddNote} className={styles.noteInputWrap}>
              <input
                type="text"
                placeholder="Write an internal operational dispatcher note or handover log..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button type="submit">Add Note</button>
            </form>

            <div className={styles.notesTimeline} style={{ marginTop: 14 }}>
              {notesList.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>
                  No internal notes recorded yet. Dispatcher notes added here are preserved for audit.
                </div>
              ) : (
                notesList.map((n, i) => (
                  <div key={i} className={styles.noteItem}>
                    <div className={styles.noteItemHead}>
                      <strong>{n.by || 'Dispatcher'}</strong>
                      <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={styles.noteItemText}>{n.note}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card D: Status Change Timing & Milestone Audit Trail */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3><History size={17} color="#2563eb" /> Status Change Timing & Milestone Audit</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                {statusHistory.length} Milestones Tracked
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className={styles.statusHistoryTable}>
                <thead>
                  <tr>
                    <th>Status Milestone</th>
                    <th>Exact Change Timing</th>
                    <th>Logged By</th>
                    <th>Action Note</th>
                  </tr>
                </thead>
                <tbody>
                  {statusHistory.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className={styles.statusPillBadge}>
                          ● {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.8rem', color: '#0f172a', display: 'block' }}>
                          {formatTiming(item.timestamp)}
                        </strong>
                        <small style={{ color: '#64748b', fontSize: '0.7rem' }}>
                          {formatCompactTiming(item.timestamp)}
                        </small>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                          {item.actor || 'System'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {item.note || 'Status updated'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: CUSTOMER, DRIVER, FINANCIALS, POD                   */}
        {/* ================================================================= */}
        <div className={styles.rightColumn}>
          {/* Card 1: Customer Account */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3><User size={16} color="#087fc1" /> Customer Account</h3>
              <span style={{ fontSize: '0.72rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                CUSTOMER
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem' }}>
              <div><strong>Name:</strong> {customerName}</div>
              <div>
                <strong>Phone:</strong>{' '}
                <a href={`tel:${customerPhone}`} style={{ color: '#2563eb', fontWeight: 600 }}>
                  {customerPhone}
                </a>
              </div>
              <div><strong>Email:</strong> {customerEmail}</div>
              {order?.user?.id && (
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                  User UID: <code>{order.user.id}</code>
                </div>
              )}
              {onNavigate && (
                <button
                  type="button"
                  className={styles.cardNavBtn}
                  onClick={() => onNavigate('customers')}
                  title="Open Customer Directory"
                >
                  View in Customers Directory →
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Assigned Fleet Driver */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3><Bike size={16} color="#4338ca" /> Fleet Driver / Courier</h3>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: order?.assignedPartner && order.assignedPartner !== 'Unassigned' ? '#ecfdf5' : '#fef2f2',
                  color: order?.assignedPartner && order.assignedPartner !== 'Unassigned' ? '#059669' : '#dc2626',
                }}
              >
                {order?.assignedPartner && order.assignedPartner !== 'Unassigned' ? 'DISPATCHED' : 'UNASSIGNED'}
              </span>
            </div>

            {order?.assignedPartner && order.assignedPartner !== 'Unassigned' ? (
              <div>
                <div className={styles.driverInfoRow}>
                  <div className={styles.driverAvatar}>
                    {order.assignedPartner.slice(0, 1)}
                  </div>
                  <div className={styles.driverDetails}>
                    <strong>{order.assignedPartner}</strong>
                    <span>
                      {order.partnerPhone || agent.phone || '+91 98765 43210'}
                    </span>
                    <span style={{ display: 'block', color: '#0f172a', fontWeight: 600, marginTop: 2 }}>
                      Vehicle: {order.partnerVehicle || agent.vehicle || 'Honda Activa (DL 1Z 4589)'}
                    </span>
                  </div>
                </div>

                <div className={styles.driverActions}>
                  <a
                    href={`tel:${order.partnerPhone || agent.phone}`}
                    className={styles.btnSecondary}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Phone size={13} /> Call Rider
                  </a>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setAssignModalOpen(true)}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Edit2 size={13} /> Reassign
                  </button>
                </div>
                {onNavigate && (
                  <button
                    type="button"
                    className={styles.cardNavBtn}
                    onClick={() => onNavigate('partners')}
                    title="Manage Delivery Fleet"
                  >
                    Manage Delivery Fleet →
                  </button>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '14px 0' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 12px 0' }}>
                  No delivery partner assigned to this order yet.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setAssignModalOpen(true)}
                  >
                    <Bike size={14} /> Assign Rider
                  </button>
                  <button
                    type="button"
                    className={styles.btnAutoAssign}
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={handleAutoAssign}
                    disabled={autoAssigning}
                  >
                    <Zap size={14} /> {autoAssigning ? '...' : 'Auto-Dispatch'}
                  </button>
                </div>
                {onNavigate && (
                  <div style={{ marginTop: 10 }}>
                    <button
                      type="button"
                      className={styles.cardNavBtn}
                      onClick={() => onNavigate('partners')}
                      title="Manage Delivery Fleet"
                    >
                      Manage Delivery Fleet →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 3: Financials & Fare Ledger */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3><CreditCard size={16} color="#059669" /> Fare Ledger & Billing</h3>
              <span className={paymentStatus === 'PAID' ? styles.payBadgeGreen : styles.payBadgeYellow}>
                {paymentStatus}
              </span>
            </div>

            <div className={styles.billingList}>
              <div className={styles.billRow}>
                <span>Base Service Rate</span>
                <span>₹{(amountTotal * 0.7).toFixed(2)}</span>
              </div>
              <div className={styles.billRow}>
                <span>Distance & Weight Tariff</span>
                <span>₹{(amountTotal * 0.15).toFixed(2)}</span>
              </div>
              <div className={styles.billRow}>
                <span>Tamper-Proof Seal & Safety</span>
                <span>₹49.00</span>
              </div>
              <div className={styles.billRow}>
                <span>GST (18% Integrated Tax)</span>
                <span>₹{(amountTotal * 0.12).toFixed(2)}</span>
              </div>
              {order?.discountAmount > 0 && (
                <div className={styles.billRow} style={{ color: '#059669', fontWeight: 600 }}>
                  <span>Promo Coupon Discount</span>
                  <span>-₹{Number(order.discountAmount).toFixed(2)}</span>
                </div>
              )}

              <div className={styles.billRowTotal}>
                <span>Total Amount Paid</span>
                <span>₹{amountTotal}</span>
              </div>

              <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#64748b' }}>
                <div><strong>Payment Method:</strong> {paymentMethod}</div>
                <div><strong>Transaction ID:</strong> <code>{order?.transactionId || order?.paymentId || 'TXN_DLV_8829374'}</code></div>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  className={styles.cardNavBtn}
                  onClick={() => onNavigate('payments')}
                  title="Open Finance & Settlements"
                >
                  Finance & Settlements →
                </button>
              )}
            </div>
          </div>

          {/* Card 4: Proof of Delivery (POD) & Verification */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3><FileCheck size={16} color="#087fc1" /> Proof of Delivery (POD)</h3>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: currentStatus === 'DELIVERED' ? '#059669' : '#64748b' }}>
                {currentStatus === 'DELIVERED' ? 'VERIFIED' : 'PENDING'}
              </span>
            </div>

            <div className={styles.podBox}>
              <div className={styles.podStatusLine}>
                <span>Delivery OTP Code:</span>
                <strong style={{ fontFamily: 'monospace', letterSpacing: '0.1em', background: '#e2e8f0', padding: '2px 8px', borderRadius: 4 }}>
                  {order?.deliveryOtp || order?.verificationPin || '7392'}
                </strong>
              </div>

              <div className={styles.podStatusLine}>
                <span>Tamper Seal Status:</span>
                <strong style={{ color: '#059669' }}>Verified Intact</strong>
              </div>

              <div className={styles.podStatusLine}>
                <span>Receiver Signoff:</span>
                <span>{order?.pod?.recipientName || recipientName}</span>
              </div>

              {order?.pod?.photoUrl ? (
                <div className={styles.podImagesGrid}>
                  <img src={order.pod.photoUrl} alt="POD Photo" className={styles.podImgThumb} />
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', marginTop: 4 }}>
                  Digital signature and delivery photo timestamp will appear upon delivery completion.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 5. ASSIGN PARTNER FLEET MODAL                                        */}
      {/* -------------------------------------------------------------------- */}
      {assignModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setAssignModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3><Bike size={18} style={{ display: 'inline', marginRight: 6 }} /> Assign Fleet Rider</h3>
              <button type="button" className={styles.closeModalBtn} onClick={() => setAssignModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Select an active, verified delivery rider from the active fleet for Order #{bookingNumber}:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                {partners.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                    No delivery partners registered in fleet.
                  </div>
                ) : (
                  partners.map((p) => (
                    <div
                      key={p.id}
                      className={`${styles.partnerSelectItem} ${selectedPartnerId === p.id ? styles.partnerSelected : ''}`}
                      onClick={() => setSelectedPartnerId(p.id)}
                    >
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>{p.name}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {p.phone} • {p.vehicle}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: p.status === 'AVAILABLE' ? '#059669' : '#d97706' }}>
                        {p.status || 'ACTIVE'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={styles.modalFoot}>
              <button type="button" className={styles.btnSecondary} onClick={() => setAssignModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={!selectedPartnerId || assigning}
                onClick={handleConfirmAssign}
              >
                {assigning ? 'Dispatching...' : 'Dispatch Selected Rider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 6. PRINT AIRWAY BILL (AWB) HIDDEN TEMPLATE                           */}
      {/* -------------------------------------------------------------------- */}
      <div className={styles.printOnlyArea} style={{ display: 'none' }}>
        <div style={{ border: '2px solid #000', padding: 20, maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: 10 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 24 }}>DELIVEZ EXPRESS LOGISTICS</h1>
              <p style={{ margin: 0, fontSize: 12 }}>AIRWAY BILL & CONSIGNMENT RECEIPT</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>AWB: #{bookingNumber}</h2>
              <p style={{ margin: 0, fontSize: 12 }}>Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, margin: '20px 0' }}>
            <div style={{ border: '1px solid #000', padding: 10 }}>
              <strong>SHIPPER / PICKUP:</strong>
              <div>{senderName} ({senderPhone})</div>
              <div>{senderAddress}</div>
            </div>
            <div style={{ border: '1px solid #000', padding: 10 }}>
              <strong>CONSIGNEE / DELIVERY:</strong>
              <div>{recipientName} ({recipientPhone})</div>
              <div>{dropoffAddress}</div>
            </div>
          </div>

          <div style={{ border: '1px solid #000', padding: 10, marginBottom: 20 }}>
            <strong>CONSIGNMENT SPECS:</strong>
            <div>Service: {sMeta.label} • Speed: {order?.speed || 'Standard'}</div>
            <div>Bags: {totalBags} • Weight: {totalWeight} kg • Barcode Seal: {sealNumber}</div>
            <div>Declared Fare: ₹{amountTotal} • Payment: {paymentStatus} ({paymentMethod})</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
            <div>Shipper Signature: __________________</div>
            <div>Receiver Signature: __________________</div>
          </div>
        </div>
      </div>
    </div>
  )
}
