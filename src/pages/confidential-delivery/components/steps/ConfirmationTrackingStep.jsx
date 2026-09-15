import React, { useState } from 'react'
import {
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Calendar,
  Shield,
  Lock,
  ChevronRight,
  Truck,
  FileText,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import VaultSuitcaseGraphic from '../VaultSuitcaseGraphic.jsx'
import styles from '../../ConfidentialDeliveryBookingPage.module.css'

export default function ConfirmationTrackingStep({
  booking = {},
  formData = {},
  onTrackRedirect,
}) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('summary') // 'summary' | 'liveTracking'

  const vaultId = booking.vaultId || booking.bookingNumber || 'DV-250811-8F7X'
  const pickupDate = booking.pickupDate || formData.pickup?.pickupDate || 'Today'
  const timeSlot = booking.timeSlot || formData.pickup?.timeWindow || '10:00 AM - 12:00 PM'
  const securityLevel = booking.securityLevel || 'High Tamper Evident'
  const encryption = booking.encryption || 'AES-256'

  const handleCopy = () => {
    navigator.clipboard.writeText(vaultId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Delivez Vault Tracking',
        text: `Track confidential shipment ${vaultId} on Delivez Vault:`,
        url: `${window.location.origin}/confidential-delivery/track/${vaultId}`,
      }).catch(() => {})
    } else {
      handleCopy()
    }
  }

  return (
    <div className={styles.stepContentContainer}>
      {/* Top Toggle between Confirmation Summary & Live Tracking */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'summary' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Booking Confirmation
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'liveTracking' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('liveTracking')}
        >
          Live Tracking Timeline
        </button>
      </div>

      {activeTab === 'summary' ? (
        <>
          <div className="text-center my-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-200">
              <CheckCircle2 size={28} />
            </div>
            <h1 className="font-extrabold text-xl sm:text-2xl text-slate-900">
              Vault Created Successfully!
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Your confidential shipment has been securely booked and is ready for pickup.
            </p>
          </div>

          {/* Vault ID Card with Suitcase Graphic */}
          <div className={`${styles.cardContainer} relative overflow-hidden my-4 p-5`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">Vault ID</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black text-amber-500 tracking-wider">
                    {vaultId}
                  </span>
                  <button
                    type="button"
                    className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                    onClick={handleCopy}
                    title="Copy Vault ID"
                  >
                    {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex-shrink-0">
                <VaultSuitcaseGraphic />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
              <div>
                <Calendar size={16} className="text-amber-500 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 block">Pickup Date</span>
                <span className="text-xs font-bold text-slate-800">{pickupDate}</span>
                <span className="text-[10px] text-slate-500 block truncate">{timeSlot}</span>
              </div>

              <div>
                <Shield size={16} className="text-amber-500 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 block">Security Level</span>
                <span className="text-xs font-bold text-red-600">{securityLevel}</span>
                <span className="text-[10px] text-slate-500 block">Tamper Evident</span>
              </div>

              <div>
                <Lock size={16} className="text-emerald-500 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 block">End-to-End</span>
                <span className="text-xs font-bold text-emerald-600">Encrypted</span>
                <span className="text-[10px] text-slate-500 block">{encryption}</span>
              </div>
            </div>
          </div>

          {/* What's Next? Card */}
          <div className={`${styles.cardContainer} mb-6`}>
            <div className={styles.cardHeaderRow}>
              <span className={styles.cardHeaderTitle}>What's Next?</span>
            </div>

            <div className="space-y-3 mt-3">
              <div className="flex items-center gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  1
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900">
                    Our trusted executive will pick up your package as scheduled.
                  </div>
                  <div className="text-[11px] text-slate-500">
                    ID badge and OTP handshake will be verified before accepting the items.
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
              </div>

              <div
                className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setActiveTab('liveTracking')}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  2
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900">
                    You can track your shipment in real-time inside Delivez Vault.
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Live GPS checkpoints, seal scanning, and recipient confirmation.
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-8">
            <button
              type="button"
              className={styles.outlineGoldBtn}
              onClick={handleShare}
            >
              <Share2 size={16} />
              <span>Share ID</span>
            </button>

            <button
              type="button"
              className={styles.redCtaButton}
              style={{ flex: 2 }}
              onClick={() => {
                if (onTrackRedirect) {
                  onTrackRedirect(vaultId)
                } else {
                  setActiveTab('liveTracking')
                }
              }}
            >
              <span>Track Shipment</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </>
      ) : (
        /* LIVE TRACKING VIEW (Matching screenshot 26) */
        <div className="space-y-4 my-4">
          <div className={`${styles.cardContainer} p-4 flex items-center justify-between`}>
            <div>
              <span className="text-[10px] text-slate-400 block">Vault ID</span>
              <span className="text-lg font-black text-amber-500">{vaultId}</span>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Lock size={12} />
                  <span>In Transit - Secure</span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Pickup Date & Time</span>
              <span className="text-xs font-bold text-slate-800 block">{pickupDate}</span>
              <span className="text-[11px] text-slate-500">{timeSlot}</span>
            </div>
          </div>

          <div className={`${styles.cardContainer} p-4`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <MapPin size={16} className="text-amber-500" />
                <span>Live Tracking</span>
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                Last updated: 1 min ago <RefreshCw size={10} className="text-amber-500 animate-spin" />
              </span>
            </div>

            {/* Tracking Milestones Timeline */}
            <div className="relative pl-6 space-y-6 border-l-2 border-amber-400 ml-3 py-1">
              {/* Step 1: In Transit - Active */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs ring-4 ring-amber-100">
                  <Truck size={12} />
                </div>
                <div className="flex justify-between items-start">
                  <div className="font-bold text-xs text-amber-600">In Transit - Secure</div>
                  <span className="text-[10px] text-amber-600 font-semibold">12 Aug, 11:35 AM</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Shipment is on the way to destination.
                </p>
                <div className="text-[10px] text-amber-700 font-medium mt-0.5 flex items-center gap-1">
                  <MapPin size={10} /> Enroute to BLR-FC-02
                </div>
              </div>

              {/* Step 2: Picked Up */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-white text-slate-500 flex items-center justify-center border-2 border-slate-300">
                  <Truck size={12} />
                </div>
                <div className="flex justify-between items-start">
                  <div className="font-bold text-xs text-slate-800">Picked Up</div>
                  <span className="text-[10px] text-slate-400">12 Aug, 10:20 AM</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Vault has been picked up by our trusted executive.
                </p>
                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin size={10} /> BLR-FC-01
                </div>
              </div>

              {/* Step 3: Vault Created */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-white text-slate-500 flex items-center justify-center border-2 border-slate-300">
                  <Shield size={12} />
                </div>
                <div className="flex justify-between items-start">
                  <div className="font-bold text-xs text-slate-800">Vault Created</div>
                  <span className="text-[10px] text-slate-400">12 Aug, 09:45 AM</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Your confidential shipment is secured in Delivez Vault.
                </p>
              </div>

              {/* Step 4: Booking Confirmed */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-white text-slate-500 flex items-center justify-center border-2 border-slate-300">
                  <FileText size={12} />
                </div>
                <div className="flex justify-between items-start">
                  <div className="font-bold text-xs text-slate-800">Booking Confirmed</div>
                  <span className="text-[10px] text-slate-400">12 Aug, 09:40 AM</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Vault booking has been confirmed successfully.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
