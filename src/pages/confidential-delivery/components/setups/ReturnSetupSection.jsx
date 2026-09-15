import React from 'react'
import {
  RotateCcw,
  Tag,
  Calendar,
  Clock,
  MapPin,
  Edit2,
  Info,
  ChevronDown,
} from 'lucide-react'
import styles from '../../ConfidentialDeliveryBookingPage.module.css'

export default function ReturnSetupSection({
  data = {},
  onChange,
  pickupAddress,
}) {
  const returnType = data.returnType || 'Return to Sender'
  const sameAsPickup = data.sameAsPickup !== false
  const returnReason = data.returnReason || ''
  const rmaNumber = data.rmaNumber || ''
  const returnInstructions = data.returnInstructions || ''
  const expectedReturnDate = data.expectedReturnDate || ''
  const collectionDatePreference = data.collectionDatePreference || ''
  const collectionTimeWindow = data.collectionTimeWindow || '10:00 AM - 12:00 PM'
  const pickupInstructionsForReturn = data.pickupInstructionsForReturn || ''
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
      {/* 1. RETURN DETAILS */}
      <div className={styles.setupSectionHeader}>
        <RotateCcw size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>RETURN DETAILS</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={styles.inputLabel}>Return Type *</label>
            <div className="flex flex-col gap-2 mt-2">
              <div
                className={`${styles.radioTile} ${returnType === 'Return to Sender' ? styles.radioTileActive : ''}`}
                onClick={() => handleUpdate({ returnType: 'Return to Sender' })}
              >
                <div className={`${styles.radioCircle} ${returnType === 'Return to Sender' ? styles.radioCircleActive : ''}`} />
                <RotateCcw size={16} className={styles.setupGoldIcon} />
                <span className={styles.radioTileText}>Return to Sender</span>
              </div>

              <div
                className={`${styles.radioTile} ${returnType === 'Return to Another Location' ? styles.radioTileActive : ''}`}
                onClick={() => handleUpdate({ returnType: 'Return to Another Location' })}
              >
                <div className={`${styles.radioCircle} ${returnType === 'Return to Another Location' ? styles.radioCircleActive : ''}`} />
                <span className={styles.radioTileText}>Return to Another Location</span>
              </div>
            </div>
          </div>

          <div>
            <label className={styles.inputLabel}>Return Reason (Optional)</label>
            <div className={`${styles.inputWrapper} mt-2 mb-3`}>
              <select
                className={styles.selectDropdown}
                value={returnReason}
                onChange={(e) => handleUpdate({ returnReason: e.target.value })}
              >
                <option value="">Select return reason</option>
                <option value="Document Signature & Acknowledgement">Document Signature & Acknowledgement</option>
                <option value="Review, Stamp & Return">Review, Stamp & Return</option>
                <option value="Inspection & Verification">Inspection & Verification</option>
                <option value="Endorsement / Counter-signing">Endorsement / Counter-signing</option>
                <option value="Other Business Process">Other Business Process</option>
              </select>
              <ChevronDown className={styles.selectChevron} />
            </div>

            <label className={styles.inputLabel}>RMA / Reference Number (Optional)</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <Tag size={16} className={styles.inputIcon} />
              <input
                type="text"
                className={styles.inputField}
                placeholder="Enter RMA or reference number"
                value={rmaNumber}
                onChange={(e) => handleUpdate({ rmaNumber: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={styles.inputLabel}>Return Instruction (Optional)</label>
            <div className="relative mt-2">
              <textarea
                className={styles.textareaField}
                placeholder="Add any specific instructions..."
                maxLength={250}
                value={returnInstructions}
                onChange={(e) => handleUpdate({ returnInstructions: e.target.value })}
              />
              <span className={styles.charCount}>
                {returnInstructions.length}/250
              </span>
            </div>
          </div>

          <div>
            <label className={styles.inputLabel}>Expected Return Date</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <Calendar size={16} className={styles.inputIcon} />
              <input
                type="date"
                className={styles.inputField}
                value={expectedReturnDate}
                onChange={(e) => handleUpdate({ expectedReturnDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.setupDivider} />

      {/* 2. RETURN ADDRESS */}
      <div className={styles.setupSectionHeader}>
        <MapPin size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>RETURN ADDRESS</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            className={`${styles.addressToggleBtn} ${sameAsPickup ? styles.addressToggleActive : ''}`}
            onClick={() => handleUpdate({ sameAsPickup: true })}
          >
            <MapPin size={15} />
            <span>Same as Pickup Address</span>
          </button>
          <button
            type="button"
            className={`${styles.addressToggleBtn} ${!sameAsPickup ? styles.addressToggleActive : ''}`}
            onClick={() => handleUpdate({ sameAsPickup: false })}
          >
            <MapPin size={15} />
            <span>Use Different Address</span>
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
              const newAddr = prompt('Enter return address:', displayAddress)
              if (newAddr) {
                handleUpdate({ customReturnAddress: newAddr, sameAsPickup: false })
              }
            }}
          >
            <Edit2 size={13} />
            <span>Edit Address</span>
          </button>
        </div>
      </div>

      <div className={styles.setupDivider} />

      {/* 3. RETURN COLLECTION PREFERENCE */}
      <div className={styles.setupSectionHeader}>
        <Calendar size={18} className={styles.setupGoldIcon} />
        <span className={styles.setupTitle}>RETURN COLLECTION PREFERENCE</span>
      </div>

      <div className={styles.setupSectionBody}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label className={styles.inputLabel}>Collection Date Preference</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <Calendar size={16} className={styles.inputIcon} />
              <input
                type="date"
                className={styles.inputField}
                value={collectionDatePreference}
                onChange={(e) => handleUpdate({ collectionDatePreference: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className={styles.inputLabel}>Collection Time Window</label>
            <div className={`${styles.inputWrapper} mt-2`}>
              <Clock size={16} className={styles.inputIcon} />
              <select
                className={styles.selectDropdown}
                value={collectionTimeWindow}
                onChange={(e) => handleUpdate({ collectionTimeWindow: e.target.value })}
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

        <div>
          <label className={styles.inputLabel}>Pickup Instructions for Return (Optional)</label>
          <div className="relative mt-2">
            <textarea
              className={styles.textareaField}
              placeholder="Add any special instructions for return pickup..."
              maxLength={250}
              value={pickupInstructionsForReturn}
              onChange={(e) => handleUpdate({ pickupInstructionsForReturn: e.target.value })}
            />
            <span className={styles.charCount}>
              {pickupInstructionsForReturn.length}/250
            </span>
          </div>
        </div>

        <div className={`${styles.noticeBox} mt-3`}>
          <Info size={18} className={styles.setupGoldIcon} />
          <span className={styles.noticeText}>
            We will notify you once the return is collected and provide real-time updates until it reaches the sender.
          </span>
        </div>
      </div>
    </div>
  )
}
