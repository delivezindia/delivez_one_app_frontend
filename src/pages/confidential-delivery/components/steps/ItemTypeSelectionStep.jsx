import React from 'react'
import {
  FileText,
  Scale,
  Handshake,
  Landmark,
  Building2,
  Award,
  Mail,
  FolderLock,
  Package,
  MoreHorizontal,
  ChevronRight,
  Shield,
  Wine,
  Hand,
  ArrowUp,
  Umbrella,
  Boxes,
  UploadCloud,
  ChevronDown,
} from 'lucide-react'
import styles from '../../ConfidentialDeliveryBookingPage.module.css'

export const ITEM_TYPES = [
  { id: 'CONFIDENTIAL_DOCS', name: 'Confidential Documents', icon: FileText },
  { id: 'LEGAL_DOCS', name: 'Legal Documents', icon: Scale },
  { id: 'CONTRACTS', name: 'Contracts / Agreements', icon: Handshake },
  { id: 'FINANCIAL_DOCS', name: 'Financial Documents', icon: Landmark },
  { id: 'OFFICIAL_DOCS', name: 'Official Documents', icon: Building2 },
  { id: 'CERTIFICATES', name: 'Original Certificates', icon: Award },
  { id: 'SEALED_ENVELOPE', name: 'Sealed Envelope', icon: Mail },
  { id: 'SENSITIVE_RECORDS', name: 'Sensitive Records', icon: FolderLock },
  { id: 'SECURE_PACKAGE', name: 'Secure Package', icon: Package },
]

export const HANDLING_OPTIONS = [
  { id: 'Fragile', label: 'Fragile', icon: Wine },
  { id: 'Handle with Care', label: 'Handle with Care', icon: Hand },
  { id: 'This Side Up', label: 'This Side Up', icon: ArrowUp },
  { id: 'Keep Dry', label: 'Keep Dry', icon: Umbrella },
  { id: 'Do Not Stack', label: 'Do Not Stack', icon: Boxes },
]

