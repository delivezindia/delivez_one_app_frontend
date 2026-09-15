import React from 'react'
import { ChevronLeft, Shield, Lock } from 'lucide-react'
import styles from '../ConfidentialDeliveryBookingPage.module.css'

export default function ConfidentialAppBar({ onBack, currentStep }) {
  const isVerify = currentStep === 7

  return (
    <header className={styles.vaultHeader}>
      <div className={styles.headerLeft}>
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Logo: "Delivez " (gold italic bold) "VAULT" (bold) + Shield with Lock */}
        <div className={styles.brandLogoContainer}>
          <span className={styles.brandDelivez}>Delivez</span>
          <span className={styles.brandVault}>VAULT</span>
          <div className={styles.brandShieldBadge}>
            <Shield className={styles.brandShieldIcon} size={24} fill="#FFCC00" color="#FFCC00" />
            <Lock className={styles.brandLockIconInner} size={11} color="#000000" />
          </div>
        </div>
      </div>

      {/* Right Secure Booking / Verify Delivery Badge */}
      <div className={styles.secureHeaderRight}>
        <Shield size={16} className={styles.secureHeaderIcon} />
        <div className={styles.secureHeaderText}>
          {isVerify ? 'VERIFY\nDELIVERY' : 'SECURE\nBOOKING'}
        </div>
      </div>
    </header>
  )
}
