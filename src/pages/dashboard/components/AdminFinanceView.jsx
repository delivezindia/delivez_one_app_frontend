import React, { useEffect, useState } from 'react'
import {
  WalletCards,
  ReceiptIndianRupee,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Send
} from 'lucide-react'
import { fetchAdminFinanceSummary, triggerAdminSettlement } from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminFinanceView.module.css'

export default function AdminFinanceView() {
  const [finance, setFinance] = useState(null)
  const [settling, setSettling] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetchAdminFinanceSummary().then(setFinance).catch(console.error)
  }, [])

  const handleRunSettlement = async () => {
    setSettling(true)
    try {
      const res = await triggerAdminSettlement()
      setToast(res?.message || 'Settlement completed!')
      setTimeout(() => setToast(''), 4000)
    } catch (e) {
      alert(e.message || 'Settlement failed.')
    } finally {
      setSettling(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      {toast && <div className={styles.toast}><CheckCircle2 size={16} color="#10B981" /> {toast}</div>}

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <small>Gross Platform GMV</small>
          <strong>{finance ? `₹${Number(finance.grossMerchandiseValue || 0).toLocaleString('en-IN')}` : '—'}</strong>
          <span>Total customer collections</span>
        </div>
        <div className={styles.kpiCard}>
          <small>Net Platform Revenue</small>
          <strong style={{ color: '#059669' }}>{finance ? `₹${Number(finance.netPlatformRevenue || 0).toLocaleString('en-IN')}` : '—'}</strong>
          <span>Platform commissions & margins</span>
        </div>
        <div className={styles.kpiCard}>
          <small>Rider Payouts Payable</small>
          <strong style={{ color: '#E11D48' }}>{finance ? `₹${Number(finance.partnerPayoutsPayable || 0).toLocaleString('en-IN')}` : '—'}</strong>
          <span>Disbursed via automated batching</span>
        </div>
        <div className={styles.kpiCard}>
          <small>GST & Taxes Collected</small>
          <strong>{finance ? `₹${Number(finance.taxesCollected || 0).toLocaleString('en-IN')}` : '—'}</strong>
          <span>Statutory tax compliance</span>
        </div>
      </div>

      {/* Settlement Action Banner */}
      <div className={styles.settleBanner}>
        <div>
          <h3>Weekly Partner Automatic Settlement Batch</h3>
          <p>Scheduled auto-disbursement to 48 verified rider bank accounts via IMPS/NEFT rails.</p>
        </div>
        <button type="button" className={styles.settleBtn} disabled={settling} onClick={handleRunSettlement}>
          <Send size={15} /> {settling ? 'Processing Batch...' : 'Trigger Settlement Run'}
        </button>
      </div>

      {/* Settlement History Table */}
      <div className={styles.card}>
        <h3 className={styles.cardHeading}>Disbursement Batches History</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Period</th>
              <th>Riders</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Settled At</th>
            </tr>
          </thead>
          <tbody>
            {(finance?.settlementBatches || []).map(b => (
              <tr key={b.id}>
                <td><strong>{b.id}</strong></td>
                <td>{b.period}</td>
                <td>{b.totalRiders} Partners</td>
                <td><strong>₹{b.payoutAmount.toLocaleString('en-IN')}</strong></td>
                <td><span className={styles.settledBadge}>{b.status}</span></td>
                <td>{b.settledAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
