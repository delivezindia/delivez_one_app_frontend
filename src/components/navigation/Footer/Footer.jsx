import { Clock3, Leaf, Luggage, Mail, PhoneCall, ShieldCheck } from 'lucide-react'
import styles from './Footer.module.css'

function Footer() {
  return (
    <footer id="support" className={styles.footer}>
      {/* 4-Pillar Trust Badge Bar (Matching Reference Screenshots) */}
      <div className={styles.trustBar}>
        <div className={styles.trustInner}>
          <div className={styles.trustPillar}>
            <div className={styles.trustIconWrap}><Clock3 size={20} /></div>
            <div>
              <strong className={styles.trustTitle}>On-Time Delivery</strong>
              <p className={styles.trustDesc}>Because your time matters.</p>
            </div>
          </div>

          <div className={styles.trustPillar}>
            <div className={styles.trustIconWrap}><ShieldCheck size={20} /></div>
            <div>
              <strong className={styles.trustTitle}>Safe &amp; Secure</strong>
              <p className={styles.trustDesc}>Your shipments are in safe hands.</p>
            </div>
          </div>

          <div className={styles.trustPillar}>
            <div className={styles.trustIconWrap}><Luggage size={20} /></div>
            <div>
              <strong className={styles.trustTitle}>Trusted by 1M+ Customers</strong>
              <p className={styles.trustDesc}>Across India.</p>
            </div>
          </div>

          <div className={styles.trustPillar}>
            <div className={styles.trustIconWrap}><Leaf size={20} /></div>
            <div>
              <strong className={styles.trustTitle}>A Cleaner Tomorrow</strong>
              <p className={styles.trustDesc}>Reducing travel stress &amp; carbon footprints.</p>
            </div>
          </div>

          <div className={styles.trustScriptTag}>
            <span>Travel Lighter, Live Brighter</span>
          </div>
        </div>
      </div>

      <div className={styles.inner}>
        <div className={styles.leftCol}>
          <div className={styles.logoGroup}>
            <span className={styles.logoText}>
              DELVE<span className={styles.logoZ}>Z</span>
            </span>
            <span className={styles.logoDivider}>|</span>
            <span className={styles.logoOne}>ONE</span>
          </div>
          <p className={styles.tagline}>Moving a Smarter Tomorrow. Sustainable logistics for all of India.</p>
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
            <a href="#support">Help &amp; Support</a>
            <span className={styles.dot}>|</span>
            <a href="#privacy">Privacy Policy</a>
            <span className={styles.dot}>|</span>
            <a href="#terms">Terms &amp; Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
