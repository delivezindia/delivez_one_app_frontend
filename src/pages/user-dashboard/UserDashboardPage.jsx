import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  CreditCard,
  Crosshair,
  Edit3,
  ExternalLink,
  FileText,
  Gift,
  Grid,
  Headphones,
  Home,
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
  Maximize2,
  Menu,
  MessageSquare,
  MoreVertical,
  Navigation,
  Package,
  PackageCheck,
  Phone,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Truck,
  Undo2,
  User,
  UserRound,
  Wallet,
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
  { id: 'overview', label: 'Home', icon: Home },
  { id: 'book', label: 'Book Delivery', icon: Truck },
  { id: 'orders', label: 'My Shipments', icon: PackageCheck },
  { id: 'tracking', label: 'Live Tracking', icon: MapPin },
  { id: 'scheduled', label: 'Scheduled Pickups', icon: CalendarDays },
  { id: 'services', label: 'Services', icon: Grid },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPinned },
  { id: 'wallet', label: 'Delvez Money', icon: CreditCard },
  { id: 'rewards', label: 'Offers & Rewards', icon: Gift },
  { id: 'support', label: 'Help & Support', icon: Headphones },
]

const bottomNavItems = [
  { id: 'profile', label: 'Settings', icon: Settings },
  { id: 'logout', label: 'Logout', icon: LogOut },
]

const referenceServices = [
  {
    id: 'courier',
    title: 'Courier',
    description: 'Local to Pan India\nSend documents & parcels anywhere in India.',
    image: '/assets/images/service_courier.jpg',
    route: '/courier',
  },
  {
    id: 'confidential',
    title: 'Confidential Delivery',
    description: 'Secure & private\nFor sensitive items.',
    image: '/assets/images/service_confidential.jpg',
    route: '/book/confidential-delivery',
  },
  {
    id: 'return',
    title: 'Return Pickup',
    description: 'Easy returns\nSchedule a pickup for your online returns.',
    image: '/assets/images/service_return.jpg',
    route: '/book/return-pickup',
  },
  {
    id: 'forgot',
    title: 'Forgot Something?',
    description: 'Instant retrieval\nWe pick up and deliver what you forgot.',
    image: '/assets/images/service_forgot.jpg',
    route: '/book/forgot-something',
  },
  {
    id: 'luggage',
    title: 'Airport Luggage',
    description: 'Door-to-airport or airport-to-door\nLuggage pickup and delivery.',
    image: '/assets/images/service_airport.jpg',
    route: '/book/luggage-delivery',
  },
  {
    id: 'special',
    title: 'Special Delivery',
    description: 'Custom solutions\nFor unique and special requirements.',
    image: '/assets/images/service_special.jpg',
    route: '/book/gift-delivery',
  },
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
  'know-more': { icon: Info, color: '#7c3aed', tint: '#f5f3ff', tag: 'Enterprise & Support' },
  'gift-delivery': { icon: Info, color: '#7c3aed', tint: '#f5f3ff', tag: 'Enterprise & Support' },
  'gift-and-surprise': { icon: Info, color: '#7c3aed', tint: '#f5f3ff', tag: 'Enterprise & Support' },
}

