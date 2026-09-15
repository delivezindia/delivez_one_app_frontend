import React from 'react'
import {
  Package,
  Layers,
  Shield,
  Droplets,
  Tag,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react'
import styles from '../../ConfidentialDeliveryBookingPage.module.css'

export const PACKAGING_TYPES = [
  {
    id: 'STANDARD_BOX',
    name: 'Standard Box',
    desc: 'Sturdy corrugated box suitable for general confidential items.',
    level: 'Good',
    suitable: 'General Items',
    badge: 'Most Used',
    fee: 0,
  },
  {
    id: 'TAMPER_PROOF_POUCH',
    name: 'Tamper Proof Pouch',
    desc: 'Heavy gauge, tamper-evident security pouch with unique seal numbers.',
    level: 'High',
    suitable: 'Confidential Records & Passports',
    fee: 20,
  },
  {
    id: 'PADDED_ENVELOPE',
    name: 'Padded Envelope',
    desc: 'Lightweight cushioned mailer for sensitive certificates and discs.',
    level: 'Good',
    suitable: 'Documents & Certificates',
    fee: 0,
  },
  {
    id: 'HEAVY_DUTY_CRATE',
    name: 'Heavy Duty Crate',
    desc: 'Reinforced protective casing for high-value delicate hardware.',
    level: 'Maximum',
    suitable: 'High-Value Prototypes',
    fee: 50,
  },
  {
    id: 'VAULT_METAL_BRIEFCASE',
    name: 'Vault Metal Briefcase',
    desc: 'Dual-combination locking metal attache case for executive handover.',
    level: 'Maximum',
    suitable: 'Diplomatic & Board Items',
    fee: 90,
  },
]

export const ADDON_PROTECTIONS = [
  {
    id: 'EXTRA_BUBBLE_WRAP',
    name: 'Extra Bubble Wrap',
    desc: 'Additional cushioning for extra safety.',
    price: 30,
    icon: Layers,
  },
  {
    id: 'CORNER_GUARD',
    name: 'Corner Guard',
    desc: 'Protects corners and edges from damage.',
    price: 25,
    icon: Package,
  },
  {
    id: 'WATERPROOF_COVER',
    name: 'Waterproof Cover',
    desc: 'Protects from moisture and light rain.',
    price: 20,
    icon: Droplets,
  },
  {
    id: 'FRAGILE_STICKER',
    name: 'Fragile Sticker',
    desc: 'Alerts handlers to handle with care.',
    price: 10,
    icon: Tag,
  },
  {
    id: 'SEAL_SECURITY_TAPE',
    name: 'Seal & Security Tape',
    desc: 'Tamper-evident sealing for added security.',
    price: 15,
    icon: Shield,
  },
]

export default function PackagingOptionsStep({
  data = {},
  onChange,
  onContinue,
  onBack,
}) {
  const packagingType = data.packagingType || 'STANDARD_BOX'
  const addonProtections = data.addonProtections || ['EXTRA_BUBBLE_WRAP']
  const packagingInstructions = data.packagingInstructions || ''

  const selectedPkg = PACKAGING_TYPES.find((p) => p.id === packagingType) || PACKAGING_TYPES[0]

  const handleUpdate = (patch) => {
    if (onChange) {
      onChange({ ...data, ...patch })
    }
  }

  const toggleAddon = (id) => {
    if (addonProtections.includes(id)) {
      handleUpdate({ addonProtections: addonProtections.filter((x) => x !== id) })
    } else {
      handleUpdate({ addonProtections: [...addonProtections, id] })
    }
  }

  const appendInstruction = (text) => {
    const current = packagingInstructions.trim()
    const updated = current ? `${current}. ${text}` : text
    if (updated.length <= 250) {
      handleUpdate({ packagingInstructions: updated })
    }
  }

  return (
    <div className={styles.stepContentContainer}>
      {/* 1. SELECT PACKAGING */}
      <div className={styles.packagingSectionLabel}>
        1. SELECT PACKAGING
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {PACKAGING_TYPES.map((pkg) => {
          const isSelected = packagingType === pkg.id
          return (
            <div
              key={pkg.id}
              className={`${styles.packagingCard} ${isSelected ? styles.packagingCardActive : ''}`}
              onClick={() => handleUpdate({ packagingType: pkg.id })}
            >
              <div className="flex items-center justify-between mb-2">
                <Package size={20} className={styles.setupGoldIcon} />
                {pkg.badge && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    {pkg.badge}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm text-slate-900">{pkg.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{pkg.desc}</p>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">Level: <strong className="text-slate-700">{pkg.level}</strong></span>
                <span className="text-xs font-bold text-slate-900">
                  {pkg.fee > 0 ? `+ ₹${pkg.fee}` : 'Free'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 2. ADD-ON PROTECTION */}
      <div className={styles.packagingSectionLabel}>
        2. ADD-ON PROTECTION (OPTIONAL)
      </div>

      <div className={`${styles.cardContainer} mb-6`}>
        <div className="divide-y divide-slate-100">
          {ADDON_PROTECTIONS.map((addon) => {
            const isChecked = addonProtections.includes(addon.id)
            const IconComp = addon.icon

            return (
              <div key={addon.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                    <IconComp size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>{addon.name}</span>
                      <span className="text-amber-600 font-semibold text-[11px]">+ ₹{addon.price}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{addon.desc}</div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  className={styles.goldSwitch}
                  checked={isChecked}
                  onChange={() => toggleAddon(addon.id)}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. PACKAGING INSTRUCTIONS */}
      <div className={styles.packagingSectionLabel}>
        3. PACKAGING INSTRUCTIONS (OPTIONAL)
      </div>

      <div className={`${styles.cardContainer} mb-6`}>
        <div className="relative">
          <textarea
            className={styles.textareaField}
            placeholder="Add any special packaging instructions..."
            maxLength={250}
            value={packagingInstructions}
            onChange={(e) => handleUpdate({ packagingInstructions: e.target.value })}
          />
          <span className={styles.charCount}>{packagingInstructions.length}/250</span>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs text-slate-400">Examples:</span>
          {['Keep items upright', 'Do not stack', 'Fragile - Handle with care'].map((chip) => (
            <button
              key={chip}
              type="button"
              className="text-xs bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 px-2.5 py-1 rounded-full transition-colors"
              onClick={() => appendInstruction(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 4. PACKAGING PREVIEW */}
      <div className={styles.packagingSectionLabel}>
        4. PACKAGING PREVIEW
      </div>

      <div className={`${styles.cardContainer} mb-6`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Package size={22} className={styles.setupGoldIcon} />
            <div>
              <span className="text-[10px] text-slate-400 block">Selected Packaging</span>
              <span className="text-xs font-bold text-slate-800">{selectedPkg.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield size={22} className={styles.setupGoldIcon} />
            <div>
              <span className="text-[10px] text-slate-400 block">Protection Level</span>
              <span className="text-xs font-bold text-emerald-600">{selectedPkg.level}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className="text-amber-500" />
            <div>
              <span className="text-[10px] text-slate-400 block">Suitable for</span>
              <span className="text-xs font-bold text-slate-800">{selectedPkg.suitable}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Notice Banner */}
      <div className={styles.securityTrustBanner}>
        <Lock size={14} className="text-amber-600" />
        <span>Your shipment is protected with enterprise-grade security.</span>
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
