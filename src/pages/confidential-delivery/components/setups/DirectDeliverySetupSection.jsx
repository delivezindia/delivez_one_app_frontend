import React from 'react'
import {
  GitFork,
  Navigation,
  Shield,
  Zap,
  Lock,
  Bell,
  UserCheck,
  Info,
} from 'lucide-react'
import styles from '../../ConfidentialDeliveryBookingPage.module.css'

export default function DirectDeliverySetupSection({
  data = {},
  onChange,
  pickupAddress,
  deliveryAddress,
}) {
  const deliveryType = data.deliveryType || 'Point-to-Point Dedicated'
  const singlePointHandling = data.singlePointHandling !== false
  const avoidHubs = data.avoidHubs !== false
  const sealedSecure = data.sealedSecure !== false
  const deliveryAlerts = data.deliveryAlerts !== false
  const recipientInformed = data.recipientInformed !== false
  const handlingOption = data.handlingOption || 'Direct Standard'
  const specialInstructions = data.specialInstructions || ''

  const handleUpdate = (patch) => {
    if (onChange) {
      onChange({ ...data, ...patch })
    }
  }

  return (
    <div className={styles.setupCard}>
      {/* 1. DIRECT DELIVERY TYPE */}
      <div className={styles.setupSectionHeader}>
        <GitFork size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>DIRECT DELIVERY TYPE</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          <div
            className={`${styles.radioCardBox} ${deliveryType === 'Point-to-Point Dedicated' ? styles.radioCardActive : ''}`}
            onClick={() => handleUpdate({ deliveryType: 'Point-to-Point Dedicated' })}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`${styles.radioCircle} ${deliveryType === 'Point-to-Point Dedicated' ? styles.radioCircleActive : ''}`} />
              <Navigation size={16} className={styles.setupGoldIcon} />
            </div>
            <div className="font-bold text-xs text-slate-900">Point-to-Point Dedicated</div>
            <div className="text-[10px] text-slate-500">Dedicated vehicle allocated exclusively to your shipment</div>
          </div>

          <div
            className={`${styles.radioCardBox} ${deliveryType === 'Non-Stop Express' ? styles.radioCardActive : ''}`}
            onClick={() => handleUpdate({ deliveryType: 'Non-Stop Express' })}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`${styles.radioCircle} ${deliveryType === 'Non-Stop Express' ? styles.radioCircleActive : ''}`} />
              <Zap size={16} className={styles.setupGoldIcon} />
            </div>
            <div className="font-bold text-xs text-slate-900">Non-Stop Express</div>
            <div className="text-[10px] text-slate-500">Immediate departure from pickup to drop with zero transit stops</div>
          </div>

          <div
            className={`${styles.radioCardBox} ${deliveryType === 'Maximum Confidentiality' ? styles.radioCardActive : ''}`}
            onClick={() => handleUpdate({ deliveryType: 'Maximum Confidentiality' })}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`${styles.radioCircle} ${deliveryType === 'Maximum Confidentiality' ? styles.radioCircleActive : ''}`} />
              <Shield size={16} className={styles.setupGoldIcon} />
            </div>
            <div className="font-bold text-xs text-slate-900">Maximum Confidentiality</div>
            <div className="text-[10px] text-slate-500">Direct handover with sealed lock container & sealed tamper tracking</div>
          </div>
        </div>

        {/* 2. DIRECT ROUTE PREVIEW */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-4">
          <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Navigation size={14} className="text-amber-500" />
            <span>DIRECT TRANSIT CORRIDOR</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 gap-2">
            <div className="truncate max-w-[40%]">
              <span className="text-[10px] text-slate-400 block">From (Pickup)</span>
              <span className="font-medium text-slate-800">{pickupAddress || 'Origin Address'}</span>
            </div>
            <div className="flex flex-col items-center flex-shrink-0 px-2">
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Direct / 0 Stops
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Est. 45 mins</span>
            </div>
            <div className="truncate max-w-[40%] text-right">
              <span className="text-[10px] text-slate-400 block">To (Delivery)</span>
              <span className="font-medium text-slate-800">{deliveryAddress || 'Destination Address'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.setupDivider} />

      {/* 3. DIRECT DELIVERY PREFERENCES */}
      <div className={styles.setupSectionHeader}>
        <Shield size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>DIRECT DELIVERY PREFERENCES</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Single Point Handling</div>
                <div className={styles.toggleDesc}>Single executive handles pickup directly through delivery.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={singlePointHandling}
                onChange={(e) => handleUpdate({ singlePointHandling: e.target.checked })}
              />
            </div>

            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Avoid Hubs</div>
                <div className={styles.toggleDesc}>Zero hub routing - bypasses all sorting warehouses.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={avoidHubs}
                onChange={(e) => handleUpdate({ avoidHubs: e.target.checked })}
              />
            </div>

            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Sealed Secure Container</div>
                <div className={styles.toggleDesc}>High security tamper-resistant transit box.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={sealedSecure}
                onChange={(e) => handleUpdate({ sealedSecure: e.target.checked })}
              />
            </div>
          </div>

          <div>
            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Delivery Alerts</div>
                <div className={styles.toggleDesc}>Immediate GPS location alerts on departure and approach.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={deliveryAlerts}
                onChange={(e) => handleUpdate({ deliveryAlerts: e.target.checked })}
              />
            </div>

            <div className={styles.toggleRowItem}>
              <div className="flex-1">
                <div className={styles.toggleTitle}>Recipient Informed</div>
                <div className={styles.toggleDesc}>Pre-arrival contact 15 minutes before arrival.</div>
              </div>
              <input
                type="checkbox"
                className={styles.goldSwitch}
                checked={recipientInformed}
                onChange={(e) => handleUpdate({ recipientInformed: e.target.checked })}
              />
            </div>
          </div>
        </div>

        {/* 4. HANDLING OPTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          {[
            { id: 'Direct Standard', title: 'Direct Standard', desc: 'Direct Point-to-Point delivery' },
            { id: 'Direct + Armed Guard', title: 'Direct + Armed Guard', desc: 'Armed escort on direct route' },
            { id: 'Direct Sealed Lock Box', title: 'Direct Sealed Lock Box', desc: 'Lock box with dual OTP release' },
          ].map((h) => (
            <div
              key={h.id}
              className={`${styles.radioCardBox} ${handlingOption === h.id ? styles.radioCardActive : ''}`}
              onClick={() => handleUpdate({ handlingOption: h.id })}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`${styles.radioCircle} ${handlingOption === h.id ? styles.radioCircleActive : ''}`} />
                <span className="font-bold text-xs text-slate-900">{h.title}</span>
              </div>
              <div className="text-[10px] text-slate-500">{h.desc}</div>
            </div>
          ))}
        </div>

        {/* Special Instructions */}
        <div>
          <label className={styles.inputLabel}>SPECIAL INSTRUCTIONS (OPTIONAL)</label>
          <div className="relative mt-2">
            <textarea
              className={styles.textareaField}
              placeholder="Add any specific direct route instructions..."
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
            Direct deliveries operate on a dedicated point-to-point transit SLA without hub scanning or intermediate handling.
          </span>
        </div>
      </div>
    </div>
  )
}
