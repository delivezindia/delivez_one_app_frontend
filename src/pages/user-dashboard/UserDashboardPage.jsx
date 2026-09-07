import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Edit3,
  FileText,
  Gift,
  Headphones,
  Info,
  Key,
  LayoutDashboard,
  LoaderCircle,
  Lock,
  LogOut,
  Luggage,
  Mail,
  MapPin,
  MapPinned,
  Menu,
  Package,
  PackageCheck,
  Phone,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  Truck,
  Undo2,
  User,
  UserRound,
  X,
  Zap
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import { clearUserSession, getStoredUser, updateUserProfile } from '@/features/auth/services/userAuthService.js'
import { fetchCourierBookings } from '@/features/personal-courier/services/personalCourierService.js'
import { fetchLuggageBookings } from '@/features/luggage-delivery/services/luggageDeliveryService.js'
import { fetchVaultBookings } from '@/features/confidential-delivery/services/confidentialDeliveryService.js'
import { fetchForgotSomethingBookings } from '@/features/forgot-something/services/forgotSomethingService.js'
import { fetchReturnPickupBookings } from '@/features/return-pickup/services/returnPickupService.js'
import { fetchGiftDeliveryBookings } from '@/features/gift-delivery/services/giftDeliveryService.js'
import { fetchPublicServices } from '@/features/services/services/publicServicesService.js'
import { mergeServiceCatalog, SERVICE_CATALOG } from '@/features/services/serviceCatalog.js'
import { fetchSavedAddresses, createSavedAddress, deleteSavedAddress, updateSavedAddress } from '@/features/addresses/services/addressService.js'
import { fetchActiveBroadcasts } from '@/features/broadcasts/services/broadcastService.js'
import styles from './UserDashboardPage.module.css'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'services', label: 'Book a Service', icon: Package },
  { id: 'orders', label: 'My Bookings', icon: PackageCheck },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { id: 'profile', label: 'My Profile', icon: UserRound },
  { id: 'support', label: 'Help & Support', icon: Headphones },
]

const servicePresentation = {
  'courier-delivery': { icon: Truck, color: '#0284c7', tint: '#e0f2fe', tag: 'Everyday Transit' },
  'personal-courier': { icon: Truck, color: '#0284c7', tint: '#e0f2fe', tag: 'Everyday Transit' },
  'luggage-delivery': { icon: Luggage, color: '#d97706', tint: '#fef3c7', tag: 'Airport & Hotel' },
  'airport-luggage': { icon: Luggage, color: '#d97706', tint: '#fef3c7', tag: 'Airport & Hotel' },
  'confidential-delivery': { icon: ShieldCheck, color: '#dc2626', tint: '#fee2e2', tag: 'Delivez Vault', isVault: true },
  'confidential-courier': { icon: ShieldCheck, color: '#dc2626', tint: '#fee2e2', tag: 'Delivez Vault', isVault: true },
  'forgot-something': { icon: ShoppingBag, color: '#16a34a', tint: '#dcfce7', tag: 'Delivez Fetch', isFetch: true },
  'return-pickup': { icon: Undo2, color: '#ea580c', tint: '#ffedd5', tag: 'Delivez Back', isReturn: true },
  'personal-return-pickup': { icon: Undo2, color: '#ea580c', tint: '#ffedd5', tag: 'Delivez Back', isReturn: true },
  'gift-delivery': { icon: Gift, color: '#db2777', tint: '#fdf2f8', tag: 'Special Occasions' },
  'gift-and-surprise': { icon: Gift, color: '#db2777', tint: '#fdf2f8', tag: 'Special Occasions' },
}

function formatDate(value, long = true) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available'
  return new Intl.DateTimeFormat('en-IN', long
    ? { day: '2-digit', month: 'long', year: 'numeric' }
    : { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function formatMoney(value, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))
}

function normalizeStatus(status = '') {
  return status.replaceAll('_', ' ').toLowerCase()
}

