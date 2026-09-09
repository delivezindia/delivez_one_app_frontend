import React, { useCallback, useEffect, useState, useRef } from 'react'
import {
  FileClock,
  Search,
  Download,
  Shield,
  RefreshCw,
  User,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  X,
  Copy,
  Check,
  Activity,
  Layers,
  Clock,
  Calendar,
  Zap,
  Radio
} from 'lucide-react'
import {
  fetchAuditLogs,
  exportAuditLogsCsv
} from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminAuditView.module.css'

function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const diffMs = Date.now() - new Date(isoString).getTime()
  const sec = Math.max(0, Math.floor(diffMs / 1000))
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const days = Math.floor(hr / 24)
  return `${days}d ago`
}

export default function AdminAuditView() {
  const [logs, setLogs] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 })
  const [stats, setStats] = useState({
    totalEvents: 0,
    criticalEvents: 0,
    warningEvents: 0,
    successEvents: 0,
    todayEvents: 0,
    categoryCounts: {}
  })

  // Filters
  const [category, setCategory] = useState('ALL')
  const [severity, setSeverity] = useState('ALL')
  const [timeframe, setTimeframe] = useState('24h')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Polling & Drawer
  const [pollingInterval, setPollingInterval] = useState(15000) // Default 15s live stream
  const [loading, setLoading] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [copiedPayload, setCopiedPayload] = useState(false)

  const [categories, setCategories] = useState([
    'ALL',
    'ORDERS',
    'FLEET',
    'PRICING',
    'SETTINGS',
    'PROMOS',
    'SUPPORT',
    'CONTENT',
    'SECURITY',
    'USERS',
    'SYSTEM'
  ])

  const loadLogs = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true)
    try {
      const data = await fetchAuditLogs({
        category,
        severity,
        timeframe,
        search,
        page,
        limit: 25
      })

      if (data) {
        setLogs(data.logs || [])
        if (data.pagination) setPagination(data.pagination)
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(['ALL', ...data.categories.filter(c => c !== 'ALL')])
        }
        if (data.stats) setStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err)
    } finally {
      if (!isPolling) setLoading(false)
    }
  }, [category, severity, timeframe, search, page])

  // Initial and trigger-based load
  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  // Live Auto-Refresh Polling
  useEffect(() => {
    if (!pollingInterval || pollingInterval <= 0) return
    const interval = setInterval(() => {
      loadLogs(true)
    }, pollingInterval)
    return () => clearInterval(interval)
  }, [pollingInterval, loadLogs])

  const handleExport = () => {
    exportAuditLogsCsv()
  }

  const handleCopyPayload = (payload) => {
    try {
      navigator.clipboard.writeText(typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2))
      setCopiedPayload(true)
      setTimeout(() => setCopiedPayload(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  const getTopCategory = () => {
    const counts = stats.byCategory || stats.categoryCounts
    if (!counts || Object.keys(counts).length === 0) return 'ORDERS'
    let top = 'ORDERS'
    let max = -1
    Object.entries(counts).forEach(([cat, count]) => {
      if (count > max) {
        max = count
        top = cat
      }
    })
    return top
  }

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2>
            <FileClock size={22} style={{ color: '#0F172A' }} />
            Enterprise Audit Trail & Live Site Activity
          </h2>
          <p>
            Real-time compliance ledger recording every mutation, order status change, dispatch action, dynamic pricing update, and system event across Delivez.
          </p>
        </div>

        <div className={styles.headerActions}>
          {/* Live Polling Toggle */}
          <div className={styles.livePollWrap}>
            <div className={`${styles.pulseBeacon} ${pollingInterval === 0 ? styles.beaconInactive : ''}`} />
            <span>Live Stream:</span>
            <select
              className={styles.pollSelect}
              value={pollingInterval}
              onChange={e => setPollingInterval(Number(e.target.value))}
            >
              <option value={0}>Off</option>
              <option value={5000}>5 sec</option>
              <option value={15000}>15 sec (Default)</option>
              <option value={30000}>30 sec</option>
            </select>
          </div>

          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => loadLogs(false)}
            title="Refresh stream manually"
          >
            <RefreshCw size={13} className={loading ? styles.spin : ''} />
            <span>Refresh</span>
          </button>

          <button type="button" className={styles.exportBtn} onClick={handleExport}>
            <Download size={14} /> Export Audit Log (CSV)
          </button>
        </div>
      </div>

      {/* KPI Metrics Summary Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIcon_blue}`}>
            <Activity size={22} />
          </div>
          <div className={styles.kpiMeta}>
            <span>Total Events Recorded</span>
            <strong>{stats.total ?? stats.totalEvents ?? pagination.total ?? logs.length}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIcon_red}`}>
            <AlertOctagon size={22} />
          </div>
          <div className={styles.kpiMeta}>
            <span>Critical Incidents</span>
            <strong style={{ color: (stats.critical ?? stats.criticalEvents) > 0 ? '#DC2626' : '#0F172A' }}>
              {stats.critical ?? stats.criticalEvents ?? 0}
            </strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIcon_emerald}`}>
            <Clock size={22} />
          </div>
          <div className={styles.kpiMeta}>
            <span>Activity Today (24h)</span>
            <strong>{stats.today ?? stats.todayEvents ?? logs.length}</strong>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIcon_purple}`}>
            <Layers size={22} />
          </div>
          <div className={styles.kpiMeta}>
            <span>Top Active Module</span>
            <strong>{getTopCategory()}</strong>
          </div>
        </div>
      </div>

      {/* Control Center & Filter Bar */}
      <div className={styles.filterCard}>
        <div className={styles.filterRowTop}>
          <div className={styles.searchWrap}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by action code, route, actor name, email, IP, or payload details..."
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
            {search && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => {
                  setSearch('')
                  setPage(1)
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className={styles.timeframeGroup}>
            {[
              { id: '1h', label: '1h' },
              { id: '24h', label: '24h' },
              { id: '7d', label: '7d' },
              { id: '30d', label: '30d' },
              { id: 'ALL', label: 'All Time' }
            ].map(tf => (
              <button
                key={tf.id}
                type="button"
                className={`${styles.tfBtn} ${timeframe === tf.id ? styles.tfBtnActive : ''}`}
                onClick={() => {
                  setTimeframe(tf.id)
                  setPage(1)
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterRowBottom}>
          <div className={styles.categoryPills}>
            <span className={styles.pillLabel}>Module:</span>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                className={`${styles.pill} ${category === cat ? styles.pillActive : ''}`}
                onClick={() => {
                  setCategory(cat)
                  setPage(1)
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.severityGroup}>
            <span className={styles.pillLabel}>Severity:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'CRITICAL', label: 'Critical' },
              { id: 'WARNING', label: 'Warning' },
              { id: 'SUCCESS', label: 'Success' },
              { id: 'INFO', label: 'Info' }
            ].map(sev => (
              <button
                key={sev.id}
                type="button"
                className={`${styles.sevBtn} ${styles['sevBtn_' + sev.id]} ${severity === sev.id ? styles.sevActive : ''}`}
                onClick={() => {
                  setSeverity(sev.id)
                  setPage(1)
                }}
              >
                {sev.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Time & Relative</th>
                <th>Severity</th>
                <th>Module</th>
                <th>Action Code</th>
                <th>Event Description & Target</th>
                <th>Executed By</th>
                <th>IP & Client</th>
                <th style={{ textAlign: 'right' }}>Inspection</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                    {loading ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <RefreshCw size={16} className={styles.spin} />
                        <span>Streaming compliance records...</span>
                      </div>
                    ) : (
                      'No audit records found matching the active filter criteria.'
                    )}
                  </td>
                </tr>
              ) : (
                logs.map(log => {
                  const severityClass = styles['sevBadge_' + (log.severity || 'INFO')] || styles.sevBadge_INFO
                  return (
                    <tr key={log.id}>
                      <td className={styles.timeCol}>
                        <span className={styles.timeRelative}>{formatRelativeTime(log.timestamp)}</span>
                        <span className={styles.timeExact}>
                          {new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}{' '}
                          {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </td>

                      <td>
                        <span className={`${styles.sevBadge} ${severityClass}`}>
                          <span className={styles.sevDot} />
                          {log.severity || 'INFO'}
                        </span>
                      </td>

                      <td>
                        <span className={`${styles.badge} ${styles['badge_' + log.category] || styles.badge_GENERAL}`}>
                          {log.category}
                        </span>
                      </td>

                      <td>
                        <span className={styles.actionCode}>{log.action}</span>
                      </td>

                      <td className={styles.descCell}>
                        <div className={styles.descText}>{log.description}</div>
                        {log.resourceType && (
                          <span className={styles.resourceTag}>Target: {log.resourceType}</span>
                        )}
                      </td>

                      <td className={styles.actorCell}>
                        <div className={styles.actorName}>
                          <User size={13} style={{ color: '#64748B' }} />
                          <span>{log.actorName || 'System'}</span>
                          <span className={`${styles.actorRolePill} ${styles['role_' + (log.actorRole || 'USER')] || styles.role_USER}`}>
                            {log.actorRole || 'USER'}
                          </span>
                        </div>
                        {log.actorEmail && (
                          <span className={styles.actorEmail}>{log.actorEmail}</span>
                        )}
                      </td>

                      <td>
                        <span className={styles.ipPill}>
                          <Shield size={12} color="#0284C7" />
                          {log.ipAddress || '127.0.0.1'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className={styles.inspectBtn}
                          onClick={() => setSelectedLog(log)}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className={styles.paginationBar}>
          <div className={styles.pageStats}>
            Showing {logs.length > 0 ? (page - 1) * pagination.limit + 1 : 0} to{' '}
            {Math.min(page * pagination.limit, pagination.total || logs.length)} of {pagination.total || logs.length} events
          </div>

          <div className={styles.pageControls}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className={styles.pageNumber}>
              Page {page} of {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={page >= (pagination.totalPages || 1)}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Slide-Over Inspection Drawer */}
      {selectedLog && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedLog(null)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div className={styles.drawerHeaderTitle}>
                <h3>
                  <FileClock size={18} color="#2563EB" />
                  Event Inspection
                </h3>
                <span>Event ID: {selectedLog.id}</span>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setSelectedLog(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Event Metadata Grid */}
              <div className={styles.drawerMetaGrid}>
                <div className={styles.drawerMetaItem}>
                  <label>Timestamp</label>
                  <value>
                    {new Date(selectedLog.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'medium'
                    })}
                  </value>
                </div>

                <div className={styles.drawerMetaItem}>
                  <label>Severity</label>
                  <value>
                    <span className={`${styles.sevBadge} ${styles['sevBadge_' + (selectedLog.severity || 'INFO')]}`}>
                      <span className={styles.sevDot} />
                      {selectedLog.severity || 'INFO'}
                    </span>
                  </value>
                </div>

                <div className={styles.drawerMetaItem}>
                  <label>Module / Category</label>
                  <value>
                    <span className={`${styles.badge} ${styles['badge_' + selectedLog.category] || styles.badge_GENERAL}`}>
                      {selectedLog.category}
                    </span>
                  </value>
                </div>

                <div className={styles.drawerMetaItem}>
                  <label>Action Code</label>
                  <value>
                    <span className={styles.actionCode}>{selectedLog.action}</span>
                  </value>
                </div>

                <div className={styles.drawerMetaItem}>
                  <label>Executed By</label>
                  <value>{selectedLog.actorName} ({selectedLog.actorRole})</value>
                </div>

                <div className={styles.drawerMetaItem}>
                  <label>Actor Email</label>
                  <value>{selectedLog.actorEmail || 'N/A'}</value>
                </div>

                <div className={styles.drawerMetaItem}>
                  <label>IP Address</label>
                  <value>{selectedLog.ipAddress || '127.0.0.1'}</value>
                </div>

                <div className={styles.drawerMetaItem}>
                  <label>User Agent / Client</label>
                  <value style={{ fontSize: 11, fontFamily: 'monospace' }}>
                    {selectedLog.userAgent || 'Mozilla / Browser'}
                  </value>
                </div>
              </div>

              {/* Event Description Section */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>Description</div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 12, borderRadius: 10, fontSize: 13, lineHeight: 1.5, color: '#0F172A' }}>
                  {selectedLog.description}
                </div>
              </div>

              {/* Payload & Metadata Section */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionHeader}>
                  <div className={styles.drawerSectionTitle}>
                    Payload & Metadata
                  </div>
                  <button
                    type="button"
                    className={styles.copyPayloadBtn}
                    onClick={() => handleCopyPayload(selectedLog.metadata || selectedLog)}
                  >
                    {copiedPayload ? (
                      <>
                        <Check size={12} color="#059669" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy JSON
                      </>
                    )}
                  </button>
                </div>

                <pre className={styles.jsonBlock}>
                  {JSON.stringify(selectedLog.metadata || { event: selectedLog.action, target: selectedLog.resourceType }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
