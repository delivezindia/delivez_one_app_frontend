import { useEffect, useMemo, useState, Fragment } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Bike,
  Building,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Copy,
  CreditCard,
  Crosshair,
  Edit3,
  ExternalLink,
  FileText,
  Laptop,
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
  QrCode,
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
  { id: 'returns', label: 'My Returns', icon: RotateCcw },
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

export const ALL_DASHBOARD_SERVICES = [
  {
    id: 'courier',
    serviceKey: 'courier',
    category: 'express',
    title: 'Personal Courier',
    tag: 'Everyday Transit',
    badgeColor: '#0284c7',
    icon: Truck,
    description: 'Local to Pan India. Send documents, parcels & packages anywhere across 28,000+ pin codes.',
    features: [
      'Doorstep pickup in 60 mins',
      'Real-time GPS tracking',
      'Free digital Proof of Delivery',
      'Tamper-evident packaging',
    ],
    price: 'From ₹49',
    image: '/assets/images/service_courier.jpg',
    route: '/courier',
  },
  {
    id: 'now',
    serviceKey: 'now',
    category: 'express',
    title: 'Delvez Now',
    tag: '60-Min Hyperlocal',
    badgeColor: '#fab800',
    icon: Bike,
    description: 'Lightning-fast on-demand delivery for urgent parcels, food, keys, medicines, and packages.',
    features: [
      '60-minute intra-city drop',
      'Dedicated point-to-point rider',
      'Live speedometer route tracking',
      'Instant SMS & WhatsApp alerts',
    ],
    price: 'From ₹69',
    image: '/assets/images/service_courier.jpg',
    route: '/courier',
  },
  {
    id: 'local',
    serviceKey: 'local',
    category: 'express',
    title: 'Delvez Local',
    tag: 'City-Wide Transit',
    badgeColor: '#10b981',
    icon: MapPin,
    description: 'Same-day and scheduled intra-city courier service connecting all corners of the city.',
    features: [
      'Same-day guaranteed drop',
      'Scheduled time windows',
      'Multi-stop route support',
      'Cost-effective urban rates',
    ],
    price: 'From ₹59',
    image: '/assets/images/service_courier.jpg',
    route: '/courier',
  },
  {
    id: 'move',
    serviceKey: 'move',
    category: 'express',
    title: 'Delvez Move',
    tag: 'Heavy Cargo & Trucks',
    badgeColor: '#6366f1',
    icon: Truck,
    description: 'Mini-trucks and commercial tempos for bulky goods, furniture, business logistics, and shifting.',
    features: [
      'On-demand Tata Ace & Pickups',
      'Helper loading & unloading option',
      'Bulk goods transit insurance',
      'Transparent flat distance pricing',
    ],
    price: 'From ₹499',
    image: '/assets/images/van_promo_banner.jpg',
    route: '/courier',
  },
  {
    id: 'vault',
    serviceKey: 'vault',
    category: 'vault',
    title: 'Confidential Vault Delivery',
    tag: 'Delvez Vault • Top Secret',
    badgeColor: '#dc2626',
    icon: ShieldCheck,
    description: 'Ultra-secure transit for sensitive legal deeds, property contracts, jewelry, and high-value items.',
    features: [
      'Biometric chain of custody',
      'Tamper-evident barcoded pouch',
      'Dual OTP verification on delivery',
      'Dedicated uniformed escort',
    ],
    price: 'From ₹299',
    image: '/assets/images/service_confidential.jpg',
    route: '/book/confidential-delivery',
  },
  {
    id: 'luggage',
    serviceKey: 'luggage',
    category: 'luggage',
    title: 'Airport Luggage Delivery',
    tag: 'Airport & Hotel',
    badgeColor: '#d97706',
    icon: Luggage,
    description: 'Travel hands-free. We pick up your luggage from doorstep and deliver to airport terminal or hotel.',
    features: [
      'Door-to-airport terminal transfer',
      'Sealed airline-compliant straps',
      'Real-time luggage carousel tracking',
      'Complimentary flight delay protection',
    ],
    price: 'From ₹349',
    image: '/assets/images/service_airport.jpg',
    route: '/book/luggage-delivery',
  },
  {
    id: 'return',
    serviceKey: 'return',
    category: 'returns',
    title: 'Online Return Pickup',
    tag: 'E-Commerce Reverse',
    badgeColor: '#ea580c',
    icon: Undo2,
    description: 'Effortless doorstep return pickups for Amazon, Flipkart, Myntra, Ajio, and other stores.',
    features: [
      'Doorstep item inspection & QC',
      'Automatic barcode return label print',
      'Instant digital pickup receipt',
      'Direct dispatch to merchant hub',
    ],
    price: 'From ₹79',
    image: '/assets/images/service_return.jpg',
    route: '/book/return-pickup',
  },
  {
    id: 'forgot',
    serviceKey: 'forgot',
    category: 'special',
    title: 'Forgot Something? (Delvez Fetch)',
    tag: 'Instant Retrieval',
    badgeColor: '#16a34a',
    icon: ShoppingBag,
    description: 'Forgot your house keys, charger, wallet, or passport? We retrieve it immediately and bring it to you.',
    features: [
      'Priority 45-minute pickup',
      'Secure identity code handover',
      'Direct route with zero detours',
      'Live rider phone call coordinate',
    ],
    price: 'From ₹89',
    image: '/assets/images/service_forgot.jpg',
    route: '/book/forgot-something',
  },
]

