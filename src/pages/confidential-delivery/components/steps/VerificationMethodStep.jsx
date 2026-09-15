import React from 'react'
import {
  User,
  BadgeCheck,
  PenTool,
  ScanFace,
  Shield,
  ChevronRight,
  Smartphone,
  CreditCard,
  Camera,
} from 'lucide-react'
import styles from '../../ConfidentialDeliveryBookingPage.module.css'

export const VERIFICATION_METHODS = [
  {
    id: 'OTP',
    name: 'OTP Verification',
    badge: 'Recommended',
    desc: 'Recipient will receive an OTP on their registered mobile number for verification.',
    note: 'Best for secure and contact-based deliveries',
    icon: User,
    sideIcon: Smartphone,
  },
  {
    id: 'ID_PROOF',
    name: 'ID Proof Verification',
    desc: 'Verify recipient using a valid government-issued ID proof.',
    note: 'Suitable for high value and important shipments',
    icon: BadgeCheck,
    sideIcon: CreditCard,
  },
  {
    id: 'SIGNATURE',
    name: 'Signature Verification',
    desc: "Collect recipient's signature at the time of delivery.",
    note: 'Standard method for most deliveries',
    icon: PenTool,
    sideIcon: PenTool,
  },
  {
    id: 'FACE_VERIFICATION',
    name: 'Face Verification',
    desc: 'Verify recipient using live photo capture at delivery.',
    note: 'High security with live face match',
    icon: ScanFace,
    sideIcon: ScanFace,
  },
  {
    id: 'AUTHORIZED_PERSON',
    name: 'Authorized Person Verification',
    desc: 'Allow delivery to an authorized person on behalf of the recipient.',
    note: 'For cases where recipient is not personally available',
    icon: Shield,
    sideIcon: User,
  },
]

export default function VerificationMethodStep({
  data = {},
  onChange,
  onContinue,
  onBack,
}) {
  const verificationMethod = data.verificationMethod || 'OTP'
  const captureRecipientPhoto = data.captureRecipientPhoto !== false
  const captureIdPhoto = data.captureIdPhoto || false

  const handleUpdate = (patch) => {
    if (onChange) {
      onChange({ ...data, ...patch })
    }
  }

  return (
    <div className={styles.stepContentContainer}>
      <div className={styles.packagingSectionLabel}>
        SELECT VERIFICATION METHOD
      </div>

      <div className="space-y-3 mb-6">
        {VERIFICATION_METHODS.map((method) => {
          const isSelected = verificationMethod === method.id
          const IconComp = method.icon
          const SideIcon = method.sideIcon

          return (
            <div
              key={method.id}
              className={`${styles.verificationCard} ${isSelected ? styles.verificationCardActive : ''}`}
              onClick={() => handleUpdate({ verificationMethod: method.id })}
            >
              <div className="flex items-start gap-3">
                <div className={`${styles.radioCircle} mt-1 ${isSelected ? styles.radioCircleActive : ''}`} />
                <div className={styles.verificationIconBox}>
                  <IconComp size={20} className={styles.setupGoldIcon} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{method.name}</span>
                    {method.badge && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        {method.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{method.desc}</p>
                </div>
                <div className="hidden sm:flex flex-col items-end text-right min-w-[140px]">
                  <SideIcon size={18} className="text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-400 leading-tight">{method.note}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Verification Additional Controls */}
      <div className={`${styles.cardContainer} mb-6`}>
        <div className={styles.cardHeaderRow}>
          <Camera size={18} className={styles.setupGoldIcon} />
          <span className={styles.cardHeaderTitle}>EVIDENCE CAPTURE PREFERENCES</span>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">Capture Recipient Photo</div>
              <div className="text-[10px] text-slate-500">Live photograph captured at moment of handover.</div>
            </div>
            <input
              type="checkbox"
              className={styles.goldSwitch}
              checked={captureRecipientPhoto}
              onChange={(e) => handleUpdate({ captureRecipientPhoto: e.target.checked })}
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">Capture ID Card Photo</div>
              <div className="text-[10px] text-slate-500">Photograph of government ID recorded in chain of custody.</div>
            </div>
            <input
              type="checkbox"
              className={styles.goldSwitch}
              checked={captureIdPhoto}
              onChange={(e) => handleUpdate({ captureIdPhoto: e.target.checked })}
            />
          </div>
        </div>
      </div>

      {/* Bottom Continue Button */}
      <div className={styles.bottomCtaSection}>
        <button
          type="button"
          className={styles.redCtaButton}
          onClick={onContinue}
        >
          <span>Save & Continue</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
