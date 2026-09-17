import React from 'react'
import {
  Crosshair,
  Calendar,
  Clock,
  Globe,
  MapPin,
  Edit2,
  User,
  Phone,
  ShieldCheck,
  CheckCircle,
  Info,
  ChevronDown,
  Shield,
  Lock,
} from 'lucide-react'
import styles from '../../ConfidentialDeliveryBookingPage.module.css'

export default function PreciseDeliverySetupSection({
  data = {},
  onChange,
  deliveryAddress,
}) {
  const deliveryDate = data.deliveryDate || ''
  const timeWindow = data.timeWindow || '10:00 AM - 12:00 PM'
  const timezone = data.timezone || 'IST (GMT +05:30)'
  const hardDeadline = data.hardDeadline || 'None'
  const earlyDeliveryNotAllowed = data.earlyDeliveryNotAllowed !== false
  const deliveryInstructions = data.deliveryInstructions || ''
  const landmark = data.landmark || ''
  const recipientName = data.recipientName || ''
  const recipientContact = data.recipientContact || ''
  const verificationMethod = data.verificationMethod || 'OTP Verification'
  const recipientMustBeAvailable = data.recipientMustBeAvailable !== false
  const alternateContact = data.alternateContact || ''
  const handlingOption = data.handlingOption || 'Precise Delivery'
  const specialInstructions = data.specialInstructions || ''
  const customDeliveryAddress = data.customDeliveryAddress || ''

  // Precise Security & Handling controls
  const tamperProofSealing = data.tamperProofSealing !== false
  const singlePointOfContact = data.singlePointOfContact !== false
  const secureStorageAtHubs = data.secureStorageAtHubs !== false
  const armedEscort = Boolean(data.armedEscort)
  const noUnattendedDelivery = data.noUnattendedDelivery !== false
  const photoProofAtEveryStage = data.photoProofAtEveryStage !== false

  const handleUpdate = (patch) => {
    if (onChange) {
      onChange({ ...data, ...patch })
    }
  }

  const displayAddress = customDeliveryAddress || deliveryAddress || 'House / Building, Street, Area, Landmark\nCity, State - PIN Code\nIndia'

  return (
    <div className={styles.setupCard}>
      {/* 1. DELIVERY PRECISION */}
      <div className={styles.setupSectionHeader}>
        <Crosshair size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>DELIVERY PRECISION</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className={styles.inputLabel}>Delivery Date *</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <Calendar size={16} className={styles.inputIcon} />
              <input
                type="date"
                className={styles.inputField}
                value={deliveryDate}
                onChange={(e) => handleUpdate({ deliveryDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className={styles.inputLabel}>Preferred Time Window *</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <Clock size={16} className={styles.inputIcon} />
              <select
                className={styles.selectDropdown}
                value={timeWindow}
                onChange={(e) => handleUpdate({ timeWindow: e.target.value })}
              >
                <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
              </select>
              <ChevronDown className={styles.selectChevron} />
            </div>
          </div>

          <div>
            <label className={styles.inputLabel}>Timezone</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <Globe size={16} className={styles.inputIcon} />
              <select
                className={styles.selectDropdown}
                value={timezone}
                onChange={(e) => handleUpdate({ timezone: e.target.value })}
              >
                <option value="IST (GMT +05:30)">IST (GMT +05:30)</option>
              </select>
              <ChevronDown className={styles.selectChevron} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={styles.inputLabel}>Delivery Deadline (Hard Cut-off)</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <Clock size={16} className={styles.inputIcon} />
              <select
                className={styles.selectDropdown}
                value={hardDeadline}
                onChange={(e) => handleUpdate({ hardDeadline: e.target.value })}
              >
                <option value="None">None (Deliver within window)</option>
                <option value="Hard Cut-off at Window End">Hard Cut-off at Window End</option>
                <option value="15 Mins Before Window End">15 Mins Before Window End</option>
                <option value="30 Mins Before Window End">30 Mins Before Window End</option>
              </select>
              <ChevronDown className={styles.selectChevron} />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <div className="text-xs font-bold text-slate-900">Early Delivery Not Allowed</div>
              <div className="text-[10px] text-slate-500">Prevent early delivery before the time window.</div>
            </div>
            <input
              type="checkbox"
              className={styles.goldSwitch}
              checked={earlyDeliveryNotAllowed}
              onChange={(e) => handleUpdate({ earlyDeliveryNotAllowed: e.target.checked })}
            />
          </div>
        </div>
      </div>

      <div className={styles.setupDivider} />

      {/* 2. DELIVERY ADDRESS PREVIEW */}
      <div className={styles.setupSectionHeader}>
        <MapPin size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>DELIVERY ADDRESS</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className={styles.previewAddressCard}>
          <div className={styles.previewAddressText}>{displayAddress}</div>
          <button
            type="button"
            className={styles.editAddressBtn}
            onClick={() => {
              const newAddr = prompt('Edit precise delivery address:', displayAddress)
              if (newAddr) handleUpdate({ customDeliveryAddress: newAddr })
            }}
          >
            <Edit2 size={13} />
            <span>Edit Address</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <label className={styles.inputLabel}>Delivery Instructions (Optional)</label>
            <div className="relative mt-2">
              <textarea
                className={styles.textareaField}
                placeholder="Add specific delivery instructions, gate code, floor, etc."
                maxLength={250}
                value={deliveryInstructions}
                onChange={(e) => handleUpdate({ deliveryInstructions: e.target.value })}
              />
              <span className={styles.charCount}>{deliveryInstructions.length}/250</span>
            </div>
          </div>

          <div>
            <label className={styles.inputLabel}>Landmark (Optional)</label>
            <div className="relative mt-2">
              <textarea
                className={styles.textareaField}
                placeholder="e.g., Opposite Metro Station, Near City Mall"
                maxLength={250}
                value={landmark}
                onChange={(e) => handleUpdate({ landmark: e.target.value })}
              />
              <span className={styles.charCount}>{landmark.length}/250</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.setupDivider} />

      {/* 3. RECIPIENT & VERIFICATION */}
      <div className={styles.setupSectionHeader}>
        <User size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>RECIPIENT & VERIFICATION</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className={styles.inputLabel}>Recipient Name *</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <User size={16} className={styles.inputIcon} />
              <input
                type="text"
                className={styles.inputField}
                placeholder="Enter recipient name"
                value={recipientName}
                onChange={(e) => handleUpdate({ recipientName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className={styles.inputLabel}>Recipient Contact *</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <Phone size={16} className={styles.inputIcon} />
              <input
                type="tel"
                className={styles.inputField}
                placeholder="Enter mobile number"
                value={recipientContact}
                onChange={(e) => handleUpdate({ recipientContact: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className={styles.inputLabel}>Verification Method *</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <ShieldCheck size={16} className={styles.inputIcon} />
              <select
                className={styles.selectDropdown}
                value={verificationMethod}
                onChange={(e) => handleUpdate({ verificationMethod: e.target.value })}
              >
                <option value="OTP Verification">OTP Verification</option>
                <option value="ID Proof Verification">ID Proof Verification</option>
                <option value="Signature Verification">Signature Verification</option>
                <option value="Face Verification">Face Verification</option>
                <option value="Authorized Person Verification">Authorized Person Verification</option>
                <option value="PIN Verification">PIN Verification</option>
              </select>
              <ChevronDown className={styles.selectChevron} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <div className="text-xs font-bold text-slate-900">Recipient must be available within window</div>
              <div className="text-[10px] text-slate-500">If unavailable, follow alternate instruction.</div>
            </div>
            <input
              type="checkbox"
              className={styles.goldSwitch}
              checked={recipientMustBeAvailable}
              onChange={(e) => handleUpdate({ recipientMustBeAvailable: e.target.checked })}
            />
          </div>

          <div>
            <label className={styles.inputLabel}>Alternate Contact (Optional)</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <Phone size={16} className={styles.inputIcon} />
              <input
                type="tel"
                className={styles.inputField}
                placeholder="Enter alternate number"
                value={alternateContact}
                onChange={(e) => handleUpdate({ alternateContact: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.setupDivider} />

      {/* 4. SECURITY & HANDLING CONFIGURATION */}
      <div className={styles.setupSectionHeader}>
        <Shield size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>SECURITY & HANDLING CONFIGURATION</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <div className="text-xs font-bold text-slate-900">Tamper-Proof Sealing</div>
              <div className="text-[10px] text-slate-500">Serialized tamper-evident security barcode seal.</div>
            </div>
            <input
              type="checkbox"
              className={styles.goldSwitch}
              checked={tamperProofSealing}
              onChange={(e) => handleUpdate({ tamperProofSealing: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <div className="text-xs font-bold text-slate-900">Single Point of Contact</div>
              <div className="text-[10px] text-slate-500">Dedicated custodian from pickup to delivery.</div>
            </div>
            <input
              type="checkbox"
              className={styles.goldSwitch}
              checked={singlePointOfContact}
              onChange={(e) => handleUpdate({ singlePointOfContact: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <div className="text-xs font-bold text-slate-900">Secure Storage at Hubs</div>
              <div className="text-[10px] text-slate-500">Access-controlled locked vault for holding.</div>
            </div>
            <input
              type="checkbox"
              className={styles.goldSwitch}
              checked={secureStorageAtHubs}
              onChange={(e) => handleUpdate({ secureStorageAtHubs: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <div className="text-xs font-bold text-slate-900">Armed Escort (If Available)</div>
              <div className="text-[10px] text-slate-500">Armed security personnel accompaniment.</div>
            </div>
            <input
              type="checkbox"
              className={styles.goldSwitch}
              checked={armedEscort}
              onChange={(e) => handleUpdate({ armedEscort: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <div className="text-xs font-bold text-slate-900">No Unattended Delivery</div>
              <div className="text-[10px] text-slate-500">Never left without verified recipient signature.</div>
            </div>
            <input
              type="checkbox"
              className={styles.goldSwitch}
              checked={noUnattendedDelivery}
              onChange={(e) => handleUpdate({ noUnattendedDelivery: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <div className="text-xs font-bold text-slate-900">Photo Proof at Every Stage</div>
              <div className="text-[10px] text-slate-500">Time and geolocation stamped custody photos.</div>
            </div>
            <input
              type="checkbox"
              className={styles.goldSwitch}
              checked={photoProofAtEveryStage}
              onChange={(e) => handleUpdate({ photoProofAtEveryStage: e.target.checked })}
            />
          </div>
        </div>
      </div>

      <div className={styles.setupDivider} />

      {/* 5. HANDLING & SERVICE OPTIONS */}
      <div className={styles.setupSectionHeader}>
        <CheckCircle size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>HANDLING & SERVICE OPTIONS</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            { id: 'Precise Delivery', title: 'Precise Delivery', sub: 'Deliver within selected time window.', rec: true },
            { id: 'Precise + Priority', title: 'Precise + Priority', sub: 'Highest priority handling.' },
            { id: 'Precise + Signature', title: 'Precise + Signature', sub: 'Signature required in window.' },
            { id: 'Photo Proof', title: 'Photo Proof', sub: 'Image proof at delivery.' },
          ].map((opt) => (
            <div
              key={opt.id}
              className={`${styles.radioCardBox} ${handlingOption === opt.id ? styles.radioCardActive : ''}`}
              onClick={() => handleUpdate({ handlingOption: opt.id })}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`${styles.radioCircle} ${handlingOption === opt.id ? styles.radioCircleActive : ''}`} />
                <span className="font-bold text-xs text-slate-900">{opt.title}</span>
              </div>
              {opt.rec && (
                <span className="text-[10px] text-amber-600 font-bold block mb-1">(Recommended)</span>
              )}
              <div className="text-[10px] text-slate-500">{opt.sub}</div>
            </div>
          ))}
        </div>

        <div>
          <label className={styles.inputLabel}>SPECIAL INSTRUCTIONS (OPTIONAL)</label>
          <div className="relative mt-2">
            <textarea
              className={styles.textareaField}
              placeholder="Add any special instruction for precise delivery..."
              maxLength={250}
              value={specialInstructions}
              onChange={(e) => handleUpdate({ specialInstructions: e.target.value })}
            />
            <span className={styles.charCount}>{specialInstructions.length}/250</span>
          </div>
        </div>

        <div className={`${styles.noticeBox} mt-3`}>
          <Info size={18} className={styles.setupGoldIcon} />
          <span className={styles.noticeText}>
            We guarantee delivery within the selected time window. Any deviation will be considered an exception.
          </span>
        </div>
      </div>
    </div>
  )
}
