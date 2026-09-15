import React from 'react'
import {
  MapPin,
  Building2,
  Home,
  User,
  Phone,
  Briefcase,
  FileText,
  Calendar,
  Clock,
  Info,
  Shield,
  Badge,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Navigation,
  KeyRound,
  FileCheck,
} from 'lucide-react'
import ReturnSetupSection from '../setups/ReturnSetupSection.jsx'
import ExchangeSetupSection from '../setups/ExchangeSetupSection.jsx'
import MultipointSetupSection from '../setups/MultipointSetupSection.jsx'
import CriticalSetupSection from '../setups/CriticalSetupSection.jsx'
import HandcarrySetupSection from '../setups/HandcarrySetupSection.jsx'
import PreciseDeliverySetupSection from '../setups/PreciseDeliverySetupSection.jsx'
import DirectDeliverySetupSection from '../setups/DirectDeliverySetupSection.jsx'
import styles from '../../ConfidentialDeliveryBookingPage.module.css'

const ACCESS_OPTIONS = [
  { id: 'Security Check', title: 'Security\nCheck', icon: Shield },
  { id: 'Visitor Pass', title: 'Visitor\nPass', icon: Badge },
  { id: 'Lift Access', title: 'Lift\nAccess', icon: Building2 },
  { id: 'ID Proof', title: 'ID Proof', icon: FileCheck },
  { id: 'Parking', title: 'Parking', icon: KeyRound },
]

