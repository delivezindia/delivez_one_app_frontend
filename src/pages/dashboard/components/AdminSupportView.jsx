import React, { useCallback, useEffect, useState } from 'react'
import {
  Headphones,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Phone,
  User,
  MessageSquare,
  FileText,
  X,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react'
import {
  fetchSupportTickets,
  createSupportTicket,
  updateSupportTicket,
  deleteSupportTicket
} from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminSupportView.module.css'

export default function AdminSupportView() {
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState({ total: 0, openCount: 0, inProgressCount: 0, resolvedCount: 0, urgentCount: 0 })
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ status: 'ALL', priority: 'ALL', search: '' })

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [manageModalOpen, setManageModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)

  // Form states
  const [createForm, setCreateForm] = useState({
    subject: '',
    category: 'DELIVERY_DELAY',
    priority: 'HIGH',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    orderBookingNumber: '',
    serviceKey: 'gift-delivery',
    description: '',
    assignedAgent: 'Operations Supervisor',
  })

  const [updateForm, setUpdateForm] = useState({
    status: '',
    priority: '',
    assignedAgent: '',
    resolutionNotes: '',
  })

  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const loadTickets = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchSupportTickets(filters)
      if (data) {
        setTickets(data.tickets || [])
        setStats(data.stats || { total: 0, openCount: 0, inProgressCount: 0, resolvedCount: 0, urgentCount: 0 })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const ticket = await createSupportTicket(createForm)
      setCreateModalOpen(false)
      showToast(`Support Ticket ${ticket?.ticketCode || 'New'} logged.`)
      setCreateForm({
        subject: '',
        category: 'DELIVERY_DELAY',
        priority: 'HIGH',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        orderBookingNumber: '',
        serviceKey: 'gift-delivery',
        description: '',
        assignedAgent: 'Operations Supervisor',
      })
      loadTickets()
    } catch (err) {
      alert(err.message || 'Failed to log ticket.')
    }
  }

  const handleOpenManage = (ticket) => {
    setSelectedTicket(ticket)
    setUpdateForm({
      status: ticket.status,
      priority: ticket.priority,
      assignedAgent: ticket.assignedAgent,
      resolutionNotes: ticket.resolutionNotes || '',
    })
    setManageModalOpen(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!selectedTicket) return
    try {
      await updateSupportTicket(selectedTicket.id, updateForm)
      setManageModalOpen(false)
      showToast(`Ticket ${selectedTicket.ticketCode} updated!`)
      loadTickets()
    } catch (err) {
      alert(err.message || 'Failed to update ticket.')
    }
  }

  const handleDelete = async (ticket) => {
    if (!window.confirm(`Delete ticket #${ticket.ticketCode}?`)) return
    try {
      await deleteSupportTicket(ticket.id)
      showToast(`Ticket #${ticket.ticketCode} deleted.`)
      loadTickets()
    } catch (err) {
      alert(err.message || 'Failed to delete ticket.')
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
      <div className={styles.header}>
        <div>
          <h2><Headphones size={22} style={{ color: '#E11D48' }} /> Operations Helpdesk & Incident Desk</h2>
          <p>Real-time delivery escalations, transit discrepancies, rider distress signals & customer care triage.</p>
        </div>
        <button type="button" className={styles.primaryBtn} onClick={() => setCreateModalOpen(true)}>
          <Plus size={16} /> Log Escalation Ticket
        </button>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <small>Urgent Incidents</small>
            <strong>{stats.urgentCount} High Priority</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <Clock size={22} />
          </div>
          <div>
            <small>Open Triage</small>
            <strong>{stats.openCount} Unresolved</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#FFFBEB', color: '#D97706' }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <small>Under Investigation</small>
            <strong>{stats.inProgressCount} In Progress</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#ECFDF5', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <small>Resolved Tickets</small>
            <strong>{stats.resolvedCount} Closed</strong>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterCard}>
        <div className={styles.searchWrap}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search tickets by ID, customer name, phone, subject, or order ID..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <select
          value={filters.priority}
          onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value }))}
          className={styles.selectFilter}
        >
          <option value="ALL">All Priorities</option>
          <option value="URGENT">URGENT</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        <select
          value={filters.status}
          onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className={styles.selectFilter}
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>

        <button type="button" className={styles.viewBtn} onClick={loadTickets} title="Reload tickets">
          <RefreshCw size={15} className={loading ? styles.spin : ''} />
        </button>
      </div>

      {/* Tickets Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ticket Code</th>
              <th>Priority</th>
              <th>Incident Subject</th>
              <th>Linked Order</th>
              <th>Customer</th>
              <th>Assigned Desk</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#94A3B8' }}>
                  {loading ? 'Fetching support queue...' : 'No incident tickets found matching the criteria.'}
                </td>
              </tr>
            ) : (
              tickets.map(t => (
                <tr key={t.id || t.ticketCode}>
                  <td>
                    <strong className={styles.ticketCode} onClick={() => handleOpenManage(t)}>
                      {t.ticketCode}
                    </strong>
                    <span className={styles.metaSub}>
                      {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.priorityBadge} ${styles['priority_' + t.priority]}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#0F172A', display: 'block' }}>{t.subject}</strong>
                    <span className={styles.metaSub}>{t.category.replace(/_/g, ' ')}</span>
                  </td>
                  <td>
                    {t.orderBookingNumber ? (
                      <span style={{ fontWeight: 700, color: '#2563EB' }}>#{t.orderBookingNumber}</span>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>General</span>
                    )}
                  </td>
                  <td>
                    <strong>{t.customerName}</strong>
                    <span className={styles.metaSub}>{t.customerPhone}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{t.assignedAgent}</span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles['status_' + t.status]}`}>
                      {t.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className={styles.viewBtn}
                        onClick={() => handleOpenManage(t)}
                        title="Triage & Resolve Ticket"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        className={styles.viewBtn}
                        style={{ color: '#DC2626' }}
                        onClick={() => handleDelete(t)}
                        title="Delete Ticket"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Ticket Modal */}
      {createModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setCreateModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>Log Operational Incident / Escalation</h3>
              <button type="button" onClick={() => setCreateModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Incident Subject *</label>
                <input
                  required
                  placeholder="e.g. Courier delay due to flat tyre"
                  value={createForm.subject}
                  onChange={e => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select
                    value={createForm.category}
                    onChange={e => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="DELIVERY_DELAY">Delivery Delay</option>
                    <option value="DAMAGED_PARCEL">Damaged Consignment</option>
                    <option value="ADDRESS_ISSUE">Address Not Located</option>
                    <option value="PAYMENT_REFUND">Payment / Refund</option>
                    <option value="RIDER_SOS">Rider SOS Distress</option>
                    <option value="GENERAL">General Inquiries</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Urgency / Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={e => setCreateForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="URGENT">URGENT</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className={styles.formGroup}>
                  <label>Customer Name *</label>
                  <input
                    required
                    value={createForm.customerName}
                    onChange={e => setCreateForm(prev => ({ ...prev, customerName: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Customer Phone *</label>
                  <input
                    required
                    value={createForm.customerPhone}
                    onChange={e => setCreateForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className={styles.formGroup}>
                  <label>Linked Booking Number (Optional)</label>
                  <input
                    placeholder="e.g. DLV-29840"
                    value={createForm.orderBookingNumber}
                    onChange={e => setCreateForm(prev => ({ ...prev, orderBookingNumber: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Assign To Agent</label>
                  <input
                    value={createForm.assignedAgent}
                    onChange={e => setCreateForm(prev => ({ ...prev, assignedAgent: e.target.value }))}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Incident Details & Observations *</label>
                <textarea
                  required
                  rows={3}
                  value={createForm.description}
                  onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Ticket Modal */}
      {manageModalOpen && selectedTicket && (
        <div className={styles.modalOverlay} onClick={() => setManageModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className={styles.modalHead}>
              <div>
                <h3>Manage Ticket #{selectedTicket.ticketCode}</h3>
                <small style={{ color: '#64748B' }}>{selectedTicket.subject}</small>
              </div>
              <button type="button" onClick={() => setManageModalOpen(false)}><X size={18} /></button>
            </div>

            <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, marginBottom: 14, fontSize: 12 }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>Customer:</strong> {selectedTicket.customerName} ({selectedTicket.customerPhone})</p>
              {selectedTicket.orderBookingNumber && (
                <p style={{ margin: '0 0 4px 0' }}><strong>Order Ref:</strong> #{selectedTicket.orderBookingNumber} ({selectedTicket.serviceKey})</p>
              )}
              <p style={{ margin: '4px 0 0 0', color: '#475569' }}><strong>Description:</strong> {selectedTicket.description}</p>
            </div>

            <form onSubmit={handleUpdate} className={styles.modalForm}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className={styles.formGroup}>
                  <label>Update Status</label>
                  <select
                    value={updateForm.status}
                    onChange={e => setUpdateForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Priority</label>
                  <select
                    value={updateForm.priority}
                    onChange={e => setUpdateForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="URGENT">URGENT</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Assigned Support Agent / Officer</label>
                <input
                  value={updateForm.assignedAgent}
                  onChange={e => setUpdateForm(prev => ({ ...prev, assignedAgent: e.target.value }))}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Resolution Log & Internal Notes</label>
                <textarea
                  rows={3}
                  placeholder="Document actions taken, refund ARN, rider reassignment, or customer confirmation..."
                  value={updateForm.resolutionNotes}
                  onChange={e => setUpdateForm(prev => ({ ...prev, resolutionNotes: e.target.value }))}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setManageModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Update Resolution</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
