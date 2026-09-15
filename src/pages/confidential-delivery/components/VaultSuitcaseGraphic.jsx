import React from 'react'
import { Shield, Lock } from 'lucide-react'
import styles from '../ConfidentialDeliveryBookingPage.module.css'

export default function VaultSuitcaseGraphic() {
  return (
    <div className={styles.vaultSuitcaseGraphic}>
      {/* Top Handle */}
      <div className={styles.suitcaseHandle} />

      {/* 4 Vertical grooves */}
      <div className={styles.suitcaseGrooves}>
        <div className={styles.suitcaseGroove} />
        <div className={styles.suitcaseGroove} />
        <div className={styles.suitcaseGroove} />
        <div className={styles.suitcaseGroove} />
      </div>

      {/* Center gold Delivez Vault badge */}
      <div className={styles.suitcaseCenterBadge}>
        <Shield size={12} fill="#FFCC00" color="#FFCC00" />
        <Lock size={8} color="#FFFFFF" />
      </div>
    </div>
  )
}
