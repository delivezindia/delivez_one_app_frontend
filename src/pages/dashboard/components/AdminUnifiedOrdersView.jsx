import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  X,
  Package,
  Truck,
  ShieldCheck,
  RotateCcw,
  Gift,
  ShoppingBag,
  Clock,
  Phone,
  User,
  MapPin,
  CheckCircle2,
  Bike,
  AlertTriangle,
  UserCheck,
  Ban,
  Zap
} from 'lucide-react'
import {
  fetchUnifiedOrders,
  updateOrderStatusUnified,
  assignPartnerToOrder,
  autoAssignOrderUnified,
  cancelOrderUnified,
  fetchAdminPartners
} from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminUnifiedOrdersView.module.css'

const SERVICE_CONFIG = {
  'gift-delivery': { label: 'Gift & Surprise', icon: Gift, color: '#E11D48', bg: '#FFF1F2' },
  'personal-courier': { label: 'Personal Courier', icon: Truck, color: '#2563EB', bg: '#EFF6FF' },
  'confidential-courier': { label: 'Confidential / Luggage', icon: ShieldCheck, color: '#D97706', bg: '#FEF3C7' },
  'forgot-something': { label: 'Forgot Something', icon: ShoppingBag, color: '#7C3AED', bg: '#F5F3FF' },
  'return-pickup': { label: 'Return Pickup', icon: RotateCcw, color: '#059669', bg: '#ECFDF5' },
}

