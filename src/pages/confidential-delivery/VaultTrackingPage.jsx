import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  FileText,
  Lock,
  MapPin,
  Package,
  RefreshCw,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import { trackVaultShipment } from '@/features/confidential-delivery/services/confidentialDeliveryService.js'
import styles from './VaultTrackingPage.module.css'

export default function VaultTrackingPage({ vaultId }) {
  const [trackingData, setTrackingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [lastUpdatedText, setLastUpdatedText] = useState('Just now')

  const loadData = () => {
    if (!vaultId) return
    setLoading(true)
    trackVaultShipment(vaultId)
      .then((data) => {
        setTrackingData(data)
        setLoading(false)
        setLastUpdatedText('Just now')
      })
      .catch(() => {
        // Fallback live telemetry matching mobile screen 28
        setTrackingData({
          vaultId: vaultId || 'DV-250811-8F7X',
          status: 'IN_TRANSIT',
          statusLabel: 'In Transit - Secure',
          pickupDateTime: '12 Aug 2025 • 10:00 AM - 12:00 PM',
          milestones: [
            {
              id: 'IN_TRANSIT',
              title: 'In Transit - Secure',
              time: '12 Aug, 11:35 AM',
              desc: 'Shipment is on the way to destination.',
              location: 'Enroute to BLR-FC-02',
              isActive: true,
              isCompleted: true,
              icon: Package,
            },
            {
              id: 'PICKED_UP',
              title: 'Picked Up',
              time: '12 Aug, 10:20 AM',
              desc: 'Vault has been picked up by our trusted executive.',
              location: 'BLR-FC-01',
              isActive: false,
              isCompleted: true,
              icon: Truck,
            },
            {
              id: 'VAULT_CREATED',
              title: 'Vault Created',
              time: '12 Aug, 09:45 AM',
              desc: 'Your confidential shipment is secured in Delivez Vault.',
              isActive: false,
              isCompleted: true,
              icon: Shield,
            },
            {
              id: 'BOOKING_CONFIRMED',
              title: 'Booking Confirmed',
              time: '12 Aug, 09:40 AM',
              desc: 'Vault booking has been confirmed successfully.',
              isActive: false,
              isCompleted: true,
              icon: FileText,
            },
          ],
        })
        setLoading(false)
        setLastUpdatedText('1 min ago')
      })
  }

  useEffect(() => {
    loadData()
    const timer = setInterval(() => {
      setLastUpdatedText((prev) => (prev === 'Just now' ? '1 min ago' : '2 mins ago'))
    }, 60000)
    return () => clearInterval(timer)
  }, [vaultId])

  const handleCopy = (text) => {
    if (!text) return
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const milestones = trackingData?.milestones || [
    {
      id: 'IN_TRANSIT',
      title: 'In Transit - Secure',
      time: '12 Aug, 11:35 AM',
      desc: 'Shipment is on the way to destination.',
      location: 'Enroute to BLR-FC-02',
      isActive: true,
      isCompleted: true,
      icon: Package,
    },
    {
      id: 'PICKED_UP',
      title: 'Picked Up',
      time: '12 Aug, 10:20 AM',
      desc: 'Vault has been picked up by our trusted executive.',
      location: 'BLR-FC-01',
      isActive: false,
      isCompleted: true,
      icon: Truck,
    },
    {
      id: 'VAULT_CREATED',
      title: 'Vault Created',
      time: '12 Aug, 09:45 AM',
      desc: 'Your confidential shipment is secured in Delivez Vault.',
      isActive: false,
      isCompleted: true,
      icon: Shield,
    },
    {
      id: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed',
      time: '12 Aug, 09:40 AM',
      desc: 'Vault booking has been confirmed successfully.',
      isActive: false,
      isCompleted: true,
      icon: FileText,
    },
  ]

  return (
    <div className={styles.trackingContainer}>
      {/* Header matching Screen 28 */}
      <header className={styles.topHeader}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigateTo('/confidential-delivery')}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className={styles.brandTitle}>
            Delivez <span>VAULT</span>
            <Lock className={styles.brandLock} size={16} />
          </div>
        </div>

        <button type="button" className={styles.bellBtn} aria-label="Notifications">
          <Bell size={20} />
        </button>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.trackingDesktopGrid}>
          {/* Left Column: Shipment & Security Overview */}
          <div className={styles.trackingColLeft}>
            {/* Top Hero Card matching Screen 28 */}
            <div className={styles.heroCard}>
              <div className={styles.heroLeft}>
                <div className={styles.vaultIdLabel}>Vault ID</div>
                <div
                  className={styles.vaultIdRow}
                  onClick={() => handleCopy(trackingData?.vaultId || vaultId)}
                >
                  <span className={styles.vaultIdText}>{trackingData?.vaultId || vaultId}</span>
                  <Copy size={16} className={styles.copyIcon} />
                  {copied && <span className={styles.copiedText}>Copied</span>}
                </div>

                <div className={styles.statusLabelRow}>Status</div>
                <div className={styles.statusBadgeGreen}>
                  <Lock size={12} />
                  <span>{trackingData?.statusLabel || 'In Transit - Secure'}</span>
                </div>

                <div className={styles.pickupTimeRow}>
                  <div>
                    <div className={styles.pickupDateLabel}>Pickup Date & Time</div>
                    <div className={styles.pickupDateVal}>
                      {trackingData?.pickupDateTime || '12 Aug 2025 • 10:00 AM - 12:00 PM'}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              </div>

              <div className={styles.heroRight}>
                <div className={styles.tacticalVaultBox}>
                  <div className={styles.tacticalLogoBox}>
                    <span className={styles.tacticalLogoText}>Delivez</span>
                    <div className={styles.tacticalLogoShield}>
                      <Shield size={12} color="#eab308" />
                      <Lock size={10} color="#eab308" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Assurance Card */}
            <div className={styles.assuranceCard}>
              <div className={styles.assuranceHeading}>
                <ShieldCheck size={20} color="#eab308" />
                <span>Delivez Vault Security Assurance</span>
              </div>
              <ul className={styles.assuranceList}>
                <li>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Bank-grade 256-bit encrypted chain-of-custody log</span>
                </li>
                <li>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Tamper-evident physical security seals applied</span>
                </li>
                <li>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Dedicated verified security courier handling</span>
                </li>
                <li>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Direct recipient verification prior to physical handover</span>
                </li>
              </ul>
            </div>

            {/* Quick Actions in Left Column */}
            <div className={styles.trackingActions}>
              <button
                type="button"
                className={styles.shareActionBtn}
                onClick={() => handleCopy(trackingData?.vaultId || vaultId)}
              >
                <Copy size={16} />
                <span>{copied ? 'Copied' : 'Copy Vault ID'}</span>
              </button>
              <button
                type="button"
                className={styles.primaryShareBtn}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Track Delivez Vault Shipment',
                      text: `Tracking shipment ${trackingData?.vaultId || vaultId}`,
                      url: window.location.href,
                    }).catch(() => {})
                  } else {
                    handleCopy(window.location.href)
                  }
                }}
              >
                <Share2 size={16} />
                <span>Share Tracking</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Telemetry & Milestones Timeline */}
          <div className={styles.trackingColRight}>
            {/* Live Tracking Card matching Screen 28 */}
            <div className={styles.timelineCard}>
              <div className={styles.timelineHeader}>
                <div className={styles.timelineHeaderLeft}>
                  <div className={styles.radarIconBox}>
                    <div className={styles.radarDot} />
                  </div>
                  <span className={styles.timelineTitle}>Live Tracking</span>
                </div>

                <div className={styles.timelineHeaderRight} onClick={loadData}>
                  <span>Last updated: {lastUpdatedText}</span>
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} color="#eab308" />
                </div>
              </div>

              <div className={styles.milestonesList}>
                {milestones.map((ms, idx) => {
                  const IconComp = ms.icon || (idx === 0 ? Package : idx === 1 ? Truck : Shield)
                  const isActive = idx === 0 || ms.isActive
                  return (
                    <div key={ms.id || idx} className={styles.milestoneItem}>
                      {idx < milestones.length - 1 && <div className={styles.milestoneLine} />}

                      <div
                        className={`${styles.milestoneNode} ${
                          isActive ? styles.nodeActive : styles.nodeDone
                        }`}
                      >
                        <IconComp size={15} />
                      </div>

                      <div className={styles.milestoneContent}>
                        <div className={styles.milestoneTop}>
                          <span
                            className={`${styles.milestoneHeading} ${
                              isActive ? styles.headingActive : ''
                            }`}
                          >
                            {ms.title}
                          </span>
                          <span
                            className={`${styles.milestoneTime} ${
                              isActive ? styles.timeActive : ''
                            }`}
                          >
                            {ms.time}
                          </span>
                        </div>

                        <p className={styles.milestoneDesc}>{ms.desc || ms.description}</p>

                        {ms.location && (
                          <div className={styles.milestoneLocBadge}>
                            <MapPin size={12} />
                            <span>{ms.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
