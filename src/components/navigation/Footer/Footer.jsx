import { Mail, PhoneCall } from 'lucide-react'
import styles from './Footer.module.css'

function Footer() {
  return (
    <footer id="support" className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <a className={styles.logo} href="#home">Delivez <b>ONE</b></a>
          <p>Anything. Anytime. Anywhere.</p>
        </div>
        <div className={styles.links}>
          <a href="#services">Services</a>
          <a href="#track-order">Track order</a>
          <a href="#download-app">Download app</a>
          <a href="/admin/login">Admin portal</a>
        </div>
        <div className={styles.contact}>
          <a href="tel:+911800000000"><PhoneCall size={17} /> 1800-000-000</a>
          <a href="mailto:help@delivez.example"><Mail size={17} /> help@delivez.example</a>
        </div>
      </div>
      <p className={styles.copyright}>© {new Date().getFullYear()} Delivez One. Built for reliable deliveries.</p>
    </footer>
  )
}

export default Footer
