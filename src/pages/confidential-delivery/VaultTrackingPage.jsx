import React, { useEffect, useState } from 'react'
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
  FileCheck,
  Download,
  Info,
  ExternalLink,
  User,
  Phone,
  Layers,
  Key,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import { trackVaultShipment } from '@/features/confidential-delivery/services/confidentialDeliveryService.js'
import styles from './VaultTrackingPage.module.css'

export default function VaultTrackingPage({ vaultId: propVaultId }) {
  // Extract vaultId from props or URL pathname (/track/:id or ?vaultId=)
  const pathParts = window.location.pathname.split('/')
  const pathId = pathParts[pathParts.length - 1] !== 'confidential-delivery' && pathParts[pathParts.length - 1] !== 'track' ? pathParts[pathParts.length - 1] : ''
  const searchId = new URLSearchParams(window.location.search).get('vaultId') || ''
  const vaultId = propVaultId || searchId || pathId || 'DLVZ-VLT-99999'

  const [trackingData, setTrackingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('Timeline') // Timeline | Details | Security | Documents

  const loadData = () => {
    if (!vaultId) return
    setLoading(true)
    trackVaultShipment(vaultId)
      .then((data) => {
        setTrackingData(data)
        setLoading(false)
      })
      .catch((err) => {
        console.warn('Could not fetch live vault tracking, using active session data:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [vaultId])

  const copyVaultId = () => {
    navigator.clipboard.writeText(vaultId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Fallback defaults matching the Flutter source
  const data = trackingData || {
    vaultId: vaultId || 'DLVZ-VLT-99999',
    status: 'IN_TRANSIT',
    statusBadge: 'In Transit - Secure',
    pickupDate: 'Today, 10:00 AM - 12:00 PM',
    lastUpdated: 'Just now',
    milestones: [
      {
        id: 6,
        title: 'Shipment Delivered',
        time: 'Expected today by 06:00 PM',
        description: 'Shipment will be handed over strictly to the designated recipient.',
        location: 'Recipient Location',
        completed: false,
        current: false,
      },
      {
        id: 5,
        title: 'In Transit - Secure',
        time: 'Today, 11:35 AM',
        description: 'Shipment is in high-security transit with direct routing.',
        location: 'Enroute to BLR-FC-02',
        completed: true,
        current: true,
      },
      {
        id: 4,
        title: 'Picked Up',
        time: 'Today, 10:20 AM',
        description: 'Vault has been picked up & verified by our custody executive.',
        location: 'BLR-FC-01',
        completed: true,
        current: false,
      },
      {
        id: 3,
        title: 'Vault Created',
        time: 'Today, 09:45 AM',
        description: 'Your confidential shipment is registered & secured in Delivez Vault.',
        location: 'Bengaluru',
        completed: true,
        current: false,
      },
      {
        id: 2,
        title: 'Booking Confirmed',
        time: 'Today, 09:40 AM',
        description: 'Vault booking has been confirmed successfully.',
        completed: true,
        current: false,
      },
      {
        id: 1,
        title: 'Booking Initiated',
        time: 'Today, 09:35 AM',
        description: 'Service selected & delivery details verified.',
        completed: true,
        current: false,
      },
    ],
    currentLocation: {
      address: 'Near Hebbal Flyover, Bengaluru, Karnataka',
      subtext: 'Enroute to destination facility',
      eta: 'Today, 02:15 PM',
      coordinates: { lat: 13.0358, lng: 77.597 },
    },
    executive: {
      name: 'Vikram S.',
      badgeId: 'EXEC-7729',
      phone: '+91 98765 43210',
      securityClearance: 'Level 3 Custody Certified',
    },
    route: {
      from: 'Authorized Sender, MG Road, Bengaluru - 560001',
      to: 'Authorized Recipient, Indiranagar, Bengaluru - 560038',
    },
    details: {
      serviceType: 'Vault Secure',
      pickupDate: 'Today, 10:00 AM - 12:00 PM',
      expectedDelivery: 'Today by 06:00 PM',
      sender: {
        name: 'Authorized Sender',
        phone: '+91 98765 43210',
        address: 'MG Road, Bengaluru - 560001',
      },
      recipient: {
        name: 'Authorized Recipient',
        phone: '+91 98765 43211',
        address: 'Indiranagar, Bengaluru - 560038',
        designation: 'Authorized Signatory',
        verificationMethod: 'OTP Verification',
      },
      item: {
        type: 'Confidential Documents',
        description: 'Confidential Shipment in Delivez Vault',
        declaredValue: 50000,
      },
      packaging: {
        type: 'Tamper Proof Pouch',
        sealNumber: 'SEAL-DLVZ-78942',
      },
    },
    security: {
      securityLevel: 'Maximum Security',
      encryptionStandard: 'AES-256 End-to-End Encrypted',
      securityBadge: 'Norton SECURED',
      controls: [
        { name: 'Tamper-Proof Sealing', active: true, description: 'Tamper-evident high security seal' },
        { name: 'Single Point of Contact', active: true, description: 'Direct dedicated custody handover' },
        { name: 'Secure Storage at Hubs', active: true, description: 'Biometrically locked vault storage' },
        { name: 'Armed Escort (If Available)', active: false, description: 'Armed security personnel for critical consignments' },
        { name: 'No Unattended Delivery', active: true, description: 'Never left unattended under any circumstance' },
        { name: 'Photo Proof at Every Stage', active: true, description: 'Time-stamped photographic evidence captured' },
        { name: 'Chain of Custody', active: true, description: 'Continuous digital custody audit log' },
      ],
      custodyLog: [
        { checkpoint: 'Pickup Completed', executive: 'Vikram S. (EXEC-7729)', time: '10:20 AM', verified: true },
        { checkpoint: 'Hub Secure Transfer', executive: 'Vault Team (VAULT-BLR)', time: '11:00 AM', verified: true },
        { checkpoint: 'In Transit Security Seal Check', executive: 'Transit Supervisor', time: '11:35 AM', verified: true },
      ],
    },
    documents: {
      digitalWaybill: `WB-${vaultId}`,
      verificationProof: `VERIF-${vaultId}`,
      complianceCertificate: 'SEC-COMPLIANCE-AES256',
      tamperSealNumber: 'SEAL-DLVZ-78942',
      files: [
        { name: 'Digital_Waybill.pdf', size: '245 KB', type: 'PDF' },
        { name: 'Chain_Of_Custody_Report.pdf', size: '312 KB', type: 'PDF' },
        { name: 'Compliance_Certificate.pdf', size: '180 KB', type: 'PDF' },
      ],
    },
  }

  const milestones = data.milestones || []
  const details = data.details || {}
  const security = data.security || {}
  const documents = data.documents || {}

  return (
    <div className={styles.trackingContainer}>
      {/* Top Header */}
      <header className={styles.topHeader}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigateTo('/book/confidential-delivery')}
          >
            <ArrowLeft size={18} />
          </button>
          <div className={styles.brandGroup}>
            <span className={styles.brandTitle}>
              <span className={styles.goldText}>Delivez </span>VAULT
            </span>
            <div className={styles.shieldLockBadge}>
              <Shield size={14} className={styles.shieldLockIcon} />
              <Lock size={9} className={styles.lockInnerIcon} />
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={loadData}
            title="Refresh Tracking"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => alert(`Tracking link copied: ${window.location.href}`)}
            title="Share Tracking"
          >
            <Share2 size={16} />
          </button>
        </div>
      </header>

      <main className={styles.mainContent}>
        {/* Vault ID & Status Card */}
        <div className={styles.idCard}>
          <div className={styles.idCardTop}>
            <div>
              <div className={styles.idLabel}>CONFIDENTIAL SHIPMENT ID</div>
              <div className={styles.idValueRow}>
                <span className={styles.idValue}>{data.vaultId}</span>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={copyVaultId}
                  title="Copy Vault ID"
                >
                  <Copy size={13} />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className={styles.statusBadge}>
              <span className={styles.statusDot} />
              <span>{data.statusBadge || 'In Transit - Secure'}</span>
            </div>
          </div>

          <div className={styles.idCardBottom}>
            <div className={styles.pickupMetaRow}>
              <Calendar size={13} className={styles.metaIcon} />
              <span>{data.pickupDate}</span>
              <span className={styles.metaDivider}>•</span>
              <Clock size={13} className={styles.metaIcon} />
              <span>Last updated: {data.lastUpdated || 'Just now'}</span>
            </div>
          </div>
        </div>

        {/* 4 TRACKING TABS */}
        <nav className={styles.tabsContainer} aria-label="Tracking Tabs">
          {[
            { id: 'Timeline', label: 'Timeline', icon: Clock },
            { id: 'Details', label: 'Details', icon: FileText },
            { id: 'Security', label: 'Security', icon: ShieldCheck },
            { id: 'Documents', label: 'Documents', icon: FileCheck },
          ].map((tab) => {
            const IconComp = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                id={`tab-${tab.id.toLowerCase()}`}
                className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComp size={16} className={isActive ? styles.tabIconActive : ''} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* TAB 1: TIMELINE */}
        {activeTab === 'Timeline' && (
          <div>
            {/* Live Location Alert */}
            {data.currentLocation && (
              <div className={styles.liveLocationCard}>
                <div className={styles.liveIconBox}>
                  <MapPin size={22} className={styles.livePinIcon} />
                </div>
                <div className={styles.liveLocationInfo}>
                  <div className={styles.liveLocationTitle}>LIVE LOCATION</div>
                  <div className={styles.liveLocationAddress}>
                    {data.currentLocation.address}
                  </div>
                  <div className={styles.liveLocationSub}>
                    {data.currentLocation.subtext} • ETA: <strong>{data.currentLocation.eta}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Milestones Stepper */}
            <div className={styles.timelineCard}>
              <div className={styles.timelineHeader}>
                <Clock size={16} className={styles.setupGoldIcon} />
                <span className={styles.timelineTitle}>SHIPMENT TIMELINE</span>
              </div>

              <div className={styles.milestonesList}>
                {milestones.map((m, idx) => {
                  const isCompleted = m.completed
                  const isCurrent = m.current

                  return (
                    <div
                      key={m.id || idx}
                      className={`${styles.milestoneRow} ${isCompleted ? styles.milestoneCompleted : ''} ${isCurrent ? styles.milestoneCurrent : ''}`}
                    >
                      <div className={styles.nodeColumn}>
                        <div
                          className={`${styles.nodeCircle} ${isCompleted ? styles.nodeCircleDone : ''} ${isCurrent ? styles.nodeCircleActive : ''}`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={14} className={styles.nodeDoneIcon} />
                          ) : (
                            <span className={styles.nodeIndex}>{milestones.length - idx}</span>
                          )}
                        </div>
                        {idx < milestones.length - 1 && (
                          <div
                            className={`${styles.nodeConnector} ${isCompleted ? styles.connectorDone : ''}`}
                          />
                        )}
                      </div>

                      <div className={styles.milestoneContent}>
                        <div className={styles.milestoneTitleRow}>
                          <span className={styles.milestoneTitle}>{m.title}</span>
                          <span className={styles.milestoneTime}>{m.time}</span>
                        </div>
                        <p className={styles.milestoneDesc}>{m.description}</p>
                        {m.location && (
                          <div className={styles.milestoneLocation}>
                            <MapPin size={11} />
                            <span>{m.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Executive Contact Card */}
            {data.executive && (
              <div className={styles.executiveCard}>
                <div className={styles.execAvatarBox}>
                  <Truck size={20} className={styles.execTruckIcon} />
                </div>
                <div className={styles.execInfo}>
                  <div className={styles.execRole}>DEDICATED CUSTODY EXECUTIVE</div>
                  <div className={styles.execName}>{data.executive.name}</div>
                  <div className={styles.execClearance}>
                    Badge: <strong>{data.executive.badgeId}</strong> • {data.executive.securityClearance}
                  </div>
                </div>
                <a
                  href={`tel:${data.executive.phone}`}
                  className={styles.callExecBtn}
                  title="Call Executive"
                >
                  <Phone size={14} />
                  <span>Call</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DETAILS */}
        {activeTab === 'Details' && (
          <div>
            <div className={styles.detailsCard}>
              <div className={styles.detailsHeaderRow}>
                <MapPin size={18} className={styles.setupGoldIcon} />
                <span className={styles.detailsHeaderTitle}>TRANSIT CORRIDOR & ROUTE</span>
              </div>
              <div className={styles.detailsGrid}>
                <div className={styles.detailsField}>
                  <span className={styles.detailsLabel}>Pickup Origin</span>
                  <span className={styles.detailsValue}>{details.sender?.name || 'Authorized Sender'}</span>
                  <span className="text-xs text-slate-500 mt-0.5">{details.sender?.address}</span>
                  <span className="text-xs text-slate-500">{details.sender?.phone}</span>
                </div>
                <div className={styles.detailsField}>
                  <span className={styles.detailsLabel}>Delivery Destination</span>
                  <span className={styles.detailsValue}>{details.recipient?.name || 'Authorized Recipient'}</span>
                  <span className="text-xs text-slate-500 mt-0.5">{details.recipient?.address}</span>
                  <span className="text-xs text-slate-500">{details.recipient?.phone}</span>
                </div>
              </div>
            </div>

            <div className={styles.detailsCard}>
              <div className={styles.detailsHeaderRow}>
                <Layers size={18} className={styles.setupGoldIcon} />
                <span className={styles.detailsHeaderTitle}>SERVICE & SHIPMENT SPECIFICATIONS</span>
              </div>
              <div className={styles.detailsGrid}>
                <div className={styles.detailsField}>
                  <span className={styles.detailsLabel}>Service Type</span>
                  <span className={styles.detailsValue}>{details.serviceType || 'Vault Secure'}</span>
                </div>
                <div className={styles.detailsField}>
                  <span className={styles.detailsLabel}>Item Category</span>
                  <span className={styles.detailsValue}>{details.item?.type || 'Confidential Documents'}</span>
                </div>
                <div className={styles.detailsField}>
                  <span className={styles.detailsLabel}>Declared Value</span>
                  <span className={styles.detailsValue}>₹{Number(details.item?.declaredValue || 50000).toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.detailsField}>
                  <span className={styles.detailsLabel}>Packaging</span>
                  <span className={styles.detailsValue}>{details.packaging?.type || 'Tamper Proof Pouch'}</span>
                </div>
                <div className={styles.detailsField}>
                  <span className={styles.detailsLabel}>Security Seal Number</span>
                  <span className={styles.detailsValue}>{details.packaging?.sealNumber || 'SEAL-DLVZ-78942'}</span>
                </div>
                <div className={styles.detailsField}>
                  <span className={styles.detailsLabel}>Verification Method</span>
                  <span className={styles.detailsValue}>{details.recipient?.verificationMethod || 'OTP Verification'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY */}
        {activeTab === 'Security' && (
          <div>
            <div className={styles.detailsCard}>
              <div className={styles.detailsHeaderRow}>
                <ShieldCheck size={18} className={styles.setupGoldIcon} />
                <span className={styles.detailsHeaderTitle}>ACTIVE SECURITY SAFEGUARDS</span>
              </div>
              <div className="mb-4 flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div>
                  <div className="text-xs font-bold text-amber-900">Security Standard: {security.securityLevel || 'Maximum Security'}</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">{security.encryptionStandard || 'AES-256 End-to-End Encrypted'}</div>
                </div>
                <div className="px-2.5 py-1 bg-amber-200 text-amber-900 text-xs font-bold rounded">
                  {security.securityBadge || 'Norton SECURED'}
                </div>
              </div>

              <div>
                {(security.controls || []).map((ctrl, i) => (
                  <div key={i} className={styles.securityControlItem}>
                    <div className={styles.securityControlLeft}>
                      <Shield size={16} className={ctrl.active ? 'text-emerald-600' : 'text-slate-300'} />
                      <div>
                        <div className={styles.securityControlTitle}>{ctrl.name}</div>
                        <div className={styles.securityControlSub}>{ctrl.description}</div>
                      </div>
                    </div>
                    <span className={ctrl.active ? styles.securityBadgeActive : 'text-xs text-slate-400'}>
                      {ctrl.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.detailsCard}>
              <div className={styles.detailsHeaderRow}>
                <Clock size={18} className={styles.setupGoldIcon} />
                <span className={styles.detailsHeaderTitle}>CHAIN OF CUSTODY AUDIT TRAIL</span>
              </div>
              <div className="space-y-2 mt-2">
                {(security.custodyLog || []).map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{log.checkpoint}</span>
                      <div className="text-[11px] text-slate-500">{log.executive}</div>
                    </div>
                    <span className="font-mono text-slate-500 font-semibold">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DOCUMENTS */}
        {activeTab === 'Documents' && (
          <div>
            <div className={styles.detailsCard}>
              <div className={styles.detailsHeaderRow}>
                <FileCheck size={18} className={styles.setupGoldIcon} />
                <span className={styles.detailsHeaderTitle}>AUTHORIZED SHIPMENT DOCUMENTS</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Encrypted digital documents and audit certificates generated for this shipment.
              </p>

              <div>
                {(documents.files || [
                  { name: 'Digital_Waybill.pdf', size: '245 KB', type: 'PDF' },
                  { name: 'Chain_Of_Custody_Report.pdf', size: '312 KB', type: 'PDF' },
                  { name: 'Compliance_Certificate.pdf', size: '180 KB', type: 'PDF' },
                ]).map((doc, i) => (
                  <div key={i} className={styles.documentItem}>
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-amber-500" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{doc.name}</div>
                        <div className="text-[10px] text-slate-400">{doc.size} • Verified Digital Signature</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.docDownloadBtn}
                      onClick={() => alert(`Downloading verified ${doc.name}...`)}
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                <strong>Tamper Seal Number:</strong> {documents.tamperSealNumber || 'SEAL-DLVZ-78942'}
                <br />
                <strong>Certificate Hash:</strong> {documents.complianceCertificate || 'SEC-COMPLIANCE-AES256'}
              </div>
            </div>
          </div>
        )}

        {/* Security Alert Banner */}
        <div className={styles.securityAlertBox}>
          <ShieldAlert size={20} className={styles.securityAlertIcon} />
          <div>
            <div className={styles.securityAlertTitle}>Security First</div>
            <div className={styles.securityAlertDesc}>
              Do not share your Vault ID or OTP with anyone except the authorized executive at handover.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
