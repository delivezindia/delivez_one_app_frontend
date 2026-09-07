
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  Headphones,
  Info,
  Lock,
  MapPin,
  MapPinned,
  MessageSquare,
  Package,
  Phone,
  QrCode,
  Send,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Truck,
  User,
  X,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import {
  cancelVaultBooking,
  fetchVaultBookingById,
  trackVaultShipment,
  verifyVaultOtp,
} from '@/features/confidential-delivery/services/confidentialDeliveryService.js'
import styles from './VaultTrackingPage.module.css'

export default function VaultTrackingPage({ vaultId }) {
  const [trackingData, setTrackingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)

  // Modals state
  const [activeModal, setActiveModal] = useState(null) // 'DETAILS' | 'SECURITY' | 'CHAT' | 'CALL'
  const [otpInput, setOtpInput] = useState('')
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpMessage, setOtpMessage] = useState('')

  // Chat Drawer messages state
  const [chatMessages, setChatMessages] = useState([
    { sender: 'SUPPORT', text: 'Hello! I am your Delivez Vault Security Assistant. How can I assist you with your confidential shipment today?' },
  ])
  const [chatInput, setChatInput] = useState('')

  const loadData = () => {
    if (!vaultId) return
    setLoading(true)
    trackVaultShipment(vaultId)
      .then((data) => {
        setTrackingData(data)
        setLoading(false)
      })
      .catch((err) => {
        setErrorMsg(err?.message || 'Unable to load Vault tracking details.')
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [vaultId])

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otpInput || otpInput.trim().length < 4) return
    setVerifyingOtp(true)
    setOtpMessage('')
    try {
      await verifyVaultOtp(vaultId, otpInput)
      setOtpMessage('Handover OTP verified successfully! Shipment marked as Delivered.')
      loadData()
    } catch (err) {
      setOtpMessage(err?.message || 'OTP verification failed. Please re-enter the code.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handleSendChat = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatMessages(prev => [...prev, { sender: 'USER', text: userMsg }])
    setChatInput('')
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'SUPPORT',
          text: `Thank you for contacting Delivez Vault Support. Your inquiry regarding Vault ${vaultId} has been logged in our secure chain of custody. An operations executive is actively monitoring your transit.`,
        },
      ])
    }, 1000)
  }

  if (loading && !trackingData) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308', gap: '12px' }}>
          <Shield className="animate-spin" size={32} />
          <strong>Accessing Encrypted Vault Telemetry...</strong>
        </div>
      </div>
    )
  }

  const isDelivered = trackingData?.status === 'DELIVERED'
  const isCancelled = trackingData?.status === 'CANCELLED'

  return (
    <div className={styles.pageContainer}>
      {/* Top Dark Header */}
      <header className={styles.topDarkHeader}>
        <div className={styles.headerInner}>
          <button type="button" className={styles.backBtn} onClick={() => navigateTo('/user/dashboard')} title="Back to Dashboard">
            <ArrowLeft size={20} />
          </button>
          <div className={styles.brandCenter}>
            <Shield className={styles.lockIconHeader} size={26} />
            <div>
              <h2>DELIVEZ <span>VAULT</span></h2>
            </div>
          </div>
          <button type="button" className={styles.backBtn} onClick={() => handleCopy(window.location.href)} title="Share Tracking Link">
            <Share2 size={18} />
          </button>
        </div>
      </header>

      <main className={styles.mainWrapper}>
        {/* Vault ID & Status Card */}
        <section className={styles.vaultHeroCard}>
          <div className={styles.heroLeft}>
            <h1>
              <span>{trackingData?.vaultId || vaultId}</span>
              <button type="button" className={styles.copyBadge} onClick={() => handleCopy(trackingData?.vaultId || vaultId)}>
                <Copy size={13} /> {copied ? 'Copied' : 'Copy'}
              </button>
            </h1>
            <div className={styles.heroMeta}>
              <span><Clock size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Last updated: {trackingData?.lastUpdated || 'Just now'}</span>
              <span><ShieldCheck size={14} style={{ display: 'inline', verticalAlign: '-2px', color: '#16a34a' }} /> AES-256 Verified</span>
            </div>
          </div>

          <div>
            <div className={`${styles.statusPill} ${isDelivered ? styles.statusPillDelivered : (isCancelled ? styles.statusPillCancelled : '')}`}>
              <span className={styles.pulseDot} />
              <span>{trackingData?.statusBadge || 'In Transit - Secure'}</span>
            </div>
          </div>
        </section>

        {/* Milestone Timeline */}
        <section className={styles.sectionCard}>
          <div className={styles.cardTitle}>
            <span>Chain of Custody Timeline</span>
            <small style={{ fontSize: '0.78rem', color: '#ca8a04', fontWeight: '700' }}>Live Milestone Telemetry</small>
          </div>

          <div className={styles.timelineList}>
            <div className={styles.timelineLine} />
            {trackingData?.milestones?.map((m) => (
              <div
                key={m.id}
                className={`${styles.timelineItem} ${m.current ? styles.timelineActive : ''} ${m.completed ? styles.timelineCompleted : ''}`}
              >
                <div className={styles.timelineDot}>
                  {m.completed ? <CheckCircle2 size={14} /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1' }} />}
                </div>
                <div className={styles.timelineContent}>
                  <h4>
                    <span>{m.title}</span>
                    <span className={styles.timelineTime}>{m.time}</span>
                  </h4>
                  <p>{m.description}</p>
                  {m.facilityCode && (
                    <span className={styles.facilityTag}>
                      <MapPin size={12} /> Facility: {m.facilityCode}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Real-time Telemetry & Map Card */}
        <section className={styles.locationCard}>
          <div className={styles.locationLeft}>
            <small style={{ color: '#ca8a04', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.06em' }}>
              Current Transit Location
            </small>
            <h4>{trackingData?.currentLocation?.address || 'Near Hebbal Flyover, Bengaluru, Karnataka'}</h4>
            <p className={styles.locationSub}>{trackingData?.currentLocation?.subtext || 'Enroute to destination facility'}</p>
            <div className={styles.etaBadge}>
              <Clock size={15} />
              <span>ETA: {trackingData?.currentLocation?.eta || 'Today, 02:15 PM'}</span>
            </div>
          </div>

          <div className={styles.miniMapVisual}>
            <div className={styles.mapGridLines} />
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
              <span>LAT: {trackingData?.currentLocation?.coordinates?.lat || 13.0358}</span>
              <span>LNG: {trackingData?.currentLocation?.coordinates?.lng || 77.5970}</span>
            </div>
            <div className={styles.vehicleMarker}>
              <Truck size={16} />
            </div>
            <div style={{ position: 'relative', zIndex: 2, fontSize: '0.72rem', color: '#eab308', fontWeight: '700' }}>
              GPS LOCK: ACTIVE & ENCRYPTED
            </div>
          </div>
        </section>

        {/* Security Executive Profile Card */}
        {trackingData?.executive && (
          <section className={styles.executiveCard}>
            <div className={styles.execLeft}>
              <div className={styles.execAvatar}>{trackingData.executive.name[0]}</div>
              <div className={styles.execInfo}>
                <h4>{trackingData.executive.name}</h4>
                <span className={styles.execBadge}>Badge: {trackingData.executive.badgeId}</span>
                <span className={styles.execClearance}>
                  <ShieldCheck size={14} /> {trackingData.executive.securityClearance}
                </span>
              </div>
            </div>
            <button type="button" className={styles.callExecBtn} onClick={() => setActiveModal('CALL')}>
              <Phone size={15} /> Contact Executive
            </button>
          </section>
        )}

        {/* 4 Action Buttons Grid */}
        <section className={styles.actionsGrid}>
          <div className={styles.actionTile} onClick={() => setActiveModal('CALL')}>
            <Phone size={22} className={styles.actionTileIcon} />
            <span>Contact Executive</span>
          </div>
          <div className={styles.actionTile} onClick={() => setActiveModal('CHAT')}>
            <MessageSquare size={22} className={styles.actionTileIcon} />
            <span>Chat Support</span>
          </div>
          <div className={styles.actionTile} onClick={() => setActiveModal('DETAILS')}>
            <FileText size={22} className={styles.actionTileIcon} />
            <span>Shipment Details</span>
          </div>
          <div className={styles.actionTile} onClick={() => setActiveModal('SECURITY')}>
            <ShieldCheck size={22} className={styles.actionTileIcon} />
            <span>Security Info</span>
          </div>
        </section>

        {/* Recipient OTP Verification Handover Card */}
        {!isDelivered && !isCancelled && (
          <section className={styles.otpCard}>
            <div className={styles.otpRow}>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: '800', color: '#854d0e' }}>
                  Recipient Handover Verification
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#713f12' }}>
                  At delivery, enter the recipient OTP to authorize custody handover & mark as delivered.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className={styles.otpInputGroup}>
                <input
                  type="text"
                  className={styles.otpInput}
                  maxLength={6}
                  placeholder="1234"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                />
                <button type="submit" className={styles.verifyOtpBtn} disabled={verifyingOtp || otpInput.length < 4}>
                  {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            </div>
            {otpMessage && (
              <p style={{ margin: '10px 0 0', fontSize: '0.84rem', fontWeight: '700', color: otpMessage.includes('successfully') ? '#16a34a' : '#dc2626' }}>
                {otpMessage}
              </p>
            )}
          </section>
        )}

        {/* Security First Alert Banner */}
        <section className={styles.securityNoticeCard}>
          <ShieldAlert size={24} />
          <div>
            <strong style={{ display: 'block', marginBottom: '2px' }}>Security First</strong>
            <span>Do not share your Vault ID or OTP with anyone except the authorized executive at physical handover.</span>
          </div>
        </section>
      </main>

      {/* MODAL: Shipment Details */}
      {activeModal === 'DETAILS' && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Vault Shipment Details</h3>
              <button type="button" className={styles.closeBtn} onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              <div><strong>Vault ID:</strong> {trackingData?.vaultId || vaultId}</div>
              <div><strong>Pickup:</strong> {trackingData?.route?.from || 'Pickup Location'}</div>
              <div><strong>Delivery:</strong> {trackingData?.route?.to || 'Delivery Location'}</div>
              <div><strong>Recipient:</strong> {trackingData?.recipient?.name || 'Anita Verma'} ({trackingData?.recipient?.phone || 'Masked'})</div>
              <div><strong>Encryption:</strong> AES-256 End-to-End Encrypted</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Security Info */}
      {activeModal === 'SECURITY' && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Delivez Vault Security Protocols</h3>
              <button type="button" className={styles.closeBtn} onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.7', fontSize: '0.88rem', color: '#334155' }}>
              <li><strong>Tamper-Evident Seals:</strong> Unique numbered void-tape barcodes inspected at every transit milestone.</li>
              <li><strong>Direct Escort Custody:</strong> Level 3 verified executives with biometric & background validation.</li>
              <li><strong>Dual-Party OTP:</strong> Physical handover requires instant real-time OTP confirmation.</li>
              <li><strong>Encrypted Telemetry:</strong> Real-time live milestone logs secured with AES-256 protocols.</li>
            </ul>
          </div>
        </div>
      )}

      {/* MODAL: Call Executive */}
      {activeModal === 'CALL' && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Contact Custody Executive</h3>
              <button type="button" className={styles.closeBtn} onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fef08a', color: '#854d0e', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.4rem' }}>
                V
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: '1.2rem' }}>Vikram S.</h4>
              <p style={{ color: '#64748b', margin: '0 0 16px', fontSize: '0.85rem' }}>Badge: EXEC-7729 • Level 3 Custody Certified</p>
              <a
                href="tel:+919876543210"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#16a34a', color: '#ffffff', borderRadius: '12px', textDecoration: 'none', fontWeight: '800' }}
              >
                <Phone size={18} /> Call +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Chat Support */}
      {activeModal === 'CHAT' && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalCard} style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Vault Live Security Chat</h3>
              <button type="button" className={styles.closeBtn} onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>
            <div style={{ height: '260px', overflowY: 'auto', background: '#f8fafc', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              {chatMessages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.sender === 'USER' ? 'flex-end' : 'flex-start',
                    background: m.sender === 'USER' ? '#dc2626' : '#ffffff',
                    color: m.sender === 'USER' ? '#ffffff' : '#0f172a',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    fontSize: '0.85rem',
                    maxWidth: '80%',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask about shipment status, instructions..."
                style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.88rem' }}
              />
              <button type="submit" style={{ padding: '10px 18px', background: '#eab308', color: '#0f172a', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
