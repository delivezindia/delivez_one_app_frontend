import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Copy,
  Check,
  MapPin,
  Clock,
  Truck,
  ShieldCheck,
  Phone,
  FileCheck,
  CheckCircle2,
  Lock,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  Star,
  Luggage,
  Calendar,
  Navigation
} from 'lucide-react'
import CourierProofOfDeliveryView from './CourierProofOfDeliveryView.jsx'
import {
  fetchCourierTracking,
  updateCourierBooking
} from '@/features/personal-courier/services/personalCourierService.js'
import styles from './CourierTrackingView.module.css'

export default function CourierTrackingView({
  bookingId = 'DLVZ2505128947',
  onBack,
  initialBooking,
}) {
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState('stepper') // 'stepper' | 'timeline' | 'pod'
  const [showEditModal, setShowEditModal] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editSuccess, setEditSuccess] = useState('')

  const [editForm, setEditForm] = useState({
    contactName: '',
    phoneNumber: '',
    addressLine1: '',
    city: '',
    specialInstructions: '',
  })

  useEffect(() => {
    let isMounted = true
    async function loadTracking() {
      try {
        setLoading(true)
        if (bookingId) {
          const data = await fetchCourierTracking(bookingId)
          if (isMounted && data) {
            setTracking(data)
          }
        }
      } catch (err) {
        console.warn('Tracking fetch fallback:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadTracking()
    return () => { isMounted = false }
  }, [bookingId])

  const displayId = tracking?.bookingId || initialBooking?.bookingNumber || bookingId || 'DLVZ2505128947'
  const status = tracking?.status || initialBooking?.status || 'IN_TRANSIT'
  const expectedDelivery = tracking?.expectedDelivery || '12 May 2025 by 06:00 PM'
  const currentLocation = tracking?.currentLocation || 'Near Kota, Rajasthan'
  const destinationHub = tracking?.destinationHub || 'Gurugram Hub'
  const sealNumber = tracking?.sealNumber || initialBooking?.sealNumber || 'DLV-SEAL-88492'

  const agent = tracking?.agent || initialBooking?.agent || {
    name: 'Ravi Kumar',
    id: 'DLZAGT45521',
    phone: '+91 98765 43210',
    vehicle: 'DL 1Z 4589',
    rating: '4.9',
    completedTrips: '1,420+',
  }

  // 8-step tracking stepper matching APK Screen 29
  const trackingStages = [
    { key: 'BOOKING_CONFIRMED', title: 'Booking Confirmed', desc: 'Consignment booked & verified' },
    { key: 'AGENT_ASSIGNED', title: 'Agent Assigned', desc: 'Ravi Kumar assigned for pickup' },
    { key: 'PICKUP_IN_PROGRESS', title: 'Pickup in Progress', desc: 'Agent reaching pickup location' },
    { key: 'LUGGAGE_PICKED', title: 'Luggage Picked Up', desc: 'Weighed & sealed with DLV-SEAL-88492' },
    { key: 'IN_TRANSIT', title: 'In Transit', desc: 'Express highway route via Kota Hub' },
    { key: 'REACHED_DESTINATION_CITY', title: 'Reached Destination Hub', desc: 'Arrived at destination sorting center' },
    { key: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', desc: 'Dispatched for final hotel handover' },
    { key: 'DELIVERED', title: 'Luggage Delivered', desc: 'Delivered safely with OTP verification' },
  ]

  const statusWeights = {
    CONFIRMED: 0,
    BOOKING_CONFIRMED: 0,
    AGENT_ASSIGNED: 1,
    PICKUP_ASSIGNED: 1,
    PICKUP_IN_PROGRESS: 2,
    LUGGAGE_PICKED: 3,
    PICKED_UP: 3,
    IN_TRANSIT: 4,
    REACHED_DESTINATION_CITY: 5,
    OUT_FOR_DELIVERY: 6,
    DELIVERED: 7,
  }

  const currentStepIndex = statusWeights[status] ?? 4 // default to IN_TRANSIT (4)

  // 10-Milestone Detailed Journey Timeline matching APK Screens 30 & 31
  const timelineMilestones = tracking?.timeline || tracking?.journey || [
    { id: 1, stage: 'BOOKING_CONFIRMED', title: 'Booking Confirmed', location: 'New Delhi', description: `Your luggage delivery booking ${displayId} has been confirmed.`, timestamp: '10 May 2025, 09:30 AM', completed: true },
    { id: 2, stage: 'AGENT_ASSIGNED', title: 'Agent Assigned', location: 'New Delhi', description: 'Ravi Kumar (DLZAGT45521) assigned for luggage pickup.', timestamp: '10 May 2025, 09:45 AM', completed: true },
    { id: 3, stage: 'AGENT_REACHED_PICKUP', title: 'Agent Reached Pickup Location', location: 'Indira Gandhi Int Airport (Terminal 3)', description: 'Agent reached Luggage Belt 04 for collection.', timestamp: '10 May 2025, 10:15 AM', completed: true },
    { id: 4, stage: 'LUGGAGE_INSPECTED_WEIGHED', title: 'Luggage Inspected & Weighed', location: 'Indira Gandhi Int Airport (DEL)', description: '2 Bags verified. Total verified weight: 28.00 Kg.', timestamp: '10 May 2025, 10:25 AM', completed: true },
    { id: 5, stage: 'SECURITY_SEAL_APPLIED', title: 'Security Seal Applied', location: 'Indira Gandhi Int Airport (DEL)', description: `High-security tamper-evident seal applied: ${sealNumber}`, timestamp: '10 May 2025, 10:30 AM', sealNumber, completed: true },
    { id: 6, stage: 'LUGGAGE_PICKED', title: 'Luggage Picked Up', location: 'Indira Gandhi Int Airport (DEL)', description: 'Luggage safely handed over to courier agent with digital receipt.', timestamp: '10 May 2025, 10:35 AM', completed: true },
    { id: 7, stage: 'IN_TRANSIT', title: 'In Transit to Destination City', location: 'Near Kota, Rajasthan', description: 'Shipment in transit via sanitized express van on NH-48.', timestamp: '10 May 2025, 11:30 AM', current: true, completed: true },
    { id: 8, stage: 'REACHED_DESTINATION_CITY', title: 'Reached Destination City Hub', location: `${destinationHub}`, description: 'Consignment arrived at destination sorting & dispatch center.', timestamp: '11 May 2025, 08:00 PM', pending: true },
    { id: 9, stage: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', location: 'Taj City Centre, Gurugram', description: 'Agent dispatched for final hotel delivery.', timestamp: '12 May 2025, 02:00 PM', pending: true },
    { id: 10, stage: 'DELIVERED', title: 'Luggage Delivered Safely', location: 'Taj City Centre Hotel Front Desk', description: 'Delivered to hotel reception desk with OTP 5487.', timestamp: '12 May 2025, 05:45 PM', pending: true },
  ]

  const handleCopy = () => {
    navigator.clipboard.writeText(displayId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenEdit = () => {
    setEditForm({
      contactName: initialBooking?.dropoff?.contactName || 'Rahul Sharma',
      phoneNumber: initialBooking?.dropoff?.phoneNumber || '+91 98765 43210',
      addressLine1: initialBooking?.dropoff?.addressLine1 || 'Taj City Centre, Sector 44',
      city: initialBooking?.dropoff?.city || 'Gurugram',
      specialInstructions: 'Please leave at Front Desk if guest is not in room.',
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    setSavingEdit(true)
    try {
      await updateCourierBooking(displayId, {
        dropoff: {
          contactName: editForm.contactName,
          phoneNumber: editForm.phoneNumber,
          addressLine1: editForm.addressLine1,
          city: editForm.city,
        },
      })
      setEditSuccess('Delivery details updated successfully!')
      setTimeout(() => {
        setEditSuccess('')
        setShowEditModal(false)
      }, 1500)
    } catch (err) {
      alert('Failed to update: ' + err.message)
    } finally {
      setSavingEdit(false)
    }
  }

  if (viewMode === 'pod') {
    return (
      <CourierProofOfDeliveryView
        bookingId={displayId}
        onBack={() => setViewMode('stepper')}
      />
    )
  }

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div className={styles.titleWrap}>
          <h1 className={styles.mainTitle}>Track Luggage</h1>
          <div className={styles.bookingIdRow}>
            <span className={styles.bookingIdText}>ID: {displayId}</span>
            <button className={styles.copyBtn} onClick={handleCopy} title="Copy tracking ID">
              {copied ? <Check size={14} className={styles.copiedIcon} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
        <div className={styles.statusBadge}>
          {status.replace(/_/g, ' ')}
        </div>
      </div>

      <div className={styles.contentWrap}>
        {/* View Switcher Tabs (Live Stepper vs Detailed Journey Timeline) */}
        <div className={styles.viewSwitcher}>
          <button
            className={`${styles.switchTab} ${viewMode === 'stepper' ? styles.switchTabActive : ''}`}
            onClick={() => setViewMode('stepper')}
          >
            Live Tracking & Stepper
          </button>
          <button
            className={`${styles.switchTab} ${viewMode === 'timeline' ? styles.switchTabActive : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            10-Milestone Journey Timeline
          </button>
        </div>

        {/* Live GPS Interactive Map Simulation (Screens 28 & 29) */}
        <div className={styles.mapCard}>
          <div className={styles.mapCanvas}>
            {/* Map Background with visual grid and transit route */}
            <div className={styles.mapGridPattern}></div>

            {/* Route Line SVG */}
            <svg className={styles.routeSvg} viewBox="0 0 600 240">
              <path
                d="M 60 180 Q 200 40, 320 120 T 540 80"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="6"
                strokeDasharray="8 6"
              />
              <path
                d="M 60 180 Q 200 40, 320 120"
                fill="none"
                stroke="#e11d48"
                strokeWidth="6"
              />
            </svg>

            {/* Origin Pin */}
            <div className={`${styles.mapPin} ${styles.pinOrigin}`} style={{ left: '50px', top: '160px' }}>
              <div className={styles.pinDot}></div>
              <div className={styles.pinLabel}>Indira Gandhi Airport (DEL)</div>
            </div>

            {/* Live Driver Van Pin */}
            <div className={`${styles.mapPin} ${styles.pinDriver}`} style={{ left: '305px', top: '100px' }}>
              <div className={styles.driverPulse}></div>
              <div className={styles.driverIconBox}>
                <Truck size={18} />
              </div>
              <div className={styles.driverLabel}>
                <strong>{agent.name}</strong> • Near Kota, RJ
              </div>
            </div>

            {/* Destination Pin */}
            <div className={`${styles.mapPin} ${styles.pinDest}`} style={{ left: '520px', top: '65px' }}>
              <div className={styles.pinDotDest}></div>
              <div className={styles.pinLabel}>Taj City Centre Hotel</div>
            </div>
          </div>

          <div className={styles.mapFooter}>
            <div className={styles.etaBox}>
              <Clock size={16} className={styles.etaIcon} />
              <div>
                <span className={styles.etaLabel}>Estimated Delivery</span>
                <span className={styles.etaVal}>{expectedDelivery}</span>
              </div>
            </div>
            <div className={styles.currentLocBox}>
              <MapPin size={16} className={styles.locIcon} />
              <div>
                <span className={styles.locLabel}>Current Location</span>
                <span className={styles.locVal}>{currentLocation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Seal Banner */}
        <div className={styles.sealBanner}>
          <div className={styles.sealLeft}>
            <Lock size={20} className={styles.sealIcon} />
            <div>
              <span className={styles.sealTag}>TAMPER-EVIDENT SECURITY SEAL</span>
              <div className={styles.sealNumberText}>Barcode #{sealNumber}</div>
            </div>
          </div>
          <div className={styles.sealStatusBadge}>✓ SEAL INTACT & SCANNED</div>
        </div>

        {/* Driver Partner Card (Screen 29) */}
        <div className={styles.agentCard}>
          <div className={styles.agentLeft}>
            <div className={styles.agentAvatar}>
              {agent.avatar ? (
                <img src={agent.avatar} alt={agent.name} className={styles.avatarImg} />
              ) : (
                agent.name.charAt(0)
              )}
            </div>
            <div className={styles.agentMeta}>
              <div className={styles.agentHeaderRow}>
                <h3 className={styles.agentName}>{agent.name}</h3>
                <span className={styles.agentRating}>
                  <Star size={13} fill="#eab308" color="#eab308" /> {agent.rating || '4.9'}
                </span>
              </div>
              <p className={styles.agentSub}>
                ID: {agent.id} • Vehicle: {agent.vehicle}
              </p>
              <p className={styles.agentTrips}>
                Completed {agent.completedTrips || '1,420+'} airport consignments
              </p>
            </div>
          </div>
          <div className={styles.agentActions}>
            <a href={`tel:${agent.phone}`} className={styles.callBtn}>
              <Phone size={16} />
              <span>Call Driver</span>
            </a>
            <button className={styles.msgBtn} onClick={() => alert(`Opening chat with driver ${agent.name}...`)}>
              <MessageSquare size={16} />
            </button>
          </div>
        </div>

        {/* Dynamic Content: 8-Step Stepper OR 10-Milestone Detailed Timeline */}
        {viewMode === 'stepper' ? (
          <div className={styles.stepperCard}>
            <div className={styles.cardHeaderWithAction}>
              <h3 className={styles.sectionTitle}>Delivery Status Stepper (8 Stages)</h3>
              <button className={styles.editBtn} onClick={handleOpenEdit}>
                Change Details
              </button>
            </div>

            <div className={styles.stepperList}>
              {trackingStages.map((stage, idx) => {
                const isCompleted = idx < currentStepIndex
                const isCurrent = idx === currentStepIndex
                const isPending = idx > currentStepIndex

                return (
                  <div
                    key={stage.key}
                    className={`${styles.stepperItem} ${
                      isCompleted ? styles.stepCompleted : ''
                    } ${isCurrent ? styles.stepCurrent : ''} ${
                      isPending ? styles.stepPending : ''
                    }`}
                  >
                    <div className={styles.stepperIndicator}>
                      <div className={styles.stepCircle}>
                        {isCompleted ? (
                          <Check size={14} />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      {idx < trackingStages.length - 1 && (
                        <div className={styles.stepConnector}></div>
                      )}
                    </div>

                    <div className={styles.stepDetails}>
                      <div className={styles.stepTitleRow}>
                        <h4 className={styles.stepTitle}>{stage.title}</h4>
                        {isCurrent && <span className={styles.currentBadge}>ACTIVE</span>}
                        {isCompleted && <span className={styles.completedBadge}>DONE</span>}
                      </div>
                      <p className={styles.stepDesc}>{stage.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* 10-Milestone Detailed Journey Timeline (Screens 30 & 31) */
          <div className={styles.timelineCard}>
            <div className={styles.cardHeaderWithAction}>
              <div>
                <h3 className={styles.sectionTitle}>Detailed Journey Timeline</h3>
                <p className={styles.sectionSubtitle}>10 verified milestone events with physical security timestamps</p>
              </div>
            </div>

            <div className={styles.milestoneList}>
              {timelineMilestones.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className={`${styles.milestoneItem} ${
                    m.completed ? styles.milestoneCompleted : ''
                  } ${m.current ? styles.milestoneCurrent : ''} ${
                    m.pending ? styles.milestonePending : ''
                  }`}
                >
                  <div className={styles.milestoneIndicator}>
                    <div className={styles.milestoneDot}>
                      {m.completed ? <Check size={12} /> : idx + 1}
                    </div>
                    {idx < timelineMilestones.length - 1 && (
                      <div className={styles.milestoneLine}></div>
                    )}
                  </div>

                  <div className={styles.milestoneContent}>
                    <div className={styles.milestoneTop}>
                      <h4 className={styles.milestoneTitle}>{m.title}</h4>
                      <span className={styles.milestoneTime}>{m.timestamp}</span>
                    </div>
                    <div className={styles.milestoneLocation}>
                      <MapPin size={12} /> {m.location}
                    </div>
                    <p className={styles.milestoneDesc}>{m.description}</p>
                    {m.sealNumber && (
                      <div className={styles.timelineSealBox}>
                        <Lock size={12} /> Tamper Seal: <strong>{m.sealNumber}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick POD Button */}
        <div className={styles.podCtaCard}>
          <div className={styles.podCtaLeft}>
            <FileCheck size={28} className={styles.podCtaIcon} />
            <div>
              <h4 className={styles.podCtaTitle}>Proof of Delivery (POD)</h4>
              <p className={styles.podCtaDesc}>
                View recipient signature, luggage photo, and OTP certificate.
              </p>
            </div>
          </div>
          <button
            className={styles.viewPodBtn}
            onClick={() => setViewMode('pod')}
          >
            <span>View Full POD</span>
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      {/* Edit Consignment Modal */}
      {showEditModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowEditModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Edit Delivery Instructions</h3>
            <p className={styles.modalSub}>Update recipient contact or hotel notes for {displayId}</p>

            {editSuccess && (
              <div className={styles.alertSuccess}>
                <CheckCircle2 size={16} /> {editSuccess}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className={styles.editForm}>
              <div className={styles.formGroup}>
                <label>Recipient Name</label>
                <input
                  type="text"
                  value={editForm.contactName}
                  onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Recipient Phone Number</label>
                <input
                  type="text"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Delivery Address / Hotel</label>
                <input
                  type="text"
                  value={editForm.addressLine1}
                  onChange={(e) => setEditForm({ ...editForm, addressLine1: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Special Instructions / Reception Note</label>
                <textarea
                  rows={3}
                  value={editForm.specialInstructions}
                  onChange={(e) => setEditForm({ ...editForm, specialInstructions: e.target.value })}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={savingEdit}
                >
                  {savingEdit ? 'Saving...' : 'Save to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
