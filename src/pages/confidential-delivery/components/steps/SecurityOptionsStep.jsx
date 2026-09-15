import React from 'react'
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Bell,
  Lock,
  UserCheck,
  ChevronRight,
  CheckCircle,
} from 'lucide-react'
import styles from '../../ConfidentialDeliveryBookingPage.module.css'

export const SECURITY_LEVELS = [
  {
    id: 'STANDARD_SECURITY',
    name: 'Standard Security',
    desc: 'Basic security with sealed tamper-evident packaging and tracking.',
    badge: 'Included',
    badgeClass: 'badgeSlate',
    fee: 0,
  },
  {
    id: 'ENHANCED_SECURITY',
    name: 'Enhanced Security',
    desc: 'Tamper-proof physical sealing and live GPS checkpoint updates.',
    badge: 'Recommended',
    badgeClass: 'badgeGold',
    fee: 30,
  },
  {
    id: 'MAXIMUM_SECURITY',
    name: 'Maximum Security',
    desc: 'Armed escort / high security handling for critical or diplomatic items.',
    badge: 'Premium',
    badgeClass: 'badgeRed',
    fee: 60,
  },
]

export default function SecurityOptionsStep({
  data = {},
  onChange,
  onContinue,
  onBack,
}) {
  const securityLevel = data.securityLevel || 'ENHANCED_SECURITY'
  const features = data.features || {
    realtimeGps: true,
    deliveryAlerts: true,
    armedEscort: false,
    secureStorageHubs: true,
    restrictedAccess: true,
  }
  const additionalInstructions = data.additionalInstructions || ''

  const handleUpdate = (patch) => {
    if (onChange) {
      onChange({ ...data, ...patch })
    }
  }

  const toggleFeature = (key) => {
    handleUpdate({
      features: {
        ...features,
        [key]: !features[key],
      },
    })
  }

  return (
    <div className={styles.stepContentContainer}>
      {/* 1. SECURITY LEVEL SELECTION */}
      <h1 className={styles.mainStepTitle}>Choose Security Level</h1>
      <p className={styles.mainStepSubtitle}>
        Select the level of protection and chain-of-custody protocols for your confidential items.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
        {SECURITY_LEVELS.map((lvl) => {
          const isSelected = securityLevel === lvl.id
          return (
            <div
              key={lvl.id}
              className={`${styles.packagingCard} ${isSelected ? styles.packagingCardActive : ''}`}
              onClick={() => handleUpdate({ securityLevel: lvl.id })}
            >
              <div className="flex items-center justify-between mb-2">
                <Shield size={22} className={styles.setupGoldIcon} />
                <span className={`${styles.securityBadgeTag} ${styles[lvl.badgeClass]}`}>
                  {lvl.badge}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">{lvl.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{lvl.desc}</p>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Handling Fee</span>
                <span className="text-xs font-bold text-slate-900">
                  {lvl.fee > 0 ? `+ ₹${lvl.fee}` : 'Included'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 2. SECURITY FEATURES TOGGLES */}
      <div className={`${styles.cardContainer} mb-4`}>
        <div className={styles.cardHeaderRow}>
          <ShieldCheck size={18} className={styles.setupGoldIcon} />
          <span className={styles.cardHeaderTitle}>SECURITY & HANDLING CONTROLS</span>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          <div className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <MapPin size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Real-time GPS Tracking</div>
                <div className="text-[10px] text-slate-500">Track your shipment live with minute-by-minute updates.</div>
              </div>
            </div>
            <input
              type="checkbox"
              className={styles.goldSwitch}
              checked={Boolean(features.realtimeGps)}
              onChange={() => toggleFeature('realtimeGps')}
            />
          </div>

          <div className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <Bell size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Delivery Alerts & Notifications</div>
                <div className="text-[10px] text-slate-500">Get instant SMS and WhatsApp alerts for every milestone.</div>
              </div>
            </div>
            <input
              type="checkbox"
              className={styles.goldSwitch}
              checked={Boolean(features.deliveryAlerts)}
              onChange={() => toggleFeature('deliveryAlerts')}
            />
          </div>

          <div className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <ShieldAlert size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Armed Escort (Optional)</div>
                <div className="text-[10px] text-slate-500">Add armed escort for high value or sensitive shipments.</div>
              </div>
            </div>
            <input
              type="checkbox"
              className={styles.goldSwitch}
              checked={Boolean(features.armedEscort)}
              onChange={() => toggleFeature('armedEscort')}
            />
          </div>

          <div className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <Lock size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Secure Storage at Hubs</div>
                <div className="text-[10px] text-slate-500">Secure handling & storage in isolated high-security vaults at all hubs.</div>
              </div>
            </div>
            <input
              type="checkbox"
              className={styles.goldSwitch}
              checked={Boolean(features.secureStorageHubs)}
              onChange={() => toggleFeature('secureStorageHubs')}
            />
          </div>

          <div className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <UserCheck size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Restricted Access</div>
                <div className="text-[10px] text-slate-500">Limit access to authorized personnel with biometric clearance only.</div>
              </div>
            </div>
            <input
              type="checkbox"
              className={styles.goldSwitch}
              checked={Boolean(features.restrictedAccess)}
              onChange={() => toggleFeature('restrictedAccess')}
            />
          </div>
        </div>
      </div>

      {/* 3. ADDITIONAL INSTRUCTIONS */}
      <div className={`${styles.cardContainer} mb-4`}>
        <label className={styles.inputLabel}>ADDITIONAL INSTRUCTIONS (OPTIONAL)</label>
        <div className="relative mt-2">
          <textarea
            className={styles.textareaField}
            placeholder="Add any special security instructions..."
            maxLength={250}
            value={additionalInstructions}
            onChange={(e) => handleUpdate({ additionalInstructions: e.target.value })}
          />
          <span className={styles.charCount}>{additionalInstructions.length}/250</span>
        </div>

        <div className={`${styles.noticeBox} mt-3`}>
          <Shield size={18} className={styles.setupGoldIcon} />
          <span className={styles.noticeText}>
            We follow strict security protocols to ensure your shipment is safe and delivered with maximum confidentiality.
          </span>
        </div>
      </div>

      {/* Norton SECURED & Bank-Level Encryption Banner */}
      <div className={styles.nortonBanner}>
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-amber-500" />
          <span className="text-xs text-slate-700">
            Your data and documents are protected with bank-level encryption and secure servers.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
          <CheckCircle size={14} />
          <span>Norton SECURED</span>
        </div>
      </div>

      {/* Bottom Continue Button */}
      <div className={styles.bottomCtaSection}>
        <button
          type="button"
          className={styles.redCtaButton}
          onClick={onContinue}
        >
          <span>Continue</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
