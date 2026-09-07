import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  CircleHelp,
  FileText,
  Luggage,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Gift,
  Globe2,
  Headphones,
  Menu,
  Package,
  Plane,
  RotateCcw,
  Search,
  UserRound,
  X,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import AuthModal from '@/features/auth/components/AuthModal.jsx'
import { getStoredUser } from '@/features/auth/services/userAuthService.js'
import styles from './Header.module.css'

const services = [
  { label: 'Confidential Delivery (Delivez Vault)', href: '/book/confidential-delivery', icon: ShieldCheck, highlight: true },
  { label: 'Courier Delivery', href: '/courier', icon: Truck },
  { label: 'Luggage Delivery', href: '/book/luggage-delivery', icon: Luggage },
  { label: 'Forgot Something?', href: '/book/forgot-something', icon: ShoppingBag },
  { label: 'Return Pickup', href: '/book/return-pickup', icon: RotateCcw },
  { label: 'Gift Delivery', href: '/book/gift-delivery', icon: Gift },
]

const supportLinks = [
  { label: 'Help Center', href: '#support', icon: CircleHelp },
  { label: 'Contact Support', href: '#support', icon: Headphones },
]

function Dropdown({ items, onClose }) {
  return (
    <div className={styles.dropdown}>
      {items.map(({ label, href, icon: Icon, highlight }) => (
        <button
          key={label}
          type="button"
          className={styles.dropdownLink}
          style={highlight ? { color: '#ca8a04', fontWeight: '800' } : {}}
          onClick={() => {
            onClose()
            if (href.startsWith('/')) {
              navigateTo(href)
            } else {
              window.location.hash = href
            }
          }}
        >
          <Icon size={17} aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  )
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [authOpen, setAuthOpen] = useState(() => new URLSearchParams(window.location.search).get('auth') === 'login')
  const headerRef = useRef(null)
  const currentUser = getStoredUser()

  useEffect(() => {
    const closeMenus = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('pointerdown', closeMenus)
    return () => document.removeEventListener('pointerdown', closeMenus)
  }, [])

  const closeNavigation = () => {
    setMenuOpen(false)
    setOpenDropdown(null)
  }

  const toggleDropdown = (name) => {
    setOpenDropdown((current) => (current === name ? null : name))
  }

  const openAccount = () => {
    closeNavigation()
    if (currentUser) {
      navigateTo('/user/dashboard')
      return
    }
    setAuthOpen(true)
  }

  const closeAuth = () => {
    setAuthOpen(false)
    const url = new URL(window.location.href)
    if (url.searchParams.has('auth') || url.searchParams.has('returnTo')) {
      url.searchParams.delete('auth')
      url.searchParams.delete('returnTo')
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    }
  }

  return (
    <>
      <header className={styles.header} ref={headerRef}>
        <div className={styles.inner}>
          <a className={styles.logo} href="/" onClick={(e) => { e.preventDefault(); closeNavigation(); navigateTo('/'); }} aria-label="Delivez One home">
            <span>Delivez</span>
            <b>ONE</b>
          </a>

          <button
            className={styles.menuButton}
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

          <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} aria-label="Primary navigation">
            <a className={styles.activeLink} href="/" onClick={(e) => { e.preventDefault(); closeNavigation(); navigateTo('/'); }}>Home</a>

            <div className={styles.navGroup}>
              <button type="button" onClick={() => toggleDropdown('services')} aria-expanded={openDropdown === 'services'}>
                Services <ChevronDown size={16} />
              </button>
              {openDropdown === 'services' && <Dropdown items={services} onClose={closeNavigation} />}
            </div>

            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(234, 179, 8, 0.15)',
                color: '#ca8a04',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontWeight: '800',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
              onClick={() => { closeNavigation(); navigateTo('/book/confidential-delivery'); }}
            >
              <Shield size={15} /> Delivez Vault
            </button>

            <a href="#track-order" onClick={closeNavigation}>Track Order</a>

            <div className={styles.navGroup}>
              <button type="button" onClick={() => toggleDropdown('support')} aria-expanded={openDropdown === 'support'}>
                Support <ChevronDown size={16} />
              </button>
              {openDropdown === 'support' && <Dropdown items={supportLinks} onClose={closeNavigation} />}
            </div>

            <div className={styles.mobileActions}>
              <button className={styles.loginButton} type="button" onClick={openAccount}>
                <UserRound size={19} /> {currentUser ? 'My Dashboard' : 'Login / Signup'}
              </button>
            </div>
          </nav>

          <div className={styles.desktopActions}>
            <button className={styles.loginButton} type="button" onClick={openAccount}>
              <UserRound size={19} /> {currentUser ? 'My Dashboard' : 'Login / Signup'}
            </button>
          </div>
        </div>
      </header>

      <AuthModal open={authOpen} onClose={closeAuth} />
    </>
  )
}

export default Header