export default function AdminUnifiedOrdersView() {
  const [orders, setOrders] = useState([])
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 })
  const [filters, setFilters] = useState({
    search: '',
    serviceType: 'ALL',
    status: 'ALL',
  })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedPartnerId, setSelectedPartnerId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [toast, setToast] = useState('')
  const [livePolling, setLivePolling] = useState('off') // 'off' | '15' | '30'

  const pollTimerRef = useRef(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const loadOrders = useCallback(async (page = 1, showSpinner = true) => {
    if (showSpinner) setLoading(true)
    try {
      const data = await fetchUnifiedOrders({ page, limit: pagination.limit, ...filters })
      if (data) {
        setOrders(data.orders || [])
        setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 })
      }
    } catch (e) {
      console.error(e)
    } finally {
      if (showSpinner) setLoading(false)
    }
  }, [filters, pagination.limit])

  // Initial load
  useEffect(() => {
    loadOrders(1)
    fetchAdminPartners().then(d => {
      if (d?.partners) setPartners(d.partners)
    }).catch(console.error)
  }, [loadOrders])

  // Live Auto-Refresh Polling
  useEffect(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    if (livePolling !== 'off') {
      const intervalSec = parseInt(livePolling, 10) * 1000
      pollTimerRef.current = setInterval(() => {
        loadOrders(pagination.page, false)
      }, intervalSec)
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [livePolling, loadOrders, pagination.page])

  const handleExportCsv = () => {
    window.open('http://localhost:4000/api/v1/admin/export/orders', '_blank')
  }

  // Fast Inline Status Changer
  const handleInlineStatus = async (order, newStatus) => {
    try {
      await updateOrderStatusUnified(order.serviceKey, order.id, newStatus)
      setOrders(prev => prev.map(o => (o.id === order.id ? { ...o, status: newStatus } : o)))
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }))
      }
      showToast(`Order ${order.bookingNumber} marked as ${newStatus}`)
    } catch (err) {
      alert(err.message || 'Failed to update order status.')
    }
  }

  // Assign Delivery Partner
  const handleAssignPartner = async () => {
    if (!selectedPartnerId || !selectedOrder) return
    const partner = partners.find(p => p.id === selectedPartnerId)
    if (!partner) return

    setAssigning(true)
    try {
      await assignPartnerToOrder(selectedOrder.serviceKey, selectedOrder.id, {
        partnerId: partner.id,
        partnerName: partner.name,
        partnerPhone: partner.phone,
        partnerVehicle: partner.vehicle,
      })

      const updatedPartnerInfo = {
        assignedPartner: partner.name,
        partnerPhone: partner.phone,
        status: selectedOrder.status === 'CONFIRMED' ? 'IN_TRANSIT' : selectedOrder.status,
      }

      setOrders(prev => prev.map(o => (o.id === selectedOrder.id ? { ...o, ...updatedPartnerInfo } : o)))
      setSelectedOrder(prev => ({ ...prev, ...updatedPartnerInfo }))
      showToast(`Assigned ${partner.name} to order #${selectedOrder.bookingNumber}`)
      setSelectedPartnerId('')
    } catch (err) {
      alert(err.message || 'Failed to assign rider.')
    } finally {
      setAssigning(false)
    }
  }

  // Smart Auto-Assign Order
  const [autoAssigningId, setAutoAssigningId] = useState('')

  const handleAutoAssign = async (order) => {
    setAutoAssigningId(order.id)
    try {
      const data = await autoAssignOrderUnified(order.serviceKey, order.id)
      const updated = {
        assignedPartner: data.assignedPartner,
        partnerPhone: data.partnerPhone,
        status: data.updatedStatus || 'PARTNER_ASSIGNED',
      }
      setOrders(prev => prev.map(o => (o.id === order.id ? { ...o, ...updated } : o)))
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(prev => ({ ...prev, ...updated }))
      }
      showToast(`⚡ Auto-assigned ${data.assignedPartner} to order #${order.bookingNumber}`)
    } catch (err) {
      alert(err.message || 'Auto-assign failed.')
    } finally {
      setAutoAssigningId('')
    }
  }

  // Cancel Order
  const handleCancelOrder = async () => {
    if (!selectedOrder) return
    const reason = window.prompt(`Are you sure you want to cancel order #${selectedOrder.bookingNumber}?\nPlease provide cancellation reason:`, 'Cancelled by Dispatcher')
    if (!reason) return

    try {
      await cancelOrderUnified(selectedOrder.serviceKey, selectedOrder.id, reason)
      setOrders(prev => prev.map(o => (o.id === selectedOrder.id ? { ...o, status: 'CANCELLED' } : o)))
      setSelectedOrder(prev => ({ ...prev, status: 'CANCELLED' }))
      showToast(`Order #${selectedOrder.bookingNumber} cancelled.`)
    } catch (err) {
      alert(err.message || 'Failed to cancel order.')
    }
  }

  return (
    <div className={styles.wrapper}>
      {toast && (
        <div className={styles.toast}>
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.heading}>Unified Orders Hub</h2>
          <p className={styles.sub}>
            Live operational pipeline aggregating Personal Courier, Confidential Cargo, Forgot Something, Returns & Gift Deliveries.
          </p>
        </div>
        <div className={styles.btnGroup}>
          <div className={styles.livePollToggle}>
            {livePolling !== 'off' && <span className={styles.pulseDot} />}
            <span>Live Pulse:</span>
            <select
              value={livePolling}
              onChange={e => setLivePolling(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
            >
              <option value="off">Off</option>
              <option value="15">15s</option>
              <option value="30">30s</option>
            </select>
          </div>

          <button type="button" className={styles.exportBtn} onClick={handleExportCsv}>
            <Download size={15} /> Export CSV
          </button>
          <button type="button" className={styles.refreshBtn} onClick={() => loadOrders(pagination.page)}>
            <RefreshCw size={15} className={loading ? styles.spin : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterCard}>
        <div className={styles.searchWrap}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by order ID, customer name, recipient, destination..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <select
          value={filters.serviceType}
          onChange={e => setFilters(prev => ({ ...prev, serviceType: e.target.value }))}
          className={styles.selectFilter}
        >
          <option value="ALL">All Service Categories</option>
          <option value="GIFT">Gift & Surprise Delivery</option>
          <option value="COURIER">Personal Courier</option>
          <option value="CONFIDENTIAL">Confidential & Airport Luggage</option>
          <option value="FORGOT">Forgot Something Retrieval</option>
          <option value="RETURN">Return & Exchange Pickup</option>
        </select>

        <select
          value={filters.status}
          onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className={styles.selectFilter}
        >
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="IN_TRANSIT">IN TRANSIT</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Service</th>
              <th>Customer</th>
              <th>Recipient & Destination</th>
              <th>Item Summary</th>
              <th>Fare</th>
              <th>Status Action</th>
              <th>Assigned Partner</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.empty}>
                  {loading ? 'Loading operational orders...' : 'No orders found matching the filter criteria.'}
                </td>
              </tr>
            ) : (
              orders.map(order => {
                const sConf = SERVICE_CONFIG[order.serviceKey] || { label: order.serviceName, color: '#475569', bg: '#F1F5F9' }
                return (
                  <tr key={order.id || order.bookingNumber}>
                    <td>
                      <strong className={styles.orderLink} onClick={() => setSelectedOrder(order)}>
                        {order.bookingNumber}
                      </strong>
                      <span className={styles.metaSub}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      <span className={styles.serviceBadge} style={{ color: sConf.color, background: sConf.bg }}>
                        {sConf.label}
                      </span>
                    </td>
                    <td>
                      <strong>{order.customerName}</strong>
                      <span className={styles.metaSub}>{order.customerPhone}</span>
                    </td>
                    <td>
                      <strong>{order.recipientName}</strong>
                      <span className={styles.metaSub}>{order.destination}</span>
                    </td>
                    <td>
                      <span className={styles.itemText}>{order.itemSummary}</span>
                    </td>
                    <td>
                      <strong>₹{order.amount}</strong>
                      <span className={styles.metaSub}>{order.paymentMethod}</span>
                    </td>
                    <td>
                      <select
                        className={styles.inlineStatusSelect}
                        value={order.status}
                        onChange={e => handleInlineStatus(order, e.target.value)}
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="IN_TRANSIT">IN TRANSIT</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td>
                      <span className={styles.partnerName}>
                        <Bike size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {order.assignedPartner}
                      </span>
                      {order.assignedPartner === 'Unassigned' && (
                        <button
                          type="button"
                          style={{ marginLeft: 6, fontSize: '0.68rem', padding: '2px 6px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 700 }}
                          disabled={autoAssigningId === order.id}
                          onClick={() => handleAutoAssign(order)}
                          title="Auto-dispatch nearest available rider"
                        >
                          {autoAssigningId === order.id ? '...' : '⚡ Auto'}
                        </button>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.viewBtn}
                        onClick={() => setSelectedOrder(order)}
                        title="Manage Order & Dispatch"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className={styles.paginationRow}>
            <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total orders)</span>
            <div className={styles.paginationBtns}>
              <button disabled={pagination.page <= 1} onClick={() => loadOrders(pagination.page - 1)}>Prev</button>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => loadOrders(pagination.page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details & Dispatch Drawer */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <div>
                <h3>Order #{selectedOrder.bookingNumber}</h3>
                <span className={styles.metaSub}>{selectedOrder.serviceName}</span>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)}><X size={18} /></button>
            </div>

            <div className={styles.drawerBody}>
              {/* Dispatch Action Panel */}
              <div className={styles.drawerCard} style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
                <h4><Bike size={14} style={{ display: 'inline', marginRight: 6 }} /> Assign / Reassign Courier</h4>
                <div className={styles.assignBox}>
                  <select
                    className={styles.assignSelect}
                    value={selectedPartnerId}
                    onChange={e => setSelectedPartnerId(e.target.value)}
                  >
                    <option value="">Select active rider from fleet...</option>
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.vehicle} • {p.status})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={styles.assignBtn}
                    disabled={!selectedPartnerId || assigning}
                    onClick={handleAssignPartner}
                  >
                    {assigning ? 'Assigning...' : 'Dispatch Selected Rider'}
                  </button>
                  <button
                    type="button"
                    className={styles.assignBtn}
                    style={{ background: '#7c3aed', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    disabled={autoAssigningId === selectedOrder.id}
                    onClick={() => handleAutoAssign(selectedOrder)}
                  >
                    <Zap size={14} />
                    {autoAssigningId === selectedOrder.id ? 'Auto-Dispatching...' : '⚡ Smart Auto-Assign Best Rider'}
                  </button>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className={styles.drawerCard}>
                <h4>Update Delivery Lifecycle</h4>
                <div className={styles.statusActionsRow}>
                  {['CONFIRMED', 'IN_TRANSIT', 'DELIVERED'].map(st => (
                    <button
                      key={st}
                      type="button"
                      className={styles.statusActionBtn}
                      style={selectedOrder.status === st ? { background: '#0F172A', color: '#FFF' } : {}}
                      onClick={() => handleInlineStatus(selectedOrder, st)}
                    >
                      Mark {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details Cards */}
              <div className={styles.drawerCard}>
                <h4>Customer & Destination</h4>
                <p><strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.customerPhone})</p>
                <p><strong>Recipient:</strong> {selectedOrder.recipientName}</p>
                <p><strong>Destination:</strong> {selectedOrder.destination}</p>
              </div>

              <div className={styles.drawerCard}>
                <h4>Consignment Overview</h4>
                <p><strong>Item:</strong> {selectedOrder.itemSummary}</p>
                <p><strong>Total Fare:</strong> ₹{selectedOrder.amount} ({selectedOrder.paymentMethod} • {selectedOrder.paymentStatus})</p>
                <p><strong>Current Status:</strong> <span className={`${styles.statusBadge} ${styles['status_' + selectedOrder.status]}`}>{selectedOrder.status}</span></p>
              </div>

              <div className={styles.drawerCard}>
                <h4>Assigned Delivery Partner</h4>
                <p><strong>Partner Name:</strong> {selectedOrder.assignedPartner}</p>
                {selectedOrder.partnerPhone && <p><strong>Contact:</strong> {selectedOrder.partnerPhone}</p>}
              </div>

              {/* Danger Zone: Cancel Order */}
              {selectedOrder.status !== 'CANCELLED' && (
                <button type="button" className={styles.cancelOrderBtn} onClick={handleCancelOrder}>
                  <Ban size={14} style={{ display: 'inline', marginRight: 6 }} /> Cancel Consignment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