export const VALUE_ADDED_SERVICES = [
  {
    id: 'security',
    title: 'Enhanced Security Handling',
    price: 200,
    badge: '+ ₹ 200',
    description: 'Dedicated supervisor inspection & biometric chain of custody.',
    icon: ShieldCheck,
  },
  {
    id: 'dedicated',
    title: 'Dedicated Courier',
    price: 500,
    badge: '+ ₹ 500',
    description: 'Direct point-to-point courier with no other consignments.',
    icon: Truck,
  },
  {
    id: 'tamper',
    title: 'Tamper-Evident Packaging',
    price: 150,
    badge: '+ ₹ 150',
    description: 'Barcoded seal numbered security packaging with tear-strip.',
    icon: Lock,
  },
  {
    id: 'pod',
    title: 'Proof of Delivery (POD)',
    price: 50,
    badge: '+ ₹ 50',
    description: 'Physical signature copy & high-res delivery photo proof.',
    icon: FileText,
  },
  {
    id: 'alerts',
    title: 'Real-Time Alerts',
    price: 50,
    badge: '+ ₹ 50',
    description: 'Instant SMS, WhatsApp & Email tracking notifications at every stage.',
    icon: Bell,
  },
  {
    id: 'insurance',
    title: 'Insurance Coverage',
    price: 500,
    badge: '+ ₹ 500',
    description: 'Comprehensive transit damage and loss protection up to ₹1,00,000.',
    icon: Shield,
  },
  {
    id: 'temp',
    title: 'Temperature-Controlled',
    price: 300,
    badge: '+ ₹ 300',
    description: 'Thermal insulated pack maintaining consistent ambient temperature.',
    icon: Zap,
  },
  {
    id: 'time',
    title: 'Time-Critical Delivery',
    price: 250,
    badge: '+ ₹ 250',
    description: 'Guaranteed express delivery within strict 2-hour delivery window.',
    icon: Clock3,
  },
  {
    id: 'stealth',
    title: 'Stealth Mode',
    price: 100,
    badge: '+ ₹ 100',
    description: 'Discreet unbranded packaging & confidential courier handling.',
    icon: Key,
  },
]

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
  const [servicesFilterTab, setServicesFilterTab] = useState('all')
  const [shipments, setShipments] = useState({ loading: true, error: '', bookings: [], total: 0 })
  const [orderFilter, setOrderFilter] = useState('ALL')

  // Hero Booking Card Tabs & Form State
  const [heroTab, setHeroTab] = useState('book') // 'book' | 'track'
  const [heroPickup, setHeroPickup] = useState('')
  const [heroDrop, setHeroDrop] = useState('')
  const [packageType, setPackageType] = useState('Parcel / Package')
  const [heroTrackingQuery, setHeroTrackingQuery] = useState('')
  const [activeTrackingQuery, setActiveTrackingQuery] = useState('RTPD12873421')
  const [copiedTracking, setCopiedTracking] = useState(false)

  // Dedicated "Book Delivery" Multi-step Flow (matching WhatsApp Screenshot reference)
  const [bookStep, setBookStep] = useState(1) // 1: Service Type, 2: Pickup Details, 3: Delivery Details, 4: Item Details, 5: Review & Pay
  const [bookServiceType, setBookServiceType] = useState('courier')
  const [bookDeliveryMode, setBookDeliveryMode] = useState('standard') // 'standard' | 'express'
  const [bookPickupPref, setBookPickupPref] = useState('schedule') // 'schedule' | 'drop'
  const [bookPickupDate, setBookPickupDate] = useState('18 Aug 2026')
  const [bookPickupSlot, setBookPickupSlot] = useState('10:00 AM – 12:00 PM')
  
  // Step 2: Pickup
  const [bookAddressTab, setBookAddressTab] = useState('saved') // 'saved' | 'new'
  const [bookSavedAddr, setBookSavedAddr] = useState('home') // 'home' | 'office' | 'warehouse'
  const [bookContactName, setBookContactName] = useState('Rohit Sharma')
  const [bookContactPhone, setBookContactPhone] = useState('98765 43210')
  const [bookAltPhone, setBookAltPhone] = useState('')
  const [bookInstructions, setBookInstructions] = useState('')

  // Step 3: Delivery Details
  const [bookDeliveryTab, setBookDeliveryTab] = useState('saved') // 'saved' | 'new'
  const [bookSavedDeliveryAddr, setBookSavedDeliveryAddr] = useState('office') // 'office' | 'client' | 'hub'
  const [bookRecipientName, setBookRecipientName] = useState('Aman Verma')
  const [bookRecipientPhone, setBookRecipientPhone] = useState('98765 43211')
  const [bookRecipientAltPhone, setBookRecipientAltPhone] = useState('')
  const [bookDeliveryAddress, setBookDeliveryAddress] = useState('A-102, Skyline Apartments, Andheri East')
  const [bookDeliveryCity, setBookDeliveryCity] = useState('Mumbai')
  const [bookDeliveryState, setBookDeliveryState] = useState('Maharashtra')
  const [bookDeliveryPincode, setBookDeliveryPincode] = useState('400069')
  const [bookDeliveryLandmark, setBookDeliveryLandmark] = useState('Near Western Express Highway Metro')
  const [bookDeliveryInstructions, setBookDeliveryInstructions] = useState('')

  // Step 4: Item Details, Dimensions, Packaging & Value-Add Services (Screenshots 10.16.32 AM & 10.16.32 AM (1))
  const [bookItemCategory, setBookItemCategory] = useState('Electronics')
  const [bookItemName, setBookItemName] = useState('Laptop (Dell Inspiron 15)')
  const [bookItemQuantity, setBookItemQuantity] = useState(1)
  const [bookDeclaredValue, setBookDeclaredValue] = useState('50000')
  const [bookDimUnit, setBookDimUnit] = useState('cm') // 'cm' | 'in'
  const [bookDimLength, setBookDimLength] = useState('30')
  const [bookDimWidth, setBookDimWidth] = useState('20')
  const [bookDimHeight, setBookDimHeight] = useState('5')
  const [bookWeight, setBookWeight] = useState('2.5')
  const [bookPackagingType, setBookPackagingType] = useState('secure') // 'own' | 'secure' | 'envelope'
  const [bookSpecialHandling, setBookSpecialHandling] = useState('Handle with extreme care. Contains fragile display panel.')
  const [bookSelectedServices, setBookSelectedServices] = useState(['security', 'tamper', 'pod'])

  // Step 5: Review & Pay (Screenshot 10.16.30 AM)
  const [bookPaymentMethod, setBookPaymentMethod] = useState('upi') // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [bookUpiApp, setBookUpiApp] = useState('gpay')
  const [bookUpiId, setBookUpiId] = useState('')
  const [bookCardNumber, setBookCardNumber] = useState('4532 •••• •••• 8921')
  const [bookCardExpiry, setBookCardExpiry] = useState('08/29')
  const [bookCardCvv, setBookCardCvv] = useState('•••')
  const [bookCardName, setBookCardName] = useState('Remo Vivian')
  const [bookAgreeTerms, setBookAgreeTerms] = useState(true)
  const [bookUpiTimer, setBookUpiTimer] = useState(596) // 09:56

  const handleToggleAddonService = (id) => {
    setBookSelectedServices(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    if (bookStep === 5 && bookPaymentMethod === 'upi') {
      const timer = setInterval(() => {
        setBookUpiTimer(prev => (prev > 0 ? prev - 1 : 600))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [bookStep, bookPaymentMethod])

  const formatUpiTimer = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const addOnsTotal = useMemo(() => {
    return bookSelectedServices.reduce((sum, sId) => {
      const match = VALUE_ADDED_SERVICES.find(v => v.id === sId)
      return sum + (match?.price || 0)
    }, 0)
  }, [bookSelectedServices])

  const baseFare = bookServiceType === 'move' ? 890 : bookDeliveryMode === 'express' ? 620 : 420
  const fuelFare = 30
  const subtotalFare = baseFare + fuelFare + addOnsTotal
  const gstFare = Math.round(subtotalFare * 0.18)
  const totalEstimatedFare = subtotalFare + gstFare

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
  const returnsCount = useMemo(() => shipments.bookings.filter((b) => !!b.returnType || (b.bookingNumber && (b.bookingNumber.startsWith('DRVZ-RET') || b.bookingNumber.startsWith('RBK')))).length, [shipments.bookings])

  const filteredBookings = useMemo(() => {
    if (orderFilter === 'IN_TRANSIT') {
      return shipments.bookings.filter((b) => ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'IN_TRANSIT_AIRPORT'].includes(b.status))
    }
    if (orderFilter === 'DELIVERED') {
      return shipments.bookings.filter((b) => b.status === 'DELIVERED')
    }
    if (orderFilter === 'RETURNS') {
      return shipments.bookings.filter((b) => !!b.returnType || (b.bookingNumber && (b.bookingNumber.startsWith('DRVZ-RET') || b.bookingNumber.startsWith('RBK'))))
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
      setActiveNav('book')
      setBookStep(1)
      setSidebarOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (id === 'returns') {
      setActiveNav('orders')
      setOrderFilter('RETURNS')
      setSidebarOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setActiveNav(id)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCopyTrackingId = (id) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(id)
      setCopiedTracking(true)
      setTimeout(() => setCopiedTracking(false), 2000)
    }
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

          {/* DEDICATED BOOK DELIVERY FLOW (Matching WhatsApp Screenshot reference) */}
          {activeNav === 'book' && (
            <section id="book-delivery" className={styles.bookDeliverySection}>
              {/* Top Navigation Row */}
              <div className={styles.bookTopNavRow}>
                <button
                  type="button"
                  className={styles.bookBackBtn}
                  onClick={() => {
                    if (bookStep > 1) {
                      setBookStep(prev => prev - 1)
                    } else {
                      setActiveNav('overview')
                    }
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>{bookStep > 1 ? 'Back to Service Type' : 'Back'}</span>
                </button>

                <button
                  type="button"
                  className={styles.bookNeedHelpBtn}
                  onClick={() => alert('Delvez 24/7 Helpline: 1800-DELVEZ (Toll Free)')}
                >
                  <Headphones size={15} />
                  <span>Need Help?</span>
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className={styles.bookTitleBlock}>
                <h1 className={styles.bookTitle}>
                  {bookStep === 1 && 'Book a Delivery'}
                  {bookStep === 2 && 'Pickup Details'}
                  {bookStep === 3 && 'Delivery Details'}
                  {bookStep === 4 && 'Item Details'}
                  {bookStep === 5 && 'Review & Pay'}
                </h1>
                <p className={styles.bookSubtitle}>
                  {bookStep === 1 && 'Schedule a pickup and get your item delivered, securely and on time.'}
                  {bookStep === 2 && 'Enter the pickup address and contact details.'}
                  {bookStep === 3 && 'Enter the delivery address and recipient contact details.'}
                  {bookStep === 4 && 'Tell us what you are sending for safe and optimized handling.'}
                  {bookStep === 5 && 'Please review your booking details before making payment.'}
                </p>
              </div>

              {/* 5-Step Stepper Rail */}
              <div className={styles.bookStepperRail}>
                {[
                  { num: 1, label: 'Service Type' },
                  { num: 2, label: 'Pickup Details' },
                  { num: 3, label: 'Delivery Details' },
                  { num: 4, label: 'Item Details' },
                  { num: 5, label: 'Review & Pay' },
                ].map((s, idx) => {
                  const isActive = bookStep === s.num
                  const isDone = bookStep > s.num
                  return (
                    <Fragment key={s.num}>
                      <div
                        className={`${styles.bookStepItem} ${isActive ? styles.bookStepActive : ''} ${isDone ? styles.bookStepDone : ''}`}
                        onClick={() => {
                          if (isDone) setBookStep(s.num)
                        }}
                      >
                        <div className={styles.bookStepCircle}>
                          {isDone ? <Check size={14} /> : s.num}
                        </div>
                        <span className={styles.bookStepLabel}>{s.label}</span>
                      </div>
                      {idx < 4 && (
                        <div className={`${styles.bookStepConnector} ${isDone ? styles.connectorDone : ''}`} />
                      )}
                    </Fragment>
                  )
                })}
              </div>

              {/* 2-Column Content Grid */}
              <div className={styles.bookContentGrid}>
                {/* LEFT COLUMN: FORM SECTIONS */}
                <div className={styles.bookLeftCol}>
                  {/* STEP 1: SERVICE SELECTION */}
                  {bookStep === 1 && (
                    <>
                      {/* Select a Service Header */}
                      <div className={styles.bookCard}>
                        <h3 className={styles.bookGroupTitle}>Select a Service</h3>
                        <div className={styles.serviceCardsGrid}>
                          {ALL_DASHBOARD_SERVICES.map((srv) => {
                            const IconComponent = srv.icon || Package
                            const isSelected = bookServiceType === srv.serviceKey
                            return (
                              <div
                                key={srv.id}
                                className={`${styles.serviceChoiceCard} ${isSelected ? styles.choiceSelected : ''}`}
                                onClick={() => setBookServiceType(srv.serviceKey)}
                              >
                                {isSelected && (
                                  <span className={styles.choiceCheckBadge}><Check size={12} /></span>
                                )}
                                <div className={styles.choiceIconWrap} style={{ color: isSelected ? '#fab800' : srv.badgeColor }}>
                                  <IconComponent size={22} />
                                </div>
                                <strong>{srv.title}</strong>
                                <p>{srv.description}</p>
                                <span className={styles.choicePriceTag}>{srv.price}</span>
                              </div>
                            )
                          })}
                        </div>

                        {/* Delivery Mode */}
                        <div className={styles.optionSectionBlock}>
                          <div className={styles.optionBlockHeader}>
                            <strong>Delivery Mode</strong>
                            <span className={styles.infoCircle} title="Speed classification">ⓘ</span>
                          </div>
                          <div className={styles.radioCardsRow}>
                            <label
                              className={`${styles.radioCard} ${bookDeliveryMode === 'standard' ? styles.radioCardActive : ''}`}
                              onClick={() => setBookDeliveryMode('standard')}
                            >
                              <div className={styles.radioDotWrap}>
                                <span className={`${styles.radioDot} ${bookDeliveryMode === 'standard' ? styles.radioDotFilled : ''}`} />
                              </div>
                              <div className={styles.radioCardText}>
                                <strong>Standard Delivery</strong>
                                <p>Cost-effective and reliable delivery (2-3 business days).</p>
                              </div>
                            </label>

                            <label
                              className={`${styles.radioCard} ${bookDeliveryMode === 'express' ? styles.radioCardActive : ''}`}
                              onClick={() => setBookDeliveryMode('express')}
                            >
                              <div className={styles.radioDotWrap}>
                                <span className={`${styles.radioDot} ${bookDeliveryMode === 'express' ? styles.radioDotFilled : ''}`} />
                              </div>
                              <div className={styles.radioCardText}>
                                <strong>Express Priority Delivery</strong>
                                <p>Faster next-day delivery with dedicated VIP handling.</p>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Pickup Preference */}
                        <div className={styles.optionSectionBlock}>
                          <div className={styles.optionBlockHeader}>
                            <strong>Pickup Preference</strong>
                          </div>
                          <div className={styles.radioCardsRow}>
                            <label
                              className={`${styles.radioCard} ${bookPickupPref === 'schedule' ? styles.radioCardActive : ''}`}
                              onClick={() => setBookPickupPref('schedule')}
                            >
                              <div className={styles.radioDotWrap}>
                                <span className={`${styles.radioDot} ${bookPickupPref === 'schedule' ? styles.radioDotFilled : ''}`} />
                              </div>
                              <div className={styles.radioCardIcon}><Calendar size={18} /></div>
                              <div className={styles.radioCardText}>
                                <strong>Schedule a Pickup</strong>
                                <p>Our courier picks up from your doorstep.</p>
                              </div>
                            </label>

                            <label
                              className={`${styles.radioCard} ${bookPickupPref === 'drop' ? styles.radioCardActive : ''}`}
                              onClick={() => setBookPickupPref('drop')}
                            >
                              <div className={styles.radioDotWrap}>
                                <span className={`${styles.radioDot} ${bookPickupPref === 'drop' ? styles.radioDotFilled : ''}`} />
                              </div>
                              <div className={styles.radioCardIcon}><Building size={18} /></div>
                              <div className={styles.radioCardText}>
                                <strong>Drop at Delvez Center</strong>
                                <p>Self drop at your nearest Delvez Logistics Hub.</p>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Pickup Date & Time */}
                        <div className={styles.optionSectionBlock}>
                          <div className={styles.optionBlockHeader}>
                            <strong>Pickup Date &amp; Time</strong>
                          </div>
                          <div className={styles.dateTimeSelectRow}>
                            <div className={styles.dateTimePill}>
                              <Calendar size={16} className={styles.dateTimeIcon} />
                              <select
                                value={bookPickupDate}
                                onChange={(e) => setBookPickupDate(e.target.value)}
                              >
                                <option value="18 Aug 2026">18 Aug 2026 (Today)</option>
                                <option value="19 Aug 2026">19 Aug 2026 (Tomorrow)</option>
                                <option value="20 Aug 2026">20 Aug 2026</option>
                                <option value="21 Aug 2026">21 Aug 2026</option>
                              </select>
                              <ChevronDown size={14} className={styles.selectChevron} />
                            </div>

                            <div className={styles.dateTimePill}>
                              <Clock3 size={16} className={styles.dateTimeIcon} />
                              <select
                                value={bookPickupSlot}
                                onChange={(e) => setBookPickupSlot(e.target.value)}
                              >
                                <option value="10:00 AM – 12:00 PM">10:00 AM – 12:00 PM</option>
                                <option value="12:00 PM – 02:00 PM">12:00 PM – 02:00 PM</option>
                                <option value="02:00 PM – 04:00 PM">02:00 PM – 04:00 PM</option>
                                <option value="04:00 PM – 06:00 PM">04:00 PM – 06:00 PM</option>
                              </select>
                              <ChevronDown size={14} className={styles.selectChevron} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Good to Know Info Card with Box Image */}
                      <div className={styles.goodToKnowCard}>
                        <div className={styles.goodToKnowLeft}>
                          <div className={styles.goodToKnowIcon}><Info size={20} /></div>
                          <div>
                            <strong>Good to Know</strong>
                            <ul>
                              <li>Ensure your item is properly packed for safe transit.</li>
                              <li>Our courier executive will call you 15 minutes before arrival.</li>
                              <li>You can track live milestones and rider GPS in real time.</li>
                            </ul>
                          </div>
                        </div>
                        <div className={styles.delvezBoxThumb}>
                          <div className={styles.boxMockup}>
                            <span>DELVEZ</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* STEP 2: PICKUP DETAILS */}
                  {bookStep === 2 && (
                    <div className={styles.bookCard}>
                      <h3 className={styles.bookGroupTitle}>Pickup Address</h3>

                      {/* Tab switch */}
                      <div className={styles.addressTabRow}>
                        <button
                          type="button"
                          className={`${styles.addrTab} ${bookAddressTab === 'saved' ? styles.addrTabActive : ''}`}
                          onClick={() => setBookAddressTab('saved')}
                        >
                          {bookAddressTab === 'saved' && <Check size={14} className={styles.tabCheckIcon} />}
                          <span>Use Saved Address</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.addrTab} ${bookAddressTab === 'new' ? styles.addrTabActive : ''}`}
                          onClick={() => setBookAddressTab('new')}
                        >
                          <MapPin size={14} />
                          <span>Enter New Address</span>
                        </button>
                      </div>

                      {/* Saved Addresses & Map Preview Row */}
                      <div className={styles.addressAndMapRow}>
                        {/* Saved Addresses List */}
                        <div className={styles.savedAddressesCol}>
                          <div className={styles.savedHeader}>
                            <strong>Saved Addresses</strong>
                            <button
                              type="button"
                              className={styles.manageAddrLink}
                              onClick={() => setActiveNav('addresses')}
                            >
                              Manage Addresses
                            </button>
                          </div>

                          <label
                            className={`${styles.savedAddrCard} ${bookSavedAddr === 'home' ? styles.savedCardSelected : ''}`}
                            onClick={() => setBookSavedAddr('home')}
                          >
                            <div className={styles.radioDotWrap}>
                              <span className={`${styles.radioDot} ${bookSavedAddr === 'home' ? styles.radioDotFilled : ''}`} />
                            </div>
                            <div className={styles.savedAddrIcon}><Home size={18} /></div>
                            <div className={styles.savedAddrDetails}>
                              <div className={styles.savedAddrTop}>
                                <strong>Home</strong>
                                <button type="button" className={styles.editAddrBtn}>Edit</button>
                              </div>
                              <p>#412, 12th Main Road, Indiranagar, Bengaluru – 560038</p>
                            </div>
                          </label>

                          <label
                            className={`${styles.savedAddrCard} ${bookSavedAddr === 'office' ? styles.savedCardSelected : ''}`}
                            onClick={() => setBookSavedAddr('office')}
                          >
                            <div className={styles.radioDotWrap}>
                              <span className={`${styles.radioDot} ${bookSavedAddr === 'office' ? styles.radioDotFilled : ''}`} />
                            </div>
                            <div className={styles.savedAddrIcon}><Building size={18} /></div>
                            <div className={styles.savedAddrDetails}>
                              <div className={styles.savedAddrTop}>
                                <strong>Office</strong>
                                <button type="button" className={styles.editAddrBtn}>Edit</button>
                              </div>
                              <p>Prestige Tech Park, Outer Ring Road, Marathahalli, Bengaluru – 560103</p>
                            </div>
                          </label>

                          <label
                            className={`${styles.savedAddrCard} ${bookSavedAddr === 'warehouse' ? styles.savedCardSelected : ''}`}
                            onClick={() => setBookSavedAddr('warehouse')}
                          >
                            <div className={styles.radioDotWrap}>
                              <span className={`${styles.radioDot} ${bookSavedAddr === 'warehouse' ? styles.radioDotFilled : ''}`} />
                            </div>
                            <div className={styles.savedAddrIcon}><Truck size={18} /></div>
                            <div className={styles.savedAddrDetails}>
                              <div className={styles.savedAddrTop}>
                                <strong>Warehouse Hub</strong>
                                <button type="button" className={styles.editAddrBtn}>Edit</button>
                              </div>
                              <p>Sector 4, HSR Layout, Bengaluru – 560102</p>
                            </div>
                          </label>
                        </div>

                        {/* Interactive Map Visual */}
                        <div className={styles.pickupMapVisual}>
                          <div className={styles.mapPinBadge}>
                            <div className={styles.mapPinHead}>
                              <strong>{bookSavedAddr === 'home' ? 'Home' : bookSavedAddr === 'office' ? 'Office' : 'Warehouse Hub'}</strong>
                              <span className={styles.mapPinEdit}>Verified</span>
                            </div>
                            <p>{bookSavedAddr === 'home' ? '#412, 12th Main Road, Indiranagar, Bengaluru - 560038' : bookSavedAddr === 'office' ? 'Prestige Tech Park, Outer Ring Road, Bengaluru' : 'Sector 4, HSR Layout, Bengaluru - 560102'}</p>
                          </div>

                          {/* Map Pin Point */}
                          <div className={styles.mapActualPin}>
                            <div className={styles.pinCircle}><MapPin size={16} /></div>
                          </div>

                          {/* Zoom buttons */}
                          <div className={styles.mapZoomOverlay}>
                            <button type="button">+</button>
                            <button type="button">−</button>
                          </div>

                          {/* Google Maps Button */}
                          <button
                            type="button"
                            className={styles.mapGmapsMiniBtn}
                            onClick={() => window.open('https://maps.google.com/?q=Indiranagar+Bengaluru', '_blank')}
                          >
                            <Navigation size={13} />
                            <span>View on Google Maps</span>
                          </button>
                        </div>
                      </div>

                      {/* Pickup Contact Form Fields */}
                      <div className={styles.pickupContactSection}>
                        <h4 className={styles.contactSectionTitle}>Pickup Contact</h4>
                        <div className={styles.contactInputsRow}>
                          <div className={styles.inputFieldBlock}>
                            <label>Contact Name *</label>
                            <input
                              type="text"
                              value={bookContactName}
                              onChange={(e) => setBookContactName(e.target.value)}
                              placeholder="Rohit Sharma"
                            />
                          </div>

                          <div className={styles.inputFieldBlock}>
                            <label>Phone Number *</label>
                            <div className={styles.phoneInputPill}>
                              <span className={styles.phoneCode}>+91</span>
                              <input
                                type="text"
                                value={bookContactPhone}
                                onChange={(e) => setBookContactPhone(e.target.value)}
                                placeholder="98765 43210"
                              />
                            </div>
                          </div>

                          <div className={styles.inputFieldBlock}>
                            <label>Alternate Phone (Optional)</label>
                            <div className={styles.phoneInputPill}>
                              <span className={styles.phoneCode}>+91</span>
                              <input
                                type="text"
                                value={bookAltPhone}
                                onChange={(e) => setBookAltPhone(e.target.value)}
                                placeholder="Enter alternate number"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Pickup Instructions */}
                        <div className={styles.instructionsBlock}>
                          <label>Pickup Instructions (Optional)</label>
                          <textarea
                            value={bookInstructions}
                            onChange={(e) => setBookInstructions(e.target.value.slice(0, 200))}
                            placeholder="E.g. Ring the bell, call before pickup, landmark, security check, etc."
                            rows={3}
                          />
                          <span className={styles.charCount}>{bookInstructions.length}/200</span>
                        </div>

                        {/* Pickup Readiness Banner */}
                        <div className={styles.readinessBanner}>
                          <Info size={18} className={styles.readinessIcon} />
                          <div>
                            <strong>Pickup Readiness</strong>
                            <p>Keep your item ready and well packed at the selected time to ensure a smooth pickup experience.</p>
                          </div>
                        </div>

                        {/* Bottom Back Button */}
                        <div className={styles.step2BottomRow}>
                          <button
                            type="button"
                            className={styles.plainBackBtn}
                            onClick={() => setBookStep(1)}
                          >
                            ← Back
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: DELIVERY DETAILS (Redesigned with saved addresses, map & recipient fields) */}
                  {bookStep === 3 && (
                    <div className={styles.bookCard}>
                      <h3 className={styles.bookGroupTitle}>Delivery Details</h3>
                      <p className={styles.bookCardSub}>Where should we deliver this parcel?</p>

                      {/* Tab switch */}
                      <div className={styles.addressTabRow}>
                        <button
                          type="button"
                          className={`${styles.addrTab} ${bookDeliveryTab === 'saved' ? styles.addrTabActive : ''}`}
                          onClick={() => setBookDeliveryTab('saved')}
                        >
                          {bookDeliveryTab === 'saved' && <Check size={14} className={styles.tabCheckIcon} />}
                          <span>Use Saved Address</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.addrTab} ${bookDeliveryTab === 'new' ? styles.addrTabActive : ''}`}
                          onClick={() => setBookDeliveryTab('new')}
                        >
                          <MapPin size={14} />
                          <span>Enter New Address</span>
                        </button>
                      </div>

                      {/* Saved Addresses & Map Preview Row */}
                      <div className={styles.addressAndMapRow}>
                        {/* Saved Addresses List */}
                        <div className={styles.savedAddressesCol}>
                          <div className={styles.savedHeader}>
                            <strong>Frequent Drop Destinations</strong>
                            <button
                              type="button"
                              className={styles.manageAddrLink}
                              onClick={() => setActiveNav('addresses')}
                            >
                              Manage Book
                            </button>
                          </div>

                          <label
                            className={`${styles.savedAddrCard} ${bookSavedDeliveryAddr === 'office' ? styles.savedCardSelected : ''}`}
                            onClick={() => {
                              setBookSavedDeliveryAddr('office')
                              setBookDeliveryAddress('A-102, Skyline Apartments, Andheri East')
                              setBookDeliveryCity('Mumbai')
                              setBookDeliveryState('Maharashtra')
                              setBookDeliveryPincode('400069')
                              setBookRecipientName('Aman Verma')
                            }}
                          >
                            <div className={styles.radioDotWrap}>
                              <span className={`${styles.radioDot} ${bookSavedDeliveryAddr === 'office' ? styles.radioDotFilled : ''}`} />
                            </div>
                            <div className={styles.savedAddrIcon}><Building size={18} /></div>
                            <div className={styles.savedAddrDetails}>
                              <div className={styles.savedAddrTop}>
                                <strong>Office (Mumbai)</strong>
                                <span className={styles.defaultBadgeSmall}>Primary</span>
                              </div>
                              <p>A-102, Skyline Apartments, Andheri East, Mumbai – 400069</p>
                            </div>
                          </label>

                          <label
                            className={`${styles.savedAddrCard} ${bookSavedDeliveryAddr === 'client' ? styles.savedCardSelected : ''}`}
                            onClick={() => {
                              setBookSavedDeliveryAddr('client')
                              setBookDeliveryAddress('Plot 45, Barakhamba Road, Connaught Place')
                              setBookDeliveryCity('New Delhi')
                              setBookDeliveryState('Delhi')
                              setBookDeliveryPincode('110001')
                              setBookRecipientName('Priya Sharma')
                            }}
                          >
                            <div className={styles.radioDotWrap}>
                              <span className={`${styles.radioDot} ${bookSavedDeliveryAddr === 'client' ? styles.radioDotFilled : ''}`} />
                            </div>
                            <div className={styles.savedAddrIcon}><Home size={18} /></div>
                            <div className={styles.savedAddrDetails}>
                              <div className={styles.savedAddrTop}>
                                <strong>Client HQ (Delhi)</strong>
                              </div>
                              <p>Plot 45, Barakhamba Road, Connaught Place, New Delhi – 110001</p>
                            </div>
                          </label>

                          <label
                            className={`${styles.savedAddrCard} ${bookSavedDeliveryAddr === 'hub' ? styles.savedCardSelected : ''}`}
                            onClick={() => {
                              setBookSavedDeliveryAddr('hub')
                              setBookDeliveryAddress('14/B, Mount Road, Anna Salai')
                              setBookDeliveryCity('Chennai')
                              setBookDeliveryState('Tamil Nadu')
                              setBookDeliveryPincode('600002')
                              setBookRecipientName('Karthik Raja')
                            }}
                          >
                            <div className={styles.radioDotWrap}>
                              <span className={`${styles.radioDot} ${bookSavedDeliveryAddr === 'hub' ? styles.radioDotFilled : ''}`} />
                            </div>
                            <div className={styles.savedAddrIcon}><Truck size={18} /></div>
                            <div className={styles.savedAddrDetails}>
                              <div className={styles.savedAddrTop}>
                                <strong>Regional Hub (Chennai)</strong>
                              </div>
                              <p>14/B, Mount Road, Anna Salai, Chennai – 600002</p>
                            </div>
                          </label>
                        </div>

                        {/* Interactive Destination Map Visual */}
                        <div className={styles.pickupMapVisual}>
                          <div className={styles.mapPinBadge}>
                            <div className={styles.mapPinHead}>
                              <strong>{bookDeliveryCity}, {bookDeliveryState}</strong>
                              <span className={styles.mapPinEdit}>Destination</span>
                            </div>
                            <p>{bookDeliveryAddress}, {bookDeliveryCity} - {bookDeliveryPincode}</p>
                          </div>

                          {/* Map Pin Point */}
                          <div className={styles.mapActualPin}>
                            <div className={styles.pinCircle} style={{ background: '#0284c7', color: '#ffffff' }}>
                              <MapPin size={16} />
                            </div>
                          </div>

                          {/* Zoom buttons */}
                          <div className={styles.mapZoomOverlay}>
                            <button type="button">+</button>
                            <button type="button">−</button>
                          </div>

                          {/* Google Maps Button */}
                          <button
                            type="button"
                            className={styles.mapGmapsMiniBtn}
                            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(`${bookDeliveryAddress} ${bookDeliveryCity}`)}`, '_blank')}
                          >
                            <Navigation size={13} />
                            <span>View on Google Maps</span>
                          </button>
                        </div>
                      </div>

                      {/* Recipient Details */}
                      <div className={styles.pickupContactSection}>
                        <h4 className={styles.contactSectionTitle}>Recipient Information</h4>
                        <div className={styles.contactInputsRow}>
                          <div className={styles.inputFieldBlock}>
                            <label>Recipient Full Name *</label>
                            <input
                              type="text"
                              value={bookRecipientName}
                              onChange={(e) => setBookRecipientName(e.target.value)}
                              placeholder="e.g. Aman Verma"
                            />
                          </div>

                          <div className={styles.inputFieldBlock}>
                            <label>Recipient Phone Number *</label>
                            <div className={styles.phoneInputPill}>
                              <span className={styles.phoneCode}>+91</span>
                              <input
                                type="text"
                                value={bookRecipientPhone}
                                onChange={(e) => setBookRecipientPhone(e.target.value)}
                                placeholder="98765 43211"
                              />
                            </div>
                          </div>

                          <div className={styles.inputFieldBlock}>
                            <label>Alternate Number (Optional)</label>
                            <div className={styles.phoneInputPill}>
                              <span className={styles.phoneCode}>+91</span>
                              <input
                                type="text"
                                value={bookRecipientAltPhone}
                                onChange={(e) => setBookRecipientAltPhone(e.target.value)}
                                placeholder="e.g. 98765 00000"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Delivery Address Lines */}
                        <div className={styles.inputFieldBlock} style={{ marginBottom: '14px' }}>
                          <label>Delivery Address Line *</label>
                          <input
                            type="text"
                            value={bookDeliveryAddress}
                            onChange={(e) => setBookDeliveryAddress(e.target.value)}
                            placeholder="Flat/House No., Building Name, Street"
                          />
                        </div>

                        <div className={styles.contactInputsRow}>
                          <div className={styles.inputFieldBlock}>
                            <label>City *</label>
                            <input
                              type="text"
                              value={bookDeliveryCity}
                              onChange={(e) => setBookDeliveryCity(e.target.value)}
                              placeholder="City"
                            />
                          </div>
                          <div className={styles.inputFieldBlock}>
                            <label>State *</label>
                            <input
                              type="text"
                              value={bookDeliveryState}
                              onChange={(e) => setBookDeliveryState(e.target.value)}
                              placeholder="State"
                            />
                          </div>
                          <div className={styles.inputFieldBlock}>
                            <label>Pincode *</label>
                            <input
                              type="text"
                              value={bookDeliveryPincode}
                              onChange={(e) => setBookDeliveryPincode(e.target.value)}
                              placeholder="Pincode (e.g. 400069)"
                            />
                          </div>
                        </div>

                        <div className={styles.inputFieldBlock} style={{ marginBottom: '14px' }}>
                          <label>Landmark (Optional)</label>
                          <input
                            type="text"
                            value={bookDeliveryLandmark}
                            onChange={(e) => setBookDeliveryLandmark(e.target.value)}
                            placeholder="e.g. Near Metro Station / Opposite Bank"
                          />
                        </div>

                        {/* Delivery Instructions */}
                        <div className={styles.instructionsBlock}>
                          <label>Delivery Instructions (Optional)</label>
                          <textarea
                            value={bookDeliveryInstructions}
                            onChange={(e) => setBookDeliveryInstructions(e.target.value.slice(0, 200))}
                            placeholder="E.g. Leave with reception, call before delivery, gate code, etc."
                            rows={2}
                          />
                          <span className={styles.charCount}>{bookDeliveryInstructions.length}/200</span>
                        </div>

                        {/* Safety Notice Banner */}
                        <div className={styles.readinessBanner} style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                          <ShieldCheck size={18} style={{ color: '#16a34a', flexShrink: 0, marginTop: 1 }} />
                          <div>
                            <strong style={{ color: '#166534' }}>Safe &amp; Verified Delivery</strong>
                            <p style={{ color: '#15803d' }}>
                              Recipient will receive a secure 4-digit OTP via SMS on arrival to ensure safe handover.
                            </p>
                          </div>
                        </div>

                        {/* Bottom Back Button */}
                        <div className={styles.step2BottomRow}>
                          <button
                            type="button"
                            className={styles.plainBackBtn}
                            onClick={() => setBookStep(2)}
                          >
                            ← Back
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: ITEM DETAILS, PACKAGING & VALUE-ADDED SERVICES (Exact match to Screenshots 10.16.32 AM & 10.16.32 AM (1)) */}
                  {bookStep === 4 && (
                    <div className={styles.bookCard}>
                      <h3 className={styles.bookGroupTitle}>Item Information &amp; Dimensions</h3>
                      <p className={styles.bookCardSub}>Tell us what you are sending for safe and optimized handling.</p>

                      {/* SECTION 1: ITEM INFORMATION */}
                      <div className={styles.formSectionContainer}>
                        <h4 className={styles.formSectionHeading}>1. Item Information</h4>
                        <div className={styles.contactInputsRow}>
                          <div className={styles.inputFieldBlock}>
                            <label>Item Category *</label>
                            <select
                              value={bookItemCategory}
                              onChange={(e) => setBookItemCategory(e.target.value)}
                              className={styles.styledSelect}
                            >
                              <option value="Electronics">Electronics &amp; Gadgets</option>
                              <option value="Documents">Documents &amp; Legal Papers</option>
                              <option value="Clothing">Clothing &amp; Lifestyle</option>
                              <option value="Valuables">Valuables &amp; Jewelry</option>
                              <option value="Medicine">Medicine &amp; Healthcare</option>
                              <option value="Books">Books &amp; Stationery</option>
                              <option value="Household">Household Goods</option>
                              <option value="Industrial">Industrial &amp; Commercial</option>
                              <option value="Other">Other Goods</option>
                            </select>
                          </div>

                          <div className={styles.inputFieldBlock}>
                            <label>Item Description / Model *</label>
                            <input
                              type="text"
                              value={bookItemName}
                              onChange={(e) => setBookItemName(e.target.value)}
                              placeholder="e.g. Dell Inspiron 15 / Legal Deed"
                            />
                          </div>

                          <div className={styles.inputFieldBlock}>
                            <label>Quantity *</label>
                            <input
                              type="number"
                              min="1"
                              value={bookItemQuantity}
                              onChange={(e) => setBookItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            />
                          </div>
                        </div>

                        <div className={styles.inputFieldBlock} style={{ maxWidth: '300px', marginBottom: '16px' }}>
                          <label>Declared Value (₹) *</label>
                          <div className={styles.phoneInputPill}>
                            <span className={styles.phoneCode}>₹</span>
                            <input
                              type="number"
                              value={bookDeclaredValue}
                              onChange={(e) => setBookDeclaredValue(e.target.value)}
                              placeholder="50000"
                            />
                          </div>
                        </div>
                      </div>

                      {/* SECTION 2: DIMENSIONS & WEIGHT (Screenshot 10.16.32 AM) */}
                      <div className={styles.formSectionContainer}>
                        <div className={styles.sectionHeaderWithToggle}>
                          <h4 className={styles.formSectionHeading}>2. Dimensions &amp; Weight</h4>
                          <div className={styles.unitToggleGroup}>
                            <span className={styles.unitToggleLabel}>Unit:</span>
                            <div className={styles.unitTogglePill}>
                              <button
                                type="button"
                                className={`${styles.unitToggleBtn} ${bookDimUnit === 'cm' ? styles.unitBtnActive : ''}`}
                                onClick={() => setBookDimUnit('cm')}
                              >
                                cm
                              </button>
                              <button
                                type="button"
                                className={`${styles.unitToggleBtn} ${bookDimUnit === 'in' ? styles.unitBtnActive : ''}`}
                                onClick={() => setBookDimUnit('in')}
                              >
                                in
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 4 Dimension Inputs Grid */}
                        <div className={styles.dimInputsGrid}>
                          <div className={styles.dimInputBlock}>
                            <label>Length ({bookDimUnit}) *</label>
                            <input
                              type="number"
                              step="0.5"
                              value={bookDimLength}
                              onChange={(e) => setBookDimLength(e.target.value)}
                              placeholder="30"
                            />
                          </div>

                          <div className={styles.dimInputBlock}>
                            <label>Width ({bookDimUnit}) *</label>
                            <input
                              type="number"
                              step="0.5"
                              value={bookDimWidth}
                              onChange={(e) => setBookDimWidth(e.target.value)}
                              placeholder="20"
                            />
                          </div>

                          <div className={styles.dimInputBlock}>
                            <label>Height ({bookDimUnit}) *</label>
                            <input
                              type="number"
                              step="0.5"
                              value={bookDimHeight}
                              onChange={(e) => setBookDimHeight(e.target.value)}
                              placeholder="5"
                            />
                          </div>

                          <div className={styles.dimInputBlock}>
                            <label>Weight (kg) *</label>
                            <input
                              type="number"
                              step="0.1"
                              value={bookWeight}
                              onChange={(e) => setBookWeight(e.target.value)}
                              placeholder="2.5"
                            />
                          </div>
                        </div>

                        {/* Blue Note Banner matching reference */}
                        <div className={styles.dimInfoAlert}>
                          <Info size={16} className={styles.dimInfoIcon} />
                          <span>Ensure accurate dimensions and weight to avoid pickup delays or discrepancy surcharges.</span>
                        </div>
                      </div>

                      {/* SECTION 3: PACKAGING DETAILS (Screenshot 10.16.32 AM) */}
                      <div className={styles.formSectionContainer}>
                        <h4 className={styles.formSectionHeading}>3. Packaging Details</h4>
                        <div className={styles.packagingCardsGrid}>
                          <label
                            className={`${styles.packagingCard} ${bookPackagingType === 'own' ? styles.packagingCardActive : ''}`}
                            onClick={() => setBookPackagingType('own')}
                          >
                            <div className={styles.packagingCardTop}>
                              <div className={styles.radioDotWrap}>
                                <span className={`${styles.radioDot} ${bookPackagingType === 'own' ? styles.radioDotFilled : ''}`} />
                              </div>
                              <Package size={20} className={styles.packagingIcon} />
                            </div>
                            <strong>My Own Packaging</strong>
                            <p>I will pack the item securely myself before the courier arrives.</p>
                          </label>

                          <label
                            className={`${styles.packagingCard} ${bookPackagingType === 'secure' ? styles.packagingCardActive : ''}`}
                            onClick={() => setBookPackagingType('secure')}
                          >
                            <div className={styles.packagingCardTop}>
                              <div className={styles.radioDotWrap}>
                                <span className={`${styles.radioDot} ${bookPackagingType === 'secure' ? styles.radioDotFilled : ''}`} />
                              </div>
                              <ShieldCheck size={20} className={styles.packagingIcon} />
                            </div>
                            <strong>Delvez Secure Packaging</strong>
                            <p>Tamper-evident bubble padded bag with barcode seal provided by courier.</p>
                            <span className={styles.packagingTagGold}>Recommended</span>
                          </label>

                          <label
                            className={`${styles.packagingCard} ${bookPackagingType === 'envelope' ? styles.packagingCardActive : ''}`}
                            onClick={() => setBookPackagingType('envelope')}
                          >
                            <div className={styles.packagingCardTop}>
                              <div className={styles.radioDotWrap}>
                                <span className={`${styles.radioDot} ${bookPackagingType === 'envelope' ? styles.radioDotFilled : ''}`} />
                              </div>
                              <Mail size={20} className={styles.packagingIcon} />
                            </div>
                            <strong>Document Envelope</strong>
                            <p>Rigid tear-resistant cardboard envelope specially crafted for paper documents.</p>
                          </label>
                        </div>
                      </div>

                      {/* SECTION 4: SPECIAL HANDLING INSTRUCTIONS */}
                      <div className={styles.formSectionContainer}>
                        <h4 className={styles.formSectionHeading}>4. Special Handling Instructions</h4>
                        <div className={styles.instructionsBlock}>
                          <textarea
                            value={bookSpecialHandling}
                            onChange={(e) => setBookSpecialHandling(e.target.value.slice(0, 500))}
                            placeholder="E.g., Fragile item, keep upright, do not bend, handle with extreme care, high-value electronics."
                            rows={3}
                          />
                          <span className={styles.charCount}>{bookSpecialHandling.length}/500</span>
                        </div>
                      </div>

                      {/* SECTION 5: ADD ADDITIONAL SERVICES (Screenshot 10.16.32 AM (1)) */}
                      <div className={styles.formSectionContainer} style={{ borderBottom: 'none', marginBottom: 0 }}>
                        <div className={styles.sectionHeaderCol}>
                          <h4 className={styles.formSectionHeading}>5. Add Additional Services</h4>
                          <p className={styles.formSectionSub}>
                            Choose optional services for extra security, convenience, and care.
                          </p>
                        </div>

                        {/* 3x3 Grid of Value-Added Services */}
                        <div className={styles.addonsGrid}>
                          {VALUE_ADDED_SERVICES.map((addon) => {
                            const IconCmp = addon.icon || Sparkles
                            const isChecked = bookSelectedServices.includes(addon.id)
                            return (
                              <div
                                key={addon.id}
                                className={`${styles.addonCard} ${isChecked ? styles.addonCardActive : ''}`}
                                onClick={() => handleToggleAddonService(addon.id)}
                              >
                                <div className={styles.addonCardTop}>
                                  <div className={styles.addonIconBox}>
                                    <IconCmp size={18} />
                                  </div>
                                  <div className={`${styles.addonCheckbox} ${isChecked ? styles.addonCheckboxChecked : ''}`}>
                                    {isChecked && <Check size={12} />}
                                  </div>
                                </div>
                                <h5 className={styles.addonTitle}>{addon.title}</h5>
                                <p className={styles.addonDesc}>{addon.description}</p>
                                <div className={styles.addonPriceBadge}>{addon.badge}</div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Active Selected Services Chips Row */}
                        {bookSelectedServices.length > 0 && (
                          <div className={styles.selectedAddonsBox}>
                            <span className={styles.selectedAddonsLabel}>Active Add-ons ({bookSelectedServices.length}):</span>
                            <div className={styles.selectedChipsList}>
                              {bookSelectedServices.map((sId) => {
                                const matched = VALUE_ADDED_SERVICES.find((v) => v.id === sId)
                                if (!matched) return null
                                return (
                                  <span key={sId} className={styles.serviceChipPill}>
                                    <strong>{matched.title}</strong>
                                    <small>{matched.badge}</small>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleToggleAddonService(sId)
                                      }}
                                    >
                                      <X size={12} />
                                    </button>
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Bottom Back Button */}
                        <div className={styles.step2BottomRow} style={{ marginTop: '20px' }}>
                          <button
                            type="button"
                            className={styles.plainBackBtn}
                            onClick={() => setBookStep(3)}
                          >
                            ← Back
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: REVIEW & PAY (Exact match to Screenshot 10.16.30 AM) */}
                  {bookStep === 5 && (
                    <div className={styles.bookCard}>
                      <h3 className={styles.bookGroupTitle}>Review &amp; Pay</h3>
                      <p className={styles.bookCardSub}>Please review your booking details before making payment.</p>

                      {/* Top Review Details Card matching reference */}
                      <div className={styles.reviewBannerCard}>
                        <div className={styles.reviewRouteRow}>
                          <div className={styles.reviewRouteNode}>
                            <MapPin size={16} style={{ color: '#fab800' }} />
                            <div>
                              <small>Pickup Origin</small>
                              <strong>Indiranagar, Bengaluru – 560038</strong>
                            </div>
                          </div>
                          <div className={styles.reviewRouteDivider}>
                            <ArrowRight size={16} />
                          </div>
                          <div className={styles.reviewRouteNode}>
                            <MapPinned size={16} style={{ color: '#0284c7' }} />
                            <div>
                              <small>Drop Destination</small>
                              <strong>{bookDeliveryCity}, {bookDeliveryState} – {bookDeliveryPincode}</strong>
                            </div>
                          </div>
                        </div>

                        <div className={styles.reviewTagsRow}>
                          <span className={styles.reviewTagPill}>
                            <Package size={12} /> {bookItemCategory}
                          </span>
                          <span className={styles.reviewTagPill}>
                            <Truck size={12} /> {bookDeliveryMode === 'standard' ? 'Standard Delivery' : 'Express Priority'}
                          </span>
                          <span className={styles.reviewTagPill}>
                            {bookWeight} kg • {bookDimLength}×{bookDimWidth}×{bookDimHeight} {bookDimUnit}
                          </span>
                          <span className={styles.reviewTagPill}>
                            <ShieldCheck size={12} /> {bookPackagingType === 'secure' ? 'Secure Seal Bag' : bookPackagingType === 'envelope' ? 'Document Envelope' : 'Own Packaging'}
                          </span>
                          {bookSelectedServices.length > 0 && (
                            <span className={styles.reviewTagPill} style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}>
                              +{bookSelectedServices.length} Value Services
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Payment Method Selection Row (2 Columns: Methods on Left, Details/QR on Right) */}
                      <div className={styles.payLayoutGrid}>
                        {/* Left Column: Radio Cards */}
                        <div className={styles.payMethodsCol}>
                          <h4 className={styles.payColTitle}>Payment Method</h4>

                          {/* 1. UPI */}
                          <label
                            className={`${styles.payOptionCard} ${bookPaymentMethod === 'upi' ? styles.payOptionActive : ''}`}
                            onClick={() => setBookPaymentMethod('upi')}
                          >
                            <div className={styles.radioDotWrap}>
                              <span className={`${styles.radioDot} ${bookPaymentMethod === 'upi' ? styles.radioDotFilled : ''}`} />
                            </div>
                            <div className={styles.payOptionIconWrap}><QrCode size={18} /></div>
                            <div className={styles.payOptionText}>
                              <strong>UPI (GPay / PhonePe / QR)</strong>
                              <small>Fast, zero-fee instant QR scan</small>
                            </div>
                          </label>

                          {/* 2. Credit/Debit Card */}
                          <label
                            className={`${styles.payOptionCard} ${bookPaymentMethod === 'card' ? styles.payOptionActive : ''}`}
                            onClick={() => setBookPaymentMethod('card')}
                          >
                            <div className={styles.radioDotWrap}>
                              <span className={`${styles.radioDot} ${bookPaymentMethod === 'card' ? styles.radioDotFilled : ''}`} />
                            </div>
                            <div className={styles.payOptionIconWrap}><CreditCard size={18} /></div>
                            <div className={styles.payOptionText}>
                              <strong>Credit / Debit Card</strong>
                              <small>Visa, MasterCard, RuPay, Amex</small>
                            </div>
                          </label>

                          {/* 3. Net Banking */}
                          <label
                            className={`${styles.payOptionCard} ${bookPaymentMethod === 'netbanking' ? styles.payOptionActive : ''}`}
                            onClick={() => setBookPaymentMethod('netbanking')}
                          >
                            <div className={styles.radioDotWrap}>
                              <span className={`${styles.radioDot} ${bookPaymentMethod === 'netbanking' ? styles.radioDotFilled : ''}`} />
                            </div>
                            <div className={styles.payOptionIconWrap}><Building size={18} /></div>
                            <div className={styles.payOptionText}>
                              <strong>Net Banking</strong>
                              <small>All Indian Banks Supported</small>
                            </div>
                          </label>

                          {/* 4. Delvez Money Wallet */}
                          <label
                            className={`${styles.payOptionCard} ${bookPaymentMethod === 'wallet' ? styles.payOptionActive : ''}`}
                            onClick={() => setBookPaymentMethod('wallet')}
                          >
                            <div className={styles.radioDotWrap}>
                              <span className={`${styles.radioDot} ${bookPaymentMethod === 'wallet' ? styles.radioDotFilled : ''}`} />
                            </div>
                            <div className={styles.payOptionIconWrap}><Wallet size={18} /></div>
                            <div className={styles.payOptionText}>
                              <strong>Delvez Money Wallet</strong>
                              <small>Balance: ₹{walletBalance.toLocaleString('en-IN')}</small>
                            </div>
                          </label>
                        </div>

                        {/* Right Column: Dynamic Payment Details matching screenshot */}
                        <div className={styles.payDetailsCol}>
                          {bookPaymentMethod === 'upi' && (
                            <div className={styles.upiContainerCard}>
                              {/* UPI Apps Bar */}
                              <div className={styles.upiAppsRow}>
                                {[
                                  { id: 'gpay', label: 'Google Pay', color: '#4285F4' },
                                  { id: 'phonepe', label: 'PhonePe', color: '#5f259f' },
                                  { id: 'paytm', label: 'Paytm', color: '#00BAF2' },
                                  { id: 'bhim', label: 'BHIM UPI', color: '#00833F' },
                                ].map((app) => (
                                  <button
                                    key={app.id}
                                    type="button"
                                    className={`${styles.upiAppBtn} ${bookUpiApp === app.id ? styles.upiAppActive : ''}`}
                                    onClick={() => setBookUpiApp(app.id)}
                                  >
                                    <span className={styles.upiAppDot} style={{ background: app.color }} />
                                    <span>{app.label}</span>
                                  </button>
                                ))}
                              </div>

                              {/* QR Code Canvas Card */}
                              <div className={styles.qrVisualContainer}>
                                <div className={styles.qrCodeBox}>
                                  <svg className={styles.qrSvg} viewBox="0 0 160 160">
                                    {/* Simulated crisp high-contrast QR pattern */}
                                    <rect width="160" height="160" fill="#ffffff" />
                                    {/* Top-left corner */}
                                    <rect x="12" y="12" width="40" height="40" fill="#0d0f12" rx="4" />
                                    <rect x="20" y="20" width="24" height="24" fill="#ffffff" rx="2" />
                                    <rect x="26" y="26" width="12" height="12" fill="#0d0f12" rx="1" />
                                    {/* Top-right corner */}
                                    <rect x="108" y="12" width="40" height="40" fill="#0d0f12" rx="4" />
                                    <rect x="116" y="20" width="24" height="24" fill="#ffffff" rx="2" />
                                    <rect x="122" y="26" width="12" height="12" fill="#0d0f12" rx="1" />
                                    {/* Bottom-left corner */}
                                    <rect x="12" y="108" width="40" height="40" fill="#0d0f12" rx="4" />
                                    <rect x="20" y="116" width="24" height="24" fill="#ffffff" rx="2" />
                                    <rect x="26" y="122" width="12" height="12" fill="#0d0f12" rx="1" />
                                    {/* Data dots */}
                                    <rect x="60" y="20" width="8" height="8" fill="#0d0f12" />
                                    <rect x="74" y="20" width="14" height="8" fill="#0d0f12" />
                                    <rect x="60" y="34" width="28" height="8" fill="#0d0f12" />
                                    <rect x="94" y="20" width="8" height="22" fill="#0d0f12" />
                                    <rect x="20" y="60" width="14" height="8" fill="#0d0f12" />
                                    <rect x="40" y="60" width="8" height="14" fill="#0d0f12" />
                                    <rect x="12" y="74" width="8" height="28" fill="#0d0f12" />
                                    <rect x="26" y="80" width="22" height="8" fill="#0d0f12" />
                                    <rect x="60" y="60" width="10" height="10" fill="#0d0f12" />
                                    <rect x="90" y="60" width="20" height="10" fill="#0d0f12" />
                                    <rect x="120" y="60" width="28" height="8" fill="#0d0f12" />
                                    <rect x="134" y="74" width="14" height="20" fill="#0d0f12" />
                                    <rect x="60" y="90" width="14" height="14" fill="#0d0f12" />
                                    <rect x="80" y="84" width="20" height="8" fill="#0d0f12" />
                                    <rect x="106" y="84" width="8" height="22" fill="#0d0f12" />
                                    <rect x="60" y="112" width="20" height="8" fill="#0d0f12" />
                                    <rect x="88" y="106" width="14" height="20" fill="#0d0f12" />
                                    <rect x="110" y="114" width="24" height="8" fill="#0d0f12" />
                                    <rect x="60" y="130" width="8" height="18" fill="#0d0f12" />
                                    <rect x="74" y="126" width="28" height="8" fill="#0d0f12" />
                                    <rect x="110" y="130" width="38" height="18" fill="#0d0f12" />
                                    {/* Center Delvez Logo Badge */}
                                    <circle cx="80" cy="80" r="15" fill="#fab800" />
                                    <text x="80" y="84" fontSize="10" fontWeight="900" textAnchor="middle" fill="#0d0f12">DZ</text>
                                  </svg>
                                </div>

                                {/* Timer Pill & Verification Note */}
                                <div className={styles.qrTimerPill}>
                                  <span className={styles.pulsingGreenDot} />
                                  <span>Payment Window: <strong>⏱ {formatUpiTimer(bookUpiTimer)}</strong></span>
                                </div>
                                <p className={styles.qrAutoVerifyNotice}>
                                  Scan this QR code with any UPI app on your phone. Your payment will be auto-verified instantly.
                                </p>
                              </div>

                              {/* Manual UPI ID Input */}
                              <div className={styles.manualUpiBox}>
                                <span className={styles.orDividerText}>— OR PAY VIA UPI ID —</span>
                                <div className={styles.upiInputRow}>
                                  <input
                                    type="text"
                                    value={bookUpiId}
                                    onChange={(e) => setBookUpiId(e.target.value)}
                                    placeholder="yourname@okhdfcbank"
                                  />
                                  <button
                                    type="button"
                                    className={styles.verifyUpiBtn}
                                    onClick={() => alert(bookUpiId ? `Payment request sent to ${bookUpiId}! Please approve on your UPI app.` : 'Please enter your UPI ID.')}
                                  >
                                    Verify &amp; Pay
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {bookPaymentMethod === 'card' && (
                            <div className={styles.cardInputContainer}>
                              <div className={styles.inputFieldBlock} style={{ marginBottom: '12px' }}>
                                <label>Card Number *</label>
                                <div className={styles.phoneInputPill}>
                                  <span className={styles.phoneCode}><CreditCard size={15} /></span>
                                  <input
                                    type="text"
                                    value={bookCardNumber}
                                    onChange={(e) => setBookCardNumber(e.target.value)}
                                    placeholder="4532 •••• •••• 8921"
                                  />
                                </div>
                              </div>

                              <div className={styles.contactInputsRow} style={{ marginBottom: '12px' }}>
                                <div className={styles.inputFieldBlock}>
                                  <label>Expiry (MM/YY) *</label>
                                  <input
                                    type="text"
                                    value={bookCardExpiry}
                                    onChange={(e) => setBookCardExpiry(e.target.value)}
                                    placeholder="08/29"
                                  />
                                </div>
                                <div className={styles.inputFieldBlock}>
                                  <label>CVV / CVC *</label>
                                  <input
                                    type="password"
                                    maxLength="4"
                                    value={bookCardCvv}
                                    onChange={(e) => setBookCardCvv(e.target.value)}
                                    placeholder="•••"
                                  />
                                </div>
                              </div>

                              <div className={styles.inputFieldBlock}>
                                <label>Name on Card *</label>
                                <input
                                  type="text"
                                  value={bookCardName}
                                  onChange={(e) => setBookCardName(e.target.value)}
                                  placeholder="Remo Vivian"
                                />
                              </div>
                            </div>
                          )}

                          {bookPaymentMethod === 'netbanking' && (
                            <div className={styles.netBankingContainer}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '10px' }}>
                                Select Your Bank:
                              </label>
                              <div className={styles.bankGrid}>
                                {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((b, i) => (
                                  <label key={b} className={`${styles.bankChoiceCard} ${i === 0 ? styles.bankChoiceActive : ''}`}>
                                    <Building size={16} />
                                    <span>{b}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {bookPaymentMethod === 'wallet' && (
                            <div className={styles.walletPayContainer}>
                              <div className={styles.walletPayHeader}>
                                <Wallet size={24} style={{ color: '#fab800' }} />
                                <div>
                                  <strong>Delvez Money Wallet</strong>
                                  <p>Available Balance: <strong>₹{walletBalance.toLocaleString('en-IN')}</strong></p>
                                </div>
                              </div>
                              <p className={styles.walletPayNotice}>
                                ₹{totalEstimatedFare} will be deducted directly from your available Delvez Money wallet balance.
                              </p>
                            </div>
                          )}

                          {/* Terms Checkbox */}
                          <div className={styles.termsAgreementRow}>
                            <label className={styles.termsLabel}>
                              <input
                                type="checkbox"
                                checked={bookAgreeTerms}
                                onChange={(e) => setBookAgreeTerms(e.target.checked)}
                              />
                              <span>
                                I agree to the <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service: Standard transit insurance terms apply.') }}>Delvez Terms of Service</a> and <a href="#cancel" onClick={(e) => { e.preventDefault(); alert('Cancellation Policy: Free cancellation before rider reaches pickup point.') }}>Cancellation Policy</a>.
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Back Button */}
                      <div className={styles.step2BottomRow} style={{ marginTop: '20px' }}>
                        <button
                          type="button"
                          className={styles.plainBackBtn}
                          onClick={() => setBookStep(4)}
                        >
                          ← Back
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: BOOKING SUMMARY CARD (Persistent across all 5 steps with dynamic calculations) */}
                <div className={styles.bookRightCol}>
                  <div className={styles.bookingSummaryCard}>
                    <div className={styles.summaryHeaderRow}>
                      <h3 className={styles.summaryCardTitle}>Booking Summary</h3>
                      <span className={styles.summaryStepBadge}>Step {bookStep} of 5</span>
                    </div>

                    {/* Service Row */}
                    <div className={styles.summaryItemRow}>
                      <div className={styles.summaryItemIcon}><Package size={18} /></div>
                      <div className={styles.summaryItemText}>
                        <span className={styles.summaryItemLabel}>Service</span>
                        <strong>
                          {ALL_DASHBOARD_SERVICES.find(s => s.serviceKey === bookServiceType)?.title || 'Personal Courier'}
                        </strong>
                        <small>{bookDeliveryMode === 'standard' ? 'Standard Delivery' : 'Express Priority'}</small>
                      </div>
                      <button
                        type="button"
                        className={styles.summaryEditLink}
                        onClick={() => setBookStep(1)}
                      >
                        Edit
                      </button>
                    </div>

                    {/* Pickup Row */}
                    <div className={styles.summaryItemRow}>
                      <div className={styles.summaryItemIcon}><MapPin size={18} /></div>
                      <div className={styles.summaryItemText}>
                        <span className={styles.summaryItemLabel}>Pickup Origin</span>
                        <strong>Indiranagar, Bengaluru</strong>
                        <small>#412, 12th Main Road, Indiranagar, Bengaluru – 560038</small>
                      </div>
                      <button
                        type="button"
                        className={styles.summaryEditLink}
                        onClick={() => setBookStep(2)}
                      >
                        Edit
                      </button>
                    </div>

                    {/* Delivery Row */}
                    <div className={styles.summaryItemRow}>
                      <div className={styles.summaryItemIcon}><Navigation size={18} /></div>
                      <div className={styles.summaryItemText}>
                        <span className={styles.summaryItemLabel}>Drop Destination</span>
                        <strong>{bookDeliveryCity}, {bookDeliveryState}</strong>
                        <small>{bookDeliveryAddress} – {bookDeliveryPincode}</small>
                      </div>
                      <button
                        type="button"
                        className={styles.summaryEditLink}
                        onClick={() => setBookStep(3)}
                      >
                        Edit
                      </button>
                    </div>

                    {/* Item Details Row */}
                    <div className={styles.summaryItemRow}>
                      <div className={styles.summaryItemIcon}><Laptop size={18} /></div>
                      <div className={styles.summaryItemText}>
                        <span className={styles.summaryItemLabel}>Item Details</span>
                        <strong>{bookItemName}</strong>
                        <small>{bookItemQuantity} unit • {bookWeight} kg • {bookDimLength}×{bookDimWidth}×{bookDimHeight} {bookDimUnit}</small>
                      </div>
                      <button
                        type="button"
                        className={styles.summaryEditLink}
                        onClick={() => setBookStep(4)}
                      >
                        Edit
                      </button>
                    </div>

                    {/* Pickup Date & Time Row */}
                    <div className={styles.summaryItemRow}>
                      <div className={styles.summaryItemIcon}><Calendar size={18} /></div>
                      <div className={styles.summaryItemText}>
                        <span className={styles.summaryItemLabel}>Pickup Window</span>
                        <strong>{bookPickupDate}</strong>
                        <small>{bookPickupSlot}</small>
                      </div>
                      <button
                        type="button"
                        className={styles.summaryEditLink}
                        onClick={() => setBookStep(1)}
                      >
                        Edit
                      </button>
                    </div>

                    <div className={styles.summaryDivider} />

                    {/* Estimated Charges Breakdown (Reactive to selections) */}
                    <div className={styles.chargesSection}>
                      <div className={styles.chargesHeader}>
                        <span>Estimated Charges</span>
                        <span className={styles.infoCircle} title="Transparent pricing with zero hidden surcharges">ⓘ</span>
                      </div>

                      <div className={styles.chargeLine}>
                        <span>Base Fare ({bookDeliveryMode === 'standard' ? 'Standard' : 'Express'})</span>
                        <strong>₹ {baseFare}</strong>
                      </div>

                      <div className={styles.chargeLine}>
                        <span>Fuel &amp; Urban Handling</span>
                        <strong>₹ {fuelFare}</strong>
                      </div>

                      {addOnsTotal > 0 && (
                        <div className={styles.chargeLine}>
                          <span>Value-Added Services ({bookSelectedServices.length})</span>
                          <strong style={{ color: '#0284c7' }}>+ ₹ {addOnsTotal}</strong>
                        </div>
                      )}

                      <div className={styles.chargeLine}>
                        <span>GST (18%)</span>
                        <strong>₹ {gstFare}</strong>
                      </div>

                      <div className={styles.totalLine}>
                        <span>Total (Estimated)</span>
                        <strong className={styles.totalAmountGreen}>₹ {totalEstimatedFare}</strong>
                      </div>
                    </div>

                    {/* Stepper Progression Button */}
                    <button
                      type="button"
                      className={styles.continueToStepBtn}
                      onClick={() => {
                        if (bookStep < 5) {
                          setBookStep(prev => prev + 1)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        } else {
                          alert(`Booking Confirmed! Tracking ID: DZ${Math.floor(100000000 + Math.random() * 900000000)}. Total Amount: ₹${totalEstimatedFare}`)
                          setActiveNav('orders')
                        }
                      }}
                    >
                      <span>
                        {bookStep === 1 && 'Continue to Pickup Details →'}
                        {bookStep === 2 && 'Continue to Delivery Details →'}
                        {bookStep === 3 && 'Continue to Item Details →'}
                        {bookStep === 4 && 'Continue to Review & Pay →'}
                        {bookStep === 5 && `Pay & Confirm Booking (₹ ${totalEstimatedFare}) →`}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
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

              {/* Shipment Stat Summary Cards matching reference screenshot */}
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
                  <small>Returns</small>
                  <strong style={{ color: '#ea580c' }}>{returnsCount}</strong>
                  <span className={styles.statPillOrange}>Reverse</span>
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
                  className={`${styles.filterTab} ${orderFilter === 'RETURNS' ? styles.filterTabActive : ''}`}
                  onClick={() => setOrderFilter('RETURNS')}
                >
                  Returns ({returnsCount})
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

          {/* DEDICATED LIVE TRACKING TAB (Matching WhatsApp Screenshot reference) */}
          {activeNav === 'tracking' && (
            <section id="live-tracking" className={styles.trackingFullSection}>
              {/* Breadcrumbs */}
              <div className={styles.trackingBreadcrumbs}>
                <button
                  type="button"
                  className={styles.breadcrumbBackBtn}
                  onClick={() => setActiveNav('overview')}
                >
                  ← Home
                </button>
                <span className={styles.breadcrumbSeparator}>&gt;</span>
                <span className={styles.breadcrumbMuted}>Live Tracking</span>
                <span className={styles.breadcrumbSeparator}>&gt;</span>
                <span className={styles.breadcrumbActive}>Shipment Tracking</span>
              </div>

              {/* Title & Search Bar Row */}
              <div className={styles.trackingHeaderRow}>
                <div>
                  <h1 className={styles.trackingPageTitle}>Track Your Shipment</h1>
                  <p className={styles.trackingPageSubtitle}>Real-time updates, from pickup to delivery.</p>
                </div>
                <div className={styles.trackingSearchBox}>
                  <Search size={16} className={styles.trackingSearchIcon} />
                  <input
                    type="text"
                    placeholder="Enter Tracking ID..."
                    value={activeTrackingQuery}
                    onChange={(e) => setActiveTrackingQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && activeTrackingQuery.trim()) {
                        handleTrackShipment(activeTrackingQuery.trim())
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={styles.trackingSearchBtn}
                    onClick={() => {
                      if (activeTrackingQuery.trim()) {
                        handleTrackShipment(activeTrackingQuery.trim())
                      }
                    }}
                  >
                    Track
                  </button>
                </div>
              </div>

              {/* 2-Column Layout */}
              <div className={styles.trackingLayoutGrid}>
                {/* LEFT / MAIN COLUMN */}
                <div className={styles.trackingMainCol}>
                  {/* Interactive Route Map Card */}
                  <div className={styles.trackingMapCard}>
                    <div className={styles.trackingMapCanvas}>
                      {/* SVG Stylized Route Line */}
                      <svg className={styles.trackingSvgMap} viewBox="0 0 700 360" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="60%" stopColor="#10b981" />
                            <stop offset="85%" stopColor="#fab800" />
                            <stop offset="100%" stopColor="#fab800" />
                          </linearGradient>
                        </defs>
                        {/* Highway Network */}
                        <path d="M 40 180 Q 180 240 310 220 T 520 180 T 660 200" stroke="#e2e8f0" strokeWidth="5" fill="none" />
                        <path d="M 120 70 Q 220 150 290 270 T 450 320" stroke="#e2e8f0" strokeWidth="3" fill="none" />
                        <path d="M 270 50 L 310 220 L 390 340" stroke="#e2e8f0" strokeWidth="3" fill="none" />
                        {/* Active Shipment Track */}
                        <path
                          d="M 100 130 C 130 190, 200 230, 290 215 C 340 205, 410 235, 470 195 C 500 175, 545 165, 580 145"
                          stroke="url(#routeGradient)"
                          strokeWidth="5"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <circle cx="100" cy="130" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="3" />
                        <circle cx="290" cy="215" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="3" />
                        <circle cx="470" cy="195" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                        <circle cx="580" cy="145" r="8" fill="#fab800" stroke="#ffffff" strokeWidth="3" />
                      </svg>

                      {/* Map Location Labels & Floating Checkpoints */}
                      <div className={styles.mapCityMumbai}>Mumbai</div>
                      <div className={styles.mapBadgePickup}>
                        <div className={styles.mapBadgeCheck}><Check size={13} /></div>
                        <div>
                          <div className={styles.mapBadgeTitle}>Pickup Completed</div>
                          <div className={styles.mapBadgeMeta}>20 Aug, 10:15 AM</div>
                          <div className={styles.mapBadgeLoc}>Andheri, Mumbai</div>
                        </div>
                      </div>

                      <div className={styles.mapTagNh48}>NH48</div>
                      <div className={styles.mapTagNh65}>NH65</div>
                      <div className={styles.mapTagNh45}>NH45</div>
                      <div className={styles.mapCityPune}>Pune</div>
                      <div className={styles.mapCityHyderabad}>Hyderabad</div>

                      {/* Moving Van Marker */}
                      <div className={styles.mapVanMarker}>
                        <span className={styles.vanPill}>🚚 DELVEZ</span>
                      </div>

                      {/* Bengaluru Hub Checkpoint */}
                      <div className={styles.mapBadgeHub}>
                        <div className={styles.mapBadgeHubIcon}><PackageCheck size={12} /></div>
                        <div>
                          <div className={styles.mapBadgeTitle}>Bengaluru Hub</div>
                          <div className={styles.mapBadgeMeta}>Arrived • 21 Aug, 10:05 AM</div>
                        </div>
                      </div>

                      <div className={styles.mapCityBengaluru}>Bengaluru</div>

                      {/* Destination Out for Delivery Marker */}
                      <div className={styles.mapBadgeOut}>
                        <div className={styles.mapBadgePin}><MapPin size={13} /></div>
                        <div>
                          <div className={styles.mapBadgeTitle}>Out for Delivery</div>
                          <div className={styles.mapBadgeMeta}>21 Aug, 02:15 PM</div>
                          <div className={styles.mapBadgeLoc}>Bengaluru</div>
                        </div>
                      </div>

                      {/* Map Controls */}
                      <div className={styles.mapZoomControls}>
                        <button type="button" className={styles.mapZoomBtn}>+</button>
                        <button type="button" className={styles.mapZoomBtn}>−</button>
                      </div>

                      {/* Google Maps Button */}
                      <button
                        type="button"
                        className={styles.mapGmapsBtn}
                        onClick={() => window.open('https://maps.google.com/?q=Bengaluru', '_blank')}
                      >
                        <Navigation size={13} />
                        <span>View on Google Maps</span>
                      </button>
                    </div>
                  </div>

                  {/* Shipment Details Bar Card */}
                  <div className={styles.trackingDetailsCard}>
                    {/* Col 1: Shipment ID */}
                    <div className={styles.trackingDetailCol}>
                      <div className={styles.trackingColIcon}><Package size={18} /></div>
                      <div>
                        <div className={styles.trackingIdRow}>
                          <strong>{activeTrackingQuery || 'RTPD12873421'}</strong>
                          <button
                            type="button"
                            className={styles.copyIdBtn}
                            onClick={() => handleCopyTrackingId(activeTrackingQuery || 'RTPD12873421')}
                            title="Copy Shipment ID"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                        <span className={styles.trackingColLabel}>
                          {copiedTracking ? '✓ Copied!' : 'Shipment ID'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.trackingDivider} />

                    {/* Col 2: Item Details */}
                    <div className={styles.trackingDetailCol}>
                      <div className={styles.trackingColIcon}><Laptop size={18} /></div>
                      <div>
                        <strong>Laptop</strong>
                        <div className={styles.trackingColSub}>Dell Inspiron 15</div>
                        <span className={styles.trackingColLabel}>1 pc | 2.5 kg</span>
                      </div>
                    </div>

                    <div className={styles.trackingDivider} />

                    {/* Col 3: Recipient */}
                    <div className={styles.trackingDetailCol}>
                      <div className={styles.trackingColIcon}><User size={18} /></div>
                      <div>
                        <strong>Rakesh Kumar</strong>
                        <div className={styles.trackingColSub}>+91 98765 43210</div>
                      </div>
                    </div>

                    <div className={styles.trackingDivider} />

                    {/* Col 4: Destination */}
                    <div className={styles.trackingDetailCol}>
                      <div className={styles.trackingColIcon}><MapPin size={18} /></div>
                      <div>
                        <strong>Delvez Returns Center</strong>
                        <div className={styles.trackingColSub}>Bengaluru – 560100</div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Status Metric Cards Row */}
                  <div className={styles.trackingMetricCardsRow}>
                    <div className={styles.trackingMetricCard}>
                      <span className={styles.metricCardLabel}>Estimated Delivery</span>
                      <div className={styles.metricCardContent}>
                        <div className={styles.metricIconWrap}><Calendar size={18} /></div>
                        <div>
                          <strong>Today, 21 Aug 2026</strong>
                          <p>by 6:00 PM</p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.trackingMetricCard}>
                      <span className={styles.metricCardLabel}>Delivery Partner</span>
                      <div className={styles.metricCardContent}>
                        <div className={styles.driverAvatar}>
                          <span>SN</span>
                        </div>
                        <div className={styles.driverInfo}>
                          <strong>Suresh N</strong>
                          <span className={styles.driverRating}>★ 4.8 (620 deliveries)</span>
                        </div>
                        <div className={styles.driverActionButtons}>
                          <button
                            type="button"
                            className={styles.driverIconBtn}
                            onClick={() => setContactCourierModal(true)}
                            title="Call Partner"
                          >
                            <Phone size={14} />
                          </button>
                          <button
                            type="button"
                            className={styles.driverIconBtn}
                            onClick={() => setChatCourierModal(true)}
                            title="Chat with Partner"
                          >
                            <MessageSquare size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className={styles.trackingMetricCard}>
                      <span className={styles.metricCardLabel}>Service Type</span>
                      <div className={styles.metricCardContent}>
                        <div className={styles.metricIconWrap}><Package size={18} /></div>
                        <div>
                          <strong>Standard Courier</strong>
                          <p>Doorstep Delivery</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sustainable Future Leaf Banner */}
                  <div className={styles.trackingEcoBanner}>
                    <div className={styles.ecoBannerLeft}>
                      <div className={styles.ecoBannerIcon}>🌿</div>
                      <div>
                        <strong>Tracking a sustainable future.</strong>
                        <p>This shipment is part of our effort to reduce carbon emissions.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.ecoBannerLink}
                      onClick={() => navigateTo('/#services')}
                    >
                      Learn More →
                    </button>
                  </div>
                </div>

                {/* RIGHT SIDEBAR COLUMN */}
                <div className={styles.trackingSideCol}>
                  {/* Out for Delivery Mint Badge Card */}
                  <div className={styles.statusOutCard}>
                    <div className={styles.statusOutHeader}>
                      <div className={styles.statusOutIconWrap}><Truck size={20} /></div>
                      <div>
                        <span className={styles.statusOutBadge}>Out for Delivery</span>
                        <p className={styles.statusOutDesc}>Your shipment is on the way and will be delivered today.</p>
                      </div>
                    </div>
                    <div className={styles.statusOutEta}>
                      <span className={styles.etaTitle}>Estimated Delivery</span>
                      <strong className={styles.etaValue}>Today by 6:00 PM</strong>
                    </div>
                  </div>

                  {/* Shipment Timeline */}
                  <div className={styles.timelineCard}>
                    <div className={styles.timelineHeader}>
                      <h3>Shipment Timeline</h3>
                      <button
                        type="button"
                        className={styles.timelineLink}
                        onClick={() => alert('All tracking checkpoints are up to date.')}
                      >
                        View All Updates →
                      </button>
                    </div>

                    <div className={styles.timelineFlow}>
                      <div className={`${styles.timelineStep} ${styles.timelineStepDone}`}>
                        <div className={styles.timelineStepIcon}><Check size={12} /></div>
                        <div className={styles.timelineStepBody}>
                          <div className={styles.timelineStepTop}>
                            <strong>Pickup Completed</strong>
                            <span className={styles.timelineStepTime}>1:15 PM</span>
                          </div>
                          <p className={styles.timelineStepDate}>20 Aug 2026, 10:15 AM</p>
                          <span className={styles.timelineStepLoc}>Andheri, Mumbai</span>
                        </div>
                      </div>

                      <div className={`${styles.timelineStep} ${styles.timelineStepDone}`}>
                        <div className={styles.timelineStepIcon}><Check size={12} /></div>
                        <div className={styles.timelineStepBody}>
                          <div className={styles.timelineStepTop}>
                            <strong>In Transit</strong>
                            <span className={styles.timelineStepTime}>8:25 PM</span>
                          </div>
                          <p className={styles.timelineStepDate}>20 Aug 2026, 06:40 PM</p>
                          <span className={styles.timelineStepLoc}>Departed Mumbai Sort Center</span>
                        </div>
                      </div>

                      <div className={`${styles.timelineStep} ${styles.timelineStepDone}`}>
                        <div className={styles.timelineStepIcon}><Check size={12} /></div>
                        <div className={styles.timelineStepBody}>
                          <div className={styles.timelineStepTop}>
                            <strong>Arrived at Hub</strong>
                            <span className={styles.timelineStepTime}>10:05 AM</span>
                          </div>
                          <p className={styles.timelineStepDate}>21 Aug 2026, 10:05 AM</p>
                          <span className={styles.timelineStepLoc}>Bengaluru Hub</span>
                        </div>
                      </div>

                      <div className={`${styles.timelineStep} ${styles.timelineStepActive}`}>
                        <div className={styles.timelineStepIconActive}><span className={styles.pulsingDot} /></div>
                        <div className={styles.timelineStepBody}>
                          <div className={styles.timelineStepTop}>
                            <strong>Out for Delivery</strong>
                            <span className={styles.timelineStepTime}>2:15 PM</span>
                          </div>
                          <p className={styles.timelineStepDate}>21 Aug 2026, 02:15 PM</p>
                          <span className={styles.timelineStepLoc}>Bengaluru</span>
                        </div>
                      </div>

                      <div className={`${styles.timelineStep} ${styles.timelineStepPending}`}>
                        <div className={styles.timelineStepIconPending} />
                        <div className={styles.timelineStepBody}>
                          <div className={styles.timelineStepTop}>
                            <strong>Delivered</strong>
                          </div>
                          <p className={styles.timelineStepDate}>Expected by 21 Aug 2026, 6:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Need Help Card */}
                  <div className={styles.trackingHelpCard}>
                    <h3>Need Help?</h3>
                    <div className={styles.helpItemsList}>
                      <a href="tel:+9118001234567" className={styles.helpItem}>
                        <div className={styles.helpItemLeft}>
                          <Phone size={15} />
                          <span>Call Support</span>
                        </div>
                        <div className={styles.helpItemRight}>
                          <span>+91 1800 123 4567</span>
                          <ChevronRight size={14} />
                        </div>
                      </a>

                      <button type="button" className={styles.helpItem} onClick={() => setChatCourierModal(true)}>
                        <div className={styles.helpItemLeft}>
                          <MessageSquare size={15} />
                          <span>Chat with Us</span>
                        </div>
                        <div className={styles.helpItemRight}>
                          <span>Get instant help</span>
                          <ChevronRight size={14} />
                        </div>
                      </button>

                      <a href="mailto:support@delvez.com" className={styles.helpItem}>
                        <div className={styles.helpItemLeft}>
                          <Mail size={15} />
                          <span>Email Us</span>
                        </div>
                        <div className={styles.helpItemRight}>
                          <span>support@delvez.com</span>
                          <ChevronRight size={14} />
                        </div>
                      </a>

                      <button type="button" className={styles.helpItem} onClick={() => navigateTo('/faq')}>
                        <div className={styles.helpItemLeft}>
                          <FileText size={15} />
                          <span>FAQs</span>
                        </div>
                        <div className={styles.helpItemRight}>
                          <span>View all FAQs</span>
                          <ChevronRight size={14} />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Dark Promo Banner Card */}
                  <div className={styles.trackingPromoBanner}>
                    <h3>Every Delivery Builds a Better Tomorrow.</h3>
                    <p>Sustainable logistics. For a cleaner, greener India.</p>
                    <button
                      type="button"
                      className={styles.trackingPromoBtn}
                      onClick={() => navigateTo('/#services')}
                    >
                      Know More →
                    </button>
                  </div>
                </div>
              </div>
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
                  {ALL_DASHBOARD_SERVICES.length} Specialized Services
                </span>
              </div>

              {/* Service Category Filter Tabs */}
              <div className={styles.catalogFilterTabsRow}>
                {[
                  { id: 'all', label: 'All Services', count: ALL_DASHBOARD_SERVICES.length },
                  { id: 'express', label: 'Express & Local', count: 4 },
                  { id: 'vault', label: 'Secured & Vault', count: 1 },
                  { id: 'luggage', label: 'Airport & Travel', count: 1 },
                  { id: 'returns', label: 'Returns & Reverse', count: 1 },
                  { id: 'special', label: 'Specialty Delivery', count: 1 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`${styles.catalogFilterTab} ${servicesFilterTab === tab.id ? styles.catalogFilterTabActive : ''}`}
                    onClick={() => setServicesFilterTab(tab.id)}
                  >
                    <span>{tab.label}</span>
                    <span className={styles.filterTabCountBadge}>{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* Rich Services Grid */}
              <div className={styles.serviceCatalogGrid}>
                {ALL_DASHBOARD_SERVICES.filter(
                  (s) => servicesFilterTab === 'all' || s.category === servicesFilterTab
                ).map((srv) => {
                  const IconComp = srv.icon || Package
                  return (
                    <article key={srv.id} className={styles.serviceRichCard}>
                      <div className={styles.serviceRichThumb}>
                        <img src={srv.image} alt={srv.title} />
                        <div className={styles.serviceRichThumbOverlay} />
                        <span className={styles.serviceRichBadge} style={{ background: srv.badgeColor }}>
                          {srv.tag}
                        </span>
                        <span className={styles.serviceRichPricePill}>{srv.price}</span>
                      </div>

                      <div className={styles.serviceRichBody}>
                        <div className={styles.serviceRichTitleRow}>
                          <div className={styles.serviceRichIconCircle} style={{ color: srv.badgeColor }}>
                            <IconComp size={20} />
                          </div>
                          <div>
                            <h3>{srv.title}</h3>
                            <span className={styles.serviceCategoryLabel}>Category: {srv.category.toUpperCase()}</span>
                          </div>
                        </div>

                        <p className={styles.serviceRichDesc}>{srv.description}</p>

                        <div className={styles.serviceFeaturesBox}>
                          <span className={styles.featuresHeading}>Service Highlights:</span>
                          <ul className={styles.featuresList}>
                            {srv.features.map((feat, idx) => (
                              <li key={idx}>
                                <Check size={13} className={styles.featureCheckIcon} />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className={styles.serviceCardActionRow}>
                          <button
                            type="button"
                            className={styles.serviceBookPrimaryBtn}
                            onClick={() => {
                              setBookServiceType(srv.serviceKey)
                              setActiveNav('book')
                              setBookStep(1)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                          >
                            <span>Book Service</span>
                            <ArrowRight size={15} />
                          </button>
                          <button
                            type="button"
                            className={styles.serviceDetailsSecondaryBtn}
                            onClick={() => navigateTo(srv.route)}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </article>
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
