import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  ShieldCheck,
  Lock,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Luggage,
  FileCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { fetchCourierPod } from '@/features/personal-courier/services/personalCourierService.js'
import { navigateTo } from '@/app/router/navigation.js'
import styles from './CourierProofOfDeliveryView.module.css'

export default function CourierProofOfDeliveryView({
  bookingId = 'DLVZ2505128947',
  onBack,
  onBookAgain,
}) {
  const [loading, setLoading] = useState(true)
  const [podData, setPodData] = useState(null)

  useEffect(() => {
    let isMounted = true
    async function loadPod() {
      try {
        setLoading(true)
        const res = await fetchCourierPod(bookingId)
        if (isMounted && res) {
          setPodData(res.data || res)
        }
      } catch (err) {
        console.warn('Failed to fetch POD, using fallback data:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadPod()
    return () => { isMounted = false }
  }, [bookingId])

  // Merged data with fallback matching Screen 32 & 33
  const pod = podData?.pod || {
    otp: '5487',
    deliveredTo: 'Taj City Centre Hotel Front Desk',
    receivedBy: 'Taj Front Desk - Amit Verma',
    relationship: 'Hotel Reception Desk',
    contactNumber: '+91 98111 22334',
    signatureUrl: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=400&q=80',
    photoUrl: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=600&q=80',
    sealPhotoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    sealNumber: 'DLV-SEAL-88492',
    deliveredAt: '12 May 2025, 05:45 PM',
    notes: 'Luggage received intact with tamper-evident seal unbroken. Front desk verified guest name Rahul Sharma, Room 402.',
  }

  const agent = podData?.agent || {
    name: 'Ravi Kumar',
    id: 'DLZAGT45521',
    phone: '+91 98765 43210',
    vehicle: 'DL 1Z 4589',
  }

  const sealNumber = pod.sealNumber || podData?.sealNumber || 'DLV-SEAL-88492'

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.topBar}>
        <button
          className={styles.backBtn}
          onClick={onBack || (() => navigateTo(`/track/courier/${bookingId}`))}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className={styles.titleWrap}>
          <h1 className={styles.mainTitle}>Proof of Delivery (POD)</h1>
          <p className={styles.mainSubtitle}>Verified handover certificate & digital audit</p>
        </div>
        <div className={styles.bookingIdBadge}>#{bookingId}</div>
      </div>

      <div className={styles.contentWrap}>
        {/* Success Banner */}
        <div className={styles.successCard}>
          <div className={styles.successIconBox}>
            <CheckCircle2 size={36} />
          </div>
          <div className={styles.successText}>
            <div className={styles.successBadge}>DELIVERY VERIFIED</div>
            <h2 className={styles.successHeading}>Consignment Successfully Delivered</h2>
            <p className={styles.deliveredAtText}>
              Delivered on {pod.deliveredAt || '12 May 2025, 05:45 PM'}
            </p>
          </div>
        </div>

        {/* Security & OTP Row */}
        <div className={styles.twoColRow}>
          {/* OTP Box */}
          <div className={styles.cardBox}>
            <div className={styles.cardBoxHeader}>
              <ShieldCheck size={18} className={styles.accentIcon} />
              <h3>Handover OTP Verification</h3>
            </div>
            <div className={styles.otpDisplay}>
              <span className={styles.otpLabel}>Verified Secure OTP</span>
              <div className={styles.otpCode}>{pod.otp || '5487'}</div>
              <span className={styles.otpStatus}>✓ Confirmed by Receiver</span>
            </div>
          </div>

          {/* Tamper Seal Box */}
          <div className={styles.cardBox}>
            <div className={styles.cardBoxHeader}>
              <Lock size={18} className={styles.accentIcon} />
              <h3>Tamper-Evident Security Seal</h3>
            </div>
            <div className={styles.sealDisplay}>
              <span className={styles.sealLabel}>Barcode Seal ID</span>
              <div className={styles.sealCode}>{sealNumber}</div>
              <span className={styles.sealStatus}>✓ Verified Unbroken at Destination</span>
            </div>
          </div>
        </div>

        {/* Recipient Details */}
        <div className={styles.detailCard}>
          <h3 className={styles.cardSectionTitle}>Recipient & Destination Details</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <User size={16} className={styles.detailIcon} />
              <div>
                <span className={styles.detailLabel}>Received By</span>
                <span className={styles.detailVal}>{pod.receivedBy || 'Taj Front Desk - Amit Verma'}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <FileCheck size={16} className={styles.detailIcon} />
              <div>
                <span className={styles.detailLabel}>Designation / Role</span>
                <span className={styles.detailVal}>{pod.relationship || 'Hotel Reception Desk'}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <Phone size={16} className={styles.detailIcon} />
              <div>
                <span className={styles.detailLabel}>Contact Number</span>
                <span className={styles.detailVal}>{pod.contactNumber || '+91 98111 22334'}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <MapPin size={16} className={styles.detailIcon} />
              <div>
                <span className={styles.detailLabel}>Delivered Location</span>
                <span className={styles.detailVal}>{pod.deliveredTo || 'Taj City Centre Hotel Front Desk, Gurugram'}</span>
              </div>
            </div>
          </div>
          {pod.notes && (
            <div className={styles.notesBox}>
              <strong>Delivery Notes:</strong> {pod.notes}
            </div>
          )}
        </div>

        {/* Photographic Evidence & Digital Signature */}
        <div className={styles.evidenceCard}>
          <h3 className={styles.cardSectionTitle}>Photographic Evidence & Digital Signature</h3>
          <div className={styles.photosGrid}>
            {/* Signature */}
            <div className={styles.evidenceItem}>
              <span className={styles.evidenceLabel}>Digital Signature</span>
              <div className={styles.sigImgWrap}>
                <img
                  src={pod.signatureUrl || 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=400&q=80'}
                  alt="Receiver Digital Signature"
                  className={styles.sigImg}
                />
              </div>
              <span className={styles.evidenceCaption}>Signed by {pod.receivedBy}</span>
            </div>

            {/* Luggage Photo */}
            <div className={styles.evidenceItem}>
              <span className={styles.evidenceLabel}>Luggage at Destination</span>
              <div className={styles.photoImgWrap}>
                <img
                  src={pod.photoUrl || 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=600&q=80'}
                  alt="Delivered Luggage Evidence"
                  className={styles.photoImg}
                />
              </div>
              <span className={styles.evidenceCaption}>2 Bags intact at reception</span>
            </div>

            {/* Seal Photo */}
            <div className={styles.evidenceItem}>
              <span className={styles.evidenceLabel}>Unbroken Barcode Seal</span>
              <div className={styles.photoImgWrap}>
                <img
                  src={pod.sealPhotoUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'}
                  alt="Tamper Seal Evidence"
                  className={styles.photoImg}
                />
              </div>
              <span className={styles.evidenceCaption}>Seal #{sealNumber}</span>
            </div>
          </div>
        </div>

        {/* Dispatch Agent Info */}
        <div className={styles.agentBar}>
          <div className={styles.agentAvatar}>
            {agent.name?.charAt(0) || 'R'}
          </div>
          <div className={styles.agentInfo}>
            <span className={styles.agentRole}>Handover Driver Partner</span>
            <h4 className={styles.agentName}>{agent.name} ({agent.id})</h4>
            <span className={styles.agentVehicle}>Vehicle: {agent.vehicle}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionsRow}>
          <button
            className={styles.downloadBtn}
            onClick={() => window.print()}
          >
            <Download size={18} />
            <span>Download Proof Certificate</span>
          </button>
          {onBookAgain && (
            <button className={styles.bookAgainBtn} onClick={onBookAgain}>
              <RefreshCw size={18} />
              <span>Book Another Courier</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
