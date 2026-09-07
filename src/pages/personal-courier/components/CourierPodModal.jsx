import React, { useState } from 'react'
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  FileCheck,
  ShieldCheck,
  Camera,
  Download,
  Lock,
  ExternalLink
} from 'lucide-react'
import styles from './CourierPodModal.module.css'

export default function CourierPodModal({ isOpen, onClose, pod, agent, bookingNumber }) {
  const [activeTab, setActiveTab] = useState('INFO') // 'INFO' | 'EVIDENCE'

  if (!isOpen) return null

  const deliveredAt = pod?.deliveredAt || '12 May 2025, 05:45 PM'
  const deliveredTo = pod?.deliveredTo || 'Taj City Centre Hotel Front Desk'
  const deliveredAddress = pod?.deliveredAddress || 'Taj City Centre, Sector 44, Gurugram, Haryana - 122004'
  const receivedBy = pod?.receivedBy || 'Taj Front Desk - Amit Verma'
  const relationship = pod?.relationship || 'Hotel Reception Desk'
  const contactNumber = pod?.contactNumber || '+91 98111 22334'
  const signatureUrl = pod?.signatureUrl || pod?.signature || 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=400&q=80'
  const photoUrl = pod?.photoUrl || 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=600&q=80'
  const sealPhotoUrl = pod?.sealPhotoUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
  const sealNumber = pod?.sealNumber || 'DLV-SEAL-88492'
  const otp = pod?.otp || '5487'
  const notes = pod?.notes || 'Luggage received intact with tamper-evident seal unbroken. Front desk verified guest name Rahul Sharma, Room 402.'

  const agentName = agent?.name || 'Ravi Kumar'
  const agentId = agent?.id || 'DLZAGT45521'
  const agentPhone = agent?.phone || '+91 98765 43210'
  const agentVehicle = agent?.vehicle || 'DL 1Z 4589'

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <div className={styles.badgeSuccess}>
              <CheckCircle2 size={16} /> Delivered & Verified
            </div>
            <h2>Proof of Delivery (POD)</h2>
            <p>Shipment ID: <strong>{bookingNumber || 'DLVZ2505128947'}</strong></p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'INFO' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('INFO')}
          >
            Delivery Information & OTP
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'EVIDENCE' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('EVIDENCE')}
          >
            Photographic & Seal Evidence
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.body}>
          {activeTab === 'INFO' && (
            <div className={styles.infoTab}>
              {/* OTP & Seal Banner */}
              <div className={styles.otpSealBanner}>
                <div className={styles.otpPill}>
                  <ShieldCheck size={16} className={styles.iconGreen} />
                  <span>Handover OTP: <strong>{otp}</strong> (Verified)</span>
                </div>
                <div className={styles.sealPill}>
                  <Lock size={16} className={styles.iconAmber} />
                  <span>Barcode Seal: <strong>{sealNumber}</strong></span>
                </div>
              </div>

              {/* Delivery Meta Card */}
              <div className={styles.metaCard}>
                <div className={styles.metaRow}>
                  <div className={styles.metaItem}>
                    <Calendar size={16} className={styles.iconGray} />
                    <div>
                      <small>Delivered On</small>
                      <strong>{deliveredAt}</strong>
                    </div>
                  </div>
                  <div className={styles.metaItem}>
                    <User size={16} className={styles.iconGray} />
                    <div>
                      <small>Delivered To</small>
                      <strong>{deliveredTo}</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.addressBox}>
                  <MapPin size={18} className={styles.iconRed} />
                  <div>
                    <small>Destination Address</small>
                    <p>{deliveredAddress}</p>
                  </div>
                </div>
              </div>

              {/* Recipient Details */}
              <div className={styles.section}>
                <h4>Receiver Information</h4>
                <div className={styles.grid2}>
                  <div>
                    <small>Received By</small>
                    <p><strong>{receivedBy}</strong></p>
                  </div>
                  <div>
                    <small>Designation / Relationship</small>
                    <p><strong>{relationship}</strong></p>
                  </div>
                  <div>
                    <small>Contact Number</small>
                    <p><strong>{contactNumber}</strong></p>
                  </div>
                </div>
              </div>

              {notes && (
                <div className={styles.notesBox}>
                  <small>Handover Verification Notes</small>
                  <p>{notes}</p>
                </div>
              )}

              {/* Courier Partner Card */}
              <div className={styles.agentCard}>
                <div className={styles.agentAvatar}>{agentName.charAt(0)}</div>
                <div className={styles.agentDetails}>
                  <small>Delivered by Courier Partner</small>
                  <h4>{agentName} ({agentId})</h4>
                  <p>Vehicle: {agentVehicle} • {agentPhone}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'EVIDENCE' && (
            <div className={styles.evidenceTab}>
              <div className={styles.evidenceGrid}>
                {/* Signature Preview */}
                <div className={styles.evidenceCard}>
                  <h4>Receiver Digital Signature</h4>
                  <div className={styles.sigWrap}>
                    <img src={signatureUrl} alt="Digital Signature" className={styles.sigImg} />
                  </div>
                  <small>Signed by {receivedBy}</small>
                </div>

                {/* Luggage Photo */}
                <div className={styles.evidenceCard}>
                  <h4>Delivered Luggage Photo</h4>
                  <div className={styles.photoWrap}>
                    <img src={photoUrl} alt="Delivered Luggage" className={styles.photoImg} />
                  </div>
                  <small>Photographed at Hotel Reception Desk</small>
                </div>

                {/* Seal Photo */}
                <div className={styles.evidenceCard}>
                  <h4>Tamper-Evident Seal Photo</h4>
                  <div className={styles.photoWrap}>
                    <img src={sealPhotoUrl} alt="Tamper-Evident Seal" className={styles.photoImg} />
                  </div>
                  <small>Seal #{sealNumber} verified intact</small>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className={styles.printBtn} onClick={() => window.print()}>
            <Download size={16} /> Print / Save Certificate
          </button>
          <button type="button" className={styles.doneBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