export default function UserDashboardPage() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser() ?? {})
  const user = currentUser
  const firstName = user.fullName?.split(' ')[0] || 'Valued Customer'
  const initials = user.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'
  const mobile = `${user.countryCode ?? '+91'} ${user.mobileNumber ?? ''}`.trim()

  const [activeNav, setActiveNav] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [serviceQuery, setServiceQuery] = useState('')
  const [servicesState, setServicesState] = useState({ services: SERVICE_CATALOG, loading: true, error: '' })
  const [shipments, setShipments] = useState({ loading: true, error: '', bookings: [], total: 0 })

  // Addresses, Broadcasts & Modals state
  const [addresses, setAddresses] = useState({ loading: false, list: [], error: '' })
  const [broadcasts, setBroadcasts] = useState([])
  const [dismissedBroadcasts, setDismissedBroadcasts] = useState([])
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ fullName: user.fullName || '', email: user.email || user.emailAddress || '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState({
    tag: 'HOME',
    recipientName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '',
    isDefault: false,
  })
  const [addressSaving, setAddressSaving] = useState(false)
  const [addressError, setAddressError] = useState('')

  useEffect(() => {
    fetchActiveBroadcasts().then(setBroadcasts).catch(() => {})
  }, [])

  const loadAddresses = () => {
    setAddresses(prev => ({ ...prev, loading: true }))
    fetchSavedAddresses()
      .then(list => setAddresses({ loading: false, list, error: '' }))
      .catch(err => setAddresses({ loading: false, list: [], error: err?.message || 'Failed to load addresses' }))
  }

  useEffect(() => {
    if (activeNav === 'addresses') {
      loadAddresses()
    }
  }, [activeNav])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileError('')
    try {
      const updated = await updateUserProfile(profileForm)
      setCurrentUser(updated)
      setIsEditingProfile(false)
    } catch (err) {
      setProfileError(err?.message || 'Failed to update profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault()
    setAddressSaving(true)
    setAddressError('')
    try {
      await createSavedAddress({
        tag: addressForm.tag,
        recipientName: addressForm.recipientName || user.fullName || 'Customer',
        phoneNumber: addressForm.phoneNumber || mobile || '9876543210',
        addressLine1: addressForm.addressLine1,
        addressLine2: addressForm.addressLine2 || '',
        city: addressForm.city,
        state: addressForm.state,
        postalCode: addressForm.postalCode,
        isDefault: addressForm.isDefault,
      })
      setIsAddingAddress(false)
      loadAddresses()
      setAddressForm({
        tag: 'HOME',
        recipientName: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '',
        isDefault: false,
      })
    } catch (err) {
      setAddressError(err?.message || 'Failed to save address.')
    } finally {
      setAddressSaving(false)
    }
  }

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to remove this saved address?')) return
    try {
      await deleteSavedAddress(id)
      loadAddresses()
    } catch (err) {
      alert(err?.message || 'Could not delete address.')
    }
  }

  const handleSetDefaultAddress = async (addr) => {
    try {
      await updateSavedAddress(addr.id, { ...addr, isDefault: true })
      loadAddresses()
    } catch (err) {
      alert(err?.message || 'Could not set default address.')
    }
  }

  useEffect(() => {
    let active = true
    fetchPublicServices()
      .then((services) => active && setServicesState({ services: mergeServiceCatalog(services), loading: false, error: '' }))
      .catch(() => active && setServicesState({
        services: SERVICE_CATALOG,
        loading: false,
        error: 'Live images could not be refreshed. All services are available.',
      }))
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    Promise.allSettled([
      fetchCourierBookings({ limit: 10 }).catch(() => ({ bookings: [], total: 0 })),
      fetchVaultBookings().then(bookings => ({ bookings, total: bookings?.length || 0 })).catch(() => ({ bookings: [], total: 0 })),
      fetchForgotSomethingBookings({ limit: 10 }).catch(() => ({ bookings: [], total: 0 })),
      fetchReturnPickupBookings({ limit: 10 }).catch(() => ({ bookings: [], total: 0 })),
      fetchGiftDeliveryBookings({ limit: 10 }).catch(() => ({ bookings: [], total: 0 })),
    ]).then((results) => {
      if (!active) return
      const successful = results.filter(({ status }) => status === 'fulfilled').map(({ value }) => value)
      if (successful.length === 0) {
        const message = results.find(({ status }) => status === 'rejected')?.reason?.message ?? 'Bookings could not be loaded.'
        setShipments({ loading: false, error: message, bookings: [], total: 0 })
        return
      }
      const rawBookings = successful.flatMap(({ bookings: items = [] }) => items)
      // Deduplicate by ID or bookingNumber
      const seen = new Set()
      const bookings = []
      for (const b of rawBookings) {
        const key = b.id || b.bookingNumber
        if (!key || seen.has(key)) continue
        seen.add(key)
        bookings.push(b)
      }
      bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      const total = bookings.length
      setShipments({ loading: false, error: '', bookings, total })
    })

    return () => { active = false }
  }, [])

  const filteredServices = useMemo(() => {
    const query = serviceQuery.trim().toLowerCase()
    if (!query) return servicesState.services
    return servicesState.services.filter((service) => (
      service.name.toLowerCase().includes(query) ||
      service.shortDescription.toLowerCase().includes(query)
    ))
  }, [servicesState.services, serviceQuery])

  const activeCount = useMemo(() => shipments.bookings.filter((b) => !['DELIVERED', 'CANCELLED'].includes(b.status)).length, [shipments.bookings])
  const completedCount = useMemo(() => shipments.bookings.filter((b) => b.status === 'DELIVERED').length, [shipments.bookings])

  const scrollTo = (id) => {
    setActiveNav(id)
    setSidebarOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleSignOut = () => {
    clearUserSession()
    navigateTo('/#signin')
  }

  return (
    <div className={styles.dashboard}>
      {/* Fixed Left Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarTop}>
          <button type="button" className={styles.brand} onClick={() => navigateTo('/')}>
            <span className={styles.brandMain}>DELIVEZ</span>
            <small className={styles.brandSub}>ONE</small>
          </button>
          <button
            type="button"
            className={styles.closeSidebar}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Profile Mini Card */}
        <div className={styles.userCard}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <strong>{user.fullName || 'Valued Customer'}</strong>
            <small>{user.emailAddress || mobile || 'Personal Account'}</small>
          </div>
        </div>

        {/* Navigation Rail */}
        <nav className={styles.nav}>
          <div className={styles.navSectionLabel}>NAVIGATION</div>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeNav === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.navItem} ${active ? styles.navActive : ''}`}
                onClick={() => scrollTo(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                <ChevronRight size={14} className={styles.navArrow} />
              </button>
            )
          })}
        </nav>

        {/* Fast Action Quick Cards */}
        <div className={styles.sidebarFastActions}>
          <div className={styles.fetchPromoCard}>
            <div className={styles.fetchPromoHeader}>
              <Zap size={14} color="#16a34a" />
              <strong>Forgot Something?</strong>
            </div>
            <p>Need keys, laptop, or bag retrieved fast? Rapid 15–30 min retrieval is live!</p>
            <button
              type="button"
              className={styles.fetchPromoBtn}
              onClick={() => navigateTo('/book/forgot-something')}
            >
              Fetch Item Now
            </button>
          </div>

          <div className={styles.returnPromoCard}>
            <div className={styles.returnPromoHeader}>
              <Undo2 size={14} color="#ea580c" />
              <strong>Return Pickup</strong>
            </div>
            <p>Return Amazon, Flipkart, or retail items right from your doorstep.</p>
            <button
              type="button"
              className={styles.returnPromoBtn}
              onClick={() => navigateTo('/book/return-pickup')}
            >
              Book Return
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          <button type="button" className={styles.logoutBtn} onClick={handleSignOut}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && <div className={styles.backdrop} onClick={() => setSidebarOpen(false)} />}

      {/* Main Workspace Area */}
      <div className={styles.workspace}>
        {/* Topbar Header */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.menuToggle}
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>
            <div className={styles.pageInfo}>
              <h1>Welcome back, {firstName} 👋</h1>
              <p>Manage your live bookings, personal dispatches, and quick item retrievals in one place.</p>
            </div>
          </div>

          <div className={styles.topbarRight}>
            <div className={styles.searchBar}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search services..."
                value={serviceQuery}
                onChange={(e) => setServiceQuery(e.target.value)}
              />
            </div>

            <div className={styles.notificationWrapper}>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setNotificationsOpen((p) => !p)}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
              </button>

              {notificationsOpen && (
                <div className={styles.notificationFlyout}>
                  <div className={styles.notificationHeader}>
                    <strong>Active Shipments ({activeCount})</strong>
                    <button type="button" onClick={() => setNotificationsOpen(false)}>
                      <X size={14} />
                    </button>
                  </div>
                  <div className={styles.notificationBody}>
                    {shipments.bookings.filter((b) => !['DELIVERED', 'CANCELLED'].includes(b.status)).length === 0 ? (
                      <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No live shipments in transit.</p>
                    ) : (
                      shipments.bookings
                        .filter((b) => !['DELIVERED', 'CANCELLED'].includes(b.status))
                        .slice(0, 4)
                        .map((b) => (
                          <div key={b.id || b.bookingNumber} className={styles.flyoutItem}>
                            <div>
                              <strong>{b.bookingNumber || b.itemName || 'Booking'}</strong>
                              <small>{normalizeStatus(b.status)}</small>
                            </div>
                            <span>{formatMoney(b.totalAmount)}</span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.topUserCard}>
              <div className={styles.topAvatar}>{initials}</div>
              <div className={styles.topUserInfo}>
                <strong>{user.fullName || 'User'}</strong>
                <small>Personal account</small>
              </div>
              <button
                type="button"
                className={styles.topLogoutBtn}
                onClick={handleSignOut}
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className={styles.main}>
          {/* Operational Network Broadcast Banner */}
          {broadcasts.filter(b => !dismissedBroadcasts.includes(b.id)).map(b => (
            <div
              key={b.id}
              className={`${styles.broadcastBanner} ${b.severity === 'EMERGENCY' ? styles.broadcastEmergency : b.severity === 'WARNING' ? styles.broadcastWarning : styles.broadcastInfo}`}
            >
              {b.severity === 'EMERGENCY' ? <AlertTriangle size={18} /> : <Info size={18} />}
              <div className={styles.broadcastText}>
                <strong>{b.title}:</strong> {b.message}
              </div>
              <button
                type="button"
                className={styles.broadcastClose}
                onClick={() => setDismissedBroadcasts(prev => [...prev, b.id])}
                title="Dismiss alert"
              >
                <X size={15} />
              </button>
            </div>
          ))}
          {/* Overview Hero Section */}
          <section id="overview" className={styles.overviewSection}>
            {/* Stat Counters Row */}
            <div className={styles.statsGrid}>
              <article className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>
                  <Clock3 size={22} />
                </div>
                <div className={styles.statInfo}>
                  <small>In transit</small>
                  <strong>{activeCount}</strong>
                  <span>Active deliveries right now</span>
                </div>
              </article>

              <article className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
                  <CheckCircle2 size={22} />
                </div>
                <div className={styles.statInfo}>
                  <small>Delivered</small>
                  <strong>{completedCount}</strong>
                  <span>Completed dispatches</span>
                </div>
              </article>

              <article className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
                  <Sparkles size={22} />
                </div>
                <div className={styles.statInfo}>
                  <small>Verified Services</small>
                  <strong>{servicesState.services.length}</strong>
                  <span>On-demand logistics categories</span>
                </div>
              </article>
            </div>
          </section>

          {/* Quick Book Services Section */}
          <section id="services" className={styles.servicesSection}>
            <div className={styles.sectionTitle}>
              <div>
                <h2>Book a Delivery Service</h2>
                <p>Select any on-demand dispatch or specialized retrieval service.</p>
              </div>
              <div className={styles.serviceCountBadge}>
                {filteredServices.length} Services Available
              </div>
            </div>

            <div className={styles.servicesGrid}>
              {filteredServices.map((service) => {
                const isFetch = service.slug === 'forgot-something'
                const isReturn = service.slug === 'return-pickup' || service.slug === 'personal-return-pickup'
                const isVault = service.slug === 'confidential-delivery' || service.slug === 'confidential-courier'
                const meta = isReturn
                  ? servicePresentation['return-pickup']
                  : isFetch
                  ? servicePresentation['forgot-something']
                  : isVault
                  ? servicePresentation['confidential-delivery']
                  : servicePresentation[service.slug] || servicePresentation['courier-delivery']
                const ServiceIcon = meta.icon || Package

                const bookUrl = isReturn
                  ? '/book/return-pickup'
                  : isFetch
                  ? '/book/forgot-something'
                  : isVault
                  ? '/book/confidential-delivery'
                  : `/book/${service.slug}`

                return (
                  <div
                    key={service.slug}
                    className={styles.serviceCard}
                    style={{
                      '--service-color': meta.color,
                      '--service-tint': meta.tint,
                    }}
                  >
                    <div>
                      <div className={styles.serviceVisual}>
                        <ServiceIcon size={24} />
                      </div>
                      <div className={styles.available}>
                        <i /> Available Now
                      </div>
                      <h3>{service.name}</h3>
                      <p>{service.shortDescription}</p>
                    </div>

                    <button type="button" onClick={() => navigateTo(bookUrl)}>
                      <span>Book Service</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Bookings Section */}
          <section id="orders" className={styles.ordersSection}>
            <div className={styles.sectionTitle}>
              <div>
                <h2>My Bookings & Retrievals</h2>
                <p>Live status updates, milestones, and OTP verification for all orders.</p>
              </div>
              <span className={styles.ordersCountPill}>
                {shipments.bookings.length} Total Orders
              </span>
            </div>

            {shipments.loading ? (
              <div className={styles.loadingBox}>
                <LoaderCircle className={styles.spinner} size={28} color="#d97706" />
                <span>Loading your bookings...</span>
              </div>
            ) : shipments.bookings.length === 0 ? (
              <div className={styles.emptyOrders}>
                <Package size={44} color="#94a3b8" />
                <strong>No bookings placed yet</strong>
                <small>Select any service above or start with Forgot Something to fetch an item.</small>
                <button type="button" onClick={() => navigateTo('/book/forgot-something')}>
                  <ShoppingBag size={15} /> Book Retrieval
                </button>
              </div>
            ) : (
              <div className={styles.orderList}>
                {shipments.bookings.map((booking) => {
                  const isReturn = !!booking.returnType || (booking.bookingNumber && (booking.bookingNumber.startsWith('DRVZ-RET') || booking.bookingNumber.startsWith('RBK')))
                  const isFetch = !isReturn && (!!booking.itemCategory || (booking.bookingNumber && (booking.bookingNumber.startsWith('DZ') || booking.bookingNumber.startsWith('FS-'))))
                  const isVault = !isReturn && !isFetch && (!!booking.documentType || (booking.bookingNumber && (booking.bookingNumber.startsWith('DV') || booking.bookingNumber.includes('VAULT'))))
                  const isGift = !isReturn && !isFetch && !isVault && (!!booking.productName || (booking.bookingNumber && booking.bookingNumber.startsWith('DLVZ')))
                  
                  const meta = isReturn
                    ? servicePresentation['return-pickup']
                    : isFetch
                    ? servicePresentation['forgot-something']
                    : isVault
                    ? servicePresentation['confidential-delivery']
                    : isGift
                    ? servicePresentation['gift-delivery']
                    : servicePresentation[booking.service?.slug] || servicePresentation['courier-delivery']
                  const ServiceIcon = meta.icon || Package

                  const isCourier =
                    booking.service?.slug === 'courier-delivery' ||
                    booking.service?.slug === 'personal-courier' ||
                    booking.service?.slug === 'luggage-delivery' ||
                    booking.service?.slug === 'airport-luggage' ||
                    booking.serviceSlug === 'personal-courier' ||
                    booking.serviceSlug === 'courier-delivery' ||
                    booking.serviceSlug === 'luggage-delivery' ||
                    Boolean(booking.bookingNumber && (booking.bookingNumber === 'DLVZ2505128947' || booking.bookingNumber.length >= 13 || booking.bookingNumber.startsWith('PC') || booking.bookingNumber.startsWith('DLZC')))

                  const trackUrl = isReturn
                    ? `/track/return-pickup/${booking.bookingNumber || booking.id}`
                    : isFetch
                    ? `/track/forgot-something/${booking.bookingNumber || booking.id}`
                    : isVault
                    ? `/vault/track/${booking.bookingNumber || booking.id}`
                    : isCourier
                    ? `/track/courier/${booking.bookingNumber || booking.id}`
                    : isGift
                    ? `/gift-delivery/track/${booking.bookingNumber || booking.id}`
                    : `/track/${booking.bookingNumber || booking.id}`

                  const isCancelled = booking.status === 'CANCELLED'

                  return (
                    <article key={booking.id || booking.bookingNumber} className={styles.orderCard}>
                      <div
                        className={styles.orderIconWrap}
                        style={{ background: meta.tint, color: meta.color }}
                      >
                        <ServiceIcon size={20} />
                      </div>

                      <div className={styles.orderMain}>
                        <div className={styles.orderTitleRow}>
                          <strong>{booking.bookingNumber || booking.itemName || booking.productName || 'Booking'}</strong>
                          <span
                            className={styles.orderTag}
                            style={{ background: meta.tint, color: meta.color }}
                          >
                            {meta.tag}
                          </span>
                        </div>
                        <small className={styles.orderSub}>
                          {isReturn ? (
                            <>
                              <Undo2 size={12} /> {booking.itemDescription || 'Return Item'} • To {booking.destinationName || 'Seller Hub'}
                            </>
                          ) : isFetch ? (
                            <>
                              <MapPin size={12} /> {booking.itemName || booking.itemCategory} • {booking.locationType || 'Pickup'} to {booking.dropoffCity || booking.dropoff?.city || 'Destination'}
                            </>
                          ) : isVault ? (
                            <>
                              <Shield size={12} /> {booking.documentType} • {booking.securityLevel}
                            </>
                          ) : isGift ? (
                            <>
                              <Gift size={12} /> {booking.productName || 'Surprise Gift'} • Qty: {booking.productQuantity || 1} • To {booking.recipientName || 'Recipient'}
                            </>
                          ) : (
                            <>
                              <Truck size={12} /> {booking.package?.category || booking.package?.contentCategory || 'Standard parcel'}
                            </>
                          )}
                        </small>
                      </div>

                      <div className={styles.orderDate}>
                        <small>Booked on</small>
                        <strong>{formatDate(booking.createdAt, false)}</strong>
                      </div>

                      <div className={styles.orderMeta}>
                        <strong className={styles.orderAmount}>
                          {formatMoney(booking.totalAmount)}
                        </strong>
                        <span className={`${styles.statusBadge} ${isCancelled ? styles.cancelledBadge : ''}`}>
                          {normalizeStatus(booking.status)}
                        </span>
                        <div className={styles.orderCardButtons}>
                          <button
                            type="button"
                            className={styles.trackOrderBtn}
                            onClick={() => navigateTo(trackUrl)}
                          >
                            <span>Track Order</span>
                            <ArrowRight size={12} />
                          </button>
                          <button
                            type="button"
                            className={styles.receiptBtn}
                            onClick={() => setSelectedReceiptBooking(booking)}
                            title="View official digital invoice"
                          >
                            <FileText size={12} />
                            <span>Receipt</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          {/* Saved Addresses Section */}
          <section id="addresses" className={styles.addressSection} style={{ display: activeNav === 'addresses' || activeNav === 'overview' ? 'block' : 'none', marginBottom: '32px' }}>
            <div className={styles.addressHeaderRow}>
              <div>
                <h2>Saved Address Book</h2>
                <p>Manage home, office, and warehouse pickup & dropoff destinations.</p>
              </div>
              <button
                type="button"
                className={styles.addAddressBtn}
                onClick={() => {
                  setAddressForm({
                    tag: 'HOME',
                    recipientName: user.fullName || '',
                    phoneNumber: mobile || '',
                    addressLine1: '',
                    addressLine2: '',
                    city: 'Bengaluru',
                    state: 'Karnataka',
                    postalCode: '',
                    isDefault: addresses.list.length === 0,
                  })
                  setIsAddingAddress(true)
                }}
              >
                <Plus size={15} /> Add New Address
              </button>
            </div>

            {addresses.loading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                <LoaderCircle className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
                <span>Loading saved addresses...</span>
              </div>
            ) : addresses.list.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', background: '#f8fafc', borderRadius: '12px' }}>
                <MapPin size={32} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
                <p style={{ margin: 0, fontWeight: 700, color: '#334155' }}>No saved addresses yet.</p>
                <small style={{ color: '#64748b' }}>Add frequently used addresses to speed up future bookings.</small>
              </div>
            ) : (
              <div className={styles.addressGrid}>
                {addresses.list.map((addr) => (
                  <div key={addr.id} className={`${styles.addressCard} ${addr.isDefault ? styles.addressCardDefault : ''}`}>
                    <div className={styles.addressTopRow}>
                      <span className={styles.addressTag}>{addr.tag || 'ADDRESS'}</span>
                      {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                    </div>
                    <div className={styles.addressContact}>{addr.recipientName}</div>
                    <div className={styles.addressPhone}>{addr.phoneNumber}</div>
                    <div className={styles.addressLines}>
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                      <br />
                      {addr.city}, {addr.state} - {addr.postalCode}
                    </div>
                    <div className={styles.addressActions}>
                      {!addr.isDefault && (
                        <button
                          type="button"
                          className={styles.setDefaultBtn}
                          onClick={() => handleSetDefaultAddress(addr)}
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        type="button"
                        className={styles.deleteAddressBtn}
                        onClick={() => handleDeleteAddress(addr.id)}
                        title="Delete Address"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Profile & Support Details Grid */}
          <div className={styles.detailGrid}>
            <div id="profile" className={styles.profileCard}>
              <div className={styles.sectionHeading}>
                <div className={styles.headingIconWrap}>
                  <User size={18} />
                </div>
                <h2>Personal Profile</h2>
                <button
                  type="button"
                  className={styles.editProfileBtn}
                  onClick={() => {
                    setProfileForm({ fullName: user.fullName || '', email: user.email || user.emailAddress || '' })
                    setIsEditingProfile(true)
                  }}
                >
                  <Edit3 size={13} /> Edit
                </button>
              </div>
              <dl className={styles.profileDl}>
                <div>
                  <dt><User size={13} /> Full Name</dt>
                  <dd>{user.fullName || 'Not provided'}</dd>
                </div>
                <div>
                  <dt><Phone size={13} /> Mobile Number</dt>
                  <dd>{mobile || 'Not provided'}</dd>
                </div>
                <div>
                  <dt><Mail size={13} /> Email Address</dt>
                  <dd>{user.email || user.emailAddress || 'Not provided'}</dd>
                </div>
                <div>
                  <dt><CalendarDays size={13} /> Member Since</dt>
                  <dd>{formatDate(user.createdAt, false)}</dd>
                </div>
              </dl>
            </div>

            <div id="support" className={styles.supportCard}>
              <div>
                <p className={styles.supportKicker}>24/7 DEDICATED SUPPORT</p>
                <h2>Need help with an order?</h2>
                <small>
                  Our logistics assistance team is available round the clock. Connect for instant resolution or live partner contact.
                </small>
              </div>
              <button
                type="button"
                className={styles.supportBtn}
                onClick={() => alert('Support helpline: Call 1800-DELIVEZ (toll-free) or email support@delivez.com')}
              >
                <Headphones size={16} />
                <span>Contact Helpdesk</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3>Update Personal Profile</h3>
              <button type="button" className={styles.closeModalBtn} onClick={() => setIsEditingProfile(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile}>
              <div className={styles.modalBody}>
                {profileError && (
                  <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {profileError}
                  </div>
                )}
                <div className={styles.formField}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm(p => ({ ...p, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className={styles.formField}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelModalBtn} onClick={() => setIsEditingProfile(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveModalBtn} disabled={profileSaving}>
                  {profileSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {isAddingAddress && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3>Add New Delivery Address</h3>
              <button type="button" className={styles.closeModalBtn} onClick={() => setIsAddingAddress(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveAddress}>
              <div className={styles.modalBody}>
                {addressError && (
                  <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {addressError}
                  </div>
                )}
                <div className={styles.formField}>
                  <label>Address Tag / Label</label>
                  <select
                    value={addressForm.tag}
                    onChange={(e) => setAddressForm(p => ({ ...p, tag: e.target.value }))}
                  >
                    <option value="HOME">Home</option>
                    <option value="WORK">Work / Office</option>
                    <option value="WAREHOUSE">Warehouse / Hub</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className={styles.formField}>
                    <label>Recipient / Contact Name</label>
                    <input
                      type="text"
                      required
                      value={addressForm.recipientName}
                      onChange={(e) => setAddressForm(p => ({ ...p, recipientName: e.target.value }))}
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phoneNumber}
                      onChange={(e) => setAddressForm(p => ({ ...p, phoneNumber: e.target.value }))}
                      placeholder="9876543210"
                    />
                  </div>
                </div>
                <div className={styles.formField}>
                  <label>Address Line 1 (Flat, House No, Building)</label>
                  <input
                    type="text"
                    required
                    value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm(p => ({ ...p, addressLine1: e.target.value }))}
                    placeholder="e.g. Flat 402, Green Glen Heights"
                  />
                </div>
                <div className={styles.formField}>
                  <label>Address Line 2 (Street, Landmark)</label>
                  <input
                    type="text"
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm(p => ({ ...p, addressLine2: e.target.value }))}
                    placeholder="Near Bellandur Junction"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className={styles.formField}>
                    <label>City</label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm(p => ({ ...p, city: e.target.value }))}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>State</label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm(p => ({ ...p, state: e.target.value }))}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Postal Code</label>
                    <input
                      type="text"
                      required
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm(p => ({ ...p, postalCode: e.target.value }))}
                      placeholder="560103"
                    />
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelModalBtn} onClick={() => setIsAddingAddress(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveModalBtn} disabled={addressSaving}>
                  {addressSaving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Itemized Order Receipt Modal */}
      {selectedReceiptBooking && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox} style={{ maxWidth: '480px' }}>
            <div className={styles.modalHeader}>
              <h3>Official Tax Invoice & Receipt</h3>
              <button type="button" className={styles.closeModalBtn} onClick={() => setSelectedReceiptBooking(null)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.receiptPaper}>
                <div className={styles.receiptHeader}>
                  <h4>DELIVEZ LOGISTICS PVT LTD</h4>
                  <small>GSTIN: 29AABCD1234E1Z5 • Digital Consignment Receipt</small>
                </div>
                <div className={styles.receiptRow}>
                  <span>Booking Number:</span>
                  <strong>{selectedReceiptBooking.bookingNumber || selectedReceiptBooking.id}</strong>
                </div>
                <div className={styles.receiptRow}>
                  <span>Date & Time:</span>
                  <span>{formatDate(selectedReceiptBooking.createdAt, true)}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span>Customer:</span>
                  <span>{user.fullName || 'Customer'}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span>Status:</span>
                  <strong>{normalizeStatus(selectedReceiptBooking.status)}</strong>
                </div>
                <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '10px 0' }} />
                <div className={styles.receiptRow}>
                  <span>Item / Consignment:</span>
                  <span>{selectedReceiptBooking.itemName || selectedReceiptBooking.productName || selectedReceiptBooking.documentType || 'Parcel Delivery'}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span>Delivery Base Fare:</span>
                  <span>₹{Math.max(49, Math.round(Number(selectedReceiptBooking.totalAmount || 199) * 0.78))}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span>Transit Protection & Priority:</span>
                  <span>₹{Math.round(Number(selectedReceiptBooking.totalAmount || 199) * 0.1)}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span>Applicable GST (18%):</span>
                  <span>₹{Math.round(Number(selectedReceiptBooking.totalAmount || 199) * 0.12)}</span>
                </div>
                <div className={`${styles.receiptRow} ${styles.receiptTotal}`}>
                  <strong>Net Paid Amount:</strong>
                  <strong style={{ color: '#dc2626' }}>{formatMoney(selectedReceiptBooking.totalAmount)}</strong>
                </div>
                <div className={styles.receiptRow} style={{ marginTop: '6px', fontSize: '0.74rem', color: '#16a34a' }}>
                  <span>Payment Method:</span>
                  <span>Prepaid via Secured Online Payment (Delivez Gateway)</span>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.saveModalBtn}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#0f172a' }}
                onClick={() => window.print()}
              >
                <Printer size={15} /> Print / Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