export default function RecipientDetailsStep({
  serviceType = 'Vault Secure',
  data = {},
  setupsData = {},
  pickupData = {},
  onChange,
  onSetupsChange,
  onContinue,
  onBack,
}) {
  const deliveryType = data.deliveryType || 'Business'
  const contactName = data.contactName || ''
  const mobileNumber = data.mobileNumber || ''
  const companyName = data.companyName || ''
  const gstin = data.gstin || ''
  const completeAddress = data.completeAddress || ''
  const city = data.city || ''
  const state = data.state || ''
  const pinCode = data.pinCode || ''
  const contactPerson = data.contactPerson || ''
  const designation = data.designation || ''
  const alternateMobile = data.alternateMobile || ''
  const email = data.email || ''
  const preferredDate = data.preferredDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const timeWindow = data.timeWindow || '12:00 PM - 02:00 PM'
  const customerAvailable = data.customerAvailable || ''
  const specialInstructions = data.specialInstructions || ''
  const accessRequirements = data.accessRequirements || ['Security Check', 'Visitor Pass', 'Lift Access']

  const handleUpdate = (patch) => {
    if (onChange) {
      onChange({ ...data, ...patch })
    }
  }

  const handleSetupUpdate = (subKey, patch) => {
    if (onSetupsChange) {
      onSetupsChange({
        ...setupsData,
        [subKey]: {
          ...(setupsData[subKey] || {}),
          ...patch,
        },
      })
    }
  }

  const toggleAccessReq = (id) => {
    if (accessRequirements.includes(id)) {
      handleUpdate({ accessRequirements: accessRequirements.filter((x) => x !== id) })
    } else {
      handleUpdate({ accessRequirements: [...accessRequirements, id] })
    }
  }

  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleUpdate({
            completeAddress: `Current Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
          })
        },
        () => {
          alert('Unable to retrieve location. Please type your address.')
        }
      )
    }
  }

  return (
    <div className={styles.stepContentContainer}>
      {/* 1. DELIVERY LOCATION CARD */}
      <div className={styles.cardContainer}>
        <div className={styles.cardHeaderRow}>
          <MapPin size={18} className={styles.setupGoldIcon} />
          <span className={styles.cardHeaderTitle}>DELIVERY LOCATION</span>
        </div>

        <div className="mt-4">
          <label className={styles.inputLabel}>Delivery Type</label>
          <div className="grid grid-cols-2 gap-3 mt-1.5 mb-4">
            <button
              type="button"
              className={`${styles.typeToggleBtn} ${deliveryType === 'Business' ? styles.typeToggleActive : ''}`}
              onClick={() => handleUpdate({ deliveryType: 'Business' })}
            >
              <Building2 size={18} />
              <span>Business</span>
            </button>
            <button
              type="button"
              className={`${styles.typeToggleBtn} ${deliveryType === 'Home' ? styles.typeToggleActive : ''}`}
              onClick={() => handleUpdate({ deliveryType: 'Home' })}
            >
              <Home size={18} />
              <span>Home</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={styles.inputLabel}>Contact Name *</label>
              <div className={`${styles.inputWrapper} mt-1.5`}>
                <User size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Enter full name"
                  value={contactName}
                  onChange={(e) => handleUpdate({ contactName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={styles.inputLabel}>Mobile Number *</label>
              <div className={`${styles.inputWrapper} mt-1.5`}>
                <Phone size={16} className={styles.inputIcon} />
                <input
                  type="tel"
                  className={styles.inputField}
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChange={(e) => handleUpdate({ mobileNumber: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={styles.inputLabel}>Company / Organization (Optional)</label>
              <div className={`${styles.inputWrapper} mt-1.5`}>
                <Briefcase size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => handleUpdate({ companyName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={styles.inputLabel}>GSTIN (Optional)</label>
              <div className={`${styles.inputWrapper} mt-1.5`}>
                <FileText size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Enter GSTIN"
                  value={gstin}
                  onChange={(e) => handleUpdate({ gstin: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className={styles.inputLabel}>Complete Delivery Address *</label>
            <div className={`${styles.inputWrapper} mt-1.5`}>
              <MapPin size={16} className={styles.inputIcon} />
              <input
                type="text"
                className={styles.inputField}
                placeholder="House / Building, Street, Area, Landmark"
                value={completeAddress}
                onChange={(e) => handleUpdate({ completeAddress: e.target.value })}
              />
              <div className={styles.inputSuffixDivider} />
              <button
                type="button"
                className={styles.useMyLocationBtn}
                onClick={handleUseMyLocation}
              >
                <Navigation size={14} className={styles.setupGoldIcon} />
                <span>Use My Location</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={styles.inputLabel}>City *</label>
              <div className={`${styles.inputWrapper} mt-1.5`}>
                <Building2 size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Select city"
                  value={city}
                  onChange={(e) => handleUpdate({ city: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={styles.inputLabel}>State *</label>
              <div className={`${styles.inputWrapper} mt-1.5`}>
                <MapPin size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Select state"
                  value={state}
                  onChange={(e) => handleUpdate({ state: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={styles.inputLabel}>PIN Code *</label>
              <div className={`${styles.inputWrapper} mt-1.5`}>
                <MapPin size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Enter PIN code"
                  value={pinCode}
                  onChange={(e) => handleUpdate({ pinCode: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN SECTION: CONTACT PERSON ON LEFT, TIMING & INSTRUCTIONS ON RIGHT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Left: Delivery Contact Person */}
        <div className="space-y-4">
          <div className={styles.cardContainer}>
            <div className={styles.cardHeaderRow}>
              <User size={18} className={styles.setupGoldIcon} />
              <span className={styles.cardHeaderTitle}>DELIVERY CONTACT PERSON</span>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <label className={styles.inputLabel}>Contact Person</label>
                <div className={`${styles.inputWrapper} mt-1.5`}>
                  <User size={16} className={styles.inputIcon} />
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="Enter contact person name"
                    value={contactPerson}
                    onChange={(e) => handleUpdate({ contactPerson: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={styles.inputLabel}>Designation (Optional)</label>
                <div className={`${styles.inputWrapper} mt-1.5`}>
                  <Briefcase size={16} className={styles.inputIcon} />
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="Enter designation"
                    value={designation}
                    onChange={(e) => handleUpdate({ designation: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={styles.inputLabel}>Alternate Mobile (Optional)</label>
                <div className={`${styles.inputWrapper} mt-1.5`}>
                  <Phone size={16} className={styles.inputIcon} />
                  <input
                    type="tel"
                    className={styles.inputField}
                    placeholder="Enter alternate number"
                    value={alternateMobile}
                    onChange={(e) => handleUpdate({ alternateMobile: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={styles.inputLabel}>Email (Optional)</label>
                <div className={`${styles.inputWrapper} mt-1.5`}>
                  <input
                    type="email"
                    className={styles.inputField}
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => handleUpdate({ email: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.noticeBox}>
            <ShieldCheck size={20} className={styles.setupGoldIcon} />
            <span className={styles.noticeText}>
              We will notify the recipient before arriving at the delivery location.
            </span>
          </div>
        </div>

        {/* Right: Delivery Timing & Special Instructions */}
        <div className="space-y-4">
          <div className={styles.cardContainer}>
            <div className={styles.cardHeaderRow}>
              <Clock size={18} className={styles.setupGoldIcon} />
              <span className={styles.cardHeaderTitle}>DELIVERY TIMING</span>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <label className={styles.inputLabel}>Preferred Delivery Date</label>
                <div className={`${styles.inputWrapper} mt-1.5`}>
                  <Calendar size={16} className={styles.inputIcon} />
                  <input
                    type="date"
                    className={styles.inputField}
                    value={preferredDate}
                    onChange={(e) => handleUpdate({ preferredDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={styles.inputLabel}>Preferred Time Window</label>
                <div className={`${styles.inputWrapper} mt-1.5`}>
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
                <label className={styles.inputLabel}>Customer Available (Optional)</label>
                <div className={`${styles.inputWrapper} mt-1.5`}>
                  <Clock size={16} className={styles.inputIcon} />
                  <select
                    className={styles.selectDropdown}
                    value={customerAvailable}
                    onChange={(e) => handleUpdate({ customerAvailable: e.target.value })}
                  >
                    <option value="">Select available time</option>
                    <option value="Available All Day">Available All Day</option>
                    <option value="First Half (Before 1 PM)">First Half (Before 1 PM)</option>
                    <option value="Second Half (After 2 PM)">Second Half (After 2 PM)</option>
                    <option value="Call Prior to Dispatch">Call Prior to Dispatch</option>
                  </select>
                  <ChevronDown className={styles.selectChevron} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.cardContainer}>
            <div className={styles.cardHeaderRow}>
              <Info size={18} className={styles.setupGoldIcon} />
              <span className={styles.cardHeaderTitle}>SPECIAL INSTRUCTIONS (OPTIONAL)</span>
            </div>
            <div className="relative mt-3">
              <textarea
                className={styles.textareaField}
                placeholder="Add any special instructions for delivery..."
                maxLength={250}
                value={specialInstructions}
                onChange={(e) => handleUpdate({ specialInstructions: e.target.value })}
              />
              <span className={styles.charCount}>{specialInstructions.length}/250</span>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC SERVICE SUB-SCREENS EMBEDDED IN STEP 2 */}
      {serviceType === 'Vault Return' && (
        <div className="mt-4">
          <ReturnSetupSection
            data={setupsData.returnSetup || {}}
            pickupAddress={pickupData?.completeAddress}
            onChange={(val) => handleSetupUpdate('returnSetup', val)}
          />
        </div>
      )}

      {serviceType === 'Vault Exchange' && (
        <div className="mt-4">
          <ExchangeSetupSection
            data={setupsData.exchangeSetup || {}}
            pickupAddress={pickupData?.completeAddress}
            onChange={(val) => handleSetupUpdate('exchangeSetup', val)}
          />
        </div>
      )}

      {serviceType === 'Vault MultiPoint' && (
        <div className="mt-4">
          <MultipointSetupSection
            data={setupsData.multipointSetup || {}}
            onChange={(val) => handleSetupUpdate('multipointSetup', val)}
          />
        </div>
      )}

      {serviceType === 'Vault Critical' && (
        <div className="mt-4">
          <CriticalSetupSection
            data={setupsData.criticalSetup || {}}
            onChange={(val) => handleSetupUpdate('criticalSetup', val)}
          />
        </div>
      )}

      {serviceType === 'Vault Hand Carry' && (
        <div className="mt-4">
          <HandcarrySetupSection
            data={setupsData.handcarrySetup || {}}
            onChange={(val) => handleSetupUpdate('handcarrySetup', val)}
          />
        </div>
      )}

      {serviceType === 'Vault Precise' && (
        <div className="mt-4">
          <PreciseDeliverySetupSection
            data={setupsData.preciseSetup || {}}
            deliveryAddress={completeAddress}
            onChange={(val) => handleSetupUpdate('preciseSetup', val)}
          />
        </div>
      )}

      {serviceType === 'Vault Direct' && (
        <div className="mt-4">
          <DirectDeliverySetupSection
            data={setupsData.directSetup || {}}
            pickupAddress={pickupData?.completeAddress}
            deliveryAddress={completeAddress}
            onChange={(val) => handleSetupUpdate('directSetup', val)}
          />
        </div>
      )}

      {/* ACCESS REQUIREMENTS SECTION */}
      <div className={`${styles.cardContainer} mt-4`}>
        <div className={styles.cardHeaderRow}>
          <Shield size={18} className={styles.setupGoldIcon} />
          <span className={styles.cardHeaderTitle}>ACCESS REQUIREMENTS</span>
        </div>

        <div className={styles.accessReqScrollRow}>
          {ACCESS_OPTIONS.map((opt) => {
            const isSelected = accessRequirements.includes(opt.id)
            const IconComp = opt.icon
            return (
              <div
                key={opt.id}
                className={`${styles.accessReqCard} ${isSelected ? styles.accessReqCardActive : ''}`}
                onClick={() => toggleAccessReq(opt.id)}
              >
                <IconComp size={24} className={isSelected ? styles.setupGoldIcon : 'text-slate-400'} />
                <span className={styles.accessReqText}>{opt.title}</span>
              </div>
            )
          })}
        </div>

        <div className={`${styles.noticeBox} mt-3`}>
          <Info size={16} className={styles.setupGoldIcon} />
          <span className={styles.noticeText}>
            Our executive will follow all building and security protocols.
          </span>
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
