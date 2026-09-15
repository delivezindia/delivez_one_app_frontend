import React from 'react'
import {
  Briefcase,
  FileText,
  Gem,
  Star,
  UserCheck,
  ShieldCheck,
  Camera,
  Link as LinkIcon,
  PhoneCall,
  Info,
  ChevronDown,
} from 'lucide-react'
import styles from '../../ConfidentialDeliveryBookingPage.module.css'

export default function HandcarrySetupSection({ data = {}, onChange }) {
  const handCarryType = data.handCarryType || 'Confidential Documents'
  const executiveLevel = data.executiveLevel || 'Verified Executive'
  const declaredValue = data.declaredValue || '2,50,000'
  const handoverSlot = data.handoverSlot || 'Today, 02:00 PM - 04:00 PM'
  const dedicatedExecutive = data.dedicatedExecutive !== false
  const idCheckPickup = data.idCheckPickup !== false
  const idCheckDelivery = data.idCheckDelivery !== false
  const signatureHandover = data.signatureHandover !== false
  const noUnattended = data.noUnattended !== false
  const recipientPresent = data.recipientPresent || false
  const realTimeTracking = data.realTimeTracking !== false
  const chainOfCustody = data.chainOfCustody !== false
  const photoProof = data.photoProof !== false
  const confidentialHandling = data.confidentialHandling !== false
  const escalationContact = data.escalationContact !== false
  const specialInstructions = data.specialInstructions || ''

  const handleUpdate = (patch) => {
    if (onChange) {
      onChange({ ...data, ...patch })
    }
  }

  return (
    <div className={styles.setupCard}>
      {/* 1. HAND CARRY DETAILS */}
      <div className={styles.setupSectionHeader}>
        <Briefcase size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>HAND CARRY DETAILS</span>
      </div>

      <div className={styles.setupSectionBody}>
        <label className={styles.inputLabel}>Hand Carry Type *</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 mb-4">
          <div
            className={`${styles.radioCardBox} ${handCarryType === 'Confidential Documents' ? styles.radioCardActive : ''}`}
            onClick={() => handleUpdate({ handCarryType: 'Confidential Documents' })}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`${styles.radioCircle} ${handCarryType === 'Confidential Documents' ? styles.radioCircleActive : ''}`} />
              <FileText size={16} className={styles.setupGoldIcon} />
            </div>
            <div className="font-bold text-xs text-slate-900">Confidential Documents</div>
            <div className="text-[10px] text-slate-500">Legal, board, or sensitive papers</div>
          </div>

          <div
            className={`${styles.radioCardBox} ${handCarryType === 'High Value Item' ? styles.radioCardActive : ''}`}
            onClick={() => handleUpdate({ handCarryType: 'High Value Item' })}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`${styles.radioCircle} ${handCarryType === 'High Value Item' ? styles.radioCircleActive : ''}`} />
              <Gem size={16} className={styles.setupGoldIcon} />
            </div>
            <div className="font-bold text-xs text-slate-900">High Value Item</div>
            <div className="text-[10px] text-slate-500">Luxury goods, jewels, prototypes</div>
          </div>

          <div
            className={`${styles.radioCardBox} ${handCarryType === 'Priority Delivery' ? styles.radioCardActive : ''}`}
            onClick={() => handleUpdate({ handCarryType: 'Priority Delivery' })}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`${styles.radioCircle} ${handCarryType === 'Priority Delivery' ? styles.radioCircleActive : ''}`} />
              <Star size={16} className={styles.setupGoldIcon} />
            </div>
            <div className="font-bold text-xs text-slate-900">Priority Delivery</div>
            <div className="text-[10px] text-slate-500">Time-bound non-stop escort</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className={styles.inputLabel}>Executive Level *</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <UserCheck size={16} className={styles.inputIcon} />
              <select
                className={styles.selectDropdown}
                value={executiveLevel}
                onChange={(e) => handleUpdate({ executiveLevel: e.target.value })}
              >
                <option value="Verified Executive">Verified Executive</option>
                <option value="Senior Vault Officer">Senior Vault Officer</option>
                <option value="Diplomatic Courier">Diplomatic Courier</option>
              </select>
              <ChevronDown className={styles.selectChevron} />
            </div>
          </div>

          <div>
            <label className={styles.inputLabel}>Declared Value (₹) *</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <span className="text-sm font-bold text-amber-600 pl-1">₹</span>
              <input
                type="text"
                className={styles.inputField}
                value={declaredValue}
                onChange={(e) => handleUpdate({ declaredValue: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className={styles.inputLabel}>Preferred Handover Slot *</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <input
                type="text"
                className={styles.inputField}
                value={handoverSlot}
                onChange={(e) => handleUpdate({ handoverSlot: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.setupDivider} />

      {/* 2. EXECUTIVE & HANDOVER INSTRUCTIONS */}
      <div className={styles.setupSectionHeader}>
        <ShieldCheck size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>EXECUTIVE & HANDOVER INSTRUCTIONS</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Dedicated Executive</div>
                <div className={styles.toggleDesc}>Assign a single executive for end-to-end handling.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={dedicatedExecutive}
                onChange={(e) => handleUpdate({ dedicatedExecutive: e.target.checked })}
              />
            </div>

            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>ID Check on Pickup</div>
                <div className={styles.toggleDesc}>Verify sender ID before accepting shipment.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={idCheckPickup}
                onChange={(e) => handleUpdate({ idCheckPickup: e.target.checked })}
              />
            </div>

            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>ID Check on Delivery</div>
                <div className={styles.toggleDesc}>Verify recipient ID before handover.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={idCheckDelivery}
                onChange={(e) => handleUpdate({ idCheckDelivery: e.target.checked })}
              />
            </div>
          </div>

          <div>
            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Signature at Handover</div>
                <div className={styles.toggleDesc}>Obtain digital signature from recipient.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={signatureHandover}
                onChange={(e) => handleUpdate({ signatureHandover: e.target.checked })}
              />
            </div>

            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>No Unattended Delivery</div>
                <div className={styles.toggleDesc}>Delivery only when recipient is present.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={noUnattended}
                onChange={(e) => handleUpdate({ noUnattended: e.target.checked })}
              />
            </div>

            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Recipient Must Be Present</div>
                <div className={styles.toggleDesc}>No delivery to proxies or representatives.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={recipientPresent}
                onChange={(e) => handleUpdate({ recipientPresent: e.target.checked })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.setupDivider} />

      {/* 3. MONITORING & SECURITY */}
      <div className={styles.setupSectionHeader}>
        <UserCheck size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>MONITORING & SECURITY</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Real-time Tracking & Alerts</div>
                <div className={styles.toggleDesc}>Track live location with instant alerts.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={realTimeTracking}
                onChange={(e) => handleUpdate({ realTimeTracking: e.target.checked })}
              />
            </div>

            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Chain of Custody</div>
                <div className={styles.toggleDesc}>Record every handover in the chain.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={chainOfCustody}
                onChange={(e) => handleUpdate({ chainOfCustody: e.target.checked })}
              />
            </div>

            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Photo Proof at Delivery</div>
                <div className={styles.toggleDesc}>Capture delivery photo with timestamp.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={photoProof}
                onChange={(e) => handleUpdate({ photoProof: e.target.checked })}
              />
            </div>
          </div>

          <div>
            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Confidential Handling</div>
                <div className={styles.toggleDesc}>Executive bound by confidentiality policy.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={confidentialHandling}
                onChange={(e) => handleUpdate({ confidentialHandling: e.target.checked })}
              />
            </div>

            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Escalation Contact Required</div>
                <div className={styles.toggleDesc}>Mandatory escalation contact for incidents.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={escalationContact}
                onChange={(e) => handleUpdate({ escalationContact: e.target.checked })}
              />
            </div>
          </div>
        </div>

        <div>
          <label className={styles.inputLabel}>SPECIAL INSTRUCTIONS (OPTIONAL)</label>
          <div className="relative mt-2">
            <textarea
              className={styles.textareaField}
              placeholder="Add any special instructions for handling this hand-carry shipment..."
              maxLength={250}
              value={specialInstructions}
              onChange={(e) => handleUpdate({ specialInstructions: e.target.value })}
            />
            <span className={styles.charCount}>
              {specialInstructions.length}/250
            </span>
          </div>
        </div>

        <div className={`${styles.noticeBox} mt-4`}>
          <Info size={18} className="text-blue-500 flex-shrink-0" />
          <span className="text-[11px] text-blue-700">
            Hand carry shipments are managed with dedicated custody and direct handover controls for maximum confidentiality.
          </span>
        </div>
      </div>
    </div>
  )
}
