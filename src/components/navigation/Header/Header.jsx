import { useEffect, useRef, useState } from 'react'
import {
  Bell,
  ChevronDown,
  CircleHelp,
  Globe2,
  Headphones,
  Luggage,
  MapPin,
  Menu,
  RotateCcw,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Truck,
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
  { label: 'Know More', href: '#services', icon: CircleHelp },
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
          style={highlight ? { color: '#fab800', fontWeight: '800' } : {}}
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
  const [currentUser, setCurrentUser] = useState(() => getStoredUser())

  useEffect(() => {
    const handleAuthChange = () => setCurrentUser(getStoredUser())
    window.addEventListener('auth:change', handleAuthChange)
    window.addEventListener('storage', handleAuthChange)
    return () => {
      window.removeEventListener('auth:change', handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [])

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
    navigateTo('/login')
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

  const userInitials = currentUser?.fullName
    ? currentUser.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'RV'

  return (
    <>
      <header className={styles.header} ref={headerRef}>
        <div className={styles.inner}>
          {/* Delvez One Logo matching reference */}
          <a
            className={styles.logo}
            href="/"
            onClick={(e) => { e.preventDefault(); closeNavigation(); navigateTo('/'); }}
            aria-label="Delivez One home"
          >
            <span className={styles.logoText}>
              DELVE<span className={styles.logoZ}>Z</span>
            </span>
            <span className={styles.logoDivider}>|</span>
            <span className={styles.logoOne}>ONE</span>
          </a>

          <button
            className={styles.menuButton}
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} color="#fff" /> : <Menu size={24} color="#fff" />}
          </button>

          <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} aria-label="Primary navigation">
            <div className={styles.navGroup}>
              <button
                type="button"
                className={styles.navLinkBtn}
                onClick={() => toggleDropdown('services')}
                aria-expanded={openDropdown === 'services'}
              >
                Services <ChevronDown size={15} />
              </button>
              {openDropdown === 'services' && <Dropdown items={services} onClose={closeNavigation} />}
            </div>

            <a
              className={styles.navLink}
              href="#why-choose-us"
              onClick={closeNavigation}
            >
              Features
            </a>

            <a
              className={styles.navLink}
              href="#how-it-works"
              onClick={closeNavigation}
            >
              How It Works
            </a>

            <div className={styles.navGroup}>
              <button
                type="button"
                className={styles.navLinkBtn}
                onClick={() => toggleDropdown('support')}
                aria-expanded={openDropdown === 'support'}
              >
                Support <ChevronDown size={15} />
              </button>
              {openDropdown === 'support' && <Dropdown items={supportLinks} onClose={closeNavigation} />}
            </div>

            {/* Mobile Actions */}
            <div className={styles.mobileActions}>
              <div className={styles.langSelector}>
                <Globe2 size={16} />
                <span>English</span>
                <ChevronDown size={13} />
              </div>

              {currentUser ? (
                <button className={styles.outlineLoginBtn} type="button" onClick={openAccount}>
                  <UserRound size={17} /> {currentUser.fullName || 'My Dashboard'}
                </button>
              ) : (
                <div className={styles.loginActionGroup}>
                  <span className={styles.alreadyAccountText}>Already have an account?</span>
                  <button className={styles.outlineLoginBtn} type="button" onClick={openAccount}>
                    Login
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Desktop Right Controls (Language & Auth) */}
          <div className={styles.desktopActions}>
            <div className={styles.langSelector}>
              <Globe2 size={16} />
              <span>English</span>
              <ChevronDown size={13} />
            </div>

            {currentUser ? (
              <div className={styles.userProfileGroup}>
                <div className={styles.cityBadge}>
                  <MapPin size={14} className={styles.cityPinIcon} />
                  <span>Bengaluru</span>
                  <ChevronDown size={12} />
                </div>

                <button
                  type="button"
                  className={styles.notifBtn}
                  onClick={() => navigateTo('/user/dashboard')}
                  title="Notifications"
                >
                  <Bell size={18} />
                  <span className={styles.notifBadge}>3</span>
                </button>

                <button
                  type="button"
                  className={styles.userAccountBtn}
                  onClick={openAccount}
                >
                  <div className={styles.avatarCircle}>{userInitials}</div>
                  <div className={styles.userAccountText}>
                    <span className={styles.userName}>{currentUser.fullName?.split(' ')[0] || 'Remo'}</span>
                    <small className={styles.userRole}>Personal Account</small>
                  </div>
                  <ChevronDown size={13} className={styles.avatarChevron} />
                </button>
              </div>
            ) : (
              <div className={styles.loginActionGroup}>
                <span className={styles.alreadyAccountText}>Already have an account?</span>
                <button className={styles.outlineLoginBtn} type="button" onClick={openAccount}>
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal open={authOpen} onClose={closeAuth} />
    </>
  )
}

export default Header