const serviceImages = {
  'courier-delivery': '/assets/images/service_courier.jpg',
  'personal-courier': '/assets/images/service_courier.jpg',
  'luggage-delivery': '/assets/images/service_airport.jpg',
  'airport-luggage': '/assets/images/service_airport.jpg',
  'confidential-delivery': '/assets/images/service_confidential.jpg',
  'confidential-courier': '/assets/images/service_confidential.jpg',
  'forgot-something': '/assets/images/service_forgot.jpg',
  'return-pickup': '/assets/images/service_return.jpg',
  'personal-return-pickup': '/assets/images/service_return.jpg',
  'gift-delivery': '/assets/images/service_special.jpg',
  'gift-and-surprise': '/assets/images/service_special.jpg',
  'know-more': '/assets/images/van_promo_banner.jpg',
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
  const displayName = user.fullName || 'Remo Vivian'
  const firstName = user.fullName ? user.fullName.split(' ')[0] : 'Remo'
  const initials = user.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'RV'
  const mobile = `${user.countryCode ?? '+91'} ${user.mobileNumber ?? ''}`.trim()

  const [activeNav, setActiveNav] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')
  const [servicesState, setServicesState] = useState({ services: SERVICE_CATALOG, loading: true, error: '' })
  const [shipments, setShipments] = useState({ loading: true, error: '', bookings: [], total: 0 })
  const [orderFilter, setOrderFilter] = useState('ALL')

  // Hero Booking Card Tabs & Form State
  const [heroTab, setHeroTab] = useState('book') // 'book' | 'track'
  const [heroPickup, setHeroPickup] = useState('')
  const [heroDrop, setHeroDrop] = useState('')
  const [packageType, setPackageType] = useState('Parcel / Package')
  const [heroTrackingQuery, setHeroTrackingQuery] = useState('')

  // Modals & Sub-states
  const [contactCourierModal, setContactCourierModal] = useState(false)
  const [chatCourierModal, setChatCourierModal] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { sender: 'rider', text: 'Hello! I am on my way to pick up the shipment.', time: '2:15 PM' },
    { sender: 'user', text: 'Great, please call when you reach the gate.', time: '2:18 PM' },
    { sender: 'rider', text: 'Sure, will do! About 8 minutes away.', time: '2:22 PM' },
  ])
  const [walletModal, setWalletModal] = useState(false)
  const [walletAmount, setWalletAmount] = useState('500')
  const [walletBalance, setWalletBalance] = useState(2450)
  const [fullscreenMap, setFullscreenMap] = useState(false)
  const [selectedDetailsShipment, setSelectedDetailsShipment] = useState(null)

  // Addresses, Broadcasts & Profile state
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
        error: 'Live catalog loaded.',
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
        setShipments({ loading: false, error: '', bookings: [], total: 0 })
        return
      }
      const rawBookings = successful.flatMap(({ bookings: items = [] }) => items)
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

  // Active delivery derived from real bookings or fallback to screenshot reference
  const activeDelivery = useMemo(() => {
    const live = shipments.bookings.find(b => !['DELIVERED', 'CANCELLED'].includes(b.status))
    if (live) {
      return {
        id: live.bookingNumber || live.id,
        status: normalizeStatus(live.status),
        statusBadge: 'On the Way',
        eta: 'Today • 2:30 – 3:00 PM',
        from: live.pickup?.city || live.pickupCity || 'Indiranagar',
        to: live.dropoff?.city || live.dropoffCity || 'Koramangala',
        distance: '3.2 km away',
        serviceName: live.itemName || live.service?.name || 'Courier Delivery',
        totalAmount: live.totalAmount || 249,
        steps: ['Booked', 'Picked Up', 'In Transit', 'Delivered'],
        currentStepIndex: ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(live.status) ? 2 : ['PICKED_UP'].includes(live.status) ? 1 : 0,
        rider: { name: 'Ramesh Kumar', phone: '+91 98765 43210' },
        raw: live,
      }
    }
    // Screenshot reference default
    return {
      id: 'DZ789456123',
      status: 'in transit',
      statusBadge: 'On the Way',
      eta: 'Today • 2:30 – 3:00 PM',
      from: 'Indiranagar',
      to: 'Koramangala',
      distance: '3.2 km away',
      serviceName: 'Courier Delivery',
      totalAmount: 249,
      steps: ['Booked', 'Picked Up', 'In Transit', 'Delivered'],
      currentStepIndex: 2,
      rider: { name: 'Ramesh Kumar', phone: '+91 98765 43210' },
      raw: null,
    }
  }, [shipments.bookings])

  // Recent shipments table list (merges real bookings with reference defaults)
  const recentShipments = useMemo(() => {
    const fallbackList = [
      { id: 'DZ789456112', service: 'Confidential Delivery', from: 'Indiranagar', to: 'Whitefield', date: '12 Sep 2026', status: 'Delivered', amount: '₹450' },
      { id: 'DZ789456098', service: 'Courier', from: 'Koramangala', to: 'HSR Layout', date: '10 Sep 2026', status: 'Delivered', amount: '₹180' },
      { id: 'DZ789455845', service: 'Return Pickup', from: 'Indiranagar', to: 'Electronic City', date: '08 Sep 2026', status: 'Delivered', amount: '₹120' },
      { id: 'DZ789455621', service: 'Forgot Something?', from: 'MG Road', to: 'Indiranagar', date: '05 Sep 2026', status: 'Delivered', amount: '₹220' },
    ]

    if (shipments.bookings.length === 0) {
      return fallbackList
    }

    const liveMapped = shipments.bookings.slice(0, 5).map(b => ({
      id: b.bookingNumber || b.id,
      service: b.itemName || b.service?.name || 'Personal Courier',
      from: b.pickup?.city || b.pickupCity || 'Bengaluru',
      to: b.dropoff?.city || b.dropoffCity || 'Bengaluru',
      date: formatDate(b.createdAt, false),
      status: b.status === 'DELIVERED' ? 'Delivered' : ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(b.status) ? 'In Transit' : normalizeStatus(b.status),
      amount: formatMoney(b.totalAmount),
      raw: b,
    }))

    return liveMapped.length < 4 ? [...liveMapped, ...fallbackList.slice(liveMapped.length)] : liveMapped
  }, [shipments.bookings])

  const activeCount = useMemo(() => shipments.bookings.filter((b) => !['DELIVERED', 'CANCELLED'].includes(b.status)).length, [shipments.bookings])
  const completedCount = useMemo(() => shipments.bookings.filter((b) => b.status === 'DELIVERED').length, [shipments.bookings])
  const inTransitCount = useMemo(() => shipments.bookings.filter((b) => ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'IN_TRANSIT_AIRPORT'].includes(b.status)).length, [shipments.bookings])
  const pendingCount = useMemo(() => shipments.bookings.filter((b) => ['BOOKED', 'CONFIRMED', 'ASSIGNED', 'PENDING', 'ORDER_PLACED'].includes(b.status)).length, [shipments.bookings])
  const cancelledCount = useMemo(() => shipments.bookings.filter((b) => b.status === 'CANCELLED').length, [shipments.bookings])

  const filteredBookings = useMemo(() => {
    if (orderFilter === 'IN_TRANSIT') {
      return shipments.bookings.filter((b) => ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'IN_TRANSIT_AIRPORT'].includes(b.status))
    }
    if (orderFilter === 'DELIVERED') {
      return shipments.bookings.filter((b) => b.status === 'DELIVERED')
    }
    if (orderFilter === 'CANCELLED') {
      return shipments.bookings.filter((b) => b.status === 'CANCELLED')
    }
    return shipments.bookings
  }, [shipments.bookings, orderFilter])

  const handleNavClick = (id) => {
    if (id === 'logout') {
      clearUserSession()
      navigateTo('/login')
      return
    }
    if (id === 'book') {
      navigateTo('/courier')
      return
    }
    setActiveNav(id)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleHeroBookingSubmit = (e) => {
    e.preventDefault()
    if (heroTab === 'track') {
      if (!heroTrackingQuery) {
        alert('Please enter a valid Tracking ID / AWB number.')
        return
      }
      navigateTo(`/track/courier/${heroTrackingQuery.trim()}`)
      return
    }
    // Navigate to courier with prefilled state if available
    navigateTo('/courier')
  }

  const handleSendChatMessage = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const newMsg = { sender: 'user', text: chatInput.trim(), time: 'Just now' }
    setChatMessages(prev => [...prev, newMsg])
    setChatInput('')
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'rider', text: 'Received! Arriving shortly.', time: 'Just now' }])
    }, 1200)
  }

  const handleAddWalletMoney = (e) => {
    e.preventDefault()
    const amountNum = Number(walletAmount)
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount.')
      return
    }
    setWalletBalance(prev => prev + amountNum)
    setWalletModal(false)
    alert(`₹${amountNum} added successfully to your Delvez Money balance!`)
  }

  const handleTrackShipment = (id) => {
    if (!id) return
    if (id.startsWith('DRVZ-RET')) {
      navigateTo(`/track/return-pickup/${id}`)
    } else if (id.startsWith('DZ') || id.startsWith('FS-')) {
      navigateTo(`/track/forgot-something/${id}`)
    } else if (id.startsWith('DV')) {
      navigateTo(`/vault/track/${id}`)
    } else {
      navigateTo(`/track/courier/${id}`)
    }
  }

  return (
    <div className={styles.dashboard}>
      {/* 1. FIXED PITCH-BLACK SIDEBAR (#0D0F12) */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <button type="button" className={styles.brand} onClick={() => navigateTo('/')}>
            <span className={styles.brandMain}>DELIVEZ</span>
            <span className={styles.brandDivider}>|</span>
            <span className={styles.brandSub}>ONE</span>
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

        {/* Navigation Items */}
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeNav === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.navItem} ${active ? styles.navActive : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={18} className={styles.navIcon} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Sidebar Eco Banner (Card with 🌿 and Sustainable Logistics info) */}
        <div className={styles.ecoCard}>
          <div className={styles.ecoIconWrap}>🌿</div>
          <p className={styles.ecoText}>
            A cleaner tomorrow with every delivery. Sustainable logistics for a better India.
          </p>
          <button
            type="button"
            className={styles.ecoLink}
            onClick={() => navigateTo('/#services')}
          >
            Learn more →
          </button>
        </div>

        {/* Bottom Nav Items: Settings & Logout */}
        <div className={styles.bottomNavSection}>
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const isLogout = item.id === 'logout'
            const active = activeNav === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.bottomNavItem} ${isLogout ? styles.logoutItem : ''} ${active ? styles.navActive : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && <div className={styles.backdrop} onClick={() => setSidebarOpen(false)} />}

      {/* 2. MAIN WORKSPACE */}
      <div className={styles.workspace}>
        {/* TOPBAR (#0D0F12) */}
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
            {/* Global Search Input Pill */}
            <div className={styles.globalSearch}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search services, track shipment, or get help..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && globalSearch.trim()) {
                    handleTrackShipment(globalSearch.trim())
                  }
                }}
              />
            </div>
          </div>

          <div className={styles.topbarRight}>
            {/* Location Selector Pill */}
            <div className={styles.locationSelector}>
              <MapPin size={15} className={styles.locationPinIcon} />
              <span className={styles.locationCity}>Bengaluru</span>
              <ChevronDown size={14} className={styles.locationChevron} />
            </div>

            {/* Notification Bell */}
            <div className={styles.notificationWrapper}>
              <button
                type="button"
                className={styles.bellBtn}
                onClick={() => setNotificationsOpen((p) => !p)}
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className={styles.bellBadge}>3</span>
              </button>

              {notificationsOpen && (
                <div className={styles.notificationFlyout}>
                  <div className={styles.notificationHeader}>
                    <strong>Notifications (3)</strong>
                    <button type="button" onClick={() => setNotificationsOpen(false)}>
                      <X size={14} />
                    </button>
                  </div>
                  <div className={styles.notificationBody}>
                    <div className={styles.flyoutItem}>
                      <div>
                        <strong>Consignment #{activeDelivery.id}</strong>
                        <small>Rider is 3.2 km away. ETA 2:30 PM.</small>
                      </div>
                      <span className={styles.flyoutDot} />
                    </div>
                    <div className={styles.flyoutItem}>
                      <div>
                        <strong>Delvez Money Added</strong>
                        <small>₹2,450 available balance updated.</small>
                      </div>
                      <span className={styles.flyoutDot} />
                    </div>
                    <div className={styles.flyoutItem}>
                      <div>
                        <strong>Weekend Special Offer</strong>
                        <small>20% off on pan-India personal courier!</small>
                      </div>
                      <span className={styles.flyoutDot} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <button
              type="button"
              className={styles.userProfilePill}
              onClick={() => setActiveNav('profile')}
            >
              <div className={styles.userAvatarCircle}>{initials}</div>
              <span className={styles.userFullName}>{displayName}</span>
              <ChevronDown size={14} className={styles.userChevron} />
            </button>
          </div>
        </header>

        {/* MAIN BODY AREA (#F8FAFC) */}
        <main className={styles.main}>
          {/* Active Network Broadcast Banner */}
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

          {/* OVERVIEW (HOME) 2-COLUMN VIEW */}
          {activeNav === 'overview' && (
            <div className={styles.dashboardGrid}>
              {/* LEFT MAIN COLUMN (~70%) */}
              <div className={styles.dashboardMainCol}>
                {/* 1. HERO BOOKING CARD */}
                <div className={styles.heroBookingCard}>
                  <div className={styles.heroGreetingRow}>
                    <h2>Good morning, {firstName}!</h2>
                    <p>What would you like to deliver today?</p>
                  </div>

                  {/* Skyline Panorama Banner */}
                  <div className={styles.skylineBanner}>
                    <div className={styles.skylineOverlay}>
                      <h3>Personal logistics made simple</h3>
                      <p>Across your city. Across India.</p>
                    </div>
                    {/* Stylized Modern City Skyline Graphic */}
                    <div className={styles.skylineArt}>
                      <svg viewBox="0 0 1000 160" preserveAspectRatio="none" className={styles.skylineSvg}>
                        <polygon points="0,160 0,90 20,90 20,70 40,70 40,160" fill="rgba(255,255,255,0.06)" />
                        <polygon points="45,160 45,50 65,50 65,30 75,30 75,50 95,50 95,160" fill="rgba(255,255,255,0.09)" />
                        <polygon points="100,160 100,80 130,80 130,160" fill="rgba(255,255,255,0.05)" />
                        <polygon points="135,160 135,40 145,20 155,40 170,40 170,160" fill="rgba(255,255,255,0.12)" />
                        <polygon points="175,160 175,65 210,65 210,160" fill="rgba(255,255,255,0.06)" />
                        <polygon points="215,160 215,35 240,35 240,160" fill="rgba(255,255,255,0.08)" />
                        <polygon points="245,160 245,85 270,85 270,160" fill="rgba(255,255,255,0.05)" />
                        <polygon points="275,160 275,45 285,15 295,45 320,45 320,160" fill="rgba(255,255,255,0.14)" />
                        <polygon points="325,160 325,75 365,75 365,160" fill="rgba(255,255,255,0.07)" />
                        <polygon points="370,160 370,30 380,30 380,160" fill="rgba(255,255,255,0.1)" />
                        <polygon points="385,160 385,55 420,55 420,160" fill="rgba(255,255,255,0.06)" />
                        <polygon points="425,160 425,25 440,10 455,25 470,25 470,160" fill="rgba(255,255,255,0.15)" />
                        <polygon points="475,160 475,70 515,70 515,160" fill="rgba(255,255,255,0.08)" />
                        <polygon points="520,160 520,40 550,40 550,160" fill="rgba(255,255,255,0.1)" />
                        <polygon points="555,160 555,85 590,85 590,160" fill="rgba(255,255,255,0.05)" />
                        <polygon points="595,160 595,35 605,15 615,35 635,35 635,160" fill="rgba(255,255,255,0.12)" />
                        <polygon points="640,160 640,65 675,65 675,160" fill="rgba(255,255,255,0.07)" />
                        <polygon points="680,160 680,45 710,45 710,160" fill="rgba(255,255,255,0.09)" />
                        <polygon points="715,160 715,20 725,10 735,20 755,20 755,160" fill="rgba(255,255,255,0.14)" />
                        <polygon points="760,160 760,60 800,60 800,160" fill="rgba(255,255,255,0.07)" />
                        <polygon points="805,160 805,40 840,40 840,160" fill="rgba(255,255,255,0.1)" />
                        <polygon points="845,160 845,75 885,75 885,160" fill="rgba(255,255,255,0.06)" />
                        <polygon points="890,160 890,30 900,15 910,30 930,30 930,160" fill="rgba(255,255,255,0.13)" />
                        <polygon points="935,160 935,65 970,65 970,160" fill="rgba(255,255,255,0.08)" />
                        <polygon points="975,160 975,50 1000,50 1000,160" fill="rgba(255,255,255,0.06)" />
                      </svg>
                    </div>
                  </div>

                  {/* Booking Widget with Tabs */}
                  <div className={styles.bookingFormWrap}>
                    <div className={styles.bookingTabs}>
                      <button
                        type="button"
                        className={`${styles.bookingTab} ${heroTab === 'book' ? styles.bookingTabActive : ''}`}
                        onClick={() => setHeroTab('book')}
                      >
                        Book a Delivery
                      </button>
                      <button
                        type="button"
                        className={`${styles.bookingTab} ${heroTab === 'track' ? styles.bookingTabActive : ''}`}
                        onClick={() => setHeroTab('track')}
                      >
                        Track Shipment
                      </button>
                    </div>

                    <form onSubmit={handleHeroBookingSubmit} className={styles.bookingForm}>
                      {heroTab === 'book' ? (
                        <div className={styles.bookingInputsRow}>
                          {/* Pickup Input */}
                          <div className={styles.inputGroup}>
                            <MapPin size={16} className={styles.inputIcon} />
                            <input
                              type="text"
                              placeholder="Pickup location"
                              value={heroPickup}
                              onChange={(e) => setHeroPickup(e.target.value)}
                            />
                            <button
                              type="button"
                              className={styles.crosshairBtn}
                              title="Use current location"
                              onClick={() => setHeroPickup('Indiranagar, Bengaluru')}
                            >
                              <Crosshair size={14} />
                            </button>
                          </div>

                          {/* Delivery Input */}
                          <div className={styles.inputGroup}>
                            <MapPinned size={16} className={styles.inputIcon} />
                            <input
                              type="text"
                              placeholder="Delivery location"
                              value={heroDrop}
                              onChange={(e) => setHeroDrop(e.target.value)}
                            />
                            <button
                              type="button"
                              className={styles.crosshairBtn}
                              title="Use saved address"
                              onClick={() => setHeroDrop('Koramangala, Bengaluru')}
                            >
                              <Crosshair size={14} />
                            </button>
                          </div>

                          {/* Package Type Dropdown */}
                          <div className={styles.selectGroup}>
                            <Package size={16} className={styles.inputIcon} />
                            <select
                              value={packageType}
                              onChange={(e) => setPackageType(e.target.value)}
                            >
                              <option value="Parcel / Package">Parcel / Package</option>
                              <option value="Documents">Documents & Papers</option>
                              <option value="Electronics">Electronics</option>
                              <option value="Box">Box / Carton</option>
                              <option value="Heavy Item">Heavy Item (10kg+)</option>
                            </select>
                            <ChevronDown size={14} className={styles.selectChevron} />
                          </div>

                          {/* CTA Button */}
                          <button type="submit" className={styles.getOptionsBtn}>
                            <span>Get Delivery Options</span>
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className={styles.trackInputsRow}>
                          <div className={`${styles.inputGroup} ${styles.trackInputGroup}`}>
                            <Search size={16} className={styles.inputIcon} />
                            <input
                              type="text"
                              placeholder="Enter your Tracking ID / Consignment AWB #"
                              value={heroTrackingQuery}
                              onChange={(e) => setHeroTrackingQuery(e.target.value)}
                            />
                          </div>
                          <button type="submit" className={styles.getOptionsBtn}>
                            <span>Track Now</span>
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                </div>

                {/* 2. OUR SERVICES (6-Card Row with Photos) */}
                <div className={styles.servicesSection}>
                  <div className={styles.sectionHeaderRow}>
                    <h3>Our Services</h3>
                    <button
                      type="button"
                      className={styles.sectionHeaderLink}
                      onClick={() => setActiveNav('services')}
                    >
                      View all services →
                    </button>
                  </div>

                  <div className={styles.servicesGrid}>
                    {referenceServices.map((srv) => (
                      <div
                        key={srv.id}
                        className={styles.serviceMiniCard}
                        onClick={() => navigateTo(srv.route)}
                      >
                        <div className={styles.servicePhotoThumb}>
                          <img src={srv.image} alt={srv.title} />
                        </div>
                        <div className={styles.serviceMiniBody}>
                          <h4>{srv.title}</h4>
                          <p>{srv.description}</p>
                          <div className={styles.serviceCircleBtn}>
                            <ChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. YOUR ACTIVE DELIVERY CARD */}
                <div className={styles.activeDeliveryCard}>
                  <div className={styles.activeDeliveryHeader}>
                    <div className={styles.consignmentBadgeRow}>
                      <span className={styles.consignmentLabel}>Consignment</span>
                      <strong className={styles.consignmentId}>{activeDelivery.id}</strong>
                      <span className={styles.onTheWayPill}>
                        <span className={styles.pulsingGreenDot} />
                        {activeDelivery.statusBadge}
                      </span>
                    </div>
                    <div className={styles.etaIndicator}>
                      <Clock3 size={15} />
                      <span>{activeDelivery.eta}</span>
                    </div>
                  </div>

                  {/* Delivery Route & 4-Step Stepper */}
                  <div className={styles.stepperContainer}>
                    <div className={styles.routePill}>
                      <MapPin size={13} color="#fab800" />
                      <strong>{activeDelivery.from}</strong>
                    </div>

                    <div className={styles.horizontalStepper}>
                      {activeDelivery.steps.map((step, idx) => {
                        const isDone = idx < activeDelivery.currentStepIndex
                        const isCurrent = idx === activeDelivery.currentStepIndex
                        return (
                          <div key={step} className={styles.stepUnit}>
                            <div className={`${styles.stepCircle} ${isDone ? styles.stepDone : isCurrent ? styles.stepCurrent : ''}`}>
                              {isDone ? <CheckCircle2 size={13} /> : <span>{idx + 1}</span>}
                            </div>
                            <span className={`${styles.stepText} ${isCurrent ? styles.stepTextCurrent : ''}`}>{step}</span>
                            {idx < activeDelivery.steps.length - 1 && (
                              <div className={`${styles.stepConnector} ${isDone ? styles.connectorDone : ''}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className={styles.routePill}>
                      <MapPinned size={13} color="#10b981" />
                      <strong>{activeDelivery.to}</strong>
                    </div>
                  </div>

                  {/* Actions Row & Interactive Map Canvas Preview */}
                  <div className={styles.activeDeliveryBottom}>
                    <div className={styles.deliveryActionButtons}>
                      <button
                        type="button"
                        className={styles.trackLivePillBtn}
                        onClick={() => handleTrackShipment(activeDelivery.id)}
                      >
                        <Navigation size={14} />
                        <span>Track Live</span>
                      </button>

                      <button
                        type="button"
                        className={styles.detailsOutlineBtn}
                        onClick={() => setSelectedDetailsShipment(activeDelivery)}
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        className={styles.contactCourierBtn}
                        onClick={() => setContactCourierModal(true)}
                      >
                        <Phone size={14} />
                        <span>Contact Courier</span>
                      </button>

                      <button
                        type="button"
                        className={styles.chatCourierBtn}
                        onClick={() => setChatCourierModal(true)}
                      >
                        <MessageSquare size={14} />
                        <span>Chat</span>
                      </button>
                    </div>

                    {/* Interactive Stylized Map Preview with Bike Marker */}
                    <div className={styles.mapCanvasCard}>
                      <div className={styles.mapRoadSvgWrap}>
                        <svg viewBox="0 0 320 120" preserveAspectRatio="none" className={styles.mapRoadSvg}>
                          {/* Map Grid Roads */}
                          <line x1="0" y1="40" x2="320" y2="40" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4,4" />
                          <line x1="0" y1="85" x2="320" y2="85" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4,4" />
                          <line x1="80" y1="0" x2="80" y2="120" stroke="#e2e8f0" strokeWidth="2" />
                          <line x1="220" y1="0" x2="220" y2="120" stroke="#e2e8f0" strokeWidth="2" />
                          {/* Route Curve */}
                          <path
                            d="M 30 75 Q 120 15, 170 60 T 290 45"
                            fill="none"
                            stroke="#fab800"
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                          {/* Start Pin */}
                          <circle cx="30" cy="75" r="5" fill="#0d0f12" stroke="#fab800" strokeWidth="3" />
                          {/* End Pin */}
                          <circle cx="290" cy="45" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="3" />
                        </svg>

                        {/* Moving Bike Marker along the route */}
                        <div className={styles.bikeMarkerWrap} style={{ left: '55%', top: '46%' }}>
                          <div className={styles.bikeBadgePill}>
                            <Truck size={12} />
                            <span>{activeDelivery.distance}</span>
                          </div>
                        </div>

                        {/* Expand full map button */}
                        <button
                          type="button"
                          className={styles.expandMapBtn}
                          onClick={() => setFullscreenMap(true)}
                          title="Expand live route map"
                        >
                          <Maximize2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. RECENT SHIPMENTS TABLE */}
                <div className={styles.recentTableCard}>
                  <div className={styles.recentTableHeader}>
                    <h3>Recent Shipments</h3>
                    <button
                      type="button"
                      className={styles.viewAllBtn}
                      onClick={() => setActiveNav('orders')}
                    >
                      View All →
                    </button>
                  </div>

                  <div className={styles.tableResponsive}>
                    <table className={styles.recentShipmentsTable}>
                      <thead>
                        <tr>
                          <th>Tracking ID</th>
                          <th>Service</th>
                          <th>From</th>
                          <th>To</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentShipments.map((s) => {
                          const isDelivered = s.status.toLowerCase().includes('delivered')
                          const isInTransit = s.status.toLowerCase().includes('transit') || s.status.toLowerCase().includes('way')
                          return (
                            <tr key={s.id}>
                              <td className={styles.trackingIdCell}>
                                <strong>{s.id}</strong>
                              </td>
                              <td className={styles.serviceNameCell}>{s.service}</td>
                              <td>{s.from}</td>
                              <td>{s.to}</td>
                              <td className={styles.dateCell}>{s.date}</td>
                              <td>
                                <span className={`${styles.statusBadgePill} ${isDelivered ? styles.statusDelivered : isInTransit ? styles.statusInTransit : styles.statusScheduled}`}>
                                  {s.status}
                                </span>
                              </td>
                              <td>
                                <div className={styles.tableActionsRow}>
                                  <button
                                    type="button"
                                    className={styles.tableTrackBtn}
                                    onClick={() => handleTrackShipment(s.id)}
                                  >
                                    Track
                                  </button>
                                  {s.raw && (
                                    <button
                                      type="button"
                                      className={styles.tableReceiptBtn}
                                      onClick={() => setSelectedReceiptBooking(s.raw)}
                                      title="Invoice"
                                    >
                                      Receipt
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* RIGHT UTILITY COLUMN (~30%) */}
              <div className={styles.dashboardSideCol}>
                {/* 1. DELVEZ MONEY CARD */}
                <div className={styles.delvezMoneyCard}>
                  <div className={styles.moneyCardHeader}>
                    <div className={styles.moneyTitleWrap}>
                      <Wallet size={18} className={styles.walletGoldIcon} />
                      <h4>Delvez Money</h4>
                    </div>
                  </div>

                  <div className={styles.moneyBalanceDisplay}>
                    <h2>₹{walletBalance.toLocaleString('en-IN')}</h2>
                    <span>Available Balance</span>
                  </div>

                  <div className={styles.moneyQuickActions}>
                    <button
                      type="button"
                      className={styles.moneyActionBtn}
                      onClick={() => setWalletModal(true)}
                    >
                      <Plus size={14} />
                      <span>Add Money</span>
                    </button>
                    <button
                      type="button"
                      className={styles.moneyActionBtn}
                      onClick={() => alert(`Delvez Money ledger: Recent 1 credit transaction of ₹${walletBalance}. No pending dues.`)}
                    >
                      <ArrowRight size={14} style={{ transform: 'rotate(-45deg)' }} />
                      <span>Transactions</span>
                    </button>
                    <button
                      type="button"
                      className={styles.moneyActionBtn}
                      onClick={() => alert('Saved Payment Methods: UPI, NetBanking, and Visa/Mastercard registered.')}
                    >
                      <CreditCard size={14} />
                      <span>Payment Methods</span>
                    </button>
                  </div>
                </div>

                {/* 2. OFFERS & REWARDS CARD */}
                <div className={styles.utilityPromoCard}>
                  <div className={styles.promoIconCircle}>
                    <Gift size={20} color="#fab800" />
                  </div>
                  <div className={styles.promoTextWrap}>
                    <h5>Save more on your deliveries</h5>
                    <p>Get 20% off on your next 3 courier shipments with code <strong>DELVEZ20</strong>.</p>
                    <button
                      type="button"
                      className={styles.promoLink}
                      onClick={() => alert('Coupon DELVEZ20 copied! Apply during checkout to receive 20% instant discount.')}
                    >
                      View Offers →
                    </button>
                  </div>
                </div>

                {/* 3. NEED HELP? CARD */}
                <div className={styles.utilityHelpCard}>
                  <div className={styles.helpIconCircle}>
                    <Headphones size={20} color="#0284c7" />
                  </div>
                  <div className={styles.helpTextWrap}>
                    <h5>We're here for you 24/7</h5>
                    <p>Instant support for live deliveries, lost packages, and cancellations.</p>
                    <button
                      type="button"
                      className={styles.helpLink}
                      onClick={() => setActiveNav('support')}
                    >
                      Contact Support →
                    </button>
                  </div>
                </div>

                {/* 4. UPCOMING PICKUPS */}
                <div className={styles.upcomingPickupsCard}>
                  <div className={styles.upcomingHeader}>
                    <h4>Upcoming Pickups</h4>
                  </div>

                  <div className={styles.upcomingList}>
                    <div className={styles.upcomingItem}>
                      <div className={styles.upcomingIconPill} style={{ background: '#ffedd5', color: '#ea580c' }}>
                        <Undo2 size={16} />
                      </div>
                      <div className={styles.upcomingContent}>
                        <h6>Return Pickup</h6>
                        <small>Amazon return • 2 items</small>
                        <span className={styles.upcomingTime}>Tomorrow, 10:00 AM</span>
                      </div>
                      <span className={styles.upcomingBadge}>Scheduled</span>
                    </div>

                    <div className={styles.upcomingItem}>
                      <div className={styles.upcomingIconPill} style={{ background: '#fef3c7', color: '#d97706' }}>
                        <Luggage size={16} />
                      </div>
                      <div className={styles.upcomingContent}>
                        <h6>Airport Luggage</h6>
                        <small>Indiranagar to Terminal 1</small>
                        <span className={styles.upcomingTime}>16 Sep, 4:00 PM</span>
                      </div>
                      <span className={styles.upcomingBadge}>Scheduled</span>
                    </div>
                  </div>
                </div>

                {/* 5. "TRUSTED FOR WHAT MATTERS" BANNER CARD */}
                <div className={styles.trustedBannerCard}>
                  <div className={styles.trustedImageWrap}>
                    <img src="/assets/images/van_promo_banner.jpg" alt="Delvez Express Logistics Fleet" />
                  </div>
                  <div className={styles.trustedContent}>
                    <h4>Trusted for what matters</h4>
                    <p>Fast, reliable, secure. Certified couriers with real-time GPS precision.</p>
                    <button
                      type="button"
                      className={styles.trustedCtaBtn}
                      onClick={() => navigateTo('/courier')}
                    >
                      <span>Book a Delivery</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MY SHIPMENTS (ORDERS) TAB */}
          {activeNav === 'orders' && (
            <section id="orders" className={styles.ordersSection}>
              <div className={styles.sectionHeaderRow}>
                <div>
                  <h2>My Shipments & Orders</h2>
                  <p>Real-time delivery progress, milestone tracking, and official invoices.</p>
                </div>
                <span className={styles.countPill}>
                  {shipments.bookings.length} Total Orders
                </span>
              </div>

              {/* Shipment Stat Summary Cards */}
              <div className={styles.shipmentStatCards}>
                <div className={styles.shipmentStat}>
                  <small>Total Shipments</small>
                  <strong>{shipments.bookings.length}</strong>
                  <span className={styles.statPillNeutral}>All Time</span>
                </div>
                <div className={styles.shipmentStat}>
                  <small>In Transit</small>
                  <strong style={{ color: '#0284c7' }}>{inTransitCount}</strong>
                  <span className={styles.statPillBlue}>Live Fleet</span>
                </div>
                <div className={styles.shipmentStat}>
                  <small>Delivered</small>
                  <strong style={{ color: '#16a34a' }}>{completedCount}</strong>
                  <span className={styles.statPillGreen}>Successful</span>
                </div>
                <div className={styles.shipmentStat}>
                  <small>Pending</small>
                  <strong style={{ color: '#d97706' }}>{pendingCount}</strong>
                  <span className={styles.statPillYellow}>Scheduled</span>
                </div>
                <div className={styles.shipmentStat}>
                  <small>Cancelled</small>
                  <strong style={{ color: '#dc2626' }}>{cancelledCount}</strong>
                  <span className={styles.statPillRed}>Terminated</span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className={styles.orderFilterTabs}>
                <button
                  type="button"
                  className={`${styles.filterTab} ${orderFilter === 'ALL' ? styles.filterTabActive : ''}`}
                  onClick={() => setOrderFilter('ALL')}
                >
                  All ({shipments.bookings.length})
                </button>
                <button
                  type="button"
                  className={`${styles.filterTab} ${orderFilter === 'IN_TRANSIT' ? styles.filterTabActive : ''}`}
                  onClick={() => setOrderFilter('IN_TRANSIT')}
                >
                  In Transit ({inTransitCount})
                </button>
                <button
                  type="button"
                  className={`${styles.filterTab} ${orderFilter === 'DELIVERED' ? styles.filterTabActive : ''}`}
                  onClick={() => setOrderFilter('DELIVERED')}
                >
                  Delivered ({completedCount})
                </button>
                <button
                  type="button"
                  className={`${styles.filterTab} ${orderFilter === 'CANCELLED' ? styles.filterTabActive : ''}`}
                  onClick={() => setOrderFilter('CANCELLED')}
                >
                  Cancelled ({cancelledCount})
                </button>
              </div>

              {shipments.loading ? (
                <div className={styles.loadingBox}>
                  <LoaderCircle className={styles.spinner} size={28} color="#fab800" />
                  <span>Loading your bookings...</span>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className={styles.emptyOrders}>
                  <Package size={44} color="#94a3b8" />
                  <strong>No bookings match this filter</strong>
                  <small>Start a booking with our fast courier services.</small>
                  <button type="button" onClick={() => navigateTo('/courier')}>
                    <Truck size={15} /> Book a Courier
                  </button>
                </div>
              ) : (
                <div className={styles.orderList}>
                  {filteredBookings.map((booking) => {
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
                              onClick={() => handleTrackShipment(booking.bookingNumber || booking.id)}
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
          )}

          {/* SERVICES FULL CATALOG TAB */}
          {activeNav === 'services' && (
            <section id="services" className={styles.servicesFullSection}>
              <div className={styles.sectionHeaderRow}>
                <div>
                  <h2>All Logistics Services</h2>
                  <p>Book instant local courier, long-distance parcels, secure vault, or airport luggage.</p>
                </div>
                <span className={styles.countPill}>
                  {servicesState.services.length} Services
                </span>
              </div>

              <div className={styles.servicesGridLarge}>
                {servicesState.services.map((service) => {
                  const isFetch = service.slug === 'forgot-something'
                  const isReturn = service.slug === 'return-pickup' || service.slug === 'personal-return-pickup'
                  const isVault = service.slug === 'confidential-delivery' || service.slug === 'confidential-courier'
                  const isKnowMore = service.slug === 'know-more' || service.name === 'Know More'
                  const meta = isReturn
                    ? servicePresentation['return-pickup']
                    : isFetch
                    ? servicePresentation['forgot-something']
                    : isVault
                    ? servicePresentation['confidential-delivery']
                    : isKnowMore
                    ? servicePresentation['know-more']
                    : servicePresentation[service.slug] || servicePresentation['courier-delivery']
                  const photoSrc = serviceImages[service.slug] || '/assets/images/service_courier.jpg'

                  const bookUrl = isReturn
                    ? '/book/return-pickup'
                    : isFetch
                    ? '/book/forgot-something'
                    : isVault
                    ? '/book/confidential-delivery'
                    : isKnowMore
                    ? '/#services'
                    : `/book/${service.slug}`

                  return (
                    <div
                      key={service.slug}
                      className={styles.serviceFullCard}
                      onClick={() => navigateTo(bookUrl)}
                    >
                      <div className={styles.servicePhotoThumb}>
                        <img src={photoSrc} alt={service.name} />
                        <span className={styles.serviceTag}>{meta.tag}</span>
                      </div>
                      <div className={styles.serviceFullCardBody}>
                        <h3>{service.name}</h3>
                        <p>{service.shortDescription}</p>
                        <div className={styles.serviceCardBottom}>
                          <span className={styles.servicePriceLabel}>From ₹49</span>
                          <div className={styles.serviceArrowCircle}>
                            <ArrowRight size={15} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* SAVED ADDRESSES TAB */}
          {activeNav === 'addresses' && (
            <section id="addresses" className={styles.addressSection}>
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
                <div className={styles.emptyAddressBox}>
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
          )}

          {/* PROFILE / SETTINGS TAB */}
          {activeNav === 'profile' && (
            <section id="profile" className={styles.profileSection}>
              <div className={styles.sectionHeaderRow}>
                <div>
                  <h2>Account Settings & Profile</h2>
                  <p>Manage your account credentials, security settings, and contact information.</p>
                </div>
                <button
                  type="button"
                  className={styles.editProfileBtn}
                  onClick={() => {
                    setProfileForm({ fullName: user.fullName || '', email: user.email || user.emailAddress || '' })
                    setIsEditingProfile(true)
                  }}
                >
                  <Edit3 size={14} /> Edit Profile
                </button>
              </div>

              <div className={styles.profileCardFull}>
                <div className={styles.profileHeroRow}>
                  <div className={styles.profileBigAvatar}>{initials}</div>
                  <div>
                    <h3>{user.fullName || 'Valued Customer'}</h3>
                    <p>{user.emailAddress || mobile || 'Personal Account'}</p>
                    <span className={styles.verifiedBadge}>Verified Member</span>
                  </div>
                </div>

                <div className={styles.profileDetailsGrid}>
                  <div className={styles.profileItem}>
                    <dt><User size={14} /> Full Name</dt>
                    <dd>{user.fullName || 'Not provided'}</dd>
                  </div>
                  <div className={styles.profileItem}>
                    <dt><Phone size={14} /> Mobile Phone</dt>
                    <dd>{mobile || 'Not provided'}</dd>
                  </div>
                  <div className={styles.profileItem}>
                    <dt><Mail size={14} /> Email Address</dt>
                    <dd>{user.email || user.emailAddress || 'Not provided'}</dd>
                  </div>
                  <div className={styles.profileItem}>
                    <dt><CalendarDays size={14} /> Member Since</dt>
                    <dd>{formatDate(user.createdAt, false)}</dd>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* HELP & SUPPORT TAB */}
          {activeNav === 'support' && (
            <section id="support" className={styles.supportSection}>
              <div className={styles.sectionHeaderRow}>
                <div>
                  <h2>Help & 24/7 Priority Support</h2>
                  <p>Instant resolution for tracking, rider contacts, and custom logistics.</p>
                </div>
              </div>

              <div className={styles.supportCardsGrid}>
                <div className={styles.supportActionCard}>
                  <Phone size={28} color="#fab800" />
                  <h4>Toll-Free Helpline</h4>
                  <p>Direct assistance with delivery delays, booking updates, or parcel checks.</p>
                  <a href="tel:18001234567" className={styles.supportActionLink}>Call 1800-123-4567</a>
                </div>

                <div className={styles.supportActionCard}>
                  <Mail size={28} color="#0284c7" />
                  <h4>Email Support</h4>
                  <p>Send documentation, consignment claims, or billing enquiries.</p>
                  <a href="mailto:support@delivez.com" className={styles.supportActionLink}>support@delivez.com</a>
                </div>

                <div className={styles.supportActionCard}>
                  <MessageSquare size={28} color="#10b981" />
                  <h4>Live Chat</h4>
                  <p>Chat with our dispatch operations team in real-time.</p>
                  <button type="button" className={styles.supportChatBtn} onClick={() => setChatCourierModal(true)}>
                    Open Live Chat
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* 3. MODALS & POPUPS */}

      {/* Contact Courier Modal */}
      {contactCourierModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox} style={{ maxWidth: '420px' }}>
            <div className={styles.modalHeader}>
              <h3>Contact Delivery Courier</h3>
              <button type="button" className={styles.closeModalBtn} onClick={() => setContactCourierModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody} style={{ textAlign: 'center', padding: '24px 20px' }}>
              <div className={styles.courierAvatarWrap}>
                <Truck size={28} color="#0d0f12" />
              </div>
              <h4 style={{ margin: '10px 0 4px', fontSize: '1.1rem', fontWeight: 800 }}>{activeDelivery.rider.name}</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Assigned Fleet Partner • Delvez Express</p>
              <div style={{ background: '#f1f5f9', borderRadius: '10px', padding: '12px', margin: '18px 0', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '0.5px' }}>
                {activeDelivery.rider.phone}
              </div>
              <a
                href={`tel:${activeDelivery.rider.phone.replace(/\s+/g, '')}`}
                className={styles.saveModalBtn}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
              >
                <Phone size={15} />
                <span>Call Courier Now</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Chat Courier Modal */}
      {chatCourierModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox} style={{ maxWidth: '440px', height: '520px', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fab800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#0d0f12', fontSize: '0.8rem' }}>
                  RK
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Ramesh Kumar</h4>
                  <small style={{ color: '#16a34a', fontWeight: 600 }}>Active on trip • Consignment #{activeDelivery.id}</small>
                </div>
              </div>
              <button type="button" className={styles.closeModalBtn} onClick={() => setChatCourierModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.chatMessagesArea}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`${styles.chatBubble} ${msg.sender === 'user' ? styles.chatBubbleUser : styles.chatBubbleRider}`}>
                  <p>{msg.text}</p>
                  <small>{msg.time}</small>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChatMessage} className={styles.chatInputRow}>
              <input
                type="text"
                placeholder="Type a message to courier..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className={styles.sendChatBtn}>
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Money to Delvez Wallet Modal */}
      {walletModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox} style={{ maxWidth: '420px' }}>
            <div className={styles.modalHeader}>
              <h3>Top Up Delvez Money</h3>
              <button type="button" className={styles.closeModalBtn} onClick={() => setWalletModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddWalletMoney}>
              <div className={styles.modalBody}>
                <p style={{ margin: '0 0 14px', fontSize: '0.85rem', color: '#64748b' }}>
                  Add funds instantly for 1-click contactless checkout across all delivery services.
                </p>
                <div className={styles.formField}>
                  <label>Amount to Add (₹)</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', margin: '10px 0' }}>
                  {['200', '500', '1000', '2000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className={styles.quickAmtBtn}
                      onClick={() => setWalletAmount(amt)}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelModalBtn} onClick={() => setWalletModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveModalBtn}>
                  Add ₹{walletAmount}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Map Modal */}
      {fullscreenMap && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox} style={{ maxWidth: '780px', height: '480px', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.modalHeader}>
              <h3>Live Consignment Route Map • #{activeDelivery.id}</h3>
              <button type="button" className={styles.closeModalBtn} onClick={() => setFullscreenMap(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, position: 'relative', background: '#f8fafc', overflow: 'hidden' }}>
              <svg viewBox="0 0 780 400" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <rect width="100%" height="100%" fill="#f1f5f9" />
                <path d="M 50 320 Q 250 80, 480 220 T 720 150" fill="none" stroke="#fab800" strokeWidth="6" strokeLinecap="round" />
                <circle cx="50" cy="320" r="10" fill="#0d0f12" stroke="#fab800" strokeWidth="4" />
                <circle cx="720" cy="150" r="10" fill="#10b981" stroke="#ffffff" strokeWidth="4" />
                <circle cx="480" cy="220" r="14" fill="#fab800" stroke="#0d0f12" strokeWidth="3" />
              </svg>
              <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#0d0f12', color: '#ffffff', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                📍 Indiranagar ➔ Koramangala • Rider is 3.2 km away (8 mins)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipment Details Modal */}
      {selectedDetailsShipment && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h3>Consignment #{selectedDetailsShipment.id}</h3>
              <button type="button" className={styles.closeModalBtn} onClick={() => setSelectedDetailsShipment(null)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <small style={{ color: '#64748b' }}>Service Type</small>
                  <strong style={{ display: 'block', color: '#0f172a' }}>{selectedDetailsShipment.serviceName}</strong>
                </div>
                <div>
                  <small style={{ color: '#64748b' }}>Status</small>
                  <strong style={{ display: 'block', color: '#16a34a' }}>{selectedDetailsShipment.statusBadge}</strong>
                </div>
                <div>
                  <small style={{ color: '#64748b' }}>Pickup Hub</small>
                  <strong style={{ display: 'block', color: '#0f172a' }}>{selectedDetailsShipment.from}</strong>
                </div>
                <div>
                  <small style={{ color: '#64748b' }}>Destination</small>
                  <strong style={{ display: 'block', color: '#0f172a' }}>{selectedDetailsShipment.to}</strong>
                </div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '14px 0' }} />
              <div>
                <small style={{ color: '#64748b' }}>Courier Fleet Contact</small>
                <strong style={{ display: 'block', color: '#0f172a' }}>{selectedDetailsShipment.rider.name} ({selectedDetailsShipment.rider.phone})</strong>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.saveModalBtn} onClick={() => handleTrackShipment(selectedDetailsShipment.id)}>
                Open Full Tracking Page
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <span>Prepaid via Secured Online Payment (Delvez Gateway)</span>
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
