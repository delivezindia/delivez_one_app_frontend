import React from 'react'
import {
  ShieldAlert,
  Gem,
  Clock,
  Shield,
  Lock,
  UserCheck,
  Camera,
  AlertTriangle,
  Zap,
  Info,
  ChevronDown,
} from 'lucide-react'
import styles from '../../ConfidentialDeliveryBookingPage.module.css'

export default function CriticalSetupSection({ data = {}, onChange }) {
  const shipmentType = data.shipmentType || 'High Value'
  const criticalLevel = data.criticalLevel || 'Level 1 - Highest'
  const declaredValue = data.declaredValue || '1,50,000'
  const slaCommitment = data.slaCommitment || 'Strict 2-Hour SLA'
  const tamperProof = data.tamperProof !== false
  const singlePointContact = data.singlePointContact !== false
  const secureStorage = data.secureStorage !== false
  const armedEscort = data.armedEscort || false
  const noUnattended = data.noUnattended !== false
  const photoProof = data.photoProof !== false
  const priorityHandling = data.priorityHandling || 'Highest Priority'
  const realTimeTracking = data.realTimeTracking !== false
  const delayAlertThreshold = data.delayAlertThreshold || '15 minutes'
  const specialInstructions = data.specialInstructions || ''

  const handleUpdate = (patch) => {
    if (onChange) {
      onChange({ ...data, ...patch })
    }
  }

  return (
    <div className={styles.setupCard}>
      {/* Red Critical Banner */}
      <div className={styles.criticalAlertBanner}>
        <ShieldAlert size={20} className="text-red-600 flex-shrink-0" />
        <div>
          <div className="font-bold text-xs text-red-700 tracking-wider">CRITICAL SHIPMENT</div>
          <div className="text-[11px] text-red-600 mt-0.5">
            Extra care, priority handling & real-time monitoring will be applied.
          </div>
        </div>
      </div>

      {/* 1. CRITICAL DETAILS */}
      <div className={styles.setupSectionHeader}>
        <ShieldAlert size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>CRITICAL DETAILS</span>
      </div>

      <div className={styles.setupSectionBody}>
        <label className={styles.inputLabel}>Critical Shipment Type *</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 mb-4">
          <div
            className={`${styles.radioCardBox} ${shipmentType === 'High Value' ? styles.radioCardActive : ''}`}
            onClick={() => handleUpdate({ shipmentType: 'High Value' })}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`${styles.radioCircle} ${shipmentType === 'High Value' ? styles.radioCircleActive : ''}`} />
              <Gem size={16} className={styles.setupGoldIcon} />
            </div>
            <div className="font-bold text-xs text-slate-900">High Value</div>
            <div className="text-[10px] text-slate-500">Expensive items (e.g. jewelry, electronics)</div>
          </div>

          <div
            className={`${styles.radioCardBox} ${shipmentType === 'Time Critical' ? styles.radioCardActive : ''}`}
            onClick={() => handleUpdate({ shipmentType: 'Time Critical' })}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`${styles.radioCircle} ${shipmentType === 'Time Critical' ? styles.radioCircleActive : ''}`} />
              <Clock size={16} className={styles.setupGoldIcon} />
            </div>
            <div className="font-bold text-xs text-slate-900">Time Critical</div>
            <div className="text-[10px] text-slate-500">Urgent delivery with strict SLA</div>
          </div>

          <div
            className={`${styles.radioCardBox} ${shipmentType === 'Confidential' ? styles.radioCardActive : ''}`}
            onClick={() => handleUpdate({ shipmentType: 'Confidential' })}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`${styles.radioCircle} ${shipmentType === 'Confidential' ? styles.radioCircleActive : ''}`} />
              <Shield size={16} className={styles.setupGoldIcon} />
            </div>
            <div className="font-bold text-xs text-slate-900">Confidential</div>
            <div className="text-[10px] text-slate-500">Sensitive or confidential items/documents</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={styles.inputLabel}>Critical Level *</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <Shield size={16} className={styles.inputIcon} />
              <select
                className={styles.selectDropdown}
                value={criticalLevel}
                onChange={(e) => handleUpdate({ criticalLevel: e.target.value })}
              >
                <option value="Level 1 - Highest">Level 1 - Highest</option>
                <option value="Level 2 - High Security">Level 2 - High Security</option>
                <option value="Level 3 - Priority Secure">Level 3 - Priority Secure</option>
              </select>
              <ChevronDown className={styles.selectChevron} />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Higher levels ensure stricter handling and priority.
            </span>
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
            <span className="text-[10px] text-slate-400 mt-1 block">
              For insurance & security purpose.
            </span>
          </div>
        </div>

        <div>
          <label className={styles.inputLabel}>SLA / Delivery Commitment *</label>
          <div className={`${styles.inputWrapper} mt-2`}>
            <Clock size={16} className={styles.inputIcon} />
            <select
              className={styles.selectDropdown}
              value={slaCommitment}
              onChange={(e) => handleUpdate({ slaCommitment: e.target.value })}
            >
              <option value="Strict 2-Hour SLA">Strict 2-Hour SLA</option>
              <option value="Same Day by 4:00 PM">Same Day by 4:00 PM</option>
              <option value="Immediate Non-Stop Dispatch">Immediate Non-Stop Dispatch</option>
              <option value="Next Morning by 10:00 AM">Next Morning by 10:00 AM</option>
            </select>
            <ChevronDown className={styles.selectChevron} />
          </div>
        </div>
      </div>

      <div className={styles.setupDivider} />

      {/* 2. SECURITY & HANDLING INSTRUCTIONS */}
      <div className={styles.setupSectionHeader}>
        <Shield size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>SECURITY & HANDLING INSTRUCTIONS</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Tamper-Proof Sealing</div>
                <div className={styles.toggleDesc}>Shipment sealed with tamper-evident material.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={tamperProof}
                onChange={(e) => handleUpdate({ tamperProof: e.target.checked })}
              />
            </div>

            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Single Point of Contact</div>
                <div className={styles.toggleDesc}>Only one authorized person can handle this shipment.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={singlePointContact}
                onChange={(e) => handleUpdate({ singlePointContact: e.target.checked })}
              />
            </div>

            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Secure Storage at Hubs</div>
                <div className={styles.toggleDesc}>Store in high-security zone at all hubs.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={secureStorage}
                onChange={(e) => handleUpdate({ secureStorage: e.target.checked })}
              />
            </div>
          </div>

          <div>
            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Armed Escort (If Available)</div>
                <div className={styles.toggleDesc}>Escort for pickup and/or delivery.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={armedEscort}
                onChange={(e) => handleUpdate({ armedEscort: e.target.checked })}
              />
            </div>

            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>No Unattended Delivery</div>
                <div className={styles.toggleDesc}>Recipient must be present for delivery.</div>
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
                <div className={styles.toggleTitle}>Photo Proof at Every Stage</div>
                <div className={styles.toggleDesc}>Capture images at key milestones.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={photoProof}
                onChange={(e) => handleUpdate({ photoProof: e.target.checked })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.setupDivider} />

      {/* 3. PRIORITY & MONITORING */}
      <div className={styles.setupSectionHeader}>
        <Zap size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>PRIORITY & MONITORING</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className="flex items-center justify-between py-2 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-amber-500" />
            <div>
              <div className="text-xs font-bold text-slate-800">Priority Handling</div>
              <div className="text-[10px] text-slate-500">Expedite processing at every checkpoint.</div>
            </div>
          </div>
          <select
            className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1"
            value={priorityHandling}
            onChange={(e) => handleUpdate({ priorityHandling: e.target.value })}
          >
            <option value="Highest Priority">Highest Priority</option>
            <option value="Critical Express">Critical Express</option>
            <option value="Standard High">Standard High</option>
          </select>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-amber-500" />
            <div>
              <div className="text-xs font-bold text-slate-800">Real-time Tracking & Alerts</div>
              <div className="text-[10px] text-slate-500">Get instant alerts for every milestone.</div>
            </div>
          </div>
          <input
            type="checkbox"
            className={styles.goldSwitch}
            checked={realTimeTracking}
            onChange={(e) => handleUpdate({ realTimeTracking: e.target.checked })}
          />
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-500" />
            <div>
              <div className="text-xs font-bold text-slate-800">Delay Alert Threshold</div>
              <div className="text-[10px] text-slate-500">Get alerted if delay exceeds the selected threshold.</div>
            </div>
          </div>
          <select
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-1"
            value={delayAlertThreshold}
            onChange={(e) => handleUpdate({ delayAlertThreshold: e.target.value })}
          >
            <option value="15 minutes">15 minutes</option>
            <option value="30 minutes">30 minutes</option>
            <option value="45 minutes">45 minutes</option>
            <option value="1 hour">1 hour</option>
          </select>
        </div>

        <div>
          <label className={styles.inputLabel}>SPECIAL INSTRUCTIONS (OPTIONAL)</label>
          <div className="relative mt-2">
            <textarea
              className={styles.textareaField}
              placeholder="Add any special instructions for handling this critical shipment..."
              maxLength={250}
              value={specialInstructions}
              onChange={(e) => handleUpdate({ specialInstructions: e.target.value })}
            />
            <span className={styles.charCount}>
              {specialInstructions.length}/250
            </span>
          </div>
        </div>

        <div className={`${styles.criticalAlertBanner} mt-4`}>
          <Info size={18} className="text-red-500 flex-shrink-0" />
          <span className="text-[11px] text-red-700">
            Critical shipments are handled with maximum security, priority and continuous monitoring to ensure safe and on-time delivery.
          </span>
        </div>
      </div>
    </div>
  )
}
