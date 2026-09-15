import React from 'react'
import {
  Repeat,
  Tag,
  Calendar,
  Clock,
  MapPin,
  Edit2,
  Info,
  ChevronDown,
  CheckSquare,
} from 'lucide-react'
import styles from '../../ConfidentialDeliveryBookingPage.module.css'

export default function ExchangeSetupSection({
  data = {},
  onChange,
  pickupAddress,
}) {
  const exchangeType = data.exchangeType || 'Two-Way Document Exchange'
  const sameAsPickup = data.sameAsPickup !== false
  const exchangeReason = data.exchangeReason || ''
  const exchangeId = data.exchangeId || ''
  const exchangeInstructions = data.exchangeInstructions || ''
  const expectedExchangeDate = data.expectedExchangeDate || ''
  const swapTimeWindow = data.swapTimeWindow || '10:00 AM - 12:00 PM'
  const outgoingItem = data.outgoingItem || ''
  const incomingItem = data.incomingItem || ''
  const customReturnAddress = data.customReturnAddress || ''

  const handleUpdate = (patch) => {
    if (onChange) {
      onChange({ ...data, ...patch })
    }
  }

  const displayAddress = sameAsPickup
    ? pickupAddress || 'House / Building, Street, Area, Landmark\nCity, State - PIN Code\nIndia'
    : (customReturnAddress || 'Custom Destination Address, City, State - PIN Code')

  return (
    <div className={styles.setupCard}>
      {/* 1. EXCHANGE DETAILS */}
      <div className={styles.setupSectionHeader}>
        <Repeat size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>EXCHANGE DETAILS</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={styles.inputLabel}>Exchange Type *</label>
            <div className="flex flex-col gap-2 mt-2">
              <div
                className={`${styles.radioTile} ${exchangeType === 'Two-Way Document Exchange' ? styles.radioTileActive : ''}`}
                onClick={() => handleUpdate({ exchangeType: 'Two-Way Document Exchange' })}
              >
                <div className={`${styles.radioCircle} ${exchangeType === 'Two-Way Document Exchange' ? styles.radioCircleActive : ''}`} />
                <Repeat size={16} className={styles.setupGoldIcon} />
                <span className={styles.radioTileText}>Two-Way Document Exchange</span>
              </div>

              <div
                className={`${styles.radioTile} ${exchangeType === 'Item / Hardware Replacement' ? styles.radioTileActive : ''}`}
                onClick={() => handleUpdate({ exchangeType: 'Item / Hardware Replacement' })}
              >
                <div className={`${styles.radioCircle} ${exchangeType === 'Item / Hardware Replacement' ? styles.radioCircleActive : ''}`} />
                <span className={styles.radioTileText}>Item / Hardware Replacement</span>
              </div>
            </div>
          </div>

          <div>
            <label className={styles.inputLabel}>Exchange Reason (Optional)</label>
            <div className={`${styles.inputWrapper} mt-2 mb-3`}>
              <select
                className={styles.selectDropdown}
                value={exchangeReason}
                onChange={(e) => handleUpdate({ exchangeReason: e.target.value })}
              >
                <option value="">Select exchange reason</option>
                <option value="Signed Contract / Deed Swap">Signed Contract / Deed Swap</option>
                <option value="Document Verification & Swap">Document Verification & Swap</option>
                <option value="Security Token / Device Replacement">Security Token / Device Replacement</option>
                <option value="Confidential Credential Exchange">Confidential Credential Exchange</option>
                <option value="Other Two-Way Exchange">Other Two-Way Exchange</option>
              </select>
              <ChevronDown className={styles.selectChevron} />
            </div>

            <label className={styles.inputLabel}>Reference / Exchange ID (Optional)</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <Tag size={16} className={styles.inputIcon} />
              <input
                type="text"
                className={styles.inputField}
                placeholder="Enter exchange reference ID"
                value={exchangeId}
                onChange={(e) => handleUpdate({ exchangeId: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Outgoing & Incoming description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={styles.inputLabel}>Outgoing Item (Handed to Recipient)</label>
            <input
              type="text"
              className={`${styles.inputField} mt-2`}
              placeholder="e.g. Master Deed Execution Copy A"
              value={outgoingItem}
              onChange={(e) => handleUpdate({ outgoingItem: e.target.value })}
            />
          </div>
          <div>
            <label className={styles.inputLabel}>Incoming Item (Collected from Recipient)</label>
            <input
              type="text"
              className={`${styles.inputField} mt-2`}
              placeholder="e.g. Counter-Signed Agreement Copy B"
              value={incomingItem}
              onChange={(e) => handleUpdate({ incomingItem: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={styles.inputLabel}>Exchange Instructions (Optional)</label>
            <div className="relative mt-2">
              <textarea
                className={styles.textareaField}
                placeholder="Add instructions for simultaneous exchange..."
                maxLength={250}
                value={exchangeInstructions}
                onChange={(e) => handleUpdate({ exchangeInstructions: e.target.value })}
              />
              <span className={styles.charCount}>
                {exchangeInstructions.length}/250
              </span>
            </div>
          </div>

          <div>
            <label className={styles.inputLabel}>Expected Exchange Date</label>
            <div className={`${styles.inputWrapper} mt-2 mb-3`}>
              <Calendar size={16} className={styles.inputIcon} />
              <input
                type="date"
                className={styles.inputField}
                value={expectedExchangeDate}
                onChange={(e) => handleUpdate({ expectedExchangeDate: e.target.value })}
              />
            </div>

            <label className={styles.inputLabel}>Simultaneous Swap Window</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <Clock size={16} className={styles.inputIcon} />
              <select
                className={styles.selectDropdown}
                value={swapTimeWindow}
                onChange={(e) => handleUpdate({ swapTimeWindow: e.target.value })}
              >
                <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
              </select>
              <ChevronDown className={styles.selectChevron} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.setupDivider} />

      {/* 2. RETURN DESTINATION ADDRESS */}
      <div className={styles.setupSectionHeader}>
        <MapPin size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>SWAP RETURN DESTINATION</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            className={`${styles.addressToggleBtn} ${sameAsPickup ? styles.addressToggleActive : ''}`}
            onClick={() => handleUpdate({ sameAsPickup: true })}
          >
            <MapPin size={15} />
            <span>Return to Pickup Address</span>
          </button>
          <button
            type="button"
            className={`${styles.addressToggleBtn} ${!sameAsPickup ? styles.addressToggleActive : ''}`}
            onClick={() => handleUpdate({ sameAsPickup: false })}
          >
            <MapPin size={15} />
            <span>Alternate Destination</span>
          </button>
        </div>

        <div className={styles.addressPreviewBox}>
          <MapPin size={24} className={styles.setupGoldIcon} />
          <div className="flex-1">
            <div className={styles.addressPreviewTitle}>Return Address Preview</div>
            <div className={styles.addressPreviewText}>
              {displayAddress}
            </div>
          </div>
          <button
            type="button"
            className={styles.editAddressBtn}
            onClick={() => {
              const newAddr = prompt('Enter return destination address:', displayAddress)
              if (newAddr) {
                handleUpdate({ customReturnAddress: newAddr, sameAsPickup: false })
              }
            }}
          >
            <Edit2 size={13} />
            <span>Edit Address</span>
          </button>
        </div>

        <div className={`${styles.noticeBox} mt-3`}>
          <Info size={18} className={styles.setupGoldIcon} />
          <span className={styles.noticeText}>
            Exchange requires simultaneous handover and mutual verification by the authorized executive.
          </span>
        </div>
      </div>
    </div>
  )
}
