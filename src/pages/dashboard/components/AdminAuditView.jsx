import React, { useCallback, useEffect, useState } from 'react'
import {
  FileClock,
  Search,
  Download,
  Shield,
  RefreshCw,
  User,
  Filter,
  CheckCircle2
} from 'lucide-react'
import {
  fetchAuditLogs,
  exportAuditLogsCsv
} from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminAuditView.module.css'

export default function AdminAuditView() {
  const [logs, setLogs] = useState([])
  const [category, setCategory] = useState('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState(['ALL', 'ORDERS', 'FLEET', 'SETTINGS', 'SECURITY', 'PRICING', 'PROMOS'])

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAuditLogs(category, search)
      if (data) {
        setLogs(data.logs || [])
        if (data.categories) setCategories(data.categories)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [category, search])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const handleExport = () => {
    exportAuditLogsCsv()
  }

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2><FileClock size={22} style={{ color: '#475569' }} /> Enterprise Audit Trail & Security Logs</h2>
          <p>Chronological compliance activity stream recording administrative mutations, dispatch overrides, and settings changes.</p>
        </div>
        <button type="button" className={styles.exportBtn} onClick={handleExport}>
          <Download size={15} /> Export Audit Log (CSV)
        </button>
      </div>

      {/* Filter Card */}
      <div className={styles.filterCard}>
        <div className={styles.searchWrap}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by action, description, admin name, or IP address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.categoryPills}>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              className={`${styles.pill} ${category === cat ? styles.pillActive : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <button type="button" className={styles.pill} onClick={loadLogs} title="Refresh logs">
          <RefreshCw size={13} className={loading ? styles.spin : ''} />
        </button>
      </div>

      {/* Audit Log Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Category</th>
              <th>Action Code</th>
              <th>Description & Changes</th>
              <th>Performed By</th>
              <th>Client IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#94A3B8' }}>
                  {loading ? 'Fetching compliance logs...' : 'No audit records found matching the filter.'}
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id}>
                  <td className={styles.timeCol}>
                    <strong>
                      {new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </strong>
                    <span style={{ display: 'block', fontSize: 11, color: '#94A3B8' }}>
                      {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>

                  <td>
                    <span className={`${styles.badge} ${styles['badge_' + log.category]}`}>
                      {log.category}
                    </span>
                  </td>

                  <td>
                    <span className={styles.actionCode}>{log.action}</span>
                  </td>

                  <td>
                    <strong style={{ color: '#0F172A', display: 'block' }}>{log.description}</strong>
                    {log.metadata && (
                      <small style={{ color: '#64748B', fontFamily: 'monospace', fontSize: 10 }}>
                        {JSON.stringify(log.metadata)}
                      </small>
                    )}
                  </td>

                  <td>
                    <strong>{log.actorName}</strong>
                    <span style={{ display: 'block', fontSize: 11, color: '#64748B' }}>{log.actorEmail}</span>
                  </td>

                  <td>
                    <span className={styles.ipPill}>
                      <Shield size={12} color="#0284C7" /> {log.ipAddress}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
