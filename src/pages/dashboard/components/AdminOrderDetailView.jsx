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
  History,
  GitFork,
  Briefcase,
  Repeat,
  ShieldAlert,
  Share2,
  Key,
  FileSpreadsheet,
  Paperclip,
  CheckSquare,
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
  updateAdminLuggageStatus,
  updateAdminForgotStatus,
  updateAdminReturnStatus,
  recordOrderStatusTimingApi,
  updateOrderStatusByOrderId,
  cancelOrderByOrderId,
} from '@/features/admin-management/services/adminManagementService.js'
import {
  updateAdminGiftOrderStatus,
  cancelAdminGiftOrder,
} from '@/features/admin-gift-delivery/services/adminGiftDeliveryService.js'
import styles from './AdminOrderDetailView.module.css'

export const VAULT_SERVICES_ORDER_MAP = {
  VAULT_SECURE: { title: 'Vault Secure', desc: 'Standard secure delivery with full verification and chain of custody.', time: '1-2 Days', icon: Shield },
  VAULT_PRIORITY: { title: 'Vault Priority', desc: 'Faster delivery with priority handling and dedicated partners.', time: 'Same / Next Day', icon: Zap },
  VAULT_DIRECT: { title: 'Vault Direct', desc: 'Point-to-point delivery with no stops in between. Maximum confidentiality.', time: '1-2 Days', icon: GitFork },
  VAULT_PRECISE: { title: 'Vault Precise', desc: 'Deliver at a specific date and time window of your choice.', time: 'Scheduled', icon: Calendar },
  VAULT_HAND_CARRY: { title: 'Vault Hand Carry', desc: 'Dedicated hand carry by authorized executive for highest priority items.', time: '1-2 Days', icon: Briefcase },
  VAULT_RETURN: { title: 'Vault Return', desc: 'Deliver and collect signed or processed documents and return to sender.', time: '1-3 Days', icon: RotateCcw },
  VAULT_EXCHANGE: { title: 'Vault Exchange', desc: 'Two-way document or item exchange in a single trip.', time: '1-3 Days', icon: Repeat },
  VAULT_CRITICAL: { title: 'Vault Critical', desc: 'Highest level of security with armed escort and real-time monitoring.', time: 'Same Day', icon: ShieldAlert },
  VAULT_MULTIPOINT: { title: 'Vault MultiPoint', desc: 'Multiple secure stops in a single journey with optimized routing.', time: '1-3 Days', icon: Share2 },
}

export function resolveVaultOrderService(order) {
  if (!order) return VAULT_SERVICES_ORDER_MAP.VAULT_SECURE
  const sKey = String(order.vaultServiceKey || '').toUpperCase()
  if (VAULT_SERVICES_ORDER_MAP[sKey]) return VAULT_SERVICES_ORDER_MAP[sKey]
  const sType = String(order.serviceType || order.vaultServiceType || '').toLowerCase()
  const desc = String(order.documentDescription || '').toLowerCase()

  if (sType.includes('multipoint') || desc.includes('multipoint')) return VAULT_SERVICES_ORDER_MAP.VAULT_MULTIPOINT
  if (sType.includes('critical') || desc.includes('critical') || desc.includes('armed')) return VAULT_SERVICES_ORDER_MAP.VAULT_CRITICAL
  if (sType.includes('exchange') || desc.includes('exchange')) return VAULT_SERVICES_ORDER_MAP.VAULT_EXCHANGE
  if (sType.includes('return') || desc.includes('return') || order.requiresReturn) return VAULT_SERVICES_ORDER_MAP.VAULT_RETURN
  if (sType.includes('hand carry') || desc.includes('hand carry')) return VAULT_SERVICES_ORDER_MAP.VAULT_HAND_CARRY
  if (sType.includes('precise') || desc.includes('precise') || order.scheduleType === 'SCHEDULED') return VAULT_SERVICES_ORDER_MAP.VAULT_PRECISE
  if (sType.includes('direct') || desc.includes('direct')) return VAULT_SERVICES_ORDER_MAP.VAULT_DIRECT
  if (sType.includes('priority') || desc.includes('priority') || order.deliverySpeed === 'PRIORITY') return VAULT_SERVICES_ORDER_MAP.VAULT_PRIORITY
  return VAULT_SERVICES_ORDER_MAP.VAULT_SECURE
}

const SERVICE_META = {
  'gift-delivery': { label: 'Gift & Surprise Delivery', icon: Gift, color: '#e11d48', bg: '#ffe4e6' },
  'personal-courier': { label: 'Personal Courier', icon: Truck, color: '#2563eb', bg: '#eff6ff' },
  'courier-delivery': { label: 'Personal Courier', icon: Truck, color: '#2563eb', bg: '#eff6ff' },
  'luggage-delivery': { label: 'Luggage Delivery', icon: Luggage, color: '#d97706', bg: '#fef3c7' },
  'airport-luggage': { label: 'Luggage Delivery', icon: Luggage, color: '#d97706', bg: '#fef3c7' },
  'confidential-delivery': { label: 'Delivez Vault (Confidential)', icon: ShieldCheck, color: '#dc2626', bg: '#fef2f2' },
  'confidential-courier': { label: 'Delivez Vault (Confidential)', icon: ShieldCheck, color: '#dc2626', bg: '#fef2f2' },
  'forgot-something': { label: 'Forgot Something', icon: ShoppingBag, color: '#7c3aed', bg: '#f5f3ff' },
  'return-pickup': { label: 'Return Pickup', icon: RotateCcw, color: '#059669', bg: '#ecfdf5' },
}

