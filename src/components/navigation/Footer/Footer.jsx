import { Mail, PhoneCall } from 'lucide-react'
import styles from './Footer.module.css'

function Footer() {
  return (
    <footer id="support" className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.leftCol}>
          <div className={styles.logoGroup}>
            <span className={styles.logoText}>
              DELVE<span className={styles.logoZ}>Z</span>
            </span>
            <span className={styles.logoDivider}>|</span>
            <span className={styles.logoOne}>ONE</span>
          </div>
          <p className={styles.tagline}>Personal Logistics. One App. Every Need.</p>
        </div>

        <div className={styles.linksRow}>
          <a href="#services">Services</a>
          <a href="#why-choose-us">Features</a>
          <a href="#track-order">Track Order</a>
          <a href="/admin/login">Admin Portal</a>
          <a href="tel:+911800000000"><PhoneCall size={14} /> 1800-DELVEZ</a>
          <a href="mailto:support@delvez.com"><Mail size={14} /> support@delvez.com</a>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <p className={styles.copyright}>© 2026 Delvez. All rights reserved.</p>
          <div className={styles.policyLinks}>
            <a href="#support">Help & Support</a>
            <span className={styles.dot}>|</span>
            <a href="#privacy">Privacy Policy</a>
            <span className={styles.dot}>|</span>
            <a href="#terms">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