export default function ItemTypeSelectionStep({
  data = {},
  options = {},
  uploadedFiles = [],
  onFileUpload,
  onChange,
  onContinue,
  onBack,
}) {
  const selectedItemType = data.selectedItemType || 'CONFIDENTIAL_DOCS'
  const itemName = data.itemName || ''
  const itemCategory = data.itemCategory || 'Legal Documents'
  const itemType = data.itemType || 'Document'
  const pieces = data.pieces || 1
  const weightKg = data.weightKg || '0.5'
  const lengthCm = data.lengthCm || '30'
  const widthCm = data.widthCm || '22'
  const heightCm = data.heightCm || '2'
  const declaredValue = data.declaredValue || '50000'
  const contentType = data.contentType || ''
  const itemContents = data.itemContents || ''
  const handlingTags = data.handlingTags || ['Fragile', 'Handle with Care']
  const customOtherDescription = data.customOtherDescription || ''

  const handleUpdate = (patch) => {
    if (onChange) {
      onChange({ ...data, ...patch })
    }
  }

  const toggleHandlingTag = (tag) => {
    if (handlingTags.includes(tag)) {
      handleUpdate({ handlingTags: handlingTags.filter((t) => t !== tag) })
    } else {
      handleUpdate({ handlingTags: [...handlingTags, tag] })
    }
  }

  return (
    <div className={styles.stepContentContainer}>
      <h1 className={styles.mainStepTitle}>What are you sending securely?</h1>

      {/* 9 Item Type Cards Grid */}
      <div className={styles.itemTypesGrid3x3}>
        {ITEM_TYPES.map((item) => {
          const isSelected = selectedItemType === item.id
          const IconComp = item.icon

          return (
            <div
              key={item.id}
              className={`${styles.itemTypeCard} ${isSelected ? styles.itemTypeCardActive : ''}`}
              onClick={() => {
                handleUpdate({
                  selectedItemType: item.id,
                  itemName: item.name,
                })
              }}
            >
              <div className={styles.itemTypeCardTop}>
                <IconComp size={32} className={styles.setupGoldIcon} />
                <ChevronRight size={14} className="text-slate-400" />
              </div>
              <div className={styles.itemTypeCardName}>{item.name}</div>
            </div>
          )
        })}
      </div>

      {/* Other / Not Listed option */}
      <div
        className={`${styles.itemOtherCard} ${selectedItemType === 'OTHER' ? styles.itemOtherCardActive : ''}`}
        onClick={() => {
          handleUpdate({
            selectedItemType: 'OTHER',
            itemName: customOtherDescription || 'Custom Confidential Shipment',
          })
        }}
      >
        <div className="flex items-center gap-3">
          <div className={styles.otherDotsCircle}>
            <MoreHorizontal size={18} />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">Other / Not Listed</div>
            <div className="text-[10px] text-slate-500">Describe your shipment</div>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-400" />
      </div>

      {selectedItemType === 'OTHER' && (
        <div className="mt-3 p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
          <label className={styles.inputLabel}>Describe custom shipment *</label>
          <input
            type="text"
            className={`${styles.inputField} mt-1.5`}
            placeholder="e.g. Encrypted cryptographic drive, sample prototype..."
            value={customOtherDescription}
            onChange={(e) =>
              handleUpdate({
                customOtherDescription: e.target.value,
                itemName: e.target.value,
              })
            }
          />
        </div>
      )}

      {/* Why this matters? Banner */}
      <div className={styles.whyMattersBanner}>
        <Shield size={24} className="text-amber-500 flex-shrink-0" />
        <div>
          <div className="font-bold text-xs text-amber-900">Why this matters?</div>
          <div className="text-[11px] text-amber-800 mt-0.5">
            Choosing the right type helps us apply the right security controls and handling.
          </div>
        </div>
      </div>

      {/* ITEM INFORMATION CARD */}
      <div className={`${styles.cardContainer} mt-4`}>
        <div className={styles.cardHeaderRow}>
          <Package size={18} className={styles.setupGoldIcon} />
          <span className={styles.cardHeaderTitle}>ITEM INFORMATION</span>
        </div>

        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={styles.inputLabel}>Item Name / Description *</label>
              <div className={`${styles.inputWrapper} mt-1.5`}>
                <Package size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Enter item name or description"
                  value={itemName}
                  onChange={(e) => handleUpdate({ itemName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={styles.inputLabel}>Item Category</label>
              <div className={`${styles.inputWrapper} mt-1.5`}>
                <select
                  className={styles.selectDropdown}
                  value={itemCategory}
                  onChange={(e) => handleUpdate({ itemCategory: e.target.value })}
                >
                  {(options.itemCategories || [
                    'Legal Documents',
                    'Financial Records',
                    'Corporate & Contracts',
                    'Certificates & Diplomas',
                    'Confidential Devices / Hardware',
                    'Other Sensitive Materials',
                  ]).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className={styles.selectChevron} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
            <div>
              <label className={styles.inputLabel}>Item Type *</label>
              <div className="flex items-center gap-4 mt-2">
                {['Document', 'Parcel', 'Other'].map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="itemTypeSelection"
                      checked={itemType === t}
                      onChange={() => handleUpdate({ itemType: t })}
                      className="accent-amber-500"
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={styles.inputLabel}>No. of Pieces *</label>
              <div className="flex items-center gap-3 mt-1.5">
                <button
                  type="button"
                  className={styles.counterBtn}
                  onClick={() => handleUpdate({ pieces: Math.max(1, pieces - 1) })}
                >
                  -
                </button>
                <span className="font-bold text-sm w-6 text-center">{pieces}</span>
                <button
                  type="button"
                  className={styles.counterBtn}
                  onClick={() => handleUpdate({ pieces: pieces + 1 })}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={styles.inputLabel}>Weight (Actual)</label>
              <div className={`${styles.inputWrapper} mt-1.5`}>
                <input
                  type="number"
                  step="0.1"
                  className={styles.inputField}
                  placeholder="Weight"
                  value={weightKg}
                  onChange={(e) => handleUpdate({ weightKg: e.target.value })}
                />
                <span className="text-xs font-bold text-slate-500 pr-2">kg</span>
              </div>
            </div>

            <div>
              <label className={styles.inputLabel}>Dimensions (L × W × H in cm)</label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                <input
                  type="number"
                  placeholder="L"
                  className={styles.inputField}
                  value={lengthCm}
                  onChange={(e) => handleUpdate({ lengthCm: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="W"
                  className={styles.inputField}
                  value={widthCm}
                  onChange={(e) => handleUpdate({ widthCm: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="H"
                  className={styles.inputField}
                  value={heightCm}
                  onChange={(e) => handleUpdate({ heightCm: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={styles.inputLabel}>Declared Value (Optional)</label>
              <div className={`${styles.inputWrapper} mt-1.5`}>
                <span className="text-sm font-bold text-amber-600 pl-1">₹</span>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="Enter declared value"
                  value={declaredValue}
                  onChange={(e) => handleUpdate({ declaredValue: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={styles.inputLabel}>Content Type (Optional)</label>
              <div className={`${styles.inputWrapper} mt-1.5`}>
                <select
                  className={styles.selectDropdown}
                  value={contentType}
                  onChange={(e) => handleUpdate({ contentType: e.target.value })}
                >
                  <option value="">Select content type</option>
                  <option value="Original Printed Papers">Original Printed Papers</option>
                  <option value="Signed Agreements / Deeds">Signed Agreements / Deeds</option>
                  <option value="Bank Cheques / Drafts / Bonds">Bank Cheques / Drafts / Bonds</option>
                  <option value="Digital Storage / Tokens">Digital Storage / Tokens</option>
                  <option value="Identification Cards / Passports">Identification Cards / Passports</option>
                </select>
                <ChevronDown className={styles.selectChevron} />
              </div>
            </div>
          </div>

          <div>
            <label className={styles.inputLabel}>Item Contents / Description (Optional)</label>
            <div className="relative mt-1.5">
              <textarea
                className={styles.textareaField}
                placeholder="Provide more details about the item contents..."
                maxLength={250}
                value={itemContents}
                onChange={(e) => handleUpdate({ itemContents: e.target.value })}
              />
              <span className={styles.charCount}>{itemContents.length}/250</span>
            </div>
          </div>
        </div>
      </div>

      {/* ITEM HANDLING CARD */}
      <div className={`${styles.cardContainer} mt-4`}>
        <div className={styles.cardHeaderRow}>
          <Shield size={18} className={styles.setupGoldIcon} />
          <span className={styles.cardHeaderTitle}>ITEM HANDLING</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {HANDLING_OPTIONS.map((opt) => {
            const isSelected = handlingTags.includes(opt.id)
            const IconComp = opt.icon
            return (
              <button
                key={opt.id}
                type="button"
                className={`${styles.handlingTagBtn} ${isSelected ? styles.handlingTagActive : ''}`}
                onClick={() => toggleHandlingTag(opt.id)}
              >
                <IconComp size={15} />
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ATTACHMENTS CARD */}
      <div className={`${styles.cardContainer} mt-4`}>
        <div className={styles.cardHeaderRow}>
          <UploadCloud size={18} className={styles.setupGoldIcon} />
          <span className={styles.cardHeaderTitle}>ATTACHMENTS (OPTIONAL)</span>
        </div>

        <div className={styles.attachmentBox}>
          <div className="flex items-center gap-3">
            <UploadCloud size={32} className="text-slate-400" />
            <div>
              <div className="font-bold text-xs text-slate-800">
                Upload supporting documents (invoice, item photo, etc.)
              </div>
              <div className="text-[10px] text-slate-500">
                JPG, PNG, PDF (Max 5 MB each)
              </div>
            </div>
          </div>

          <label className={styles.browseFilesBtn}>
            <span>Browse Files</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={onFileUpload}
            />
          </label>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {uploadedFiles.map((f, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">
                {f}
              </span>
            ))}
          </div>
        )}
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
