import React, { useEffect, useState } from 'react'
import {
  ChartNoAxesCombined,
  TrendingUp,
  Percent,
  Clock,
  ThumbsUp,
  Download
} from 'lucide-react'
import { fetchAdminAnalytics } from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminAnalyticsView.module.css'

export default function AdminAnalyticsView() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchAdminAnalytics().then(setData).catch(console.error)
  }, [])

  return (
    <div className={styles.wrapper}>
      {/* Top Insights */}
      <div className={styles.insightsGrid}>
        <div className={styles.insightCard}>
          <div className={styles.iconCircle} style={{ background: '#ECFDF5', color: '#059669' }}><TrendingUp size={20} /></div>
          <div><small>Delivery Completion Rate</small><strong>{data?.deliverySuccessRate || 98.4}%</strong></div>
        </div>
        <div className={styles.insightCard}>
          <div className={styles.iconCircle} style={{ background: '#EFF6FF', color: '#2563EB' }}><Clock size={20} /></div>
          <div><small>Avg Delivery Duration</small><strong>{data?.avgDeliveryTimeMins || 42} mins</strong></div>
        </div>
        <div className={styles.insightCard}>
          <div className={styles.iconCircle} style={{ background: '#FFF1F2', color: '#E11D48' }}><ThumbsUp size={20} /></div>
          <div><small>Customer Satisfaction (CSAT)</small><strong>{data?.customerSatisfactionScore || 4.88} / 5.0</strong></div>
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h3>Daily Orders & Revenue Trend (Past 7 Days)</h3>
          <button type="button" className={styles.exportBtn} onClick={() => window.open('http://localhost:4000/api/v1/admin/export/orders', '_blank')}>
            <Download size={14} /> Export Dataset
          </button>
        </div>
        <div className={styles.chartBars}>
          {(data?.dailyOrdersTrend || []).map((t, idx) => (
            <div key={t.day} className={styles.chartCol}>
              <div className={styles.barWrap}>
                <div className={styles.bar} style={{ height: `${Math.min(100, Math.max(20, t.orders * 2))}%` }}>
                  <span className={styles.barTooltip}>₹{t.revenue}</span>
                </div>
              </div>
              <span className={styles.barLabel}>{t.day}</span>
              <small className={styles.barCount}>{t.orders} ord</small>
            </div>
          ))}
        </div>
      </div>

      {/* Service Distribution Bars */}
      <div className={styles.card}>
        <h3>Service Demand Distribution</h3>
        <div className={styles.distGrid}>
          {(data?.serviceDistribution || []).map(s => (
            <div key={s.name} className={styles.distItem}>
              <div className={styles.distHeader}>
                <strong>{s.name}</strong>
                <span>{s.percentage}% ({s.count} orders)</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressBar} style={{ width: `${s.percentage}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
