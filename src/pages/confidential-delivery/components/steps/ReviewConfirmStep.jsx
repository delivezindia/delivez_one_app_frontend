import React from 'react'
import {
  FileText,
  Shield,
  Package,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  CheckCircle2,
  Lock,
  ArrowRight,
  LoaderCircle,
} from 'lucide-react'
import styles from '../../ConfidentialDeliveryBookingPage.module.css'

export default function ReviewConfirmStep({
  formData = {},
  quote = {},
  submitting = false,
  onTermsChange,
  onConfirmBooking,
  onBack,
}) {
  const {
    serviceType = 'Vault Secure',
    pickup = {},
    delivery = {},
    item = {},
    packaging = {},
    security = {},
    verification = {},
    termsAccepted = true,
  } = formData

  const totalAmount = quote.totalAmount || 99.0
  const baseFare = quote.baseFare || 49.0
  const securityHandling = quote.securityHandling || 30.0
  const addOnServices = quote.addOnServices || 20.0

  return (
    <div className={styles.stepContentContainer}>
      <h1 className={styles.mainStepTitle}>Review & Confirm</h1>
      <p className={styles.mainStepSubtitle}>
        Review your confidential shipment details before finalizing the vault booking.
      </p>

      {/* 1. SHIPMENT SUMMARY CARD */}
      <div className={`${styles.cardContainer} my-4`}>
        <div className={styles.cardHeaderRow}>
          <FileText size={18} className={styles.setupGoldIcon} />
          <span className={styles.cardHeaderTitle}>SHIPMENT SUMMARY</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 p-3 bg-slate-50/70 border border-slate-100 rounded-lg">
          <div className="flex items-start gap-2.5">
            <FileText size={18} className={styles.setupGoldIcon} />
            <div>
              <span className="text-[10px] text-slate-400 block">Item Type</span>
              <span className="font-bold text-xs text-slate-900">{item.itemName || 'Confidential Documents'}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Shield size={18} className={styles.setupGoldIcon} />
            <div>
              <span className="text-[10px] text-slate-400 block">Security Level</span>
              <span className="font-bold text-xs text-slate-900">
                {security.securityLevel === 'MAXIMUM_SECURITY'
                  ? 'Maximum Security'
                  : security.securityLevel === 'STANDARD_SECURITY'
                  ? 'Standard Security'
                  : 'Highly Confidential'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Package size={18} className={styles.setupGoldIcon} />
            <div>
              <span className="text-[10px] text-slate-400 block">Packaging</span>
              <span className="font-bold text-xs text-slate-900">
                {packaging.packagingType?.replace(/_/g, ' ') || 'Vault Secure Package'}
              </span>
            </div>
          </div>
        </div>

        {/* Route Card: Pickup -> Delivery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-white border border-slate-200 rounded-lg mt-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-1">
              <MapPin size={14} className="text-amber-500" />
              <span>Pickup</span>
            </div>
            <div className="font-bold text-xs text-slate-900">{pickup.companyName || pickup.contactName}</div>
            <div className="text-[11px] text-slate-600 mt-0.5">{pickup.completeAddress}</div>
            <div className="text-[10px] text-slate-400">{pickup.city}, {pickup.state} - {pickup.pinCode}</div>
          </div>

          <div className="border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-4 pt-3 sm:pt-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
              <MapPin size={14} className="text-emerald-500" />
              <span>Delivery</span>
            </div>
            <div className="font-bold text-xs text-slate-900">{delivery.companyName || delivery.contactName}</div>
            <div className="text-[11px] text-slate-600 mt-0.5">{delivery.completeAddress}</div>
            <div className="text-[10px] text-slate-400">{delivery.city}, {delivery.state} - {delivery.pinCode}</div>
          </div>
        </div>
      </div>

      {/* 2. PICKUP & DELIVERY */}
      <div className={`${styles.cardContainer} mb-4`}>
        <div className={styles.cardHeaderRow}>
          <Clock size={18} className={styles.setupGoldIcon} />
          <span className={styles.cardHeaderTitle}>PICKUP & DELIVERY</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
              <Calendar size={13} className="text-amber-500" />
              <span>Pickup Date & Time</span>
            </div>
            <div className="font-bold text-xs text-slate-900">{pickup.pickupDate}</div>
            <div className="text-[11px] text-slate-600">{pickup.timeWindow}</div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
              <Clock size={13} className="text-amber-500" />
              <span>Service Type</span>
            </div>
            <div className="font-bold text-xs text-slate-900">{serviceType}</div>
            <div className="text-[11px] text-slate-600">Dedicated Courier</div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
              <ShieldCheck size={13} className="text-amber-500" />
              <span>Expected Delivery</span>
            </div>
            <div className="font-bold text-xs text-slate-900">{delivery.preferredDate}</div>
            <div className="text-[11px] text-slate-600">{delivery.timeWindow}</div>
          </div>
        </div>
      </div>

      {/* 3. RECIPIENT & VERIFICATION */}
      <div className={`${styles.cardContainer} mb-4`}>
        <div className={styles.cardHeaderRow}>
          <User size={18} className={styles.setupGoldIcon} />
          <span className={styles.cardHeaderTitle}>RECIPIENT</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <div>
            <div className="font-bold text-sm text-slate-900">{delivery.contactName}</div>
            <div className="text-xs text-slate-500 mt-0.5">{delivery.email || 'Email not specified'}</div>
            <div className="text-xs text-slate-500">+91 {delivery.mobileNumber}</div>
            <div className="text-xs text-slate-400 mt-1">{delivery.designation || 'Designated Recipient'}</div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] text-slate-400 block mb-1">Verification Method</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
              <CheckCircle2 size={13} />
              <span>{verification.verificationMethod || 'OTP Verification'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4. ADDITIONAL SERVICES */}
      <div className={`${styles.cardContainer} mb-4`}>
        <div className={styles.cardHeaderRow}>
          <CheckCircle2 size={18} className={styles.setupGoldIcon} />
          <span className={styles.cardHeaderTitle}>ADDITIONAL SERVICES</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {[
            'Tamper-Proof Seal',
            'Chain of Custody',
            'Photo Proof of Delivery',
            'Secure Handling Protocol',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 p-2 bg-emerald-50/50 border border-emerald-100 rounded text-xs font-medium text-emerald-900">
              <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. PRICE DETAILS */}
      <div className={`${styles.cardContainer} mb-4`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <div className={styles.cardHeaderRow} style={{ padding: 0 }}>
              <span className={styles.cardHeaderTitle}>PRICE DETAILS</span>
            </div>
            <div className="space-y-1.5 mt-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Fare</span>
                <span>₹{baseFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Security & Handling</span>
                <span>₹{securityHandling.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Add-on Services</span>
                <span>₹{addOnServices.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-amber-700">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1">
              <Shield size={16} className="text-amber-600" />
              <span>100% Secure & Encrypted</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Your data and documents are protected with bank-level encryption. All couriers operate under NDA with active video and seal audit.
            </p>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Checkbox */}
      <label className="flex items-start gap-3 my-4 cursor-pointer">
        <input
          type="checkbox"
          className={styles.goldSwitch}
          checked={termsAccepted}
          onChange={(e) => onTermsChange && onTermsChange(e.target.checked)}
        />
        <span className="text-xs text-slate-700 leading-tight">
          I have reviewed all shipment details and agree to the{' '}
          <span className="text-amber-600 font-bold underline">Terms & Conditions</span> for confidential transit.
        </span>
      </label>

      {/* Bottom Confirm CTA Button */}
      <div className={styles.bottomCtaSection}>
        <button
          type="button"
          className={styles.redCtaButton}
          disabled={submitting || !termsAccepted}
          onClick={onConfirmBooking}
        >
          {submitting ? (
            <>
              <LoaderCircle className="animate-spin" size={18} />
              <span>Securing Vault Booking...</span>
            </>
          ) : (
            <>
              <Lock size={16} />
              <span>Confirm & Pay Securely</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