const LIFECYCLE_STEPS = [
  { key: 'CONFIRMED', label: 'Order Placed' },
  { key: 'AGENT_ASSIGNED', label: 'Rider Assigned' },
  { key: 'PICKED_UP', label: 'Picked Up' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
]

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
  order: initialOrder,
  orderId: propOrderId,
  serviceKey: propServiceKey,
  onBack,
  onNavigate,
  fromTab,
}) {
  const rawId = initialOrder?.id || initialOrder?.bookingNumber || propOrderId
  const orderId = rawId
  const serviceKey = propServiceKey || initialOrder?.serviceKey || 'courier-delivery'

  const [order, setOrder] = useState(initialOrder || null)
  const [loading, setLoading] = useState(!initialOrder)
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState('')
  const [copied, setCopied] = useState('')
  const [partners, setPartners] = useState([])
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedPartnerId, setSelectedPartnerId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [autoAssigning, setAutoAssigning] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [notesList, setNotesList] = useState([])

  const bookingNumber = order?.bookingNumber || initialOrder?.bookingNumber || orderId

  // Live status timing tracking
  const [statusTimings, setStatusTimings] = useState(() => {
    const fromOrder = order?.statusTimestamps || {}
    const stored = getStoredTimings(rawId) || getStoredTimings(bookingNumber)
    return {
      CONFIRMED: order?.createdAt || stored.CONFIRMED || new Date().toISOString(),
      ...stored,
      ...fromOrder,
    }
  })

  // Status audit history list
  const [statusHistory, setStatusHistory] = useState(() => {
    if (Array.isArray(order?.statusHistory) && order.statusHistory.length > 0) {
      return order.statusHistory
    }
    const stored = getStoredTimings(rawId) || getStoredTimings(bookingNumber)
    if (Array.isArray(stored?.history)) {
      return stored.history
    }
    return [
      {
        status: order?.status || 'CONFIRMED',
        timestamp: order?.createdAt || new Date().toISOString(),
        actor: 'System Inception',
        note: 'Consignment booking created in PostgreSQL database',
      },
    ]
  })

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const handleCopyId = (val, key = 'id') => {
    const textToCopy = val || bookingNumber
    if (!textToCopy) return
    navigator.clipboard.writeText(String(textToCopy))
    setCopied(key)
    showToast(`Copied ${textToCopy} to clipboard`)
    setTimeout(() => setCopied(''), 2000)
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

  // Handle Status Update
  const handleStatusUpdate = async (newStatus) => {
    try {
      const nowIso = new Date().toISOString()
      const newTimingMap = { ...statusTimings, [newStatus]: nowIso }
      const newHistoryItem = {
        status: newStatus,
        timestamp: nowIso,
        actor: 'Admin Dispatcher',
        note: `Consignment operational status updated to ${newStatus}`,
      }
      const newHistoryList = [newHistoryItem, ...statusHistory]

      const timingPayload = {
        serviceKey: sKey,
        status: newStatus,
        timestamp: nowIso,
        statusChangedAt: nowIso,
        statusTimestamps: newTimingMap,
        statusHistory: newHistoryList,
        notes: `Operational status updated to ${newStatus}`,
      }

      if (sKey === 'gift-delivery' || sKey === 'gift-and-surprise') {
        await updateAdminGiftOrderStatus(rawId, newStatus)
      } else if (sKey === 'luggage-delivery' || sKey === 'airport-luggage' || sKey === 'luggage' || String(bookingNumber).startsWith('DLVZ')) {
        await updateAdminLuggageStatus(rawId, newStatus, timingPayload)
      } else if (sKey === 'confidential-delivery' || sKey === 'confidential-courier' || sKey === 'vault' || String(bookingNumber).startsWith('CV') || String(bookingNumber).startsWith('DV')) {
        await updateAdminConfidentialStatus(rawId, newStatus, timingPayload)
      } else if (sKey === 'forgot-something' || sKey === 'forgot') {
        await updateAdminForgotStatus(rawId, newStatus, timingPayload)
      } else if (sKey === 'return-pickup' || sKey === 'returns') {
        await updateAdminReturnStatus(rawId, newStatus, timingPayload)
      } else if (sKey === 'personal-courier' || sKey === 'courier-delivery' || sKey === 'courier') {
        await updateAdminCourierStatus(rawId, newStatus, timingPayload)
      } else {
        await updateOrderStatusUnified(sKey, rawId, newStatus, timingPayload)
      }

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
      showToast(`Consignment status updated to ${newStatus}`)
    } catch (err) {
      alert(err.message || 'Failed to update order status.')
    }
  }

  // Handle Assign Partner
  const handleAssignPartner = async () => {
    if (!selectedPartnerId) {
      alert('Please select a verified partner rider.')
      return
    }
    const partner = partners.find((p) => p.id === selectedPartnerId)
    setAssigning(true)
    try {
      const nowIso = new Date().toISOString()
      const newTimingMap = { ...statusTimings, AGENT_ASSIGNED: nowIso }
      const newHistoryItem = {
        status: 'AGENT_ASSIGNED',
        timestamp: nowIso,
        actor: 'Admin Dispatcher',
        note: `Allocated to courier executive: ${partner?.name || partner?.fullName || 'Verified Rider'}`,
      }
      const newHistoryList = [newHistoryItem, ...statusHistory]

      const timingPayload = {
        partnerId: selectedPartnerId,
        partnerName: partner?.name || partner?.fullName || 'Allocated Partner',
        partnerPhone: partner?.phone || partner?.mobileNumber || '+91 98765 43210',
        partnerVehicle: partner?.vehicle || 'Delivery Van KA-01-EA-5542',
        status: 'AGENT_ASSIGNED',
        statusTimestamps: newTimingMap,
        statusHistory: newHistoryList,
        timestamp: nowIso,
        actor: 'Admin Dispatcher',
        note: `Manually dispatched verified partner ${partner?.name || partner?.fullName}`,
      }

      await assignPartnerToOrder(sKey, rawId, partner || {}, timingPayload)

      setStatusTimings(newTimingMap)
      setStatusHistory(newHistoryList)
      saveStoredTimings(rawId, newTimingMap, newHistoryList)
      saveStoredTimings(bookingNumber, newTimingMap, newHistoryList)

      setOrder((prev) => ({
        ...prev,
        assignedPartner: partner?.name || partner?.fullName || 'Allocated Partner',
        partnerPhone: partner?.phone || partner?.mobileNumber,
        partnerVehicle: partner?.vehicle,
        status: 'AGENT_ASSIGNED',
        statusTimestamps: newTimingMap,
        statusHistory: newHistoryList,
      }))

      setAssignModalOpen(false)
      showToast(`Assigned partner ${partner?.name || partner?.fullName} to order #${bookingNumber}`)
    } catch (err) {
      alert(err.message || 'Failed to assign delivery partner.')
    } finally {
      setAssigning(false)
    }
  }

  // Handle Smart Auto Assign
  const handleAutoAssign = async () => {
    setAutoAssigning(true)
    try {
      const nowIso = new Date().toISOString()
      const newTimingMap = { ...statusTimings, AGENT_ASSIGNED: nowIso }
      const newHistoryItem = {
        status: 'AGENT_ASSIGNED',
        timestamp: nowIso,
        actor: 'Smart Auto-Dispatch Engine',
        note: 'Auto-dispatched nearest verified fleet partner via GPS routing',
      }
      const newHistoryList = [newHistoryItem, ...statusHistory]

      const timingPayload = {
        status: 'AGENT_ASSIGNED',
        timestamp: nowIso,
        actor: 'Smart Auto-Dispatch Engine',
        statusTimestamps: newTimingMap,
        statusHistory: newHistoryList,
      }

      const res = await autoAssignOrderUnified(sKey, rawId, timingPayload)
      const data = res?.data || {}

      const updated = {
        assignedPartner: data?.partnerName || data?.assignedPartner || 'Fleet Partner',
        partnerPhone: data?.partnerPhone || '+91 98765 43210',
        partnerVehicle: data?.partnerVehicle || 'Delivery Van',
        status: data?.updatedStatus || 'AGENT_ASSIGNED',
        statusTimestamps: newTimingMap,
        statusHistory: newHistoryList,
      }

      setStatusTimings(newTimingMap)
      setStatusHistory(newHistoryList)
      saveStoredTimings(rawId, newTimingMap, newHistoryList)
      saveStoredTimings(bookingNumber, newTimingMap, newHistoryList)

      setOrder((prev) => ({ ...prev, ...updated }))
      showToast(`⚡ Auto-dispatched ${updated.assignedPartner} to order #${bookingNumber}`)
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
  const pickupAddr =
    order?.pickup ||
    (Array.isArray(order?.addresses)
      ? order.addresses.find((a) => a.kind === 'PICKUP' || a.type === 'PICKUP')
      : null) ||
    order?.addresses?.[0] ||
    {}
  const dropoffAddr =
    order?.dropoff ||
    (Array.isArray(order?.addresses)
      ? order.addresses.find((a) => a.kind === 'DROPOFF' || a.type === 'DROPOFF')
      : null) ||
    order?.addresses?.[1] ||
    {}
  const pDetails = order?.pickupDetails || {}
  const dDetails = order?.deliveryDetails || {}
  const pkg = order?.package || {}
  const agent = order?.agent || {}

  // Luggage & Vault rich objects
  const flight = order?.flightDetails || pDetails.airport_specific || dDetails.airport_specific || {}
  const hotel = order?.hotelDetails || pDetails.hotel_specific || dDetails.hotel_specific || {}
  const vaultObj = order?.vault || null
  const pricing = order?.pricingBreakdown || order?.pricing || null
  const gst = order?.gstInvoice || (vaultObj?.pickup?.gstin ? { gstin: vaultObj.pickup.gstin, company_name: vaultObj.pickup.companyOrganization } : null)
  const pickupOtp = order?.pickupOtp || order?.pickup_otp || null
  const deliveryOtp = order?.deliveryOtp || order?.delivery_otp || null

  // Customer details
  const customerName = order?.user?.fullName || order?.customerName || pDetails.contact?.full_name || pDetails.name || pickupAddr.contactName || 'Valued Customer'
  const customerPhone = order?.user?.mobileNumber || order?.customerPhone || pDetails.contact?.mobile || pDetails.phone || pickupAddr.phoneNumber || '—'
  const customerEmail = order?.user?.email || order?.customerEmail || pDetails.contact?.email || '—'

  // Pickup Details
  const senderName =
    pDetails.contact?.full_name ||
    pDetails.name ||
    vaultObj?.pickup?.contactName ||
    pickupAddr.contactName ||
    order?.pickupContactName ||
    customerName

  const senderPhone =
    pDetails.contact?.mobile ||
    pDetails.phone ||
    vaultObj?.pickup?.mobileNumber ||
    (pickupAddr.phoneNumber ? `${pickupAddr.countryCode || '+91'} ${pickupAddr.phoneNumber}`.trim() : null) ||
    order?.pickupPhone ||
    customerPhone

  const senderAddress =
    pDetails.full_address ||
    pDetails.address ||
    vaultObj?.pickup?.completePickupAddress ||
    order?.pickupAddress ||
    [pickupAddr.addressLine1, pickupAddr.addressLine2, pickupAddr.landmark, pickupAddr.city, pickupAddr.state, pickupAddr.postalCode, pickupAddr.country]
      .filter(Boolean)
      .join(', ') ||
    'Origin Address on file'
  const pickupCity = pDetails.city || vaultObj?.pickup?.city || pickupAddr.city || order?.pickupCity || 'Bengaluru Hub'

  // Dropoff Details
  const recipientName =
    dDetails.contact?.full_name ||
    dDetails.name ||
    hotel.guestName ||
    hotel.guest_name ||
    vaultObj?.delivery?.contactName ||
    order?.recipientName ||
    order?.dropoffRecipientName ||
    dropoffAddr.contactName ||
    'Consignee Recipient'

  const recipientPhone =
    dDetails.contact?.mobile ||
    dDetails.phone ||
    vaultObj?.delivery?.mobileNumber ||
    (dropoffAddr.phoneNumber ? `${dropoffAddr.countryCode || '+91'} ${dropoffAddr.phoneNumber}`.trim() : null) ||
    order?.recipientPhone ||
    order?.dropoffPhone ||
    '—'

  const dropoffAddress =
    dDetails.full_address ||
    dDetails.address ||
    hotel.hotelName ||
    hotel.hotel_name ||
    vaultObj?.delivery?.completeDeliveryAddress ||
    order?.destination ||
    order?.dropoffAddress ||
    order?.deliveryAddress ||
    [dropoffAddr.addressLine1, dropoffAddr.addressLine2, dropoffAddr.landmark, dropoffAddr.city, dropoffAddr.state, dropoffAddr.postalCode, dropoffAddr.country]
      .filter(Boolean)
      .join(', ') ||
    'Destination Address on file'
  const dropoffCity = dDetails.city || vaultObj?.delivery?.city || dropoffAddr.city || order?.deliveryCity || order?.dropoffCity || 'Hub'

  // Financials
  const amountTotal = Number(
    order?.totalAmount ?? order?.amount ?? order?.totalFare ?? 1499
  ).toFixed(2)
  const paymentMethod = order?.paymentMethod || 'Online (UPI / Razorpay)'
  const paymentStatus = (order?.paymentStatus || 'PAID').toUpperCase()

  // Baggage & Weight Specs
  const luggageItemsList = Array.isArray(order?.luggageItems)
    ? order.luggageItems
    : (Array.isArray(order?.luggage) ? order.luggage : [])
  const totalBags = order?.totalBags || (luggageItemsList.length > 0 ? luggageItemsList.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0) : 1)
  const totalWeight = order?.totalWeightKg || (luggageItemsList.length > 0 ? luggageItemsList.reduce((acc, it) => acc + (Number(it.declared_weight_kg || it.weight || 0) * (Number(it.quantity) || 1)), 0) : (pkg.actualWeightKg || order?.weightKg || 15))
  const sealNumber = order?.sealNumber || order?.tamperSealNumber || 'DLV-SEAL-88492'

  // Assigned Driver details
  const driverName = order?.driverDetails?.name || order?.assignedPartner || agent.name || null
  const driverPhone = order?.driverDetails?.phone || order?.partnerPhone || agent.phone || null
  const driverVehicle = order?.driverDetails?.vehicle_number || order?.driverDetails?.vehicle_type || order?.partnerVehicle || agent.vehicle || null

  // Live Tracking Link
  const publicTrackingUrl = useMemo(() => {
    const rawNum = String(bookingNumber || orderId || '').replace(/^#/, '')
    if (!rawNum) return '/track'
    if (sKey.includes('gift')) return `/track/gift-delivery/${encodeURIComponent(rawNum)}`
    if (sKey.includes('confidential') || sKey.includes('vault')) return `/vault/track/${encodeURIComponent(rawNum)}`
    return `/track/${encodeURIComponent(rawNum)}`
  }, [bookingNumber, orderId, sKey])

  const targetTab = useMemo(() => {
    if (sKey.includes('courier')) return 'courier'
    if (sKey.includes('luggage')) return 'luggage'
    if (sKey.includes('confidential') || sKey.includes('vault')) return 'confidential'
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
                <button type="button" className={styles.copyBtn} onClick={() => handleCopyId(bookingNumber, 'orderId')} title="Copy Order ID">
                  {copied === 'orderId' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  <span>{copied === 'orderId' ? 'Copied' : 'Copy'}</span>
                </button>
              </h1>

              <div className={styles.badgesRow}>
                <span className={styles.servicePill} style={{ background: sMeta.bg, color: sMeta.color }}>
                  <ServiceIcon size={12} /> {order?.routeTitle || sMeta.label}
                </span>

                {/* Luggage specific badges */}
                {sKey.includes('luggage') && (
                  <>
                    {flight.flight_number && (
                      <span className={styles.speedBadge} style={{ background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' }}>
                        <Plane size={11} /> {flight.airline_name ? `${flight.airline_name} ` : ''}{flight.flight_number}
                      </span>
                    )}
                    {flight.pnr && (
                      <span className={styles.speedBadge} style={{ background: '#F8FAFC', color: '#0F172A', borderColor: '#E2E8F0' }}>
                        PNR: {flight.pnr}
                      </span>
                    )}
                    {flight.terminal && (
                      <span className={styles.speedBadge} style={{ background: '#FEF3C7', color: '#B45309', borderColor: '#FDE68A' }}>
                        {flight.terminal}
                      </span>
                    )}
                    <span className={styles.sealBadge} title="Baggage Count & Total Weight">
                      <Luggage size={12} /> {totalBags} Bag{totalBags > 1 ? 's' : ''} ({totalWeight} kg)
                    </span>
                  </>
                )}

                {/* Vault specific badges */}
                {(sKey.includes('confidential') || sKey.includes('vault')) && (
                  <>
                    <span className={styles.speedBadge} style={{ background: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A' }}>
                      <Shield size={11} /> {order?.vaultServiceType || 'Vault Priority'}
                    </span>
                    {vaultObj?.security?.armedEscort && (
                      <span className={styles.speedBadge} style={{ background: '#FEE2E2', color: '#DC2626', borderColor: '#FECACA' }}>
                        <ShieldAlert size={11} /> Armed Escort Active
                      </span>
                    )}
                  </>
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
                  <option value="BOOKING_CONFIRMED">BOOKING CONFIRMED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="AGENT_ASSIGNED">AGENT ASSIGNED</option>
                  <option value="PICKUP_IN_PROGRESS">PICKUP IN PROGRESS</option>
                  <option value="PICKED_UP">PICKED UP</option>
                  <option value="LUGGAGE_PICKED">LUGGAGE PICKED</option>
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
                    <span className={styles.stepTimePending}>Pending</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 4. MAIN TWO-COLUMN WORKSPACE                                         */}
      {/* -------------------------------------------------------------------- */}
      <div className={styles.mainGrid}>
        {/* ================================================================= */}
        {/* LEFT COLUMN: ROUTE, CARGO MANIFEST, ACTIVITY LOG, AUDIT TIMELINE  */}
        {/* ================================================================= */}
        <div className={styles.leftColumn}>
          {/* Card A: Route & Transit Addresses */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3><MapPin size={17} color="#2563eb" /> Route & Transit Addresses</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                {sKey.includes('luggage') ? 'Airport & Luggage Route' : (sKey.includes('confidential') || sKey.includes('vault') ? 'Vault Secure Chain' : 'Express Point-to-Point')}
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
                <div className={styles.specialMetaGrid} style={{ marginTop: 8 }}>
                  {/* Airport specific markers */}
                  {flight.terminal && (
                    <div className={styles.specItem}>
                      <label>Airport Terminal</label>
                      <strong style={{ color: '#0F172A' }}>{flight.terminal}</strong>
                    </div>
                  )}
                  {flight.flight_number && (
                    <div className={styles.specItem}>
                      <label>Flight Number</label>
                      <strong style={{ color: '#2563EB' }}>{flight.airline_name ? `${flight.airline_name} ` : ''}{flight.flight_number}</strong>
                    </div>
                  )}
                  {flight.pnr && (
                    <div className={styles.specItem}>
                      <label>PNR Booking</label>
                      <strong>{flight.pnr}</strong>
                    </div>
                  )}
                  {flight.belt_number && (
                    <div className={styles.specItem}>
                      <label>Baggage Belt</label>
                      <strong>Belt {flight.belt_number}</strong>
                    </div>
                  )}
                  {flight.meeting_point && (
                    <div className={styles.specItem}>
                      <label>Meeting Point</label>
                      <strong>{flight.meeting_point}</strong>
                    </div>
                  )}

                  {/* Corporate Vault metadata */}
                  {vaultObj?.pickup?.companyOrganization && (
                    <div className={styles.specItem}>
                      <label>Company / Org</label>
                      <strong>{vaultObj.pickup.companyOrganization}</strong>
                    </div>
                  )}
                  {vaultObj?.pickup?.gstin && (
                    <div className={styles.specItem}>
                      <label>Pickup GSTIN</label>
                      <code>{vaultObj.pickup.gstin}</code>
                    </div>
                  )}
                  {pDetails.location_type && (
                    <div className={styles.specItem}>
                      <label>Location Type</label>
                      <strong style={{ textTransform: 'capitalize' }}>{pDetails.location_type}</strong>
                    </div>
                  )}
                </div>

                {/* Access Requirements badges */}
                {(vaultObj?.pickup?.securityCheck || vaultObj?.pickup?.visitorPass || vaultObj?.pickup?.liftAccess || vaultObj?.pickup?.idProof || vaultObj?.pickup?.parking) && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {vaultObj.pickup.securityCheck && <span className={styles.speedBadge} style={{ fontSize: '0.68rem' }}>Security Check</span>}
                    {vaultObj.pickup.visitorPass && <span className={styles.speedBadge} style={{ fontSize: '0.68rem' }}>Visitor Pass Req</span>}
                    {vaultObj.pickup.liftAccess && <span className={styles.speedBadge} style={{ fontSize: '0.68rem' }}>Lift Access</span>}
                    {vaultObj.pickup.idProof && <span className={styles.speedBadge} style={{ fontSize: '0.68rem' }}>ID Proof Req</span>}
                    {vaultObj.pickup.parking && <span className={styles.speedBadge} style={{ fontSize: '0.68rem' }}>Parking Available</span>}
                  </div>
                )}

                {/* Special Instructions */}
                {(pDetails.special_instructions || vaultObj?.pickup?.specialInstructions) && (
                  <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#475569', background: '#F8FAFC', padding: '6px 10px', borderRadius: 6 }}>
                    <strong>Pickup Instructions:</strong> {pDetails.special_instructions || vaultObj?.pickup?.specialInstructions}
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

                {/* Hotel specific metadata */}
                <div className={styles.specialMetaGrid} style={{ marginTop: 8 }}>
                  {(hotel.hotelName || hotel.hotel_name) && (
                    <div className={styles.specItem}>
                      <label>Hotel Name</label>
                      <strong style={{ color: '#059669' }}>{hotel.hotelName || hotel.hotel_name}</strong>
                    </div>
                  )}
                  {(hotel.roomNumber || hotel.room_number) && (
                    <div className={styles.specItem}>
                      <label>Room Number</label>
                      <strong>{hotel.roomNumber || hotel.room_number}</strong>
                    </div>
                  )}
                  {(hotel.guestName || hotel.guest_name) && (
                    <div className={styles.specItem}>
                      <label>Guest Name</label>
                      <strong>{hotel.guestName || hotel.guest_name}</strong>
                    </div>
                  )}
                  {(hotel.bookingReference || hotel.booking_reference) && (
                    <div className={styles.specItem}>
                      <label>Hotel Booking Ref</label>
                      <strong>{hotel.bookingReference || hotel.booking_reference}</strong>
                    </div>
                  )}

                  {/* Corporate Vault metadata */}
                  {vaultObj?.delivery?.companyOrganization && (
                    <div className={styles.specItem}>
                      <label>Company / Org</label>
                      <strong>{vaultObj.delivery.companyOrganization}</strong>
                    </div>
                  )}
                  {vaultObj?.delivery?.gstin && (
                    <div className={styles.specItem}>
                      <label>Delivery GSTIN</label>
                      <code>{vaultObj.delivery.gstin}</code>
                    </div>
                  )}
                  {dDetails.location_type && (
                    <div className={styles.specItem}>
                      <label>Location Type</label>
                      <strong style={{ textTransform: 'capitalize' }}>{dDetails.location_type}</strong>
                    </div>
                  )}
                </div>

                {/* Access Requirements badges */}
                {(vaultObj?.delivery?.securityCheck || vaultObj?.delivery?.visitorPass || vaultObj?.delivery?.liftAccess || vaultObj?.delivery?.idProof || vaultObj?.delivery?.parking) && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {vaultObj.delivery.securityCheck && <span className={styles.speedBadge} style={{ fontSize: '0.68rem' }}>Security Check</span>}
                    {vaultObj.delivery.visitorPass && <span className={styles.speedBadge} style={{ fontSize: '0.68rem' }}>Visitor Pass Req</span>}
                    {vaultObj.delivery.liftAccess && <span className={styles.speedBadge} style={{ fontSize: '0.68rem' }}>Lift Access</span>}
                    {vaultObj.delivery.idProof && <span className={styles.speedBadge} style={{ fontSize: '0.68rem' }}>ID Proof Req</span>}
                    {vaultObj.delivery.parking && <span className={styles.speedBadge} style={{ fontSize: '0.68rem' }}>Parking Available</span>}
                  </div>
                )}

                {/* Special Instructions */}
                {(dDetails.special_instructions || vaultObj?.delivery?.specialInstructions) && (
                  <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#475569', background: '#F8FAFC', padding: '6px 10px', borderRadius: 6 }}>
                    <strong>Delivery Instructions:</strong> {dDetails.special_instructions || vaultObj?.delivery?.specialInstructions}
                  </div>
                )}
              </div>
            </div>

            {/* MultiPoint / Multi-Stop Itinerary if present */}
            {((Array.isArray(order?.multiStops) && order.multiStops.length > 0) ||
              (Array.isArray(vaultObj?.multipointStops) && vaultObj.multipointStops.length > 0) ||
              (Array.isArray(order?.multipointStops) && order.multipointStops.length > 0)) && (
              <div style={{ marginTop: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Share2 size={13} /> Authorized Multi-Stop Transit Itinerary
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {((order?.multiStops?.length > 0 ? order.multiStops : null) || vaultObj?.multipointStops || order?.multipointStops || []).map((stop, sIdx) => (
                    <div key={stop.id || sIdx} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 6, padding: '8px 12px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong style={{ color: '#0F172A' }}>Stop {stop.stopNumber || stop.stop_sequence || sIdx + 1}: {stop.stopName || stop.name || `Point ${sIdx + 1}`}</strong>
                        {stop.timeWindow && <span style={{ color: '#2563EB', fontWeight: 600 }}>{stop.timeWindow}</span>}
                      </div>
                      <div style={{ color: '#475569', marginTop: 2 }}>{stop.address || stop.full_address}</div>
                      {stop.contactPerson && <div style={{ color: '#64748B', fontSize: '0.72rem', marginTop: 2 }}>Contact: {stop.contactPerson}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card B: Consignment & Cargo Manifest */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3><Box size={17} color="#087fc1" /> Consignment & Cargo Manifest</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                {sKey.includes('luggage') ? `${totalBags} Luggage Pieces • ${totalWeight} kg Total` : (sKey.includes('confidential') || sKey.includes('vault') ? 'Delivez Vault Security Manifest' : 'Express Cargo')}
              </span>
            </div>

            {/* 1. LUGGAGE MODULE DEDICATED MANIFEST */}
            {sKey.includes('luggage') ? (
              <div>
                {/* Flight & Airport Banner */}
                {(flight.airline_name || flight.flight_number || flight.pnr || flight.terminal) && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                    border: '1.5px solid #FCD34D',
                    borderRadius: 12,
                    padding: '12px 16px',
                    marginBottom: 16
                  }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: '#FFFFFF',
                      border: '1px solid #FDE68A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Plane size={22} color="#D97706" />
                    </div>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>Airline & Flight</span>
                        <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block' }}>
                          {flight.airline_name || ''} {flight.flight_number || 'Scheduled Flight'}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>Passenger PNR</span>
                        <strong style={{ fontSize: '0.88rem', color: '#2563EB', display: 'block' }}>{flight.pnr || '—'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>Terminal / Belt</span>
                        <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block' }}>
                          {flight.terminal || 'Terminal'} {flight.belt_number ? `• Belt ${flight.belt_number}` : ''}
                        </strong>
                      </div>
                      {flight.departure_time && (
                        <div>
                          <span style={{ fontSize: '0.68rem', color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>Departure Time</span>
                          <strong style={{ fontSize: '0.82rem', color: '#475569', display: 'block' }}>{formatTiming(flight.departure_time)}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Hotel Banner if applicable */}
                {(hotel.hotelName || hotel.hotel_name) && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    background: '#F0FDF4',
                    border: '1.5px solid #BBF7D0',
                    borderRadius: 12,
                    padding: '12px 16px',
                    marginBottom: 16
                  }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: '#FFFFFF',
                      border: '1px solid #86EFAC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Building size={22} color="#15803D" />
                    </div>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Hotel Destination</span>
                        <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block' }}>{hotel.hotelName || hotel.hotel_name}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Room & Guest</span>
                        <strong style={{ fontSize: '0.88rem', color: '#15803D', display: 'block' }}>
                          {hotel.roomNumber || hotel.room_number ? `Room ${hotel.roomNumber || hotel.room_number}` : 'Front Desk Handover'} ({hotel.guestName || customerName})
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Booking Reference</span>
                        <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block' }}>{hotel.bookingReference || hotel.booking_reference || '—'}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Baggage Inventory Cards */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Detailed Baggage Pieces Inventory ({luggageItemsList.length || 1} Bag{luggageItemsList.length > 1 ? 's' : ''})</span>
                    <span style={{ color: '#D97706' }}>Verified Weight: {totalWeight} kg</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                    {luggageItemsList.map((item, idx) => (
                      <div key={item.item_id || idx} style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: '#0F172A', fontSize: '0.88rem' }}>
                            {idx + 1}. {(item.bag_type || 'Luggage').toUpperCase()} BAG
                            {item.quantity > 1 ? ` (Qty: ${item.quantity})` : ''}
                          </strong>
                          <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 12, fontWeight: 800, fontSize: '0.75rem' }}>
                            {item.declared_weight_kg || item.weight || 15} kg
                          </span>
                        </div>

                        {item.description && (
                          <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: 4 }}>
                            {item.description}
                          </div>
                        )}

                        {item.dimensions?.length_cm && (
                          <div style={{ color: '#64748B', fontSize: '0.72rem', marginTop: 4 }}>
                            Dimensions: {item.dimensions.length_cm} × {item.dimensions.width_cm} × {item.dimensions.height_cm} cm
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                          {item.is_fragile && (
                            <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '2px 6px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700 }}>
                              FRAGILE
                            </span>
                          )}
                          {item.is_valuable && (
                            <span style={{ background: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700 }}>
                              HIGH VALUE
                            </span>
                          )}
                          <span style={{ background: '#DCFCE7', color: '#15803D', padding: '2px 6px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 700 }}>
                            SEALED & TAGGED
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Protections, Add-ons & Assistance */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: '0.78rem' }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 10 }}>
                    <span style={{ color: '#64748B', fontWeight: 700, display: 'block', fontSize: '0.68rem' }}>LUGGAGE PROTECTION</span>
                    <strong style={{ color: order?.protections?.enabled ? '#15803D' : '#475569', display: 'block', marginTop: 2 }}>
                      {order?.protections?.enabled ? '✓ Comprehensive Baggage Protection' : 'Standard Protection'}
                    </strong>
                    {order?.protections?.selected_items?.map((p, i) => (
                      <span key={i} style={{ color: '#059669', display: 'block', fontSize: '0.72rem' }}>• {p.title} (₹{p.price})</span>
                    ))}
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 10 }}>
                    <span style={{ color: '#64748B', fontWeight: 700, display: 'block', fontSize: '0.68rem' }}>AIRPORT ASSISTANCE</span>
                    <strong style={{ color: order?.airportAssistance?.enabled ? '#1D4ED8' : '#475569', display: 'block', marginTop: 2 }}>
                      {order?.airportAssistance?.enabled ? '✓ Meet & Assist Service Active' : 'Curbside Handover'}
                    </strong>
                    {order?.airportAssistance?.selected_services?.map((a, i) => (
                      <span key={i} style={{ color: '#2563EB', display: 'block', fontSize: '0.72rem' }}>• {a.title} (₹{a.price})</span>
                    ))}
                  </div>

                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 10 }}>
                    <span style={{ color: '#64748B', fontWeight: 700, display: 'block', fontSize: '0.68rem' }}>SELECTED ADD-ONS</span>
                    {Array.isArray(order?.addOns?.selected_items) && order.addOns.selected_items.length > 0 ? (
                      order.addOns.selected_items.map((ao, i) => (
                        <span key={i} style={{ color: '#0F172A', display: 'block', fontSize: '0.72rem' }}>
                          • {ao.title} (₹{ao.price})
                        </span>
                      ))
                    ) : (
                      <span style={{ color: '#64748B' }}>No extra add-ons</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (sKey.includes('confidential') || sKey.includes('vault') || order?.documentType) ? (
              /* 2. CONFIDENTIAL VAULT DEDICATED MANIFEST */
              <div>
                {/* Vault Service Tier Highlight Banner */}
                {(() => {
                  const sMetaVault = resolveVaultOrderService(order)
                  const SvcIcon = sMetaVault.icon
                  return (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                      border: '1.5px solid #FCD34D',
                      borderRadius: 12,
                      padding: '14px 18px',
                      marginBottom: 16
                    }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: '#FFFFFF',
                        border: '1px solid #FDE68A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <SvcIcon size={24} strokeWidth={2} color="#FAB800" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            VAULT SERVICE TIER
                          </span>
                          <strong style={{ fontSize: '1.05rem', color: '#0F172A' }}>
                            {order?.vaultServiceType || order?.serviceType || sMetaVault.title}
                          </strong>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: '#FFFFFF',
                            color: '#B45309',
                            border: '1px solid #FCD34D',
                            padding: '2px 8px',
                            borderRadius: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <Clock size={11} color="#FAB800" strokeWidth={2} /> Turnaround: {order?.vaultServiceTime || sMetaVault.time}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#78350F', lineHeight: 1.45 }}>
                          {sMetaVault.desc}
                        </p>
                      </div>
                    </div>
                  )
                })()}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div className={styles.subSectionBox}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>DOCUMENT CLASSIFICATION</div>
                    <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block', marginTop: 4 }}>
                      {String(order?.categoryTitle || order?.documentClassification || order?.documentType || 'Confidential Cargo').replace(/_/g, ' ')}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#475569', marginTop: 3, display: 'block' }}>
                      {order?.documentDescription || vaultObj?.item?.itemNameDescription || 'Official document consignment under Delivez Vault protocol'}
                    </span>
                  </div>

                  <div className={styles.subSectionBox}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>SECURITY ENVELOPE & VOLUME</div>
                    <strong style={{ fontSize: '1rem', color: '#059669', display: 'block', marginTop: 4 }}>
                      {String(order?.envelopeTitle || order?.envelopeSize || vaultObj?.packaging?.selectedPackage || 'A4 Document Envelope').replace(/_/g, ' ')}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#475569', marginTop: 3, display: 'block' }}>
                      Volume: <strong>{order?.pageCount || vaultObj?.item?.numberOfPieces || 1} Document Pages / Items</strong>
                    </span>
                  </div>

                  <div className={styles.subSectionBox}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>ORIGINALS & REVERSE CUSTODY</div>
                    <strong style={{ fontSize: '0.95rem', color: order?.containsOriginals ? '#dc2626' : '#0f172a', display: 'block', marginTop: 4 }}>
                      {order?.containsOriginals ? '★ Contains Original Documents' : 'Certified Copies / Sensitive Records'}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: order?.requiresReturn ? '#d97706' : '#64748b', marginTop: 3, display: 'block', fontWeight: 600 }}>
                      {order?.requiresReturn ? '✓ Reverse Return Leg Requested' : 'One-Way Direct Handover'}
                    </span>
                  </div>

                  <div className={styles.subSectionBox}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>SECURITY PROTOCOL & COVER</div>
                    <strong style={{ fontSize: '0.95rem', color: '#d97706', display: 'block', marginTop: 4 }}>
                      {String(order?.securityTitle || order?.securityLevel || vaultObj?.security?.selectedSecurityLevel || 'TAMPER_EVIDENT').replace(/_/g, ' ')}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#059669', marginTop: 3, display: 'block', fontWeight: 700 }}>
                      Declared Value: ₹{Number(order?.declaredValue || vaultObj?.item?.declaredValue || 0).toLocaleString('en-IN')} (Full Loss Cover)
                    </span>
                  </div>
                </div>

                {/* Vault Advanced Packaging & Security Specs */}
                <div style={{ marginTop: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', marginBottom: 8 }}>
                    🛡️ Vault Packaging & Armed Protocol Specifications
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: '0.78rem' }}>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>CONTAINER PACKAGING</span>
                      <strong>{vaultObj?.packaging?.selectedPackage || order?.envelopeSize || 'Standard Box'}</strong>
                      <small style={{ display: 'block', color: '#475569' }}>
                        {[
                          vaultObj?.packaging?.waterproofCover ? 'Waterproof' : null,
                          vaultObj?.packaging?.cornerGuard ? 'Corner Guards' : null,
                          vaultObj?.packaging?.extraBubbleWrap ? 'Bubble Wrap' : null,
                        ].filter(Boolean).join(' • ') || 'Tamper-Evident Tape Active'}
                      </small>
                    </div>

                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>ARMED SECURITY ESCORT</span>
                      <strong style={{ color: vaultObj?.security?.armedEscort ? '#DC2626' : '#15803D' }}>
                        {vaultObj?.security?.armedEscort ? 'YES — Armed Escort Protection' : 'Standard Armed Guard Protocol'}
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>HANDOVER VERIFICATION</span>
                      <strong>{vaultObj?.verification?.selectedVerification || order?.handoverMethod || 'OTP Verification'}</strong>
                      <small style={{ display: 'block', color: '#475569' }}>
                        {[
                          vaultObj?.verification?.capturePhotoOfRecipient ? 'Recipient Photo' : null,
                          vaultObj?.verification?.capturePhotoOfIdProof ? 'Govt ID Photo' : null,
                        ].filter(Boolean).join(' • ')}
                      </small>
                    </div>

                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>COMPLIANCE & E-SIGN</span>
                      <span style={{ color: '#475569' }}>{formatTiming(order?.complianceAcceptedAt || order?.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Uploaded Attachments */}
                {(Array.isArray(order?.attachments) && order.attachments.length > 0 || Array.isArray(vaultObj?.attachments) && vaultObj.attachments.length > 0) && (
                  <div style={{ marginTop: 14, background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Paperclip size={13} /> Attached Confidential Documents ({(order?.attachments || vaultObj?.attachments || []).length})
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {(order?.attachments || vaultObj?.attachments || []).map((att, aIdx) => (
                        <div key={att.id || aIdx} style={{ background: '#F1F5F9', padding: '6px 10px', borderRadius: 6, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FileText size={13} color="#2563EB" />
                          <span>{att.fileName || att.name || `Document_${aIdx + 1}.pdf`}</span>
                          {att.fileSize && <span style={{ color: '#64748B' }}>({Math.round(att.fileSize / 1024)} KB)</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Standard / Personal Courier Manifest */
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div className={styles.subSectionBox}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>DECLARED ITEM CATEGORY</div>
                    <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block', marginTop: 4 }}>
                      {order?.category || order?.itemCategory || order?.package?.category || pkg.category || 'General Courier Cargo'}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#475569', marginTop: 3, display: 'block' }}>
                      {order?.contentDescription || order?.itemDescription || pkg.contentDescription || pkg.description || 'Declared items verified for express transit'}
                    </span>
                  </div>

                  <div className={styles.subSectionBox}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>WEIGHT & VOLUMETRIC SPECS</div>
                    <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block', marginTop: 4 }}>
                      {order?.actualWeightKg ?? totalWeight} kg <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>(Actual)</span>
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#475569', marginTop: 3, display: 'block' }}>
                      {order?.dimensions?.lengthCm ? `Dimensions: ${order.dimensions.lengthCm} × ${order.dimensions.widthCm} × ${order.dimensions.heightCm} cm` : 'Standard Consignment Dimensions'}
                    </span>
                  </div>

                  <div className={styles.subSectionBox}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>PACKAGING TYPE</div>
                    <strong style={{ fontSize: '1rem', color: '#059669', display: 'block', marginTop: 4 }}>
                      {order?.packagingName || 'Standard Secure Packaging'}
                    </strong>
                  </div>

                  <div className={styles.subSectionBox}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>SECURITY & SAFEGUARDS</div>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block', marginTop: 4, fontFamily: 'monospace' }}>
                      {sealNumber}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card C: Dispatcher Operational Notes & Activity Log */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3><FileText size={17} color="#475569" /> Internal Dispatcher Notes & Activity Log</h3>
            </div>

            <form onSubmit={handleAddNote} className={styles.addNoteRow}>
              <input
                type="text"
                placeholder="Log internal note, terminal update, PNR change, or operational notice..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button type="submit">Log Note</button>
            </form>

            <div className={styles.notesList}>
              {notesList.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '0.82rem', padding: '8px 0' }}>
                  No internal dispatcher notes recorded yet for consignment #{bookingNumber}.
                </div>
              ) : (
                notesList.map((n, idx) => (
                  <div key={idx} className={styles.noteItem}>
                    <div>{n.note}</div>
                    <small>
                      {formatTiming(n.timestamp)} • by <strong>{n.by || 'Admin Dispatcher'}</strong>
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card D: Status Change Timing & Milestone Audit */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3><History size={17} color="#2563eb" /> Status Change Timing & Milestone Audit</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                {statusHistory.length} Audit Events Logged
              </span>
            </div>

            {/* Milestones Checklist if 10 canonical milestones present */}
            {Array.isArray(order?.milestones) && order.milestones.length > 0 && (
              <div style={{ marginBottom: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckSquare size={14} /> Full Operational Tracking Milestones ({order.milestones.length} Steps)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                  {order.milestones.map((ms, msIdx) => {
                    const activeIdx = order.currentMilestoneIndex || 0
                    const isPassed = msIdx <= activeIdx
                    return (
                      <div key={ms.id || msIdx} style={{
                        background: isPassed ? '#F0FDF4' : '#FFFFFF',
                        border: `1px solid ${isPassed ? '#86EFAC' : '#E2E8F0'}`,
                        borderRadius: 8,
                        padding: '8px 10px',
                        fontSize: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: isPassed ? '#15803D' : '#CBD5E1',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: 800
                          }}>
                            {isPassed ? '✓' : msIdx + 1}
                          </span>
                          <strong style={{ color: isPassed ? '#15803D' : '#475569' }}>{ms.title}</strong>
                        </div>
                        {ms.subtitle && <div style={{ color: '#64748B', fontSize: '0.68rem', marginTop: 2, paddingLeft: 24 }}>{ms.subtitle}</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

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
        {/* RIGHT COLUMN: SECURITY OTPS, CUSTOMER, DRIVER, FINANCIALS, POD    */}
        {/* ================================================================= */}
        <div className={styles.rightColumn}>
          {/* Card 0: Dedicated Security OTP Credentials Card */}
          {(pickupOtp || deliveryOtp || sKey.includes('luggage') || sKey.includes('confidential') || sKey.includes('vault')) && (
            <div className={styles.detailCard} style={{ border: '1.5px solid #CBD5E1', background: '#FFFFFF' }}>
              <div className={styles.cardHeader}>
                <h3><Key size={16} color="#D97706" /> Security Credentials & Verification</h3>
                <span style={{ fontSize: '0.72rem', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                  CHAIN OF CUSTODY
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small style={{ color: '#166534', fontWeight: 700 }}>PICKUP OTP</small>
                    <button
                      type="button"
                      onClick={() => handleCopyId(pickupOtp, 'pickupOtp')}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#166534' }}
                    >
                      {copied === 'pickupOtp' ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                  <strong style={{ fontSize: 18, color: '#15803D', letterSpacing: 2, display: 'block', marginTop: 2 }}>
                    {pickupOtp || '—'}
                  </strong>
                </div>

                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small style={{ color: '#1E40AF', fontWeight: 700 }}>DELIVERY OTP</small>
                    <button
                      type="button"
                      onClick={() => handleCopyId(deliveryOtp, 'deliveryOtp')}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#1E40AF' }}
                    >
                      {copied === 'deliveryOtp' ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                  <strong style={{ fontSize: 18, color: '#1D4ED8', letterSpacing: 2, display: 'block', marginTop: 2 }}>
                    {deliveryOtp || '—'}
                  </strong>
                </div>
              </div>

              <div style={{ marginTop: 10, fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>
                  <strong>Security Tamper Seal:</strong>{' '}
                  <code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: 4 }}>
                    {sealNumber}
                  </code>
                </div>
                <div>
                  <strong>Handover Protocol:</strong>{' '}
                  <span style={{ color: '#0F172A', fontWeight: 600 }}>
                    {order?.handoverMethod ? String(order.handoverMethod).replace(/_/g, ' ') : 'OTP & Digital Signature Verification'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Card 1: Customer Account & GST Invoice */}
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

              {/* Corporate GST Tax Invoice Box if available */}
              {gst?.gstin && (
                <div style={{ marginTop: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 10, fontSize: '0.78rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FileSpreadsheet size={13} color="#059669" /> Business GST Invoice
                  </div>
                  <div><strong>GSTIN:</strong> <code>{gst.gstin}</code></div>
                  {gst.company_name && <div><strong>Entity:</strong> {gst.company_name}</div>}
                  {gst.state_code && <div><strong>State Code:</strong> {gst.state_code}</div>}
                  {gst.billing_address && <div style={{ color: '#64748B', marginTop: 2 }}>{gst.billing_address}</div>}
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
                  background: (driverName && driverName !== 'Unassigned') ? '#ecfdf5' : '#fef2f2',
                  color: (driverName && driverName !== 'Unassigned') ? '#059669' : '#dc2626',
                }}
              >
                {(driverName && driverName !== 'Unassigned') ? 'DISPATCHED' : 'UNASSIGNED'}
              </span>
            </div>

            {(driverName && driverName !== 'Unassigned') ? (
              <div>
                <div className={styles.driverInfoRow}>
                  <div className={styles.driverAvatar}>
                    {driverName.slice(0, 1)}
                  </div>
                  <div className={styles.driverDetails}>
                    <strong>{driverName}</strong>
                    <span>
                      {driverPhone || '+91 98765 43210'}
                    </span>
                    <span style={{ display: 'block', color: '#0f172a', fontWeight: 600, marginTop: 2 }}>
                      Vehicle: {driverVehicle || 'Dedicated Transit Van'}
                    </span>
                  </div>
                </div>

                <div className={styles.driverActions}>
                  {driverPhone && (
                    <a
                      href={`tel:${driverPhone}`}
                      className={styles.driverCallBtn}
                    >
                      <Phone size={13} /> Call Driver
                    </a>
                  )}
                  <button
                    type="button"
                    className={styles.driverReassignBtn}
                    onClick={() => setAssignModalOpen(true)}
                  >
                    Reassign Rider
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 12px' }}>
                  No courier or driver allocated to this consignment yet.
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setAssignModalOpen(true)}
                  >
                    Select Rider
                  </button>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={handleAutoAssign}
                    disabled={autoAssigning}
                  >
                    <Zap size={13} /> Auto-Dispatch
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Fare Ledger & Billing */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3><CreditCard size={16} color="#059669" /> Fare Ledger & Billing</h3>
              <span className={paymentStatus === 'PAID' ? styles.payBadgeGreen : styles.payBadgeYellow}>
                {paymentStatus}
              </span>
            </div>

            <div className={styles.billingList}>
              {/* If Luggage authoritative pricing is present */}
              {pricing ? (
                <>
                  <div className={styles.billRow}>
                    <span>Base Route Fare</span>
                    <span>₹{Number(pricing.base_fare || 499).toFixed(2)}</span>
                  </div>
                  {Number(pricing.distance_fee || 0) > 0 && (
                    <div className={styles.billRow}>
                      <span>Distance Tariff ({pricing.distance_km || 0} km)</span>
                      <span>₹{Number(pricing.distance_fee).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(pricing.luggage_handling_fee || 0) > 0 && (
                    <div className={styles.billRow}>
                      <span>Luggage Handling & Baggage Surge</span>
                      <span>₹{Number(pricing.luggage_handling_fee).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(pricing.airport_handling_fee || 0) > 0 && (
                    <div className={styles.billRow}>
                      <span>Airport Terminal Handling</span>
                      <span>₹{Number(pricing.airport_handling_fee).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(pricing.hotel_handling_fee || 0) > 0 && (
                    <div className={styles.billRow}>
                      <span>Hotel Front Desk Transfer</span>
                      <span>₹{Number(pricing.hotel_handling_fee).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(pricing.add_on_fee || 0) > 0 && (
                    <div className={styles.billRow}>
                      <span>Add-On Services</span>
                      <span>₹{Number(pricing.add_on_fee).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(pricing.luggage_protection_fee || 0) > 0 && (
                    <div className={styles.billRow}>
                      <span>Luggage Protection Insurance</span>
                      <span>₹{Number(pricing.luggage_protection_fee).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(pricing.airport_assistance_fee || 0) > 0 && (
                    <div className={styles.billRow}>
                      <span>Airport Meet & Assist</span>
                      <span>₹{Number(pricing.airport_assistance_fee).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(pricing.delivery_speed_fee || 0) > 0 && (
                    <div className={styles.billRow}>
                      <span>Delivery Speed Surge</span>
                      <span>₹{Number(pricing.delivery_speed_fee).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(pricing.discount?.discount_amount || 0) > 0 && (
                    <div className={styles.billRow} style={{ color: '#059669', fontWeight: 600 }}>
                      <span>Coupon Discount ({pricing.discount?.coupon_code})</span>
                      <span>-₹{Number(pricing.discount.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className={styles.billRow}>
                    <span>GST (18% Integrated Tax)</span>
                    <span>₹{Number(pricing.tax?.total_tax || (amountTotal * 0.18)).toFixed(2)}</span>
                  </div>
                </>
              ) : (sKey.includes('confidential') || sKey.includes('vault') || order?.baseCharge !== undefined) ? (
                <>
                  <div className={styles.billRow}>
                    <span>Base Vault Inception Rate</span>
                    <span>₹{Number(order?.baseCharge ?? (vaultObj?.basePrice || 49)).toFixed(2)}</span>
                  </div>
                  <div className={styles.billRow}>
                    <span>Distance Transit Tariff</span>
                    <span>₹{Number(order?.distanceCharge ?? 0).toFixed(2)}</span>
                  </div>
                  <div className={styles.billRow}>
                    <span>Security Protocol & Tamper Seal</span>
                    <span>₹{Number(order?.securityCharge ?? 60).toFixed(2)}</span>
                  </div>
                  <div className={styles.billRow}>
                    <span>Handover Verification Fee</span>
                    <span>₹{Number(order?.handoverCharge ?? 90).toFixed(2)}</span>
                  </div>
                  {Number(order?.originalsCharge || 0) > 0 && (
                    <div className={styles.billRow}>
                      <span>Original Document Handling</span>
                      <span>₹{Number(order.originalsCharge).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(order?.returnCharge || 0) > 0 && (
                    <div className={styles.billRow}>
                      <span>Return Consignment Guarantee</span>
                      <span>₹{Number(order.returnCharge).toFixed(2)}</span>
                    </div>
                  )}
                  <div className={styles.billRow}>
                    <span>GST (18% Integrated Tax)</span>
                    <span>₹{Number(order?.taxAmount ?? (amountTotal * 0.18)).toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}

              <div className={styles.billRowTotal}>
                <span>Total Amount Paid</span>
                <span>₹{amountTotal}</span>
              </div>

              <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#64748b' }}>
                <div><strong>Payment Method:</strong> {order?.paymentMethod || paymentMethod}</div>
                {order?.paymentProvider && (
                  <div><strong>Payment Gateway:</strong> {order.paymentProvider}</div>
                )}
                <div><strong>Transaction ID:</strong> <code>{order?.paymentReference || order?.transactionId || order?.paymentId || 'TXN_DLV_8829374'}</code></div>
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
              <span style={{ fontSize: '0.72rem', background: currentStatus === 'DELIVERED' ? '#ecfdf5' : '#f8fafc', color: currentStatus === 'DELIVERED' ? '#059669' : '#64748b', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                {currentStatus === 'DELIVERED' ? 'POD ARCHIVED' : 'AWAITING HANDOVER'}
              </span>
            </div>

            {currentStatus === 'DELIVERED' ? (
              <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontWeight: 700, marginBottom: 8 }}>
                  <CheckCircle2 size={16} /> Handed Over & Recipient Verified
                </div>
                <div><strong>Recipient:</strong> {recipientName}</div>
                <div><strong>POD Timestamp:</strong> {formatTiming(statusTimings.DELIVERED || order?.updatedAt)}</div>
                <div><strong>Verification Mode:</strong> Dual OTP Authentication & Signature</div>
                <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                  <small style={{ color: '#166534', fontWeight: 700, display: 'block' }}>AUDIT VERIFICATION</small>
                  <span style={{ fontSize: '0.75rem', color: '#15803D' }}>Consignment received intact with tamper-evident seal unbroken.</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0', color: '#64748b', fontSize: '0.82rem' }}>
                <Clock size={20} style={{ margin: '0 auto 6px', display: 'block', color: '#94a3b8' }} />
                <span>Proof of delivery photo and recipient signature will be captured upon final doorstep handover.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 5. MODAL: ASSIGN FLEET RIDER                                         */}
      {/* -------------------------------------------------------------------- */}
      {assignModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setAssignModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3><Bike size={18} style={{ display: 'inline', marginRight: 6 }} /> Assign Fleet Rider</h3>
              <button type="button" onClick={() => setAssignModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p style={{ color: '#475569', fontSize: '0.88rem', margin: '0 0 14px' }}>
                Select an active, verified courier executive for consignment <strong>#{bookingNumber}</strong>:
              </p>

              <div className={styles.riderSelectList}>
                {partners.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                    No delivery partners registered in fleet.
                  </div>
                ) : (
                  partners.map((p) => (
                    <label
                      key={p.id}
                      className={`${styles.riderRadioItem} ${selectedPartnerId === p.id ? styles.riderRadioActive : ''}`}
                    >
                      <input
                        type="radio"
                        name="riderChoice"
                        value={p.id}
                        checked={selectedPartnerId === p.id}
                        onChange={() => setSelectedPartnerId(p.id)}
                      />
                      <div className={styles.riderRadioInfo}>
                        <strong>{p.name || p.fullName}</strong>
                        <span>{p.phone || p.mobileNumber} • {p.zone || p.city || 'Transit Fleet'}</span>
                        <small style={{ color: '#64748b' }}>Vehicle: {p.vehicle || 'Delivery Van'}</small>
                      </div>
                      <span className={styles.riderStatusTag} style={{ background: p.status === 'ONLINE' ? '#ecfdf5' : '#f8fafc', color: p.status === 'ONLINE' ? '#059669' : '#64748b' }}>
                        {p.status || 'AVAILABLE'}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className={styles.modalFoot}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setAssignModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleAssignPartner}
                disabled={assigning || !selectedPartnerId}
              >
                {assigning ? 'Assigning...' : 'Confirm Rider Allocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
